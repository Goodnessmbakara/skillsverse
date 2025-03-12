// SPDX-License-Identifier: Apache-2.0
module skillsverse::credential_validation {
    // Import necessary Sui modules
    use sui::object::{Self, UID};           // For unique IDs and object management
    use sui::transfer;                      // For transferring ownership of objects
    use sui::tx_context::{Self, TxContext}; // For transaction metadata (e.g., sender address)
    use sui::vec_map::{Self, VecMap};      // For mapping credential types to indices (optional)

    // === Structs ===

    /// Represents a user's credential stored on-chain.
    struct Credential has key, store {
        id: UID,               // Unique identifier for this credential
        owner: address,        // The wallet address of the user who submitted the credential
        cred_type: vector<u8>, // The type or category of the credential (e.g., "SoftwareEngineer")
        data_hash: vector<u8>, // Cryptographic hash of the credential document (e.g., SHA-256 of PDF)
        verified: bool,        // Whether the credential has been verified (false by default)
        issuer: vector<u8>,    // The entity that issued the credential (e.g., "UniversityX")
    }

    /// Admin capability to restrict verification updates to trusted parties.
    struct AdminCap has key { id: UID }

    // === Constants ===

    /// Error codes for better debugging and handling
    const E_NOT_ADMIN: u64 = 1;          // Caller is not an admin/oracle (unused but kept for clarity)
    const E_ALREADY_VERIFIED: u64 = 2;   // Credential is already verified
    const E_INVALID_CRED_TYPE: u64 = 3;  // Credential type is empty
    const E_INVALID_DATA_HASH: u64 = 4;  // Data hash is empty
    const E_INVALID_ISSUER: u64 = 5;     // Issuer is empty

    // === Initialization ===

    /// Initialize the contract by creating an AdminCap for the deployer.
    fun init(ctx: &mut TxContext) {
        let admin_cap = AdminCap { id: object::new(ctx) };
        transfer::transfer(admin_cap, tx_context::sender(ctx));
    }

    // === Public Functions ===

    /// Allows a user to submit a new credential for verification.
    public entry fun submit_credential(
        cred_type: vector<u8>,
        data_hash: vector<u8>,
        issuer: vector<u8>,
        ctx: &mut TxContext
    ) {
        // Validate inputs are non-empty
        assert!(std::vector::length(&cred_type) > 0, E_INVALID_CRED_TYPE);
        assert!(std::vector::length(&data_hash) > 0, E_INVALID_DATA_HASH);
        assert!(std::vector::length(&issuer) > 0, E_INVALID_ISSUER);

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

    /// Allows an admin to verify a credential.
    public entry fun verify_credential(
        credential: &mut Credential,
        _admin: &AdminCap,  // Ownership enforced by Sui runtime
        ctx: &mut TxContext
    ) {
        // Prevent re-verification
        assert!(!credential.verified, E_ALREADY_VERIFIED);
        
        // Mark the credential as verified
        credential.verified = true;
    }

    // === Helper Functions (View) ===

    /// Returns whether a credential is verified.
    public fun is_verified(credential: &Credential): bool {
        credential.verified
    }

    /// Returns the owner of a credential.
    public fun get_owner(credential: &Credential): address {
        credential.owner
    }

    /// Returns the credential type.
    public fun get_cred_type(credential: &Credential): vector<u8> {
        credential.cred_type
    }

    /// Returns the issuer of the credential.
    public fun get_issuer(credential: &Credential): vector<u8> {
        credential.issuer
    }

    // === Testing ===
    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx);
    }
}