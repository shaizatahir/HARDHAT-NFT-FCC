// const { assert } = require("chai");
// const { network, deployments, ethers } = require("hardhat");
// const { developmentChains } = require("../helper-hardhat-config");

// !developmentChains.includes(network.name)
//   ? describe.skip
//   : describe("Basic Nft Unit Test", function () {
//       console.log("");
//       let deployer, basicNft, accounts;
//       beforeEach(async () => {
//        // console.log(ethers);
//         accounts = await ethers.getSigners();
//         //console.log(accounts);
//         deployer = accounts[0];
//         await deployments.fixture(["basicNft"]);
//         basicNft = await ethers.getContract("BasicNft");
//       });
//       describe("Constructor", function () {
//         it("initializes correctly", async function () {
//           console.log("hello");
//           const name = await basicNft.name();
//           const symbol = await basicNft.symbol();
//           const tokenCounter = await basicNft.getTokenCounter();
//           assert.equal(name, "Dogie");
//           assert.equal(symbol, "DOG");
//           assert.equal(tokenCounter.toString(), '0');
//         });
//       });

//       describe("Mint Nft", function () {
//         beforeEach(async function () {
//           const txResponse = await basicNft.mintNft();
//           await txResponse.wait(1);
//         });
//         it("Allows users to mint an NFT, and updates appropriately", async function () {
//           const tokenURI = await basicNft.tokenURI(0);
//           const tokenCounter = await basicNft.getTokenCounter();

//           assert.equal(tokenURI, await basicNft.TOKEN_URI());
//           assert.equal(tokenCounter.toString(), '1');
//         });
//         it("Show the correct balance and owner of an NFT", async function () {
//           const deployerAddress = deployer.address;
//           const balanceOfDeployer = await basicNft.balanceOf(deployerAddress);
//           const owner = await basicNft.ownerOf("0");

//           assert.equal(owner, deployerAddress);
//           assert.equal(balanceOfDeployer.toString(), '1');
//         });
//       });
//     });
