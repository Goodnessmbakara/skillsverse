module skillsverse::credential_minting {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use skillsverse::credential_validation::{Self, Credential};

    // Shared object to track the number of minted NFTs
    struct MintCounter has key {
        id: UID,
        count: u64,
    }

    // Configuration object holding the treasury address (shared and mutable)
    struct Config has key {
        id: UID,
        treasury: address,
    }

    // Admin capability to restrict treasury updates
    struct AdminCap has key { id: UID }

    // The minted NFT
    struct MintedCredential has key, store {
        id: UID,
        user: address,
        cred_type: vector<u8>,
        issuer: vector<u8>,
        metadata_uri: vector<u8>,
    }

    // One-time witness for initialization
    struct CREDENTIAL_MINTING has drop {}

    // Error codes
    const E_NOT_VERIFIED_OR_OWNER: u64 = 1;
    const E_INVALID_PAYMENT: u64 = 2;
    const E_NOT_ADMIN: u64 = 3;

    // Initialize the contract with the deployer's address as initial treasury
    fun init(_witness: CREDENTIAL_MINTING, ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);
        transfer::share_object(MintCounter { id: object::new(ctx), count: 0 });
        transfer::share_object(Config { id: object::new(ctx), treasury: sender });
        transfer::transfer(AdminCap { id: object::new(ctx) }, sender); // Give AdminCap to deployer
    }

    // Admin function to update the treasury address
    public entry fun set_treasury(
        config: &mut Config,
        new_treasury: address,
        _admin: &AdminCap, // Restricts to admin only
        _ctx: &mut TxContext // Required for entry function, unused
    ) {
        config.treasury = new_treasury;
    }

    // Mint an NFT
    public entry fun mint_credential(
        counter: &mut MintCounter,
        config: &Config,
        credential: &Credential,
        payment: Coin<SUI>,
        metadata_uri: vector<u8>,
        ctx: &mut TxContext
    ) {
        let user = tx_context::sender(ctx);

        // Verify the user owns the credential and it’s verified
        assert!(credential_validation::get_owner(credential) == user && 
                credential_validation::is_verified(credential), E_NOT_VERIFIED_OR_OWNER);

        // Payment logic
        if (counter.count < 100000) {
            assert!(coin::value(&payment) == 0, E_INVALID_PAYMENT);
            coin::destroy_zero(payment); // Clean up zero-value coin
        } else {
            assert!(coin::value(&payment) == 1000000000, E_INVALID_PAYMENT); // 1 SUI = 1,000,000,000 MIST
            transfer::public_transfer(payment, config.treasury); // Send to configurable treasury
        };

        // Create and transfer the NFT
        let nft = MintedCredential {
            id: object::new(ctx),
            user,
            cred_type: credential_validation::get_cred_type(credential),
            issuer: credential_validation::get_issuer(credential),
            metadata_uri,
        };
        transfer::transfer(nft, user);

        // Increment the mint counter
        counter.count = counter.count + 1;
    }
}