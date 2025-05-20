#[test_only]
module skillsverse::job_matching_tests {
    use sui::test_scenario::{Self, Scenario};
    use sui::object::{ID};
    use skillsverse::job_matching::{
        Self,
        AdminCap,
        JobReference,
        Match,
        get_job_hash,
        get_employer_address,
        get_user_address,
        get_job_id,
        get_confidence_score,
        test_init
    };
    
    // Test addresses
    const ADMIN: address = @0x1;
    const EMPLOYER: address = @0x2;
    const USER: address = @0x3;
    const UNAUTHORIZED: address = @0x4;
    
    // Test data
    const JOB_HASH: vector<u8> = b"QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o";
    
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
    fun test_create_job_reference() {
        let scenario = test_scenario::begin(ADMIN);
        
        // Initialize the module
        {
            test_init(test_scenario::ctx(&mut scenario));
        };
        
        // Admin creates a job reference
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let admin_cap = test_scenario::take_from_sender<AdminCap>(&scenario);
            
            job_matching::create_job_reference(
                &admin_cap,
                JOB_HASH,
                EMPLOYER,
                test_scenario::ctx(&mut scenario)
            );
            
            test_scenario::return_to_sender(&scenario, admin_cap);
        };
        
        // Check that job reference was created
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let job_ref = test_scenario::take_shared<JobReference>(&scenario);
            
            assert!(get_job_hash(&job_ref) == JOB_HASH, 0);
            assert!(get_employer_address(&job_ref) == EMPLOYER, 1);
            
            test_scenario::return_shared(job_ref);
        };
        
        test_scenario::end(scenario);
    }
    
    #[test]
    fun test_log_match() {
        let scenario = test_scenario::begin(ADMIN);
        
        // Initialize the module
        {
            test_init(test_scenario::ctx(&mut scenario));
        };
        
        // Admin creates a job reference
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let admin_cap = test_scenario::take_from_sender<AdminCap>(&scenario);
            
            job_matching::create_job_reference(
                &admin_cap,
                JOB_HASH,
                EMPLOYER,
                test_scenario::ctx(&mut scenario)
            );
            
            test_scenario::return_to_sender(&scenario, admin_cap);
        };
        
        // Admin logs a match
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let admin_cap = test_scenario::take_from_sender<AdminCap>(&scenario);
            let job_ref = test_scenario::take_shared<JobReference>(&scenario);
            
            job_matching::log_match(
                &admin_cap,
                USER,
                &job_ref,
                85, // confidence score
                test_scenario::ctx(&mut scenario)
            );
            
            test_scenario::return_to_sender(&scenario, admin_cap);
            test_scenario::return_shared(job_ref);
        };
        
        // Check that match was created and transferred to user
        test_scenario::next_tx(&mut scenario, USER);
        {
            let match_obj = test_scenario::take_from_sender<Match>(&scenario);
            
            assert!(get_user_address(&match_obj) == USER, 0);
            assert!(get_confidence_score(&match_obj) == 85, 1);
            
            test_scenario::return_to_sender(&scenario, match_obj);
        };
        
        test_scenario::end(scenario);
    }
    
    #[test]
    #[expected_failure]
    fun test_unauthorized_create_job() {
        let scenario = test_scenario::begin(ADMIN);
        
        // Initialize the module (creates AdminCap for ADMIN)
        {
            test_init(test_scenario::ctx(&mut scenario));
        };
        
        // UNAUTHORIZED tries to create a job reference
        test_scenario::next_tx(&mut scenario, UNAUTHORIZED);
        {
            // This should fail because UNAUTHORIZED doesn't have admin cap
            // The test framework will catch the type error since AdminCap is required
            job_matching::create_job_reference(
                /* no admin cap available */,
                JOB_HASH,
                EMPLOYER,
                test_scenario::ctx(&mut scenario)
            );
        };
        
        test_scenario::end(scenario);
    }
    
    #[test]
    #[expected_failure(abort_code = 3)] // EInvalidConfidenceScore
    fun test_invalid_confidence_score() {
        let scenario = test_scenario::begin(ADMIN);
        
        // Initialize the module
        {
            test_init(test_scenario::ctx(&mut scenario));
        };
        
        // Admin creates a job reference
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let admin_cap = test_scenario::take_from_sender<AdminCap>(&scenario);
            
            job_matching::create_job_reference(
                &admin_cap,
                JOB_HASH,
                EMPLOYER,
                test_scenario::ctx(&mut scenario)
            );
            
            test_scenario::return_to_sender(&scenario, admin_cap);
        };
        
        // Admin tries to log a match with invalid confidence score
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let admin_cap = test_scenario::take_from_sender<AdminCap>(&scenario);
            let job_ref = test_scenario::take_shared<JobReference>(&scenario);
            
            // This should fail because confidence score > 100
            job_matching::log_match(
                &admin_cap,
                USER,
                &job_ref,
                101, // Invalid confidence score
                test_scenario::ctx(&mut scenario)
            );
            
            test_scenario::return_to_sender(&scenario, admin_cap);
            test_scenario::return_shared(job_ref);
        };
        
        test_scenario::end(scenario);
    }
    
    #[test]
    #[expected_failure(abort_code = 1)] // EInvalidInput
    fun test_empty_job_hash() {
        let scenario = test_scenario::begin(ADMIN);
        
        // Initialize the module
        {
            test_init(test_scenario::ctx(&mut scenario));
        };
        
        // Admin tries to create a job with empty hash
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let admin_cap = test_scenario::take_from_sender<AdminCap>(&scenario);
            
            job_matching::create_job_reference(
                &admin_cap,
                b"", // Empty job hash
                EMPLOYER,
                test_scenario::ctx(&mut scenario)
            );
            
            test_scenario::return_to_sender(&scenario, admin_cap);
        };
        
        test_scenario::end(scenario);
    }
}