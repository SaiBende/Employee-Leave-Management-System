# Deployment

Production runs on a single AWS EC2 instance with Docker Compose:

```
Internet :80 / :443
        │
        ▼
   ems-caddy (Caddy, automatic HTTPS)
        ├── ems.saibende.in      ──▶ ems-frontend (nginx) ──/api──▶ ems-backend
        └── api-ems.saibende.in  ─────────────────────────────────▶ ems-backend
                                                                          │
                                                                          ▼
                                                                  ems-postgres
```

- Frontend and backend images are built by GitHub Actions on every push to `main`
  and pushed to GitHub Container Registry (GHCR).
- The deploy job connects to EC2 over SSH, refreshes `~/ems/.env`, pulls the new
  images and recreates the containers.
- PostgreSQL data lives in the named Docker volume `ems_postgres_data` and is
  never touched by deploys.
- Caddy terminates TLS on ports 80/443 and obtains free Let's Encrypt
  certificates for `ems.saibende.in` and `api-ems.saibende.in`. Certificates
  live in the `ems_caddy_data` volume and renew automatically.

## Pipeline

`.github/workflows/deploy.yml`:

1. **build** – builds `backend/Dockerfile` and `frontend/Dockerfile`, pushes
   `:latest` and `:<git-sha>` tags to GHCR.
2. **deploy** – uploads `deploy/docker-compose.yml` and `deploy/Caddyfile`, writes
   `~/ems/.env`, logs in to GHCR with the short-lived `GITHUB_TOKEN`, runs
   `docker compose pull` and `docker compose up -d --wait`, then verifies both
   HTTPS endpoints.

Runs are queued (not cancelled) so a deploy is never interrupted halfway.

## Required GitHub repository secrets

| Secret | Purpose |
| --- | --- |
| `EC2_HOST` | Public hostname/IP of the instance |
| `EC2_USER` | SSH user (`ubuntu`) |
| `EC2_SSH_KEY` | Private key contents (`.pem`) |
| `POSTGRES_PASSWORD` | Database password used by Postgres and the backend |
| `JWT_SECRET` | JWT signing key (32+ random bytes) |

The repository's **Settings → Actions → General → Workflow permissions** must
allow read and write (the build job needs `packages: write`).

## AWS setup checklist

- EC2 instance with Docker + Docker Compose installed; `ubuntu` user in the
  `docker` group.
- Security group inbound rules: `22` from your IP, `80` and `443` from
  `0.0.0.0/0`.
- Attach an **Elastic IP**; otherwise the public IP changes on stop/start and
  `EC2_HOST` and DNS must be updated.
- 2 GB RAM is enough for this stack (backend heap is capped at 512 MB); a 1 GB
  swap file is recommended as insurance.

## DNS and HTTPS

DNS for `saibende.in` is hosted at Vercel. Two A records point at the EC2
Elastic IP:

| Type | Name | Value |
| --- | --- | --- |
| A | `ems` | Elastic IP |
| A | `api-ems` | Elastic IP |

The apex and `www` records are unaffected.

Caddy obtains and renews certificates automatically once DNS resolves and ports
80/443 are reachable. No manual certificate steps are required. To force a new
certificate (for example after changing a hostname), remove the `ems_caddy_data`
volume:

```bash
cd ~/ems
docker compose down
docker volume rm ems_caddy_data
docker compose up -d --wait
```

Note: Let's Encrypt rate-limits duplicate certificates, so do this sparingly.

## Operations

```bash
cd ~/ems

docker compose ps                 # status + health
docker compose logs -f caddy      # TLS / reverse proxy logs
docker compose logs -f backend    # backend logs
docker compose logs -f frontend   # nginx logs
docker compose restart backend    # restart one service
docker compose down               # stop (keeps DB and certificate volumes)
```

### Manual redeploy

GitHub → Actions → **Deploy to AWS EC2** → **Run workflow**, or push any commit
to `main`.

### Rollback

Every image is also tagged with its commit SHA. On the server:

```bash
cd ~/ems
sed -i 's/^IMAGE_TAG=.*/IMAGE_TAG=<previous-sha>/' .env
docker compose pull && docker compose up -d --wait
```

To find previous SHAs: `git log --oneline` locally, or the Actions run list.

### Database backup / restore

```bash
# backup
docker exec ems-postgres pg_dump -U admin -d leave_management > ~/leave_management.sql

# restore
cat ~/leave_management.sql | docker exec -i ems-postgres psql -U admin -d leave_management
```

### First admin account

A fresh database has no admin user. Open `https://ems.saibende.in/register` and
create the first account — the backend automatically makes the first registered
user an `ADMIN`. Subsequent self-registrations become `MANAGER`s.

## Endpoints

| URL | Purpose |
| --- | --- |
| `https://ems.saibende.in` | Web app |
| `https://ems.saibende.in/api/health` | Health check |
| `https://api-ems.saibende.in/api/health` | API health check |
| `https://api-ems.saibende.in/swagger-ui/index.html` | Swagger UI |

## Notes

- `application.properties` still contains local-dev defaults; production values
  are supplied entirely through environment variables in `deploy/docker-compose.yml`.
- `spring.jpa.hibernate.ddl-auto=update` creates the schema on first boot. There
  is no migration tool yet, so schema changes should stay backward compatible.
- TLS is terminated by the `caddy` service. Port 80 is only used for ACME
  challenges and HTTP→HTTPS redirects.
