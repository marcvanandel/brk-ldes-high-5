import * as fs from "fs-extra";

async function convert(sourceFilename: string, targetFilename: string) {
  console.log(`reading json file: ${sourceFilename}.`);
  const data = await fs.readJson(sourceFilename, "utf8");

  const contextFilename = "json-ld/context.jsonld";
  console.log(`reading context file: ${contextFilename}`);
  const context = await fs.readJson(contextFilename);

  console.log("converting to LD.");
  const jsonLd = { "@context": context, data: data };

  console.log(`writing jsonLD file: ${targetFilename}.`);
  await fs.writeJson(targetFilename, jsonLd, "utf8");

  console.log("done.");
}

convert("json/achtergrond.json", "json-ld/achtergrond.jsonld").catch((e) => {
  console.error(e);
  process.exit(1);
});

convert("json/events1.json", "json-ld/events1.jsonld").catch((e) => {
  console.error(e);
  process.exit(1);
});
