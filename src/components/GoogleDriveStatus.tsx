import { CloudCog, Cloud, Loader2 } from "lucide-react";
import { useGoogleDriveAuth } from "@/contexts/GoogleDriveAuthContext";
import { Button } from "@/components/ui/button";

export function GoogleDriveStatus() {
  const { isConnected, isReady, connecting, connect, disconnect } = useGoogleDriveAuth();

  if (!isReady) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground px-3 py-2">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Memuat Google Drive...
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20">
        <span className="flex items-center gap-2 text-xs text-primary font-medium">
          <CloudCog className="h-3.5 w-3.5" /> Drive Terhubung
        </span>
        <button onClick={disconnect} className="text-xs text-muted-foreground hover:text-destructive transition-colors">
          Putuskan
        </button>
      </div>
    );
  }

  return (
    <Button variant="outline" size="sm" className="w-full justify-start" onClick={connect} disabled={connecting}>
      <Cloud className="mr-2 h-3.5 w-3.5" />
      {connecting ? "Menghubungkan..." : "Hubungkan Google Drive"}
    </Button>
  );
}
