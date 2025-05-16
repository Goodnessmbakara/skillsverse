#[test_only]
module skillsverse::credential_verification_tests {
    use sui::test_scenario::{Self, Scenario};
    use skillsverse::credential_verification::{
        Self,
        AdminCap,
        VerifierRegistry,
        Credential,
        is_verified,
        is_verifier,
        get_user_address,
        get_ipfs_hash,
        get_issuer,
        get_approve_votes,
        get_reject_votes,
        test_init
    };
    
    // Test addresses
    const ADMIN: address = @0x1;
    const USER1: address = @0x2;
    const VERIFIER1: address = @0x3;
    const VERIFIER2: address = @0x4;
    const VERIFIER3: address = @0x5;
    
    // Test credential data
    const IPFS_HASH: vector<u8> = b"QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o";
    const ISSUER: vector<u8> = b"University of Blockchain";
    
    #[test]
    fun test_init() {
        let scenario = test_scenario::begin(ADMIN);
        
        // Initialize the module
        {
            test_init(test_scenario::ctx(&mut scenario));
        };
        
        // Check that admin received AdminCap
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            assert!(test_scenario::has_most_recent_for_sender<AdminCap>(&scenario), 0);
        };
        
        // Check that VerifierRegistry was created and shared
        {
            let registry = test_scenario::take_shared<VerifierRegistry>(&scenario);
            assert!(credential_verification::get_min_votes(&registry) == 3, 1); // Default value
            test_scenario::return_shared(registry);
        };
        
        test_scenario::end(scenario);
    }
    
    #[test]
    fun test_submit_credential() {
        let scenario = test_scenario::begin(USER1);
        
        // Submit a credential
        {
            credential_verification::submit_credential(
                IPFS_HASH,
                ISSUER,
                test_scenario::ctx(&mut scenario)
            );
        };
        
        // Check that credential was created
        test_scenario::next_tx(&mut scenario, USER1);
        {
            let credential = test_scenario::take_from_sender<Credential>(&scenario);
            
            // Verify credential properties
            assert!(get_user_address(&credential) == USER1, 0);
            assert!(get_ipfs_hash(&credential) == IPFS_HASH, 1);
            assert!(get_issuer(&credential) == ISSUER, 2);
            assert!(!is_verified(&credential), 3); // Should start as unverified
            assert!(get_approve_votes(&credential) == 0, 4); // No votes yet
            assert!(get_reject_votes(&credential) == 0, 5); // No votes yet
            
            test_scenario::return_to_sender(&scenario, credential);
        };
        
        test_scenario::end(scenario);
    }
    
    #[test]
    fun test_register_verifier() {
        let scenario = test_scenario::begin(ADMIN);
        
        // Initialize the module
        {
            test_init(test_scenario::ctx(&mut scenario));
        };
        
        test_scenario::next_tx(&mut scenario, ADMIN);
        let admin_cap = test_scenario::take_from_sender<AdminCap>(&scenario);
        let registry = test_scenario::take_shared<VerifierRegistry>(&scenario);
        
        // Register verifiers
        {
            credential_verification::register_verifier(
                &mut registry,
                VERIFIER1,
                &admin_cap,
                test_scenario::ctx(&mut scenario)
            );
            
            credential_verification::register_verifier(
                &mut registry,
                VERIFIER2,
                &admin_cap,
                test_scenario::ctx(&mut scenario)
            );
        };
        
        // Check that verifiers were added
        {
            assert!(is_verifier(&registry, VERIFIER1), 0);
            assert!(is_verifier(&registry, VERIFIER2), 1);
            assert!(!is_verifier(&registry, VERIFIER3), 2); // Not added yet
        };
        
        // Clean up
        test_scenario::return_to_sender(&scenario, admin_cap);
        test_scenario::return_shared(registry);
        test_scenario::end(scenario);
    }
    
    #[test]
    fun test_submit_vote() {
        let scenario = test_scenario::begin(ADMIN);
        
        // Initialize the module
        {
            test_init(test_scenario::ctx(&mut scenario));
        };
        
        // Admin takes objects and registers verifiers
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let admin_cap = test_scenario::take_from_sender<AdminCap>(&scenario);
            let registry = test_scenario::take_shared<VerifierRegistry>(&scenario);
            
            credential_verification::register_verifier(
                &mut registry,
                VERIFIER1,
                &admin_cap,
                test_scenario::ctx(&mut scenario)
            );
            
            test_scenario::return_to_sender(&scenario, admin_cap);
            test_scenario::return_shared(registry);
        };
        
        // USER1 submits a credential
        test_scenario::next_tx(&mut scenario, USER1);
        {
            credential_verification::submit_credential(
                IPFS_HASH,
                ISSUER,
                test_scenario::ctx(&mut scenario)
            );
        };
        
        // VERIFIER1 votes on the credential
        test_scenario::next_tx(&mut scenario, VERIFIER1);
        {
            let registry = test_scenario::take_shared<VerifierRegistry>(&scenario);
            
            // Take credential from USER1
            let credential = test_scenario::take_from_address<Credential>(&scenario, USER1);
            
            // Submit approval vote
            credential_verification::submit_vote(
                &registry,
                &mut credential,
                true, // approve
                test_scenario::ctx(&mut scenario)
            );
            
            // Verify vote was counted
            assert!(get_approve_votes(&credential) == 1, 0);
            assert!(get_reject_votes(&credential) == 0, 1);
            
            // Return objects
            test_scenario::return_to_address(USER1, credential);
            test_scenario::return_shared(registry);
        };
        
        test_scenario::end(scenario);
    }
    
    #[test]
    #[expected_failure(abort_code = 1)] // ENotVerifier
    fun test_unauthorized_vote() {
        let scenario = test_scenario::begin(ADMIN);
        
        // Initialize the module
        {
            test_init(test_scenario::ctx(&mut scenario));
        };
        
        // USER1 submits a credential
        test_scenario::next_tx(&mut scenario, USER1);
        {
            credential_verification::submit_credential(
                IPFS_HASH,
                ISSUER,
                test_scenario::ctx(&mut scenario)
            );
        };
        
        // VERIFIER3 (not registered) tries to vote
        test_scenario::next_tx(&mut scenario, VERIFIER3);
        {
            let registry = test_scenario::take_shared<VerifierRegistry>(&scenario);
            let credential = test_scenario::take_from_address<Credential>(&scenario, USER1);
            
            // This should fail because VERIFIER3 is not registered
            credential_verification::submit_vote(
                &registry,
                &mut credential,
                true,
                test_scenario::ctx(&mut scenario)
            );
            
            test_scenario::return_to_address(USER1, credential);
            test_scenario::return_shared(registry);
        };
        
        test_scenario::end(scenario);
    }
}