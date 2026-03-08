import { CellMap } from '@/types'
import * as XLSX from 'xlsx'

const COLS = 26
const ROWS = 100

export function exportCSV(cells: CellMap, title: string) {
    const rows: string[][] = []
    for (let r = 0; r < ROWS; r++) {
        const row: string[] = []
        let hasData = false
        for (let c = 0; c < COLS; c++) {
            const id = `${String.fromCharCode(65 + c)}${r + 1}`
            const val = cells[id]?.computed ?? ''
            if (val !== '') hasData = true
            row.push(String(val))
        }
        if (hasData || rows.length > 0) rows.push(row)
    }
    while (rows.length > 0 && rows[rows.length - 1].every((v) => v === '')) rows.pop()

    const csv = rows.map((r) => r.map((v) => (v.includes(',') ? `"${v}"` : v)).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title}.csv`
    a.click()
    URL.revokeObjectURL(url)
}

export function exportXLSX(cells: CellMap, title: string) {
    const rows: (string | number)[][] = []
    for (let r = 0; r < ROWS; r++) {
        const row: (string | number)[] = []
        let hasData = false
        for (let c = 0; c < COLS; c++) {
            const id = `${String.fromCharCode(65 + c)}${r + 1}`
            const val = cells[id]?.computed ?? ''
            if (val !== '') hasData = true
            row.push(val as string | number)
        }
        if (hasData || rows.length > 0) rows.push(row)
    }
    while (rows.length > 0 && rows[rows.length - 1].every((v) => v === '')) rows.pop()

    const ws = XLSX.utils.aoa_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
    XLSX.writeFile(wb, `${title}.xlsx`)
}
