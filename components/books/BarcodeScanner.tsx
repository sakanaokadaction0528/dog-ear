'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Loader2 } from 'lucide-react'

interface BarcodeScannerProps {
  onDetected: (isbn: string) => void
  onClose: () => void
}

function isValidISBN(text: string) {
  return /^97[89]\d{10}$/.test(text) || /^\d{9}[\dX]$/.test(text)
}

export function BarcodeScanner({ onDetected, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const onDetectedRef = useRef(onDetected)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => { onDetectedRef.current = onDetected }, [onDetected])

  useEffect(() => {
    let active = true
    let stream: MediaStream | null = null
    let rafId: number

    function stopStream() {
      // Clear srcObject BEFORE stopping tracks so iOS Safari doesn't
      // render a "This page couldn't load" error on the video element
      if (videoRef.current) videoRef.current.srcObject = null
      stream?.getTracks().forEach(t => t.stop())
      stream = null
    }

    async function start() {
      try {
        // Try back camera first; fall back to any camera if constraints fail
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: 'environment' } },
          })
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({ video: true })
        }
        if (!active) { stopStream(); return }

        const video = videoRef.current!
        video.srcObject = stream

        // Wait for metadata before playing (required on iOS Safari)
        await new Promise<void>((resolve) => {
          if (video.readyState >= 1) { resolve(); return }
          video.onloadedmetadata = () => resolve()
        })

        try {
          await video.play()
        } catch {
          // iOS may throw AbortError here but the stream still works; continue
        }
        if (!active) return
        setReady(true)

        // Native BarcodeDetector (Chrome/Android) — fastest path
        if ('BarcodeDetector' in window) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const detector = new (window as any).BarcodeDetector({ formats: ['ean_13', 'ean_8', 'isbn'] })
          const tick = async () => {
            if (!active) return
            try {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const barcodes: any[] = await detector.detect(video)
              for (const b of barcodes) {
                if (isValidISBN(b.rawValue)) {
                  active = false
                  stopStream()
                  onDetectedRef.current(b.rawValue)
                  return
                }
              }
            } catch { /* no barcode */ }
            if (active) rafId = requestAnimationFrame(tick)
          }
          rafId = requestAnimationFrame(tick)
          return
        }

        // ZXing fallback (iOS Safari etc.) — needs explicit EAN-13 hints
        const {
          MultiFormatReader, BinaryBitmap, HybridBinarizer,
          HTMLCanvasElementLuminanceSource, DecodeHintType, BarcodeFormat,
        } = await import('@zxing/library')

        const hints = new Map()
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13, BarcodeFormat.EAN_8])
        hints.set(DecodeHintType.TRY_HARDER, true)
        const reader = new MultiFormatReader()
        reader.setHints(hints)

        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d', { willReadFrequently: true })!

        const tick = () => {
          if (!active) return
          if (video.readyState >= video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            ctx.drawImage(video, 0, 0)
            try {
              const src = new HTMLCanvasElementLuminanceSource(canvas)
              const bitmap = new BinaryBitmap(new HybridBinarizer(src))
              const result = reader.decode(bitmap)
              const text = result.getText()
              if (isValidISBN(text)) {
                active = false
                stopStream()
                onDetectedRef.current(text)
                return
              }
            } catch { /* no barcode in this frame */ }
          }
          rafId = requestAnimationFrame(tick)
        }
        rafId = requestAnimationFrame(tick)
      } catch (e) {
        console.error('[BarcodeScanner]', e)
        if (!active) return
        const name = (e as DOMException)?.name
        if (name === 'NotAllowedError') {
          setError('カメラへのアクセスが拒否されています。設定からカメラを許可してください。')
        } else if (name === 'NotFoundError') {
          setError('カメラが見つかりません。')
        } else {
          setError('カメラを起動できませんでした。')
        }
      }
    }

    start()
    return () => {
      active = false
      cancelAnimationFrame(rafId)
      stopStream()
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex items-center justify-between px-4 pt-safe-top py-3 bg-black/80">
        <p className="text-white text-sm font-medium">バーコードをスキャン</p>
        <button type="button" onClick={onClose} className="text-white p-1">
          <X size={22} />
        </button>
      </div>

      <div className="flex-1 relative">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          autoPlay
          muted
        />

        {!error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-72 h-44">
              <span className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg" />
              <span className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg" />
              <span className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg" />
              <span className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg" />
              {ready && (
                <span className="absolute left-2 right-2 top-1/2 h-0.5 bg-primary/80 animate-pulse" />
              )}
            </div>
          </div>
        )}

        {!ready && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 size={32} className="text-white animate-spin" />
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center px-8 bg-black">
            <p className="text-white text-center text-sm">{error}</p>
          </div>
        )}
      </div>

      <div className="px-4 pb-safe-bottom py-4 bg-black/80">
        <p className="text-white/60 text-xs text-center">
          本の裏面にあるISBNバーコードを枠内に合わせてください
        </p>
      </div>
    </div>
  )
}
