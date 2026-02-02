**New page created: `/batch-progress`** (`src/app/batch-progress/page.tsx`)
- On load, checks localStorage for `activeBatchId`
- If found, fetches batch status from the API and starts polling every 3 seconds
- Displays a progress card with:
  - Status (processing/completed/error)
  - Progress bar with percentage
  - Processed/total domain count
  - Similar companies found (when complete)
  - Error count (if any)
  - "Started: X minutes ago" elapsed time
- Stops polling and clears localStorage when batch completes
- Shows "No active batch found" with link to start a new batch if no ID exists

**Updated enrichment page** (`src/app/enrichment/page.tsx`)
- When batch starts successfully:
  - Stores `batch_id` in localStorage as `activeBatchId`
  - Redirects to `/batch-progress`
- Removed the inline progress display (now handled by the dedicated page)
- Simplified state management (removed polling logic)
