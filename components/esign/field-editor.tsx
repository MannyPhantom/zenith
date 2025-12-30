import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { Trash2, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import type {
  ESignField,
  FieldType,
  CreateFieldInput,
} from '../../lib/esign/field-types';
import {
  FIELD_TYPE_LABELS,
  DEFAULT_FIELD_DIMENSIONS,
} from '../../lib/esign/field-types';

interface FieldEditorProps {
  fields: ESignField[];
  onFieldsChange: (fields: ESignField[]) => void;
  onAddField: (field: CreateFieldInput) => void;
  onDeleteField: (fieldId: string) => void;
  selectedFieldId?: string | null;
  onFieldSelect?: (fieldId: string | null) => void;
  pageCount: number;
  signerEmails?: string[];
  className?: string;
}

export function FieldEditor({
  fields,
  onFieldsChange,
  onAddField,
  onDeleteField,
  selectedFieldId,
  onFieldSelect,
  pageCount,
  signerEmails = [],
  className,
}: FieldEditorProps) {
  const [newFieldType, setNewFieldType] = useState<FieldType>('signature');
  const [newFieldPage, setNewFieldPage] = useState(1);
  const [newFieldAssignee, setNewFieldAssignee] = useState<string>('');

  const handleAddField = () => {
    const dimensions = DEFAULT_FIELD_DIMENSIONS[newFieldType];

    const newField: CreateFieldInput = {
      field_type: newFieldType,
      page_number: newFieldPage,
      x: 10, // Start at 10% from left
      y: 10, // Start at 10% from top
      width: dimensions.width,
      height: dimensions.height,
      required: true,
      assigned_to: newFieldAssignee || undefined,
    };

    onAddField(newField);
  };

  const handleFieldUpdate = (
    fieldId: string,
    updates: Partial<ESignField>
  ) => {
    const updatedFields = fields.map((f) =>
      f.id === fieldId ? { ...f, ...updates } : f
    );
    onFieldsChange(updatedFields);
  };

  const selectedField = fields.find((f) => f.id === selectedFieldId);

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle>Signature Fields</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Add New Field Section */}
        <div className="space-y-4 pb-4 border-b">
          <h3 className="font-medium text-sm">Add New Field</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Field Type</Label>
              <Select
                value={newFieldType}
                onValueChange={(v) => setNewFieldType(v as FieldType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="signature">Signature</SelectItem>
                  <SelectItem value="initial">Initials</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Page</Label>
              <Select
                value={newFieldPage.toString()}
                onValueChange={(v) => setNewFieldPage(parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: pageCount }, (_, i) => i + 1).map(
                    (page) => (
                      <SelectItem key={page} value={page.toString()}>
                        Page {page}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {signerEmails.length > 0 && (
            <div className="space-y-2">
              <Label>Assign To (Optional)</Label>
              <Select
                value={newFieldAssignee}
                onValueChange={setNewFieldAssignee}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select signer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Anyone</SelectItem>
                  {signerEmails.map((email) => (
                    <SelectItem key={email} value={email}>
                      {email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button onClick={handleAddField} className="w-full" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Field
          </Button>
        </div>

        {/* Field List */}
        <div className="space-y-4">
          <h3 className="font-medium text-sm">
            Existing Fields ({fields.length})
          </h3>

          {fields.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No fields added yet. Add fields above or they will be detected
              automatically.
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {fields.map((field) => (
                <FieldListItem
                  key={field.id}
                  field={field}
                  isSelected={field.id === selectedFieldId}
                  onSelect={() => onFieldSelect?.(field.id)}
                  onUpdate={(updates) => handleFieldUpdate(field.id, updates)}
                  onDelete={() => onDeleteField(field.id)}
                  signerEmails={signerEmails}
                />
              ))}
            </div>
          )}
        </div>

        {/* Selected Field Details */}
        {selectedField && (
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-medium text-sm">Selected Field Properties</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>X Position (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={selectedField.x}
                  onChange={(e) =>
                    handleFieldUpdate(selectedField.id, {
                      x: parseFloat(e.target.value),
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Y Position (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={selectedField.y}
                  onChange={(e) =>
                    handleFieldUpdate(selectedField.id, {
                      y: parseFloat(e.target.value),
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Width (%)</Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  step="0.1"
                  value={selectedField.width}
                  onChange={(e) =>
                    handleFieldUpdate(selectedField.id, {
                      width: parseFloat(e.target.value),
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Height (%)</Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  step="0.1"
                  value={selectedField.height}
                  onChange={(e) =>
                    handleFieldUpdate(selectedField.id, {
                      height: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Label (Optional)</Label>
              <Input
                type="text"
                value={selectedField.label || ''}
                onChange={(e) =>
                  handleFieldUpdate(selectedField.id, {
                    label: e.target.value || null,
                  })
                }
                placeholder={FIELD_TYPE_LABELS[selectedField.field_type]}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface FieldListItemProps {
  field: ESignField;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<ESignField>) => void;
  onDelete: () => void;
  signerEmails: string[];
}

function FieldListItem({
  field,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  signerEmails,
}: FieldListItemProps) {
  const fieldTypeColor = {
    signature: 'bg-orange-100 text-orange-800 border-orange-300',
    initial: 'bg-purple-100 text-purple-800 border-purple-300',
    date: 'bg-green-100 text-green-800 border-green-300',
    text: 'bg-blue-100 text-blue-800 border-blue-300',
  };

  return (
    <div
      onClick={onSelect}
      className={cn(
        'border-2 rounded-lg p-3 cursor-pointer transition-all',
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={cn(
                'px-2 py-0.5 text-xs font-medium rounded border',
                fieldTypeColor[field.field_type]
              )}
            >
              {FIELD_TYPE_LABELS[field.field_type]}
            </span>
            <span className="text-xs text-gray-500">Page {field.page_number}</span>
            {field.required && (
              <span className="text-xs text-red-500 font-medium">Required</span>
            )}
          </div>

          {field.label && (
            <p className="text-sm font-medium mb-1">{field.label}</p>
          )}

          <p className="text-xs text-gray-500">
            Position: ({field.x.toFixed(1)}%, {field.y.toFixed(1)}%) • Size:{' '}
            {field.width.toFixed(1)}% × {field.height.toFixed(1)}%
          </p>

          {field.assigned_to && (
            <p className="text-xs text-blue-600 mt-1">
              Assigned to: {field.assigned_to}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-xs cursor-pointer">
            <Checkbox
              checked={field.required}
              onCheckedChange={(checked) =>
                onUpdate({ required: checked as boolean })
              }
              onClick={(e) => e.stopPropagation()}
            />
            Required
          </label>

          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>

      {signerEmails.length > 0 && (
        <div className="mt-2 pt-2 border-t">
          <Select
            value={field.assigned_to || ''}
            onValueChange={(v) => onUpdate({ assigned_to: v || null })}
          >
            <SelectTrigger
              className="h-8 text-xs"
              onClick={(e) => e.stopPropagation()}
            >
              <SelectValue placeholder="Assign to signer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Anyone</SelectItem>
              {signerEmails.map((email) => (
                <SelectItem key={email} value={email}>
                  {email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}





