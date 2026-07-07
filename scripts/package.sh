#!/bin/sh
set -eu

PYTHON=${PYTHON:-python3}
VERSION=$($PYTHON -c 'import json; print(json.load(open("manifest.json", encoding="utf-8"))["version"])')
BASE="dist/marktplaats-zonder-spam-v$VERSION"
OUT_ZIP="$BASE.zip"
OUT_XPI="$BASE.xpi"
STABLE_XPI="dist/marktplaats-zonder-spam.xpi"

mkdir -p dist
rm -f "$OUT_ZIP" "$OUT_XPI" "$STABLE_XPI"

$PYTHON - "$OUT_ZIP" "$OUT_XPI" "$STABLE_XPI" <<'PY'
import os
import sys
import zipfile

include_files = ["manifest.json", "LICENSE"]
include_dirs = ["src", "options", "icons"]

for out in sys.argv[1:]:
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

printf 'Created %s\n' "$OUT_ZIP"
printf 'Created %s\n' "$OUT_XPI"
printf 'Created %s\n' "$STABLE_XPI"
