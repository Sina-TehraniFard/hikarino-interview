#!/bin/zsh

# .env 読み込み
export $(grep -v '^#' .env | xargs)

# Firebase Emulator
echo "[*] Starting Firebase emulator..."
npm run emu &

# Webhook サーバ
echo "[*] Starting webhook..."
npm run webhook:dev &

# Stripe Listen
echo "[*] Starting stripe listen..."
stripe listen --forward-to localhost:3000/webhook &

# すべてのプロセスが起動するのを待つ
wait