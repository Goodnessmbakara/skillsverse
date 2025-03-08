module web3_job_matcher::credential_minting {
    use sui::object::{Self, UID};
    use sui::tx_context::TxContext;

    struct Credential has key, store {
        id: UID,
        user_address: address,
        credential_data: vector<u8>,
    }

    public fun mint_credential(user_address: address, credential_data: vector<u8>, ctx: &mut TxContext): Credential {
        Credential {
            id: object::new(ctx),
            user_address,
            credential_data,
        }
    }
}