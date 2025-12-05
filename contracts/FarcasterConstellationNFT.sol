// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FarcasterConstellationNFT
 * @dev ERC-721 NFT contract for Farcaster social constellation visualizations
 */
contract FarcasterConstellationNFT is ERC721, ERC721URIStorage, Ownable {
    
    uint256 private _tokenIdCounter;
    
    // FID to Token ID mapping
    mapping(uint256 => uint256) public fidToTokenId;
    
    // Token ID to FID mapping
    mapping(uint256 => uint256) public tokenIdToFid;
    
    // Token ID to mint timestamp
    mapping(uint256 => uint256) public mintTimestamp;
    
    event ConstellationMinted(
        uint256 indexed tokenId,
        uint256 indexed fid,
        address indexed recipient,
        string tokenURI
    );
    
    constructor() ERC721("Farcaster Constellation", "FCON") Ownable(msg.sender) {
        _tokenIdCounter = 1; // Start from 1
    }
    
    /**
     * @dev Mint a new constellation NFT
     * @param recipient Address to receive the NFT
     * @param fid Farcaster ID of the central user
     * @param _tokenURI IPFS URI containing metadata
     */
    function mintConstellation(
        address recipient,
        uint256 fid,
        string memory _tokenURI
    ) public returns (uint256) {
        // require(fidToTokenId[fid] == 0, "FID already has a constellation"); // REMOVED: Allow multiple mints
        require(recipient != address(0), "Invalid recipient");
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        
        // fidToTokenId[fid] = tokenId; // REMOVED: 1-to-1 mapping no longer valid
        tokenIdToFid[tokenId] = fid;
        mintTimestamp[tokenId] = block.timestamp;
        
        emit ConstellationMinted(tokenId, fid, recipient, _tokenURI);
        
        return tokenId;
    }
    
    /**
     * @dev Update constellation metadata
     * @param tokenId Token ID to update
     * @param newTokenURI New IPFS URI
     */
    function updateConstellation(
        uint256 tokenId,
        string memory newTokenURI
    ) public onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        _setTokenURI(tokenId, newTokenURI);
    }
    
    /**
     * @dev Get token ID by FID (Deprecated: Users can now have multiple tokens)
     * @param fid Farcaster ID
     */
    /*
    function getTokenByFid(uint256 fid) public view returns (uint256) {
        uint256 tokenId = fidToTokenId[fid];
        require(tokenId != 0, "No constellation for this FID");
        return tokenId;
    }
    */
    
    /**
     * @dev Check if FID has a constellation (Deprecated)
     * @param fid Farcaster ID
     */
    /*
    function hasConstellation(uint256 fid) public view returns (bool) {
        return fidToTokenId[fid] != 0;
    }
    */
    
    /**
     * @dev Get total minted constellations
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter - 1;
    }
    
    // Override required functions
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
