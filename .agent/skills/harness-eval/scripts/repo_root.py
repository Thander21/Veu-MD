"""Raiz do repositorio e contencao de caminhos (correcao local, nao versionada).

why: numa worktree aninhada no proprio repo (ex.: .claude/worktrees/<id>),
`root / "../../../X"` escapa da raiz e cai no checkout canonico; o
relative_to(root) quebra ou a citacao passa como existente por engano.
"""

from __future__ import annotations

import subprocess
from pathlib import Path


def git_toplevel(start: Path | None = None) -> Path:
    """`git rev-parse --show-toplevel` da pasta atual (ou `start`); sem git, a propria pasta."""
    base = (start or Path(".")).resolve()
    try:
        out = subprocess.run(
            ["git", "-C", str(base), "rev-parse", "--show-toplevel"],
            capture_output=True,
            text=True,
            check=True,
        ).stdout.strip()
        if out:
            return Path(out).resolve()
    except (OSError, subprocess.CalledProcessError):
        pass
    return base


def inside(root: Path, path: Path) -> bool:
    """True quando `path` resolvido fica dentro de `root`."""
    try:
        path.resolve().relative_to(root.resolve())
        return True
    except (ValueError, OSError):
        return False
