module skillsverse::credential_verification {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use sui::vec_map::{Self, VecMap};
    use sui::vec_set::{Self, VecSet};
    use sui::dynamic_field as df;
    use sui::vector;
    
    // Error codes
    const ENotAdmin: u64 = 0;
    const ENotVerifier: u64 = 1;
    const EAlreadyVerified: u64 = 2;
    const EAlreadyVoted: u64 = 3;
    const EInvalidInput: u64 = 4;
    const EVerifierAlreadyRegistered: u64 = 5;
    
    // Events
    /// Emitted when a user submits a new credential for verification
    struct CredentialSubmitted has copy, drop {
        credential_id: address,
        user_address: address,
        ipfs_hash: vector<u8>,
        issuer: vector<u8>
    }
    
    /// Emitted when a verifier casts a vote on a credential
    struct VoteSubmitted has copy, drop {
        credential_id: address,
        verifier_address: address,
        vote: bool,
    }
    
    /// Administrator capability for managing the verifier registry
    struct AdminCap has key, store {
        id: UID,
    }
    
    /// Registry of authorized verifiers who can vote on credentials
    struct VerifierRegistry has key {
        id: UID,
        verifiers: VecSet<address>,
        min_votes: u64,
    }
    
    /// Represents a user-submitted credential with metadata stored on IPFS
    struct Credential has key, store {
        id: UID,
        user_address: address,
        ipfs_hash: vector<u8>,
        verified: bool,
        issuer: vector<u8>,
        approve_votes: u64,
        reject_votes: u64,
    }
    
    /// Internal structure to track votes for a credential
    struct VoteRecord has store {
        votes: VecMap<address, bool>, // verifier address -> vote (true=approve, false=reject)
    }
    
    /// One-Time Witness for package initialization
    struct CREDENTIAL_VERIFICATION has drop {}
    
    /// Initializes the Credential Verification system
    fun init(witness: CREDENTIAL_VERIFICATION, ctx: &mut TxContext) {
        // Create admin capability for the deployer
        let admin_cap = AdminCap {
            id: object::new(ctx),
        };
        
        // Create verifier registry with default settings
        let registry = VerifierRegistry {
            id: object::new(ctx),
            verifiers: vec_set::empty(),
            min_votes: 3, // Default minimum votes required (configurable later)
        };
        
        // Transfer admin capability to transaction sender
        transfer::transfer(admin_cap, tx_context::sender(ctx));
        
        // Share verifier registry as a shared object
        transfer::share_object(registry);
    }
    
    /// Allows a user to submit a credential for verification
    public entry fun submit_credential(
        ipfs_hash: vector<u8>,
        issuer: vector<u8>,
        ctx: &mut TxContext
    ) {
        // Validate inputs to ensure they're not empty
        assert!(vector::length(&ipfs_hash) > 0, EInvalidInput);
        assert!(vector::length(&issuer) > 0, EInvalidInput);
        
        // Create credential object with default unverified status
        let credential = Credential {
            id: object::new(ctx),
            user_address: tx_context::sender(ctx),
            ipfs_hash,
            verified: false,
            issuer,
            approve_votes: 0,
            reject_votes: 0,
        };
        
        // Initialize vote record to track verifier votes
        let vote_record = VoteRecord {
            votes: vec_map::empty(),
        };
        
        // Add vote record as dynamic field to the credential
        df::add(&mut credential.id, b"vote_record", vote_record);
        
        // Get credential ID for the event
        let credential_id = object::uid_to_address(&credential.id);
        
        // Emit credential submitted event for frontend notification
        event::emit(CredentialSubmitted {
            credential_id,
            user_address: credential.user_address,
            ipfs_hash: credential.ipfs_hash,
            issuer: credential.issuer
        });
        
        // Transfer credential object to the submitting user
        transfer::transfer(credential, tx_context::sender(ctx));
    }
    
    /// Allows an admin to register a new authorized verifier
    public entry fun register_verifier(
        registry: &mut VerifierRegistry,
        verifier_address: address,
        _admin_cap: &AdminCap, // Ensures only admin can call this function
        _ctx: &mut TxContext
    ) {
        // Validate verifier is not already registered
        assert!(!vec_set::contains(&registry.verifiers, &verifier_address), EVerifierAlreadyRegistered);
        
        // Add verifier to registry
        vec_set::insert(&mut registry.verifiers, verifier_address);
    }
    
    /// Allows an admin to update the minimum votes required for verification
    public entry fun update_min_votes(
        registry: &mut VerifierRegistry,
        new_min_votes: u64,
        _admin_cap: &AdminCap, // Ensures only admin can call this function
        _ctx: &mut TxContext
    ) {
        // Update minimum votes threshold
        registry.min_votes = new_min_votes;
    }
    
    /// Allows a registered verifier to submit a vote on a credential
    public entry fun submit_vote(
        registry: &VerifierRegistry,
        credential: &mut Credential,
        approve: bool,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Verify sender is a registered verifier
        assert!(vec_set::contains(&registry.verifiers, &sender), ENotVerifier);
        
        // Ensure credential is not already verified
        assert!(!credential.verified, EAlreadyVerified);
        
        // Get vote record from dynamic field
        let vote_record = df::borrow_mut<vector<u8>, VoteRecord>(&mut credential.id, b"vote_record");
        
        // Check if verifier has already voted
        assert!(!vec_map::contains(&vote_record.votes, &sender), EAlreadyVoted);
        
        // Record the vote
        vec_map::insert(&mut vote_record.votes, sender, approve);
        
        // Update vote counts
        if (approve) {
            credential.approve_votes = credential.approve_votes + 1;
        } else {
            credential.reject_votes = credential.reject_votes + 1;
        }
        
        // Emit vote submitted event for frontend notification
        event::emit(VoteSubmitted {
            credential_id: object::uid_to_address(&credential.id),
            verifier_address: sender,
            vote: approve,
        });
        
        // Note: Vote tallying and verification status update will be implemented in a future step
    }
    
    // Public accessor functions for external queries
    
    /// Returns if a credential has been verified
    public fun is_verified(credential: &Credential): bool {
        credential.verified
    }
    
    /// Returns the issuer of a credential
    public fun get_issuer(credential: &Credential): vector<u8> {
        credential.issuer
    }
    
    /// Returns the owner address of a credential
    public fun get_user_address(credential: &Credential): address {
        credential.user_address
    }
    
    /// Returns the IPFS hash containing credential metadata
    public fun get_ipfs_hash(credential: &Credential): vector<u8> {
        credential.ipfs_hash
    }
    
    /// Checks if an address is a registered verifier
    public fun is_verifier(registry: &VerifierRegistry, address: address): bool {
        vec_set::contains(&registry.verifiers, &address)
    }
    
    /// Returns the minimum votes required for verification
    public fun get_min_votes(registry: &VerifierRegistry): u64 {
        registry.min_votes
    }
    
    /// Returns the current approval vote count for a credential
    public fun get_approve_votes(credential: &Credential): u64 {
        credential.approve_votes
    }
    
    /// Returns the current rejection vote count for a credential
    public fun get_reject_votes(credential: &Credential): u64 {
        credential.reject_votes
    }
    
    #[test_only]
    /// Initialize function accessible in tests
    public fun test_init(ctx: &mut TxContext) {
        init(CREDENTIAL_VERIFICATION {}, ctx)
    }
}