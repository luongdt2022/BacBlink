const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'avif'];
const VIDEO_EXTENSIONS = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v'];

export function isImageFile(file: {
  fileName: string;
  mimeType?: string;
  fileType?: string;
}): boolean {
  const extension = file.fileName.split('.').pop()?.toLowerCase() ?? '';
  return (
    file.mimeType?.startsWith('image/') ||
    file.fileType?.startsWith('image') ||
    IMAGE_EXTENSIONS.includes(extension)
  );
}

export function isVideoFile(file: {
  fileName: string;
  mimeType?: string;
  fileType?: string;
}): boolean {
  const extension = file.fileName.split('.').pop()?.toLowerCase() ?? '';
  return (
    file.mimeType?.startsWith('video/') ||
    file.fileType?.startsWith('video') ||
    VIDEO_EXTENSIONS.includes(extension)
  );
}

export function getFileType(file: File): 'image' | 'video' | 'document' {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  return 'document';
}

export function generateFileId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function formatFileSize(fileSize: string | number): string {
  const size = typeof fileSize === 'string' ? parseFloat(fileSize) : fileSize;
  if (isNaN(size)) return '0 KB';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
