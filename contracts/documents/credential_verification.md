# Skillsverse Credential Verification Contract

A decentralized system for verifying credential authenticity on the Sui blockchain through a consensus-based verifier voting mechanism.

## Overview

The Credential Verification Contract provides a secure and transparent way to verify user-submitted credentials (such as certificates, skills, and qualifications) using a decentralized group of trusted verifiers. The system leverages Sui blockchain's object-centric model to ensure tamper-proof verification records.

## Core Components

1. **Credential Object**: Represents a user-submitted credential with metadata stored on IPFS
2. **VerifierRegistry**: Manages the list of authorized verifiers and minimum votes required
3. **Voting Mechanism**: Allows verifiers to submit votes on credential authenticity

## Features

- **Credential Submission**: Users can submit credentials with IPFS metadata and issuer information
- **Verifier Management**: Admins can add/remove trusted verifiers and set minimum vote thresholds
- **Secure Voting**: Only registered verifiers can vote on credential authenticity
- **Event Notifications**: Events emitted for frontend integration
- **Access Control**: Sui capability pattern for admin and verifier authentication

## Setup Instructions

### Prerequisites

- Sui CLI (latest version)
- Access to Sui Devnet
- NodeJS (for frontend integration)

### Deployment

1. **Compile the contract**:
   ```bash
      cd ~/Projects/skillsverse/contracts
      sui move build
      ```

   2. **Publish the contract**:
      ```bash
      sui client publish --gas-budget 10000000
      ```

   3. **Initialize the contract**:
      ```bash
      sui client call --package <PACKAGE_ID> --module credential_verification --function initialize --args <ADMIN_CAP_ID> --gas-budget 1000000
      ```

   ### Configuration

   1. **Register verifiers**:
      ```bash
      sui client call --package <PACKAGE_ID> --module credential_verification --function add_verifier --args <ADMIN_CAP> <VERIFIER_ADDRESS> --gas-budget 1000000
      ```

   2. **Set minimum votes required**:
      ```bash
      sui client call --package <PACKAGE_ID> --module credential_verification --function set_min_votes --args <ADMIN_CAP> <MIN_VOTES> --gas-budget 1000000
      ```

   ## Usage

   ### For Users

   1. **Submit a credential**:
      ```bash
      sui client call --package <PACKAGE_ID> --module credential_verification --function submit_credential --args <IPFS_HASH> <ISSUER_NAME> <ISSUE_DATE> --gas-budget 1000000
      ```

   2. **Check credential status**:
      ```bash
      sui client call --package <PACKAGE_ID> --module credential_verification --function check_credential --args <CREDENTIAL_ID> --gas-budget 1000000
      ```

   ### For Verifiers

   1. **Vote on credential**:
      ```bash
      sui client call --package <PACKAGE_ID> --module credential_verification --function vote_credential --args <VERIFIER_CAP> <CREDENTIAL_ID> <VOTE_BOOL> --gas-budget 1000000
      ```

   ## Testing

   Run the test suite with:
   ```bash
   sui move test
   ```

   ## Integration

   Frontend applications can listen for events:
   - `CredentialSubmitted`
   - `CredentialVerified`
   - `VerifierAdded`
   - `VerifierRemoved`

   ## License

   This project is licensed under the MIT License - see the LICENSE file for details.

   ## Contributing

   Contributions are welcome! Please feel free to submit a Pull Request.