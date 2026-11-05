#!/bin/bash
# Double-click this file on a Mac to preview the site in your browser.
# It starts a small local web server in this folder; close the window to stop it.
cd "$(dirname "$0")" || exit 1
PORT=8000
while lsof -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; do PORT=$((PORT + 1)); done
if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 is needed to preview the site. Install it, or run: npx serve ."
  read -r -p "Press Return to close." _
  exit 1
fi
echo "Previewing at http://localhost:$PORT"
echo "Close this window (or press Control-C) to stop."
( sleep 1; open "http://localhost:$PORT" ) &
python3 -m http.server "$PORT" --bind 127.0.0.1
