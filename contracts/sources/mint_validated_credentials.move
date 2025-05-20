module skillsverse::mint_validated_credentials {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use sui::kiosk::{Self, Kiosk};
    use sui::dynamic_field as df;
    use sui::vector;
    
    use skillsverse::credential_verification::{Self, Credential};
    
    // Error codes
    const EUnverifiedCredential: u64 = 0;
    const ENotOwner: u64 = 1;
    const EInvalidInput: u64 = 2;
    const EAlreadyMinted: u64 = 3;
    const ENotAdmin: u64 = 4;
    
    // Events
    /// Emitted when an NFT is minted for a verified credential
    struct NFTMinted has copy, drop {
        nft_id: address,
        owner_address: address,
        credential_id: address,
        metadata_uri: vector<u8>
    }
    
    /// Administrator capability for configuring contract settings
    struct AdminCap has key, store {
        id: UID,
    }
    
    /// Registry for tracking minted NFTs to prevent duplicates
    struct MintRegistry has key {
        id: UID,
    }
    
    /// Represents a credential minted as an NFT
    struct NFTCredential has key, store {
        id: UID,
        owner_address: address,
        metadata_uri: vector<u8>,
        credential_id: address,
        is_transferable: bool,
    }
    
    /// One-Time Witness for package initialization
    struct MINT_VALIDATED_CREDENTIALS has drop {}
    
    /// Initializes the Minting Validated Credentials system
    fun init(witness: MINT_VALIDATED_CREDENTIALS, ctx: &mut TxContext) {
        // Create admin capability for the deployer
        let admin_cap = AdminCap {
            id: object::new(ctx),
        };
        
        // Create mint registry to track minted NFTs and prevent duplicates
        let registry = MintRegistry {
            id: object::new(ctx),
        };
        
        // Transfer admin capability to transaction sender
        transfer::transfer(admin_cap, tx_context::sender(ctx));
        
        // Share mint registry as a shared object
        transfer::share_object(registry);
    }
    
    /// Mints an NFT for a verified credential
    public entry fun mint_nft(
        registry: &mut MintRegistry,
        credential: &Credential,
        metadata_uri: vector<u8>,
        is_transferable: bool,
        kiosk: &mut Kiosk,
        ctx: &mut TxContext
    ) {
        // Validate inputs
        assert!(vector::length(&metadata_uri) > 0, EInvalidInput);
        
        // Check credential ownership
        let sender = tx_context::sender(ctx);
        let credential_owner = credential_verification::get_user_address(credential);
        assert!(sender == credential_owner, ENotOwner);
        
        // Check if credential is verified
        assert!(credential_verification::is_verified(credential), EUnverifiedCredential);
        
        // Get credential ID
        let credential_id = object::uid_to_address(&credential_verification::get_id(credential));
        
        // Check if credential has already been minted
        assert!(!df::exists_(&registry.id, credential_id), EAlreadyMinted);
        
        // Create NFT credential
        let nft = NFTCredential {
            id: object::new(ctx),
            owner_address: sender,
            metadata_uri,
            credential_id,
            is_transferable,
        };
        
        // Get NFT ID for events and tracking
        let nft_id = object::uid_to_address(&nft.id);
        
        // Mark credential as minted in registry
        df::add(&mut registry.id, credential_id, true);
        
        // Emit NFT minted event
        event::emit(NFTMinted {
            nft_id,
            owner_address: sender,
            credential_id,
            metadata_uri
        });
        
        // Place NFT in user's kiosk
        kiosk::place(kiosk, nft);
    }
    
    /// Creates a kiosk for a user if they don't have one yet
    public entry fun create_user_kiosk(ctx: &mut TxContext) {
        let (kiosk, kiosk_cap) = kiosk::new(ctx);
        transfer::transfer(kiosk_cap, tx_context::sender(ctx));
        transfer::share_object(kiosk);
    }
    
    /// Allows admin to set global transferability default
    public entry fun set_global_transferability(
        registry: &mut MintRegistry,
        default_transferable: bool,
        _admin_cap: &AdminCap,
        _ctx: &mut TxContext
    ) {
        // Add default transferability setting to the registry
        if (df::exists_(&registry.id, b"default_transferable")) {
            let value = df::borrow_mut(&mut registry.id, b"default_transferable");
            *value = default_transferable;
        } else {
            df::add(&mut registry.id, b"default_transferable", default_transferable);
        }
    }
    
    /// Returns the default transferability setting
    public fun get_default_transferability(registry: &MintRegistry): bool {
        if (df::exists_(&registry.id, b"default_transferable")) {
            *df::borrow(&registry.id, b"default_transferable")
        } else {
            false // Default to non-transferable if not set
        }
    }
    
    /// Returns the NFT metadata URI
    public fun get_metadata_uri(nft: &NFTCredential): vector<u8> {
        nft.metadata_uri
    }
    
    /// Returns the owner address of the NFT
    public fun get_owner_address(nft: &NFTCredential): address {
        nft.owner_address
    }
    
    /// Returns the credential ID associated with the NFT
    public fun get_credential_id(nft: &NFTCredential): address {
        nft.credential_id
    }
    
    /// Returns if the NFT is transferable
    public fun is_transferable(nft: &NFTCredential): bool {
        nft.is_transferable
    }
    
    /// Checks if a credential has been minted as an NFT
    public fun is_credential_minted(registry: &MintRegistry, credential_id: address): bool {
        df::exists_(&registry.id, credential_id)
    }
    
    #[test_only]
    /// Initialize function accessible in tests
    public fun test_init(ctx: &mut TxContext) {
        init(MINT_VALIDATED_CREDENTIALS {}, ctx)
    }
}