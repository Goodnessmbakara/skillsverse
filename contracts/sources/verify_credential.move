// SPDX-License-Identifier: Apache-2.0
module skillsverse::credential_validation {
    // Import necessary Sui modules
    use sui::object::{Self, UID};           // For unique IDs and object management
    use sui::transfer;                      // For transferring ownership of objects
    use sui::tx_context::{TxContext};       // For transaction metadata (e.g., sender address)
    // Removed unused sui::vec_map import since VecMap isn't used

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
    // Removed E_NOT_ADMIN since it’s unused; kept others for functionality
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
        assert!(vector::length(&cred_type) > 0, E_INVALID_CRED_TYPE);
        assert!(vector::length(&data_hash) > 0, E_INVALID_DATA_HASH);
        assert!(vector::length(&issuer) > 0, E_INVALID_ISSUER);

        let credential = Credential {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            cred_type,
            data_hash,
            verified: false,
            issuer
        };
        transfer::transfer(credential, tx_context::sender(ctx));
    }

    /// Allows an admin to verify a credential.
    public entry fun verify_credential(
        credential: &mut Credential,
        _admin: &AdminCap,  // Ownership enforced by Sui runtime
        _ctx: &mut TxContext // Prefixed with _ since it’s unused but required for entry function
    ) {
        // Prevent re-verification
        assert!(!credential.verified, E_ALREADY_VERIFIED);
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