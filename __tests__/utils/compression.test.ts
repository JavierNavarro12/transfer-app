import {
  shouldCompressFile,
  compressFile,
  decompressFile,
  smartCompressFile,
  type CompressionOptions
} from '@/lib/compression'

describe('Compression Utils', () => {
  const testOptions: CompressionOptions = {
    minSize: 1024,      // 1KB
    maxSize: 10 * 1024 * 1024, // 10MB
    minRatio: 0.1       // 10%
  }

  describe('shouldCompressFile', () => {
    it('should not compress very small files', () => {
      const smallFile = new File(['test'], 'small.txt', { type: 'text/plain' })
      Object.defineProperty(smallFile, 'size', { value: 500 }) // 500 bytes
      expect(shouldCompressFile(smallFile, testOptions)).toBe(false)
    })

    it('should compress text files', () => {
      const textFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
      Object.defineProperty(textFile, 'size', { value: 2048 }) // 2KB
      expect(shouldCompressFile(textFile, testOptions)).toBe(true)
    })

    it('should compress JSON files', () => {
      const jsonFile = new File(['{"test": "data"}'], 'test.json', { type: 'application/json' })
      Object.defineProperty(jsonFile, 'size', { value: 2048 })
      expect(shouldCompressFile(jsonFile, testOptions)).toBe(true)
    })

    it('should not compress already compressed files', () => {
      const zipFile = new File(['compressed'], 'test.zip', { type: 'application/zip' })
      Object.defineProperty(zipFile, 'size', { value: 2048 })
      expect(shouldCompressFile(zipFile, testOptions)).toBe(false)
    })

    it('should not compress JPEG images', () => {
      const jpegFile = new File(['image'], 'test.jpg', { type: 'image/jpeg' })
      Object.defineProperty(jpegFile, 'size', { value: 2048 })
      expect(shouldCompressFile(jpegFile, testOptions)).toBe(false)
    })

    it('should not compress PNG images', () => {
      const pngFile = new File(['image'], 'test.png', { type: 'image/png' })
      Object.defineProperty(pngFile, 'size', { value: 2048 })
      expect(shouldCompressFile(pngFile, testOptions)).toBe(false)
    })

    it('should not compress ZIP files by extension', () => {
      const zipFile = new File(['content'], 'test.zip')
      Object.defineProperty(zipFile, 'size', { value: 2048 })
      expect(shouldCompressFile(zipFile, testOptions)).toBe(false)
    })
  })

  describe('compressFile', () => {
    it('should compress text content', async () => {
      const textContent = 'This is a test file with some content that should be compressible. ' +
                         'We repeat this text multiple times to ensure good compression ratio. ' +
                         'This is a test file with some content that should be compressible.'

      // Create a mock file with arrayBuffer method
      const mockArrayBuffer = new TextEncoder().encode(textContent).buffer
      const textFile = new File([textContent], 'test.txt', { type: 'text/plain' })
      Object.defineProperty(textFile, 'arrayBuffer', {
        value: jest.fn().mockResolvedValue(mockArrayBuffer)
      })

      const result = await compressFile(textFile)

      expect(result.compressed).toBe(true)
      expect(result.algorithm).toBe('gzip')
      expect(result.compressedSize).toBeLessThan(result.originalSize)
      expect(result.compressionRatio).toBeGreaterThan(0)
      expect(result.data).toBeInstanceOf(ArrayBuffer)
    })

    it('should handle empty files', async () => {
      const emptyContent = ''
      const mockArrayBuffer = new TextEncoder().encode(emptyContent).buffer
      const emptyFile = new File([emptyContent], 'empty.txt', { type: 'text/plain' })
      Object.defineProperty(emptyFile, 'arrayBuffer', {
        value: jest.fn().mockResolvedValue(mockArrayBuffer)
      })

      const result = await compressFile(emptyFile)

      expect(result.compressed).toBe(true)
      expect(result.algorithm).toBe('gzip')
      expect(result.data).toBeInstanceOf(ArrayBuffer)
    })
  })

  describe('decompressFile', () => {
    it('should decompress previously compressed data', async () => {
      const originalText = 'Test content for compression and decompression'

      // Create a mock file with arrayBuffer method
      const mockArrayBuffer = new TextEncoder().encode(originalText).buffer
      const textFile = new File([originalText], 'test.txt', { type: 'text/plain' })
      Object.defineProperty(textFile, 'arrayBuffer', {
        value: jest.fn().mockResolvedValue(mockArrayBuffer)
      })

      // Compress
      const compressedResult = await compressFile(textFile)
      expect(compressedResult.compressed).toBe(true)

      // Decompress
      const decompressedBuffer = decompressFile(compressedResult.data!)
      const decompressedText = new TextDecoder().decode(decompressedBuffer)

      expect(decompressedText).toBe(originalText)
    })
  })

  describe('smartCompressFile', () => {
    it('should return original file if compression not beneficial', async () => {
      // Create a small file that won't benefit from compression
      const smallFile = new File(['test'], 'small.txt', { type: 'text/plain' })
      Object.defineProperty(smallFile, 'size', { value: 500 })

      const { file, compressionResult } = await smartCompressFile(smallFile)

      expect(file).toBe(smallFile) // Should return original file
      expect(compressionResult.compressed).toBe(false)
    })

    it('should compress large text files', async () => {
      const largeText = 'A'.repeat(5000) // Repetitive text for good compression

      // Create a mock file with arrayBuffer method
      const mockArrayBuffer = new TextEncoder().encode(largeText).buffer
      const largeFile = new File([largeText], 'large.txt', { type: 'text/plain' })
      Object.defineProperty(largeFile, 'size', { value: 5000 })
      Object.defineProperty(largeFile, 'arrayBuffer', {
        value: jest.fn().mockResolvedValue(mockArrayBuffer)
      })

      const { file, compressionResult } = await smartCompressFile(largeFile)

      expect(compressionResult.compressed).toBe(true)
      expect(file).not.toBe(largeFile) // Should return new compressed file
      expect(file.name).toBe('large.txt.gz')
      expect(file.type).toBe('application/gzip')
    })

    it('should not compress already compressed files', async () => {
      const zipFile = new File(['compressed content'], 'test.zip', { type: 'application/zip' })
      Object.defineProperty(zipFile, 'size', { value: 2048 })

      const { file, compressionResult } = await smartCompressFile(zipFile)

      expect(file).toBe(zipFile)
      expect(compressionResult.compressed).toBe(false)
    })

    it('should respect custom options', async () => {
      const smallFile = new File(['test'], 'small.txt', { type: 'text/plain' })
      Object.defineProperty(smallFile, 'size', { value: 2048 })

      const customOptions: Partial<CompressionOptions> = {
        minSize: 4096, // 4KB minimum
        minRatio: 0.5  // 50% minimum compression
      }

      const { file, compressionResult } = await smartCompressFile(smallFile, customOptions)

      expect(file).toBe(smallFile)
      expect(compressionResult.compressed).toBe(false)
    })
  })

  describe('compression quality', () => {
    it('should achieve good compression on repetitive text', async () => {
      const repetitiveText = 'The quick brown fox jumps over the lazy dog. '.repeat(100)

      // Create a mock file with arrayBuffer method
      const mockArrayBuffer = new TextEncoder().encode(repetitiveText).buffer
      const repetitiveFile = new File([repetitiveText], 'repetitive.txt', { type: 'text/plain' })
      Object.defineProperty(repetitiveFile, 'arrayBuffer', {
        value: jest.fn().mockResolvedValue(mockArrayBuffer)
      })

      const result = await compressFile(repetitiveFile)

      expect(result.compressed).toBe(true)
      expect(result.compressionRatio).toBeGreaterThan(0.5) // At least 50% compression
    })

    it('should handle different file types appropriately', async () => {
      const testCases = [
        { name: 'text.txt', type: 'text/plain', expected: true },
        { name: 'data.json', type: 'application/json', expected: true },
        { name: 'image.bmp', type: 'image/bmp', expected: false },
        { name: 'file.zip', type: 'application/zip', expected: false },
      ]

      for (const testCase of testCases) {
        const content = testCase.name.includes('text') || testCase.name.includes('json')
          ? 'Sample content for compression test. '.repeat(50)
          : '\x00'.repeat(1000)

        const file = new File([content], testCase.name, { type: testCase.type })
        Object.defineProperty(file, 'size', { value: content.length })

        const shouldCompress = shouldCompressFile(file, testOptions)
        expect(shouldCompress).toBe(testCase.expected)
      }
    })
  })
})
