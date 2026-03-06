'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/context/AuthContext'
import { useDocuments } from '@/hooks/useDocuments'
import { getUserColor } from '@/lib/utils'

function formatDate(ts: number) {
    if (!ts) return '—'
    const d = new Date(ts)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function DashboardPage() {
    return (
        <ProtectedRoute>
            <Dashboard />
        </ProtectedRoute>
    )
}

function Dashboard() {
    const { user, signOut } = useAuth()
    const router = useRouter()
    const { docs, loading, createDoc, deleteDocument } = useDocuments(user?.uid ?? '')
    const [creating, setCreating] = useState(false)
    const [newTitle, setNewTitle] = useState('')
    const [showInput, setShowInput] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

    async function handleCreate() {
        if (!newTitle.trim()) return
        setCreating(true)
        const id = await createDoc(newTitle.trim(), user?.displayName ?? 'Unknown')
        setNewTitle('')
        setShowInput(false)
        setCreating(false)
        router.push(`/sheet/${id}`)
    }

    return (
        <div className="min-h-screen bg-gray-950">
            <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">S</span>
                    </div>
                    <span className="text-white font-semibold">Sheets</span>
                </div>
                <div className="flex items-center gap-3">
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                        style={{ backgroundColor: getUserColor(user?.uid ?? '') }}
                    >
                        {(user?.displayName ?? 'U')[0].toUpperCase()}
                    </div>
                    <span className="text-gray-400 text-sm">{user?.displayName}</span>
                    <button
                        onClick={signOut}
                        className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
                    >
                        Sign out
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-10">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-white text-2xl font-semibold">My documents</h1>
                    <button
                        onClick={() => setShowInput(true)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        + New spreadsheet
                    </button>
                </div>

                {showInput && (
                    <div className="mb-6 flex gap-3 items-center">
                        <input
                            autoFocus
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                            placeholder="Untitled spreadsheet"
                            className="flex-1 max-w-sm px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-600 outline-none focus:border-emerald-500 transition-colors"
                        />
                        <button
                            onClick={handleCreate}
                            disabled={creating}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                        >
                            {creating ? 'Creating...' : 'Create'}
                        </button>
                        <button
                            onClick={() => { setShowInput(false); setNewTitle('') }}
                            className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : docs.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-gray-700 text-5xl mb-4">📄</div>
                        <p className="text-gray-500">No spreadsheets yet. Create one to get started.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {docs.map((doc) => (
                            <div
                                key={doc.id}
                                className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-600 transition-all group cursor-pointer relative"
                                onClick={() => router.push(`/sheet/${doc.id}`)}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-10 h-10 bg-emerald-900/50 rounded-lg flex items-center justify-center">
                                        <span className="text-2xl">📊</span>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setDeleteTarget(doc.id)
                                        }}
                                        className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all p-1"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                                <p className="text-white font-medium truncate mb-1">{doc.title}</p>
                                <p className="text-gray-500 text-xs">Modified {formatDate(doc.updatedAt)}</p>
                                <div className="flex items-center gap-1.5 mt-3">
                                    <div
                                        className="w-4 h-4 rounded-full text-white text-[9px] flex items-center justify-center font-medium"
                                        style={{ backgroundColor: getUserColor(doc.ownerId) }}
                                    >
                                        {doc.ownerName[0]?.toUpperCase()}
                                    </div>
                                    <span className="text-gray-600 text-xs">{doc.ownerName}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {deleteTarget && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-sm w-full mx-4">
                        <h3 className="text-white font-semibold mb-2">Delete document?</h3>
                        <p className="text-gray-400 text-sm mb-5">This action cannot be undone.</p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    await deleteDocument(deleteTarget)
                                    setDeleteTarget(null)
                                }}
                                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
