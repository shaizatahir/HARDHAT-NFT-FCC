const { ethers, network } = require("hardhat");

module.exports = async ({ getNamedAccounts }) => {
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  // Basic Nft
  const basicNft = await ethers.getContract("BasicNft", deployer);
  const basicMinNft = await basicNft.mintNft();
  await basicMinNft.wait(1);
  console.log(`Basic NFT index 0 tokenURI: ${await basicNft.tokenURI(0)}`);

  // Dynamic SVG NFT
  const highValue = await ethers.utils.parseEther("4000");
  const dynamicNft = await ethers.getContract("DynamicSvgNft", deployer);
  const dynamicNftMintTx = await dynamicNft.mint(highValue);
  await dynamicNftMintTx.wait(1);
  console.log(
    `Dynamic SVG NFT index 0 tokenURI: ${await dynamicNft.tokenURI(0)}`
  );

  // Random Ipfs Nft
  const randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer);
  const mintFee = await randomIpfsNft.getMintFee();
  const randomIpfsNftMintTx = await randomIpfsNft.requestNft({
    value: mintFee.toString(),
  });
  const randomIpfsNftMintTxReceipt = await randomIpfsNftMintTx.wait(1);
  // Need to listen for response
  await new Promise(async (resolve, reject) => {
    setTimeout(() => reject("Timeout: 'NFTMinted' event did not fire"), 300000); // 5 minute timeout time
    // setup listener for our event
    randomIpfsNft.once("NftMinted", async () => {
      console.log(
        `Random IPFS NFT index 0 tokenURI: ${await randomIpfsNft.tokenURI(0)}`
      );
      resolve();
    });
    if (chainId == 31337) {
      const requestId =
        randomIpfsNftMintTxReceipt.events[1].args.requestId.toString();
      const vrfCoordinatorV2Mock = await ethers.getContract(
        "VRFCoordinatorV2Mock",
        deployer
      );
      await vrfCoordinatorV2Mock.fulfillRandomWords(
        requestId,
        randomIpfsNft.address
      );
    }
  });
};
module.exports.tags = ["all", "mint"];
