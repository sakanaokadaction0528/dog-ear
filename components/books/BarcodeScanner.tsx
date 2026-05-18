'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Loader2 } from 'lucide-react'

interface BarcodeScannerProps {
  onDetected: (isbn: string) => void
  onClose: () => void
}

export function BarcodeScanner({ onDetected, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const onDetectedRef = useRef(onDetected)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => { onDetectedRef.current = onDetected }, [onDetected])

  useEffect(() => {
    let active = true
    let stream: MediaStream | null = null
    let rafId: number

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        })
        if (!active) { stream.getTracks().forEach(t => t.stop()); return }

        const video = videoRef.current!
        video.srcObject = stream
        await video.play()
        if (!active) return
        setReady(true)

        // Dynamically import to avoid SSR issues
        const { MultiFormatReader, BinaryBitmap, HybridBinarizer, HTMLCanvasElementLuminanceSource } =
          await import('@zxing/library')
        const reader = new MultiFormatReader()
        const canvas = canvasRef.current!
        const ctx = canvas.getContext('2d', { willReadFrequently: true })!

        function tick() {
          if (!active) return
          if (video.readyState >= video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            ctx.drawImage(video, 0, 0)
            try {
              const src = new HTMLCanvasElementLuminanceSource(canvas)
              const bitmap = new BinaryBitmap(new HybridBinarizer(src))
              const result = reader.decode(bitmap)
              const text = result.getText()
              if (/^97[89]\d{10}$/.test(text) || /^\d{9}[\dX]$/.test(text)) {
                active = false
                stream?.getTracks().forEach(t => t.stop())
                onDetectedRef.current(text)
                return
              }
            } catch {
              // No barcode in this frame — expected, keep scanning
            }
          }
          rafId = requestAnimationFrame(tick)
        }
        rafId = requestAnimationFrame(tick)
      } catch (e) {
        console.error('[BarcodeScanner]', e)
        if (active) setError('カメラを起動できませんでした。カメラへのアクセスを許可してください。')
      }
    }

    start()
    return () => {
      active = false
      cancelAnimationFrame(rafId)
      stream?.getTracks().forEach(t => t.stop())
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
        {/* Hidden canvas for frame decoding */}
        <canvas ref={canvasRef} className="hidden" />

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
          <div className="absolute inset-0 flex items-center justify-center px-8">
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
