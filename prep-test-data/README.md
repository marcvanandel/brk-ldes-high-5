# BRK LDES | Prep LDES Data

This repo contains the code used to prepare the data for the BRK LDES, Base Registry Kadaster (of The Netherlands) Linked Data Event Stream.

It is set up based on [this tutorial](https://www.digitalocean.com/community/tutorials/typescript-new-project).

First install all dependencies:

```bash
yarn install
```

Run package goals:

```bash
yarn build                > builds (compiles) all TypeScript files
yarn conv2json            > converts the XML to JSON
yarn conv2ld              > converts the JSON to JSON-LD
```
