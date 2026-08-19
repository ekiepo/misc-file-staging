# Morpheus QR Platform Quick Start

This guide is for registry administrators managing QR codes, destinations, and scan activity.

## The important distinction

Every registry record has two URLs:

- **Tracking URL:** The permanent `misc-file-staging.vercel.app/MOR-QR-###` address encoded in the QR image. Do not change or replace it after the QR has been printed.
- **Final destination:** The webpage opened after a scan. You can update this at any time without regenerating the QR image.

## Sign in

1. Open `https://misc-file-staging.vercel.app/qr/`.
2. Enter the administrator token supplied by the platform owner.
3. Select **Open registry**.

The token remains available only in the current browser tab. Closing the tab signs you out.

## Find a QR code

Use the search field to find a record by QR ID, label, placement, URL, or notes. Use the category controls to limit the table to Packaging, Portal / Resource Hub, Spec Sheet, or User Manual records.

Select a QR ID to open its detail view. From there you can:

- Copy the permanent tracking URL.
- Open the current final destination.
- Review scan and visitor totals.
- Download the QR as an SVG file.
- Open the edit screen.

## Create a QR code

1. Select **New QR**.
2. Enter a clear label, use case, placement, and valid final destination.
3. Add destination type, campaign values, and notes when useful.
4. Select **Create QR code**.
5. Open the new record and download its SVG for print or digital placement.

The platform assigns the next available ID. IDs are permanent and cannot be manually selected or reused.

## Change a destination

1. Select the pencil icon on the registry row, or open the QR detail and select **Edit**.
2. Replace **Final destination** with a valid `https://` URL.
3. Select **Save changes**.
4. Test the permanent tracking URL before publishing the destination change.

The printed QR and tracking URL remain unchanged.

## Disable a QR code

Open the edit screen, change **Status** to **Disabled**, and save. A disabled code remains in the registry and can be reactivated later. Scans are sent to the configured disabled-code fallback.

Use this option when the QR may be needed again.

## Delete a QR code

1. Open the existing record's edit screen.
2. Select **Delete**.
3. Read the confirmation carefully and confirm only when the QR should be permanently removed.

Deletion removes the row and stops its tracking URL from working. The ID remains privately reserved for audit purposes and will never be assigned to another QR code. Deletion cannot be undone from the app. Prefer disabling when uncertain.

## Review analytics

1. Open the **Analytics** tab.
2. Leave both date fields blank for all recorded dates.
3. Optionally choose a start date, end date, or both, then select **Apply**.
4. Use **Top 10** for a concise view or **Show all** for every registry record.
5. Select the refresh icon to retrieve the latest scan activity without changing the selected range.
6. Select the clear-date icon to return to all dates.

Date filtering affects analytics only. Scan totals in the Registry table remain all-time values.

## Import or export CSV

- Select the download icon above the registry to export the current records and scan totals.
- Select the upload icon to import a CSV registry file.

Before importing, confirm that every row has a valid `MOR-QR-###` ID and final destination. Keep an exported copy before a large import.

## Platform settings

Select the gear icon to manage the displayed brand and product names, tracking base URL, and disabled-code fallback. The same screen shows read-only collection health.

Do not change the tracking base URL after physical QR codes have been printed unless the original domain and redirect paths will remain active.

## Common issues

### The admin token is rejected

Confirm that there are no leading or trailing spaces. Ask the platform owner to verify the current `QR_ADMIN_TOKEN` when access still fails.

### A QR opens the wrong page

Find the record, verify its final destination, save any correction, and test the permanent tracking URL directly.

### A scan is not visible in analytics

Clear the date range, select refresh, and confirm that the tracking URL was opened with a normal `GET` request. `HEAD` checks do not create scan events.

### A deleted QR needs to work again

Deleted IDs are not restored or reused. Contact the platform owner before taking further action; do not create a replacement label and assume the printed QR will follow it.
