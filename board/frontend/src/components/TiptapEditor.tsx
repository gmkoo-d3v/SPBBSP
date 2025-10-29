import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { EditorContent, useEditor, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import FileHandler from '@tiptap/extension-file-handler'
import type { BoardContent, EditorProps, FileUploadResponse } from '../types'
import useFileUpload from '../hooks/useFileUpload'

const IMAGE_MIME_TYPES = ['image/apng', 'image/avif', 'image/gif', 'image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']

const MIN_PROGRESS_STEP = 5

const isImageFile = (file: File) => {
  if (IMAGE_MIME_TYPES.includes(file.type)) {
    return true
  }

  if (file.type.startsWith('image/')) {
    return true
  }

  return false
}

const ToolbarButton = ({
  isActive,
  onClick,
  label,
  icon,
}: {
  isActive?: boolean
  onClick: () => void
  label: string
  icon: string
}) => (
  <button
    type="button"
    className={`toolbar-button${isActive ? ' is-active' : ''}`}
    onClick={onClick}
    aria-label={label}
    title={label}
  >
    {icon}
  </button>
)

const insertImages = (editorInstance: Editor, uploads: FileUploadResponse[], position?: number) => {
  if (!uploads.length) {
    return
  }

  if (typeof position === 'number') {
    editorInstance.chain().focus().setTextSelection(position).run()
  }

  uploads.forEach((upload) => {
    editorInstance
      .chain()
      .focus()
      .setImage({
        src: upload.fileUrl,
        alt: upload.fileName,
        title: upload.fileName,
      })
      .run()
  })
}

const TiptapEditor: React.FC<EditorProps> = ({ value = '', placeholder, disabled, onChange }) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [localError, setLocalError] = useState<string | null>(null)
  const { uploadFile, uploading, progress, error } = useFileUpload()

  const processFiles = useCallback(
    async (editorInstance: Editor, files: File[] | FileList, position?: number) => {
      const fileArray = Array.from(files).filter(isImageFile)

      if (!fileArray.length) {
        setLocalError('Only image files can be uploaded.')
        return
      }

      setLocalError(null)

      try {
        const uploads = await uploadFile(fileArray)
        insertImages(editorInstance, uploads, position)
      } catch {
        // Error state handled by the hook; nothing else required here.
      }
    },
    [uploadFile],
  )

  const editor = useEditor(
    {
      editable: !disabled,
      extensions: [
        StarterKit.configure({
          bulletList: {
            HTMLAttributes: { class: 'tiptap-list' },
          },
          orderedList: {
            HTMLAttributes: { class: 'tiptap-list ordered' },
          },
        }),
        Image.configure({
          inline: false,
        }),
        Placeholder.configure({
          placeholder: placeholder ?? 'Write something meaningful...',
        }),
        FileHandler.configure({
          allowedMimeTypes: IMAGE_MIME_TYPES,
          onDrop: async (editorInstance, files, pos) => {
            if (!files?.length) {
              return false
            }

            await processFiles(editorInstance, files, typeof pos === 'number' ? pos : undefined)
            return true
          },
          onPaste: async (editorInstance, files) => {
            if (!files?.length) {
              return false
            }

            await processFiles(editorInstance, files)
            return true
          },
        }),
      ],
      content: value,
      onUpdate: ({ editor: editorInstance }) => {
        const payload: BoardContent = {
          html: editorInstance.getHTML(),
          text: editorInstance.getText(),
        }
        onChange?.(payload)
      },
    },
    [disabled, placeholder, processFiles],
  )

  useEffect(() => {
    if (editor && typeof value === 'string' && value !== editor.getHTML()) {
      editor.commands.setContent(value, false)
    }
  }, [editor, value])

  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled)
    }
  }, [editor, disabled])

  const handleToolbarFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { files } = event.target
      if (files?.length && editor) {
        void processFiles(editor, files)
      }
      event.target.value = ''
    },
    [editor, processFiles],
  )

  const handleButtonClick = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const progressValue = useMemo(() => {
    if (!uploading) {
      return 0
    }

    if (progress < MIN_PROGRESS_STEP) {
      return MIN_PROGRESS_STEP
    }

    return progress
  }, [progress, uploading])

  const combinedError = useMemo(() => localError ?? error, [error, localError])

  if (!editor) {
    return null
  }

  return (
    <div className={`editor-shell${disabled ? ' editor-shell--disabled' : ''}`}>
      <div className="editor-toolbar" role="toolbar" aria-label="Formatting options">
        <ToolbarButton
          label="Bold"
          icon="B"
          isActive={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          label="Italic"
          icon="I"
          isActive={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          label="Strike"
          icon="S"
          isActive={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        />
        <ToolbarButton
          label="Heading"
          icon="H2"
          isActive={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <ToolbarButton
          label="Bullet List"
          icon="UL"
          isActive={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          label="Ordered List"
          icon="OL"
          isActive={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <ToolbarButton
          label="Blockquote"
          icon=">"
          isActive={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        />
        <ToolbarButton
          label="Code Block"
          icon="</>"
          isActive={editor.isActive('codeBlock')}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        />
        <div className="toolbar-separator" role="separator" />
        <button
          type="button"
          className="toolbar-button"
          onClick={handleButtonClick}
          aria-label="Insert image"
          title="Insert image"
        >
          Img
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleToolbarFileSelect}
          className="toolbar-file-input"
        />
      </div>

      <div className="editor-surface">
        <EditorContent editor={editor} className="tiptap-editor" />

        {uploading && (
          <div className="editor-upload-progress" role="status" aria-live="assertive">
            <div className="progress-bar">
              <div className="progress-bar__fill" style={{ width: `${progressValue}%` }} />
            </div>
            <span className="progress-bar__label">Uploading images... {progressValue}%</span>
          </div>
        )}
      </div>

      {combinedError && <div className="editor-error" role="alert">{combinedError}</div>}
    </div>
  )
}

export default TiptapEditor
