# Deployment: Oracle VM with Docker Compose and Caddy

How the site runs on one Oracle Cloud VM (Johannesburg). The files are in `deploy/`:

| File | What it does |
| --- | --- |
| `deploy/compose.yaml` | Three containers: `caddy` (the only one open to the internet), `api`, and `web`. |
| `deploy/Caddyfile` | Sends `/api/*` to the API and everything else to the web app. Adds security headers, compresses, limits request bodies to 1 MB, and passes on the real visitor address. |
| `deploy/.env.example` | The stack's own settings: host name, ports, and the public values built into the web app. |

Traffic path: browser, Cloudflare (DNS, WAF, rate limits), the VM's Caddy, then the API or web container. The API and web containers have no public port; only Caddy publishes 80 and 443.

## One-time setup

1. **VM.** Create the Oracle VM (check the current free-tier size in the console first) and install Docker with the Compose plugin. Use the Johannesburg region.
2. **Firewall.** In the Oracle network security list, allow inbound 80 and 443 only from Cloudflare's address ranges (https://www.cloudflare.com/ips/), and SSH only from your own address. Nothing else is open.
3. **Cloudflare.** Point the host name at the VM with the proxy on. Set SSL/TLS mode to **Full (strict)**. Caddy gets its certificate by itself; if you prefer a Cloudflare Origin certificate, mount it and add a `tls` line in the Caddyfile.
4. **Code.** Clone the repository onto the VM.
5. **Settings.** In `deploy/`, copy `.env.example` to `.env` and set `SITE_ADDRESS` (for example `example.co.ke`), `ACME_EMAIL`, and the `NEXT_PUBLIC_*` values.
6. **Secrets.** Create `apps/api/.env.local` from `apps/api/.env.example` with the hosted Supabase and R2 values (see `docs/hosted-setup.md`). Keep `REQUIRE_STAFF_MFA=true`. Create `apps/web/.env.local` if the web app needs server-side secrets. These files stay on the VM and are never committed.
7. **Start.**

   ```bash
   cd deploy
   docker compose up -d --build
   ```

8. **Check.** Open `https://<your host>/api/v1/health` (it answers `{"data":{"status":"ok"}}`) and the home page.
9. **Cron.** Create the two Cloudflare Cron Triggers that call the API, as set out in `docs/hosted-setup.md`.

Use separate VMs, separate `.env` files, and separate Supabase and R2 projects for staging and production.

## Updating

```bash
git pull
cd deploy
docker compose up -d --build
```

Compose rebuilds only what changed. Changing a `NEXT_PUBLIC_*` value needs `docker compose up -d --build web`, because those values are written into the browser code when the image is built. Apply new database migrations first with `npx supabase db push` (from a machine linked to the project), then deploy the code that uses them.

To go back, check out the previous commit and run the same command.

## Everyday commands

```bash
docker compose ps                  # health of each container
docker compose logs -f api         # follow the API log (JSON lines)
docker compose logs caddy          # access log
docker compose restart api
```

Logs rotate at 10 MB, five files each.

## What the setup does for safety

- Containers run as a non-root user, with a read-only filesystem, no extra Linux capabilities, and no privilege escalation. The web app gets a small temporary area for its cache.
- Caddy trusts the visitor address only from Cloudflare's ranges, and sends the apps that address, so a visitor cannot write a false one into a header. This matters because the agreement signature records the signer's address.
- The Cloudflare ranges in the `Caddyfile` are a copy. Refresh them from the link above now and then.
- `/api/v1/internal/*` is reachable from the internet, because Cloudflare Cron calls it. The `x-job-secret` header is the guard, so keep `INTERNAL_JOB_SECRET` long and random.

## Not covered

Backups of the database and the off-site copy in Oracle Object Storage, uptime checks (Cloudflare health checks and Sentry), the CI pipeline that builds and scans the images, and automatic deployment. The web app is still the placeholder page.
