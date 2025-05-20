#[test_only]
module skillsverse::job_creation_tests {
    use sui::test_scenario::{Self, Scenario};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::object::{Self, ID, UID};
    use sui::clock::{Self, Clock};
    use sui::vec_set::{Self, VecSet};
    use std::vector;
    use std::option;
    
    use skillsverse::job_creation::{
        Self,
        AdminCap,
        Job,
        JobEscrow,
        get_employer_address,
        get_description_hash,
        get_payment_amount,
        get_status,
        is_applicant,
        get_escrow_amount,
        test_init
    };
    
    // Mock module for testing NFTCredential
    use skillsverse::mock_credentials;
    
    // Test addresses
    const ADMIN: address = @0x1;
    const EMPLOYER: address = @0x2;
    const FREELANCER1: address = @0x3;
    const FREELANCER2: address = @0x4;
    
    // Test data
    const JOB_DESCRIPTION_HASH: vector<u8> = b"QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o";
    const MILESTONE1_HASH: vector<u8> = b"QmW8c9S2c3KjJzcPEZQSx8JYywAyX6wRdwRvZYwvV3qJHm";
    const MILESTONE2_HASH: vector<u8> = b"QmZH3FPdSeL2sLgKS8BQxAKJ5DUexwK9RmzVRDx9cxPk7m";
    const MIN_PAYMENT: u64 = 100;
    
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
        
