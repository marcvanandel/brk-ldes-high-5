import Client from "@triply/triplydb";
import * as fs from "fs-extra";
require("source-map-support/register");
require("dotenv").config();

if (!process.env["TRIPLYDB_TOKEN"]){
  throw new Error("Must set TRIPLYDB_TOKEN environment variable. Obtain a token from a TriplyDB instance.")
}
const client = Client.get({ token: process.env["TRIPLYDB_TOKEN"] });
async function run() {
  console.log((await (await client.getUser()).getInfo()).accountName);
  const CONTEXT = {
    "@base": "https://kadaster.nl/id/",
    "@version": 1.1,
    "@vocab": "https://kadaster.nl/def/",
    aggregateIdentifier: "@id",
    type: "@type",
  };
  let jsonContent = JSON.parse(
    await fs.readFileSync("../prep-test-data/json/achtergrond.json", "utf-8")
  );
  jsonContent = jsonContent.map((item: any) => {
    item["@context"] = CONTEXT;
    return item;
  });
  const jsonld = "../prep-test-data/json-ld/achtergrond.json-ld";
  await fs.writeFileSync(jsonld, JSON.stringify(jsonContent));
  const account = await client.getAccount("bob-scheer");
  const dataset = await account.getDataset("ldeshigh5");
  await dataset.importFromFiles([jsonld]);
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
