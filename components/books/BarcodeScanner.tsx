'use client'

import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { BarcodeFormat, DecodeHintType } from '@zxing/library'
import { X, Loader2 } from 'lucide-react'

interface BarcodeScannerProps {
  onDetected: (isbn: string) => void
  onClose: () => void
}

const HINTS = new Map<DecodeHintType, unknown>([
  [DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13, BarcodeFormat.EAN_8]],
  [DecodeHintType.TRY_HARDER, true],
])

export function BarcodeScanner({ onDetected, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsRef = useRef<{ stop: () => void } | null>(null)
  const onDetectedRef = useRef(onDetected)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  // Keep ref current so the callback closure doesn't go stale
  useEffect(() => { onDetectedRef.current = onDetected }, [onDetected])

  useEffect(() => {
    if (!videoRef.current) return

    const reader = new BrowserMultiFormatReader(HINTS)
    let stopped = false

    reader.decodeFromConstraints(
      { video: { facingMode: 'environment' } },
      videoRef.current,
      (result, err) => {
        if (stopped) return
        if (result) {
          const text = result.getText()
          if (/^97[89]\d{10}$/.test(text) || /^\d{9}[\dX]$/.test(text)) {
            stopped = true
            controlsRef.current?.stop()
            onDetectedRef.current(text)
          }
        }
        // NotFoundException is expected when no barcode is in frame — ignore it
        if (err && err.name !== 'NotFoundException') {
          console.error('[BarcodeScanner]', err)
        }
      }
    ).then((controls) => {
      if (stopped) {
        controls.stop()
        return
      }
      controlsRef.current = controls
      setReady(true)
    }).catch((e) => {
      console.error('[BarcodeScanner] init error', e)
      setError('カメラを起動できませんでした。カメラへのアクセスを許可してください。')
    })

    return () => {
      stopped = true
      controlsRef.current?.stop()
      controlsRef.current = null
    }
  }, []) // run once on mount

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-safe-top py-3 bg-black/80">
        <p className="text-white text-sm font-medium">バーコードをスキャン</p>
        <button type="button" onClick={onClose} className="text-white p-1">
          <X size={22} />
        </button>
      </div>

      {/* Camera */}
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          autoPlay
          muted
        />

        {/* Scanning frame overlay */}
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

        {/* Loading */}
        {!ready && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 size={32} className="text-white animate-spin" />
          </div>
        )}

        {/* Error */}
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
