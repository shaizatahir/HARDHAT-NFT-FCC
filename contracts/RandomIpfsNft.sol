//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// when we mint an NFT, we will trigger a Chainlink vrf call to get us a random number
// using that random number , we will get a random NFT 
// pug, Shiba Inu, St.Bernard
// pug, super rare
// Shiba Inu, sort of rare
// St.Bernard, common

// users have to pay to mint an NFT
// the owner of the contract can withdraw the ETH

error RandomIpfsNft__RangeOutOfBounds();
error RandomIpfsNft__NeedMoreEthSent();
error RandomIpfsNft__TransferFailed();


contract RandomIpfsNft is VRFConsumerBaseV2, ERC721URIStorage, Ownable {
    // Type Declarations
    enum Breed {
        PUG,
        SHIBA_INU,
        ST_BERNARD
    }

    VRFCoordinatorV2Interface immutable i_vrfCoordinator;
    uint64 private immutable s_subscriptionId;
    bytes32 private immutable i_keyHash;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    // Vrf Helpers
    mapping (uint => address) s_requestIdToSender;

    // Events
    event NftRequested(uint256 indexed requestId, address requester);
    event NftMinted(Breed dogBreed, address minter);

    // NFT variables
    uint256 public s_tokenCounter;
    uint256 internal constant MAX_CHANCE_VALUE = 100;
    string[] internal s_tokenUris;
    uint256 internal immutable i_mintFee;

    constructor(address vrfCoordinator,
     uint64 subscriptionId,
     bytes32 keyHash,
     uint32 callbackGasLimit,
     string[3] memory tokenUris,
     uint256 mintFee
     ) 
     VRFConsumerBaseV2(vrfCoordinator)
     ERC721("Random Ipfs Nft", "RIN") {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinator);
        s_subscriptionId = subscriptionId;
        i_keyHash = keyHash;
        i_callbackGasLimit = callbackGasLimit;
        s_tokenUris = tokenUris;
        i_mintFee = mintFee;
        s_tokenCounter = 0;

    }

    function requestNft() public payable returns (uint256 requestId) {
        if(msg.value < i_mintFee){
            revert RandomIpfsNft__NeedMoreEthSent();
        }
        requestId = i_vrfCoordinator.requestRandomWords(
            i_keyHash,
            s_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        s_requestIdToSender[requestId] = msg.sender;
        emit NftRequested(requestId, msg.sender);

    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        address dogNftOwner = s_requestIdToSender[requestId];
        uint256 newItemId = s_tokenCounter;

        uint256 modedRange = randomWords[0] % MAX_CHANCE_VALUE;
        Breed dogBreed = getBreedFromModedRng(modedRange);
        s_tokenCounter += s_tokenCounter;
        _safeMint(dogNftOwner, newItemId);
        // tokenURI
        _setTokenURI(newItemId, s_tokenUris[uint256(dogBreed)]);
        emit NftMinted(dogBreed, dogNftOwner);
 
    }

    function getBreedFromModedRng(uint256 modedRange) public pure returns (Breed) {
        uint256 cumulativeSum = 0;
        uint256[3] memory chanceArray = getChanceArray();
        for (uint256 i = 0; i < chanceArray.length; i++) {
            if(modedRange > cumulativeSum && modedRange < chanceArray[i]){
                return Breed(i);
            }
            cumulativeSum = chanceArray[i];
        }
        revert RandomIpfsNft__RangeOutOfBounds();
    }

    function getChanceArray() public pure returns (uint256[3] memory) {
        return [10, 40, MAX_CHANCE_VALUE];
            // Pug = 0 - 9  (10%)
            // Shiba-inu = 10 - 39  (30%)
            // St. Bernard = 40 = 99 (60%)
    }

    function withdraw() public onlyOwner {
        uint256 amount = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if(!success) {
            revert RandomIpfsNft__TransferFailed();
        }
    }

    function getMintFee() public view returns (uint256) {
        return i_mintFee;
    }

    function getDogTokenUris(uint256 index) public view returns (string memory) {
        return s_tokenUris[index];

    }

    function getTokenCounter() public view returns (uint256) {
            return s_tokenCounter;
    }
}

// Deployed RandomIpfsNft at 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9