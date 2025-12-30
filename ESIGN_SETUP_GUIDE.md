# E-Signature Module Setup Guide

## Overview

The E-Signature module is a DocuSign-like feature that allows users to:
- Upload PDF documents
- Automatically detect signature locations using AI/heuristics
- Place signature, date, initial, and text fields
- Send documents to multiple signers
- Draw signatures with mouse/touchscreen
- Save and reuse signatures
- Track signing progress in real-time
- Download signed PDFs with embedded signatures

## Installation

### 1. Install Dependencies

```bash
npm install pdf-lib pdfjs-dist react-pdf react-signature-canvas
npm install --save-dev @types/pdfjs-dist
```

### 2. Database Setup

Run the database schema migration in your Supabase SQL editor:

```bash
# Run these files in Supabase Dashboard > SQL Editor
zenith/esign-schema.sql
zenith/esign-storage-setup.sql
```

This creates:
- 7 database tables with Row Level Security (RLS)
- Triggers for automatic token generation
- Indexes for performance

### 3. Storage Buckets

Create two storage buckets in Supabase Dashboard > Storage:

1. **esign-documents** (for PDFs)
   - Settings: Private, 10MB file size limit

2. **esign-signatures** (for signature images)
   - Settings: Private, 1MB file size limit

Then apply the storage policies from `esign-storage-setup.sql`.

### 4. Access the Module

Navigate to `/esign` in your application to access the E-Signature dashboard.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      User Interface                          │
├─────────────────────────────────────────────────────────────┤
│  Dashboard  │  Upload  │  Sign  │  View  │  Field Editor   │
└─────────────┬───────────────────────────────────────────────┘
              │
┌─────────────┴───────────────────────────────────────────────┐
│                    Business Logic                            │
├─────────────────────────────────────────────────────────────┤
│  Signature    │  PDF         │  Field      │  Workflow      │
│  Detector     │  Processor   │  Manager    │  Manager       │
└─────────────┬───────────────────────────────────────────────┘
              │
┌─────────────┴───────────────────────────────────────────────┐
│                     Data Layer                               │
├─────────────────────────────────────────────────────────────┤
│  Supabase Database  │  Supabase Storage  │  Audit Logs     │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

```
zenith/
├── components/esign/
│   ├── document-card.tsx          # Document list cards
│   ├── field-editor.tsx           # Field position editor
│   ├── pdf-viewer.tsx             # PDF renderer with overlays
│   ├── signature-pad.tsx          # Signature drawing canvas
│   └── signer-manager.tsx         # Manage signers
│
├── lib/esign/
│   ├── field-types.ts             # TypeScript types & constants
│   ├── pdf-processor.ts           # PDF manipulation (flatten, merge)
│   ├── signature-detector.ts      # Auto-detect signature locations
│   └── supabase-esign.ts          # Database operations
│
├── src/pages/
│   └── ESignPage.tsx              # Main dashboard page
│
├── esign-schema.sql               # Database schema
├── esign-storage-setup.sql        # Storage policies
└── ESIGN_SETUP_GUIDE.md          # This file
```

## Usage

### Creating a Document

1. Click **"New Document"** from the dashboard
2. Upload a PDF file (drag & drop supported)
3. The system automatically detects signature fields
4. Review and adjust field positions as needed
5. Add signers with their email addresses
6. Click **"Send for Signing"**

### Signing a Document

1. Signers receive an email with a unique signing link
2. Click the link to view the document
3. Click on each field to add signature/date/text
4. Draw signature or select from saved signatures
5. Click **"Submit Signature"**

### Viewing Documents

- **My Documents**: Documents you created
- **To Sign**: Documents waiting for your signature
- **Completed**: Fully signed documents
- Click any document to view details and download

## Features

### Automatic Signature Detection

The system uses keyword matching to detect:
- **Signature fields**: "signature", "sign here", "X_____"
- **Date fields**: "date", "dated:", "__/__/____"
- **Initial fields**: "initial", "initials here"

If no keywords found, default fields are placed at the bottom of the last page.

### Field Types

