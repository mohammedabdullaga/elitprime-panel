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

### 1. External APK URL

The APK is not assumed to be hosted on this backend's filesystem. The admin enters the complete APK URL manually, so the download provider can be changed immediately without a code change or APK upload to this server.

Example:

```text
https://some-cdn-or-domain.com/app-release.apk
```

The URL is stored in the SQLite `settings` table as `update_download_url` and is returned in the public config only after server-side validation succeeds.

### 2. Update Metadata Storage

The existing application configuration uses the SQLite `settings` table as a key/value store. To remain consistent, store update metadata using keys such as:

```text
update_version_code
update_version_name
update_release_notes
update_force_update
update_download_url
update_sha256
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
    "sha256": "64-character-manually-provided-sha256"
  }
}
```

All values can be edited through the existing authenticated admin settings panel. The panel provides plain text fields for the download URL and SHA-256; it does not upload APK files.

### 3. SHA-256 Calculation

Use approach (a): the developer manually provides the APK SHA-256 alongside the URL for each release. This is the correct approach because the backend only receives a remote URL and does not have verified filesystem access to the APK. The developer should compute the hash locally before saving it in the panel.

The backend does not download the complete remote APK to calculate a hash.

The backend validates the configured URL with a `HEAD` request, falling back to a ranged `GET` when necessary. It requires a successful response and one of these content types:

- `application/vnd.android.package-archive`
- `application/octet-stream`

Validation results are cached for five minutes and the cache is cleared when the admin changes `update_download_url`.

### 4. Validation Before Implementation

Before writing code:

1. Confirm the external APK host and its actual response `Content-Type`.
2. Confirm whether the Android app expects `version_code` as an integer and how it compares versions.
3. Confirm whether release notes should be plain text or an array of strings.
4. Provide the real SHA-256 generated from the APK release artifact.

If URL validation fails, `/api/config` still returns the base configuration but omits `update`, preventing the Android app from receiving a broken download link.
