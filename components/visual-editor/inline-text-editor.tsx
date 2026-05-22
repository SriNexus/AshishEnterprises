import { useState, useEffect, type KeyboardEvent } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useVisualEditor } from '@/store/visual-editor-context';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

interface InlineTextEditorProps {
  value: string;
  onChange?: (value: string) => void;
  firestorePath?: { collection: string; docId: string; field: string };
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  multiline?: boolean;
  className?: string;
  placeholder?: string;
}

export function InlineTextEditor({ value, onChange, firestorePath, as: Tag = 'span', multiline = false, className, placeholder = 'Click to edit…' }: InlineTextEditorProps) {
  const { isEditMode } = useVisualEditor();
  const [editing, setEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setLocalValue(value); }, [value]);

  if (!isEditMode) return <Tag className={className}>{value}</Tag>;

  const handleSave = async () => {
    if (localValue === value) { setEditing(false); return; }
    setSaving(true);
    try {
      if (firestorePath) {
        const { collection, docId, field } = firestorePath;
        await setDoc(doc(db, collection, docId), { [field]: localValue }, { merge: true });
      }
      onChange?.(localValue);
      toast.success('Saved!', { duration: 1500, id: 'inline-save' });
    } catch {
      toast.error('Save failed');
      setLocalValue(value);
    } finally {
      setSaving(false);
      setEditing(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) { e.preventDefault(); handleSave(); }
    if (e.key === 'Escape') { setLocalValue(value); setEditing(false); }
  };

  if (editing) {
    const sharedClass = cn('w-full bg-black/80 text-white border-2 border-amber-400 rounded-md px-2 py-1 outline-none', saving && 'opacity-60', className);
    if (multiline) {
      return <textarea value={localValue} onChange={(e) => setLocalValue(e.target.value)} onBlur={handleSave} onKeyDown={handleKeyDown} autoFocus rows={4} className={cn(sharedClass, 'resize-none')} style={{ font: 'inherit', lineHeight: 'inherit' }} />;
    }
    return <input type="text" value={localValue} onChange={(e) => setLocalValue(e.target.value)} onBlur={handleSave} onKeyDown={handleKeyDown} autoFocus className={sharedClass} style={{ font: 'inherit' }} />;
  }

  return (
    <Tag className={cn(className, 'cursor-text hover:outline hover:outline-2 hover:outline-dashed hover:outline-amber-400/70 hover:outline-offset-2 rounded-sm')}
      onClick={(e: React.MouseEvent) => { e.stopPropagation(); setEditing(true); }} title="Click to edit">
      {localValue || <span className="opacity-40 italic">{placeholder}</span>}
    </Tag>
  );
}
