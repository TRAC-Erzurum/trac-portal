#!/bin/bash

LOG_DIR="/var/log/docker-monitoring"
LOG_FILE="$LOG_DIR/memory.log"
MAX_SIZE=10485760  # 10MB

mkdir -p "$LOG_DIR"

if [ -f "$LOG_FILE" ] && [ $(stat -f%z "$LOG_FILE" 2>/dev/null || stat -c%s "$LOG_FILE" 2>/dev/null) -gt $MAX_SIZE ]; then
    mv "$LOG_FILE" "$LOG_FILE.old"
fi

{
    echo "=== $(date '+%Y-%m-%d %H:%M:%S') ==="
    echo ""
    echo "Memory:"
    free -h | head -2
    echo ""
    echo "Containers:"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
    echo ""
} >> "$LOG_FILE"
