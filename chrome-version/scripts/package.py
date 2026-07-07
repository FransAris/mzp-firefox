import json
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "manifest.json"


def main():
    version = json.loads(MANIFEST.read_text(encoding="utf-8"))["version"]
    out_dir = ROOT / "dist"
    outputs = (
        out_dir / f"markplaats-zonder-spam-v2-chrome-v{version}.zip",
        out_dir / "markplaats-zonder-spam-v2-chrome.zip",
    )

    out_dir.mkdir(exist_ok=True)
    for out in outputs:
        if out.exists():
            out.unlink()

    for out in outputs:
        with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as archive:
            for name in ("manifest.json", "LICENSE"):
                path = ROOT / name
                if path.is_file():
                    archive.write(path, name)

            for directory in ("src", "options", "icons"):
                base = ROOT / directory
                for path in sorted(base.rglob("*")):
                    if path.is_file():
                        archive.write(path, path.relative_to(ROOT).as_posix())

        print(f"Created {out.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
