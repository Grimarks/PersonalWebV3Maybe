import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";

interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    isAdmin: boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    currentUser: null,
    loading: true,
    isAdmin: false,
    logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// Daftar email admin (pisahkan koma) dari .env. Kalau kosong, semua user yang login
// dianggap admin — tetap WAJIB kunci juga di Firestore Rules (lihat SETUP_GUIDE.md bagian 6).
const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || "")
    .split(",")
    .map((e: string) => e.trim().toLowerCase())
    .filter(Boolean);

function checkIsAdmin(user: User | null): boolean {
    if (!user) return false;
    if (ADMIN_EMAILS.length === 0) return true;
    return ADMIN_EMAILS.includes((user.email || "").toLowerCase());
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const logout = () => signOut(auth);

    // Children langsung dirender: halaman publik tidak perlu menunggu status auth.
    // Halaman yang butuh auth (ProtectedRoute, Login) menangani `loading` sendiri.
    return (
        <AuthContext.Provider value={{ currentUser, loading, isAdmin: checkIsAdmin(currentUser), logout }}>
            {children}
        </AuthContext.Provider>
    );
};
