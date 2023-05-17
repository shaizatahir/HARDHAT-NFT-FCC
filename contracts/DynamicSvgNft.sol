//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "base64-sol/base64.sol";

error ERC721Metadata__URI_QueryFor_NonExistentToken();

contract DynamicSvgNft is ERC721 {
    string private s_lowImageURI;
    string private s_highImageURI;
    uint256 private s_tokenCounter;
    // mint
    // store our svg information somewhere
    // some logic to say "Show X Image" or "Show Y Image"
    AggregatorV3Interface internal immutable i_priceFeed;
    mapping(uint256 => int256) private s_tokenIdToHighValues;
    event CreatedNFT(uint256 indexed tokenId, int256 highValue);

    constructor(address priceFeedAddress, string memory lowSvg, string memory highSvg) ERC721("Dynamic SVG NFT", "DSN") {
        s_tokenCounter = 0;
        i_priceFeed = AggregatorV3Interface(priceFeedAddress);
        s_lowImageURI = svgToImageURI(lowSvg);
        s_highImageURI = svgToImageURI(highSvg);
    }

    function mint(int256 highValue) public {
        s_tokenIdToHighValues[s_tokenCounter] = highValue;
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenCounter = s_tokenCounter + 1;
        emit CreatedNFT(s_tokenCounter, highValue);
    }
    // 1. abi.encode -- concatenate string ,encodes into bytes form
    // 2. abi.encodePacked -- concatenate string in short form, take less gas (to save space)
    // 3. abi.decode --It works on encode but not on encodePacked, decode back bytes form data into string form
    // 4. abi.encodeWithSelector
    // 4. abi.encodeWithSignature
    function svgToImageURI(string memory svg) public pure returns (string memory) {
        string memory baseURL = "data:image/svg+xml;base64,";
        string memory svgBase64Encoded = Base64.encode(bytes(string(abi.encodePacked(svg))));
        return string(abi.encodePacked(baseURL, svgBase64Encoded));
    }
    function _baseURI() internal pure override returns (string memory) {
        return "data:application/json;base64,";
    }
    function tokenURI(uint256 tokenId) public view virtual override returns(string memory) {
        if(!_exists(tokenId)){
            revert ERC721Metadata__URI_QueryFor_NonExistentToken();
        }
        (, int256 price, , , ) = i_priceFeed.latestRoundData();
        string memory imageURI = s_lowImageURI;
        if(price >= s_tokenIdToHighValues[tokenId]){
            imageURI = s_highImageURI;
        }
        return string(abi.encodePacked(_baseURI(), Base64.encode(bytes(abi.encodePacked('{"name":"',
                                name(), // You can add whatever name here
                                '", "description":"An NFT that changes based on the Chainlink Feed", ',
                                '"attributes": [{"trait_type": "coolness", "value": 100}], "image":"',
                                imageURI,
                                '"}')))));
    }
    function getLowSvg() public view returns (string memory) {
        return s_lowImageURI;
    }
    function getHighSvg() public view returns (string memory) {
        return s_highImageURI;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return i_priceFeed;
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
}

 // Dynamic Svg Nft deployed at: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0