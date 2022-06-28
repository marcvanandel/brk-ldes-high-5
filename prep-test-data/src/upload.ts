import Client from "@triply/triplydb";
import * as fs from "fs-extra";

require("dotenv").config();

if (!process.env["TRIPLYDB_TOKEN"]) {
  throw new Error(
    "Must set TRIPLYDB_TOKEN environment variable. Obtain a token from a TriplyDB instance."
  );
}

const client = Client.get({ token: process.env["TRIPLYDB_TOKEN"] });

export async function delay(ms: any) {
  return await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function upload(sourceFolder: string, msDelay: number = 0) {
  // Get the files as an array
  const files = await fs.promises.readdir(sourceFolder);

  // use account
  const account = await client.getAccount("high-5-ldes");

  // select dataset
  const dataset = await account.getDataset("koers");

  // upload to dataset
  if (msDelay == 0) {
    console.log(`uploading files (without delay)`);
    // await dataset.importFromFiles(files, { overwriteAll: true });
  } else {
    for (const file of files) {
      let curFile = `${sourceFolder}/${file}`;
      console.log(curFile);
      await dataset.importFromFiles([curFile], { overwriteAll: true });
      await delay(msDelay);
    }
  }
}
