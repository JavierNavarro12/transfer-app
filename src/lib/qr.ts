// QRCodeSVG is imported but not used directly - available for future use

export const generateQRCodeDataURL = async (text: string): Promise<string> => {
  try {
    // For server-side rendering, we'll create a simple data URL
    // In a real app, you might want to use a different QR code library for server-side generation
    const size = 256;
    const dataUrl = `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" fill="white"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="20" fill="black">${text}</text></svg>`).toString('base64')}`;
    return dataUrl;
  } catch (error) {
    throw new Error('Failed to generate QR code');
  }
};

export const generateShareableLink = (sessionId: string, baseUrl?: string): string => {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/receive/${sessionId}`;
};
