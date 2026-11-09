#!/usr/bin/env bash
# Собирает открытую копию сайта (только то, что нужно браузеру) в папку $1.
# Методичка, правила ТБ, прототипы автора, внутренние документы, тесты и код сервера сюда не попадают:
# они остаются в закрытом рабочем репозитории.
#   tools/publish-site.sh ../virtual-lab   — затем в ../virtual-lab: git add -A && git commit && git push
set -euo pipefail
SRC="$(cd "$(dirname "$0")/.." && pwd)"
DST="${1:?укажите папку открытого репозитория}"
mkdir -p "$DST"
# очистить всё, кроме .git
find "$DST" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
cd "$SRC"
for f in index.html .nojekyll manifest.webmanifest icon.svg icon-192.png icon-512.png sw.js config.js; do cp "$f" "$DST/"; done
for d in app labs teacher; do
  git ls-files "$d" | grep -vE '\.md$' | while read -r f; do mkdir -p "$DST/$(dirname "$f")"; cp "$f" "$DST/$f"; done
done
cp tools/public/README.md tools/public/LICENSE "$DST/"
echo "Готово: $(find "$DST" -type f ! -path '*/.git/*' | wc -l) файлов в $DST"
