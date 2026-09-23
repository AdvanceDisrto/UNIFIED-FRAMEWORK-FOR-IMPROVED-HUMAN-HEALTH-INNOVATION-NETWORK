// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;
/// @notice Non-transferable evidence registry. Registration is NOT issuance of a regulated carbon credit.
contract CarbonEvidenceRegistry {
 struct Evidence {bytes32 projectId; bytes32 methodology; uint256 gramsCO2e; uint64 start; uint64 end; bytes32 sourceHash; bool retired;}
 address public immutable verifier; uint256 public nextId=1; mapping(uint256=>Evidence) public evidence; mapping(bytes32=>bool) public consumed;
 event EvidenceRegistered(uint256 indexed id,bytes32 indexed projectId,uint256 gramsCO2e,bytes32 sourceHash); event EvidenceRetired(uint256 indexed id);
 constructor(address v){require(v!=address(0),"verifier required");verifier=v;}
 function register(bytes32 projectId,bytes32 methodology,uint256 grams,uint64 start,uint64 end,bytes32 sourceHash,uint8 v,bytes32 r,bytes32 s) external returns(uint256 id){require(grams>0&&end>start&&end<=block.timestamp,"invalid measurement");require(sourceHash!=bytes32(0)&&methodology!=bytes32(0),"evidence required");bytes32 key=keccak256(abi.encode(projectId,methodology,start,end,sourceHash));require(!consumed[key],"already consumed");bytes32 digest=keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32",key));require(ecrecover(digest,v,r,s)==verifier,"bad verifier signature");consumed[key]=true;id=nextId++;evidence[id]=Evidence(projectId,methodology,grams,start,end,sourceHash,false);emit EvidenceRegistered(id,projectId,grams,sourceHash);}
 function retire(uint256 id) external {Evidence storage e=evidence[id];require(e.projectId!=bytes32(0),"missing");require(!e.retired,"retired");e.retired=true;emit EvidenceRetired(id);}
}
