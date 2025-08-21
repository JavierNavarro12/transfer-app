import pako from 'pako'

export interface CompressionResult {
  compressed: boolean
  originalSize: number
  compressedSize: number
  compressionRatio: number
  algorithm: string
  data: ArrayBuffer | null
}

export interface CompressionOptions {
  minSize: number     // Tamaño mínimo para comprimir (bytes)
  maxSize: number     // Tamaño máximo para comprimir (bytes)
  minRatio: number    // Ratio mínimo de compresión (0-1)
}

/**
 * Determina si un archivo debe ser comprimido basado en su tipo y tamaño
 */
export function shouldCompressFile(file: File, options: CompressionOptions = {
  minSize: 1024,      // 1KB mínimo
  maxSize: 100 * 1024 * 1024, // 100MB máximo
  minRatio: 0.1       // 10% reducción mínima
}): boolean {
  const { size, type, name } = file
  const mimeType = type.toLowerCase()
  const fileName = name.toLowerCase()

  // 1. Archivos muy pequeños - no comprimir
  if (size < options.minSize) return false

  // 2. Archivos muy grandes - solo comprimir si son texto
  if (size > options.maxSize) {
    return mimeType.startsWith('text/') ||
           mimeType.includes('json') ||
           mimeType.includes('xml') ||
           mimeType.includes('document')
  }

  // 3. Archivos ya comprimidos - no tocar
  const compressedExtensions = ['.zip', '.rar', '.7z', '.gz', '.bz2', '.xz']
  if (compressedExtensions.some(ext => fileName.endsWith(ext))) {
    return false
  }

  // 4. Archivos ya comprimidos por tipo MIME
  const compressedMimeTypes = [
    'application/zip',
    'application/gzip',
    'application/x-zip-compressed',
    'application/x-rar-compressed',
    'application/x-7z-compressed'
  ]
  if (compressedMimeTypes.includes(mimeType)) {
    return false
  }

  // 5. Multimedia ya comprimido - no tocar
  if (mimeType.startsWith('video/') ||
      mimeType.startsWith('audio/') ||
      (mimeType.startsWith('image/') &&
       (mimeType.includes('jpeg') || mimeType.includes('png') || mimeType.includes('webp')))) {
    return false
  }

  // 6. Texto y documentos - siempre comprimir
  if (mimeType.startsWith('text/') ||
      mimeType.includes('json') ||
      mimeType.includes('xml') ||
      mimeType.includes('document') ||
      mimeType.includes('pdf')) {
    return true
  }

  // 7. Otros archivos - comprimir si > 100KB
  return size > 1024 * 100
}

/**
 * Comprime un archivo usando gzip
 */
export async function compressFile(file: File): Promise<CompressionResult> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // Comprimir con gzip
    const compressed = pako.gzip(uint8Array)
    const compressedSize = compressed.length
    const compressionRatio = 1 - (compressedSize / file.size)

    return {
      compressed: true,
      originalSize: file.size,
      compressedSize,
      compressionRatio,
      algorithm: 'gzip',
      data: compressed.buffer
    }
  } catch (error) {
    return {
      compressed: false,
      originalSize: file.size,
      compressedSize: file.size,
      compressionRatio: 0,
      algorithm: 'none',
      data: null
    }
  }
}

/**
 * Descomprime datos comprimidos con gzip
 */
export function decompressFile(compressedData: ArrayBuffer): ArrayBuffer {
  try {
    const uint8Array = new Uint8Array(compressedData)
    const decompressed = pako.ungzip(uint8Array)
    return decompressed.buffer
  } catch (error) {
    throw new Error('Failed to decompress file')
  }
}

/**
 * Proceso completo de compresión inteligente
 */
export async function smartCompressFile(
  file: File,
  options?: Partial<CompressionOptions>
): Promise<{ file: File | Blob, compressionResult: CompressionResult }> {
  const defaultOptions: CompressionOptions = {
    minSize: 1024,
    maxSize: 100 * 1024 * 1024,
    minRatio: 0.1
  }

  const finalOptions = { ...defaultOptions, ...options }

  // Verificar si debe comprimirse
  if (!shouldCompressFile(file, finalOptions)) {
    return {
      file,
      compressionResult: {
        compressed: false,
        originalSize: file.size,
        compressedSize: file.size,
        compressionRatio: 0,
        algorithm: 'none',
        data: null
      }
    }
  }

  // Intentar comprimir
  const compressionResult = await compressFile(file)

  // Verificar si la compresión fue beneficiosa
  if (!compressionResult.compressed ||
      compressionResult.compressionRatio < finalOptions.minRatio) {
    return {
      file,
      compressionResult: {
        compressed: false,
        originalSize: file.size,
        compressedSize: file.size,
        compressionRatio: 0,
        algorithm: 'none',
        data: null
      }
    }
  }

  // Crear nuevo archivo comprimido
  const compressedBlob = new Blob([compressionResult.data!], {
    type: 'application/gzip'
  })

  // Crear nuevo archivo con extensión .gz
  const compressedFile = new File([compressedBlob], `${file.name}.gz`, {
    type: 'application/gzip',
    lastModified: file.lastModified
  })

  return {
    file: compressedFile,
    compressionResult
  }
}
