'use client'
import { useEffect, useRef, useState } from 'react'

// Natural certificate dimensions at 96dpi
const CERT_W = 1056 // 11in
const CERT_H = 816  // 8.5in
const MAX_DISPLAY_W = 780 // max px wide on screen

export function CertificateScaleWrapper({ children }: { children: React.ReactNode }) {
    const measureRef = useRef<HTMLDivElement>(null)
    const [scale, setScale] = useState<number | null>(null)

    useEffect(() => {
        function calc() {
            const el = measureRef.current
            if (!el) return
            const availW = Math.min(el.clientWidth - 32, MAX_DISPLAY_W)
            setScale(availW / CERT_W)
        }
        calc()
        const ro = new ResizeObserver(calc)
        if (measureRef.current) ro.observe(measureRef.current)
        return () => ro.disconnect()
    }, [])

    const s = scale ?? 1
    const displayW = Math.round(CERT_W * s)
    const displayH = Math.round(CERT_H * s)

    return (
        <>
            {/* Print: natural rendering, no transform */}
            <style>{`@media print {
                .cert-scale-outer { all: unset !important; display: block !important; }
                .cert-scale-inner { all: unset !important; display: block !important; }
            }`}</style>

            {/* Full-width measurement bar (zero height) */}
            <div ref={measureRef} className="w-full" style={{ height: 0 }} />

            {/* Screen: scaled container */}
            <div
                className="cert-scale-outer relative mx-auto overflow-hidden"
                style={scale !== null
                    ? { width: displayW, height: displayH }
                    : { visibility: 'hidden', width: CERT_W, height: CERT_H }}
            >
                <div
                    className="cert-scale-inner absolute top-0 left-0"
                    style={{ transform: `scale(${s})`, transformOrigin: 'top left' }}
                >
                    {children}
                </div>
            </div>
        </>
    )
}
