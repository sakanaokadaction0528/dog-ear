'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Loader2 } from 'lucide-react'

interface BarcodeScannerProps {
  onDetected: (isbn: string) => void
  onClose: () => void
}

const CONTAINER_ID = 'barcode-scanner-container'

export function BarcodeScanner({ onDetected, onClose }: BarcodeScannerProps) {
  const onDetectedRef = useRef(onDetected)
  const scannerRef = useRef<import('html5-qrcode').Html5Qrcode | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => { onDetectedRef.current = onDetected }, [onDetected])

  useEffect(() => {
    let stopped = false

    async function start() {
      try {
        const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import('html5-qrcode')
        if (stopped) return

        const scanner = new Html5Qrcode(CONTAINER_ID, {
          verbose: false,
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
          ],
        })
        scannerRef.current = scanner

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 280, height: 120 }, aspectRatio: 1.7 },
          (decodedText) => {
            if (stopped) return
            const text = decodedText.trim()
            if (/^97[89]\d{10}$/.test(text) || /^\d{9}[\dX]$/.test(text)) {
              stopped = true
              scanner.stop().catch(() => {})
              onDetectedRef.current(text)
            }
          },
          () => { /* no barcode in frame — ignore */ }
        )
        if (!stopped) setReady(true)
      } catch (e) {
        console.error('[BarcodeScanner]', e)
        if (!stopped) setError('カメラを起動できませんでした。カメラへのアクセスを許可してください。')
      }
    }

    start()

    return () => {
      stopped = true
      scannerRef.current?.stop().catch(() => {})
      scannerRef.current = null
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

      <div className="flex-1 relative overflow-hidden">
        {/* html5-qrcode renders the video inside this div */}
        <div
          id={CONTAINER_ID}
          className="w-full h-full [&_video]:w-full [&_video]:h-full [&_video]:object-cover [&_img]:hidden"
        />

        {!ready && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
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
