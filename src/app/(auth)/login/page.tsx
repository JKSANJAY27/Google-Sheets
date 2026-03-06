'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { signInAnonymously } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { updateProfile } from 'firebase/auth'

export default function LoginPage() {
    const { signInWithGoogle } = useAuth()
    const router = useRouter()
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const [nameMode, setNameMode] = useState(false)
    const [error, setError] = useState('')

    async function handleGoogle() {
        try {
            setLoading(true)
            await signInWithGoogle()
            router.push('/dashboard')
        } catch {
            setError('Sign in failed. Try again.')
            setLoading(false)
        }
    }

    async function handleAnonymous() {
        if (!name.trim()) {
            setError('Please enter a name')
            return
        }
        try {
            setLoading(true)
            const result = await signInAnonymously(auth)
            await updateProfile(result.user, { displayName: name.trim() })
            router.push('/dashboard')
        } catch {
            setError('Something went wrong.')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
            <div className="w-full max-w-sm">
                <div className="flex items-center gap-3 mb-8 justify-center">
                    <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">S</span>
                    </div>
                    <span className="text-white text-2xl font-semibold">Sheets</span>
                </div>

                <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8">
                    <h1 className="text-white text-xl font-semibold mb-1">Welcome</h1>
                    <p className="text-gray-400 text-sm mb-6">Sign in to start collaborating</p>

                    {error && (
                        <div className="mb-4 px-4 py-2 bg-red-900/40 border border-red-800 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {!nameMode ? (
                        <div className="space-y-3">
                            <button
                                onClick={handleGoogle}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-gray-100 text-gray-900 rounded-xl font-medium transition-colors disabled:opacity-50"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Continue with Google
                            </button>

                            <div className="relative flex items-center">
                                <div className="flex-1 border-t border-gray-800" />
                                <span className="px-3 text-gray-600 text-xs">or</span>
                                <div className="flex-1 border-t border-gray-800" />
                            </div>

                            <button
                                onClick={() => setNameMode(true)}
                                className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-750 text-gray-300 rounded-xl font-medium transition-colors border border-gray-700"
                            >
                                Continue as guest
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div>
                                <label className="text-gray-400 text-sm block mb-1.5">Display name</label>
                                <input
                                    autoFocus
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAnonymous()}
                                    placeholder="Your name"
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-600 outline-none focus:border-emerald-500 transition-colors"
                                />
                            </div>
                            <button
                                onClick={handleAnonymous}
                                disabled={loading}
                                className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Joining...' : 'Join as guest'}
                            </button>
                            <button
                                onClick={() => { setNameMode(false); setError('') }}
                                className="w-full text-gray-500 text-sm hover:text-gray-400 transition-colors"
                            >
                                Back
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
