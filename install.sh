#!/usr/bin/env bash
set -Eeuo pipefail

APP_NAME="amadeh-pack"
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$APP_DIR/.env"
ENV_PROD_FILE="$APP_DIR/.env.production"

say() {
  printf "\n\033[1;32m%s\033[0m\n" "$1"
}

warn() {
  printf "\n\033[1;33m%s\033[0m\n" "$1"
}

step() {
  printf "\n\033[1;36m==> %s\033[0m\n" "$1"
}

die() {
  printf "\n\033[1;31mError: %s\033[0m\n" "$1" >&2
  exit 1
}

is_interactive() {
  [[ -t 0 ]] && [[ -t 1 ]]
}

sudo_cmd() {
  if [[ "$(id -u)" -eq 0 ]]; then
    "$@"
  elif command -v sudo >/dev/null 2>&1; then
    sudo "$@"
  else
    "$@"
  fi
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || die "$1 is required but was not found."
}

prompt_value() {
  local label="$1"
  local env_name="${2:-}"
  local default_value="${3:-}"
  local secret="${4:-0}"
  local value=""
  local env_value="${!env_name:-}"

  if [[ -n "${INSTALLER_NON_INTERACTIVE:-}" ]] || ! is_interactive; then
    if [[ -n "$env_value" ]]; then
      printf "%s" "$env_value"
      return 0
    fi

    if [[ -n "$default_value" ]]; then
      printf "%s" "$default_value"
      return 0
    fi

    printf ""
    return 0
  fi

  if [[ "$secret" == "1" ]]; then
    read -r -s -p "$label: " value
    printf "\n" >&2
  else
    read -r -p "$label [$default_value]: " value
  fi

  if [[ -z "$value" ]]; then
    if [[ -n "$env_value" ]]; then
      printf "%s" "$env_value"
      return 0
    fi
    if [[ -n "$default_value" ]]; then
      printf "%s" "$default_value"
      return 0
    fi
  fi

  printf "%s" "$value"
}

prompt_required() {
  prompt_value "$1" "$2" "$3" 0
}

prompt_secret_required() {
  prompt_value "$1" "$2" "$3" 1
}

yes_no() {
  local label="$1"
  local default="$2"
  local value=""

  if [[ -n "${INSTALLER_NON_INTERACTIVE:-}" ]] || ! is_interactive; then
    if [[ "$default" =~ ^[Yy]([Ee][Ss])?$ ]]; then
      return 0
    fi
    return 1
  fi

  while true; do
    read -r -p "$label [$default]: " value
    value="${value:-$default}"
    if [[ "$value" =~ ^[Yy]([Ee][Ss])?$ ]]; then
      return 0
    elif [[ "$value" =~ ^[Nn]([Oo])?$ ]]; then
      return 1
    fi

    warn "Please answer yes or no."
  done
}

generate_secret() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -base64 48 | tr -d '\n'
  elif command -v node >/dev/null 2>&1; then
    node -e "process.stdout.write(require('crypto').randomBytes(48).toString('base64'))"
  else
    printf "change-me"
  fi
}

