// Targeting Sui 1.43.1
module skillsverse::marketplace {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::coin::{Self, Coin, Balance};
    use sui::sui::SUI;
    use sui::tx_context::{Self, TxContext};
    use sui::vec_map::{Self, VecMap};
    use sui::option::{Self, Option};
    use sui::kiosk::{Self, Kiosk, KioskOwnerCap};
    use sui::event;
    use sui::transfer_policy::{Self, TransferPolicy, TransferPolicyCap};
    use sui::package;

    const ENotOwner: u64 = 0;
    const EJobAlreadyCompleted: u64 = 1;
    const ENoFreelancer: u64 = 2;
    const EAlreadyApplied: u64 = 3;
    const EInsufficientPayment: u64 = 4;
    const ENotCandidate: u64 = 5;

    // Events (no 'public' modifier in legacy edition)
    struct ProfileCreated has copy, drop {
        profile_id: address,
        owner: address,
        type: vector<u8>,
    }

    struct ProfileUpdated has copy, drop {
        profile_id: address,
        owner: address,
    }

    struct JobPosted has copy, drop {
        job_id: address,
        employer: address,
        title: vector<u8>,
        payment: u64,
    }

    struct JobApplied has copy, drop {
        job_id: address,
        freelancer: address,
    }

    struct JobCompleted has copy, drop {
        job_id: address,
        freelancer: address,
        nft_id: address,
        payment: u64,
    }

    // One-Time Witness for package initialization
    struct MARKETPLACE has drop {}

    // Structs (no 'public' modifier in legacy edition)
    struct Profile has key, store {
        id: UID,
        owner: address,
        name: vector<u8>,
        bio_url: vector<u8>,
        avatar_url: vector<u8>,
        skills: VecMap<vector<u8>, u8>,
        reputation: u64,
        type: vector<u8>,
    }

    struct Job has key, store {
        id: UID,
        employer: address,
        title: vector<u8>,
        description_url: vector<u8>,
        payment: Balance<SUI>, // Using Balance for efficiency (compatible with 1.43.1)
        freelancer: Option<address>,
        completed: bool,
    }

    struct CompletionNFT has key, store {
        id: UID,
        job_id: address,
        title: vector<u8>,
    }

    // Initialize the package
    fun init(otw: MARKETPLACE, ctx: &mut TxContext) {
        let publisher = package::claim(otw, ctx);
        let (transfer_policy, policy_cap) = transfer_policy::new<CompletionNFT>(&publisher, ctx);
        transfer::public_transfer(publisher, tx_context::sender(ctx));
        transfer::public_transfer(policy_cap, tx_context::sender(ctx));
        transfer::public_share_object(transfer_policy);
    }

    // Create a profile (entry function with vector workaround for VecMap)
    public entry fun create_profile(
        name: vector<u8>,
        bio_url: vector<u8>,
        avatar_url: vector<u8>,
        skills_keys: vector<vector<u8>>, // VecMap split into keys
        skills_values: vector<u8>,       // VecMap split into values
        type: vector<u8>,
        ctx: &mut TxContext
    ) {
        let skills = vec_map::empty();
        let i = 0;
        while (i < vector::length(&skills_keys)) {
            vec_map::insert(&mut skills, *vector::borrow(&skills_keys, i), *vector::borrow(&skills_values, i));
            i = i + 1;
        };
        let profile = Profile {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            name,
            bio_url,
            avatar_url,
            skills,
            reputation: 0,
            type,
        };
        let profile_id = object::uid_to_address(&profile.id);
        event::emit(ProfileCreated { profile_id, owner: profile.owner, type });
        transfer::transfer(profile, tx_context::sender(ctx));
    }

    // Update a profile (entry function with vector workaround)
    public entry fun update_profile(
        profile: &mut Profile,
        name: vector<u8>,
        bio_url: vector<u8>,
        avatar_url: vector<u8>,
        skills_keys: vector<vector<u8>>,
        skills_values: vector<u8>,
        type: vector<u8>,
        ctx: &mut TxContext
    ) {
        assert!(profile.owner == tx_context::sender(ctx), ENotOwner);
        let skills = vec_map::empty();
        let i = 0;
        while (i < vector::length(&skills_keys)) {
            vec_map::insert(&mut skills, *vector::borrow(&skills_keys, i), *vector::borrow(&skills_values, i));
            i = i + 1;
        };
        profile.name = name;
        profile.bio_url = bio_url;
        profile.avatar_url = avatar_url;
        profile.skills = skills;
        profile.type = type;
        event::emit(ProfileUpdated { profile_id: object::uid_to_address(&profile.id), owner: profile.owner });
    }

    // Post a job (accepts Coin, converts to Balance)
    public entry fun post_job(
        title: vector<u8>,
        description_url: vector<u8>,
        payment_coin: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        assert!(coin::value(&payment_coin) >= 100_000_000, EInsufficientPayment); // 0.1 SUI minimum
        let payment = coin::into_balance(payment_coin);
        let job = Job {
            id: object::new(ctx),
            employer: tx_context::sender(ctx),
            title,
            description_url,
            payment,
            freelancer: option::none(),
            completed: false,
        };
        let job_id = object::uid_to_address(&job.id);
        event::emit(JobPosted { job_id, employer: job.employer, title, payment: coin::balance_value(&job.payment) });
        transfer::transfer(job, tx_context::sender(ctx));
    }

    // Apply for a job
    public entry fun apply_for_job(
        job: &mut Job,
        profile: &Profile,
        ctx: &mut TxContext
    ) {
        assert!(profile.type == b"candidate", ENotCandidate);
        assert!(option::is_none(&job.freelancer), EAlreadyApplied);
        assert!(!job.completed, EJobAlreadyCompleted);
        let freelancer = tx_context::sender(ctx);
        job.freelancer = option::some(freelancer);
        event::emit(JobApplied { job_id: object::uid_to_address(&job.id), freelancer });
    }

    // Complete a job and issue an NFT
    public entry fun complete_job(
        job: &mut Job,
        profile: &mut Profile,
        kiosk: &mut Kiosk,
        cap: &KioskOwnerCap,
        _policy: &TransferPolicy<CompletionNFT>,
        ctx: &mut TxContext
    ) {
        assert!(job.employer == tx_context::sender(ctx), ENotOwner);
        assert!(option::is_some(&job.freelancer), ENoFreelancer);
        assert!(!job.completed, EJobAlreadyCompleted);

        let freelancer = option::extract(&mut job.freelancer);
        job.completed = true;

        let payment_coin = coin::from_balance(job.payment, ctx);
        transfer::public_transfer(payment_coin, freelancer);

        let nft = CompletionNFT {
            id: object::new(ctx),
            job_id: object::uid_to_address(&job.id),
            title: job.title,
        };
        let nft_id = object::uid_to_address(&nft.id);
        kiosk::place(kiosk, cap, nft);

        if (profile.owner == freelancer) {
            profile.reputation = profile.reputation + 10;
        };

        event::emit(JobCompleted {
            job_id: object::uid_to_address(&job.id),
            freelancer,
            nft_id,
            payment: coin::balance_value(&job.payment)
        });
    }

    // Create a kiosk for NFT trading
    public entry fun create_kiosk(ctx: &mut TxContext) {
        let (kiosk, kiosk_owner_cap) = kiosk::new(ctx);
        transfer::public_transfer(kiosk_owner_cap, tx_context::sender(ctx));
        transfer::public_share_object(kiosk);
    }
}