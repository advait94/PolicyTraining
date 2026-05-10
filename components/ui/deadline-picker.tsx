'use client'

import { useState, useEffect } from 'react'

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
]

function daysInMonth(month: number, year: number) {
    return new Date(year, month, 0).getDate()
}

function parseDate(value: string): { day: number; month: number; year: number } | null {
    if (!value) return null
    const [y, m, d] = value.split('-').map(Number)
    if (!y || !m || !d) return null
    return { day: d, month: m, year: y }
}

function formatDate(day: number, month: number, year: number): string {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function DeadlinePicker({
    value,
    onChange,
    disabled,
}: {
    value: string          // "YYYY-MM-DD" or ""
    onChange: (val: string) => void
    disabled?: boolean
}) {
    const now = new Date()
    const currentYear = now.getFullYear()
    const years = Array.from({ length: 4 }, (_, i) => currentYear + i)

    const parsed = parseDate(value)
    const [selDay, setSelDay]     = useState(parsed?.day   ?? 0)
    const [selMonth, setSelMonth] = useState(parsed?.month ?? 0)
    const [selYear, setSelYear]   = useState(parsed?.year  ?? 0)

    // Sync local state when the external value changes (e.g. deadline cleared)
    useEffect(() => {
        const p = parseDate(value)
        setSelDay(p?.day   ?? 0)
        setSelMonth(p?.month ?? 0)
        setSelYear(p?.year  ?? 0)
    }, [value])

    const maxDay = selYear && selMonth ? daysInMonth(selMonth, selYear) : 31

    const commit = (day: number, month: number, year: number) => {
        if (!day || !month || !year) return
        const clamped = Math.min(day, daysInMonth(month, year))
        onChange(formatDate(clamped, month, year))
    }

    const cls = `text-xs bg-black/30 border border-white/10 text-slate-300 rounded-md px-2 py-1
                 focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-50 cursor-pointer`

    return (
        <div className="flex items-center gap-1">
            {/* Day */}
            <select
                value={selDay || ''}
                onChange={e => {
                    const d = Number(e.target.value)
                    setSelDay(d)
                    commit(d, selMonth, selYear)
                }}
                disabled={disabled}
                className={cls}
            >
                <option value="">DD</option>
                {Array.from({ length: maxDay }, (_, i) => i + 1).map(d => (
                    <option key={d} value={d}>{String(d).padStart(2, '0')}</option>
                ))}
            </select>

            {/* Month */}
            <select
                value={selMonth || ''}
                onChange={e => {
                    const m = Number(e.target.value)
                    setSelMonth(m)
                    commit(selDay, m, selYear)
                }}
                disabled={disabled}
                className={cls}
            >
                <option value="">MMM</option>
                {MONTHS.map((m, i) => (
                    <option key={i + 1} value={i + 1}>{m.slice(0, 3)}</option>
                ))}
            </select>

            {/* Year */}
            <select
                value={selYear || ''}
                onChange={e => {
                    const y = Number(e.target.value)
                    setSelYear(y)
                    commit(selDay, selMonth, y)
                }}
                disabled={disabled}
                className={cls}
            >
                <option value="">YYYY</option>
                {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                ))}
            </select>
        </div>
    )
}
