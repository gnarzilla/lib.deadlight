#!/usr/bin/env bash
set -euo pipefail

prefix="${1:?usage: check-android-16kb-libs.sh <prefix-or-lib-dir>}"
libdir="$prefix"
[ -d "$prefix/lib" ] && libdir="$prefix/lib"

find "$libdir" -maxdepth 1 -type f -name "*.so*" -print | sort | while read -r f; do
  aligns="$(readelf -W -l "$f" 2>/dev/null | awk '$1 == "LOAD" { print $NF }' | sort -u | tr '\n' ' ')"

  if echo "$aligns" | grep -q "0x4000"; then
    status="OK"
  else
    status="FAIL"
  fi

  printf "%-5s %-70s %s\n" "$status" "$(basename "$f")" "$aligns"
done
