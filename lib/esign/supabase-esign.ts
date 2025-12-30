import { supabase } from '../../src/lib/supabase';
import type {
  ESignDocument,
  ESignField,
  ESignSignature,
  ESignSigner,
  ESignFieldValue,
  ESignAuditLog,
  CreateDocumentInput,
  CreateSignerInput,
  CreateFieldInput,
  UpdateDocumentInput,
  SignFieldInput,
  DocumentWithSigners,
} from './field-types';

// ============================================================================
// DOCUMENTS
// ============================================================================

export async function createDocument(
  input: Omit<ESignDocument, 'id' | 'created_at' | 'updated_at'>
): Promise<ESignDocument | null> {
  const { data, error } = await supabase
    .from('esign_documents')
    .insert(input)
    .select()
    .single();

  if (error) {
    console.error('Error creating document:', error);
    return null;
  }

  return data;
}

export async function getDocument(id: string): Promise<ESignDocument | null> {
  const { data, error } = await supabase
    .from('esign_documents')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching document:', error);
    return null;
  }

  return data;
}

export async function getDocumentWithSigners(
  id: string
): Promise<DocumentWithSigners | null> {
  const { data, error } = await supabase
    .from('esign_documents')
    .select(
      `
      *,
      signers:esign_signers(*),
      fields:esign_fields(*)
    `
    )
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching document with signers:', error);
    return null;
  }

  return data as DocumentWithSigners;
}

export async function listDocuments(
  userId?: string
): Promise<ESignDocument[]> {
  let query = supabase
    .from('esign_documents')
    .select('*')
    .order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('creator_id', userId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error listing documents:', error);
    return [];
  }

  return data || [];
}

export async function listDocumentsForSigner(
  email: string
): Promise<ESignDocument[]> {
  const { data, error } = await supabase
    .from('esign_documents')
    .select(
      `
      *,
      esign_signers!inner(user_email)
    `
    )
    .eq('esign_signers.user_email', email)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error listing documents for signer:', error);
    return [];
  }

  return data || [];
}

export async function updateDocument(
  id: string,
  updates: UpdateDocumentInput
): Promise<ESignDocument | null> {
  const { data, error } = await supabase
    .from('esign_documents')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating document:', error);
    return null;
  }

  return data;
}

export async function deleteDocument(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('esign_documents')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting document:', error);
    return false;
  }

  return true;
}

// ============================================================================
// FIELDS
// ============================================================================

export async function createField(
  input: Omit<ESignField, 'id' | 'created_at'>
): Promise<ESignField | null> {
  const { data, error } = await supabase
    .from('esign_fields')
    .insert(input)
    .select()
    .single();

  if (error) {
    console.error('Error creating field:', error);
    return null;
  }

  return data;
}

export async function createFields(
  inputs: Omit<ESignField, 'id' | 'created_at'>[]
): Promise<ESignField[]> {
  const { data, error } = await supabase
    .from('esign_fields')
    .insert(inputs)
    .select();

  if (error) {
    console.error('Error creating fields:', error);
    return [];
  }

  return data || [];
}

export async function getFieldsForDocument(
  documentId: string
): Promise<ESignField[]> {
  const { data, error } = await supabase
    .from('esign_fields')
    .select('*')
    .eq('document_id', documentId)
    .order('page_number', { ascending: true });

  if (error) {
    console.error('Error fetching fields:', error);
    return [];
  }

  return data || [];
}

export async function updateField(
  id: string,
  updates: Partial<Omit<ESignField, 'id' | 'document_id' | 'created_at'>>
): Promise<ESignField | null> {
  const { data, error } = await supabase
    .from('esign_fields')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating field:', error);
    return null;
  }

  return data;
}

export async function deleteField(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('esign_fields')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting field:', error);
    return false;
  }

  return true;
}

export async function deleteFieldsForDocument(
  documentId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('esign_fields')
    .delete()
    .eq('document_id', documentId);

  if (error) {
    console.error('Error deleting fields:', error);
    return false;
  }

  return true;
}

// ============================================================================
// SIGNATURES
// ============================================================================

export async function saveSignature(
  userId: string,
  signatureData: string,
  isDefault: boolean = false
): Promise<ESignSignature | null> {
  // If setting as default, unset all other default signatures
  if (isDefault) {
    await supabase
      .from('esign_signatures')
      .update({ is_default: false })
      .eq('user_id', userId);
  }

  const { data, error } = await supabase
    .from('esign_signatures')
    .insert({
      user_id: userId,
      signature_data: signatureData,
      is_default: isDefault,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving signature:', error);
    return null;
  }

  return data;
}

export async function getUserSignatures(
  userId: string
): Promise<ESignSignature[]> {
  const { data, error } = await supabase
    .from('esign_signatures')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching signatures:', error);
    return [];
  }

  return data || [];
}

export async function getDefaultSignature(
  userId: string
): Promise<ESignSignature | null> {
  const { data, error } = await supabase
    .from('esign_signatures')
    .select('*')
    .eq('user_id', userId)
    .eq('is_default', true)
    .single();

  if (error) {
    console.error('Error fetching default signature:', error);
    return null;
  }

  return data;
}

export async function deleteSignature(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('esign_signatures')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting signature:', error);
    return false;
  }

  return true;
}

// ============================================================================
// SIGNERS
// ============================================================================

export async function createSigner(
  input: Omit<ESignSigner, 'id' | 'created_at' | 'access_token'>
): Promise<ESignSigner | null> {
  const { data, error } = await supabase
    .from('esign_signers')
    .insert(input)
    .select()
    .single();

  if (error) {
    console.error('Error creating signer:', error);
    return null;
  }

  return data;
}

