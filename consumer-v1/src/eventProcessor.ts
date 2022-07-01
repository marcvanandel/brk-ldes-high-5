import { EventStream, newEngine, State } from "@treecg/actor-init-ldes-client";
import { BrkEventListener } from "./brk/BrkEventListener";

import Client from "@triply/triplydb";
import * as fs from "fs-extra";
import { Quad, Writer } from "n3";

const client = Client.get({ token: process.env["TRIPLYDB_TOKEN_PLDN"] });

const tasks: Array<() => Promise<void>> = [];

async function processTasks() {
  while (true) {
    if (tasks.length > 0) {
      // console.debug(
      //   `Picking up a task. Number of remaining tasks: ${tasks.length}`
      // );
      const task = tasks.shift()!;
      await task().catch((e) => {
        console.warn(e);
        process.exit(1);
      });
    }
    if (tasks.length === 0) {
      // if there's no next task yet, wait half a second to avoid too busy waiting
      await new Promise((resolve) => {
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
      loggingLevel: "warn",
    },
    private readonly brkEventListener: BrkEventListener = new BrkEventListener()
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

    processTasks().catch((error) => {
      console.error(error);
      process.exit(1);
    });

    const eventstreamSync = this.eventstreamSync;

    eventstreamSync.on("data", (member) => {
      tasks.push(async () => {
        try {
          const inputJsonLD = JSON.parse(member);
          // process into domain
          this.brkEventListener.process(inputJsonLD);
        } catch (error) {
          console.error(error);
          process.exit(1);
        }
      });
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
      this.previousState = state;
    });

    eventstreamSync.on("end", () => {
      tasks.push(async () => {
        try {
          console.log("No more data!");

          this.startUpload();
        } catch (error) {
          console.error(error);
          process.exit(1);
        }
      });
    });
  }

  async startUpload(): Promise<void> {
    tasks.push(async () => {
      try {
        console.log("Starting upload ...");

        const account = await client.getAccount("high-5-ldes");
        const dataset = await account.getDataset("koers");

        const tmpFile = `temporary-file.ttl`;

        const writer = new Writer();

        this.brkEventListener.writeState(writer);
        const serializedQuads: string = await new Promise((resolve, reject) => {
          writer.end((error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          });
        });

        await fs.writeFile(tmpFile, serializedQuads);
        await dataset.importFromFiles([tmpFile], {
          defaultGraphName: "https://kadaster.nl/graphs/brk-state",
        });
        console.log("Uploading done.");
      } catch (error) {
        console.error(error);
        process.exit(1);
      }
    });
  }
}
