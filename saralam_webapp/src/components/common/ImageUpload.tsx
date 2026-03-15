import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ImageUploadProps {
  onAccept: (files: File[]) => void
  maxFiles?: number
  maxSize?: number
  className?: string
}

export function ImageUpload({
  onAccept,
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024,
  className,
}: ImageUploadProps) {
  const onDrop = useCallback(
    (accepted: File[]) => onAccept(accepted),
    [onAccept]
  )
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept: { 'image/*': ['.jpeg', '.png', '.webp', '.gif'] },
  })
  return (
    <div
      {...getRootProps()}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-surface-2)] p-8 transition-colors hover:border-[var(--color-primary-500)]',
        isDragActive && 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)]',
        className
      )}
    >
      <input {...getInputProps()} />
      <Upload className="size-10 text-[var(--color-text-muted)]" />
      <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
        {isDragActive ? 'Drop images here' : 'Drag & drop or click to upload'}
      </p>
    </div>
  )
}
