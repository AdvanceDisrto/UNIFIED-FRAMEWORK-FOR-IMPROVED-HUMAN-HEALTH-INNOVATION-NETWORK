import { createHash, createPrivateKey, createPublicKey, randomUUID, sign, verify } from "node:crypto";
import { readFileSync } from "node:fs";
export type ReceiptStatus="BUDDY_CERTIFIED_LIVE"|"INSUFFICIENT_EVIDENCE";
export function evaluate(e:any){
 const checks={
  source_commit:/^[0-9a-f]{40}$/i.test(e?.source_commit||""),
  dns_apex:e?.dns?.apex?.consistent===true&&e?.dns?.apex?.resolved===true,
  dns_www:e?.dns?.www?.consistent===true&&e?.dns?.www?.resolved===true,
  dns_api:e?.dns?.api?.consistent===true&&e?.dns?.api?.resolved===true,
  buddy_42:e?.buddy?.matches===true&&e?.buddy?.verified===true&&e?.buddy?.result===42,
  buddy_receipt:typeof e?.buddy?.receipt==="string"&&e.buddy.receipt.length>0
 };
 const missing=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
 return {checks,missing,status:(missing.length?"INSUFFICIENT_EVIDENCE":"BUDDY_CERTIFIED_LIVE") as ReceiptStatus};
}
export function mint(evidencePath:string,keyPath:string){
 const raw=readFileSync(evidencePath); const e=JSON.parse(raw.toString("utf8")); const gate=evaluate(e);
 const unsigned={schema:"final-cyber-receipt/v1",receipt_id:randomUUID(),issued_at:new Date().toISOString(),source_commit:e.source_commit,evidence_hash:createHash("sha256").update(raw).digest("hex"),...gate};
 const signature=sign(null,Buffer.from(JSON.stringify(unsigned)),createPrivateKey(readFileSync(keyPath))).toString("base64");
 return {...unsigned,signature};
}
export function verifyReceipt(r:any,keyPath:string){const {signature,...u}=r;return verify(null,Buffer.from(JSON.stringify(u)),createPublicKey(readFileSync(keyPath)),Buffer.from(signature,"base64"));}
