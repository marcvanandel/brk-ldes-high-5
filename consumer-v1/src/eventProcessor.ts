import {
  EventStream,
  LDESClient,
  newEngine,
  State,
} from "@treecg/actor-init-ldes-client";

import Client from "@triply/triplydb";
import * as fs from "fs-extra";

const client = Client.get({ token: process.env['TRIPLYDB_TOKEN_PLDN']});

type JSONValue = string | number | boolean | JSONObject | JSONArray;
interface JSONObject { [x: string]: JSONValue; }
interface JSONArray extends Array<JSONValue> { }

type JsonLD = JSONObject;

async function processEvent(event:JsonLD): Promise<JsonLD>{
  // TODO insert Marc's work here
  return event;
}

const tasks:Array<()=>Promise<void>> = [];

async function processTasks(){
  while (true){
    if (tasks.length > 0){
      console.info(`Picking up a task. Number of remaining tasks: ${tasks.length}`)
      const task = tasks.pop()!;
      await task()
    } 
    if (tasks.length === 0){
      // if there's no next task yet, wait half a second to avoid too busy waiting
      await new Promise((resolve)=>{
        setTimeout(resolve, 500);
      });
    }
  }
}

export class EventProcessor {
  // load previous state here (e.g. load from a json file on disk)
  // private previousState: State = {
  //   bookkeeper: {},
  //   memberBuffer: "",
  //   processedURIs: "",
  // };
  private previousState?: State = undefined;
  private eventstreamSync?: EventStream;

  constructor(
    private readonly url: string,
    private readonly options: Object = {
      emitMemberOnce: true,
      mimeType: "application/ld+json",
      disablePolling: true,
    }
  ) {}

  async subscribe() {
    console.log(`subscribing to url: [${this.url}]`);
    // if you don't have a previous state, the created EventStream will start from scratch
    // if you have a previous state, use it to create the EventStream
    this.eventstreamSync = newEngine().createReadStream(
      this.url,
      this.options, 
      this.previousState || undefined 
    );
  }

  async listen() {
    if (this.eventstreamSync === undefined) {
      console.warn("Event stream undefined, not listening");
      return;
    } 

    processTasks().catch((error)=>{
      console.error(error);
      process.exit(1);
    })

    const account = await client.getAccount("high-5-ldes");
    const dataset = await account.getDataset("koers");

    const tmpFile = `temporary-file.jsonld`;

    const eventstreamSync = this.eventstreamSync;

    eventstreamSync.on("data",  (member) => {
      
      // Here we push a task for processing the member (an LDES event) to a queue. 
      // Processing involves constructing output triples and pushing these to the triple-store. 
      // This queue is processed by an independent promise (a pseudo-thread). 
      // We originally tried a different approach, where we first pause()
      // the event stream, then do all processing, and then resume() it. 
      // However this didn't work, the event stream would not resume. 
      // Note that reading from the LDES service is faster than the processing of the task queue.
      // Therefore, the  

      tasks.push(
        async () => {
          try {
            const inputJsonLD = JSON.parse(member);
            const outputJsonLD = await processEvent(inputJsonLD);
            // Some meaningful/recognizable graph name derived from the data.
            // Here we use the IRI of the event. This field can also be left unspecified, 
            // in which case an automatically generated graph name is used. 
            const graphName = inputJsonLD["@id"] as string;
            await fs.writeJSON(tmpFile, outputJsonLD);
            await dataset.importFromFiles([tmpFile], {defaultGraphName: graphName});
            console.info(`Successfully uploaded graph for event ${graphName}.`);
          } catch (error){
            console.error(error);
            process.exit(1);
          }
        }
      );
    });

    eventstreamSync.on("now only syncing", () => {
      // All known pages have been fetched at least once when receiving this event.
      // This would be the point where we receive the `end` event in the `"disableSynchronization": true` equivalent
      eventstreamSync.pause();
    });

    eventstreamSync.on("pause", () => {
      // Export current state, but only when paused!
      let state = eventstreamSync.exportState();
      // Save state here to reuse in a later run (e.g. save as a json file on disk)
    });

    eventstreamSync.on("end", () => {
      console.log("No more data!");
    });
  }
}
