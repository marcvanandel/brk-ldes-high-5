import {
  EventStream,
  LDESClient,
  newEngine,
  State,
} from "@treecg/actor-init-ldes-client";

import Client from "@triply/triplydb";
import * as fs from "fs-extra";

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
    let LDESClient = newEngine() as LDESClient;

    console.log(`subscribing to url: [${this.url}]`);
    if (this.previousState === undefined || this.previousState === null) {
      // if you don't have a previous state, the created EventStream will start from scratch
      this.eventstreamSync = LDESClient.createReadStream(
        this.url,
        this.options
      );
    } else {
      // if you have a previous state, use it to create the EventStream
      this.eventstreamSync = LDESClient.createReadStream(
        this.url,
        this.options,
        this.previousState
      );
    }
  }

  async listen() {
    let eventstreamSync: EventStream;
    if (this.eventstreamSync === undefined) {
      return;
    } else {
      eventstreamSync = this.eventstreamSync;
    }
    console.log(process.env['TRIPLYDB_TOKEN_PLDN'])
    // If the run takes longer than x minutes, pause the LDES Client
    const timeoutms = 3600000; // amount of milliseconds before timeout
    const timeout = setTimeout(() => this.eventstreamSync?.pause(), timeoutms);
    const client = Client.get({ token: process.env['TRIPLYDB_TOKEN_PLDN']});
    // use account
    const account = await client.getAccount("high-5-ldes");

    // select dataset
    const dataset = await account.getDataset("koers");

    let counter = 1;
    eventstreamSync.on("data",  (member) => {
      eventstreamSync.pause();
      const filename = `temporary-file-${counter}.jsonld`;
      fs.writeFileSync(filename, member);
      dataset.importFromFiles([filename]).then(()=>{eventstreamSync.resume()});
    });


    // eventstreamSync.on("metadata", (metadata) => {
    //   if (metadata.treeMetadata)
    //     // follows the TREE metadata extractor structure (https://github.com/TREEcg/tree-metadata-extraction#extracted-metadata)
    //     console.log(metadata.treeMetadata);
    //   console.log(metadata.url); // page from where metadata has been extracted
    // });

    eventstreamSync.on("now only syncing", () => {
      // All known pages have been fetched at least once when receiving this event.
      // This would be the point where we receive the `end` event in the `"disableSynchronization": true` equivalent
      timeout.unref();
      eventstreamSync.pause();
    });

    eventstreamSync.on("pause", () => {
      // Export current state, but only when paused!
      let state = eventstreamSync.exportState();
      // Save state here to reuse in a later run (e.g. save as a json file on disk)
    });

    eventstreamSync.on("end", () => {
      timeout.unref();
      console.log("No more data!");
    });
  }
}
