import test from "node:test";import assert from "node:assert/strict";import {evaluate} from "../src/cyber-receipt.js";
const base={source_commit:"a".repeat(40),dns:{apex:{consistent:true,resolved:true},www:{consistent:true,resolved:true},api:{consistent:true,resolved:true}},buddy:{matches:true,verified:true,result:42,receipt:"RCP-1"}};
test("certifies only complete evidence",()=>assert.equal(evaluate(base).status,"BUDDY_CERTIFIED_LIVE"));
test("refuses missing Buddy verification",()=>{const e=structuredClone(base);e.buddy.verified=false;const r=evaluate(e);assert.equal(r.status,"INSUFFICIENT_EVIDENCE");assert.ok(r.missing.includes("buddy_42"));});
test("refuses missing receipt",()=>{const e=structuredClone(base);e.buddy.receipt="";assert.equal(evaluate(e).status,"INSUFFICIENT_EVIDENCE");});
