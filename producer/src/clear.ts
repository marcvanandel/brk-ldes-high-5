import Client from "@triply/triplydb";

export async function run() {
  const client = Client.get({ token: process.env["TRIPLYDB_TOKEN_KADASTER"] });
  const account = await client.getAccount("high-5-ldes");
  const dataset = await account.getDataset("koers");
  await dataset.clear("graphs");
}

run().catch(console.error)