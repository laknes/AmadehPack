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

die() {
  printf "\n\033[1;31mError: %s\033[0m\n" "$1" >&2
  exit 1
}

prompt() {
  local label="$1"
  local default="${2:-}"
  local value
  if [[ -n "$default" ]]; then
    read -r -p "$label [$default]: " value
    printf "%s" "${value:-$default}"
  else
    read -r -p "$label: " value
    printf "%s" "$value"
  fi
}

prompt_secret() {
  local label="$1"
  local value
  read -r -s -p "$label: " value
  printf "\n" >&2
  printf "%s" "$value"
}

yes_no() {
  local label="$1"
  local default="${2:-y}"
  local value
  read -r -p "$label [$default]: " value
  value="${value:-$default}"
  [[ "$value" =~ ^[Yy]([Ee][Ss])?$ ]]
}

append_query_param() {
  local url="$1"
  local param="$2"
  if [[ "$url" == *"?"* ]]; then
    printf "%s&%s" "$url" "$param"
  else
    printf "%s?%s" "$url" "$param"
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
        process.stdout.write(parsed.toString());
      } catch {
        process.stdout.write(input);
      }
    ' "$url")"
  fi

  if [[ "$url" == *"neon.tech"* && "$url" != *"sslmode="* ]]; then
    url="$(append_query_param "$url" "sslmode=require")"
  fi
  if [[ "$url" == *"-pooler."* && "$url" != *"pgbouncer="* ]]; then
    url="$(append_query_param "$url" "pgbouncer=true")"
  fi
  printf "%s" "$url"
}

url_encode_component() {
  local value="$1"
  node -e 'process.stdout.write(encodeURIComponent(process.argv[1] ?? ""));' "$value"
}

shell_escape() {
  local value="$1"
  value="${value//\\/\\\\}"
  value="${value//\"/\\\"}"
  printf "%s" "$value"
}

generate_secret() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -base64 48 | tr -d '\n'
  elif command -v node >/dev/null 2>&1; then
    node -e "process.stdout.write(require('crypto').randomBytes(48).toString('base64'))"
  else
    die "openssl or node is required to generate NEXTAUTH_SECRET."
  fi
}

install_nodejs() {
  if command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1; then
    return
  fi

  warn "node and/or npm was not found."
  if ! yes_no "Install Node.js 22 and npm automatically?" "y"; then
    die "node and npm are required to install and run this application."
  fi

  require_command sudo

  if command -v apt-get >/dev/null 2>&1; then
    sudo apt-get update
    sudo apt-get install -y ca-certificates curl gnupg
    sudo install -d -m 0755 /etc/apt/keyrings
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_22.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list >/dev/null
    sudo apt-get update
    sudo apt-get install -y nodejs
  elif command -v dnf >/dev/null 2>&1; then
    sudo dnf install -y nodejs npm
  elif command -v yum >/dev/null 2>&1; then
    sudo yum install -y nodejs npm
  else
    die "Could not install Node.js automatically. Install Node.js 22 and npm, then run this script again."
  fi

  command -v node >/dev/null 2>&1 || die "Node.js installation failed."
  command -v npm >/dev/null 2>&1 || die "npm installation failed."
}

install_nginx() {
  if command -v nginx >/dev/null 2>&1; then
    return
  fi

  warn "nginx was not found."
  if ! yes_no "Install nginx automatically?" "y"; then
    die "nginx is required for reverse proxy and Let's Encrypt SSL."
  fi

  require_command sudo

  if command -v apt-get >/dev/null 2>&1; then
    sudo apt-get update
    sudo apt-get install -y nginx
  elif command -v dnf >/dev/null 2>&1; then
    sudo dnf install -y nginx
  elif command -v yum >/dev/null 2>&1; then
    sudo yum install -y nginx
  else
    die "Could not install nginx automatically. Install nginx, then run this script again."
  fi

  sudo systemctl enable nginx
  sudo systemctl start nginx
}

install_certbot() {
  if command -v certbot >/dev/null 2>&1; then
    return
  fi

  warn "certbot was not found."
  if ! yes_no "Install certbot automatically?" "y"; then
    die "certbot is required for Let's Encrypt SSL."
  fi

  require_command sudo

  if command -v apt-get >/dev/null 2>&1; then
    sudo apt-get update
    sudo apt-get install -y certbot python3-certbot-nginx
  elif command -v dnf >/dev/null 2>&1; then
    sudo dnf install -y certbot python3-certbot-nginx
  elif command -v yum >/dev/null 2>&1; then
    sudo yum install -y certbot python3-certbot-nginx
  else
    die "Could not install certbot automatically. Install certbot and the nginx plugin, then run this script again."
  fi
}

