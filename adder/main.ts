import Client from "@triply/triplydb";
import * as fs from "fs-extra";
require("source-map-support/register");
require("dotenv").config();

if (!process.env["TRIPLYDB_TOKEN"]) {
  throw new Error(
    "Must set TRIPLYDB_TOKEN environment variable. Obtain a token from a TriplyDB instance."
  );
}

const client = Client.get({ token: process.env["TRIPLYDB_TOKEN"] });

async function delay(ms:any) {
  return await new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  const background_files:string[] = [] 

  const account = await client.getAccount("high-5-ldes");
  const dataset = await account.getDataset("koers");

  fs.readdirSync("../prep-test-data/output/achtergrond-ld").forEach(file => {
    if (file.startsWith('achtergrond')){
      background_files.push("../prep-test-data/output/achtergrond-ld/"+file)
    };
  });
  console.log(background_files);
  await dataset.importFromFiles(background_files);

  let run = async ()=>{
      const files = await fs.promises.readdir("../prep-test-data/output/events-ld");
      for( const file of files ) {
      if (file.startsWith('event')){
        let event = "../prep-test-data/output/events-ld/"+file
        console.log(event);
        await dataset.importFromFiles([event]);
        await delay(50);
      };
    };
  };
  run();
};


run().catch((e) => {
  console.error(e);
  process.exit(1);
});

process.on("uncaughtException", function (err) {
  console.error("Uncaught exception", err);
  process.exit(1);
});
process.on("unhandledRejection", (reason, p) => {
  console.error("Unhandled Rejection at: Promise", p, "reason:", reason);
  process.exit(1);
});
