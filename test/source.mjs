// The card source the tests evaluate: src/ assembled into one classic script as scripts/build.mjs does
// (scripts/bundle.mjs), placeholders (__VERSION__ and the like) left as they are.
import { bundle } from "../scripts/bundle.mjs";

export const source = bundle("src/index.js");
