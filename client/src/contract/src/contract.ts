export const SKILLSVERSE_CONTRACT = `
module skillsverse::marketplace {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::tx_context::{Self, TxContext};
    use sui::vec_map::{Self, VecMap};
    use sui::option::{Self, Option};
    use sui::kiosk::{Self, Kiosk};
    use sui::event;
    use sui::transfer_policy::{Self, TransferPolicy};
    use sui::package;

    const ENotOwner: u64 = 0;
    const EJobAlreadyCompleted: u64 = 1;
    const ENoFreelancer: u64 = 2;
    const EAlreadyApplied: u64 = 3;
    const EInsufficientPayment: u64 = 4;
    const ENotCandidate: u64 = 5;
    const ENotEmployer: u64 = 6;

    struct ProfileCreated has copy, drop {
        profile_id: address,
        owner: address,
        type: vector<u8>,
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

    struct MARKETPLACE has drop {}

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
        payment: Coin<SUI>,
        freelancer: Option<address>,
        completed: bool,
    }

    struct CompletionNFT has key, store {
        id: UID,
        job_id: address,
        title: vector<u8>,
    }

    fun init(otw: MARKETPLACE, ctx: &mut TxContext) {
        let publisher = package::claim(otw, ctx);
        let (transfer_policy, policy_cap) = transfer_policy::new<CompletionNFT>(&publisher, ctx);
        transfer::public_transfer(publisher, tx_context::sender(ctx));
        transfer::public_transfer(policy_cap, tx_context::sender(ctx));
        transfer::public_share_object(transfer_policy);
    }

    public entry fun create_profile(
        name: vector<u8>,
        bio_url: vector<u8>,
        avatar_url: vector<u8>,
        skills: VecMap<vector<u8>, u8>,
        type: vector<u8>,
        ctx: &mut TxContext
    ) {
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

    public entry fun post_job(
        title: vector<u8>,
        description_url: vector<u8>,
        payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        assert!(coin::value(&payment) >= 100_000_000, EInsufficientPayment);
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
        event::emit(JobPosted { 
            job_id, 
            employer: job.employer, 
            title, 
            payment: coin::value(&job.payment) 
        });
        transfer::transfer(job, tx_context::sender(ctx));
    }

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
        event::emit(JobApplied { 
            job_id: object::uid_to_address(&job.id), 
            freelancer 
        });
    }

    public entry fun complete_job(
        job: &mut Job,
        profile: &mut Profile,
        kiosk: &mut Kiosk,
        policy: &TransferPolicy<CompletionNFT>,
        ctx: &mut TxContext
    ) {
        assert!(job.employer == tx_context::sender(ctx), ENotOwner);
        assert!(option::is_some(&job.freelancer), ENoFreelancer);
        assert!(!job.completed, EJobAlreadyCompleted);

        let freelancer = option::extract(&mut job.freelancer);
        job.completed = true;

        let payment_value = coin::value(&job.payment);
        transfer::public_transfer(job.payment, freelancer);
        job.payment = coin::zero<SUI>(ctx);

        let nft = CompletionNFT {
            id: object::new(ctx),
            job_id: object::uid_to_address(&job.id),
            title: job.title,
        };
        let nft_id = object::uid_to_address(&nft.id);
        kiosk::place(kiosk, &nft, freelancer);
        transfer::public_transfer(nft, freelancer);

        if (profile.owner == freelancer) {
            profile.reputation = profile.reputation + 10;
        };

        event::emit(JobCompleted { 
            job_id: object::uid_to_address(&job.id), 
            freelancer, 
            nft_id, 
            payment: payment_value 
        });
    }

    public entry fun create_kiosk(ctx: &mut TxContext) {
        let (kiosk, kiosk_owner_cap) = kiosk::new(ctx);
        transfer::transfer(kiosk_owner_cap, tx_context::sender(ctx));
        transfer::public_share_object(kiosk);
    }
}
`;