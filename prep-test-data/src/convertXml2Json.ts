import * as he from "he";
import * as fs from "node:fs";
import * as txml from "txml";
import { KoersEventMessage } from "./KoersEventMessage";

function parse(rawxml: string) {
  const xml = txml.parse(rawxml, { simplify: true });
  delete xml["?xml"];
  return xml;
}

function convert(sourceFilename: string, targetFilename: string) {
  console.log(`reading xml file: ${sourceFilename}.`);
  const xml = fs.readFileSync(sourceFilename, "utf8");

  console.log("parse xml file.");
  const json = parse(xml);

  const eventsArray = json.events.event as Array<KoersEventMessage>;

  console.log("converting inner bodies (metaData, payload).");
  const events = eventsArray.map((e) => {
    var temp = Object.assign({}, e);
    temp.metaData = parse(he.decode(e.metaData));
    temp.payload = parse(he.decode(e.payload));
    return temp;
  });

  console.log(`writing json file: ${targetFilename}.`);
  fs.writeFileSync(targetFilename, JSON.stringify(events), "utf8");

  console.log("done.");
}

convert("xml/achtergrond.xml", "json/achtergrond.json");
convert("xml/events1.xml", "json/events1.json");