export async function createSigners(
  inputs: Omit<ESignSigner, 'id' | 'created_at' | 'access_token'>[]
): Promise<ESignSigner[]> {
  const { data, error } = await supabase
    .from('esign_signers')
    .insert(inputs)
    .select();

  if (error) {
    console.error('Error creating signers:', error);
    return [];
  }

  return data || [];
}

export async function getSignersForDocument(
  documentId: string
): Promise<ESignSigner[]> {
  const { data, error } = await supabase
    .from('esign_signers')
    .select('*')
    .eq('document_id', documentId)
    .order('signing_order', { ascending: true });

  if (error) {
    console.error('Error fetching signers:', error);
    return [];
  }

  return data || [];
}

export async function getSignerByToken(
  accessToken: string
): Promise<ESignSigner | null> {
  const { data, error } = await supabase
    .from('esign_signers')
    .select('*')
    .eq('access_token', accessToken)
    .single();

  if (error) {
    console.error('Error fetching signer by token:', error);
    return null;
  }

  return data;
}

export async function updateSigner(
  id: string,
  updates: Partial<
    Omit<ESignSigner, 'id' | 'document_id' | 'created_at' | 'access_token'>
  >
): Promise<ESignSigner | null> {
  const { data, error } = await supabase
    .from('esign_signers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating signer:', error);
    return null;
  }

  return data;
}

export async function deleteSigner(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('esign_signers')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting signer:', error);
    return false;
  }

  return true;
}

// ============================================================================
// FIELD VALUES
// ============================================================================

export async function saveFieldValue(
  fieldId: string,
  signerId: string,
  value: string
): Promise<ESignFieldValue | null> {
  const { data, error } = await supabase
    .from('esign_field_values')
    .insert({
      field_id: fieldId,
      signer_id: signerId,
      value: value,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving field value:', error);
    return null;
  }

  return data;
}

export async function getFieldValuesForSigner(
  signerId: string
): Promise<ESignFieldValue[]> {
  const { data, error } = await supabase
    .from('esign_field_values')
    .select('*')
    .eq('signer_id', signerId);

  if (error) {
    console.error('Error fetching field values:', error);
    return [];
  }

  return data || [];
}

export async function getFieldValuesForDocument(
  documentId: string
): Promise<ESignFieldValue[]> {
  const { data, error } = await supabase
    .from('esign_field_values')
    .select(
      `
      *,
      field:esign_fields!inner(document_id)
    `
    )
    .eq('field.document_id', documentId);

  if (error) {
    console.error('Error fetching field values for document:', error);
    return [];
  }

  return data || [];
}

// ============================================================================
// AUDIT LOG
// ============================================================================

export async function logAuditEvent(
  documentId: string,
  action: ESignAuditLog['action'],
  details?: Record<string, any>,
  userId?: string,
  userEmail?: string
): Promise<void> {
  const { error } = await supabase.from('esign_audit_log').insert({
    document_id: documentId,
    user_id: userId || null,
    user_email: userEmail || null,
    action,
    details: details || null,
    ip_address: null, // Would be populated by backend
    user_agent: navigator.userAgent,
  });

  if (error) {
    console.error('Error logging audit event:', error);
  }
}

export async function getAuditLogForDocument(
  documentId: string
): Promise<ESignAuditLog[]> {
  const { data, error } = await supabase
    .from('esign_audit_log')
    .select('*')
    .eq('document_id', documentId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching audit log:', error);
    return [];
  }

  return data || [];
}

// ============================================================================
// STORAGE
// ============================================================================

export async function uploadPDF(
  file: File,
  documentId: string
): Promise<string | null> {
  const fileName = `${documentId}/${file.name}`;

  const { error } = await supabase.storage
    .from('esign-documents')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Error uploading PDF:', error);
    return null;
  }

  return fileName;
}

export async function downloadPDF(filePath: string): Promise<Blob | null> {
  const { data, error } = await supabase.storage
    .from('esign-documents')
    .download(filePath);

  if (error) {
    console.error('Error downloading PDF:', error);
    return null;
  }

  return data;
}

export async function getPDFUrl(filePath: string): Promise<string | null> {
  const { data } = await supabase.storage
    .from('esign-documents')
    .createSignedUrl(filePath, 3600); // 1 hour expiry

  if (!data) {
    console.error('Error getting PDF URL');
    return null;
  }

  return data.signedUrl;
}

export async function deletePDF(filePath: string): Promise<boolean> {
  const { error } = await supabase.storage
    .from('esign-documents')
    .remove([filePath]);

  if (error) {
    console.error('Error deleting PDF:', error);
    return false;
  }

  return true;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export async function completeSigningForSigner(
  signerId: string,
  fieldValues: SignFieldInput[]
): Promise<boolean> {
  try {
    // Save all field values
    for (const fieldValue of fieldValues) {
      await saveFieldValue(fieldValue.field_id, signerId, fieldValue.value);
    }

    // Update signer status
    await updateSigner(signerId, {
      status: 'signed',
      signed_at: new Date().toISOString(),
    });

    return true;
  } catch (error) {
    console.error('Error completing signing:', error);
    return false;
  }
}

export async function checkDocumentCompletion(
  documentId: string
): Promise<boolean> {
  const signers = await getSignersForDocument(documentId);
  const allSigned = signers.every((s) => s.status === 'signed');

  if (allSigned && signers.length > 0) {
    await updateDocument(documentId, {
      status: 'completed',
    });
    return true;
  }

  return false;
}





