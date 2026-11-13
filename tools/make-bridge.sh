#!/usr/bin/env bash
# Собирает страницу-мост для старого адреса сайта в папку $2 (ветка bridge старого репозитория).
#   tools/make-bridge.sh https://kaldybayeva-lab.github.io/virtual-lab/ /path/to/bridge-worktree
set -euo pipefail
NEW="${1:?новый адрес сайта, со слешем в конце}"; DST="${2:?папка}"
case "$NEW" in https://*/) ;; *) echo "адрес должен начинаться с https:// и заканчиваться /"; exit 1;; esac
SRC="$(cd "$(dirname "$0")/bridge" && pwd)"
mkdir -p "$DST"; find "$DST" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
cp -r "$SRC/." "$DST/"
grep -rl "__NEW__" "$DST" | while read -r f; do sed -i "s#__NEW__#${NEW}#g" "$f"; done
echo "Мост собран в $DST → $NEW"
