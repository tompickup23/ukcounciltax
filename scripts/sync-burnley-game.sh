#!/usr/bin/env bash
# Copies the Burnley budget game from a Reports build into this site.
#
#   scripts/sync-burnley-game.sh /path/to/Burnley_Budget_Model_work/game/dist [YYYY-MM-DD]
#
# The first argument is the game's dist folder (index.html, game.js, game.css).
# The second is the edition date printed on the page; it defaults to today.
# Writes public/budget-game/burnley/game.js and game.css, and
# src/components/burnley-game/markup.html and meta.json. See
# scripts/lib/burnley-game-sync.mjs for what is adapted and what is refused.
#
#   scripts/sync-burnley-game.sh --reskin /path/to/game/dist
#
# reapplies src/components/burnley-game/skin.css to the served game.css only,
# provided the dist game.css is the one recorded in meta.json.
set -euo pipefail

if [ "${1:-}" = "--reskin" ] && [ "$#" -eq 2 ]; then
  dist="$(cd "$2" && pwd)"
  cd "$(dirname "$0")/.."
  exec node scripts/lib/burnley-game-sync.mjs --reskin "$dist"
fi

if [ "$#" -lt 1 ] || [ "$#" -gt 2 ]; then
  echo "usage: scripts/sync-burnley-game.sh /path/to/game/dist [YYYY-MM-DD] | --reskin /path/to/game/dist" >&2
  exit 2
fi

dist="$(cd "$1" && pwd)"
edition="${2:-$(date +%F)}"
cd "$(dirname "$0")/.."
exec node scripts/lib/burnley-game-sync.mjs "$dist" "$edition"
