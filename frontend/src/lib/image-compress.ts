const MAX_DIMENSION = 1600
const JPEG_QUALITY = 0.82
// Below this, re-encoding can only make the file bigger (JPEG re-compression
// overhead) or strip transparency from a small PNG for no real benefit.
const SKIP_BELOW_BYTES = 1_500_000

// Phone camera photos routinely land well past the 8 MB per-file limit
// (listings.controller.ts, backend), and stacking several of those into one
// generate-description request pushes the combined payload past Gemini's own
// size ceiling too — this shrinks each photo once, right at selection, so
// both the upload and the AI-description call work off the same, already-
// reasonably-sized file instead of hitting either limit.
export async function compressImage(file: File): Promise<File> {
  if (file.size <= SKIP_BELOW_BYTES) return file

  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(bitmap, 0, 0, width, height)
    bitmap.close()

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY))
    if (!blob || blob.size >= file.size) return file

    return new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' })
  } catch {
    // Best-effort optimization, not a requirement — an unsupported format or
    // decode failure falls back to the original file rather than blocking
    // the photo from being added at all.
    return file
  }
}
