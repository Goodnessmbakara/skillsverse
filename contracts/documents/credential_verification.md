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