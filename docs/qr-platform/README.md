# Morpheus QR Tracking Platform

The QR platform is deployed as part of the existing `misc-file-staging` Vercel project without changing the document portal at `/` or the existing Morpheus resources under `/morpheus`.

## Production routes

- Registry administration: `https://misc-file-staging.vercel.app/qr/`
- Permanent tracking URL: `https://misc-file-staging.vercel.app/MOR-QR-001`
- Generated QR SVG: `https://misc-file-staging.vercel.app/api/qr/code/MOR-QR-001`

The QR image contains only the permanent tracking URL. A scan reaches the public redirect function, records a privacy-safe event, and returns a `302` redirect to the registry's editable final destination. Changing the final destination does not require regenerating or reprinting the QR code.

## User documentation

- [Quick-start guide](./QUICK-START.md) for registry administrators unfamiliar with the app.

## Storage

The registry, deleted-record tombstones, scan events, and destination-change history are private objects in the dedicated `morpheus-qr-data` Vercel Blob store connected to this project:

- `morpheus-qr/registry.json`
- `morpheus-qr/scans/{QR_ID}/{YYYY-MM-DD}/...json`
- `morpheus-qr/history/{QR_ID}/...json`

On the first request, the registry is initialized from `qr/data/seed.json`. That seed is derived from the supplied CSV and preserves every existing `MOR-QR-###` identifier.

Deleted records are removed from the active registry and retained in the registry object's `deletedRecords` collection with deletion metadata. Their identifiers remain permanently reserved and are never assigned to a new QR code.

## Required Vercel environment

| Variable | Purpose |
| --- | --- |
| `BLOB_READ_WRITE_TOKEN` | Injected by the private `morpheus-qr-data` Blob store. |
| `MEDIA_BLOB_READ_WRITE_TOKEN` | Preserves the existing public Blob store used by `/api/upload`. |
| `QR_ADMIN_TOKEN` | Bearer token required by all registry mutation and reporting APIs. |
| `VISITOR_HASH_SALT` | Secret salt used for rotating, one-day visitor hashes. Raw IP addresses are not stored. |
| `TRACKING_BASE_URL` | Canonical origin encoded in generated QRs. Set to `https://misc-file-staging.vercel.app`. |
| `DISABLED_REDIRECT_URL` | Optional destination used when a QR record is disabled or redirect storage is unavailable. |

Brand name, product name, tracking base URL, and disabled-code fallback can also be changed from the registry settings screen. Treat the tracking base as permanent after physical codes are printed.

## Administration flow

The `/qr/` page itself is static and displays no registry data until a valid admin token is supplied. The token is kept in browser `sessionStorage`, so closing the tab clears the session. All registry APIs independently validate the bearer token; the public redirect and QR-image endpoints do not require authentication.

### Registry

- Search and filter the authoritative registry without changing its stored order or identifiers.
- Create a QR with the next permanently reserved `MOR-QR-###` identifier.
- Open a QR detail view to copy its tracking URL or download its SVG.
- Edit its label, placement, final destination, campaign values, notes, or active status without changing the tracking URL.
- Delete an existing row from its edit screen. Deletion requires confirmation, removes the active redirect, preserves a private tombstone, and prevents the identifier from being reused. Scans of a deleted tracking URL return `404`.
- Import registry CSV records or export the current registry and scan totals.

### Analytics

- Summary metrics and the scan-performance chart default to all recorded dates.
- Start and end dates are optional and inclusive. Either bound can be used independently; clearing the range restores all dates.
- Date filters use the UTC date stored in each scan event and affect analytics metrics and chart rows only. Registry table scan counts remain all-time.
- `Top 10` is the default chart scope; `Show all` displays every registry record.
- Refresh reloads analytics from the API while preserving the selected date range and chart scope.

### Settings

Settings contains editable brand, product, tracking-origin, and disabled-code fallback values. The same screen includes read-only collection health for registry loading, bot classification, raw-IP storage, and redirect mode.

## API behavior

| Endpoint | Methods | Access | Purpose |
| --- | --- | --- | --- |
| `/api/qr` | `GET`, `POST` | Admin | List records with analytics or create the next QR ID. `GET` accepts optional `from` and `to` dates in `YYYY-MM-DD` format. |
| `/api/qr/{MOR-QR-ID}` | `PATCH`, `DELETE` | Admin | Update an existing record or remove it while retaining its private tombstone. |
| `/api/qr/import` | `POST` | Admin | Upsert authoritative CSV records without changing existing tracking slugs. |
| `/api/qr/settings` | `PATCH` | Admin | Update editable platform settings. |
| `/api/qr/code/{MOR-QR-ID}` | `GET`, `HEAD` | Public | Generate an SVG encoding the permanent tracking URL. |
| `/MOR-QR-{suffix}` | `GET`, `HEAD` | Public | Record a scan on `GET` and return the editable `302` destination. |

## Porting to another domain

1. Deploy this repository to the replacement Vercel project and connect a Blob store.
2. Set the required environment variables in that project.
3. Copy the private `morpheus-qr/` Blob objects if existing edits and analytics must move with it; otherwise the authoritative seed creates a fresh registry.
4. Set `TRACKING_BASE_URL` before generating any new physical QR codes.
5. Keep the original domain and root `MOR-QR-*` redirect routes active for every code already printed. A domain encoded in a physical QR cannot be changed remotely.

Run `npm test` and `npm run check:qr` before deployment.
