#!/usr/bin/env bash
# Verify nav and footer fragments are byte-identical across the three pages.
# Exit non-zero on drift. Run in CI and locally before commits that touch chrome.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

extract() {
  local file="$1" tag="$2"
  awk "/<!-- BEGIN $tag -->/,/<!-- END $tag -->/" "$file"
}

check() {
  local tag="$1"
  local a b c
  a="$(extract index.html "$tag")"
  b="$(extract architecture.html "$tag")"
  c="$(extract case-studies.html "$tag")"
  if [[ -z "$a" || -z "$b" || -z "$c" ]]; then
    echo "MISSING $tag fragment in one or more pages." >&2
    exit 1
  fi
  if [[ "$a" != "$b" || "$b" != "$c" ]]; then
    echo "DRIFT in $tag fragment across pages." >&2
    diff <(echo "$a") <(echo "$b") || true
    diff <(echo "$b") <(echo "$c") || true
    exit 1
  fi
  echo "OK: $tag fragment identical across all three pages."
}

check NAV
check FOOTER
echo "All chrome fragments verified."
