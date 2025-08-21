import { generateSessionId, generateEncryptionKey, formatFileSize } from '@/lib/config'

describe('Config Utils', () => {
  describe('generateSessionId', () => {
    it('should generate a 6-character string', () => {
      const sessionId = generateSessionId()
      expect(sessionId).toHaveLength(6)
    })

    it('should only contain uppercase letters and numbers', () => {
      const sessionId = generateSessionId()
      expect(sessionId).toMatch(/^[A-Z0-9]+$/)
    })

    it('should generate different IDs on multiple calls', () => {
      const id1 = generateSessionId()
      const id2 = generateSessionId()
      expect(id1).not.toBe(id2)
    })
  })

  describe('generateEncryptionKey', () => {
    it('should generate a non-empty string', () => {
      const key = generateEncryptionKey()
      expect(key).toBeTruthy()
      expect(typeof key).toBe('string')
      expect(key.length).toBeGreaterThan(0)
    })

    it('should generate different keys on multiple calls', () => {
      const key1 = generateEncryptionKey()
      const key2 = generateEncryptionKey()
      expect(key1).not.toBe(key2)
    })
  })

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(512)).toBe('512 Bytes')
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1536)).toBe('1.5 KB')
    })

    it('should format kilobytes correctly', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1 MB')
    })

    it('should format megabytes correctly', () => {
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB')
    })

    it('should handle zero bytes', () => {
      expect(formatFileSize(0)).toBe('0 Bytes')
    })
  })
})
