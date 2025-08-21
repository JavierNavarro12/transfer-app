import { decryptFile } from '@/lib/encryption'

describe('Encryption Utils', () => {
  const testKey = 'test-encryption-key-123'

  describe('decryptFile', () => {
    it('should return a Blob', () => {
      const mockEncryptedContent = 'U2FsdGVkX1+test+content+here' // Mock encrypted content
      const result = decryptFile(mockEncryptedContent, testKey)

      expect(result).toBeInstanceOf(Blob)
    })

    it('should handle encrypted content', () => {
      const mockEncryptedContent = 'U2FsdGVkX1+test+content+here'
      const result = decryptFile(mockEncryptedContent, testKey)

      expect(result).toBeInstanceOf(Blob)
    })
  })
})
