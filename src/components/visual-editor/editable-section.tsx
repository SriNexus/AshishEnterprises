/**
 * EditableSection
 * Wraps a website section with an edit overlay when admin is in edit mode.
 *
 * Design decisions:
 * - Uses CSS outline (not ring) for the hover border — avoids layout shifts
 * - Toolbar uses position:absolute but clips to section bounds via overflow:visible
 * - z-index: 200 keeps overlays well below admin bar (9500) and navbar (500)
 * - No state is kept for "active" — hover-only, no click-to-lock (prevents re-render issues)
 */
import { useRef, type ReactNode, type MouseEvent } from 'react';
import { Edit2, Image as ImageIcon, Plus, Trash2, Save, Loader2 } from 'lucide-react';
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
  className?: string;
  saving?: boolean;
}

export function EditableSection({
  id, label, children, onEdit, onAddItem, onReplaceImage, onSave, onDelete, className, saving,
}: EditableSectionProps) {
  const { isEditMode } = useVisualEditor();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Visitors see zero editor code
  if (!isEditMode) return <>{children}</>;

  return (
    <div
      ref={wrapperRef}
      data-editable-section={id}
      className={cn('group/es relative', className)}
      style={{ isolation: 'isolate' }} // new stacking context — keeps overlays inside section
    >
      {/* Outline — CSS outline avoids layout shift unlike box-shadow/ring */}
      <div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover/es:opacity-100 transition-opacity duration-150"
        style={{
          outline: '2px solid rgba(251,191,36,0.55)',
          outlineOffset: '-2px',
          borderRadius: 2,
          zIndex: 10,
        }}
        aria-hidden
      />

      {/* Label badge */}
      <div
        className="absolute top-0 left-0 opacity-0 group-hover/es:opacity-100 transition-opacity duration-150 pointer-events-none"
        style={{ zIndex: 20 }}
      >
        <span className="inline-block bg-amber-400 text-black text-[9px] font-black px-2 py-0.5 uppercase tracking-widest rounded-br">
          {label}
        </span>
      </div>

      {/* Toolbar — top-right, visible on hover */}
      <div
        className="absolute top-0 right-0 opacity-0 group-hover/es:opacity-100 transition-opacity duration-150"
        style={{ zIndex: 20 }}
        onMouseDown={(e: MouseEvent) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1 m-1 p-1 rounded-lg bg-black/85 backdrop-blur-md border border-white/10 shadow-xl">
          {onEdit && <Btn onClick={onEdit} icon={<Edit2 className="h-3 w-3" />} label="Edit" color="blue" />}
          {onReplaceImage && <Btn onClick={onReplaceImage} icon={<ImageIcon className="h-3 w-3" />} label="Image" color="purple" />}
          {onAddItem && <Btn onClick={onAddItem} icon={<Plus className="h-3 w-3" />} label="Add" color="green" />}
          {onSave && (
            <Btn
              onClick={onSave}
              icon={saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
              label={saving ? 'Saving' : 'Save'}
              color="amber"
            />
          )}
          {onDelete && <Btn onClick={onDelete} icon={<Trash2 className="h-3 w-3" />} label="Delete" color="red" />}
        </div>
      </div>

      {children}
    </div>
  );
}

const colors: Record<string, string> = {
  blue:   'bg-blue-600   hover:bg-blue-500   text-white',
  purple: 'bg-purple-600 hover:bg-purple-500 text-white',
  green:  'bg-green-600  hover:bg-green-500  text-white',
  amber:  'bg-amber-400  hover:bg-amber-300  text-black',
  red:    'bg-red-600    hover:bg-red-500    text-white',
};

function Btn({ onClick, icon, label, color }: { onClick: () => void | Promise<void>; icon: ReactNode; label: string; color: string }) {
  return (
    <button
      type="button"
      title={label}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={cn(
        'flex items-center gap-1 px-2 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer',
        colors[color] ?? colors.blue
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
