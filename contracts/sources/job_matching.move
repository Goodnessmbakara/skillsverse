module skillsverse::job_matching {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use sui::vector;
    
    // Error codes
    const ENotAuthorized: u64 = 0;
    const EInvalidInput: u64 = 1;
    const EDuplicateMatch: u64 = 2;
    const EInvalidConfidenceScore: u64 = 3;
    
    // Events
    /// Emitted when a new job reference is created
    struct JobReferenceCreated has copy, drop {
        job_id: ID,
        job_hash: vector<u8>,
        employer_address: address
    }
    
    /// Emitted when an AI match is recorded
    struct MatchFound has copy, drop {
        match_id: ID,
        user_address: address,
        job_id: ID,
        confidence_score: u64
    }
    
    /// Administrator capability for restricting sensitive operations
    struct AdminCap has key, store {
        id: UID
    }
    
    /// Represents a job reference stored on-chain with IPFS metadata
    struct JobReference has key {
        id: UID,
        job_hash: vector<u8>,
        employer_address: address
    }
    
    /// Represents an AI-generated match between a user and job
    struct Match has key, store {
        id: UID,
        user_address: address,
        job_id: ID,
        confidence_score: u64
    }
    
    /// One-Time Witness for package initialization
    struct JOB_MATCHING has drop {}
    
    /// Initializes the Job Matching system
    fun init(witness: JOB_MATCHING, ctx: &mut TxContext) {
        // Create admin capability for the deployer
        let admin_cap = AdminCap {
            id: object::new(ctx)
        };
        
        // Transfer admin capability to transaction sender
        transfer::transfer(admin_cap, tx_context::sender(ctx));
    }
    
    /// Creates a new job reference (admin only)
    public entry fun create_job_reference(
        _admin_cap: &AdminCap,
        job_hash: vector<u8>,
        employer_address: address,
        ctx: &mut TxContext
    ) {
        // Validate inputs
        assert!(vector::length(&job_hash) > 0, EInvalidInput);
        
        // Create job reference
        let job_ref = JobReference {
            id: object::new(ctx),
            job_hash,
            employer_address
        };
        
        // Get job ID for event emission
        let job_id = object::uid_to_inner(&job_ref.id);
        
        // Emit event for frontend notification
        event::emit(JobReferenceCreated {
            job_id,
            job_hash,
            employer_address
        });
        
        // Share job reference as a shared object for global access
        transfer::share_object(job_ref);
    }
    
    /// Logs an AI-generated match (admin only)
    public entry fun log_match(
        _admin_cap: &AdminCap,
        user_address: address,
        job_ref: &JobReference,
        confidence_score: u64,
        ctx: &mut TxContext
    ) {
        // Validate confidence score (0-100 range)
        assert!(confidence_score <= 100, EInvalidConfidenceScore);
        
        // Create match object with reference to job
        let match_obj = Match {
            id: object::new(ctx),
            user_address,
            job_id: object::uid_to_inner(&job_ref.id),
            confidence_score
        };
        
        // Get match ID for event emission
        let match_id = object::uid_to_inner(&match_obj.id);
        
        // Emit event for frontend notification
        event::emit(MatchFound {
            match_id,
            user_address,
            job_id: object::uid_to_inner(&job_ref.id),
            confidence_score
        });
        
        // Transfer match object to the matched user
        transfer::transfer(match_obj, user_address);
    }
    
    // Public accessor functions for external queries
    
    /// Returns the IPFS hash containing job details
    public fun get_job_hash(job_ref: &JobReference): vector<u8> {
        job_ref.job_hash
    }
    
    /// Returns the employer address of a job
    public fun get_employer_address(job_ref: &JobReference): address {
        job_ref.employer_address
    }
    
    /// Returns the user address in a match
    public fun get_user_address(match: &Match): address {
        match.user_address
    }
    
    /// Returns the job ID in a match
    public fun get_job_id(match: &Match): ID {
        match.job_id
    }
    
    /// Returns the confidence score in a match
    public fun get_confidence_score(match: &Match): u64 {
        match.confidence_score
    }
    
    #[test_only]
    /// Initialize function accessible in tests
    public fun test_init(ctx: &mut TxContext) {
        init(JOB_MATCHING {}, ctx)
    }
}