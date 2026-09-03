# Android App Public API

Public API Base URL:

```
https://api.arenaliveapp.top/api
```

## Public config endpoint

### GET /config

This endpoint is the only public API used by the Android app. No authentication is required.

Full URL:

```
https://api.arenaliveapp.top/api/config
```

### Response

```json
{
  "tmdb_api_key": "your_tmdb_api_key",
  "hosts": [
    {
      "id": 1,
      "url": "http://example.com:80",
      "status": "active",
      "priority": 0,
      "created_at": "2026-07-31 10:53:53"
    }
  ],
  "proxy_host": "ultrproxy.top",
  "proxy_hosts": ["ultrproxy.top", "nextproxyurl.com"],
  "update": {
    "version_code": 12,
    "version_name": "2.1.0",
    "release_notes": "Performance improvements and bug fixes.",
    "force_update": false,
    "download_url": "https://cdn.example.com/app-release.apk",
    "sha256": "64-character-manually-provided-sha256"
  }
}
```

### Notes

- `hosts` contains the active IPTV hosts returned in priority order.
- `proxy_host` returns the first proxy host for compatibility.
- `proxy_hosts` returns all configured proxy hosts.
- `tmdb_api_key` is the TMDB API key used by the app.
- `update` is included only when the configured download URL responds successfully with an APK or binary content type.
- `update.download_url` and `update.sha256` are manually managed through the authenticated admin settings panel.
- `update.sha256` is not calculated by this backend.

### GET /hosts

Retrieve all hosts.

Response example:

```json
[
  {
    "id": 1,
    "url": "http://example.com:80",
    "status": "active",
    "priority": 0,
    "created_at": "2026-07-31 10:53:53"
  }
]
```

### POST /hosts

Create a new host.

Request body:

```json
{
  "url": "http://example.com:80",
  "status": "active",
  "priority": 0
}
```

Success response: created host object.

### PUT /hosts/:id

Update an existing host.

Request body can contain any of:

```json
{
  "url": "http://updated.example.com:80",
  "status": "active",
  "priority": 1
}
```

### DELETE /hosts/:id

Delete a host by ID.

Response:

```json
{ "success": true }
```

## Proxies Endpoints (Authenticated)

### GET /proxies

Retrieve all proxy hosts.

Response example:

```json
[
  { "id": 1, "host": "ultrproxy.top", "created_at": "2026-07-31 10:53:53" },
  { "id": 2, "host": "nextproxyurl.com", "created_at": "2026-07-31 10:55:00" }
]
```

### POST /proxies

Create a new proxy host.

Request body:

```json
{
  "host": "newproxy.example.com"
}
```

### PUT /proxies/:id

Update an existing proxy host.

Request body:

```json
{
  "host": "updatedproxy.example.com"
}
```

### DELETE /proxies/:id

Delete a proxy host by ID.

Response:

```json
{ "success": true }
```

## Settings Endpoints (Authenticated)

### GET /settings

Retrieve all settings as a key/value object.

Response example:

```json
{
  "tmdb_api_key": "your_tmdb_api_key"
}
```

### PUT /settings

Create or update settings.

Request body example:

```json
{
  "tmdb_api_key": "your_tmdb_api_key"
}
```

Response example:

```json
{
  "tmdb_api_key": "your_tmdb_api_key"
}
```

## Notes

- All admin routes (`/hosts`, `/proxies`, `/settings`) require a valid `Authorization: Bearer <token>` header.
- CORS is currently configured to allow requests from any origin.
- Host priority works as follows:
  - lower `priority` values come first
  - if two hosts share the same priority, the earlier-created host (`id` smaller) appears first
