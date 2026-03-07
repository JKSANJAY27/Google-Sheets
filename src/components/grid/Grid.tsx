'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { CellMap, CellData, UserPresence } from '@/types'
import Cell from './Cell'
import { getCellId } from '@/lib/utils'

const ROWS = 100
const COLS = 26

interface GridProps {
    cells: CellMap
    onCellChange: (cellId: string, value: string) => void
    onCellSelect: (cellId: string) => void
    selectedCell: string
    presences: UserPresence[]
    colWidths: Record<number, number>
    rowHeights: Record<number, number>
    onColResize: (col: number, width: number) => void
    onRowResize: (row: number, height: number) => void
}

export default function Grid({
    cells,
    onCellChange,
    onCellSelect,
    selectedCell,
    presences,
    colWidths,
    rowHeights,
    onColResize,
    onRowResize,
}: GridProps) {
    const [editingCell, setEditingCell] = useState<string | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const getColWidth = (col: number) => colWidths[col] ?? 100
    const getRowHeight = (row: number) => rowHeights[row] ?? 25

    const parseCell = (id: string) => {
        const match = id.match(/^([A-Z]+)(\d+)$/)
        if (!match) return null
        const col = match[1].charCodeAt(0) - 65
        const row = parseInt(match[2]) - 1
        return { row, col }
    }

    const moveSelection = useCallback(
        (dir: 'up' | 'down' | 'left' | 'right' | 'tab' | 'enter') => {
            const parsed = parseCell(selectedCell)
            if (!parsed) return
            let { row, col } = parsed
            if (dir === 'up') row = Math.max(0, row - 1)
            if (dir === 'down' || dir === 'enter') row = Math.min(ROWS - 1, row + 1)
            if (dir === 'left') col = Math.max(0, col - 1)
            if (dir === 'right' || dir === 'tab') col = Math.min(COLS - 1, col + 1)
            onCellSelect(getCellId(row, col))
        },
        [selectedCell, onCellSelect]
    )

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (editingCell) return
            if (e.key === 'ArrowUp') { e.preventDefault(); moveSelection('up') }
            if (e.key === 'ArrowDown') { e.preventDefault(); moveSelection('down') }
            if (e.key === 'ArrowLeft') { e.preventDefault(); moveSelection('left') }
            if (e.key === 'ArrowRight') { e.preventDefault(); moveSelection('right') }
            if (e.key === 'Tab') { e.preventDefault(); moveSelection('tab') }
            if (e.key === 'Enter') { e.preventDefault(); moveSelection('enter') }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [editingCell, moveSelection])

    const presenceMap: Record<string, UserPresence> = {}
    for (const p of presences) {
        if (p.activeCell) presenceMap[p.activeCell] = p
    }

    const resizingCol = useRef<{ col: number; startX: number; startW: number } | null>(null)
    const resizingRow = useRef<{ row: number; startY: number; startH: number } | null>(null)

    function startColResize(col: number, e: React.MouseEvent) {
        e.preventDefault()
        resizingCol.current = { col, startX: e.clientX, startW: getColWidth(col) }
        function onMove(me: MouseEvent) {
            if (!resizingCol.current) return
            const { col: c, startX, startW } = resizingCol.current
            onColResize(c, Math.max(40, startW + me.clientX - startX))
        }
        function onUp() {
            resizingCol.current = null
            window.removeEventListener('mousemove', onMove)
            window.removeEventListener('mouseup', onUp)
        }
        window.addEventListener('mousemove', onMove)
        window.addEventListener('mouseup', onUp)
    }

    function startRowResize(row: number, e: React.MouseEvent) {
        e.preventDefault()
        resizingRow.current = { row, startY: e.clientY, startH: getRowHeight(row) }
        function onMove(me: MouseEvent) {
            if (!resizingRow.current) return
            const { row: r, startY, startH } = resizingRow.current
            onRowResize(r, Math.max(20, startH + me.clientY - startY))
        }
        function onUp() {
            resizingRow.current = null
            window.removeEventListener('mousemove', onMove)
            window.removeEventListener('mouseup', onUp)
        }
        window.addEventListener('mousemove', onMove)
        window.addEventListener('mouseup', onUp)
    }

    const totalWidth = Array.from({ length: COLS }, (_, i) => getColWidth(i)).reduce((a, b) => a + b, 0) + 50

    return (
        <div
            ref={containerRef}
            className="flex-1 overflow-auto bg-white select-none relative"
            tabIndex={0}
        >
            <div style={{ minWidth: totalWidth }}>
                <div className="flex sticky top-0 z-20 bg-gray-50 border-b border-gray-300">
                    <div className="w-[50px] min-w-[50px] border-r border-gray-300 bg-gray-100" />
                    {Array.from({ length: COLS }, (_, col) => (
                        <div
                            key={col}
                            className="relative border-r border-gray-300 flex items-center justify-center text-gray-500 text-xs font-medium bg-gray-50 hover:bg-gray-100 select-none"
                            style={{ width: getColWidth(col), minWidth: getColWidth(col), height: 25 }}
                        >
                            {String.fromCharCode(65 + col)}
                            <div
                                className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-400"
                                onMouseDown={(e) => startColResize(col, e)}
                            />
                        </div>
                    ))}
                </div>

                {Array.from({ length: ROWS }, (_, row) => (
                    <div key={row} className="flex" style={{ height: getRowHeight(row) }}>
                        <div
                            className="sticky left-0 z-10 border-r border-b border-gray-300 bg-gray-50 flex items-center justify-center text-gray-400 text-xs select-none relative"
                            style={{ width: 50, minWidth: 50, height: getRowHeight(row) }}
                        >
                            {row + 1}
                            <div
                                className="absolute bottom-0 left-0 w-full h-1 cursor-row-resize hover:bg-blue-400"
                                onMouseDown={(e) => startRowResize(row, e)}
                            />
                        </div>
                        {Array.from({ length: COLS }, (_, col) => {
                            const cellId = getCellId(row, col)
                            const isSelected = selectedCell === cellId
                            const presence = presenceMap[cellId]
                            const cellData: CellData | undefined = cells[cellId]
                            return (
                                <Cell
                                    key={cellId}
                                    cellId={cellId}
                                    data={cellData}
                                    isSelected={isSelected}
                                    isEditing={editingCell === cellId}
                                    presenceColor={presence?.color}
                                    width={getColWidth(col)}
                                    height={getRowHeight(row)}
                                    onClick={() => { onCellSelect(cellId); setEditingCell(null) }}
                                    onDoubleClick={() => { onCellSelect(cellId); setEditingCell(cellId) }}
                                    onCommit={(val) => {
                                        onCellChange(cellId, val)
                                        setEditingCell(null)
                                        moveSelection('enter')
                                    }}
                                    onTabOut={() => {
                                        setEditingCell(null)
                                        moveSelection('tab')
                                    }}
                                    onEscape={() => setEditingCell(null)}
                                    onStartEdit={() => setEditingCell(cellId)}
                                />
                            )
                        })}
                    </div>
                ))}
            </div>
        </div>
    )
}
