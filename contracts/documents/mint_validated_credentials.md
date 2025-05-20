
## Contract Architecture

The Minting Validated Credentials Contract is designed with a modular architecture following Sui's object-centric model:

1. **Objects**:
   - `NFTCredential`: A non-transferable NFT representing a verified credential
   - `MintRegistry`: A shared object tracking minted credentials and configuration
   - `AdminCap`: A capability object for administrative functions

2. **Access Control**:
   - Credential ownership verification before minting
   - Verification status check via the Credential Verification Contract
   - Admin capability for global configuration

3. **External Integration**:
   - Integration with `credential_verification` module
   - IPFS for metadata storage
   - Sui's Kiosk system for NFT management

This implementation provides the foundation for credential minting while meeting the specified requirements. The contract ensures that only verified credentials can be minted and integrates with Sui's Kiosk system for NFT storage and display.## Contract Architecture

The Minting Validated Credentials Contract is designed with a modular architecture following Sui's object-centric model:

1. **Objects**:
   - `NFTCredential`: A non-transferable NFT representing a verified credential
   - `MintRegistry`: A shared object tracking minted credentials and configuration
   - `AdminCap`: A capability object for administrative functions

2. **Access Control**:
   - Credential ownership verification before minting
   - Verification status check via the Credential Verification Contract
   - Admin capability for global configuration

3. **External Integration**:
   - Integration with `credential_verification` module
   - IPFS for metadata storage
   - Sui's Kiosk system for NFT management

This implementation provides the foundation for credential minting while meeting the specified requirements. The contract ensures that only verified credentials can be minted and integrates with Sui's Kiosk system for NFT storage and display.