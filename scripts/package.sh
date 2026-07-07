#!/bin/sh
set -eu

PYTHON=${PYTHON:-python3}
VERSION=$($PYTHON -c 'import json; print(json.load(open("manifest.json", encoding="utf-8"))["version"])')
OUT="dist/marktplaats-zonder-spam-firefox-v$VERSION.zip"

mkdir -p dist
rm -f "$OUT"

$PYTHON - "$OUT" <<'PY'
import os
import sys
import zipfile

out = sys.argv[1]
include_files = ["manifest.json", "LICENSE"]
include_dirs = ["src", "options", "icons"]

with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as archive:
    for path in include_files:
        if os.path.isfile(path):
            archive.write(path, path)

    for root in include_dirs:
        if not os.path.isdir(root):
            continue
        for current, dirs, files in os.walk(root):
            dirs.sort()
            for filename in sorted(files):
                path = os.path.join(current, filename)
                archive.write(path, path)
PY

printf 'Created %s\n' "$OUT"
