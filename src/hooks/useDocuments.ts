'use client'

import { useState, useEffect } from 'react'
import {
    collection,
    query,
    where,
    onSnapshot,
    addDoc,
    deleteDoc,
    doc,
    orderBy,
    serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { SpreadsheetDoc } from '@/types'

export function useDocuments(uid: string) {
    const [docs, setDocs] = useState<SpreadsheetDoc[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!uid) return
        const q = query(
            collection(db, 'documents'),
            where('ownerId', '==', uid),
            orderBy('updatedAt', 'desc')
        )
        const unsub = onSnapshot(q, (snap) => {
            const list: SpreadsheetDoc[] = snap.docs.map((d) => {
                const data = d.data()
                return {
                    id: d.id,
                    title: data.title,
                    ownerId: data.ownerId,
                    ownerName: data.ownerName,
                    createdAt: data.createdAt?.toMillis?.() ?? 0,
                    updatedAt: data.updatedAt?.toMillis?.() ?? 0,
                }
            })
            setDocs(list)
            setLoading(false)
        })
        return unsub
    }, [uid])

    async function createDoc(title: string, ownerName: string) {
        const ref = await addDoc(collection(db, 'documents'), {
            title,
            ownerId: uid,
            ownerName,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        })
        return ref.id
    }

    async function deleteDocument(docId: string) {
        await deleteDoc(doc(db, 'documents', docId))
    }

    return { docs, loading, createDoc, deleteDocument }
}
