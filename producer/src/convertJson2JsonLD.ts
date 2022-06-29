import * as fs from "fs-extra";
import * as path from "path";

const contextFilename = "context-json-ld/context.jsonld";
console.log(`reading context file: ${contextFilename}`);
const context = fs.readJsonSync(contextFilename);

async function convert(
  sourceFilename: string,
  targetFilename: string,
  log: boolean = false
) {
  if (log) console.log(`reading json file: ${sourceFilename}.`);
  const data = await fs.readJson(sourceFilename, "utf8");

  if (log) console.log("converting to LD.");
  const jsonLd = { "@context": context, data: data };

  if (log) console.log(`writing jsonLD file: ${targetFilename}.`);
  await fs.writeJson(targetFilename, jsonLd, "utf8");

  if (log) console.log("done.");
}

function loopConvert(sourceFolder: string, targetFolder: string) {
  (async () => {
    // Our starting point
    try {
      fs.mkdirSync(targetFolder, { recursive: true });

      // Get the files as an array
      const files = await fs.promises.readdir(sourceFolder);

      // Loop them all with the new for...of
      for (const file of files) {
        // Get the full paths
        const fromPath = path.join(sourceFolder, file);
        const toPath = path.join(targetFolder, file.concat("ld"));

        // Now move async
        await convert(fromPath, toPath);

        // Log because we're crazy
        console.log("converted '%s'->'%s'", fromPath, toPath);
      } // End for...of
    } catch (e) {
      // Catch anything bad that happens
      console.error("We've thrown! Whoops!", e);
    }
  })(); // Wrap in parenthesis and call now
}

loopConvert("output/achtergrond", "output/achtergrond-ld");
loopConvert("output/events", "output/events-ld");

// convert("json/achtergrond.json", "json-ld/achtergrond.jsonld").catch((e) => {
//   console.error(e);
//   process.exit(1);
// });

// convert("json/events1.json", "json-ld/events1.jsonld").catch((e) => {
//   console.error(e);
//   process.exit(1);
// });