normalize_database_url() {
  local url="$1"
  if [[ -z "$url" ]]; then
    printf "%s" "$url"
    return
  fi

  if [[ "$url" == postgresql://* || "$url" == postgres://* ]]; then
    url="$(node -e '
      const input = process.argv[1];
      try {
        const parsed = new URL(input);
        if (parsed.username) parsed.username = encodeURIComponent(decodeURIComponent(parsed.username));
        if (parsed.password) parsed.password = encodeURIComponent(decodeURIComponent(parsed.password));
        if (!/^\d+$/.test(parsed.port)) parsed.port = "5432";
        process.stdout.write(parsed.toString());
      } catch {
        process.stdout.write(input);
      }
    ' "$url")"
  fi

  printf "%s" "$url"
}

build_database_url() {
  local db_user="$1"
  local db_password="$2"
  local db_host="$3"
  local db_port="$4"
  local db_name="$5"
  local db_schema="$6"

  node - <<'NODE' "$db_user" "$db_password" "$db_host" "$db_port" "$db_name" "$db_schema"
const [user, password, host, port, name, schema] = process.argv.slice(2);
const safeUser = encodeURIComponent(decodeURIComponent(user ?? ""));
const safePassword = encodeURIComponent(decodeURIComponent(password ?? ""));
const safeHost = (host || "127.0.0.1").trim();
const safePort = /^\d+$/.test((port || "").trim()) ? String(port).trim() : "5432";
const safeName = (name || "postgres").trim();
const safeSchema = (schema || "public").trim();
const url = new URL(`postgresql://${safeUser}:${safePassword}@${safeHost}:${safePort}/${safeName}`);
url.searchParams.set("schema", safeSchema);
process.stdout.write(url.toString());
NODE
}

shell_escape() {
  local value="$1"
  value="${value//\\/\\\\}"
  value="${value//\"/\\\"}"
  printf "%s" "$value"
}

install_nodejs() {
  if command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1; then
    local node_version
    node_version="$(node -v 2>/dev/null || true)"
    if [[ "$node_version" =~ ^v(2[2-9]|[3-9][0-9]) ]]; then
      return 0
    fi
  fi

  if ! command -v apt-get >/dev/null 2>&1; then
    warn "apt-get not available; skipping Node.js installation"
    return 0
  fi

  warn "Installing Node.js 22 and npm..."
  sudo_cmd apt-get update
  sudo_cmd apt-get install -y ca-certificates curl gnupg
  sudo_cmd install -d -m 0755 /etc/apt/keyrings
  curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo_cmd gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
  echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_22.x nodistro main" | sudo_cmd tee /etc/apt/sources.list.d/nodesource.list >/dev/null
  sudo_cmd apt-get update
  sudo_cmd apt-get install -y nodejs
}

install_nginx() {
  if command -v nginx >/dev/null 2>&1; then
    return 0
  fi

  if ! command -v apt-get >/dev/null 2>&1; then
    warn "apt-get not available; skipping nginx installation"
    return 0
  fi

  warn "Installing nginx..."
  sudo_cmd apt-get update
  sudo_cmd apt-get install -y nginx
  sudo_cmd systemctl enable nginx >/dev/null 2>&1 || true
  sudo_cmd systemctl start nginx >/dev/null 2>&1 || true
}

install_certbot() {
  if command -v certbot >/dev/null 2>&1; then
    return 0
  fi

  if ! command -v apt-get >/dev/null 2>&1; then
    warn "apt-get not available; skipping certbot installation"
    return 0
  fi

  warn "Installing certbot..."
  sudo_cmd apt-get update
  sudo_cmd apt-get install -y certbot python3-certbot-nginx
}

create_systemd_service() {
  local port="$1"
  local node_path
  local npm_path
  node_path="$(command -v node || true)"
  npm_path="$(command -v npm || true)"

  if [[ -z "$node_path" || -z "$npm_path" ]]; then
    warn "Node.js not found; skipping systemd service"
    return 0
  fi

  sudo_cmd tee "/etc/systemd/system/$APP_NAME.service" >/dev/null <<EOF
[Unit]
Description=Amadeh Pack Next.js application
After=network.target

[Service]
Type=simple
WorkingDirectory=$APP_DIR
EnvironmentFile=$ENV_PROD_FILE
Environment=NODE_ENV=production
Environment=PORT=$port
ExecStart=$npm_path run start -- -p $port
Restart=always
RestartSec=5
User=$USER
PATH=$(dirname "$node_path"):/usr/local/bin:/usr/bin:/bin

[Install]
WantedBy=multi-user.target
EOF

  sudo_cmd systemctl daemon-reload >/dev/null 2>&1 || true
  sudo_cmd systemctl enable "$APP_NAME" >/dev/null 2>&1 || true
  sudo_cmd systemctl restart "$APP_NAME" >/dev/null 2>&1 || true
}

create_nginx_config() {
  local server_names="$1"
  local port="$2"

  if ! command -v nginx >/dev/null 2>&1; then
    warn "nginx not available; skipping reverse proxy"
    return 0
  fi

  sudo_cmd rm -f /etc/nginx/sites-enabled/default
  sudo_cmd tee "/etc/nginx/sites-available/$APP_NAME" >/dev/null <<EOF
server {
    listen 80;
    server_name $server_names;
    client_max_body_size 20m;

    location / {
        proxy_pass http://127.0.0.1:$port;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Port \$server_port;
        proxy_cache_bypass \$http_upgrade;
        proxy_redirect off;
    }
}
EOF

  sudo_cmd ln -sfn "/etc/nginx/sites-available/$APP_NAME" "/etc/nginx/sites-enabled/$APP_NAME"
  sudo_cmd nginx -t >/dev/null 2>&1 || true
  sudo_cmd systemctl reload nginx >/dev/null 2>&1 || true
}

setup_lets_encrypt() {
  local primary_domain="$1"
  local server_names="$2"
  local email="$3"
  local -a certbot_domains=()
  local name

  if [[ "$primary_domain" == "example.com" || -z "$primary_domain" ]]; then
    warn "Skipping Let's Encrypt because no real domain was provided"
    return 0
  fi

  install_certbot

  for name in $server_names; do
    certbot_domains+=("-d" "$name")
  done

  if command -v certbot >/dev/null 2>&1; then
    sudo_cmd certbot --nginx "${certbot_domains[@]}" --non-interactive --agree-tos --email "$email" --redirect >/dev/null 2>&1 || true
    sudo_cmd systemctl reload nginx >/dev/null 2>&1 || true
  fi
}

write_env_files() {
  local database_url="$1"
  local direct_url="$2"
  local nextauth_url="$3"
  local nextauth_secret="$4"
  local site_url="$5"
  local upload_dir="$6"
  local payment_provider="$7"
  local enamad_url="$8"
  local port="$9"

  cat > "$ENV_PROD_FILE" <<EOF
DATABASE_URL="$(shell_escape "$database_url")"
DIRECT_URL="$(shell_escape "$direct_url")"
NEXTAUTH_URL="$(shell_escape "$nextauth_url")"
NEXTAUTH_SECRET="$(shell_escape "$nextauth_secret")"
NEXT_PUBLIC_SITE_URL="$(shell_escape "$site_url")"
UPLOAD_DIR="$(shell_escape "$upload_dir")"
PAYMENT_DEFAULT_PROVIDER="$(shell_escape "$payment_provider")"
ENAMAD_PROFILE_URL="$(shell_escape "$enamad_url")"
PORT="$(shell_escape "$port")"
EOF

  cp "$ENV_PROD_FILE" "$ENV_FILE"
  chmod 600 "$ENV_PROD_FILE" "$ENV_FILE"
}

main() {
  say "Amadeh Pack installer"
  step "Starting installation"
  cd "$APP_DIR"

  install_nodejs
  step "Node.js environment prepared"

  local domain site_url nextauth_url database_url direct_url nextauth_secret upload_dir payment_provider enamad_url port admin_email admin_password admin_name admin_phone server_names ssl_email db_name db_user db_password db_host db_port

  domain="$(prompt_required "Domain name without protocol" "APP_DOMAIN" "localhost")"
  site_url="$(prompt_required "Public site URL" "APP_SITE_URL" "http://localhost:3000")"
  nextauth_url="$(prompt_required "NextAuth URL" "NEXTAUTH_URL" "http://localhost:3000/api/auth")"
  port="$(prompt_required "Application local port" "APP_PORT" "3000")"

  database_url="$(prompt_required "Database URL (or leave blank for manual DB details)" "DATABASE_URL" "")"
  if [[ -z "$database_url" ]]; then
    db_name="$(prompt_required "PostgreSQL database name" "DB_NAME" "postgres")"
    db_user="$(prompt_required "PostgreSQL username" "DB_USER" "postgres")"
    db_password="$(prompt_secret_required "PostgreSQL password" "DB_PASSWORD" "postgres")"
    db_host="$(prompt_required "PostgreSQL host" "DB_HOST" "127.0.0.1")"
    db_port="$(prompt_required "PostgreSQL port" "DB_PORT" "5432")"
    database_url="$(build_database_url "$db_user" "$db_password" "$db_host" "$db_port" "$db_name" "public")"
    direct_url="$database_url"
  else
    database_url="$(normalize_database_url "$database_url")"
    direct_url="$database_url"
  fi

  nextauth_secret="$(prompt_secret_required "NextAuth secret" "NEXTAUTH_SECRET" "$(generate_secret)")"
  upload_dir="$(prompt_required "Upload directory" "UPLOAD_DIR" "$APP_DIR/public/uploads")"
  payment_provider="$(prompt_required "Payment provider code" "PAYMENT_PROVIDER" "zarinpal")"
  enamad_url="$(prompt_required "Enamad profile URL" "ENAMAD_PROFILE_URL" "")"
  admin_email="$(prompt_required "Admin email" "ADMIN_EMAIL" "admin@example.com")"
  admin_name="$(prompt_required "Admin full name" "ADMIN_NAME" "Administrator")"
  admin_phone="$(prompt_required "Admin phone" "ADMIN_PHONE" "")"
  admin_password="$(prompt_secret_required "Admin password" "ADMIN_PASSWORD" "$(generate_secret)")"

  mkdir -p "$APP_DIR/public/uploads"
  write_env_files "$database_url" "$direct_url" "$nextauth_url" "$nextauth_secret" "$site_url" "$upload_dir" "$payment_provider" "$enamad_url" "$port"

  say "Installing npm dependencies"
  export CI=1
  export NODE_OPTIONS="--max-old-space-size=1024"
  export npm_config_jobs=1
  export npm_config_audit=false
  export npm_config_fund=false
  export npm_config_progress=false
  export npm_config_loglevel=error
  export npm_config_cache="$APP_DIR/.npm-cache"
  export npm_config_optional=false
  export npm_config_forever=false
  export npm_config_package_lock=true
  export npm_config_maxsockets=1
  mkdir -p "$APP_DIR/.npm-cache"

  if [[ -d node_modules ]]; then
    warn "Reusing existing node_modules"
  else
    npm install --engine-strict=false --omit=optional --legacy-peer-deps --no-audit --fund=false --progress=false --loglevel=error --cache="$APP_DIR/.npm-cache" --maxsockets=1 --package-lock=false --prefer-offline
  fi

  say "Generating Prisma client"
  npx prisma generate

  if yes_no "Push Prisma schema to database?" "y"; then
    npx prisma db push
  fi

  if yes_no "Seed initial data?" "y"; then
    ADMIN_EMAIL="$admin_email" ADMIN_PASSWORD="$admin_password" ADMIN_NAME="$admin_name" ADMIN_PHONE="$admin_phone" npm run db:seed
  fi

  npm run build -- --no-lint

  if yes_no "Install nginx reverse proxy?" "y"; then
    install_nginx
    server_names="$domain"
    if [[ "$domain" != www.* ]]; then
      server_names="$server_names www.$domain"
    fi
    create_nginx_config "$server_names" "$port"
    say "nginx reverse proxy configured for $server_names"
  fi

  if yes_no "Configure HTTPS with Let's Encrypt?" "y"; then
    ssl_email="$(prompt_required "Let's Encrypt email" "LETSENCRYPT_EMAIL" "")"
    setup_lets_encrypt "$domain" "$domain" "$ssl_email"
  fi

  create_systemd_service "$port"
  say "Installation completed"
}

main "$@"
