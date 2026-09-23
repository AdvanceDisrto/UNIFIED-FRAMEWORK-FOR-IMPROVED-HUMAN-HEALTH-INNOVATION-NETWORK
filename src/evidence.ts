import {createHash,createPublicKey,verify} from "node:crypto";
export type VerificationState="VERIFIED"|"DISPROVED"|"PARTIALLY_VERIFIED"|"UNVERIFIABLE"|"CONFLICTED";
export interface EnvironmentalClaim{claimId:string;category:"ENERGY"|"GHG"|"WATER"|"MATERIALS"|"BIODIVERSITY"|"SOIL"|"LOGISTICS"|"WASTE"|"TOXICOLOGY";subject:string;periodStart:string;periodEnd:string;methodology:string;sourceHash:string;uncertainty:string;signature:string;publicKeyPem:string}
export interface Receipt{claimId:string;state:VerificationState;canonicalHash:string;reasons:string[]}
export function canonical(c:EnvironmentalClaim){return JSON.stringify({claimId:c.claimId,category:c.category,subject:c.subject,periodStart:c.periodStart,periodEnd:c.periodEnd,methodology:c.methodology,sourceHash:c.sourceHash,uncertainty:c.uncertainty});}
export function evaluate(c:EnvironmentalClaim):Receipt{
 const reasons:string[]=[]; if(!c.methodology) reasons.push("methodology missing"); if(!/^[a-f0-9]{64}$/i.test(c.sourceHash)) reasons.push("source hash invalid"); if(!c.uncertainty) reasons.push("uncertainty missing");
 let sig=false; try{sig=verify(null,Buffer.from(canonical(c)),createPublicKey(c.publicKeyPem),Buffer.from(c.signature,"base64"));}catch{}
 if(!sig) reasons.push("signature invalid");
 const state:VerificationState=reasons.length?"UNVERIFIABLE":"VERIFIED";
 return {claimId:c.claimId,state,canonicalHash:createHash("sha256").update(canonical(c)).digest("hex"),reasons};
}
