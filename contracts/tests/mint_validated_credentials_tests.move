#[test_only]
module skillsverse::mint_validated_credentials_tests {
    use sui::test_scenario::{Self, Scenario};
    use sui::kiosk;
    
    use skillsverse::mint_validated_credentials::{
        Self,
        AdminCap,
        MintRegistry,
        NFTCredential,
        get_metadata_uri,
        get_owner_address,
        get_credential_id,
        is_transferable,
        is_credential_minted,
        test_init
    };
    
    use skillsverse::credential_verification::{
        Self,
        Credential,
        VerifierRegistry,
        AdminCap as VerifierAdminCap
    };
    
    // Test addresses
    const ADMIN: address = @0x1;
    const USER1: address = @0x2;
    const VERIFIER1: address = @0x3;
    
    // Test credential data
    const IPFS_HASH: vector<u8> = b"QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o";
    const ISSUER: vector<u8> = b"University of Blockchain";
    const METADATA_URI: vector<u8> = b"ipfs://QmW8c9S2c3KjJzcPEZQSx8JYywAyX6wRdwRvZYwvV3qJHm";
    
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
        
        // Check that MintRegistry was created and shared
        {
            let registry = test_scenario::take_shared<MintRegistry>(&scenario);
            test_scenario::return_shared(registry);
        };
        
