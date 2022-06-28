import * as he from "he";
import * as fs from "fs-extra";
import * as path from "path";
import * as txml from "txml";
import { KoersEventMessage } from "./KoersEventMessage";

function parse(rawxml: string) {
  const xml = txml.parse(rawxml, { simplify: true });
  delete xml["?xml"];
  return xml;
}

async function convert(
  sourceFilename: string,
  targetFilename: string,
  log: boolean = false
) {
  if (log) console.log(`reading xml file: ${sourceFilename}.`);
  const xml = fs.readFileSync(sourceFilename, "utf8");

  if (log) console.log("parse xml file.");
  const json = parse(xml);

  const eventsArray = json.events.event as Array<KoersEventMessage>;

  if (log) console.log("converting inner bodies (metaData, payload).");
  const events = eventsArray.map((e) => {
    var temp = Object.assign({}, e);
    temp.metaData = parse(he.decode(e.metaData));
    temp.payload = parse(he.decode(e.payload));
    return temp;
  });

  if (log) console.log(`writing json file: ${targetFilename}.`);
  fs.writeFileSync(targetFilename, JSON.stringify(events), "utf8");

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
        const toPath = path.join(targetFolder, file.slice(0, -3).concat("json"));

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

// convert("xml/achtergrond.xml", "json/achtergrond.json");
// convert("xml/events1.xml", "json/events1.json");
loopConvert("xml/achtergrond", "output/achtergrond");
loopConvert("xml/events", "output/events");
