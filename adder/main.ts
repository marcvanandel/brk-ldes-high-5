import Client from "@triply/triplydb";
import * as fs from "fs-extra";
require("source-map-support/register");
require("dotenv").config();

if (!process.env["TRIPLYDB_TOKEN"]) {
  throw new Error(
    "Must set TRIPLYDB_TOKEN environment variable. Obtain a token from a TriplyDB instance."
  );
}

const CONTEXT_PATH = "../prep-test-data/context-json-ld/context.jsonld";
const DATA_PATH = "../prep-test-data/json/achtergrond.json";
const OUTPUT_PATH = "../prep-test-data/json-ld/achtergrond.jsonld";

const client = Client.get({ token: process.env["TRIPLYDB_TOKEN"] });

async function run() {
  const background_files:string[] = [] 
  const context = await fs.readJson(CONTEXT_PATH);
  const data = await fs.readJson(DATA_PATH);
  const jsonLd = { "@context": context, data: data };
  await fs.writeJson(OUTPUT_PATH, jsonLd);
  const account = await client.getAccount("high-5-ldes");
  const dataset = await account.getDataset("koers");

  fs.readdirSync("../prep-test-data/json-ld").forEach(file => {
    if (file.startsWith('achtergrond')){
      background_files.push("../prep-test-data/json-ld/"+file)
    };
  });
  
  console.log(background_files);
  await dataset.importFromFiles(background_files,{overwriteAll:true});
}

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
