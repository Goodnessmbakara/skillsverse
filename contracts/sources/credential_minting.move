// SPDX-License-Identifier: Apache-2.0
module skillsverse::credential_minting {
    // Import necessary Sui modules
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use skillsverse::credential_validation::{Credential, is_verified, get_owner};

    // === Structs ===

    /// Shared object to track the number of minted credentials
    struct MintCounter has key {
        id: UID,
        count: u64,
    }

    /// The minted credential owned by the user
    struct MintedCredential has key {
        id: UID,
        user: address,
    }

    // === Constants ===

    /// Error codes for better debugging and handling
    const E_NOT_VERIFIED: u64 = 1;       // Credential is not verified
    const E_INVALID_PAYMENT: u64 = 2;    // Incorrect payment amount

    // === Initialization ===

    /// Initialize the contract by creating the MintCounter
    fun init(ctx: &mut TxContext) {
        let counter = MintCounter {
            id: object::new(ctx),
            count: 0,
        };
        transfer::share_object(counter); // Make it accessible to all
    }

    // === Public Functions ===

    /// Mint a credential after checking verification and payment
    public entry fun mint_credential(
        counter: &mut MintCounter,
        credential: &Credential,
        payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let user = tx_context::sender(ctx);

        // Ensure the credential belongs to the user and is verified
        assert!(get_owner(credential) == user, E_NOT_VERIFIED);
        assert!(is_verified(credential), E_NOT_VERIFIED);

        // Check mint count and enforce payment rules
        if (counter.count < 100000) {
            // Free mint: ensure payment is 0
            assert!(coin::value(&payment) == 0, E_INVALID_PAYMENT);
        } else {
            // Paid mint: require exactly 1 SUI (1 SUI = 1e9 MIST)
            assert!(coin::value(&payment) == 1000000000, E_INVALID_PAYMENT);
            // Burn the payment (or transfer to a treasury)
            coin::burn(payment, ctx);
        };

        // Mint the credential
        let minted_credential = MintedCredential {
            id: object::new(ctx),
            user,
        };
        transfer::transfer(minted_credential, user);

        // Increment the mint counter
        counter.count = counter.count + 1;
    }

    // === Testing ===
    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx);
    }
}