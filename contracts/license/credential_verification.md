
## Contract Architecture

The contract is designed with a modular structure following Sui's object-centric model:

1. **Objects**:
   - `Credential`: User-owned object representing a submitted credential
   - `VerifierRegistry`: Shared object storing authorized verifiers
   - `AdminCap`: Capability object for administrative functions
   - `VoteRecord`: Internal structure for tracking votes

2. **Access Control**:
   - Admin capability for registry management
   - Verifier registry for vote authorization
   - User authentication via transaction context

3. **Events**:
   - `CredentialSubmitted`: For frontend notification of new credentials
   - `VoteSubmitted`: For tracking voting activity

This implementation provides the foundation for credential verification while meeting the specified requirements. The contract is ready for future enhancements like vote tallying and automatic verification status updates.## Contract Architecture

The contract is designed with a modular structure following Sui's object-centric model:

1. **Objects**:
   - `Credential`: User-owned object representing a submitted credential
   - `VerifierRegistry`: Shared object storing authorized verifiers
   - `AdminCap`: Capability object for administrative functions
   - `VoteRecord`: Internal structure for tracking votes

2. **Access Control**:
   - Admin capability for registry management
   - Verifier registry for vote authorization
   - User authentication via transaction context

3. **Events**:
   - `CredentialSubmitted`: For frontend notification of new credentials
   - `VoteSubmitted`: For tracking voting activity

This implementation provides the foundation for credential verification while meeting the specified requirements. The contract is ready for future enhancements like vote tallying and automatic verification status updates.