#[test]
public fun test_submit_and_verify_credential() {
    use sui::test_scenario;

    // Start a test scenario
    let scenario_val = test_scenario::begin(@0x1); // Admin address
    let scenario = &mut scenario_val;

    // Initialize the contract (create AdminCap)
    init_for_testing(test_scenario::ctx(scenario));

    // Move to the next transaction as a user
    test_scenario::next_tx(scenario, @0x2); // User address
    let ctx = test_scenario::ctx(scenario);

    // Submit a credential
    submit_credential(
        b"SoftwareEngineer", // cred_type
        b"0xabcdef123456",  // data_hash (dummy hash)
        b"UniversityX",      // issuer
        ctx
    );

    // Take the credential from the sender’s inventory
    let credential = test_scenario::take_from_sender<Credential>(scenario);

    // Check initial state
    assert!(!is_verified(&credential), 1); // Not verified yet
    assert!(get_owner(&credential) == @0x2, 2); // Owned by user
    assert!(get_cred_type(&credential) == b"SoftwareEngineer", 3);
    assert!(get_issuer(&credential) == b"UniversityX", 4);

    // Move to admin to verify it
    test_scenario::next_tx(scenario, @0x1); // Back to admin
    let admin_cap = test_scenario::take_from_sender<AdminCap>(scenario);
    verify_credential(&mut credential, &admin_cap, test_scenario::ctx(scenario));

    // Check verified state
    assert!(is_verified(&credential), 5);

    // Clean up: return objects and end scenario
    test_scenario::return_to_sender(scenario, credential);
    test_scenario::return_to_sender(scenario, admin_cap);
    test_scenario::end(scenario_val);
}