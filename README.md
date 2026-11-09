# Shepherd — Church CRM

A deployable Laravel church relationship management application based on the supplied Church CRM prototype and its ten-entity data model.

## Included

- Laravel 12, PHP 8.4, PostgreSQL, Inertia 2, React 19, and TypeScript
- Real session authentication with login throttling and active-account checks
- Admin, staff, and pastor roles
- Responsive dashboard with member, attendance, and giving metrics
- Member search, filters, pagination, create, edit, profile, and archive workflows
- Households and many-to-many ministry group membership
- Attendance, donations, communications, and confidential pastoral notes
- Public devotion QR check-in with masked search results, rate limits, registration, and duplicate protection
- Database-backed sessions and cache for horizontally scaled Vercel instances
- Audit logging on sensitive CRM records
- Vercel container deployment with FrankenPHP and Caddy
- Fictional seed data matching the supplied prototype

## Local setup

Requirements: PHP 8.3+, Composer 2, Node.js 22+, npm, and PostgreSQL 15+.

```bash
cp .env.example .env
composer install
npm install
php artisan key:generate
php artisan migrate --seed
npm run build
composer run dev
```

The sample administrator is read from `DEMO_SEED_EMAIL` and `DEMO_SEED_PASSWORD`. Change both before seeding any shared environment. Set `DEMO_SEED=false` to create only the administrator and omit fictional CRM records.

For a quick SQLite evaluation, create `database/database.sqlite` and set:

```dotenv
DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/database/database.sqlite
```

## Test and validate

```bash
npm run typecheck
npm run build
composer test
./vendor/bin/pint --test
```

## Deploy to Vercel

This repository follows Vercel's container-backed Laravel pattern. `Dockerfile.vercel` builds the React assets, installs production Composer dependencies, and runs Laravel with FrankenPHP/Caddy. `vercel.json` routes all traffic to that service.

1. Provision a durable PostgreSQL database with pooled connections.
2. Copy every setting from `.env.vercel.example` into Vercel Project Settings → Environment Variables.
3. Generate a stable application key locally:

   ```bash
   php artisan key:generate --show
   ```

4. Run migrations as a release/CI step against the production database, not from container startup:

   ```bash
   APP_ENV=production php artisan migrate --force
   ```

5. Create the initial administrator:

   ```bash
   DEMO_SEED=false php artisan db:seed --class=AdminUserSeeder --force
   ```

6. Deploy:

   ```bash
   npm install -g vercel
   vercel deploy --prod
   ```

7. Smoke-test `https://YOUR_DOMAIN/health`, sign in, create a test member, and verify the check-in link from Attendance.

### Required Vercel variables

`APP_KEY`, `APP_URL`, `DATABASE_URL`, `DB_CONNECTION=pgsql`, `DB_SSLMODE=require`, `SESSION_DRIVER=database`, `CACHE_STORE=database`, `LOG_CHANNEL=stderr`, and the administrator seed variables for the one-time seed operation.

### Durable state

The container filesystem is intentionally not used for persistent data. PostgreSQL stores CRM data, sessions, and cache. If profile photos or documents are added later, configure S3-compatible object storage through the included `s3` filesystem disk.

## Roles

| Capability | Admin | Staff | Pastor |
|---|---:|---:|---:|
| View members and dashboard | Yes | Yes | Yes |
| Create members | Yes | Yes | Yes |
| Edit member records | Yes | Yes | No |
| Archive members | Yes | No | No |
| Manage attendance | Yes | Yes | Yes |
| View/create pastoral notes | Yes | No | Yes |

## Important production notes

- Do not commit `.env` files or production credentials.
- Use a separate database and `APP_KEY` for Preview deployments.
- Keep `APP_DEBUG=false` in production.
- Treat giving and pastoral-care data as sensitive; review retention and access requirements with church leadership.
- The public search masks email usernames and is rate-limited, but production teams should still complete a privacy and abuse review.
- Use a durable queue service for asynchronous messaging. The Vercel configuration intentionally uses synchronous jobs.

See `docs/data-model.md`, `docs/production-checklist.md`, and `docs/verification.md` for implementation detail.
"# mfm_church_crm" 
