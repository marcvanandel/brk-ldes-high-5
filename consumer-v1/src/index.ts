import express from "express";
import { EventProcessor } from "./eventProcessor";

const app = express();
const port = 3000; // default port to listen

// define a route handler for the default home page
app.get("/", (req, res) => {
  res.send("Hello world!");
});

// start the Express server
const eventProcessor = new EventProcessor(
  "https://ldes.triply.cc/high-5-ldes/koers/feed/2016-03-01T00:00:00/until/2016-04-01T00:00:00"
);
eventProcessor.subscribe();
eventProcessor.listen();

app.get("/upload", (req, res) => {
  eventProcessor.startUpload();
  res.send("Upload triggered ...");
});

app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
