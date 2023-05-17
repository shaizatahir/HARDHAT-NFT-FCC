const { network } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
const {
  storeImages,
  storeTokenUriMetadata,
} = require("../utils/uploadToPinata");
const imagesLocation = "./images/randomNft";
//require("dotenv").config();

const FUND_AMOUNT = "1000000000000000000000"; // 10 LINK

let tokenUris = [
  "ipfs://QmaVkBn2tKmjbhphU7eyztbvSQU5EXDdqRyXZtRhSGgJGo",
  "ipfs://QmYQC5aGZu2PTH8XzbJrbDnvhj3gVs7ya33H9mqUNvST3d",
  "ipfs://QmZYmH5iDbD6v3U2ixoVAjioSzvWJszDzYdbeCLquGSpVm",
];

const metadataTemplate = {
  name: "",
  description: "",
  image: "",
  attributes: [
    {
      trait_type: "Cuteness",
      value: 100,
    },
  ],
};

console.log("hello");
module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  // get the hashes of our images
  console.log("hello1");
  if (process.env.UPLOAD_TO_PINATA == "true") {
    tokenUris = await handleTokenUris();
  }
  console.log("helloo2");

  let vrfCoordinatorV2Address, subscriptionId, vrfCoordinatorV2Mock;
  // console.log(ethers);
  if (developmentChains.includes(network.name)) {
    vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
    console.log("hello3");
    vrfCoordinatorV2Address = await vrfCoordinatorV2Mock.address;
    console.log("hello4");
    const tx = await vrfCoordinatorV2Mock.createSubscription();
    console.log("hello5");
    const txReceipt = await tx.wait(1);
    console.log("hello6");
    // console.log(txReceipt);
    subscriptionId = txReceipt.events[0].args.subId;
    console.log("hello7");
    await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT);
  } else {
    vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"];
    subscriptionId = networkConfig[chainId]["subscriptionId"];
  }
  log("--------------------------------------");

  const args = [
    vrfCoordinatorV2Address,
    subscriptionId,
    networkConfig[chainId]["gasLane"],
    networkConfig[chainId]["callbackGasLimit"],
    tokenUris,
    networkConfig[chainId]["mintFee"],
  ];

  const randomIpfsNft = await deploy("RandomIpfsNft", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmation: network.config.blockConfirmation || 1,
  });
  log("----------- Deployed RandomIpfsNft -----------");
  // await vrfCoordinatorV2Mock.addConsumer(subscriptionId, randomIpfsNft.address);

  if (!developmentChains.includes(network.name) && process.env.POLYGONSCAN_API_KEY) {
    log("Verifying...");
    await verify(randomIpfsNft.address, args);
  }
  console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
  async function handleTokenUris() {
    tokenUris = [];
    // store the image in ipfs
    // store the metadata in ipfs
    const { responses: imageUploadResponses, files } = await storeImages(
      imagesLocation
    );
    for (let imageUploadResponseIndex in imageUploadResponses) {
      // create metadata
      // upload metadata
      let tokenUriMetadata = { ...metadataTemplate };
      tokenUriMetadata.name = files[imageUploadResponseIndex].replace(
        ".png",
        ""
      );
      tokenUriMetadata.description = `An adorable ${tokenUriMetadata.name} pup!`;
      tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`;
      console.log(`Uploading ${tokenUriMetadata.name}...`);
      const metadataUploadResponse = await storeTokenUriMetadata(
        tokenUriMetadata
      );
      tokenUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`);
    }
    console.log("Token Uris uploaded! they are:");
    console.log(tokenUris);

    return tokenUris;
  }
  console.log("******************************");
};
module.exports.tags = ["all", "randomipfs", "main"];
