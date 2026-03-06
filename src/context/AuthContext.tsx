'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import {
    User,
    signInWithPopup,
    GoogleAuthProvider,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    updateProfile,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'

interface AuthContextType {
    user: User | null
    loading: boolean
    signInWithGoogle: () => Promise<void>
    signOut: () => Promise<void>
    updateDisplayName: (name: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u)
            setLoading(false)
        })
        return unsub
    }, [])

    async function signInWithGoogle() {
        const provider = new GoogleAuthProvider()
        await signInWithPopup(auth, provider)
    }

    async function signOut() {
        await firebaseSignOut(auth)
    }

    async function updateDisplayName(name: string) {
        if (!auth.currentUser) return
        await updateProfile(auth.currentUser, { displayName: name })
        setUser({ ...auth.currentUser })
    }

    return (
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut, updateDisplayName }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be inside AuthProvider')
    return ctx
}
