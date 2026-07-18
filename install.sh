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

is_low_resource_server() {
  if [[ -f /proc/meminfo ]]; then
    local mem_kb
    mem_kb="$(awk '/MemAvailable/ {print $2}' /proc/meminfo 2>/dev/null || true)"
    if [[ -n "$mem_kb" && "$mem_kb" -lt 1200000 ]]; then
      return 0
    fi
  fi
  return 1
}

is_interactive() {
  [[ -t 0 ]] && [[ -t 1 ]]
}

die() {
  printf "\n\033[1;31mError: %s\033[0m\n" "$1" >&2
  exit 1
}

prompt() {
  local label="$1"
  local default="${2:-}"
  local value

  if [[ -n "${INSTALLER_NON_INTERACTIVE:-}" ]] || ! is_interactive; then
    printf "%s" "$default"
    return 0
  fi

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
  local default="${2:-}"
  local value

  if [[ -n "${INSTALLER_NON_INTERACTIVE:-}" ]] || ! is_interactive; then
    if [[ -n "$default" ]]; then
      printf "%s" "$default"
    else
      printf "%s" ""
    fi
    printf "\n" >&2
    return 0
  fi

  read -r -s -p "$label${default:+ [$default]}: " value
  printf "\n" >&2
  printf "%s" "${value:-$default}"
}

