import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { extname, join } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { fileTypeFromBuffer } from 'file-type';

export interface UploadedFile {
  fileName: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
}

// Allowlist of safe MIME types
const ALLOWED_MIME_TYPES = new Set([
  // Images — common formats
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/tiff',
  'image/x-icon',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  // Archives (optional — remove if not needed)
  'application/zip',
  'application/x-rar-compressed',
]);

// MIME types allowed when detected from magic bytes (image formats)
// Used as a secondary check after the header MIME check passes.
const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/tiff',
  'image/x-icon',
]);

// Disallowed extensions (even if MIME type passes)
const BLOCKED_EXTENSIONS = new Set([
  '.php',
  '.exe',
  '.bat',
  '.cmd',
  '.sh',
  '.js',
  '.mjs',
  '.ts',
  '.py',
  '.rb',
  '.pl',
  '.c',
  '.cpp',
  '.java',
  '.jar',
  '.go',
  '.rs',
  '.html',
  '.htm',
  // SVG can contain scripts — only allow if explicitly needed
]);

@Injectable()
export class FileUploadService {
  private readonly uploadDir = join(process.cwd(), 'uploads');

  constructor(private readonly configService: ConfigService) {}

  private getBaseUrl(): string {
    const host =
      this.configService.get<string>('APP_URL') ?? 'http://localhost:3013';
    return host.replace(/\/$/, '');
  }

  /**
   * Validates a file using magic bytes (file-type library) and MIME allowlist.
   * Throws BadRequestException if the file is not allowed.
   */
  private async validateFile(
    buffer: Buffer,
    originalName: string,
    headerMimeType: string,
  ): Promise<void> {
    // 1. Check MIME type from header
    if (!ALLOWED_MIME_TYPES.has(headerMimeType)) {
      throw new BadRequestException(
        `File type '${headerMimeType}' is not allowed. Allowed types: images (JPEG, PNG, WebP, GIF, BMP, TIFF), documents (PDF, Word, Excel, TXT), and archives (ZIP).`,
      );
    }

    // 2. Check file extension
    const ext = extname(originalName).toLowerCase();
    if (BLOCKED_EXTENSIONS.has(ext)) {
      throw new BadRequestException(
        `Files with extension '${ext}' are not allowed for security reasons.`,
      );
    }

    // 3. Verify actual file content via magic bytes
    const detected = await fileTypeFromBuffer(buffer);
    if (!detected) {
      throw new BadRequestException(
        'Could not verify file type. The file may be corrupted or have an unsupported format.',
      );
    }

    // 4. For images: accept any recognized image MIME type (handles mismatches like PNG-extension/JPEG-content)
    // For non-images: strictly check against the allowlist
    if (headerMimeType.startsWith('image/')) {
      if (!ALLOWED_IMAGE_MIME_TYPES.has(detected.mime)) {
        throw new BadRequestException(
          `File content '${detected.mime}' is not a supported image format.`,
        );
      }
    } else {
      if (!ALLOWED_MIME_TYPES.has(detected.mime)) {
        throw new BadRequestException(
          `File content type '${detected.mime}' does not match allowed types.`,
        );
      }
    }
  }

  async uploadSingle(
    file: Express.Multer.File,
    folder: string = 'uploads',
  ): Promise<UploadedFile> {
    // Validate before saving
    await this.validateFile(file.buffer, file.originalname, file.mimetype);

    const ext = extname(file.originalname).toLowerCase();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;
    const relativePath = `/uploads/${folder}/${fileName}`;
    const url = `${this.getBaseUrl()}${relativePath}`;

    const targetDir = join(this.uploadDir, folder);
    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true });
    }
    const targetPath = join(targetDir, fileName);
    writeFileSync(targetPath, file.buffer);

    return {
      fileName,
      originalName: file.originalname,
      url,
      size: file.size,
      mimeType: file.mimetype,
    };
  }

  async uploadMultiple(
    files: Express.Multer.File[],
    folder: string = 'uploads',
  ): Promise<UploadedFile[]> {
    return Promise.all(files.map((file) => this.uploadSingle(file, folder)));
  }
}