        test_scenario::end(scenario);
    }
    
    #[test]
    fun test_create_job() {
        let scenario = test_scenario::begin(EMPLOYER);
        
        // Create a mock clock for testing
        let clock = clock::create_for_testing(test_scenario::ctx(&mut scenario));
        
        // Create required skills IDs (mocked)
        let required_skills = vector::empty<ID>();
        vector::push_back(&mut required_skills, mock_credentials::get_test_credential_id(1));
        vector::push_back(&mut required_skills, mock_credentials::get_test_credential_id(2));
        
        // Create milestone descriptions
        let milestone_descriptions = vector::empty<vector<u8>>();
        vector::push_back(&mut milestone_descriptions, MILESTONE1_HASH);
        vector::push_back(&mut milestone_descriptions, MILESTONE2_HASH);
        
        // Create milestone payment percentages
        let milestone_payments = vector::empty<u64>();
        vector::push_back(&mut milestone_payments, 50); // 50% for first milestone
        vector::push_back(&mut milestone_payments, 50); // 50% for second milestone
        
        // Create a job
        test_scenario::next_tx(&mut scenario, EMPLOYER);
        {
            // Create a payment coin for escrow
            let payment = coin::mint_for_testing<SUI>(1000, test_scenario::ctx(&mut scenario));
            
            job_creation::create_job(
                JOB_DESCRIPTION_HASH,
                required_skills,
                milestone_descriptions,
                milestone_payments,
                payment,
                &clock,
                test_scenario::ctx(&mut scenario)
            );
        };
        
        // Verify job and escrow were created
        test_scenario::next_tx(&mut scenario, EMPLOYER);
        {
            let job = test_scenario::take_shared<Job>(&scenario);
            let escrow = test_scenario::take_shared<JobEscrow>(&scenario);
            
            // Verify job details
            assert!(get_employer_address(&job) == EMPLOYER, 0);
            assert!(get_description_hash(&job) == JOB_DESCRIPTION_HASH, 1);
            assert!(get_payment_amount(&job) == 1000, 2);
            assert!(get_status(&job) == 0, 3); // OPEN status
            
            // Verify escrow
            assert!(get_escrow_amount(&escrow) == 1000, 4);
            
            test_scenario::return_shared(job);
            test_scenario::return_shared(escrow);
        };
        
        // Clean up
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }
    
    #[test]
    #[expected_failure(abort_code = 0)] // EInsufficientPayment
    fun test_create_job_insufficient_payment() {
        let scenario = test_scenario::begin(EMPLOYER);
        
        // Create a mock clock for testing
        let clock = clock::create_for_testing(test_scenario::ctx(&mut scenario));
        
        // Required skills
        let required_skills = vector::empty<ID>();
        vector::push_back(&mut required_skills, mock_credentials::get_test_credential_id(1));
        
        // Milestone data
        let milestone_descriptions = vector::empty<vector<u8>>();
        vector::push_back(&mut milestone_descriptions, MILESTONE1_HASH);
        
        let milestone_payments = vector::empty<u64>();
        vector::push_back(&mut milestone_payments, 100);
        
        // Try to create a job with insufficient payment
        test_scenario::next_tx(&mut scenario, EMPLOYER);
        {
            // Create a payment coin below minimum (50 < 100)
            let payment = coin::mint_for_testing<SUI>(50, test_scenario::ctx(&mut scenario));
            
            job_creation::create_job(
                JOB_DESCRIPTION_HASH,
                required_skills,
                milestone_descriptions,
                milestone_payments,
                payment,
                &clock,
                test_scenario::ctx(&mut scenario)
            );
        };
        
        // Clean up
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }
    
    #[test]
    fun test_apply_for_job() {
        let scenario = test_scenario::begin(EMPLOYER);
        
        // Initialize mock credentials module
        mock_credentials::init(test_scenario::ctx(&mut scenario));
        
        // Create a mock clock for testing
        let clock = clock::create_for_testing(test_scenario::ctx(&mut scenario));
        
        // Required skills (matching what freelancer has)
        let required_skills = vector::empty<ID>();
        vector::push_back(&mut required_skills, mock_credentials::get_test_credential_id(1));
        
        // Milestone data
        let milestone_descriptions = vector::empty<vector<u8>>();
        vector::push_back(&mut milestone_descriptions, MILESTONE1_HASH);
        
        let milestone_payments = vector::empty<u64>();
        vector::push_back(&mut milestone_payments, 100);
        
        // Create a job
        test_scenario::next_tx(&mut scenario, EMPLOYER);
        {
            let payment = coin::mint_for_testing<SUI>(1000, test_scenario::ctx(&mut scenario));
            
            job_creation::create_job(
                JOB_DESCRIPTION_HASH,
                required_skills,
                milestone_descriptions,
                milestone_payments,
                payment,
                &clock,
                test_scenario::ctx(&mut scenario)
            );
        };
        
        // Create credentials for freelancer
        test_scenario::next_tx(&mut scenario, FREELANCER1);
        {
            mock_credentials::create_credential(
                mock_credentials::get_test_credential_id(1), // Matching required skill
                true, // verified
                FREELANCER1,
                test_scenario::ctx(&mut scenario)
            );
        };
        
        // Freelancer applies to the job
        test_scenario::next_tx(&mut scenario, FREELANCER1);
        {
            let job = test_scenario::take_shared<Job>(&scenario);
            let credential = mock_credentials::get_credential(FREELANCER1);
            let credentials = vector::singleton(credential);
            
            job_creation::apply_for_job(
                &mut job,
                credentials,
                test_scenario::ctx(&mut scenario)
            );
            
            // Verify freelancer is now an applicant
            assert!(is_applicant(&job, FREELANCER1), 0);
            
            mock_credentials::return_credential(FREELANCER1, credential);
            test_scenario::return_shared(job);
        };
        
        // Clean up
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }
    
    #[test]
    #[expected_failure(abort_code = 3)] // EMissingSkills
    fun test_apply_for_job_missing_skills() {
        let scenario = test_scenario::begin(EMPLOYER);
        
        // Initialize mock credentials module
        mock_credentials::init(test_scenario::ctx(&mut scenario));
        
        // Create a mock clock for testing
        let clock = clock::create_for_testing(test_scenario::ctx(&mut scenario));
        
        // Required skills (skill ID 1 and 2)
        let required_skills = vector::empty<ID>();
        vector::push_back(&mut required_skills, mock_credentials::get_test_credential_id(1));
        vector::push_back(&mut required_skills, mock_credentials::get_test_credential_id(2));
        
        // Milestone data
        let milestone_descriptions = vector::empty<vector<u8>>();
        vector::push_back(&mut milestone_descriptions, MILESTONE1_HASH);
        
        let milestone_payments = vector::empty<u64>();
        vector::push_back(&mut milestone_payments, 100);
        
        // Create a job
        test_scenario::next_tx(&mut scenario, EMPLOYER);
        {
            let payment = coin::mint_for_testing<SUI>(1000, test_scenario::ctx(&mut scenario));
            
            job_creation::create_job(
                JOB_DESCRIPTION_HASH,
                required_skills,
                milestone_descriptions,
                milestone_payments,
                payment,
                &clock,
                test_scenario::ctx(&mut scenario)
            );
        };
        
        // Create credentials for freelancer (only has skill ID 1, missing skill ID 2)
        test_scenario::next_tx(&mut scenario, FREELANCER1);
        {
            mock_credentials::create_credential(
                mock_credentials::get_test_credential_id(1),
                true, // verified
                FREELANCER1,
                test_scenario::ctx(&mut scenario)
            );
        };
        
        // Freelancer applies to the job (should fail due to missing skill)
        test_scenario::next_tx(&mut scenario, FREELANCER1);
        {
            let job = test_scenario::take_shared<Job>(&scenario);
            let credential = mock_credentials::get_credential(FREELANCER1);
            let credentials = vector::singleton(credential);
            
            job_creation::apply_for_job(
                &mut job,
                credentials,
                test_scenario::ctx(&mut scenario)
            );
            
            mock_credentials::return_credential(FREELANCER1, credential);
            test_scenario::return_shared(job);
        };
        
        // Clean up
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }
    
    #[test]
    #[expected_failure(abort_code = 2)] // EDuplicateApplication
    fun test_duplicate_application() {
        let scenario = test_scenario::begin(EMPLOYER);
        
        // Initialize mock credentials module
        mock_credentials::init(test_scenario::ctx(&mut scenario));
        
        // Create a mock clock for testing
        let clock = clock::create_for_testing(test_scenario::ctx(&mut scenario));
        
        // Required skills
        let required_skills = vector::empty<ID>();
        vector::push_back(&mut required_skills, mock_credentials::get_test_credential_id(1));
        
        // Milestone data
        let milestone_descriptions = vector::empty<vector<u8>>();
        vector::push_back(&mut milestone_descriptions, MILESTONE1_HASH);
        
        let milestone_payments = vector::empty<u64>();
        vector::push_back(&mut milestone_payments, 100);
        
        // Create a job
        test_scenario::next_tx(&mut scenario, EMPLOYER);
        {
            let payment = coin::mint_for_testing<SUI>(1000, test_scenario::ctx(&mut scenario));
            
            job_creation::create_job(
                JOB_DESCRIPTION_HASH,
                required_skills,
                milestone_descriptions,
                milestone_payments,
                payment,
                &clock,
                test_scenario::ctx(&mut scenario)
            );
        };
        
        // Create credentials for freelancer
        test_scenario::next_tx(&mut scenario, FREELANCER1);
        {
            mock_credentials::create_credential(
                mock_credentials::get_test_credential_id(1),
                true, // verified
                FREELANCER1,
                test_scenario::ctx(&mut scenario)
            );
        };
        
        // First application (should succeed)
        test_scenario::next_tx(&mut scenario, FREELANCER1);
        {
            let job = test_scenario::take_shared<Job>(&scenario);
            let credential = mock_credentials::get_credential(FREELANCER1);
            let credentials = vector::singleton(credential);
            
            job_creation::apply_for_job(
                &mut job,
                credentials,
                test_scenario::ctx(&mut scenario)
            );
            
            mock_credentials::return_credential(FREELANCER1, credential);
            test_scenario::return_shared(job);
        };
        
        // Second application (should fail due to duplicate)
        test_scenario::next_tx(&mut scenario, FREELANCER1);
        {
            let job = test_scenario::take_shared<Job>(&scenario);
            let credential = mock_credentials::get_credential(FREELANCER1);
            let credentials = vector::singleton(credential);
            
            job_creation::apply_for_job(
                &mut job,
                credentials,
                test_scenario::ctx(&mut scenario)
            );
            
            mock_credentials::return_credential(FREELANCER1, credential);
            test_scenario::return_shared(job);
        };
        
        // Clean up
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }
}

