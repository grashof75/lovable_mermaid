#!/bin/bash

# Script Bash per sincronizzare automaticamente gli screenshot
# Per Linux/Mac/WSL

SOURCE_PATH="${1:-/mnt/g/My Drive/_CLAUDE.CODE/SCREENSHOT}"
DEST_PATH="${2:-.claude/SCREENSHOT}"
INTERVAL="${3:-5}"

echo -e "\033[32mScreenshot Auto-Sync attivo\033[0m"
echo -e "\033[36mDa: $SOURCE_PATH\033[0m"
echo -e "\033[36mA: $DEST_PATH\033[0m"
echo -e "\033[33mControllo ogni $INTERVAL secondi...\033[0m"
echo -e "\033[31mPremi Ctrl+C per fermare\033[0m"
echo ""

while true; do
    if [ -d "$SOURCE_PATH" ]; then
        # Copia nuovi file o file modificati
        rsync -av --include='*.png' --include='*.jpg' --include='*.jpeg' --include='*.gif' --exclude='*' "$SOURCE_PATH/" "$DEST_PATH/" 2>/dev/null && \
        echo "[$(date +'%H:%M:%S')] Sincronizzazione completata"
    fi

    sleep $INTERVAL
done
