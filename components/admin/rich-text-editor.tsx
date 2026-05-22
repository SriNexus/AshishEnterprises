import { useCallback, useMemo, useState } from 'react';
import { cn } from '@/utils/cn';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Code,
  Undo,
  Redo,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Simple rich text editor using contenteditable
 * For production, consider using TipTap, Slate, or similar
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start writing...',
  className,
}: RichTextEditorProps) {
  const [isFocused, setIsFocused] = useState(false);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
  }, []);

  const tools = useMemo(
    () => [
      { icon: Bold, command: 'bold', title: 'Bold' },
      { icon: Italic, command: 'italic', title: 'Italic' },
      { icon: Heading2, command: 'formatBlock', value: 'h2', title: 'Heading 2' },
      { icon: Heading3, command: 'formatBlock', value: 'h3', title: 'Heading 3' },
      { icon: List, command: 'insertUnorderedList', title: 'Bullet List' },
      { icon: ListOrdered, command: 'insertOrderedList', title: 'Numbered List' },
      { icon: Quote, command: 'formatBlock', value: 'blockquote', title: 'Quote' },
      { icon: Code, command: 'formatBlock', value: 'pre', title: 'Code Block' },
      {
        icon: LinkIcon,
        command: 'createLink',
        title: 'Insert Link',
        promptValue: true,
      },
      { icon: Undo, command: 'undo', title: 'Undo' },
      { icon: Redo, command: 'redo', title: 'Redo' },
    ],
    []
  );

  const handleToolClick = (tool: (typeof tools)[0]) => {
    if (tool.promptValue) {
      const url = window.prompt('Enter URL:');
      if (url) {
        execCommand(tool.command, url);
      }
    } else {
      execCommand(tool.command, tool.value);
    }
  };

  return (
    <div className={cn('rounded-xl border border-line overflow-hidden', className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-surface-secondary border-b border-line">
        {tools.map((tool, index) => {
          const Icon = tool.icon;
          return (
            <button
              key={index}
              type="button"
              onClick={() => handleToolClick(tool)}
              title={tool.title}
              className="p-2 rounded-lg hover:bg-surface-tertiary text-content-secondary hover:text-content-primary transition-colors cursor-pointer"
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>

      {/* Editor */}
      <div
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        dangerouslySetInnerHTML={{ __html: value }}
        data-placeholder={placeholder}
        className={cn(
          'min-h-[200px] p-4 bg-surface-primary text-content-primary focus:outline-none',
          'prose prose-sm max-w-none dark:prose-invert',
          '[&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-content-tertiary',
          isFocused && 'ring-2 ring-brand-primary ring-inset'
        )}
      />
    </div>
  );
}
