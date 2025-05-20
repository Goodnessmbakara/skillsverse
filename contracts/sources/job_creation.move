module skillsverse::job_creation {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use sui::dynamic_field as df;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::clock::{Self, Clock};
    use sui::vec_map::{Self, VecMap};
    use sui::vec_set::{Self, VecSet};
    use sui::vector;
    
    use skillsverse::mint_validated_credentials::{Self as mvc, NFTCredential};
    
    // Error codes
    const EInsufficientPayment: u64 = 0;
    const EInvalidInput: u64 = 1;
    const EDuplicateApplication: u64 = 2;
    const EMissingSkills: u64 = 3;
    const EJobNotFound: u64 = 4;
    const EJobNotOpen: u64 = 5;
    const ENotAdmin: u64 = 6;
    
    // Job status enum (represented as u8)
    const JOB_STATUS_OPEN: u8 = 0;
    const JOB_STATUS_IN_PROGRESS: u8 = 1;
    const JOB_STATUS_COMPLETED: u8 = 2;
    const JOB_STATUS_DISPUTED: u8 = 3;
    
    // Minimum payment amount in MIST (100 MIST)
    const MIN_PAYMENT_AMOUNT: u64 = 100;
    
    // Events
    /// Emitted when a new job is posted
    struct JobPosted has copy, drop {
        job_id: ID,
        employer_address: address,
        description_hash: vector<u8>,
        payment_amount: u64,
        required_skills: vector<ID>
    }
    
    /// Emitted when a freelancer applies for a job
    struct JobApplied has copy, drop {
        job_id: ID,
        applicant_address: address
    }
    
    /// Administrator capability for restricted operations
    struct AdminCap has key, store {
        id: UID
    }
    
    /// Represents a milestone in a job
    struct Milestone has store, copy, drop {
        description_hash: vector<u8>,
        status: u8, // 0: pending, 1: completed, 2: disputed
        payment_percentage: u64 // Percentage of total payment (e.g., 25 for 25%)
    }
    
    /// Represents a job posting with its details
    struct Job has key {
        id: UID,
        employer_address: address,
        description_hash: vector<u8>,
        payment_amount: u64,
        required_skills: vector<ID>, // IDs of required NFTCredentials
        milestones: vector<Milestone>,
        applicants: VecSet<address>,
        selected_freelancer: option::Option<address>,
        status: u8
    }
    
    /// Holds job funds in escrow
    struct JobEscrow has key {
        id: UID,
        job_id: ID,
        amount: Coin<SUI>,
        release_time: u64 // Timestamp for fund release
    }
    
    /// Represents a dispute over a milestone
    struct Dispute has key {
        id: UID,
        job_id: ID,
        milestone_index: u64,
        evidence_url: vector<u8>,
        disputer_address: address,
        voting_end_time: u64, // Timestamp for end of voting period
        freelancer_votes: u64,
        employer_votes: u64
    }
    
    /// Represents a vote on a dispute
    struct Vote has store {
        voter_address: address,
        vote: bool // true for supporting freelancer, false for employer
    }
    
    /// One-Time Witness for package initialization
    struct JOB_CREATION has drop {}
    
    /// Initializes the Job Creation system with an admin capability
    fun init(witness: JOB_CREATION, ctx: &mut TxContext) {
        // Create admin capability for the deployer
        let admin_cap = AdminCap {
            id: object::new(ctx),
        };
        
        // Transfer admin capability to transaction sender
        transfer::transfer(admin_cap, tx_context::sender(ctx));
    }
    
    /// Creates a new job posting with payment in escrow
    public entry fun create_job(
        description_hash: vector<u8>,
        required_skills: vector<ID>,
        milestone_descriptions: vector<vector<u8>>,
        milestone_payments: vector<u64>,
        payment: Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Validate inputs
        assert!(vector::length(&description_hash) > 0, EInvalidInput);
        assert!(vector::length(&required_skills) > 0, EInvalidInput);
        assert!(vector::length(&milestone_descriptions) > 0, EInvalidInput);
        assert!(vector::length(&milestone_descriptions) == vector::length(&milestone_payments), EInvalidInput);
        
        // Verify payment amount meets minimum requirement
        let payment_amount = coin::value(&payment);
        assert!(payment_amount >= MIN_PAYMENT_AMOUNT, EInsufficientPayment);
        
        // Verify milestone payment percentages add up to 100
        let total_percentage = 0;
        let i = 0;
        let milestone_count = vector::length(&milestone_payments);
        while (i < milestone_count) {
            let percentage = *vector::borrow(&milestone_payments, i);
            total_percentage = total_percentage + percentage;
            i = i + 1;
        };
        assert!(total_percentage == 100, EInvalidInput);
        
        // Create milestone vector
        let milestones = vector::empty<Milestone>();
        i = 0;
        while (i < milestone_count) {
            let description = *vector::borrow(&milestone_descriptions, i);
            let payment_percentage = *vector::borrow(&milestone_payments, i);
            
            vector::push_back(&mut milestones, Milestone {
                description_hash: description,
                status: 0, // pending
                payment_percentage
            });
            
            i = i + 1;
        };
        
        // Create job object
        let job = Job {
            id: object::new(ctx),
            employer_address: tx_context::sender(ctx),
            description_hash,
            payment_amount,
            required_skills,
            milestones,
            applicants: vec_set::empty(),
            selected_freelancer: option::none(),
            status: JOB_STATUS_OPEN
        };
        
        let job_id = object::id(&job);
        
        // Create escrow object
        let escrow = JobEscrow {
            id: object::new(ctx),
            job_id,
            amount: payment,
            release_time: 0 // Will be set when freelancer is selected
        };
        
        // Emit job posted event
        event::emit(JobPosted {
            job_id,
            employer_address: job.employer_address,
            description_hash: job.description_hash,
            payment_amount: job.payment_amount,
            required_skills: job.required_skills
        });
        
        // Share job and escrow as shared objects
        transfer::share_object(job);
        transfer::share_object(escrow);
    }
    
    /// Apply for a job with verified skills
    public entry fun apply_for_job(
        job: &mut Job,
        credentials: vector<&NFTCredential>,
        ctx: &mut TxContext
    ) {
        // Validate job status
        assert!(job.status == JOB_STATUS_OPEN, EJobNotOpen);
        
        // Check that applicant hasn't already applied
        let applicant = tx_context::sender(ctx);
        assert!(!vec_set::contains(&job.applicants, &applicant), EDuplicateApplication);
        
        // Verify that the applicant has all required skills
        verify_skills(job, &credentials, ctx);
        
        // Add applicant to the job
        vec_set::insert(&mut job.applicants, applicant);
        
        // Emit job applied event
        event::emit(JobApplied {
            job_id: object::id(job),
            applicant_address: applicant
        });
    }
    
    /// Verifies that the applicant has all required skills
    fun verify_skills(
        job: &Job, 
        credentials: &vector<&NFTCredential>,
        ctx: &TxContext
    ) {
        let applicant = tx_context::sender(ctx);
        
        // Create set of credential IDs that the applicant owns
        let applicant_skill_ids = vec_set::empty<ID>();
        let i = 0;
        let credential_count = vector::length(credentials);
        
        while (i < credential_count) {
            let credential = vector::borrow(credentials, i);
            
            // Verify that the credential belongs to the applicant
            assert!(mvc::get_owner_address(credential) == applicant, EInvalidInput);
            
            // Verify that the credential is actually verified
            assert!(mvc::is_credential_verified(credential), EInvalidInput);
            
            // Add the credential ID to the set
            let credential_id = mvc::get_credential_id(credential);
            vec_set::insert(&mut applicant_skill_ids, credential_id);
            
            i = i + 1;
        };
        
        // Check that all required skills are met
        i = 0;
        let required_skills_count = vector::length(&job.required_skills);
        
        while (i < required_skills_count) {
            let required_skill = vector::borrow(&job.required_skills, i);
            assert!(vec_set::contains(&applicant_skill_ids, required_skill), EMissingSkills);
            i = i + 1;
        };
    }
    
    // Public accessor functions
    
    /// Returns the employer address of a job
    public fun get_employer_address(job: &Job): address {
        job.employer_address
    }
    
    /// Returns the description hash of a job
    public fun get_description_hash(job: &Job): vector<u8> {
        job.description_hash
    }
    
    /// Returns the payment amount of a job
    public fun get_payment_amount(job: &Job): u64 {
        job.payment_amount
    }
    
    /// Returns the status of a job
    public fun get_status(job: &Job): u8 {
        job.status
    }
    
    /// Returns the milestones of a job
    public fun get_milestones(job: &Job): vector<Milestone> {
        job.milestones
    }
    
    /// Returns whether an address is an applicant for a job
    public fun is_applicant(job: &Job, applicant: address): bool {
        vec_set::contains(&job.applicants, &applicant)
    }
    
    /// Returns the selected freelancer for a job if any
    public fun get_selected_freelancer(job: &Job): option::Option<address> {
        job.selected_freelancer
    }
    
    /// Returns the escrow amount
    public fun get_escrow_amount(escrow: &JobEscrow): u64 {
        coin::value(&escrow.amount)
    }
    
    #[test_only]
    /// Initialize function accessible in tests
    public fun test_init(ctx: &mut TxContext) {
        init(JOB_CREATION {}, ctx)
    }
}