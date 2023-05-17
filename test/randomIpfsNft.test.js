const { assert, expect } = require("chai");
const { developmentChains } = require("../helper-hardhat-config");
const { ethers, network, deployments } = require("hardhat");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Random Ipfs Nft unit test", () => {
      let deployer, randomIpfsNft, vrfCoordinatorV2Mock;
      beforeEach(async () => {
        accounts = await ethers.getSigners();
        deployer = await accounts[0];
        await deployments.fixture(["mocks", "randomipfs"]);
        randomIpfsNft = await ethers.getContract("RandomIpfsNft");
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
      });

      describe("constructor", () => {
        it("sets starting values correctly", async () => {
          const tokenUriZero = await randomIpfsNft.getDogTokenUris(0);
          assert(tokenUriZero.includes("ipfs://"));
          // will do it later
        });
      });
      describe("requestNft", () => {
        it("fails if payment isn't sent with the request", async () => {
          await expect(randomIpfsNft.requestNft()).to.be.revertedWith(
            "RandomIpfsNft__NeedMoreEthSent"
          );
        });
        it("reverts if payment amount is less than the mint fee", async () => {
          const fee = await randomIpfsNft.getMintFee();
          await expect(
            randomIpfsNft.requestNft({
              value: fee.sub(ethers.utils.parseEther("0.001")),
            })
          ).to.be.revertedWith("RandomIpfsNft__NeedMoreEthSent");
        });
        it("emits an event and kicks off a random word request", async () => {
          const fee = await randomIpfsNft.getMintFee();
          await expect(
            randomIpfsNft.requestNft({ value: fee.toString() })
          ).to.emit(randomIpfsNft, "NftRequested");
          // console.log(randomIpfsNft);
        });
      });
      describe("fulfillRandomwords", () => {
        it("mints NFT after random number is returned", async () => {
          await new Promise(async (reject, resolve) => {
            await randomIpfsNft.once("NftMinted", async () => {
              try {
                const tokenUri = await randomIpfsNft.tokenUris("0");
                const tokenCounter = await randomIpfsNft.getDogTokenUris();
                assert.equal(tokenUri.toString().includes("ipfs://"), true);
                assert.equal(tokenCounter.toString, "1");
                resolve();
              } catch (e) {
                console.log(e);
                reject(e);
              }
            });
            try {
              const fee = await randomIpfsNft.getMintFee();
              const requestNftResponse = await randomIpfsNft.requestNft({
                value: fee.toString(),
              });
              const requestNftReceipt = await requestNftResponse.wait(1);
              await vrfCoordinatorV2Mock.fulfillRandomWords(
                requestNftReceipt.events[1].args.requestId,
                randomIpfsNft.address
              );
            } catch (e) {
              console.log(e);
              reject(e);
            }
          });
        });
      });
      describe("getBreedFromModedRng", () => {
        it("should return pug if moddedRng < 10", async () => {
          const expectedValue = await randomIpfsNft.getBreedFromModedRng(7);
          assert.equal(0, expectedValue);
        });
        it("should return shiba-inu if moddedRng is between 10 - 39", async function () {
          const expectedValue = await randomIpfsNft.getBreedFromModedRng(21);
          assert.equal(1, expectedValue);
        });
        it("should return st. bernard if moddedRng is between 40 - 99", async function () {
          const expectedValue = await randomIpfsNft.getBreedFromModedRng(77);
          assert.equal(2, expectedValue);
        });
        it("should revert if moddedRng > 99", async function () {
          await expect(
            randomIpfsNft.getBreedFromModedRng(100)
          ).to.be.revertedWith("RandomIpfsNft__RangeOutOfBounds");
        });
      });
    });
