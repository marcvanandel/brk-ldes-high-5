import * as he from "he";
import * as fs from "node:fs";
import * as txml from "txml";
import { KoersEvent } from "./KoersEvent";

function parse(xml: string) {
  return txml.parse(xml, { simplify: true });
}

function convert(sourceFilename: string, targetFilename: string) {

  console.log(`reading xml file: ${sourceFilename}.`);
  const xml = fs.readFileSync(`xml/${sourceFilename}`, "utf8");

  console.log('parse xml file.');
  const json = parse(xml);
  
  const eventsArray = json.events.event as Array<KoersEvent>;
  
  console.log('converting inner bodies (metaData, payload).');
  const events = eventsArray.map((e) => {
    var temp = Object.assign({}, e);
    temp.metaData = parse(he.decode(e.metaData));
    temp.payload = parse(he.decode(e.payload));
    return temp;
  });
  
  console.log(`writing json file: ${targetFilename}.`);
  fs.writeFileSync(`output/${targetFilename}`, JSON.stringify(events), "utf8");
  
  console.log('done.');
}

convert('achtergrond.xml', 'achtergrond.json');
convert('events1.xml', 'events1.json');
