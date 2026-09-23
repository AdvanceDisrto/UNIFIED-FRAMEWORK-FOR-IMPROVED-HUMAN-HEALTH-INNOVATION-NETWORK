import {createHash,randomUUID} from "node:crypto";
export type AssetType="CREATIVE_MEDIA"|"HEALTH_INNOVATION_PATENT"|"UTILITY_DATA_STREAM"|"GREEN_ENERGY_LOGIC";
export interface Asset{assetId:string;title:string;creatorId:string;assetType:AssetType;royaltyMicrounits:bigint;accruedMicrounits:bigint;registeredAt:string}
const sha=(s:string)=>createHash("sha256").update(s).digest("hex");
const cloneAsset=(a:Asset):Asset=>({...a});
export class SovereignRegistryEngine{
 private assets=new Map<string,Asset>(); private balances=new Map<string,bigint>(); private creators=new Set<string>(); private events:any[]=[]; private head="0".repeat(64);
 register(title:string,creatorId:string,assetType:AssetType,royaltyMicrounits:bigint){
  if(!title||!creatorId||royaltyMicrounits<0n)throw new Error("invalid asset");
  const a:Asset={assetId:"ASSET-"+randomUUID(),title,creatorId,assetType,royaltyMicrounits,accruedMicrounits:0n,registeredAt:new Date().toISOString()};
  this.assets.set(a.assetId,{...a}); this.creators.add(creatorId); if(!this.balances.has(creatorId))this.balances.set(creatorId,0n); return cloneAsset(a);
 }
 recordUsage(assetId:string,consumerId:string,invocations:bigint){
  const stored=this.assets.get(assetId); if(!stored)throw new Error("asset not found"); if(invocations<=0n)throw new Error("invocations must be positive");
  const due=stored.royaltyMicrounits*invocations;
  const body={eventId:"ROYALTY-"+randomUUID(),assetId,creatorId:stored.creatorId,consumerCommitment:sha(consumerId),invocations:invocations.toString(),royaltyMicrounits:due.toString(),timestamp:new Date().toISOString(),previousHash:this.head,state:"RECORDED_INTERNAL"};
  const e={...body,eventHash:sha(JSON.stringify(body))}; this.events.push(Object.freeze({...e})); this.head=e.eventHash;
  stored.accruedMicrounits+=due; this.balances.set(stored.creatorId,(this.balances.get(stored.creatorId)||0n)+due); return {...e};
 }
 balance(id:string){return(this.balances.get(id)||0n).toString();}
 snapshot(){let total=0n;for(const v of this.balances.values())total+=v;return{mode:"LOCAL_DEMO",assetCount:this.assets.size,eventCount:this.events.length,creatorCount:this.creators.size,totalAccruedMicrounits:total.toString(),recent:this.events.slice(-12).reverse().map(e=>({...e}))};}
}