1. **Signature**: Full signature with drawing canvas
2. **Initial**: Smaller signature for initials
3. **Date**: Date picker (auto-fills with today's date)
4. **Text**: Free text input

### Signature Management

- Draw signatures with mouse or touchscreen
- Save signatures for reuse
- Set a default signature
- Multiple saved signatures per user

### Security Features

- Row Level Security (RLS) on all tables
- Unique access tokens for each signer
- IP address and user agent logging
- Complete audit trail
- Signed documents are immutable

### Workflow Features

- Multiple signers per document
- Signing order support
- Email notifications (ready for integration)
- Document expiration dates
- Decline with reason
- Real-time progress tracking

## API Reference

### Document Operations

```typescript
// Create document
await createDocument({
  title: string,
  file_path: string,
  file_size: number,
  page_count: number,
  status: DocumentStatus,
  creator_id: string
});

// Get document with signers and fields
await getDocumentWithSigners(documentId);

// List documents
await listDocuments(userId);
await listDocumentsForSigner(email);
```

### Field Operations

```typescript
// Create fields
await createFields([{
  field_type: 'signature' | 'date' | 'initial' | 'text',
  page_number: number,
  x: number, // percentage
  y: number, // percentage
  width: number,
  height: number,
  required: boolean
}]);
```

### Signature Operations

```typescript
// Save signature
await saveSignature(userId, signatureDataUrl, isDefault);

// Get user signatures
await getUserSignatures(userId);
```

### Signer Operations

```typescript
// Create signers
await createSigners([{
  user_email: string,
  user_name?: string,
  signing_order: number
}]);

// Update signer status
await updateSigner(signerId, { status: 'signed' });
```

## Customization

### Detection Keywords

Modify in `lib/esign/field-types.ts`:

```typescript
export const SIGNATURE_KEYWORDS = [
  'signature',
  'sign here',
  // Add your custom keywords
];
```

### Field Dimensions

Adjust default sizes in `lib/esign/field-types.ts`:

```typescript
export const DEFAULT_FIELD_DIMENSIONS = {
  signature: { width: 20, height: 8 }, // percentages
  initial: { width: 8, height: 8 },
  date: { width: 15, height: 6 },
  text: { width: 25, height: 6 },
};
```

### Styling

All components use Tailwind CSS and are fully customizable. Colors are defined in theme constants:

```typescript
export const STATUS_COLORS: Record<DocumentStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  // ...
};
```

## Email Integration

The module is ready for email integration. To enable notifications:

1. Set up an email service (SendGrid, Mailgun, etc.)
2. Create an edge function or API endpoint for sending emails
3. Call the endpoint after creating signers:

```typescript
// After creating signers
for (const signer of signers) {
  await sendSigningInvitation({
    to: signer.user_email,
    document_title: document.title,
    signing_url: `${APP_URL}/esign/sign/${document.id}?token=${signer.access_token}`
  });
}
```

## Troubleshooting

### PDF Not Rendering

- Check PDF.js worker URL in `signature-detector.ts` and `pdf-viewer.tsx`
- Ensure PDF file is not corrupted
- Check browser console for errors

### Signature Detection Not Working

- Verify PDF has extractable text (not scanned image)
- Check keyword matching in `signature-detector.ts`
- Add custom keywords for your document types

### Storage Upload Fails

- Verify storage buckets exist
- Check RLS policies
- Ensure user is authenticated
- Check file size limits

### TypeScript Errors

Run type check:
```bash
npm run build
```

Fix any type errors before deploying.

## Performance Optimization

### PDF Loading

- PDFs are loaded once and cached
- Use signed URLs with 1-hour expiry
- Consider CDN for frequently accessed documents

### Database Queries

- All queries have appropriate indexes
- Use `select('*')` sparingly, fetch only needed fields
- Paginate document lists for large datasets

### Signature Images

- Signatures stored as base64 PNG
- Consider converting to WebP for smaller size
- Implement lazy loading for signature lists

## Security Best Practices

1. **Always validate user permissions**
   - Use RLS policies
   - Check access tokens server-side

2. **Sanitize inputs**
   - Validate email addresses
   - Check file types before upload

3. **Audit everything**
   - Log all document actions
   - Store IP addresses and user agents

4. **Use HTTPS only**
   - Never send signing links over HTTP
   - Secure all API endpoints

5. **Set document expiration**
   - Default to 30 days
   - Clean up expired documents

## Future Enhancements

Potential features to add:
- [ ] Bulk sending
- [ ] Document templates
- [ ] Advanced signing workflows (sequential, parallel)
- [ ] Mobile app
- [ ] SMS notifications
- [ ] Document folders/organization
- [ ] Team collaboration
- [ ] API for external integrations
- [ ] Advanced analytics
- [ ] OCR for scanned documents

## Support

For issues or questions:
1. Check this guide
2. Review the code comments
3. Check Supabase logs
4. Review browser console errors

## License

This module is part of the Katana SaaS platform. MIT License.





