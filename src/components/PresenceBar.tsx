'use client'

import { UserPresence } from '@/types'

interface PresenceBarProps {
    presences: UserPresence[]
    currentUid: string
}

export default function PresenceBar({ presences, currentUid }: PresenceBarProps) {
    const others = presences.filter((p) => p.uid !== currentUid)
    const me = presences.find((p) => p.uid === currentUid)

    return (
        <div className="flex items-center gap-1.5 px-3">
            {me && (
                <div
                    title={`${me.displayName} (you)`}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium ring-2 ring-white"
                    style={{ backgroundColor: me.color }}
                >
                    {me.displayName[0]?.toUpperCase()}
                </div>
            )}
            {others.map((p) => (
                <div
                    key={p.uid}
                    title={p.displayName}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium"
                    style={{ backgroundColor: p.color }}
                >
                    {p.displayName[0]?.toUpperCase()}
                </div>
            ))}
        </div>
    )
}
