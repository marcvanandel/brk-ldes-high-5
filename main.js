"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const triplydb_1 = __importDefault(require("@triply/triplydb"));
const fs = __importStar(require("fs-extra"));
require("source-map-support/register");
const client = triplydb_1.default.get({ token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ1bmtub3duIiwiaXNzIjoiaHR0cHM6Ly9hcGkubGFicy5rYWRhc3Rlci5ubCIsImp0aSI6ImNjYjgyNzg3LTJlNzgtNGViNS04ZTU1LTZkOWE4ZjlmYWMxNiIsInVpZCI6IjYyYjM1MGRhMGU5OTc5OTA3OTlhZmIwNiIsImlhdCI6MTY1NjMyMDgxMn0.rwz2uvmSP4xihgpKVThhOwaLGmHpTDO7xt_7DP0VPEM' });
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log((yield (yield client.getUser()).getInfo()).accountName);
        const CONTEXT = { "@base": "https://kadaster.nl/id/", "@version": 1.1, "@vocab": "https://kadaster.nl/def/", "aggregateIdentifier": "@id", "type": "@type" };
        let jsonContent = JSON.parse(yield fs.readFileSync("./achtergrond.json", 'utf-8'));
        jsonContent = jsonContent.map((item) => {
            item['@context'] = CONTEXT;
            return item;
        });
        yield fs.writeFileSync("./achtergrond.json-ld", JSON.stringify(jsonContent));
        yield dataset.importFromFiles("./achtergrond.json-ld");
    });
}
;
run().catch((e) => {
    console.error(e);
    process.exit(1);
});
process.on("uncaughtException", function (err) {
    console.error("Uncaught exception", err);
    process.exit(1);
});
process.on("unhandledRejection", (reason, p) => {
    console.error("Unhandled Rejection at: Promise", p, "reason:", reason);
    process.exit(1);
});
