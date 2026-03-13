# TUS Video Upload Implementation

## Overview

Updated video lesson upload flow to use the TUS (Resumable Uploads) protocol via Bunny Stream, with improved reliability for poor networks and mobile connections.

## Changes Made

### 1. Updated `CreateVideoResult` Type

**File:** `src/features/product-courses/types.ts`

Changed from old response structure to new TUS credentials response:

```typescript
// Before
export interface CreateVideoResult {
  videoId: number;
  videoGuid: string;
  uploadUrl: string;
  libraryId: number;
  libraryApiKey: string;
}

// After
export interface CreateVideoResult {
  id: number;
  authorizationSignature: string;
  authorizationExpire: number;
  libraryId: number;
  videoId: string;
}
```

### 2. Implemented TUS Upload Function

**File:** `src/features/product-courses/api.ts`

- Added import: `import * as tus from "tus-js-client";`
- Replaced `uploadVideoToBunny()` function with TUS protocol implementation
- New function handles:
  - TUS endpoint: `https://video.bunnycdn.com/tusupload`
  - Automatic retry with exponential backoff: `[0, 3000, 5000, 10000, 20000, 60000, 60000]`
  - Resume from previous uploads if connection drops
  - Progress tracking callback
  - Proper error handling

**Key Features:**

- Resumable uploads: Can resume from where upload was interrupted
- Mobile-friendly: Better handling of poor network connections
- Metadata support: Automatically includes file type and title

### 3. Updated Video Upload Hook

**File:** `src/features/product-courses/hooks/useVideoUpload.ts`

#### Main Upload Flow (`useVideoUpload`):

- Step 1: Create video entry → Get TUS credentials
- Step 2: Upload to Bunny.net using TUS (with credentials object)
- Step 3: Create lesson record with `result.id` as referenceId

#### Re-upload Flow (`useReuploadVideo`):

- Requests fresh TUS credentials from backend
- Uploads using the same TUS protocol
- Both flows now pass the full `CreateVideoResult` object to `uploadVideoToBunny()`

## API Contract

### Request

```javascript
POST /product-courses/videos/create
{
  "productCourseId": 123,
  "title": "Lesson Title"
}
```

### Response

```json
{
  "id": 15,
  "authorizationSignature": "b8f67da64aa497cd5243b3d1b0547e9e9dd094ff8622608fcb7876a65597e700",
  "authorizationExpire": 1773498682,
  "libraryId": 614636,
  "videoId": "ba6c136f-4ac7-4b7c-9486-983e735c9f1f"
}
```

## TUS Upload Process

```
Client → Backend: Create video entry (get credentials)
       ↓
Backend → Client: Return TUS credentials
       ↓
Client → TUS Endpoint: Upload video file with headers
  Headers:
    - AuthorizationSignature: {signature}
    - AuthorizationExpire: {expiration_time}
    - VideoId: {videoId}
    - LibraryId: {libraryId}
  Metadata:
    - filetype: {file.type}
    - title: {file.name}
       ↓
TUS → Bunny CDN: Stream video
       ↓
Client → Backend: Create lesson record with video ID
```

## Benefits

1. **Resumable Uploads**: If network fails, users can resume from where they left off
2. **Better Mobile Support**: Optimized for poor network conditions
3. **Official Protocol**: Uses the open TUS protocol standard
4. **Automatic Retry**: Built-in exponential backoff retry logic
5. **Progress Tracking**: Real-time upload progress feedback
6. **Presigned Uploads**: Time-limited credentials for security

## Package Dependencies

The implementation uses `tus-js-client` which is already installed in `package.json`:

```json
"tus-js-client": "^4.3.1"
```

## Notes

- Video title can be set via the lessonTitle or inferred from filename
- Upload expiration is controlled by backend-issued `authorizationExpire` timestamp
- Both new uploads and re-uploads use the same TUS protocol
- Progress percentage is rounded to whole numbers for UI display
