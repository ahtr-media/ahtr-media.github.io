#!/usr/bin/env python3
import json
import subprocess
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
CONTENT_DIR = REPO_ROOT / "content"
OUT_DIR = REPO_ROOT / "data" / "history"


def run(cmd: list[str]) -> str:
    return subprocess.check_output(cmd, cwd=str(REPO_ROOT)).decode("utf-8", errors="replace")


def repo_commit_base() -> str:
    try:
        url = run(["git", "remote", "get-url", "origin"]).strip()
    except subprocess.CalledProcessError:
        return "https://github.com/ahtr-media/ahtr-media.github.io/commit"
    url = url.removesuffix(".git")
    if url.startswith("git@"):
        # git@github.com:org/repo.git
        path = url.split(":", 1)[-1]
        return f"https://github.com/{path}/commit"
    if "github.com/" in url:
        path = url.split("github.com/", 1)[-1]
        return f"https://github.com/{path}/commit"
    return "https://github.com/ahtr-media/ahtr-media.github.io/commit"


def safe_key_from_relpath(relpath: str) -> str:
    return relpath.replace("/", "__").replace(".", "_")


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    commit_base = repo_commit_base()

    md_files = [p for p in CONTENT_DIR.rglob("*.md") if p.is_file() and p.name != "README.md"]
    if not md_files:
        print("No markdown files found under content/.")
        return

    for md in md_files:
        rel = md.relative_to(CONTENT_DIR).as_posix()
        key = safe_key_from_relpath(rel)
        out_path = OUT_DIR / f"{key}.json"

        fmt = "%aI|%an|%s|%H"
        raw = run(["git", "log", f"--pretty=format:{fmt}", "--", str(md)])

        items = []
        if raw.strip():
            for line in raw.splitlines():
                parts = line.split("|", 3)
                if len(parts) != 4:
                    continue
                date_iso, author, subject, sha = parts
                items.append(
                    {
                        "date": date_iso,
                        "author": author,
                        "message": subject,
                        "sha": sha,
                        "url": f"{commit_base}/{sha}",
                    }
                )

        with out_path.open("w", encoding="utf-8") as f:
            json.dump(items, f, ensure_ascii=False, indent=2)

        print(f"Wrote {out_path.relative_to(REPO_ROOT)} ({len(items)} commits)")


if __name__ == "__main__":
    main()
