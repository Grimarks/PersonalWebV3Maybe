import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { currentUser, loading, isAdmin, logout } = useAuth();
    const deniedUser = !loading && currentUser && !isAdmin;

    useEffect(() => {
        if (deniedUser) {
            toast.error("Akun ini tidak punya akses admin.");
            logout();
        }
    }, [deniedUser, logout]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!currentUser || !isAdmin) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};
