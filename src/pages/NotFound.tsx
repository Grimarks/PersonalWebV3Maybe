import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <p className="text-7xl font-bold text-primary mb-2">404</p>
        <h1 className="mb-3 text-2xl font-bold text-foreground">Halaman tidak ditemukan</h1>
        <p className="mb-8 text-muted-foreground">
          Halaman yang kamu cari sepertinya tidak ada atau sudah dipindahkan.
        </p>
        <Button asChild>
          <Link to="/">
            <Home className="mr-2 h-4 w-4" /> Kembali ke Beranda
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
