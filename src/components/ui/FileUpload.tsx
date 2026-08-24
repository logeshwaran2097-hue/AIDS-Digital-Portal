'use client'

import * as React from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, X, Eye, Download } from 'lucide-react'
import { cn, formatFileSize, isValidFileType } from '@/lib/utils'
import { Button } from './Button'

interface FileWithPreview extends File {
  preview?: string
  id: string
}

export interface FileUploadProps {
  accept?: Record<string, string[]>
  maxSize?: number
  maxFiles?: number
  onFilesChange?: (files: FileWithPreview[]) => void
  initialFiles?: FileWithPreview[]
  disabled?: boolean
  className?: string
}

const DEFAULT_ACCEPT = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
}

export function FileUpload({
  accept = DEFAULT_ACCEPT,
  maxSize = 10 * 1024 * 1024,
  maxFiles = 5,
  onFilesChange,
  initialFiles = [],
  disabled = false,
  className,
}: FileUploadProps) {
  const [files, setFiles] = React.useState<FileWithPreview[]>(initialFiles)
  const [dragActive, setDragActive] = React.useState(false)

  const acceptedFiles = Object.values(accept).flat()

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    const newFiles: FileWithPreview[] = acceptedFiles.map((file) => ({
      ...file,
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }))
    
    setFiles((prev) => {
      const combined = [...prev, ...newFiles].slice(0, maxFiles)
      onFilesChange?.(combined)
      return combined
    })
  }, [maxFiles, onFilesChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles,
    disabled,
    noClick: false,
    noKeyboard: false,
  })

  React.useEffect(() => {
    setDragActive(isDragActive)
  }, [isDragActive])

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const filtered = prev.filter((f) => f.id !== id)
      onFilesChange?.(filtered)
      return filtered
    })
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️'
    if (type === 'application/pdf') return '📄'
    if (type.includes('word') || type.includes('document')) return '📝'
    return '📎'
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'relative flex flex-col items-center justify-center rounded-xl border-2 p-8 text-center transition-all duration-200',
          'cursor-pointer',
          dragActive || isDragActive
            ? 'border-royal bg-blue-50'
            : 'border-gray-200 hover:border-royal/50 hover:bg-blue-25',
          disabled && 'opacity-50 cursor-not-allowed',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal focus-visible:ring-offset-2'
        )}
      >
        <input {...getInputProps()} />
        <Upload className="h-10 w-10 text-gray-400" aria-hidden="true" />
        <p className="mt-3 text-sm font-medium text-navy">
          {dragActive || isDragActive ? 'Drop files here...' : 'Drag & drop files here, or click to select'}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          PDF, JPG, PNG, DOC, DOCX up to {formatFileSize(maxSize)} each
        </p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-navy">Selected Files ({files.length}/{maxFiles})</p>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="text-2xl" aria-hidden="true">{getFileIcon(file.type)}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-navy truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {file.preview && (
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeFile(file.id)}>
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}