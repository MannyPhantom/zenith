import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import type { ESignField } from '../../lib/esign/field-types';
import { FIELD_TYPE_LABELS } from '../../lib/esign/field-types';
import { cn } from '../../lib/utils';

// Configure PDF.js worker - using local file
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface PDFViewerProps {
  file: File | string | null; // File object or URL
  fields?: ESignField[];
  onFieldClick?: (field: ESignField) => void;
  selectedFieldId?: string | null;
  showFieldLabels?: boolean;
  scale?: number;
  className?: string;
}

export function PDFViewer({
  file,
  fields = [],
  onFieldClick,
  selectedFieldId,
  showFieldLabels = true,
  scale = 1.5,
  className,
}: PDFViewerProps) {
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load PDF
  useEffect(() => {
    if (!file) return;

    const loadPDF = async () => {
      setIsLoading(true);
      setError(null);

      try {
        let data: ArrayBuffer;

        if (file instanceof File) {
          data = await file.arrayBuffer();
        } else {
          // Fetch from URL
          const response = await fetch(file);
          data = await response.arrayBuffer();
        }

        const loadingTask = pdfjsLib.getDocument({ data });
        const pdfDoc = await loadingTask.promise;

        setPdf(pdfDoc);
        setPageCount(pdfDoc.numPages);
        setCurrentPage(1);
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError('Failed to load PDF');
      } finally {
        setIsLoading(false);
      }
    };

    loadPDF();
  }, [file]);

  // Render current page
  useEffect(() => {
    if (!pdf || !canvasRef.current) return;

    const renderPage = async () => {
      try {
        const page = await pdf.getPage(currentPage);
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
      } catch (err) {
        console.error('Error rendering page:', err);
        setError('Failed to render page');
      }
    };

    renderPage();
  }, [pdf, currentPage, scale]);

  // Get fields for current page
  const currentPageFields = fields.filter((f) => f.page_number === currentPage);

  // Get canvas dimensions
  const canvasWidth = canvasRef.current?.width || 0;
  const canvasHeight = canvasRef.current?.height || 0;

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(pageCount, prev + 1));
  };

  if (isLoading) {
    return (
      <div
        className={cn(
          'flex items-center justify-center h-96 bg-gray-50 rounded-lg',
          className
        )}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          'flex items-center justify-center h-96 bg-red-50 rounded-lg',
          className
        )}
      >
        <div className="text-center">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!file || !pdf) {
    return (
      <div
        className={cn(
          'flex items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300',
          className
        )}
      >
        <div className="text-center">
          <p className="text-gray-500">No PDF loaded</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col', className)}>
      {/* PDF Page Navigation */}
      <div className="flex items-center justify-between bg-gray-100 p-3 rounded-t-lg">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-white rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Previous
        </button>

        <span className="text-sm font-medium">
          Page {currentPage} of {pageCount}
        </span>

        <button
          onClick={handleNextPage}
          disabled={currentPage === pageCount}
          className="px-3 py-1 bg-white rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Next
        </button>
      </div>

      {/* PDF Canvas with Field Overlay */}
      <div
        ref={containerRef}
        className="relative bg-gray-200 overflow-auto rounded-b-lg"
        style={{ maxHeight: '800px' }}
      >
        <canvas ref={canvasRef} className="mx-auto block" />

        {/* Field Overlays */}
        {currentPageFields.map((field) => {
          const fieldLeft = (field.x / 100) * canvasWidth;
          const fieldTop = (field.y / 100) * canvasHeight;
          const fieldWidth = (field.width / 100) * canvasWidth;
          const fieldHeight = (field.height / 100) * canvasHeight;

          const isSelected = field.id === selectedFieldId;

          return (
            <div
              key={field.id}
              onClick={() => onFieldClick?.(field)}
              className={cn(
                'absolute border-2 cursor-pointer transition-all',
                isSelected
                  ? 'border-blue-500 bg-blue-100/50'
                  : 'border-orange-400 bg-orange-100/30 hover:bg-orange-100/50',
                field.field_type === 'signature' && 'border-orange-400',
                field.field_type === 'date' && 'border-green-400',
                field.field_type === 'initial' && 'border-purple-400',
                field.field_type === 'text' && 'border-blue-400'
              )}
              style={{
                left: `${fieldLeft}px`,
                top: `${fieldTop}px`,
                width: `${fieldWidth}px`,
                height: `${fieldHeight}px`,
              }}
            >
              {showFieldLabels && (
                <div
                  className={cn(
                    'absolute -top-6 left-0 px-2 py-0.5 text-xs font-medium rounded whitespace-nowrap',
                    field.field_type === 'signature' &&
                      'bg-orange-500 text-white',
                    field.field_type === 'date' && 'bg-green-500 text-white',
                    field.field_type === 'initial' &&
                      'bg-purple-500 text-white',
                    field.field_type === 'text' && 'bg-blue-500 text-white'
                  )}
                >
                  {field.label || FIELD_TYPE_LABELS[field.field_type]}
                  {field.required && ' *'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

