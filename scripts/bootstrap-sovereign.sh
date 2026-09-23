#!/usr/bin/env bash
set -euo pipefail
: "${SOURCE_TARBALL:=/root/uffihhin-snapshot.tar.gz}" "${SOURCE_TARBALL_SIG:=/root/uffihhin-snapshot.tar.gz.sig}" "${SOURCE_PUBKEY:=/root/uffihhin-release.pub}"
APP_ROOT="${APP_ROOT:-/opt/uffihhin}"; STAGE="$(mktemp -d)"; trap 'rm -rf "$STAGE"' EXIT
openssl dgst -sha256 -verify "$SOURCE_PUBKEY" -signature "$SOURCE_TARBALL_SIG" "$SOURCE_TARBALL"
tar -xzf "$SOURCE_TARBALL" -C "$STAGE"
test -f "$STAGE/package.json"
mkdir -p "$APP_ROOT/releases" "$APP_ROOT/shared/logs"
release="$APP_ROOT/releases/$(date -u +%Y%m%dT%H%M%SZ)"; mkdir -p "$release"; rsync -a "$STAGE/" "$release/"
ln -sfn "$release" "$APP_ROOT/current"
cd "$APP_ROOT/current"; npm ci; npm run verify:all
printf '{"schema":"sovereign-bootstrap/v1","at":"%s","source_sha256":"%s","verification":"PASS"}\n' "$(date -u +%FT%TZ)" "$(sha256sum "$SOURCE_TARBALL"|awk '{print $1}')" | tee "$APP_ROOT/shared/logs/bootstrap.json"
echo "BOOTSTRAP_VERIFIED"
