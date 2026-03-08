'use client'

import { useEffect, useRef, useState } from 'react'
import { ref, set, onValue, remove, onDisconnect } from 'firebase/database'
import { rtdb } from '@/lib/firebase'
import { UserPresence } from '@/types'
import { getUserColor } from '@/lib/utils'

export function usePresence(docId: string, uid: string, displayName: string) {
    const [presences, setPresences] = useState<UserPresence[]>([])
    const myRef = useRef(ref(rtdb, `presence/${docId}/${uid}`))

    useEffect(() => {
        if (!uid || !docId) return
        myRef.current = ref(rtdb, `presence/${docId}/${uid}`)

        const data: UserPresence = {
            uid,
            displayName,
            color: getUserColor(uid),
            activeCell: null,
            lastSeen: Date.now(),
        }

        set(myRef.current, data)
        onDisconnect(myRef.current).remove()

        const allRef = ref(rtdb, `presence/${docId}`)
        const unsub = onValue(allRef, (snap) => {
            const val = snap.val()
            if (!val) { setPresences([]); return }
            const list: UserPresence[] = Object.values(val)
            setPresences(list)
        })

        return () => {
            unsub()
            remove(myRef.current)
        }
    }, [docId, uid, displayName])

    function updateActiveCell(cellId: string) {
        set(myRef.current, {
            uid,
            displayName,
            color: getUserColor(uid),
            activeCell: cellId,
            lastSeen: Date.now(),
        })
    }

    return { presences, updateActiveCell }
}
