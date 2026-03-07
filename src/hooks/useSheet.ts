'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
    collection,
    doc,
    onSnapshot,
    setDoc,
    getDoc,
    serverTimestamp,
    updateDoc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { CellData, CellMap, WriteStatus } from '@/types'
import { parseFormula } from '@/lib/formula/parser'
import { evaluateAST } from '@/lib/formula/evaluator'
import { buildEvalOrder } from '@/lib/formula/deps'

const defaultFormat = () => ({
    bold: false,
    italic: false,
    textColor: '#000000',
    bgColor: '#ffffff',
    fontSize: 14,
})

function recompute(cells: CellMap): CellMap {
    const next: CellMap = { ...cells }
    const order = buildEvalOrder(next)
    for (const id of order) {
        const cell = next[id]
        if (!cell) continue
        if (cell.formula.startsWith('=')) {
            try {
                const ast = parseFormula(cell.formula)
                const result = evaluateAST(ast, next)
                next[id] = { ...cell, computed: result }
            } catch {
                next[id] = { ...cell, computed: '#ERROR!' }
            }
        } else {
            const n = parseFloat(cell.formula)
            next[id] = { ...cell, computed: isNaN(n) ? cell.formula : n }
        }
    }
    return next
}

export function useSheet(docId: string) {
    const [cells, setCells] = useState<CellMap>({})
    const [writeStatus, setWriteStatus] = useState<WriteStatus>('idle')
    const pendingRef = useRef(0)
    const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        if (!docId) return
        const colRef = collection(db, 'documents', docId, 'cells')
        const unsub = onSnapshot(colRef, (snap) => {
            const incoming: CellMap = {}
            snap.docs.forEach((d) => {
                incoming[d.id] = d.data() as CellData
            })
            setCells(recompute(incoming))
        })
        return unsub
    }, [docId])

    const updateCell = useCallback(
        (cellId: string, value: string) => {
            setCells((prev) => {
                const existing = prev[cellId]
                const updated: CellData = {
                    value,
                    formula: value,
                    computed: value.startsWith('=') ? '#...' : (parseFloat(value) || value),
                    format: existing?.format ?? defaultFormat(),
                }
                const next = recompute({ ...prev, [cellId]: updated })
                return next
            })

            pendingRef.current++
            setWriteStatus('saving')
            if (saveTimer.current) clearTimeout(saveTimer.current)
            saveTimer.current = setTimeout(async () => {
                try {
                    const cellRef = doc(db, 'documents', docId, 'cells', cellId)
                    const existing = (await getDoc(cellRef)).data()
                    await setDoc(cellRef, {
                        value,
                        formula: value,
                        computed: value,
                        format: existing?.format ?? defaultFormat(),
                    })
                    await updateDoc(doc(db, 'documents', docId), {
                        updatedAt: serverTimestamp(),
                    })
                    pendingRef.current--
                    if (pendingRef.current === 0) setWriteStatus('saved')
                } catch {
                    setWriteStatus('error')
                }
            }, 400)
        },
        [docId]
    )

    const updateFormat = useCallback(
        async (cellId: string, patch: Partial<CellData['format']>) => {
            const cellRef = doc(db, 'documents', docId, 'cells', cellId)
            const snap = await getDoc(cellRef)
            const existing = snap.data() as CellData | undefined
            const newFormat = { ...(existing?.format ?? defaultFormat()), ...patch }
            await setDoc(cellRef, {
                value: existing?.value ?? '',
                formula: existing?.formula ?? '',
                computed: existing?.computed ?? '',
                format: newFormat,
            })
        },
        [docId]
    )

    return { cells, writeStatus, updateCell, updateFormat }
}
