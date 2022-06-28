import {
  EventStream,
  LDESClient,
  newEngine,
  State,
} from "@treecg/actor-init-ldes-client";

async function subscribe(url: string) {}

async function processEventStream() {}

function toBeSplitUp() {
  // load previous state here (e.g. load from a json file on disk)
  const previousState: State = {
    bookkeeper: {},
    memberBuffer: "",
    processedURIs: "",
  };

  try {
    let url =
      "https://apidg.gent.be/opendata/adlib2eventstream/v1/dmg/objecten";
    let options = {
      representation: "Quads", //Object or Quads
      emitMemberOnce: true,
      disableSynchronization: false,
    };
    let LDESClient = newEngine() as LDESClient;

    let eventstreamSync: EventStream;
    if (previousState === undefined || previousState === null) {
      // if you don't have a previous state, the created EventStream will start from scratch
      eventstreamSync = LDESClient.createReadStream(url, options);
    } else {
      // if you have a previous state, use it to create the EventStream
      eventstreamSync = LDESClient.createReadStream(
        url,
        options,
        previousState
      );
    }

    // If the run takes longer than x minutes, pause the LDES Client
    const timeoutms = 3600000; // amount of milliseconds before timeout
    const timeout = setTimeout(() => eventstreamSync.pause(), timeoutms);

    eventstreamSync.on("data", (member) => {
      console.log(member);
    });

    eventstreamSync.on("metadata", (metadata) => {
      if (metadata.treeMetadata)
        // follows the TREE metadata extractor structure (https://github.com/TREEcg/tree-metadata-extraction#extracted-metadata)
        console.log(metadata.treeMetadata);
      console.log(metadata.url); // page from where metadata has been extracted
    });

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
  } catch (e) {
    console.error(e);
  }
}