        test_scenario::end(scenario);
    }
    
    #[test]
    fun test_create_kiosk() {
        let scenario = test_scenario::begin(USER1);
        
        // Create kiosk for user
        {
            mint_validated_credentials::create_user_kiosk(test_scenario::ctx(&mut scenario));
        };
        
        // Verify kiosk was created and shared
        test_scenario::next_tx(&mut scenario, USER1);
        {
            // User should own a KioskOwnerCap
            assert!(test_scenario::has_most_recent_for_sender<kiosk::KioskOwnerCap>(&scenario), 0);
            
            // A shared Kiosk should exist
            let kiosk_obj = test_scenario::take_shared<kiosk::Kiosk>(&scenario);
            test_scenario::return_shared(kiosk_obj);
        };
        
        test_scenario::end(scenario);
    }
    
    #[test]
    fun test_mint_nft_success() {
        // This test will:
        // 1. Initialize both credential_verification and mint_validated_credentials
        // 2. Submit and verify a credential
        // 3. Create a kiosk
        // 4. Mint an NFT for the verified credential
        
        let scenario = test_scenario::begin(ADMIN);
        
        // Initialize credential verification module
        {
            credential_verification::test_init(test_scenario::ctx(&mut scenario));
        };
        
        // Initialize mint validated credentials module
        {
            test_init(test_scenario::ctx(&mut scenario));
        };
        
        // Admin takes objects and registers a verifier
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let admin_cap = test_scenario::take_from_sender<VerifierAdminCap>(&scenario);
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
        
        // VERIFIER1 votes on the credential (we need enough votes to make it verified)
        let credential_address: address;
        test_scenario::next_tx(&mut scenario, USER1);
        {
            // Get the credential address for future use
            let credential = test_scenario::take_from_sender<Credential>(&scenario);
            credential_address = sui::object::id_address(&credential);
            test_scenario::return_to_sender(&scenario, credential);
        };
        
        // We'll use ADMIN to directly mark the credential as verified for testing purposes
        // In a real scenario, this would happen through the voting mechanism
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            // Simulate verification
            let credential = test_scenario::take_from_address<Credential>(&scenario, USER1);
            let admin_cap = test_scenario::take_from_sender<VerifierAdminCap>(&scenario);
            
            // Use a test-only function to mark credential as verified
            credential_verification::test_mark_verified(&mut credential, &admin_cap);
            
            test_scenario::return_to_sender(&scenario, admin_cap);
            test_scenario::return_to_address(USER1, credential);
        };
        
        // USER1 creates a kiosk
        test_scenario::next_tx(&mut scenario, USER1);
        {
            mint_validated_credentials::create_user_kiosk(test_scenario::ctx(&mut scenario));
        };
        
        // USER1 mints an NFT for the verified credential
        test_scenario::next_tx(&mut scenario, USER1);
        {
            let registry = test_scenario::take_shared<MintRegistry>(&scenario);
            let credential = test_scenario::take_from_sender<Credential>(&scenario);
            let kiosk_obj = test_scenario::take_shared<kiosk::Kiosk>(&scenario);
            let kiosk_cap = test_scenario::take_from_sender<kiosk::KioskOwnerCap>(&scenario);
            
            // Mint NFT
            mint_validated_credentials::mint_nft(
                &mut registry,
                &credential,
                METADATA_URI,
                false, // non-transferable (soulbound)
                &mut kiosk_obj,
                test_scenario::ctx(&mut scenario)
            );
            
            // Verify credential is marked as minted
            assert!(is_credential_minted(&registry, credential_address), 0);
            
            test_scenario::return_to_sender(&scenario, credential);
            test_scenario::return_to_sender(&scenario, kiosk_cap);
            test_scenario::return_shared(registry);
            test_scenario::return_shared(kiosk_obj);
        };
        
        // Verify NFT is in kiosk with correct properties
        test_scenario::next_tx(&mut scenario, USER1);
        {
            let kiosk_obj = test_scenario::take_shared<kiosk::Kiosk>(&scenario);
            let kiosk_cap = test_scenario::take_from_sender<kiosk::KioskOwnerCap>(&scenario);
            
            // Take NFT from kiosk for inspection
            let nft = kiosk::take<NFTCredential>(
                &mut kiosk_obj,
                &kiosk_cap,
                credential_address // NFT ID is derived from credential ID
            );
            
            // Verify NFT properties
            assert!(get_owner_address(&nft) == USER1, 0);
            assert!(get_metadata_uri(&nft) == METADATA_URI, 1);
            assert!(get_credential_id(&nft) == credential_address, 2);
            assert!(!is_transferable(&nft), 3); // Should be non-transferable
            
            // Return NFT to kiosk and clean up
            kiosk::return_val(&mut kiosk_obj, nft);
            
            test_scenario::return_to_sender(&scenario, kiosk_cap);
            test_scenario::return_shared(kiosk_obj);
        };
        
        test_scenario::end(scenario);
    }
    
    #[test]
    #[expected_failure(abort_code = 0)] // EUnverifiedCredential
    fun test_mint_unverified_credential() {
        let scenario = test_scenario::begin(ADMIN);
        
        // Initialize modules
        {
            credential_verification::test_init(test_scenario::ctx(&mut scenario));
            test_init(test_scenario::ctx(&mut scenario));
        };
        
        // USER1 submits a credential (unverified)
        test_scenario::next_tx(&mut scenario, USER1);
        {
            credential_verification::submit_credential(
                IPFS_HASH,
                ISSUER,
                test_scenario::ctx(&mut scenario)
            );
        };
        
        // USER1 creates a kiosk
        test_scenario::next_tx(&mut scenario, USER1);
        {
            mint_validated_credentials::create_user_kiosk(test_scenario::ctx(&mut scenario));
        };
        
        // USER1 attempts to mint an NFT for the unverified credential (should fail)
        test_scenario::next_tx(&mut scenario, USER1);
        {
            let registry = test_scenario::take_shared<MintRegistry>(&scenario);
            let credential = test_scenario::take_from_sender<Credential>(&scenario);
            let kiosk_obj = test_scenario::take_shared<kiosk::Kiosk>(&scenario);
            
            // This should fail because credential is not verified
            mint_validated_credentials::mint_nft(
                &mut registry,
                &credential,
                METADATA_URI,
                false,
                &mut kiosk_obj,
                test_scenario::ctx(&mut scenario)
            );
            
            test_scenario::return_to_sender(&scenario, credential);
            test_scenario::return_shared(registry);
            test_scenario::return_shared(kiosk_obj);
        };
        
        test_scenario::end(scenario);
    }
    
    #[test]
    #[expected_failure(abort_code = 1)] // ENotOwner
    fun test_mint_other_user_credential() {
        let scenario = test_scenario::begin(ADMIN);
        
        // Initialize modules
        {
            credential_verification::test_init(test_scenario::ctx(&mut scenario));
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
        
        // Mark credential as verified (for testing)
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let credential = test_scenario::take_from_address<Credential>(&scenario, USER1);
            let admin_cap = test_scenario::take_from_sender<VerifierAdminCap>(&scenario);
            
            credential_verification::test_mark_verified(&mut credential, &admin_cap);
            
            test_scenario::return_to_sender(&scenario, admin_cap);
            test_scenario::return_to_address(USER1, credential);
        };
        
        // ADMIN creates a kiosk
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            mint_validated_credentials::create_user_kiosk(test_scenario::ctx(&mut scenario));
        };
        
        // ADMIN tries to mint for USER1's credential (should fail)
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let registry = test_scenario::take_shared<MintRegistry>(&scenario);
            let credential = test_scenario::take_from_address<Credential>(&scenario, USER1);
            let kiosk_obj = test_scenario::take_shared<kiosk::Kiosk>(&scenario);
            
            // This should fail because ADMIN is not the credential owner
            mint_validated_credentials::mint_nft(
                &mut registry,
                &credential,
                METADATA_URI,
                false,
                &mut kiosk_obj,
                test_scenario::ctx(&mut scenario)
            );
            
            test_scenario::return_to_address(USER1, credential);
            test_scenario::return_shared(registry);
            test_scenario::return_shared(kiosk_obj);
        };
        
        test_scenario::end(scenario);
    }
}