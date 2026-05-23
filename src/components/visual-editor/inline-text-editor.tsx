/**
 * InlineTextEditor
 * Click-to-edit text primitive. Renders as plain text for visitors.
 * For admins in edit mode: shows dashed highlight on hover, input on click.
 * Saves to Firestore on blur or Enter, reverts on Escape.
 */
import { useState, useRef, useEffect, type KeyboardEvent, type ElementType } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useVisualEditor } from '@/store/visual-editor-context';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

interface Props {
  value: string;
  onChange?: (value: string) => void;
  firestorePath?: { collection: string; docId: string; field: string };
  as?: ElementType;
  multiline?: boolean;
  className?: string;
  placeholder?: string;
}

export function InlineTextEditor({
  value,
  onChange,
  firestorePath,
  as: Tag = 'span',
  multiline = false,
  className,
  placeholder = 'Click to edit…',
}: Props) {
  const { isEditMode } = useVisualEditor();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Keep draft in sync when value changes externally
  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  // Focus on edit start
  useEffect(() => {
    if (editing) {
      const el = inputRef.current;
      if (el) { el.focus(); const len = el.value.length; el.setSelectionRange(len, len); }
    }
  }, [editing]);

  // Visitors: render nothing special
  if (!isEditMode) return <Tag className={className}>{value}</Tag>;

  const commit = async () => {
    const trimmed = draft.trim();
    if (trimmed === value) { setEditing(false); return; }
    try {
      if (firestorePath) {
        const { collection, docId, field } = firestorePath;
        await setDoc(doc(db, collection, docId), { [field]: trimmed }, { merge: true });
      }
      onChange?.(trimmed);
      toast.success('Saved', { id: 'inline-save', duration: 1200 });
    } catch {
      toast.error('Save failed');
      setDraft(value);
    } finally {
      setEditing(false);
    }
  };

  const cancel = () => { setDraft(value); setEditing(false); };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) { e.preventDefault(); commit(); }
    if (e.key === 'Escape') { e.preventDefault(); cancel(); }
  };

  if (editing) {
    const sharedProps = {
      ref: inputRef as React.Ref<HTMLInputElement & HTMLTextAreaElement>,
      value: draft,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDraft(e.target.value),
      onBlur: commit,
      onKeyDown,
      className: cn(
        'w-full bg-white/5 dark:bg-black/50 border-2 border-amber-400 rounded px-2 py-1',
        'text-current outline-none resize-none',
        className,
      ),
    };

    if (multiline) {
      return <textarea {...sharedProps} rows={4} style={{ font: 'inherit', lineHeight: 'inherit' }} />;
    }
    return <input type="text" {...sharedProps} style={{ font: 'inherit' }} />;
  }

  return (
    <Tag
      className={cn(
        className,
        'cursor-text rounded',
        'outline outline-1 outline-transparent outline-dashed',
        'hover:outline-amber-400/60 hover:bg-amber-400/5',
        'transition-all duration-150',
      )}
      onClick={(e: React.MouseEvent) => { e.stopPropagation(); setEditing(true); }}
      title="Click to edit"
    >
      {value || <span className="opacity-40 italic text-sm">{placeholder}</span>}
    </Tag>
  );
}
