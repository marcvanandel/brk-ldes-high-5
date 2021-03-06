# BRK LDES High-5

This repo contains all code, test data and examples for the High-5 to prove (technically) Linked Data Event Stream using BRK events.

## From JSON to linked data

We use JSON-LD for this:
- W3C standard (version 1.1): https://www.w3.org/TR/json-ld11/
- Online playground: https://json-ld.org/playground/

## From linked data to LDES Server

First prepare the test data.

```bash
cd prep-test-data
```

First install all dependencies:

```bash
yarn
```

Run package goals:

```bash
yarn build                > builds (compiles) all TypeScript files
yarn conv2json            > step 1: converts the XML to JSON
yarn conv2ld              > step 2: converts the JSON to JSON-LD
```

Then upload all generated jsonld files:

```bash
yarn upload-achtergrond       > uploads all achtergrond jsonld files
yarn upload-events            > uploads all events jsonld files with delays to simulate production
```

## From LDES Server to LDES Client

- Try out the following LDES Client:
  https://github.com/TREEcg/event-stream-client/tree/main/packages/actor-init-ldes-client

Questions:
- What makes the LDES endpoint different from a regular LD endpoint?
  Answers:
  > - Semantic navigation /pagination on the tree collection is added
- What makes the LDES client different from a regular LD client?
  Answers:
  > - LDES client makes the use of the semantic navigation available to programmers

## Formalities

Formalities in short. For proper continuation of this repo this needs to be expanded.

This repo is originally licensed under [MIT License](LICENSE.md).
This might change when this work is being improved and accepted towards more mainstream implementation at Kadaster.

We are inclusive and will not judge based on any specifics.
We will be polite and handle with respect to humans and nature.
