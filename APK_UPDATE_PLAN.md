# Android APK Auto-Updater Plan

## Investigation Findings

### 1. Existing Config Endpoint

The backend is Node.js with Express.

In `server.js`, the API routes are mounted with:

```js
app.use('/api', apiRoutes);
```

In `routes.js`, the public config endpoint is:

```http
GET /api/config
```

The deployed endpoint is:

```text
https://api.arenaliveapp.top/api/config
```

The current live response is:

```json
{
  "tmdb_api_key": "[redacted]",
  "hosts": [
    {
      "id": 12,
      "url": "http://superena12.site",
      "status": "active",
      "priority": 0,
      "created_at": "2026-08-23 11:41:59"
    }
  ],
  "proxy_host": "cdn.sharkbh.online",
  "proxy_hosts": [
    "cdn.sharkbh.online"
  ]
}
```

The response values currently come from SQLite:

- `tmdb_api_key`: `settings` table.
- `hosts`: `hosts` table, filtered to active hosts.
- `proxy_host` and `proxy_hosts`: `proxies` table.
- Environment variables are used for admin authentication, JWT configuration, and the server port only.

Hosts are sorted by:

```sql
priority ASC, id ASC
```

### 2. Static Files and nginx

The repository currently contains no:

- `express.static(...)` middleware.
- `sendFile(...)` handler.
- APK directory.
- nginx configuration file.
- Docker, systemd, PM2, or deployment configuration.

The deployed domain is behind nginx:

```http
Server: nginx/1.24.0 (Ubuntu)
X-Powered-By: Express
```

`/api/config` is handled by Express behind nginx. The root URL currently serves the admin panel HTML.

The following paths were probed and do not currently serve an APK:

```text
/app-release.apk
/downloads/
/static/
```

They return HTML, which indicates there is no working public APK download path yet. The exact nginx server-block configuration is not available in the local repository and must be checked directly on the VPS.

### 3. Deployment Workflow

No deployment workflow is represented in the repository.

The repository has:

- Git remote: `https://github.com/mohammedabdullaga/elitprime-panel.git`
- One branch: `main`.
- No GitHub Actions workflow.
- No deployment script.
- No SCP, SFTP, or rsync script.
- No PM2 or systemd configuration.
- No Docker configuration.

Git pushes are being made to GitHub, but the repository does not prove that the VPS automatically pulls, builds, or restarts after a push. The actual VPS deployment process must be confirmed separately.

## Proposed Implementation Plan

### 1. Public APK Download Directory

Use a dedicated directory on the VPS, for example:

```text
/var/www/arenalive-downloads/
```

Configure the existing nginx server block for `api.arenaliveapp.top` with a public `/downloads/` location.

The APK would be available at:

```text
https://api.arenaliveapp.top/downloads/app-release.apk
```

nginx should serve the APK directly, while Express should continue serving the JSON config endpoint.

The exact filesystem path should be confirmed from the VPS nginx configuration before implementation.

### 2. Update Metadata Storage

The existing application configuration uses the SQLite `settings` table as a key/value store. To remain consistent, store update metadata using keys such as:

```text
update_version_code
update_version_name
update_release_notes
update_force_update
update_download_url
```

The public config response would expose these values as an `update` object:

```json
{
  "update": {
    "version_code": 12,
    "version_name": "2.1.0",
    "release_notes": "Performance improvements and bug fixes.",
    "force_update": false,
    "download_url": "https://api.arenaliveapp.top/downloads/app-release.apk",
    "sha256": "..."
  }
}
```

The values can be managed through the existing authenticated admin settings API.

### 3. SHA-256 Calculation

Because no automated deployment workflow is verified, calculate the APK SHA-256 from the file available on the VPS rather than relying only on a manually generated value.

Recommended approach:

- Calculate the hash when the config endpoint needs it.
- Cache the calculated hash in memory.
- Check the APK file modification time before reusing the cached hash.
- Recalculate the hash whenever the APK is replaced.

This avoids stale hashes if the APK is uploaded manually or replaced outside git, while avoiding repeated hashing of the APK on every request.

### 4. Validation Before Implementation

Before writing code:

1. Inspect the nginx server block on the VPS for `api.arenaliveapp.top`.
2. Confirm the current frontend root and the best filesystem location for `/downloads/`.
3. Confirm whether deployment is manual or automated.
4. Confirm the APK filename and whether the download URL should be versioned.
5. Confirm the Android app's expected field names and update comparison rules.
6. Confirm whether release notes should be plain text or an array of strings.

Implementation should begin only after these details are approved.