yes_no() {
  local label="$1"
  local default="${2:-y}"
  local value

  if [[ -n "${INSTALLER_NON_INTERACTIVE:-}" ]] || ! is_interactive; then
    [[ "$default" =~ ^[Yy]([Ee][Ss])?$ ]]
    return
  fi

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
        if (!/^\d+$/.test(parsed.port)) {
          parsed.port = "5432";
        }
        if (parsed.pathname && parsed.pathname !== "/") {
          parsed.pathname = parsed.pathname.replace(/\/+/g, "/");
        }
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

  if [[ "$url" == postgresql://* || "$url" == postgres://* ]]; then
    url="$(node -e '
      const input = process.argv[1];
      try {
        const parsed = new URL(input);
        const host = parsed.hostname || "localhost";
        const port = /^\d+$/.test(parsed.port) ? parsed.port : "5432";
        const database = (parsed.pathname || "/").replace(/^\/+/, "").replace(/\/+/g, "/") || "postgres";
        const username = parsed.username ? decodeURIComponent(parsed.username) : "postgres";
        const password = parsed.password ? decodeURIComponent(parsed.password) : "";
        const protocol = parsed.protocol || "postgresql:";
        const encodedUser = encodeURIComponent(username);
        const encodedPassword = encodeURIComponent(password);
        const base = `${protocol}//${encodedUser}${password ? ":" + encodedPassword : ""}@${host}:${port}/${database}`;
        const finalUrl = new URL(base);
        for (const [key, value] of parsed.searchParams.entries()) {
          finalUrl.searchParams.set(key, value);
        }
        process.stdout.write(finalUrl.toString());
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
  local db_schema="${6:-public}"

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
  local node_version
  local npm_version

  if command -v node >/dev/null 2>&1; then
    node_version="$(node -v 2>/dev/null || true)"
  fi
  if command -v npm >/dev/null 2>&1; then
    npm_version="$(npm -v 2>/dev/null || true)"
  fi

  if command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1 && node_version != "" && npm_version != ""; then
    if [[ "$node_version" =~ ^v(2[2-9]|[3-9][0-9]) ]]; then
      return
    fi
  fi

  warn "Node.js $node_version or npm $npm_version is not compatible with this project requirements."
  if ! yes_no "Install or upgrade Node.js 22 and npm automatically?" "y"; then
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

  sudo rm -f "/etc/nginx/sites-enabled/default"

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
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Port \$server_port;
        proxy_cache_bypass \$http_upgrade;
        proxy_redirect off;
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

  if ! sudo certbot --nginx \
    "${certbot_domains[@]}" \
    --non-interactive \
    --agree-tos \
    --email "$email" \
    --redirect; then
    die "Let's Encrypt SSL setup failed. Check DNS, firewall, and port 80/443 access."
  fi

  sudo systemctl reload nginx >/dev/null 2>&1 || true
}

main() {
  if [[ "${1:-}" == "--non-interactive" ]]; then
    export INSTALLER_NON_INTERACTIVE=1
  fi

  say "Amadeh Pack manual installer"
  step "Starting installation"
  cd "$APP_DIR"

  if [[ -n "${INSTALLER_NON_INTERACTIVE:-}" ]] || ! is_interactive; then
    warn "No interactive terminal detected. This installer requires explicit values for all configuration fields."
  fi

  if is_low_resource_server; then
    warn "Low-resource server detected. The installer will use lighter defaults and skip optional heavy steps."
    export INSTALLER_LOW_RESOURCE=1
  fi

  install_nodejs
  step "Node.js environment prepared"

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
  local ssl_enabled
  local db_name
  local generated_admin_password
  local db_user
  local db_password
  local db_host
  local db_port
  local db_config

  domain="$(prompt "Domain name without protocol (leave blank for localhost fallback)" "")"
  if [[ -z "$domain" ]]; then
    domain="localhost"
    warn "No domain provided. Falling back to localhost for now."
  fi

  site_url="$(prompt "Public site URL" "https://$domain")"
  [[ -n "$site_url" ]] || site_url="http://$domain"

  nextauth_url="$(prompt "NextAuth URL" "$site_url")"
  [[ -n "$nextauth_url" ]] || nextauth_url="$site_url"

  port="$(prompt "Application local port" "3000")"
  [[ -n "$port" ]] || die "Application local port is required."

  database_url="$(prompt "Database URL (leave blank to enter connection details manually)" "")"
  if [[ -z "$database_url" ]]; then
    warn "Database URL was not provided. Enter the PostgreSQL connection details manually."
    db_name="$(prompt "PostgreSQL database name" "")"
    [[ -n "$db_name" ]] || die "PostgreSQL database name is required."
    db_user="$(prompt "PostgreSQL username" "")"
    [[ -n "$db_user" ]] || die "PostgreSQL username is required."
    db_password="$(prompt_secret "PostgreSQL password" "")"
    [[ -n "$db_password" ]] || die "PostgreSQL password is required."
    db_host="$(prompt "PostgreSQL host" "127.0.0.1")"
    [[ -n "$db_host" ]] || die "PostgreSQL host is required."
    db_port="$(prompt "PostgreSQL port" "5432")"
    [[ -n "$db_port" ]] || die "PostgreSQL port is required."
    database_url="$(build_database_url "$db_user" "$db_password" "$db_host" "$db_port" "$db_name" "public")"
    direct_url="$database_url"
    say "Using manually configured PostgreSQL connection."
  else
    database_url="$(normalize_database_url "$database_url")"
    direct_url="$(normalize_database_url "$database_url")"
  fi

  nextauth_secret="$(prompt_secret "NextAuth secret" "")"
  [[ -n "$nextauth_secret" ]] || die "NextAuth secret is required."

  upload_dir="$(prompt "Upload directory" "./public/uploads")"
  [[ -n "$upload_dir" ]] || die "Upload directory is required."

  payment_provider="$(prompt "Payment provider code" "MOCK")"
  [[ -n "$payment_provider" ]] || die "Payment provider is required."

  enamad_url="$(prompt "Enamad profile URL" "https://enamad.ir")"
  [[ -n "$enamad_url" ]] || die "Enamad profile URL is required."

  admin_email="$(prompt "Admin email" "admin@$domain")"
  [[ -n "$admin_email" ]] || die "Admin email is required."
  admin_name="$(prompt "Admin full name" "مدیر آماده‌پک")"
  [[ -n "$admin_name" ]] || die "Admin full name is required."
  admin_phone="$(prompt "Admin phone" "")"
  admin_password="$(prompt_secret "Admin password" "")"
  admin_password_confirm="$(prompt_secret "Confirm admin password" "")"
  [[ "$admin_password" == "$admin_password_confirm" ]] || die "Admin passwords do not match."
  [[ ${#admin_password} -ge 8 ]] || die "Admin password must be at least 8 characters."

  if [[ -f "$ENV_FILE" || -f "$ENV_PROD_FILE" ]]; then
    warn "Existing env files found. Overwriting them automatically."
  fi

  say "Writing environment files"
  step "Creating environment configuration"
  mkdir -p "$APP_DIR/public/uploads"
  if [[ ! -f "$ENV_FILE" && ! -f "$ENV_PROD_FILE" ]]; then
    touch "$ENV_FILE"
    touch "$ENV_PROD_FILE"
  fi
  write_env_files "$database_url" "$direct_url" "$nextauth_url" "$nextauth_secret" "$site_url" "$upload_dir" "$payment_provider" "$enamad_url" "$port"
  mkdir -p "$upload_dir"
  chmod 755 "$APP_DIR/public" "$APP_DIR/public/uploads" 2>/dev/null || true

  say "Installing npm dependencies"
  step "Installing project dependencies"
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
    warn "Existing node_modules detected. Reusing them to avoid another memory-heavy install."
  else
    if [[ -f package-lock.json ]]; then
      if ! npm ci --engine-strict=false --omit=optional --legacy-peer-deps --no-audit --fund=false --progress=false --loglevel=error --ignore-scripts --cache="$APP_DIR/.npm-cache" --maxsockets=1 --prefer-offline; then
        warn "Primary npm ci failed. Trying the minimal dependency install path."
        npm install --engine-strict=false --omit=optional --legacy-peer-deps --no-audit --fund=false --progress=false --loglevel=error --ignore-scripts --cache="$APP_DIR/.npm-cache" --maxsockets=1 --package-lock=false --prefer-offline --no-package-lock
      fi
    else
      if ! npm install --engine-strict=false --omit=optional --legacy-peer-deps --no-audit --fund=false --progress=false --loglevel=error --ignore-scripts --cache="$APP_DIR/.npm-cache" --maxsockets=1 --package-lock=false --prefer-offline; then
        warn "Primary npm install failed. Trying the minimal dependency install path."
        npm install --engine-strict=false --omit=optional --legacy-peer-deps --ignore-scripts --no-audit --fund=false --progress=false --loglevel=error --cache="$APP_DIR/.npm-cache" --maxsockets=1 --package-lock=false --prefer-offline --no-package-lock
      fi
    fi
  fi

  load_env

  say "Checking Neon/PostgreSQL support"
  if [[ "$DATABASE_URL" == *"neon.tech"* ]]; then
    [[ "$DATABASE_URL" == *"sslmode=require"* ]] || die "Neon DATABASE_URL must include sslmode=require."
    warn "Neon detected. Prisma uses PostgreSQL and this URL is configured with SSL."
  fi

  say "Generating Prisma Client"
  step "Generating Prisma client"
  npx prisma generate

  if [[ -n "${INSTALLER_LOW_RESOURCE:-}" ]]; then
    warn "Skipping Prisma db push in low-resource mode to reduce memory pressure."
  elif yes_no "Push Prisma schema to database?" "y"; then
    npx prisma db push
  fi

  if [[ -n "${INSTALLER_LOW_RESOURCE:-}" ]]; then
    warn "Skipping seed step in low-resource mode."
  elif yes_no "Seed initial catalog, roles, settings, and admin user?" "y"; then
    ADMIN_EMAIL="$admin_email" ADMIN_PASSWORD="$admin_password" ADMIN_NAME="$admin_name" ADMIN_PHONE="$admin_phone" npm run db:seed
  fi

  if [[ -n "${INSTALLER_LOW_RESOURCE:-}" ]]; then
    warn "Low-resource mode: skipping the full production build to avoid memory pressure."
  else
    say "Building Next.js application"
  step "Building the application"
    npm run build -- --no-lint
  fi

  if command -v systemctl >/dev/null 2>&1 && [[ -z "${INSTALLER_LOW_RESOURCE:-}" ]]; then
    require_command sudo
    create_systemd_service "$port"
    say "systemd service started: $APP_NAME"
  fi

  if [[ -z "${INSTALLER_LOW_RESOURCE:-}" ]]; then
    require_command sudo
    install_nginx
    server_names="$domain"
    if [[ "$domain" != www.* ]] && ([[ -n "${INSTALLER_AUTO:-}" ]] || yes_no "Also configure www.$domain?" "y"); then
      server_names="$server_names www.$domain"
    fi
    create_nginx_config "$server_names" "$port"
    say "nginx reverse proxy configured for $server_names"

    ssl_enabled="$(prompt "Enable HTTPS/SSL with Let's Encrypt? (y/n)" "y")"
    if [[ "$ssl_enabled" =~ ^[Yy]([Ee][Ss])?$ ]]; then
      ssl_email="$(prompt "Let's Encrypt email" "$admin_email")"
      setup_lets_encrypt "$domain" "$server_names" "$ssl_email"
      say "Let's Encrypt SSL configured for $server_names"
    else
      warn "HTTPS/SSL was not enabled. The site will remain available over HTTP only."
    fi
  fi

  say "Installation completed"
  step "Installation finished successfully"
  printf "Site URL: %s\n" "$site_url"
  printf "Admin email: %s\n" "$admin_email"
  printf "Admin password: %s\n" "$admin_password"
  printf "App directory: %s\n" "$APP_DIR"
  printf "Env file: %s\n" "$ENV_PROD_FILE"
  printf "Database URL: %s\n" "$database_url"
  printf "Next step: run 'npm run dev' or start the service manually.\n"
}

main "$@"
