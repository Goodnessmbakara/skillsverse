module skillsverse::job_matching {
    // Import necessary Sui modules
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::TxContext; // Removed 'Self' since it’s unused
    use sui::event;

    // Struct to represent a job reference (shared object)
    struct JobReference has key {
        id: UID,              // Unique identifier for the job reference
        job_hash: vector<u8>, // Hash of the job data for integrity
        platform: vector<u8>, // Name of the platform posting the job
    }

    // Struct to represent a job match (owned by the user)
    struct JobMatch has key, store {
        id: UID,             // Unique identifier for the match
        user: address,       // Address of the user matched to the job
        job_id: ID,          // ID of the JobReference object
        match_score: u64,    // Score indicating match quality
    }

    // Event emitted when a job reference is added
    struct JobReferenceAdded has copy, drop {
        job_id: ID,          // ID of the newly created JobReference
        job_hash: vector<u8>, // Hash of the job data
        platform: vector<u8>, // Platform name
    }

    // Event emitted when a job match is recorded
    struct MatchFound has copy, drop {
        user: address,       // Address of the user matched
        job_id: ID,          // ID of the JobReference matched to
        match_score: u64,    // Score of the match
    }

    // Function to add a new job reference
    public entry fun add_job_reference(
        job_hash: vector<u8>,  // Hash of the job data
        platform: vector<u8>,  // Platform name as bytes
        ctx: &mut TxContext    // Transaction context
    ) {
        // Create a new unique identifier
        let id = object::new(ctx);
        // Extract the ID from the UID for event emission
        let job_id = object::uid_to_inner(&id);
        // Create the JobReference object
        let job = JobReference {
            id,
            job_hash,
            platform,
        };
        // Share the object so it’s globally accessible
        transfer::share_object(job);
        // Emit an event with the job reference details
        event::emit(JobReferenceAdded { job_id, job_hash, platform });
    }

    // Function to record a job match for a user
    public entry fun record_match(
        user: address,         // Address of the user to receive the match
        job_id: ID,            // ID of the JobReference being matched
        match_score: u64,      // Score of the match
        ctx: &mut TxContext    // Transaction context
    ) {
        // Create a new unique identifier
        let job_match = JobMatch {
            id: object::new(ctx),
            user,
            job_id,
            match_score,
        };
        // Transfer the JobMatch object to the user
        transfer::transfer(job_match, user);
        // Emit an event to notify of the match
        event::emit(MatchFound { user, job_id, match_score });
    }
}