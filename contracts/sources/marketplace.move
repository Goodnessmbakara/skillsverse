module marketplace::marketplace {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::sui::SUI;
    use sui::url;
    use sui::vec_map::{Self, VecMap};
    use sui::event;
    use sui::clock::{Self, Clock};
    use std::option::{Self, Option};
    use std::vector;
    use skillsverse::types::{Self, Job, JobEscrow, Profile, Milestone};
    use skillsverse::errors;
    use skillsverse::credential_minting;
    use skillsverse::credential_validation;
    use skillsverse::job_matching;

    // Constants
    const DISPUTE_CHALLENGE_PERIOD: u64 = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

    // Structs
    struct AdminCap has key { id: UID }

    // Events
    struct JobPosted has copy, drop {
        job_id: ID,
        employer: address,
        title: vector<u8>,
        payment: u64,
    }

    struct JobApplied has copy, drop {
        job_id: ID,
        freelancer: address,
    }

    struct FreelancerAccepted has copy, drop {
        job_id: ID,
        freelancer: address,
    }

    struct MilestoneCompleted has copy, drop {
        job_id: ID,
        milestone_idx: u64,
        completion_timestamp: u64,
    }

    struct DisputeInitiated has copy, drop {
        job_id: ID,
        initiator: address,
    }

    struct JobCompleted has copy, drop {
        job_id: ID,
        freelancer: address,
        nft_id: ID,
    }

    // Initialization
    fun init(ctx: &mut TxContext) {
        transfer::transfer(AdminCap { id: object::new(ctx) }, tx_context::sender(ctx));
    }

    // Core Functions

    /// Creates and posts a new job with escrow
    public entry fun post_job(
        title: vector<u8>,
        description_url: vector<u8>,
        required_skills_keys: vector<vector<u8>>,
        required_skills_values: vector<u64>,
        payment_coin: Coin<SUI>,
        milestone_descriptions: vector<vector<u8>>,
        milestone_amounts: vector<u64>,
        ctx: &mut TxContext
    ) {
        let payment = coin::into_balance(payment_coin);
        let required_skills = vec_map::empty();
        let i = 0;
        while (i < vector::length(&required_skills_keys)) {
            vec_map::insert(&mut required_skills, *vector::borrow(&required_skills_keys, i), *vector::borrow(&required_skills_values, i));
            i = i + 1;
        };

        let milestones = vector::empty();
        let j = 0;
        while (j < vector::length(&milestone_descriptions)) {
            vector::push_back(&mut milestones, types::new_milestone(
                *vector::borrow(&milestone_descriptions, j),
                *vector::borrow(&milestone_amounts, j)
            ));
            j = j + 1;
        };

        let escrow = types::new_job_escrow(payment, milestones, ctx);
        let job = types::new_job(
            tx_context::sender(ctx),
            title,
            url::new_unsafe_from_bytes(description_url),
            required_skills,
            types::get_escrow_id(&escrow),
            ctx
        );

        types::set_job_id(&mut escrow, types::get_job_id(&job));

        event::emit(JobPosted {
            job_id: types::get_job_id(&job),
            employer: types::get_employer(&job),
            title,
            payment: types::get_payment_value(&escrow),
        });

        transfer::public_transfer(job, tx_context::sender(ctx));
        transfer::public_transfer(escrow, tx_context::sender(ctx));
    }

    /// Allows a freelancer to apply for a job if their skills match
    public entry fun apply_for_job(
        job: &mut Job,
        profile: &Profile,
        ctx: &mut TxContext
    ) {
        let applicant = tx_context::sender(ctx);
        assert!(!vector::contains(&types::get_applicants(job), &applicant), errors::e_already_applied());
        let required_skills = types::get_required_skills(job);
        let profile_skills = types::get_skills(profile);
        let i = 0;
        while (i < vec_map::size(&required_skills)) {
            let (skill, level) = vec_map::get_entry_by_idx(&required_skills, i);
            assert!(vec_map::contains(&profile_skills, skill) && *vec_map::get(&profile_skills, skill) >= *level, errors::e_skill_mismatch());
            i = i + 1;
        };
        types::add_applicant(job, applicant);

        event::emit(JobApplied {
            job_id: types::get_job_id(job),
            freelancer: applicant,
        });
    }

    /// Employer accepts a freelancer for the job
    public entry fun accept_freelancer(
        job: &mut Job,
        freelancer: address,
        ctx: &mut TxContext
    ) {
        assert!(types::get_employer(job) == tx_context::sender(ctx), errors::e_not_authorized());
        assert!(option::is_none(&types::get_freelancer(job)), errors::e_freelancer_already_set());
        assert!(vector::contains(&types::get_applicants(job), &freelancer), errors::e_invalid_freelancer());
        types::set_freelancer(job, freelancer);

        event::emit(FreelancerAccepted {
            job_id: types::get_job_id(job),
            freelancer,
        });
    }

    /// Freelancer marks a milestone as complete
    public entry fun complete_milestone(
        job: &mut Job,
        escrow: &mut JobEscrow,
        milestone_idx: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let freelancer = tx_context::sender(ctx);
        assert!(option::contains(&types::get_freelancer(job), &freelancer), errors::e_not_authorized());
        assert!(types::get_job_id(job) == types::get_job_id(escrow), errors::e_invalid_escrow());
        let milestones = types::get_milestones_mut(escrow);
        assert!(milestone_idx < vector::length(milestones), errors::e_invalid_milestone());
        let milestone = vector::borrow_mut(milestones, milestone_idx);
        assert!(!types::is_milestone_completed(milestone), errors::e_milestone_already_completed());
        types::set_milestone_completed(milestone, clock::timestamp_ms(clock));

        event::emit(MilestoneCompleted {
            job_id: types::get_job_id(job),
            milestone_idx,
            completion_timestamp: clock::timestamp_ms(clock),
        });
    }

    /// Either party initiates a dispute within the challenge period
    public entry fun initiate_dispute(
        job: &Job,
        escrow: &mut JobEscrow,
        milestone_idx: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(sender == types::get_employer(job) || option::contains(&types::get_freelancer(job), &sender), errors::e_not_authorized());
        assert!(types::get_job_id(job) == types::get_job_id(escrow), errors::e_invalid_escrow());
        let milestones = types::get_milestones(escrow);
        assert!(milestone_idx < vector::length(milestones), errors::e_invalid_milestone());
        let milestone = vector::borrow(milestones, milestone_idx);
        assert!(types::is_milestone_completed(milestone), errors::e_milestone_not_completed());
        let completion_time = types::get_milestone_completion_time(milestone);
        assert!(clock::timestamp_ms(clock) < completion_time + DISPUTE_CHALLENGE_PERIOD, errors::e_dispute_period_expired());
        types::set_dispute(escrow, milestone_idx);

        event::emit(DisputeInitiated {
            job_id: types::get_job_id(job),
            initiator: sender,
        });
    }

    /// Admin resolves a dispute (can be expanded to community voting)
    public entry fun resolve_dispute(
        _admin: &AdminCap,
        job: &Job,
        escrow: &mut JobEscrow,
        milestone_idx: u64,
        approve_freelancer: bool,
        ctx: &mut TxContext
    ) {
        assert!(types::get_job_id(job) == types::get_job_id(escrow), errors::e_invalid_escrow());
        let milestones = types::get_milestones(escrow);
        assert!(milestone_idx < vector::length(milestones), errors::e_invalid_milestone());
        assert!(types::is_disputed(escrow, milestone_idx), errors::e_no_dispute());
        let amount = types::get_milestone_amount(vector::borrow(milestones, milestone_idx));
        let payment = types::get_payment_mut(escrow);
        let resolved_amount = balance::split(payment, amount);
        if (approve_freelancer) {
            transfer::public_transfer(coin::from_balance(resolved_amount, ctx), *option::borrow(&types::get_freelancer(job)))
        } else {
            transfer::public_transfer(coin::from_balance(resolved_amount, ctx), types::get_employer(job))
        };
        types::clear_dispute(escrow, milestone_idx);
    }

    /// Finalize job and mint completion NFT
    public entry fun complete_job(
        job: &mut Job,
        escrow: &mut JobEscrow,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let employer = tx_context::sender(ctx);
        assert!(employer == types::get_employer(job), errors::e_not_authorized());
        assert!(types::get_job_id(job) == types::get_job_id(escrow), errors::e_invalid_escrow());
        let milestones = types::get_milestones(escrow);
        let i = 0;
        while (i < vector::length(milestones)) {
            let milestone = vector::borrow(milestones, i);
            assert!(types::is_milestone_completed(milestone), errors::e_milestone_not_completed());
            assert!(clock::timestamp_ms(clock) >= types::get_milestone_completion_time(milestone) + DISPUTE_CHALLENGE_PERIOD, errors::e_dispute_period_active());
            i = i + 1;
        };

        let freelancer = *option::borrow(&types::get_freelancer(job));
        let remaining_payment = balance::withdraw_all(types::get_payment_mut(escrow));
        transfer::public_transfer(coin::from_balance(remaining_payment, ctx), freelancer);

        let nft = credential_minting::mint_nft(
            b"Job Completion NFT",
            b"Proof of job completion on SkillsVerse",
            url::new_unsafe_from_bytes(b"https://skillsverse.example.com/nft/job_completion"),
            ctx
        );
        transfer::public_transfer(nft, freelancer);

        event::emit(JobCompleted {
            job_id: types::get_job_id(job),
            freelancer,
            nft_id: object::id(&nft),
        });
    }
}