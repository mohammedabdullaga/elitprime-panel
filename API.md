# IPTV Config Backend API

Base URL: `http://localhost:3000/api`

This backend exposes a public config endpoint and authenticated admin endpoints for managing hosts, proxy hosts, and app settings.

## Environment

Set these values in `.env`:

- `ADMIN_USERNAME` - admin username for login
- `ADMIN_PASSWORD` - admin password for login
- `JWT_SECRET` - secret used to sign JWT tokens
- `PORT` - optional backend port (defaults to `3000`)

## Authentication

### POST /login

Authenticate and receive a JWT token.

Request body:

```json
{
  "username": "admin",
  "password": "secret-password"
}
```

Success response:

```json
{
  "token": "<jwt-token>"
}
```

Use the token in protected requests:

```http
Authorization: Bearer <jwt-token>
```

## Public config endpoint

### GET /config

Returns the app config used by the Android client.

Response example:

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
  "proxy_hosts": ["ultrproxy.top", "nextproxyurl.com"]
}
```

Notes:

- `proxy_host` returns the first proxy host.
- `proxy_hosts` returns all configured proxy hosts.
- `hosts` are ordered by `priority ASC, id ASC`.

## Hosts Endpoints (Authenticated)

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
