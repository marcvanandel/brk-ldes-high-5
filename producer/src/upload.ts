import Client from "@triply/triplydb";
import * as fs from "fs-extra";

require("dotenv").config();

if (!process.env["TRIPLYDB_TOKEN_KADASTER"]) {
  throw new Error(
    "Must set TRIPLYDB_TOKEN_KADASTER environment variable. Obtain a token from a TriplyDB instance."
  );
}

const client = Client.get({ token: process.env["TRIPLYDB_TOKEN_KADASTER"] });

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

      const content = await fs.readJson(file);
      content['data'] = (content['data']).map((event:any)=>{
        event['timestamp'] = new Date().toISOString();
        return event;
      }); 
      await fs.writeJson(file, content);
      console.log(`Uploading ${file} ...`);
      await dataset.importFromFiles([file]);
      for await (let service of dataset.getServices()){
        console.log(`Updating SPARQL service ${(await service.getInfo()).name} ...`)
        await service.update();
      } 
      console.log("Waiting for",msDelay/1000 ,'seconds...');
      await delay(msDelay);
    }
  }
}
