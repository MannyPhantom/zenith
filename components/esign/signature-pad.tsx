import React, { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { X, Download, Undo2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { ESignSignature } from '../../lib/esign/field-types';

interface SignaturePadProps {
  onSave: (signatureData: string) => void;
  onCancel?: () => void;
  savedSignatures?: ESignSignature[];
  initialValue?: string | null;
  title?: string;
  className?: string;
}

export function SignaturePad({
  onSave,
  onCancel,
  savedSignatures = [],
  initialValue,
  title = 'Add Signature',
  className,
}: SignaturePadProps) {
  const sigPadRef = useRef<SignatureCanvas>(null);
  const [selectedSignature, setSelectedSignature] = useState<string | null>(
    initialValue || null
  );
  const [activeTab, setActiveTab] = useState<'draw' | 'saved'>(
    savedSignatures.length > 0 ? 'saved' : 'draw'
  );

  // Set initial value if provided
  useEffect(() => {
    if (initialValue && sigPadRef.current) {
      sigPadRef.current.fromDataURL(initialValue);
    }
  }, [initialValue]);

  const handleClear = () => {
    if (sigPadRef.current) {
      sigPadRef.current.clear();
    }
  };

  const handleUndo = () => {
    if (sigPadRef.current) {
      const data = sigPadRef.current.toData();
      if (data.length > 0) {
        data.pop();
        sigPadRef.current.fromData(data);
      }
    }
  };

  const handleSaveDrawn = () => {
    if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
      const dataUrl = sigPadRef.current.toDataURL('image/png');
      onSave(dataUrl);
    }
  };

  const handleSaveSaved = () => {
    if (selectedSignature) {
      onSave(selectedSignature);
    }
  };

  const isEmpty = sigPadRef.current?.isEmpty() ?? true;

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="draw">Draw</TabsTrigger>
            <TabsTrigger value="saved" disabled={savedSignatures.length === 0}>
              Saved ({savedSignatures.length})
            </TabsTrigger>
          </TabsList>

          {/* Draw Signature Tab */}
          <TabsContent value="draw">
            <div className="space-y-4">
              <div className="border-2 border-gray-300 rounded-lg bg-white">
                <SignatureCanvas
                  ref={sigPadRef}
                  canvasProps={{
                    className: 'w-full h-48 cursor-crosshair',
                    style: { touchAction: 'none' },
                  }}
                  backgroundColor="white"
                  penColor="black"
                  minWidth={1}
                  maxWidth={2.5}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleUndo}
                    disabled={isEmpty}
                  >
                    <Undo2 className="h-4 w-4 mr-2" />
                    Undo
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleClear}
                    disabled={isEmpty}
                  >
                    Clear
                  </Button>
                </div>

                <Button
                  type="button"
                  onClick={handleSaveDrawn}
                  disabled={isEmpty}
                >
                  Save Signature
                </Button>
              </div>

              <p className="text-sm text-gray-500 text-center">
                Draw your signature using your mouse or touchscreen
              </p>
            </div>
          </TabsContent>

          {/* Saved Signatures Tab */}
          <TabsContent value="saved">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {savedSignatures.map((sig) => (
                  <div
                    key={sig.id}
                    onClick={() => setSelectedSignature(sig.signature_data)}
                    className={cn(
                      'border-2 rounded-lg p-4 cursor-pointer transition-all hover:border-blue-300',
                      selectedSignature === sig.signature_data
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 bg-white'
                    )}
                  >
                    <img
                      src={sig.signature_data}
                      alt="Saved signature"
                      className="w-full h-24 object-contain"
                    />
                    {sig.is_default && (
                      <p className="text-xs text-center text-blue-600 mt-2 font-medium">
                        Default
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={handleSaveSaved}
                  disabled={!selectedSignature}
                >
                  Use Selected Signature
                </Button>
              </div>

              <p className="text-sm text-gray-500 text-center">
                Select a saved signature to use
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface SignatureDisplayProps {
  signatureData: string;
  onRemove?: () => void;
  className?: string;
}

export function SignatureDisplay({
  signatureData,
  onRemove,
  className,
}: SignatureDisplayProps) {
  return (
    <div
      className={cn(
        'relative border-2 border-gray-300 rounded-lg bg-white p-4',
        className
      )}
    >
      <img
        src={signatureData}
        alt="Signature"
        className="w-full h-24 object-contain"
      />
      {onRemove && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="absolute top-2 right-2"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

interface DateFieldProps {
  value?: string;
  onChange: (date: string) => void;
  className?: string;
}

export function DateField({ value, onChange, className }: DateFieldProps) {
  // Auto-fill with today's date if empty
  useEffect(() => {
    if (!value) {
      const today = new Date().toISOString().split('T')[0];
      onChange(today);
    }
  }, [value, onChange]);

  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium">Date</label>
      <input
        type="date"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
}

interface TextFieldProps {
  value?: string;
  onChange: (text: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function TextField({
  value,
  onChange,
  label = 'Text',
  placeholder = 'Enter text',
  className,
}: TextFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium">{label}</label>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
}





