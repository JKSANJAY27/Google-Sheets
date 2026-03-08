'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/context/AuthContext'
import { useSheet } from '@/hooks/useSheet'
import { usePresence } from '@/hooks/usePresence'
import Grid from '@/components/grid/Grid'
import FormulaBar from '@/components/grid/FormulaBar'
import Toolbar from '@/components/grid/Toolbar'
import PresenceBar from '@/components/PresenceBar'
import { exportCSV, exportXLSX } from '@/lib/export'

interface SheetPageProps {
    params: Promise<{ docId: string }>
}

export default function SheetPage({ params }: SheetPageProps) {
    return (
        <ProtectedRoute>
            <SheetEditor params={params} />
        </ProtectedRoute>
    )
}

function SheetEditor({ params }: SheetPageProps) {
    const { user } = useAuth()
    const router = useRouter()
    const [resolvedParams, setResolvedParams] = useState<{ docId: string } | null>(null)
    const [selectedCell, setSelectedCell] = useState('A1')
    const [colWidths, setColWidths] = useState<Record<number, number>>({})
    const [rowHeights, setRowHeights] = useState<Record<number, number>>({})
    const [docTitle, setDocTitle] = useState('Untitled')

    if (!resolvedParams) {
        params.then((p) => setResolvedParams(p))
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <SheetEditorInner
            docId={resolvedParams.docId}
            selectedCell={selectedCell}
            setSelectedCell={setSelectedCell}
            colWidths={colWidths}
            setColWidths={setColWidths}
            rowHeights={rowHeights}
            setRowHeights={setRowHeights}
            docTitle={docTitle}
            setDocTitle={setDocTitle}
            uid={user?.uid ?? ''}
            displayName={user?.displayName ?? 'User'}
            router={router}
        />
    )
}

interface InnerProps {
    docId: string
    selectedCell: string
    setSelectedCell: (s: string) => void
    colWidths: Record<number, number>
    setColWidths: (v: Record<number, number>) => void
    rowHeights: Record<number, number>
    setRowHeights: (v: Record<number, number>) => void
    docTitle: string
    setDocTitle: (t: string) => void
    uid: string
    displayName: string
    router: ReturnType<typeof useRouter>
}

function SheetEditorInner({
    docId,
    selectedCell,
    setSelectedCell,
    colWidths,
    setColWidths,
    rowHeights,
    setRowHeights,
    docTitle,
    setDocTitle,
    uid,
    displayName,
    router,
}: InnerProps) {
    const { cells, writeStatus, updateCell, updateFormat } = useSheet(docId)
    const { presences, updateActiveCell } = usePresence(docId, uid, displayName)
    const [fetchedTitle, setFetchedTitle] = useState(false)

    useEffect(() => {
        if (!docId) return
        const fetchTitle = async () => {
            try {
                const snap = await getDoc(doc(db, 'documents', docId))
                const data = snap.data()
                if (data?.title) {
                    setDocTitle(data.title)
                }
            } catch (e) {
                console.error(e)
            } finally {
                setFetchedTitle(true)
            }
        }
        fetchTitle()
    }, [docId, setDocTitle])

    const handleCellSelect = useCallback(
        (cellId: string) => {
            setSelectedCell(cellId)
            updateActiveCell(cellId)
        },
        [setSelectedCell, updateActiveCell]
    )

    const selectedData = cells[selectedCell]
    const rawFormula = selectedData?.formula ?? ''

    async function handleTitleChange(title: string) {
        setDocTitle(title)
        await updateDoc(doc(db, 'documents', docId), {
            title,
            updatedAt: serverTimestamp(),
        })
    }

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-white">
            <div className="flex items-center border-b border-gray-200 bg-gray-50 px-2" style={{ height: 44 }}>
                <Toolbar
                    selectedCell={selectedCell}
                    selectedFormat={selectedData?.format}
                    onFormatChange={(patch) => updateFormat(selectedCell, patch)}
                    writeStatus={writeStatus}
                    docTitle={docTitle}
                    onTitleChange={handleTitleChange}
                    onExportCSV={() => exportCSV(cells, docTitle)}
                    onExportXLSX={() => exportXLSX(cells, docTitle)}
                    onBack={() => router.push('/dashboard')}
                />
                <PresenceBar presences={presences} currentUid={uid} />
            </div>

            <FormulaBar
                selectedCell={selectedCell}
                rawValue={rawFormula}
                onChange={(val) => updateCell(selectedCell, val)}
                onCommit={(val) => updateCell(selectedCell, val)}
            />

            <Grid
                cells={cells}
                onCellChange={updateCell}
                onCellSelect={handleCellSelect}
                selectedCell={selectedCell}
                presences={presences}
                colWidths={colWidths}
                rowHeights={rowHeights}
                onColResize={(col, w) => setColWidths({ ...colWidths, [col]: w })}
                onRowResize={(row, h) => setRowHeights({ ...rowHeights, [row]: h })}
            />
        </div>
    )
}
