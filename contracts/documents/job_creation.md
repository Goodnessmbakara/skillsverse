# Skillsverse Job Creation Contract

A comprehensive decentralized system for managing job postings, applications, escrow payments, milestone tracking, and dispute resolution on the Sui blockchain.

## Overview

The Job Creation Contract enables the full lifecycle of decentralized job management on the Skillsverse platform. Employers can post jobs with detailed requirements and payment milestones, while freelancers with verified credentials can apply based on their skills. The contract ensures secure payment through escrow, tracks milestone completion, resolves disputes through community voting, and provides completion NFTs as proof of work.

## Core Components

1. **Job Object**: Represents a job posting with all its requirements and status
2. **JobEscrow**: Securely holds payment funds until milestone conditions are met
3. **Dispute**: Manages disagreements over milestone completion through voting
4. **Milestone Tracking**: Tracks progress of job completion through defined milestones

## Data Model

1. **Job**:
    - `id`: Unique identifier
    - `owner`: Address of job creator
    - `title`: Job title
    - `description`: Detailed job description
    - `required_skills`: Vector of skill IDs required
    - `budget`: Total payment amount
    - `milestones`: Vector of milestone objects
    - `status`: Current job status (open, in_progress, completed, cancelled)

2. **Milestone**:
    - `id`: Unique identifier within job
    - `description`: Deliverable description
    - `amount`: Payment amount for milestone
    - `deadline`: Optional completion timeframe
    - `status`: Current status (pending, in_review, completed, disputed)

3. **Application**:
    - `freelancer`: Address of applicant
    - `job_id`: Reference to job being applied for
    - `proposal`: Applicant's proposal text
    - `status`: Application status (pending, accepted, rejected)

4. **Dispute**:
    - `id`: Unique identifier
    - `job_id`: Associated job
    - `milestone_id`: Contested milestone
    - `initiator`: Address that opened dispute
    - `votes_for`: Count of votes supporting freelancer
    - `votes_against`: Count of votes supporting employer
    - `resolution_deadline`: Timestamp for voting end

## Features

- **Job Creation**: Employers can post jobs with detailed requirements and milestones
- **Secure Escrow**: Payments are locked in escrow until release conditions are met
- **Skill Verification**: Only freelancers with verified credentials can apply
- **Application Management**: Tracks and prevents duplicate applications
- **Event Notifications**: Emits events for frontend integration

## Event System

The contract emits the following events to enable reactive frontend updates:

1. **JobCreated**: When a new job is posted
2. **ApplicationSubmitted**: When a freelancer applies to a job
3. **ApplicationStatusChanged**: When application status updates
4. **MilestoneCompleted**: When a milestone is marked complete
5. **DisputeOpened**: When a dispute is initiated
6. **DisputeResolved**: When a dispute reaches resolution
7. **FundsReleased**: When escrow releases payment
8. **JobCompleted**: When all milestones are finalized

## Security Considerations

1. **Access Control**: Only job owners can accept applications or release funds
2. **Reentrancy Protection**: Functions are protected against reentrancy attacks
3. **Fund Safety**: Escrow implementation prevents unauthorized withdrawals
4. **Reputation Checks**: Verifies freelancers have required credential NFTs
5. **Timelock Protection**: Critical operations have time-based safety periods
6. **Dispute Resolution**: Fair voting mechanism with quorum requirements
7. **Emergency Pause**: Admin capabilities to freeze contracts during critical vulnerabilities

## Testing

### Unit Tests

```bash
# Run all unit tests
sui move test

# Run specific test module
sui move test job_creation_tests
```

### Test Coverage

1. **Job Lifecycle Tests**: Tests full job creation to completion flow
2. **Escrow Tests**: Validates payment security and release mechanisms
3. **Dispute Tests**: Ensures fair dispute resolution with various voting scenarios
4. **Edge Case Tests**: Tests boundary conditions and error handling
5. **Authorization Tests**: Validates access control restrictions

### Integration Testing

1. **Frontend Integration**: Test scripts for frontend event subscription
2. **Multi-contract Integration**: Tests for interaction with credential verification system

## Setup Instructions

### Prerequisites

- Sui CLI (latest version)
- Access to Sui Devnet
- Existing deployment of the Mint Validated Credentials Contract
- Python/Django backend with pysui for transaction submission

### Deployment

1. **Compile the contract**:
    ```bash
    cd ~/Projects/skillsverse/contracts
    sui move build
    ```
2. **Deploy to devnet**:
    ```bash
    sui client publish --gas-budget 200000000
    ```
3. **Initialize contract**:
    ```bash
    sui client call --package $PACKAGE_ID --module job_creation --function initialize --gas-budget 10000000
    ```
4. **Verify deployment**:
    ```bash
    sui client objects --address $ADMIN_ADDRESS
    ```

### Configuration

1. Set credentials contract address in config
2. Initialize administrator roles
3. Configure dispute resolution parameters