// SPDX-License-Identifier: Apache-2.0
module skillsverse::credential_validation {
    // Import necessary Sui modules
    use sui::object::{Self, UID};           // For unique IDs and object management
    use sui::transfer;                      // For transferring ownership of objects
    use sui::tx_context::{Self, TxContext}; // For transaction metadata (e.g., sender address)
    use sui::vec_map::{Self, VecMap};      // For mapping credential types to indices (optional)

    // === Structs ===

    /// Represents a user's credential stored on-chain.
    /// This is the core data structure for credential validation.
    struct Credential has key, store {
        id: UID,               // Unique identifier for this credential, generated on-chain
        owner: address,        // The wallet address of the user who submitted the credential
        cred_type: vector<u8>, // The type or category of the credential (e.g., "SoftwareEngineer")
        data_hash: vector<u8>, // Cryptographic hash of the credential document (e.g., SHA-256 of PDF)
        verified: bool,        // Whether the credential has been verified (false by default)
        issuer: vector<u8>,    // The entity that issued the credential (e.g., "UniversityX")
    }

    /// Admin capability to restrict verification updates to trusted parties (e.g., oracle).
    struct AdminCap has key { id: UID }

    // === Constants ===

    /// Error codes for better debugging and handling
    const E_NOT_ADMIN: u64 = 1;     // Caller is not an admin/oracle
    const E_ALREADY_VERIFIED: u64 = 2; // Credential is already verified

    // === Initialization ===

    /// Initialize the contract by creating an AdminCap for the deployer.
    /// This runs once when the contract is published.
    fun init(ctx: &mut TxContext) {
        let admin_cap = AdminCap { id: object::new(ctx) };
        transfer::transfer(admin_cap, tx_context::sender(ctx));
    }

    // === Public Functions ===

    /// Allows a user to submit a new credential for verification.
    /// - `cred_type`: The skill or category (e.g., "SoftwareEngineer").
    /// - `data_hash`: Hash of the credential document (provided off-chain).
    /// - `issuer`: The issuing entity (e.g., "UniversityX").
    /// The credential starts unverified and is owned by the sender.
    public entry fun submit_credential(
        cred_type: vector<u8>,
        data_hash: vector<u8>,
        issuer: vector<u8>,
        ctx: &mut TxContext
    ) {
        let credential = Credential {
            id: object::new(ctx),           // Generate a unique ID
            owner: tx_context::sender(ctx), // Auto-capture the user's address
            cred_type,                      // Store the credential type
            data_hash,                      // Store the document hash
            verified: false,                // Initially unverified
            issuer                          // Store the issuer
        };
        transfer::transfer(credential, tx_context::sender(ctx)); // Send to user
    }

    /// Allows an admin (oracle) to verify a credential.
    /// - `credential`: The credential object to verify.
    /// - `admin`: The AdminCap proving the caller is authorized.
    /// Only flips `verified` to true if it’s currently false.
    public entry fun verify_credential(
        credential: &mut Credential,
        admin: &AdminCap,
        ctx: &mut TxContext
    ) {
        // Ensure the caller has the AdminCap (oracle privilege)
        assert!(object::id(admin) == object::uid_to_inner(&admin.id), E_NOT_ADMIN);
        
        // Prevent re-verification of an already verified credential
        assert!(!credential.verified, E_ALREADY_VERIFIED);
        
        // Mark the credential as verified
        credential.verified = true;
    }

    // === Helper Functions (View) ===

    /// Returns whether a credential is verified (for off-chain use).
    public fun is_verified(credential: &Credential): bool {
        credential.verified
    }

    /// Returns the owner of a credential (for off-chain checks).
    public fun get_owner(credential: &Credential): address {
        credential.owner
    }

    /// Returns the credential type (for filtering/matching).
    public fun get_cred_type(credential: &Credential): vector<u8> {
        credential.cred_type
    }

    /// Returns the issuer of the credential (for trust verification).
    public fun get_issuer(credential: &Credential): vector<u8> {
        credential.issuer
    }

    // === Testing ===
    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx);
    }
}