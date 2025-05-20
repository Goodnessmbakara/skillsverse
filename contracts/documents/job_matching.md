# Skillsverse AI-Powered Job Matching Contract

A secure, transparent system for recording AI-generated job matches on the Sui blockchain, facilitating connections between employers and professionals.

## Overview

The AI-Powered Job Matching Contract records job references and AI-generated matches on the Sui blockchain. This provides transparency and enables notifications for users when new matches are found. The system leverages an off-chain AI service that performs the matching computation, with results being recorded on-chain.

## Core Components

1. **JobReference Object**: A shared object representing a job listing with an IPFS hash of the job details
2. **Match Object**: An object representing an AI-generated match between a user and a job
3. **AdminCap**: A capability object restricting sensitive operations to authorized administrators

## Features

- **Job Reference Creation**: Store job references with IPFS hashes of job details
- **Match Logging**: Record AI-generated matches with confidence scores
- **Event Notifications**: Emit events for frontend integration
- **Access Control**: Restrict sensitive operations to authorized administrators
- **Transparency**: All matches are publicly verifiable on-chain

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