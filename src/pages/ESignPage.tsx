import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Plus, FileText, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  listDocuments,
  getSignersForDocument,
  getFieldsForDocument,
} from '../../lib/esign/supabase-esign';
import type { ESignDocument } from '../../lib/esign/field-types';

export default function ESignPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDocuments();
    }
  }, [user]);

  const loadDocuments = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const docs = await listDocuments(user.id);
      
      // Load signers and fields for each document
      const docsWithData = await Promise.all(
        docs.map(async (doc) => {
          const signers = await getSignersForDocument(doc.id);
          const fields = await getFieldsForDocument(doc.id);
          return { ...doc, signers, fields };
        })
      );

      setDocuments(docsWithData);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDocument = () => {
    navigate('/esign/upload');
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">Please log in to access E-Sign</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">E-Signature</h1>
          <p className="text-gray-600">
            Send and sign documents electronically
          </p>
        </div>

        <Button onClick={handleCreateDocument} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          New Document
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Loading documents...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium mb-2">No documents yet</p>
          <p className="text-gray-600 mb-4">
            Upload your first PDF to get started with e-signatures
          </p>
          <Button onClick={handleCreateDocument}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Document
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Documents ({documents.length})</TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({documents.filter((d) => d.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({documents.filter((d) => d.status === 'completed').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <DocumentGrid documents={documents} />
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            <DocumentGrid
              documents={documents.filter((d) => d.status === 'pending')}
            />
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <DocumentGrid
              documents={documents.filter((d) => d.status === 'completed')}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function DocumentGrid({ documents }: { documents: any[] }) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600">No documents found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map((doc) => (
        <DocumentCard key={doc.id} document={doc} />
      ))}
    </div>
  );
}

function DocumentCard({ document }: { document: any }) {
  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    expired: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };

  const totalSigners = document.signers?.length || 0;
  const signedCount = document.signers?.filter((s: any) => s.status === 'signed').length || 0;

  return (
    <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-all cursor-pointer">
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 bg-blue-100 rounded">
          <FileText className="h-5 w-5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate mb-1">{document.title}</h3>
          <span
            className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
              statusColors[document.status as keyof typeof statusColors]
            }`}
          >
            {document.status}
          </span>
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center justify-between">
          <span>Pages: {document.page_count}</span>
          <span>{new Date(document.created_at).toLocaleDateString()}</span>
        </div>

        {totalSigners > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span>Signatures</span>
              <span className="font-medium">
                {signedCount} / {totalSigners}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-green-500 h-1.5 rounded-full transition-all"
                style={{
                  width: `${totalSigners > 0 ? (signedCount / totalSigners) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

