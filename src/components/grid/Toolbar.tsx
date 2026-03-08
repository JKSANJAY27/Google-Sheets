'use client'

import { CellData, WriteStatus } from '@/types'

interface ToolbarProps {
    selectedCell: string
    selectedFormat: CellData['format'] | undefined
    onFormatChange: (patch: Partial<CellData['format']>) => void
    writeStatus: WriteStatus
    docTitle: string
    onTitleChange: (title: string) => void
    onExportCSV: () => void
    onExportXLSX: () => void
    onBack: () => void
}

function StatusDot({ status }: { status: WriteStatus }) {
    if (status === 'saving') return <span className="text-yellow-400 text-xs">Saving...</span>
    if (status === 'saved') return <span className="text-green-400 text-xs">Saved</span>
    if (status === 'error') return <span className="text-red-400 text-xs">Error saving</span>
    return null
}

export default function Toolbar({
    selectedFormat,
    onFormatChange,
    writeStatus,
    docTitle,
    onTitleChange,
    onExportCSV,
    onExportXLSX,
    onBack,
}: ToolbarProps) {
    const bold = selectedFormat?.bold ?? false
    const italic = selectedFormat?.italic ?? false

    return (
        <div className="flex items-center gap-1 px-3 border-b border-gray-200 bg-gray-50 flex-wrap" style={{ height: 40, minHeight: 40 }}>
            <button
                onClick={onBack}
                className="text-gray-500 hover:text-gray-700 mr-2 text-sm"
            >
                ←
            </button>

            <input
                value={docTitle}
                onChange={(e) => onTitleChange(e.target.value)}
                className="text-sm text-gray-700 font-medium bg-transparent outline-none border-b border-transparent hover:border-gray-300 focus:border-blue-400 transition-colors px-1 max-w-[160px]"
            />

            <div className="w-px h-5 bg-gray-300 mx-1" />

            <button
                onClick={() => onFormatChange({ bold: !bold })}
                className={`w-7 h-7 rounded flex items-center justify-center text-sm font-bold transition-colors ${bold ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-200'}`}
            >
                B
            </button>
            <button
                onClick={() => onFormatChange({ italic: !italic })}
                className={`w-7 h-7 rounded flex items-center justify-center text-sm italic transition-colors ${italic ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-200'}`}
            >
                I
            </button>

            <div className="w-px h-5 bg-gray-300 mx-1" />

            <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer">
                <span>A</span>
                <input
                    type="color"
                    value={selectedFormat?.textColor ?? '#000000'}
                    onChange={(e) => onFormatChange({ textColor: e.target.value })}
                    className="w-4 h-4 cursor-pointer border-0 p-0 bg-transparent"
                />
            </label>
            <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer">
                <span className="text-xs">Fill</span>
                <input
                    type="color"
                    value={selectedFormat?.bgColor ?? '#ffffff'}
                    onChange={(e) => onFormatChange({ bgColor: e.target.value })}
                    className="w-4 h-4 cursor-pointer border-0 p-0 bg-transparent"
                />
            </label>

            <div className="w-px h-5 bg-gray-300 mx-1" />

            <button
                onClick={onExportCSV}
                className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 hover:bg-gray-200 rounded transition-colors"
            >
                CSV
            </button>
            <button
                onClick={onExportXLSX}
                className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 hover:bg-gray-200 rounded transition-colors"
            >
                XLSX
            </button>

            <div className="ml-auto">
                <StatusDot status={writeStatus} />
            </div>
        </div>
    )
}
