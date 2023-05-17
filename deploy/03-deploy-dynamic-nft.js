const { network } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
const fs = require("fs");
module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  let ethUsdPriceFeedAddress;
  if (developmentChains.includes(network.name)) {
    const EthUsdAggregator = await ethers.getContract("MockV3Aggregator");
    ethUsdPriceFeedAddress = EthUsdAggregator.address;
  } else {
    ethUsdPriceFeedAddress = await networkConfig[chainId].ethUsdPriceFeed;
  }
  const lowSvg = fs.readFileSync("./images/dynamicNft/sad.svg", {
    encoding: "utf-8",
  });
  const highSvg = fs.readFileSync("./images/dynamicNft/happy.svg", {
    encoding: "utf-8",
  });

  const args = [ethUsdPriceFeedAddress, lowSvg, highSvg];

  const dynamicSvgNft = await deploy("DynamicSvgNft", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmation: network.config.blockConfirmations || 1,
  });
  log("----------- Deployed DynamicSvgNft -----------");
  if (
    !developmentChains.includes(network.name) &&
    process.env.POLYGONSCAN_API_KEY
  ) {
    log("Verifying...");
    await verify(dynamicSvgNft.address, args);
  }
  console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
};
module.exports.tags = ["all", "dynamicsvg", "main"];
