// SPDX-License-Identifier: Apache-2.0
module skillsverse::credential_validation {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use std::vector;

    struct Credential has key, store {
        id: UID,
        owner: address,
        cred_type: vector<u8>,
        data_hash: vector<u8>,
        verified: bool,
        issuer: vector<u8>,
    }

    struct AdminCap has key { id: UID }

    const E_ALREADY_VERIFIED: u64 = 2;
    const E_INVALID_CRED_TYPE: u64 = 3;
    const E_INVALID_DATA_HASH: u64 = 4;
    const E_INVALID_ISSUER: u64 = 5;

    fun init(ctx: &mut TxContext) {
        let admin_cap = AdminCap { id: object::new(ctx) };
        transfer::transfer(admin_cap, tx_context::sender(ctx));
    }

    public entry fun submit_credential(
        cred_type: vector<u8>,
        data_hash: vector<u8>,
        issuer: vector<u8>,
        ctx: &mut TxContext
    ) {
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

    public entry fun verify_credential(
        credential: &mut Credential,
        _admin: &AdminCap,
        _ctx: &mut TxContext
    ) {
        assert!(!credential.verified, E_ALREADY_VERIFIED);
        credential.verified = true;
    }

    public fun is_verified(credential: &Credential): bool {
        credential.verified
    }

    public fun get_owner(credential: &Credential): address {
        credential.owner
    }

    public fun get_cred_type(credential: &Credential): vector<u8> {
        credential.cred_type
    }

    public fun get_issuer(credential: &Credential): vector<u8> {
        credential.issuer
    }

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx);
    }
}