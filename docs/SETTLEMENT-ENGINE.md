# $UFFiHHiN Settlement Engine v0.1

Evidence-first settlement substrate. Implemented: signed intents, integer minor-unit accounting, SHA-256 identity commitments, replay rejection, hash-linked receipts, internal native-unit settlement state, explicit PENDING_EXTERNAL_RAIL for fiat, tests and smoke gates.

This version does not itself move bank money, clear cards, perform FX, issue regulated carbon credits, or replace regulated clearing networks. External fiat or asset settlement becomes verified only after an authorized adapter supplies independently verifiable settlement evidence.

Integration target: signed intent -> policy/compliance -> internal unit or external adapter -> evidence -> iDIE -> Final Cyber Receipt -> Buddy.
