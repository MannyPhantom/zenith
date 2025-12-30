import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PDFViewer } from '../../components/esign/pdf-viewer';
import { FieldEditor } from '../../components/esign/field-editor';
import { SignerManager } from '../../components/esign/signer-manager';
import {
  createDocument,
  createFields,
  createSigners,
  uploadPDF,
  logAuditEvent,
} from '../../lib/esign/supabase-esign';
import type { ESignField } from '../../lib/esign/field-types';

interface LocationState {
  file: File;
  detectedFields: any[];
  pageCount: number;
}

export default function ESignConfigurePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const state = location.state as LocationState;

  const [documentTitle, setDocumentTitle] = useState('');
  const [fields, setFields] = useState<any[]>([]);
  const [signers, setSigners] = useState<any[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!state?.file) {
      navigate('/esign/upload');
      return;
    }

    // Set default title from filename
    setDocumentTitle(state.file.name.replace('.pdf', ''));

    // Convert detected fields to proper format
    const initialFields = state.detectedFields.map((field: any, idx: number) => ({
      id: `temp-${idx}`,
      document_id: 'temp',
      field_type: field.type || 'signature',
      page_number: field.page,
      x: field.x,
      y: field.y,
      width: field.width,
      height: field.height,
      required: true,
      created_at: new Date().toISOString(),
    }));

    setFields(initialFields);
  }, [state, navigate]);

  const handleAddField = (fieldInput: any) => {
    const newField = {
      ...fieldInput,
      id: `temp-${Date.now()}`,
      document_id: 'temp',
      created_at: new Date().toISOString(),
    };
    setFields([...fields, newField]);
  };

  const handleDeleteField = (fieldId: string) => {
    setFields(fields.filter((f) => f.id !== fieldId));
  };

  const handleAddSigner = (signerInput: any) => {
    const newSigner = {
      ...signerInput,
      id: `temp-${Date.now()}`,
      document_id: 'temp',
      status: 'pending' as const,
      access_token: '',
      created_at: new Date().toISOString(),
    };
    setSigners([...signers, newSigner]);
  };

  const handleRemoveSigner = (signerId: string) => {
    setSigners(signers.filter((s) => s.id !== signerId));
  };

  const handleSendDocument = async () => {
    if (!state?.file || !user) return;

    setIsSubmitting(true);

    try {
      // Create document record
      const doc = await createDocument({
        title: documentTitle,
        file_path: '', // Will be set after upload
        file_size: state.file.size,
        page_count: state.pageCount,
        status: signers.length > 0 ? 'pending' : 'draft',
        creator_id: user.id,
      });

      if (!doc) {
        throw new Error('Failed to create document');
      }

      // Upload PDF to storage
      const filePath = await uploadPDF(state.file, doc.id);
      if (!filePath) {
        throw new Error('Failed to upload PDF');
      }

      // Create fields
      if (fields.length > 0) {
        const fieldsToCreate = fields.map((f) => ({
          document_id: doc.id,
          field_type: f.field_type,
          page_number: f.page_number,
          x: f.x,
          y: f.y,
          width: f.width,
          height: f.height,
          required: f.required,
          assigned_to: f.assigned_to,
          label: f.label,
        }));

        await createFields(fieldsToCreate);
      }

      // Create signers
      if (signers.length > 0) {
        const signersToCreate = signers.map((s) => ({
          document_id: doc.id,
          user_email: s.user_email,
          user_name: s.user_name,
          signing_order: s.signing_order || 1,
          status: 'pending' as const,
        }));

        await createSigners(signersToCreate);
      }

      // Log audit event
      await logAuditEvent(doc.id, 'created', {}, user.id, user.email);

      // Show success message
      alert('Document created successfully!');

      // Navigate back to dashboard
      navigate('/esign');
    } catch (error) {
      console.error('Error sending document:', error);
      alert('Error sending document. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!state?.file) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/esign/upload')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <h1 className="text-3xl font-bold mb-2">Configure Document</h1>
        <p className="text-gray-600">
          Review fields and add signers for your document
        </p>
      </div>

      {/* Document Title */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Document Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Document Title</Label>
            <Input
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              placeholder="Enter document title"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PDF Viewer */}
        <div className="lg:col-span-2">
          <PDFViewer
            file={state.file}
            fields={fields}
            selectedFieldId={selectedFieldId}
            onFieldClick={(field) => setSelectedFieldId(field.id)}
            showFieldLabels
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <FieldEditor
            fields={fields}
            onFieldsChange={setFields}
            onAddField={handleAddField}
            onDeleteField={handleDeleteField}
            selectedFieldId={selectedFieldId}
            onFieldSelect={setSelectedFieldId}
            pageCount={state.pageCount}
            signerEmails={signers.map((s) => s.user_email)}
          />

          <SignerManager
            signers={signers}
            onAddSigner={handleAddSigner}
            onRemoveSigner={handleRemoveSigner}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-6">
        <Button variant="outline" onClick={() => navigate('/esign/upload')}>
          Back
        </Button>

        <Button
          onClick={handleSendDocument}
          size="lg"
          disabled={isSubmitting || !documentTitle}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              {signers.length > 0 ? 'Send for Signing' : 'Save as Draft'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}





