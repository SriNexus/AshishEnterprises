/**
 * EditableSection — wraps any section with visual edit overlays for admins
 */
import { useState, type ReactNode } from 'react';
import { Edit2, Image as ImageIcon, Plus, Trash2, Save, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useVisualEditor } from '@/store/visual-editor-context';
import { cn } from '@/utils/cn';

interface EditableSectionProps {
  id: string;
  label: string;
  children: ReactNode;
  onEdit?: () => void;
  onAddItem?: () => void;
  onReplaceImage?: () => void;
  onSave?: () => Promise<void>;
  onDelete?: () => void;
  onTogglePublish?: () => void;
  isPublished?: boolean;
  className?: string;
  saving?: boolean;
}

export function EditableSection({ id: _id, label, children, onEdit, onAddItem, onReplaceImage, onSave, onDelete, onTogglePublish, isPublished, className, saving }: EditableSectionProps) {
  const { isEditMode } = useVisualEditor();
  const [isHovered, setIsHovered] = useState(false);
  const [localSaving, setLocalSaving] = useState(false);

  if (!isEditMode) return <>{children}</>;

  const showControls = isHovered;

  const handleSave = async () => {
    if (!onSave) return;
    setLocalSaving(true);
    try { await onSave(); } finally { setLocalSaving(false); }
  };

  const isSaving = saving || localSaving;

  return (
    <div className={cn('relative group/section', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hover outline */}
      <div className={cn('absolute inset-0 pointer-events-none transition-all duration-200 z-[100] rounded-sm', showControls ? 'ring-2 ring-amber-400/60 ring-inset' : 'ring-0')} />

      {/* Section label */}
      {showControls && (
        <div className="absolute top-0 left-0 z-[200] pointer-events-none">
          <div className="bg-amber-400 text-black text-[10px] font-extrabold px-2 py-0.5 rounded-br uppercase tracking-widest">{label}</div>
        </div>
      )}

      {/* Toolbar */}
      {showControls && (
        <div className="absolute top-0 right-0 z-[200] flex items-center gap-1 p-1.5 bg-black/90 backdrop-blur-sm rounded-bl-xl border border-white/10 pointer-events-auto shadow-2xl"
          onMouseEnter={() => setIsHovered(true)}
        >
          {onEdit && <EditorBtn onClick={onEdit} icon={<Edit2 className="h-3 w-3" />} label="Edit" color="blue" />}
          {onReplaceImage && <EditorBtn onClick={onReplaceImage} icon={<ImageIcon className="h-3 w-3" />} label="Image" color="purple" />}
          {onAddItem && <EditorBtn onClick={onAddItem} icon={<Plus className="h-3 w-3" />} label="Add" color="green" />}
          {onTogglePublish !== undefined && (
            <EditorBtn onClick={onTogglePublish} icon={isPublished ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />} label={isPublished ? 'Live' : 'Hidden'} color={isPublished ? 'green' : 'gray'} />
          )}
          {onSave && (
            <EditorBtn onClick={handleSave} icon={isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />} label={isSaving ? 'Saving' : 'Save'} color="amber" primary />
          )}
          {onDelete && <EditorBtn onClick={onDelete} icon={<Trash2 className="h-3 w-3" />} label="Delete" color="red" />}
        </div>
      )}

      {children}
    </div>
  );
}

const colorMap: Record<string, string> = {
  blue: 'bg-blue-600 hover:bg-blue-500 text-white',
  purple: 'bg-purple-600 hover:bg-purple-500 text-white',
  green: 'bg-green-600 hover:bg-green-500 text-white',
  amber: 'bg-amber-400 hover:bg-amber-300 text-black',
  red: 'bg-red-600 hover:bg-red-500 text-white',
  gray: 'bg-zinc-600 hover:bg-zinc-500 text-white',
};

function EditorBtn({ onClick, icon, label, color, primary }: { onClick: () => void; icon: ReactNode; label: string; color: string; primary?: boolean }) {
  return (
    <button onClick={(e) => { e.stopPropagation(); onClick(); }} title={label}
      className={cn('flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap', colorMap[color] || colorMap.blue, primary && 'px-3')}>
      {icon}<span className="hidden sm:inline">{label}</span>
    </button>
  );
}
