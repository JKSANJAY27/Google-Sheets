'use client'

import { useRef, useEffect, useState } from 'react'
import { CellData } from '@/types'

interface CellProps {
    cellId: string
    data?: CellData
    isSelected: boolean
    isEditing: boolean
    presenceColor?: string
    width: number
    height: number
    onClick: () => void
    onDoubleClick: () => void
    onCommit: (value: string) => void
    onTabOut: () => void
    onEscape: () => void
    onStartEdit: () => void
}

export default function Cell({
    cellId,
    data,
    isSelected,
    isEditing,
    presenceColor,
    width,
    height,
    onClick,
    onDoubleClick,
    onCommit,
    onTabOut,
    onEscape,
    onStartEdit,
}: CellProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [draft, setDraft] = useState(data?.formula ?? '')

    useEffect(() => {
        if (isEditing && inputRef.current) {
            setDraft(data?.formula ?? '')
            inputRef.current.focus()
            inputRef.current.select()
        }
    }, [isEditing, data?.formula])

    useEffect(() => {
        if (!isEditing) {
            setDraft(data?.formula ?? '')
        }
    }, [data?.formula, isEditing])

    const fmt = data?.format
    const displayValue = data
        ? typeof data.computed === 'number'
            ? String(data.computed)
            : (data.computed ?? data.value ?? '')
        : ''

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') { e.preventDefault(); onCommit(draft) }
        if (e.key === 'Tab') { e.preventDefault(); onCommit(draft); onTabOut() }
        if (e.key === 'Escape') { onEscape() }
    }

    function handleCellKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            onCommit('')
        } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
            setDraft(e.key)
            onStartEdit()
        }
    }

    const borderColor = presenceColor ?? (isSelected ? '#1a73e8' : 'transparent')
    const borderWidth = isSelected || presenceColor ? 2 : 0

    return (
        <div
            className="relative border-r border-b border-gray-200 flex items-center overflow-hidden cursor-default"
            style={{
                width,
                minWidth: width,
                height,
                backgroundColor: fmt?.bgColor && fmt.bgColor !== '#ffffff' ? fmt.bgColor : undefined,
                outline: `${borderWidth}px solid ${borderColor}`,
                outlineOffset: '-2px',
                zIndex: isSelected ? 5 : undefined,
            }}
            onClick={onClick}
            onDoubleClick={onDoubleClick}
            onKeyDown={handleCellKeyDown}
            tabIndex={isSelected ? 0 : -1}
        >
            {isEditing ? (
                <input
                    ref={inputRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={() => onCommit(draft)}
                    className="absolute inset-0 w-full h-full px-1 outline-none border-none bg-white text-gray-900 z-10"
                    style={{
                        fontSize: fmt?.fontSize ?? 14,
                        fontWeight: fmt?.bold ? 700 : 400,
                        fontStyle: fmt?.italic ? 'italic' : 'normal',
                        color: fmt?.textColor ?? '#000000',
                    }}
                />
            ) : (
                <span
                    className="px-1 truncate w-full text-gray-800"
                    style={{
                        fontSize: fmt?.fontSize ?? 14,
                        fontWeight: fmt?.bold ? 700 : 400,
                        fontStyle: fmt?.italic ? 'italic' : 'normal',
                        color: fmt?.textColor ?? '#1a1a1a',
                    }}
                >
                    {displayValue}
                </span>
            )}
        </div>
    )
}
