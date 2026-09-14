"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import { useState } from "react";

const COLORS = ["#e8eaed", "#00c2ce", "#f0a93a", "#e5484d", "#3ddc84", "#8b5cf6"];

function ToolbarButton({
  onAction,
  active,
  label,
  children,
}: {
  onAction: () => void;
  active?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      // Important : onMouseDown + preventDefault (pas onClick) — sinon le clic
      // sur le bouton fait perdre la sélection du texte dans l'éditeur AVANT
      // que l'action ne s'exécute, et la couleur/le gras ne s'applique à rien.
      onMouseDown={(e) => {
        e.preventDefault();
        onAction();
      }}
      aria-label={label}
      aria-pressed={!!active}
      title={label}
      className={`rte-btn${active ? " is-active" : ""}`}
    >
      {children}
    </button>
  );
}

// Éditeur "façon Word" pour la description d'une annonce : gras, italique,
// souligné, couleur de texte, listes à puces/numérotées (Tab pour indenter un
// élément de liste, Maj+Tab pour désindenter — comportement natif de Tiptap).
// Le HTML produit est déposé dans un champ caché, lu par le <form> classique
// de la page (aucun JavaScript supplémentaire nécessaire côté soumission).
export default function RichTextEditor({ name, initialValue }: { name: string; initialValue: string }) {
  const [html, setHtml] = useState(initialValue || "");

  const editor = useEditor({
    extensions: [StarterKit, Underline, TextStyle, Color],
    content: initialValue || "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
    editorProps: {
      attributes: { class: "rich-content" },
    },
  });

  if (!editor) {
    return <input type="hidden" name={name} value={initialValue || ""} />;
  }

  return (
    <div>
      <input type="hidden" name={name} value={html} />

      <div className="rte-toolbar">
        <ToolbarButton onAction={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} label="Gras">
          <b>G</b>
        </ToolbarButton>
        <ToolbarButton onAction={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} label="Italique">
          <i>I</i>
        </ToolbarButton>
        <ToolbarButton onAction={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} label="Souligné">
          <u>S</u>
        </ToolbarButton>
        <ToolbarButton onAction={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} label="Liste à puces">
          • Puces
        </ToolbarButton>
        <ToolbarButton onAction={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} label="Liste numérotée">
          1. Numéros
        </ToolbarButton>

        <div className="rte-colors">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().setColor(c).run();
              }}
              aria-label={`Couleur ${c}`}
              title="Couleur du texte"
              className="rte-color"
              style={{ background: c }}
            />
          ))}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().unsetColor().run();
            }}
            title="Couleur par défaut"
            aria-label="Couleur par défaut"
            className="rte-color-reset"
          >
            ✕
          </button>
        </div>
      </div>

      <div onClick={() => editor.chain().focus().run()} className="rte-area">
        <EditorContent editor={editor} />
      </div>
      <p className="rte-hint">
        Sélectionne (surligne) le texte à modifier avant de cliquer sur un bouton — comme dans Word.
        Dans une liste, Tab pour indenter une ligne, Maj+Tab pour la remonter.
      </p>
    </div>
  );
}
