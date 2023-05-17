// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract BasicNft is ERC721 {
    string public constant TOKEN_URI =
        "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json";
    uint256 private s_tokeCounter;
    constructor() ERC721("Dogie", "DOG") {
        s_tokeCounter = 0;

    }

    function mintNft() public returns (uint256){
        _safeMint(msg.sender, s_tokeCounter);
        s_tokeCounter = s_tokeCounter + 1;
        return s_tokeCounter;
    }
    function tokenURI(uint256 /*tokenId */) public view override returns (string memory) {
        return TOKEN_URI;
    }
    function getTokenCounter() public view returns(uint256) {
        return s_tokeCounter;
    }
    
}

// Basic Nft deployed at 0x5FbDB2315678afecb367f032d93F642f64180aa3