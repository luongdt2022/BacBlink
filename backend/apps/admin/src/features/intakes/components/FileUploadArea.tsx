import { useState } from 'react'
import { Upload, X, File, FileText, Video } from 'lucide-react'

export interface UploadedFile {
  id: string
  file?: File
  type: 'image' | 'video' | 'document'
  preview?: string
  url?: string
  attachmentId?: string
  fileName?: string
}

interface FileUploadAreaProps {
  files: UploadedFile[]
  onFilesChange: (files: UploadedFile[]) => void
}

export function FileUploadArea({ files, onFilesChange }: FileUploadAreaProps) {
  const [dragOver, setDragOver] = useState(false)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputFiles = e.target.files
    if (!inputFiles) return

    const newFiles: UploadedFile[] = Array.from(inputFiles).map((file) => {
      const fileType: 'image' | 'video' | 'document' = file.type.startsWith('image/')
        ? 'image'
        : file.type.startsWith('video/')
          ? 'video'
          : 'document'

      const newFile: UploadedFile = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        type: fileType,
      }

      if (fileType === 'image') {
        newFile.preview = URL.createObjectURL(file)
      }

      return newFile
    })

    onFilesChange([...files, ...newFiles])
    e.target.value = ''
  }

  const removeFile = (id: string) => {
    const file = files.find((f) => f.id === id)
    // Only revoke blob URLs (browser-generated), not server URLs
    if (file?.preview && file.preview.startsWith('blob:')) {
      URL.revokeObjectURL(file.preview)
    }
    onFilesChange(files.filter((f) => f.id !== id))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    const newFiles: UploadedFile[] = droppedFiles.map((file) => {
      const fileType: 'image' | 'video' | 'document' = file.type.startsWith('image/')
        ? 'image'
        : file.type.startsWith('video/')
          ? 'video'
          : 'document'

      const newFile: UploadedFile = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        type: fileType,
      }

      if (fileType === 'image') {
        newFile.preview = URL.createObjectURL(file)
      }

      return newFile
    })
    onFilesChange([...files, ...newFiles])
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 items-start custom-scrollbar">
      {/* Upload Area */}
      <label
        className={`shrink-0 flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
          dragOver
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 hover:border-primary hover:bg-gray-50'
        }`}
      >
        <Upload className="w-4 h-4 text-gray-400 mb-1" />
        <span className="text-[10px] font-medium text-primary text-center px-1 leading-tight">
          Tải lên
        </span>
        <input
          type="file"
          className="hidden"
          multiple
          accept="image/*,video/*,.pdf,.doc,.docx"
          onChange={handleFileUpload}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        />
      </label>

      {/* Uploaded Files */}
      {files.map((file) => (
        <div
          key={file.id}
          className="shrink-0 relative w-20 h-20 rounded-lg border border-gray-200 bg-gray-50 group overflow-hidden flex flex-col items-center justify-center"
        >
          {file.type === 'image' && (file.preview || file.url) ? (
            <img
              src={file.preview || file.url}
              alt={file.file?.name || file.fileName || file.url}
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              {file.type === 'video' && <Video className="w-6 h-6 text-indigo-500 mb-2" />}
              {file.type === 'document' &&
                (file.file?.name || file.fileName || '').toLowerCase().endsWith('.pdf') && (
                  <File className="w-6 h-6 text-red-500 mb-2" />
                )}
              {file.type === 'document' &&
                (file.file?.name || file.fileName || '').toLowerCase().match(/\.(doc|docx)$/) && (
                  <FileText className="w-6 h-6 text-primary mb-2" />
                )}
            </>
          )}

          {/* File Info Overlay */}
          <div className="absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-sm p-1 border-t border-gray-100">
            <p
              className="text-[9px] font-medium text-gray-900 truncate text-center"
              title={file.file?.name || file.url}
            >
              {file.file?.name || 'File đính kèm'}
            </p>
          </div>

          {/* Remove button */}
          <button
            type="button"
            onClick={() => removeFile(file.id)}
            className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 text-gray-500 hover:text-red-500"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
