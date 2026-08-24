#!/bin/bash

if command -v ip > /dev/null 2>&1; then
    AVAILABLE_IPS=($(ip -4 addr show | grep -v "127.0.0.1" | awk '/inet / {print $2}' | cut -d/ -f1))
elif command -v ifconfig > /dev/null 2>&1; then
    AVAILABLE_IPS=($(ifconfig | grep "inet " | grep -v "127.0.0.1" | awk '{print $2}'))
else
    AVAILABLE_IPS=()
fi

AVAILABLE_IPS+=("localhost")

echo -e "🔍 Detected network options:\n"

i=1
for ip in "${AVAILABLE_IPS[@]}"; do
    echo "  $i) $ip"
    ((i++))
done

MANUAL_OPT=$i
echo "  $MANUAL_OPT) Enter IP manually (if not found above)"
echo ""

read -p "👉 Choose an option (1-$MANUAL_OPT): " OPTION

if ! [[ "$OPTION" =~ ^[0-9]+$ ]] || [ "$OPTION" -lt 1 ] || [ "$OPTION" -gt "$MANUAL_OPT" ]; then
    echo "❌ Invalid option. Aborting."
    exit 1
fi

if [ "$OPTION" -eq "$MANUAL_OPT" ]; then
    read -p "🌐 Enter your local IP (e.g., 192.168.1.5 or custom-domain): " NEW_IP
    NEW_IP=$(echo "$NEW_IP" | xargs)
    if [ -z "$NEW_IP" ]; then
        echo "❌ IP cannot be empty. Aborting."
        exit 1
    fi
else
    INDEX=$((OPTION - 1))
    NEW_IP="${AVAILABLE_IPS[$INDEX]}"
fi

echo -e "\n🔄 Updating .env files with new host: $NEW_IP...\n"

update_env() {
    local file=$1
    local key=$2
    local val=$3

    if [ ! -f "$file" ]; then
        echo "⚠️  File not found: $file. Creating a new one..."
        mkdir -p "$(dirname "$file")"
        touch "$file"
    fi

    if grep -q "^${key}=" "$file"; then
        sed "s|^${key}=.*|${key}=${val}|" "$file" > "${file}.tmp"
        mv "${file}.tmp" "$file"
    else
        [ -n "$(tail -c1 "$file")" ] && echo "" >> "$file"
        echo "${key}=${val}" >> "$file"
    fi
}

update_env "client/.env" "NEXT_PUBLIC_API_URL" "http://${NEW_IP}:5000/api"
update_env "client/.env" "NEXT_PUBLIC_SOCKET_URL" "http://${NEW_IP}:8000/"
echo "✅ Updated client/.env"

update_env "server/.env" "CLIENT_URL" "http://${NEW_IP}:3000"
echo "✅ Updated server/.env"

update_env "socket/.env" "CLIENT_URL" "http://${NEW_IP}:3000"
echo "✅ Updated socket/.env"

echo -e "\n🎉 All .env files updated successfully to $NEW_IP!"