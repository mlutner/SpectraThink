import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEditorStore } from "@/stores/editor-store";

interface Props {
  initialContent: string;
}

export function EntryEditor({ initialContent }: Props) {
  const setDraftContent = useEditorStore((s) => s.setDraftContent);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: "What's on your mind?",
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: "tiptap",
      },
    },
    onUpdate: ({ editor }) => {
      setDraftContent(editor.getHTML());
    },
  });

  // Sync initial content when entry changes
  useEffect(() => {
    if (editor && initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent, false);
    }
  }, [initialContent, editor]);

  return (
    <div className="mx-auto max-w-[var(--editor-text-max-width)]">
      <EditorContent editor={editor} />
    </div>
  );
}