install_postgresql() {
  if command -v psql >/dev/null 2>&1; then
    return
  fi

  warn "PostgreSQL client was not found."
  if ! yes_no "Install PostgreSQL locally on this server?" "y"; then
    die "PostgreSQL is required to install and run this application."
  fi

  require_command sudo

  if command -v apt-get >/dev/null 2>&1; then
    sudo apt-get update
    sudo apt-get install -y postgresql postgresql-contrib
  elif command -v dnf >/dev/null 2>&1; then
    sudo dnf install -y postgresql postgresql-server
  elif command -v yum >/dev/null 2>&1; then
    sudo yum install -y postgresql postgresql-server
  else
    die "Could not install PostgreSQL automatically. Install PostgreSQL, then run this script again."
  fi

  if command -v systemctl >/dev/null 2>&1; then
    sudo systemctl enable postgresql >/dev/null 2>&1 || true
    sudo systemctl start postgresql >/dev/null 2>&1 || true
  fi

  if command -v service >/dev/null 2>&1; then
    sudo service postgresql start >/dev/null 2>&1 || true
  fi

  command -v psql >/dev/null 2>&1 || die "PostgreSQL installation failed."
}

configure_local_postgresql() {
  local db_name="${1:-amadeh_pack}"
  local db_user="${2:-amadeh_pack}"
  local db_password="${3:-$(generate_secret)}"
  local host="${4:-127.0.0.1}"
  local port="${5:-5432}"

  install_postgresql

  if command -v systemctl >/dev/null 2>&1; then
    sudo systemctl enable postgresql >/dev/null 2>&1 || true
    sudo systemctl start postgresql >/dev/null 2>&1 || true
  fi
  if command -v service >/dev/null 2>&1; then
    sudo service postgresql start >/dev/null 2>&1 || true
  fi

  sudo -u postgres psql -v ON_ERROR_STOP=1 -tc "SELECT 1 FROM pg_roles WHERE rolname='${db_user}'" | grep -q 1 || \
    sudo -u postgres psql -v ON_ERROR_STOP=1 -c "CREATE ROLE ${db_user} WITH LOGIN PASSWORD '${db_password}';"

  sudo -u postgres psql -v ON_ERROR_STOP=1 -tc "SELECT 1 FROM pg_database WHERE datname='${db_name}'" | grep -q 1 || \
    sudo -u postgres psql -v ON_ERROR_STOP=1 -c "CREATE DATABASE ${db_name} OWNER ${db_user};"

  printf "%s\n%s\n%s\n%s\n%s\n" "$db_name" "$db_user" "$db_password" "$host" "$port"
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || die "$1 is required but was not found."
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

load_env() {
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
}

create_systemd_service() {
  local port="$1"
  local node_path
  local npm_path
  node_path="$(command -v node)"
  npm_path="$(command -v npm)"

  sudo tee "/etc/systemd/system/$APP_NAME.service" >/dev/null <<EOF
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

  sudo systemctl daemon-reload
  sudo systemctl enable "$APP_NAME"
  sudo systemctl restart "$APP_NAME"
}

create_nginx_config() {
  local server_names="$1"
  local port="$2"
  command -v nginx >/dev/null 2>&1 || die "nginx is not installed."

  sudo tee "/etc/nginx/sites-available/$APP_NAME" >/dev/null <<EOF
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
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

  sudo ln -sfn "/etc/nginx/sites-available/$APP_NAME" "/etc/nginx/sites-enabled/$APP_NAME"
  sudo nginx -t
  sudo systemctl reload nginx
}

setup_lets_encrypt() {
  local primary_domain="$1"
  local server_names="$2"
  local email="$3"
  local -a certbot_domains=()
  local name

  [[ "$primary_domain" != "example.com" ]] || die "Use a real domain before enabling Let's Encrypt."
  [[ -n "$email" ]] || die "Email is required for Let's Encrypt."

  install_certbot

  for name in $server_names; do
    certbot_domains+=("-d" "$name")
  done

  sudo certbot --nginx \
    "${certbot_domains[@]}" \
    --non-interactive \
    --agree-tos \
    --email "$email" \
    --redirect

  sudo systemctl reload nginx
}

main() {
  say "Amadeh Pack automated installer"
  cd "$APP_DIR"

  install_nodejs

  local domain
  local site_url
  local nextauth_url
  local database_url
  local direct_url
  local nextauth_secret
  local upload_dir
  local payment_provider
  local enamad_url
  local port
  local admin_email
  local admin_password
  local admin_password_confirm
  local admin_name
  local admin_phone
  local server_names
  local ssl_email
  local db_name
  local db_user
  local db_password
  local db_host
  local db_port
  local db_config

  domain="$(prompt "Domain name without protocol" "example.com")"
  site_url="$(prompt "Public site URL" "https://$domain")"
  nextauth_url="$(prompt "NextAuth URL" "$site_url")"
  port="$(prompt "Application port" "3000")"

  database_url="$(prompt "PostgreSQL/Neon DATABASE_URL (leave blank for local PostgreSQL)")"
  if [[ -z "$database_url" ]]; then
    warn "No database URL was provided. A local PostgreSQL instance will be configured on this server."
    db_config="$(configure_local_postgresql)"
    mapfile -t db_settings <<< "$db_config"
    db_name="${db_settings[0]}"
    db_user="${db_settings[1]}"
    db_password="${db_settings[2]}"
    db_host="${db_settings[3]}"
    db_port="${db_settings[4]}"
    database_url="postgresql://$(url_encode_component "$db_user"):$(url_encode_component "$db_password")@${db_host}:${db_port}/${db_name}?schema=public"
    direct_url="$database_url"
    say "Local PostgreSQL configured for database '$db_name'."
  else
    database_url="$(normalize_database_url "$database_url")"
    direct_url="$(prompt "DIRECT_URL for Neon non-pooled connection (optional)" "$database_url")"
    direct_url="$(normalize_database_url "$direct_url")"
  fi

  nextauth_secret="$(generate_secret)"
  say "NEXTAUTH_SECRET generated automatically."

  upload_dir="$(prompt "Upload directory" "./public/uploads")"
  payment_provider="$(prompt "Default payment provider" "MOCK")"
  enamad_url="$(prompt "Enamad profile URL" "https://enamad.ir")"

  admin_email="$(prompt "Admin email" "admin@$domain")"
  admin_name="$(prompt "Admin name" "مدیر آماده‌پک")"
  admin_phone="$(prompt "Admin phone" "")"
  admin_password="$(prompt_secret "Admin password")"
  admin_password_confirm="$(prompt_secret "Confirm admin password")"
  [[ "$admin_password" == "$admin_password_confirm" ]] || die "Admin passwords do not match."
  [[ ${#admin_password} -ge 8 ]] || die "Admin password must be at least 8 characters."

  if [[ -f "$ENV_FILE" || -f "$ENV_PROD_FILE" ]]; then
    yes_no "Existing env files found. Overwrite them?" "n" || die "Installation cancelled."
  fi

  say "Writing environment files"
  write_env_files "$database_url" "$direct_url" "$nextauth_url" "$nextauth_secret" "$site_url" "$upload_dir" "$payment_provider" "$enamad_url" "$port"
  mkdir -p "$upload_dir"

  say "Installing npm dependencies"
  if [[ -f package-lock.json ]]; then
    npm ci
  else
    npm install
  fi

  load_env

  say "Checking Neon/PostgreSQL support"
  if [[ "$DATABASE_URL" == *"neon.tech"* ]]; then
    [[ "$DATABASE_URL" == *"sslmode=require"* ]] || die "Neon DATABASE_URL must include sslmode=require."
    warn "Neon detected. Prisma uses PostgreSQL and this URL is configured with SSL."
  fi

  say "Generating Prisma Client"
  npx prisma generate

  if yes_no "Push Prisma schema to database?" "y"; then
    npx prisma db push
  fi

  if yes_no "Seed initial catalog, roles, settings, and admin user?" "y"; then
    ADMIN_EMAIL="$admin_email" ADMIN_PASSWORD="$admin_password" ADMIN_NAME="$admin_name" ADMIN_PHONE="$admin_phone" npm run db:seed
  fi

  say "Building Next.js application"
  npm run build

  if command -v systemctl >/dev/null 2>&1 && yes_no "Create and start systemd service '$APP_NAME'?" "y"; then
    require_command sudo
    create_systemd_service "$port"
    say "systemd service started: $APP_NAME"
  fi

  if yes_no "Create nginx reverse proxy for $domain?" "n"; then
    require_command sudo
    install_nginx
    server_names="$domain"
    if [[ "$domain" != www.* ]] && yes_no "Also configure www.$domain?" "y"; then
      server_names="$server_names www.$domain"
    fi
    create_nginx_config "$server_names" "$port"
    say "nginx reverse proxy configured for $server_names"

    if yes_no "Configure Let's Encrypt SSL for $server_names?" "y"; then
      ssl_email="$(prompt "Let's Encrypt email" "$admin_email")"
      setup_lets_encrypt "$domain" "$server_names" "$ssl_email"
      say "Let's Encrypt SSL configured for $server_names"
    fi
  fi

  say "Installation completed"
  printf "Site URL: %s\n" "$site_url"
  printf "Admin email: %s\n" "$admin_email"
  printf "App directory: %s\n" "$APP_DIR"
  printf "Env file: %s\n" "$ENV_PROD_FILE"
}

main "$@"
