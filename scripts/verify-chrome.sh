#!/usr/bin/env bash
# Verify nav and footer fragments are byte-identical across the content pages.
# Exit non-zero on drift. Run in CI and locally before commits that touch chrome.
#
# architecture.html is intentionally excluded — it is now a redirect-proxy file
# (HTTP 200 with meta-refresh + JS redirect to the merged page) and has no
# nav or footer fragments. See spec §3 + §7.3.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

extract() {
  local file="$1" tag="$2"
  # The footer contains a per-page title inside <span data-page-title>...</span>.
  # Normalize that text to a placeholder before diffing so the rest of the chrome
  # is compared byte-for-byte.
  awk "/<!-- BEGIN $tag -->/,/<!-- END $tag -->/" "$file" \
    | sed -E 's|(<span data-page-title>)[^<]*(</span>)|\1__PAGE_TITLE__\2|g'
}

check() {
  local tag="$1"
  local a c
  a="$(extract index.html "$tag")"
  c="$(extract case-studies.html "$tag")"
  if [[ -z "$a" || -z "$c" ]]; then
    echo "MISSING $tag fragment in one or more pages." >&2
    exit 1
  fi
  if [[ "$a" != "$c" ]]; then
    echo "DRIFT in $tag fragment across pages." >&2
    diff <(echo "$a") <(echo "$c") || true
    exit 1
  fi
  echo "OK: $tag fragment identical across both content pages."
}

check NAV
check FOOTER
echo "All chrome fragments verified."
