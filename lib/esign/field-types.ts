// E-Signature TypeScript Types

export type DocumentStatus = 'draft' | 'pending' | 'completed' | 'expired' | 'cancelled';
export type FieldType = 'signature' | 'date' | 'text' | 'initial';
export type SignerStatus = 'pending' | 'viewed' | 'signed' | 'declined';
export type AuditAction = 'created' | 'viewed' | 'signed' | 'sent' | 'declined' | 'expired' | 'cancelled' | 'updated';

export interface ESignDocument {
  id: string;
  title: string;
  file_path: string;
  file_size: number;
  page_count: number;
  status: DocumentStatus;
  creator_id: string;
  expires_at?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ESignField {
  id: string;
  document_id: string;
  field_type: FieldType;
  page_number: number;
  x: number; // Position as percentage (0-100)
  y: number; // Position as percentage (0-100)
  width: number; // Width as percentage (0-100)
  height: number; // Height as percentage (0-100)
  required: boolean;
  assigned_to?: string | null; // Email of assigned signer
  label?: string | null;
  created_at: string;
}

export interface ESignSignature {
  id: string;
  user_id: string;
  signature_data: string; // Base64 encoded PNG
  is_default: boolean;
  created_at: string;
}

export interface ESignSigner {
  id: string;
  document_id: string;
  user_email: string;
  user_name?: string | null;
  user_id?: string | null;
  status: SignerStatus;
  signing_order: number;
  access_token: string;
  viewed_at?: string | null;
  signed_at?: string | null;
  declined_at?: string | null;
  decline_reason?: string | null;
  ip_address?: string | null;
  created_at: string;
}

export interface ESignFieldValue {
  id: string;
  field_id: string;
  signer_id: string;
  value: string; // Base64 for signature/initial, text for date/text
  created_at: string;
}

export interface ESignAuditLog {
  id: string;
  document_id: string;
  user_id?: string | null;
  user_email?: string | null;
  action: AuditAction;
  details?: Record<string, any> | null;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
}

// Client-side types for working with documents

export interface DocumentWithSigners extends ESignDocument {
  signers: ESignSigner[];
  fields: ESignField[];
}

export interface FieldWithValue extends ESignField {
  value?: ESignFieldValue | null;
}

export interface SignerProgress {
  total_fields: number;
  completed_fields: number;
  is_complete: boolean;
}

export interface DocumentProgress {
  total_signers: number;
  completed_signers: number;
  pending_signers: number;
  is_complete: boolean;
}

// UI Helper types

export interface FieldPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
}

export interface DetectedSignatureLocation {
  page: number;
  x: number;
  y: number;
  keyword?: string;
  confidence: number; // 0-1
}

export interface PDFPageDimensions {
  width: number;
  height: number;
  scale: number;
}

export interface SignatureDrawing {
  dataUrl: string; // Base64 PNG
  isEmpty: boolean;
}

// Form types for creating/updating

export interface CreateDocumentInput {
  title: string;
  file: File;
}

export interface CreateSignerInput {
  user_email: string;
  user_name?: string;
  signing_order?: number;
}

export interface CreateFieldInput {
  field_type: FieldType;
  page_number: number;
  x: number;
  y: number;
  width: number;
  height: number;
  required?: boolean;
  assigned_to?: string;
  label?: string;
}

export interface UpdateDocumentInput {
  title?: string;
  status?: DocumentStatus;
  expires_at?: string | null;
}

export interface SignFieldInput {
  field_id: string;
  value: string;
}

export interface DeclineDocumentInput {
  reason: string;
}

// Response types

export interface UploadDocumentResponse {
  document: ESignDocument;
  upload_path: string;
}

export interface ProcessDocumentResponse {
  document: ESignDocument;
  detected_fields: DetectedSignatureLocation[];
}

export interface SignDocumentResponse {
  document: ESignDocument;
  signer: ESignSigner;
  signed_fields: string[];
}

// Constants

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  signature: 'Signature',
  initial: 'Initials',
  date: 'Date',
  text: 'Text',
};

export const STATUS_LABELS: Record<DocumentStatus, string> = {
  draft: 'Draft',
  pending: 'Pending Signatures',
  completed: 'Completed',
  expired: 'Expired',
  cancelled: 'Cancelled',
};

export const SIGNER_STATUS_LABELS: Record<SignerStatus, string> = {
  pending: 'Pending',
  viewed: 'Viewed',
  signed: 'Signed',
  declined: 'Declined',
};

export const STATUS_COLORS: Record<DocumentStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  expired: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

export const SIGNER_STATUS_COLORS: Record<SignerStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  viewed: 'bg-blue-100 text-blue-800',
  signed: 'bg-green-100 text-green-800',
  declined: 'bg-red-100 text-red-800',
};

// Default field dimensions (as percentages)
export const DEFAULT_FIELD_DIMENSIONS = {
  signature: { width: 20, height: 8 },
  initial: { width: 8, height: 8 },
  date: { width: 15, height: 6 },
  text: { width: 25, height: 6 },
};

// Signature detection keywords
export const SIGNATURE_KEYWORDS = [
  'signature',
  'sign here',
  'signed by',
  'authorized signature',
  'employee signature',
  'applicant signature',
  'signature:',
  'sign:',
  'signed:',
  'x_____',
  '_____x',
];

export const DATE_KEYWORDS = [
  'date',
  'date:',
  'dated:',
  'date signed',
  '__/__/__',
  '__/__/____',
  '____/____/____',
];

export const INITIAL_KEYWORDS = [
  'initial',
  'initials',
  'initial here',
  'initials:',
];





