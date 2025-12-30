import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Upload, ArrowLeft, FileText, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  detectSignatureLocations,
  getPDFMetadata,
  categorizeDetectedLocations,
} from '../../lib/esign/signature-detector';
import { DEFAULT_FIELD_DIMENSIONS } from '../../lib/esign/field-types';

export default function ESignUploadPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    if (file.type !== 'application/pdf') {
      alert('Please select a PDF file');
      return;
    }

    setSelectedFile(file);
    setIsProcessing(true);
    setError(null);

    try {
      console.log('Starting PDF processing...');
      
      // Get PDF metadata
      console.log('Getting PDF metadata...');
      const metadata = await getPDFMetadata(file);
      console.log('PDF metadata:', metadata);
      
      // Detect signature locations
      console.log('Detecting signature locations...');
      const detected = await detectSignatureLocations(file);
      console.log('Detected fields:', detected);
      
      const categorized = categorizeDetectedLocations(detected);
      console.log('Categorized fields:', categorized);

      // Convert to field format
      const detectedFields: any[] = [];

      categorized.signatures.forEach((loc) => {
        detectedFields.push({
          type: 'signature',
          page: loc.page,
          x: loc.x,
          y: loc.y,
          width: DEFAULT_FIELD_DIMENSIONS.signature.width,
          height: DEFAULT_FIELD_DIMENSIONS.signature.height,
        });
      });

      categorized.dates.forEach((loc) => {
        detectedFields.push({
          type: 'date',
          page: loc.page,
          x: loc.x,
          y: loc.y,
          width: DEFAULT_FIELD_DIMENSIONS.date.width,
          height: DEFAULT_FIELD_DIMENSIONS.date.height,
        });
      });

      categorized.initials.forEach((loc) => {
        detectedFields.push({
          type: 'initial',
          page: loc.page,
          x: loc.x,
          y: loc.y,
          width: DEFAULT_FIELD_DIMENSIONS.initial.width,
          height: DEFAULT_FIELD_DIMENSIONS.initial.height,
        });
      });

      categorized.textFields.forEach((loc) => {
        detectedFields.push({
          type: 'text',
          page: loc.page,
          x: loc.x,
          y: loc.y,
          width: DEFAULT_FIELD_DIMENSIONS.text.width,
          height: DEFAULT_FIELD_DIMENSIONS.text.height,
        });
      });

      // Navigate to configure page with data
      navigate('/esign/configure', {
        state: {
          file,
          detectedFields,
          pageCount: metadata.pageCount,
        },
      });
    } catch (error: any) {
      console.error('Error processing PDF:', error);
      const errorMessage = error?.message || 'Unknown error';
      setError(`Error processing PDF: ${errorMessage}`);
      alert(`Error processing PDF: ${errorMessage}\n\nPlease check the browser console for more details.`);
      setSelectedFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">Please log in to upload documents</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/esign')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <h1 className="text-3xl font-bold mb-2">Upload Document</h1>
        <p className="text-gray-600">Upload a PDF to prepare it for signing</p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Upload PDF Document</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* File Upload Area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !isProcessing && fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-lg p-12 text-center
              transition-all
              ${isProcessing ? 'cursor-wait' : 'cursor-pointer'}
              ${
                isDragging
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }
            `}
          >
            {isProcessing ? (
              <div className="space-y-4">
                <Loader2 className="h-16 w-16 mx-auto text-blue-500 animate-spin" />
                <div>
                  <p className="text-lg font-medium text-blue-700">
                    Processing PDF...
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Detecting signature fields
                  </p>
                </div>
              </div>
            ) : selectedFile ? (
              <div className="space-y-4">
                <FileText className="h-16 w-16 mx-auto text-green-500" />
                <div>
                  <p className="text-lg font-medium text-green-700">
                    File Selected!
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  variant="outline"
                  size="sm"
                >
                  Choose Different File
                </Button>
              </div>
            ) : (
              <>
                <Upload
                  className={`h-12 w-12 mx-auto mb-4 ${
                    isDragging ? 'text-blue-500' : 'text-gray-400'
                  }`}
                />
                <p className="text-lg font-medium mb-2">
                  {isDragging
                    ? 'Drop your PDF here'
                    : 'Drag and drop your PDF here'}
                </p>
                <p className="text-sm text-gray-500 mb-4">or click to browse</p>
                <Button type="button">Select PDF File</Button>
              </>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
              className="hidden"
            />
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> After uploading, our AI will automatically
              detect signature fields in your document. You can review and
              adjust them before sending.
            </p>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}

