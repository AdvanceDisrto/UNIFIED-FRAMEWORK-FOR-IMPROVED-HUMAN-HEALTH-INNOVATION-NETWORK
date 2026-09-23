#!/usr/bin/env bash
set -uo pipefail
OUT_DIR="${OUT_DIR:-./verification-$(date -u +%Y%m%dT%H%M%SZ)}"; mkdir -p "$OUT_DIR"
for t in dig curl openssl jq sha256sum; do command -v "$t" >/dev/null || { echo "missing:$t"; exit 2; }; done
RUN_ID="$(openssl rand -hex 16)"; RUN_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
dns(){ local n="$1" o="$OUT_DIR/dns-${n//./_}.json" a b c; a="$(dig @1.1.1.1 +short "$n" A|sort|tr '\n' ' ')"; b="$(dig @8.8.8.8 +short "$n" A|sort|tr '\n' ' ')"; c="$(dig @1.1.1.1 +short "$n" CNAME|tr '\n' ' ')"; jq -n --arg n "$n" --arg a "$a" --arg b "$b" --arg c "$c" '{name:$n,cloudflare:$a,google:$b,cname:$c,consistent:($a==$b),resolved:(($a|length)>0 or ($c|length)>0)}' > "$o"; }
dns innovulis.com; dns www.innovulis.com; dns api.innovulis.com
BUDDY_ENDPOINT="${BUDDY_ENDPOINT:-https://api.innovulis.com/ask}"
raw="$(curl -fsS --max-time 15 -H 'content-type: application/json' -d '{"text":"Buddy, calculate 12 plus 30"}' "$BUDDY_ENDPOINT" 2>/dev/null || true)"
echo "$raw" | jq -e . >/dev/null 2>&1 || raw='{}'
echo "$raw" | jq '{raw:., result:(.result // .value // null), verified:(.verified // false), destination:(.destination // null), receipt:(.receipt // .final_cyber_receipt // null), matches:((.result // .value // null)==42 and (.verified // false)==true)}' > "$OUT_DIR/buddy.json"
jq -n --arg id "$RUN_ID" --arg at "$RUN_AT" --arg commit "${SOURCE_COMMIT:-unknown}" --slurpfile a "$OUT_DIR/dns-innovulis_com.json" --slurpfile w "$OUT_DIR/dns-www_innovulis_com.json" --slurpfile api "$OUT_DIR/dns-api_innovulis_com.json" --slurpfile buddy "$OUT_DIR/buddy.json" '{schema:"sovereign-public-evidence/v1",run_id:$id,run_at:$at,source_commit:$commit,dns:{apex:$a[0],www:$w[0],api:$api[0]},buddy:$buddy[0]}' > "$OUT_DIR/evidence.json"
sha256sum "$OUT_DIR/evidence.json" | tee "$OUT_DIR/evidence.sha256"
jq . "$OUT_DIR/evidence.json"
