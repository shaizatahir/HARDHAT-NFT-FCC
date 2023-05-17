const { network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { ethers } = require("ethers");
// VRFCoordinator Constructor
const BASE_FEE = ethers.utils.parseEther("0.25"); // 0.25 is the premium. It costs 0.25 Link per request.
const GAS_PRICE_LINK = 1e9; // = 1000000000 // Link per gas. Calculated value based on the gas price of the chain.
// // ETH price $1,000,000,000
// // Chainlink node pay the gas fees to give us randomness & do external execution
// // so the price of request changes based on the price of gas

// MockV3Aggregator Constructor
const DECIMALS = "18";
const INITIAL_PRICE = ethers.utils.parseUnits("2000", "ether")

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const args = [BASE_FEE, GAS_PRICE_LINK];

  if (developmentChains.includes(network.name)) {
    log("Local network detected...");
    await deploy("VRFCoordinatorV2Mock", {
      from: deployer,
      log: true,
      args: args,
    });
    await deploy("MockV3Aggregator", {
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_PRICE],
    });
    log("Mocks Depoyed");
    log("----------------------------------------");
  }
};
module.exports.tags = ["all", "mocks"];
