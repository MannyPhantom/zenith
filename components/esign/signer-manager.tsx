import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Trash2, Plus, Mail, CheckCircle2, Clock, Eye, XCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { ESignSigner, CreateSignerInput } from '../../lib/esign/field-types';
import { SIGNER_STATUS_COLORS, SIGNER_STATUS_LABELS } from '../../lib/esign/field-types';

interface SignerManagerProps {
  signers: ESignSigner[];
  onAddSigner: (signer: CreateSignerInput) => void;
  onRemoveSigner: (signerId: string) => void;
  onSignerUpdate?: (signerId: string, updates: Partial<ESignSigner>) => void;
  allowEdit?: boolean;
  className?: string;
}

export function SignerManager({
  signers,
  onAddSigner,
  onRemoveSigner,
  onSignerUpdate,
  allowEdit = true,
  className,
}: SignerManagerProps) {
  const [newSignerEmail, setNewSignerEmail] = useState('');
  const [newSignerName, setNewSignerName] = useState('');
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddSigner = () => {
    setEmailError('');

    if (!newSignerEmail.trim()) {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(newSignerEmail)) {
      setEmailError('Invalid email address');
      return;
    }

    // Check for duplicates
    if (signers.some((s) => s.user_email === newSignerEmail)) {
      setEmailError('This signer has already been added');
      return;
    }

    onAddSigner({
      user_email: newSignerEmail,
      user_name: newSignerName.trim() || undefined,
      signing_order: signers.length + 1,
    });

    setNewSignerEmail('');
    setNewSignerName('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddSigner();
    }
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Signers ({signers.length})</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Add New Signer Section */}
        {allowEdit && (
          <div className="space-y-4 pb-4 border-b">
            <h3 className="font-medium text-sm">Add Signer</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signer-email">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="signer-email"
                  type="email"
                  placeholder="john@example.com"
                  value={newSignerEmail}
                  onChange={(e) => {
                    setNewSignerEmail(e.target.value);
                    setEmailError('');
                  }}
                  onKeyPress={handleKeyPress}
                  className={emailError ? 'border-red-500' : ''}
                />
                {emailError && (
                  <p className="text-sm text-red-500">{emailError}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signer-name">Name (Optional)</Label>
                <Input
                  id="signer-name"
                  type="text"
                  placeholder="John Doe"
                  value={newSignerName}
                  onChange={(e) => setNewSignerName(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>

              <Button onClick={handleAddSigner} className="w-full" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Signer
              </Button>
            </div>
          </div>
        )}

        {/* Signer List */}
        <div className="space-y-4">
          <h3 className="font-medium text-sm">
            {allowEdit ? 'Current Signers' : 'Signers'}
          </h3>

          {signers.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No signers added yet. Add signers to send the document for signing.
            </p>
          ) : (
            <div className="space-y-2">
              {signers
                .sort((a, b) => a.signing_order - b.signing_order)
                .map((signer) => (
                  <SignerListItem
                    key={signer.id}
                    signer={signer}
                    onRemove={
                      allowEdit ? () => onRemoveSigner(signer.id) : undefined
                    }
                    onUpdate={
                      onSignerUpdate
                        ? (updates) => onSignerUpdate(signer.id, updates)
                        : undefined
                    }
                  />
                ))}
            </div>
          )}
        </div>

        {/* Signing Instructions */}
        {signers.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Signers will receive an email with a link
              to sign the document. They can sign in any order unless you specify
              a signing sequence.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface SignerListItemProps {
  signer: ESignSigner;
  onRemove?: () => void;
  onUpdate?: (updates: Partial<ESignSigner>) => void;
}

function SignerListItem({ signer, onRemove, onUpdate }: SignerListItemProps) {
  const statusIcon = {
    pending: <Clock className="h-4 w-4" />,
    viewed: <Eye className="h-4 w-4" />,
    signed: <CheckCircle2 className="h-4 w-4" />,
    declined: <XCircle className="h-4 w-4" />,
  };

  return (
    <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="font-medium text-sm">{signer.user_email}</span>
            </div>

            <Badge
              className={cn(
                'flex items-center gap-1',
                SIGNER_STATUS_COLORS[signer.status]
              )}
            >
              {statusIcon[signer.status]}
              {SIGNER_STATUS_LABELS[signer.status]}
            </Badge>
          </div>

          {signer.user_name && (
            <p className="text-sm text-gray-600 mb-1">{signer.user_name}</p>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>Order: #{signer.signing_order}</span>

            {signer.viewed_at && (
              <span>Viewed: {new Date(signer.viewed_at).toLocaleString()}</span>
            )}

            {signer.signed_at && (
              <span className="text-green-600 font-medium">
                Signed: {new Date(signer.signed_at).toLocaleString()}
              </span>
            )}

            {signer.declined_at && (
              <span className="text-red-600 font-medium">
                Declined: {new Date(signer.declined_at).toLocaleString()}
              </span>
            )}
          </div>

          {signer.decline_reason && (
            <p className="text-sm text-red-600 mt-2 p-2 bg-red-50 rounded">
              <strong>Decline Reason:</strong> {signer.decline_reason}
            </p>
          )}
        </div>

        {onRemove && signer.status === 'pending' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

interface SignerProgressProps {
  signers: ESignSigner[];
  className?: string;
}

export function SignerProgress({ signers, className }: SignerProgressProps) {
  const totalSigners = signers.length;
  const signedCount = signers.filter((s) => s.status === 'signed').length;
  const viewedCount = signers.filter((s) => s.status === 'viewed').length;
  const pendingCount = signers.filter((s) => s.status === 'pending').length;
  const declinedCount = signers.filter((s) => s.status === 'declined').length;

  const progress = totalSigners > 0 ? (signedCount / totalSigners) * 100 : 0;

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle>Signing Progress</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Overall Progress</span>
            <span className="text-gray-600">
              {signedCount} / {totalSigners} Signed
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-green-500 h-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">Signed</p>
              <p className="text-lg font-bold text-green-600">{signedCount}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
            <Clock className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Pending</p>
              <p className="text-lg font-bold text-yellow-600">{pendingCount}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
            <Eye className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-800">Viewed</p>
              <p className="text-lg font-bold text-blue-600">{viewedCount}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
            <XCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-sm font-medium text-red-800">Declined</p>
              <p className="text-lg font-bold text-red-600">{declinedCount}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}





