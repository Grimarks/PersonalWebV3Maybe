import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, UploadCloud, LogIn } from "lucide-react";
import { useGoogleDriveAuth } from "@/contexts/GoogleDriveAuthContext";
import { uploadImageToDrive, HOBBY_DRIVE_FOLDER_ID } from "@/lib/gdrive";
import { useToast } from "@/hooks/use-toast";

interface DriveUploadButtonProps {
  onUploaded: (shareLink: string) => void;
  label?: string;
}

/**
 * Tombol "Upload dari Device" yang dipasang di form admin (Project, Writing, Hobby).
 * Kalau belum konek Google Drive, tombol akan minta login dulu.
 * Setelah upload sukses, link share Drive dikirim lewat onUploaded().
 */
export function DriveUploadButton({ onUploaded, label = "Upload dari Device" }: DriveUploadButtonProps) {
  const { isConnected, isReady, connecting, connect, getAccessToken } = useGoogleDriveAuth();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handlePickFile = () => {
    if (!isConnected) {
      connect();
      return;
    }
    inputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // reset supaya bisa pilih file yang sama lagi nanti
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ variant: "destructive", title: "File bukan gambar", description: "Pilih file gambar (jpg, png, dll)." });
      return;
    }

    const accessToken = getAccessToken();
    if (!accessToken) {
      toast({
        variant: "destructive",
        title: "Sesi Google Drive habis",
        description: "Silakan hubungkan ulang Google Drive.",
      });
      return;
    }

    setUploading(true);
    try {
      const result = await uploadImageToDrive(file, accessToken, HOBBY_DRIVE_FOLDER_ID);
      onUploaded(result.webViewLink);
      toast({ title: "Upload berhasil", description: "Foto sudah tersimpan di Google Drive." });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Upload gagal",
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat upload.",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={!isReady || connecting || uploading}
        onClick={handlePickFile}
      >
        {uploading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : !isConnected ? (
          <LogIn className="mr-2 h-4 w-4" />
        ) : (
          <UploadCloud className="mr-2 h-4 w-4" />
        )}
        {uploading
          ? "Mengunggah..."
          : connecting
          ? "Menghubungkan..."
          : !isConnected
          ? "Hubungkan Google Drive"
          : label}
      </Button>
    </div>
  );
}
