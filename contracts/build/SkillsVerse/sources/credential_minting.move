module skillsverse::credential_minting {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use skillsverse::credential_validation::{Self, Credential};

    struct MintCounter has key {
        id: UID,
        count: u64,
    }

    struct Config has key {
        id: UID,
        treasury: address,
    }

    struct AdminCap has key { id: UID }

    struct MintedCredential has key, store {
        id: UID,
        user: address,
        cred_type: vector<u8>,
        issuer: vector<u8>,
        metadata_uri: vector<u8>,
    }

    struct CREDENTIAL_MINTING has drop {}

    const E_NOT_VERIFIED_OR_OWNER: u64 = 1;
    const E_INVALID_PAYMENT: u64 = 2;

    fun init(_witness: CREDENTIAL_MINTING, ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);
        transfer::share_object(MintCounter { id: object::new(ctx), count: 0 });
        transfer::share_object(Config { id: object::new(ctx), treasury: sender });
        transfer::transfer(AdminCap { id: object::new(ctx) }, sender);
    }

    public entry fun set_treasury(
        config: &mut Config,
        new_treasury: address,
        _admin: &AdminCap,
        _ctx: &mut TxContext
    ) {
        config.treasury = new_treasury;
    }

    public entry fun mint_credential(
        counter: &mut MintCounter,
        config: &Config,
        credential: &Credential,
        payment: Coin<SUI>,
        metadata_uri: vector<u8>,
        ctx: &mut TxContext
    ) {
        let user = tx_context::sender(ctx);
        assert!(credential_validation::get_owner(credential) == user && 
                credential_validation::is_verified(credential), E_NOT_VERIFIED_OR_OWNER);

        if (counter.count < 100000) {
            assert!(coin::value(&payment) == 0, E_INVALID_PAYMENT);
            coin::destroy_zero(payment);
        } else {
            assert!(coin::value(&payment) == 1000000000, E_INVALID_PAYMENT);
            transfer::public_transfer(payment, config.treasury);
        };

        let nft = MintedCredential {
            id: object::new(ctx),
            user,
            cred_type: credential_validation::get_cred_type(credential),
            issuer: credential_validation::get_issuer(credential),
            metadata_uri,
        };
        transfer::transfer(nft, user);
        counter.count = counter.count + 1;
    }
}