import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  FileText,
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  Eye,
  Download,
  Trash2,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { cn } from '../../lib/utils';
import type { DocumentWithSigners } from '../../lib/esign/field-types';
import { STATUS_COLORS, STATUS_LABELS } from '../../lib/esign/field-types';

interface DocumentCardProps {
  document: DocumentWithSigners;
  onClick?: () => void;
  onView?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function DocumentCard({
  document,
  onClick,
  onView,
  onDownload,
  onDelete,
  className,
}: DocumentCardProps) {
  const totalSigners = document.signers?.length || 0;
  const signedCount =
    document.signers?.filter((s) => s.status === 'signed').length || 0;
  const pendingCount =
    document.signers?.filter((s) => s.status === 'pending').length || 0;

  const progress = totalSigners > 0 ? (signedCount / totalSigners) * 100 : 0;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card
      className={cn(
        'p-4 hover:shadow-md transition-all cursor-pointer border-2',
        className
      )}
      onClick={onClick}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate mb-1">
                {document.title}
              </h3>

              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={STATUS_COLORS[document.status]}>
                  {STATUS_LABELS[document.status]}
                </Badge>

                <span className="text-xs text-gray-500">
                  {document.page_count}{' '}
                  {document.page_count === 1 ? 'page' : 'pages'}
                </span>

                <span className="text-xs text-gray-500">
                  {formatFileSize(document.file_size)}
                </span>
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onView && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(); }}>
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </DropdownMenuItem>
              )}
              {onDownload && document.status === 'completed' && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDownload(); }}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Signing Progress */}
        {totalSigners > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Signing Progress</span>
              <span className="font-medium">
                {signedCount} / {totalSigners} Signed
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all duration-500',
                  progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Created {formatDate(document.created_at)}</span>
          </div>

          {document.completed_at && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span>Completed {formatDate(document.completed_at)}</span>
            </div>
          )}

          {document.expires_at && !document.completed_at && (
            <div className="flex items-center gap-2 text-orange-600">
              <Clock className="h-4 w-4" />
              <span>Expires {formatDate(document.expires_at)}</span>
            </div>
          )}

          {totalSigners > 0 && (
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="h-4 w-4" />
              <span>
                {totalSigners} {totalSigners === 1 ? 'Signer' : 'Signers'}
              </span>
            </div>
          )}
        </div>

        {/* Pending Signers */}
        {pendingCount > 0 && document.status === 'pending' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
            <p className="text-xs text-yellow-800">
              <strong>Waiting for {pendingCount} signature{pendingCount !== 1 ? 's' : ''}</strong>
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

interface DocumentListProps {
  documents: DocumentWithSigners[];
  onDocumentClick?: (document: DocumentWithSigners) => void;
  onDocumentView?: (document: DocumentWithSigners) => void;
  onDocumentDownload?: (document: DocumentWithSigners) => void;
  onDocumentDelete?: (document: DocumentWithSigners) => void;
  emptyMessage?: string;
  className?: string;
}

export function DocumentList({
  documents,
  onDocumentClick,
  onDocumentView,
  onDocumentDownload,
  onDocumentDelete,
  emptyMessage = 'No documents found',
  className,
}: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
      {documents.map((doc) => (
        <DocumentCard
          key={doc.id}
          document={doc}
          onClick={() => onDocumentClick?.(doc)}
          onView={() => onDocumentView?.(doc)}
          onDownload={() => onDocumentDownload?.(doc)}
          onDelete={() => onDocumentDelete?.(doc)}
        />
      ))}
    </div>
  );
}





