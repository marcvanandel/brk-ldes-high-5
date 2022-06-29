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
  const files = (await fs.promises.readdir(sourceFolder)).map(filename=>sourceFolder+'/'+filename);

  // use account
  const account = await client.getAccount("high-5-ldes");

  // select dataset
  const dataset = await account.getDataset("koers");

  // upload to dataset
  if (msDelay == 0) {
    console.log(`uploading files (without delay)`);
    await dataset.importFromFiles(files);
    for await (let service of dataset.getServices()){
      await service.update();
    } 
  } else {
    for (const file of files) {
      console.log(`Uploading ${file}`);
      await dataset.importFromFiles([file]);
      for await (let service of dataset.getServices()){
        await service.update();
      } 
      await delay(msDelay);
    }
  }
}
