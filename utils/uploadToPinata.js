const pinataSDK = require("@pinata/sdk");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

console.log("starting..");
const pinataApiKey = process.env.PINATA_API_KEY;
const pinataApiSecret = process.env.PINATA_API_SECRET;
const pinata = new pinataSDK(pinataApiKey, pinataApiSecret);
console.log("hey..");

async function storeImages(imagesFilePath) {
  const fullImagesPath = path.resolve(imagesFilePath);
  console.log("fullImagePath =>", fullImagesPath);
  const files = fs.readdirSync(fullImagesPath);
  console.log("files =>", files);
  let responses = [];
  console.log("Uploading to IPFS...");
  for (const fileIndex in files) {
    console.log(`Working on file ${fileIndex}...`);
    const readableStreamForFile = fs.createReadStream(
      `${fullImagesPath}/${files[fileIndex]}`
    );
    const options = {
      pinataMetadata: {
          name: files[fileIndex],
      },
  }
    // console.log("readableStreamForFile =>", readableStreamForFile);\

    try {
      // console.log("response =>", response);
      console.log("responses =>", responses);
      // pinata stuff
      // .pinFileToIPFS returns : IpfsHash, PinSize, Timestamp
      const response = await pinata.pinFileToIPFS(readableStreamForFile, options);
      responses.push(response);
      console.log("printing response...");
      console.log("reponse2 =>=>", response);
      console.log("responses2 =>", responses);
    } catch (error) {
      console.log(error);
    }
    console.log("printing...");
  }
  return { responses, files };
}

async function storeTokenUriMetadata(metadata){
  try {
    const response = await pinata.pinJSONToIPFS(metadata);
    return response;
  } catch (error) {
    console.log(error);
  }
  return null;
}
module.exports = { storeImages, storeTokenUriMetadata };
