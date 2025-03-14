module skillsverse::credential_minting {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;

    // Shared object to track the number of minted NFTs
    struct MintCounter has key {
        id: UID,
        count: u64,
    }

    // Configuration object holding the treasury address
    struct Config has key {
        id: UID,
        treasury: address,
    }

    // The minted NFT
    struct MintedCredential has key, store {
        id: UID,
        user: address,
        cred_type: vector<u8>,
        issuer: vector<u8>,
        metadata_uri: vector<u8>,
    }

    // Credential struct (self-contained for testing)
    struct Credential has key, store {
        id: UID,
        owner: address,
        verified: bool,
        cred_type: vector<u8>,
        issuer: vector<u8>
    }

    fun get_owner(cred: &Credential): address { cred.owner }
    fun is_verified(cred: &Credential): bool { cred.verified }
    fun get_cred_type(cred: &Credential): vector<u8> { cred.cred_type }
    fun get_issuer(cred: &Credential): vector<u8> { cred.issuer }

    // Initialize the contract with the treasury address
    fun init(treasury: address, ctx: &mut TxContext) {
        transfer::share_object(MintCounter { id: object::new(ctx), count: 0 });
        transfer::share_object(Config { id: object::new(ctx), treasury });
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
        assert!(get_owner(credential) == user && is_verified(credential), 1);

        // Payment logic
        if (counter.count < 100000) {
            assert!(coin::value(&payment) == 0, 2);
            coin::destroy_zero(payment); // Clean up zero-value coin
        } else {
            assert!(coin::value(&payment) == 1000000000, 2); // 1 SUI = 1,000,000,000 MIST
            transfer::transfer(payment, config.treasury);
        };

        // Create and transfer the NFT
        let nft = MintedCredential {
            id: object::new(ctx),
            user,
            cred_type: get_cred_type(credential),
            issuer: get_issuer(credential),
            metadata_uri,
        };
        transfer::transfer(nft, user);

        // Increment the mint counter
        counter.count = counter.count + 1;
    }
}