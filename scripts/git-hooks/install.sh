#!/bin/sh
# Install FirstPR git hooks into .git/hooks for this repository.
#
# Usage:  ./scripts/git-hooks/install.sh
# Run once after cloning (or after pulling new hook versions).

set -e

repo_root=$(git rev-parse --show-toplevel)
hook_dir="$repo_root/.git/hooks"
script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

installed=0
for hook in "$script_dir"/*; do
  name=$(basename "$hook")
  case "$name" in
    install.sh|*.sample) continue ;;
  esac
  if [ -f "$hook" ]; then
    cp "$hook" "$hook_dir/$name"
    chmod +x "$hook_dir/$name"
    echo "Installed .git/hooks/$name"
    installed=1
  fi
done

if [ "$installed" -eq 0 ]; then
  echo "No hooks found to install."
  exit 1
fi

echo "Git hooks installed. They will run on every commit in this repo."
