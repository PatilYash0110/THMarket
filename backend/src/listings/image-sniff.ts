// `multer`'s fileFilter only sees the client-supplied `Content-Type` header
// for each part — trivially spoofable, and it runs before the file body is
// even fully read into `file.buffer` with memoryStorage(), so it can't be
// swapped for a content check anyway. This runs afterward, once the real
// bytes are available, checking each format's actual magic number rather
// than trusting what the browser claimed the file was.
const SIGNATURES: { check: (buffer: Buffer) => boolean }[] = [
  {
    check: (b) =>
      b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  }, // JPEG
  {
    check: (b) =>
      b.length >= 8 &&
      b[0] === 0x89 &&
      b[1] === 0x50 &&
      b[2] === 0x4e &&
      b[3] === 0x47 &&
      b[4] === 0x0d &&
      b[5] === 0x0a &&
      b[6] === 0x1a &&
      b[7] === 0x0a, // PNG
  },
  {
    check: (b) =>
      b.length >= 6 && ['GIF87a', 'GIF89a'].includes(b.toString('ascii', 0, 6)),
  }, // GIF87a/89a
  {
    check: (b) =>
      b.length >= 12 &&
      b.toString('ascii', 0, 4) === 'RIFF' &&
      b.toString('ascii', 8, 12) === 'WEBP',
  }, // WEBP
];

export function isLikelyImage(buffer: Buffer): boolean {
  return SIGNATURES.some(({ check }) => check(buffer));
}
