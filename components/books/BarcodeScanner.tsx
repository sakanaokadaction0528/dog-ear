'use client'

import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { NotFoundException } from '@zxing/library'
import { X, Loader2 } from 'lucide-react'

interface BarcodeScannerProps {
  onDetected: (isbn: string) => void
  onClose: () => void
}

export function BarcodeScanner({ onDetected, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const reader = new BrowserMultiFormatReader()
    readerRef.current = reader

    reader.decodeFromConstraints(
      { video: { facingMode: 'environment' } },
      videoRef.current!,
      (result, err) => {
        if (result) {
          const text = result.getText()
          // ISBN-13 (978/979始まり) または ISBN-10
          if (/^97[89]\d{10}$/.test(text) || /^\d{9}[\dX]$/.test(text)) {
            onDetected(text)
          }
        }
        if (err && !(err instanceof NotFoundException)) {
          console.error('[BarcodeScanner]', err)
        }
      }
    ).then(() => setReady(true))
      .catch((e) => {
        console.error('[BarcodeScanner] init error', e)
        setError('カメラを起動できませんでした。カメラのアクセスを許可してください。')
      })

    return () => {
      BrowserMultiFormatReader.releaseAllStreams()
    }
  }, [onDetected])

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
          muted
        />

        {/* Scanning frame overlay */}
        {!error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-64 h-40">
              {/* Corners */}
              <span className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg" />
              <span className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg" />
              <span className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg" />
              <span className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg" />
              {/* Scan line */}
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