#[test_only]
module skillsverse::mock_credentials {
    use sui::object::{Self, ID, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use std::vector;
    
    struct MockNFTCredential has key, store {
        id: UID,
        credential_id: ID,
        verified: bool,
        owner: address
    }
    
    struct Registry has key {
        id: UID
    }
    
    // Test credential IDs
    const TEST_CREDENTIAL_ID_1: vector<u8> = b"credential_id_1";
    const TEST_CREDENTIAL_ID_2: vector<u8> = b"credential_id_2";
    
    // Initialize the mock module
    public fun init(ctx: &mut TxContext) {
        let registry = Registry {
            id: object::new(ctx)
        };
        transfer::share_object(registry);
    }
    
    // Create a mock credential
    public fun create_credential(credential_id: ID, verified: bool, owner: address, ctx: &mut TxContext) {
        let credential = MockNFTCredential {
            id: object::new(ctx),
            credential_id,
            verified,
            owner
        };
        transfer::transfer(credential, owner);
    }
    
    // Get a credential from an owner
    public fun get_credential(owner: address): &MockNFTCredential {
        // This is a test-only function, so we're taking a shortcut here
        // In a real contract, we would use sui::transfer to move the credential
        abort 0
    }
    
    // Return a credential
    public fun return_credential(owner: address, credential: &MockNFTCredential) {
        // This is a test-only function
    }
    
    // Get the test credential ID
    public fun get_test_credential_id(index: u64): ID {
        if (index == 1) {
            object::id_from_bytes(TEST_CREDENTIAL_ID_1)
        } else if (index == 2) {
            object::id_from_bytes(TEST_CREDENTIAL_ID_2)
        } else {
            abort 0
        }
    }
    
    // Mock of the is_credential_verified function
    public fun is_credential_verified(credential: &MockNFTCredential): bool {
        credential.verified
    }
    
    // Mock of the get_owner_address function
    public fun get_owner_address(credential: &MockNFTCredential): address {
        credential.owner
    }
    
    // Mock of the get_credential_id function
    public fun get_credential_id(credential: &MockNFTCredential): ID {
        credential.credential_id
    }
}