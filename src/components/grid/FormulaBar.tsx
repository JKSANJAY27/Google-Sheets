'use client'

interface FormulaBarProps {
    selectedCell: string
    rawValue: string
    onChange: (val: string) => void
    onCommit: (val: string) => void
}

export default function FormulaBar({ selectedCell, rawValue, onChange, onCommit }: FormulaBarProps) {
    return (
        <div className="flex items-center border-b border-gray-300 bg-white px-2" style={{ height: 30 }}>
            <div className="w-16 text-center text-sm text-gray-500 border-r border-gray-300 mr-2 pr-2 shrink-0">
                {selectedCell}
            </div>
            <span className="text-gray-400 text-sm mr-2 shrink-0">fx</span>
            <input
                value={rawValue}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); onCommit(rawValue) }
                }}
                className="flex-1 text-sm text-gray-800 outline-none bg-transparent"
                placeholder=""
            />
        </div>
    )
}
