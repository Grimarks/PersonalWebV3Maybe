import { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { toDriveImageUrl, toDriveThumbnailUrl } from "@/lib/gdrive";

interface DriveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string | null | undefined;
  alt: string;
  thumbnail?: boolean;
  thumbnailWidth?: number;
  fallbackClassName?: string;
}

/**
 * Komponen <img> yang otomatis mengubah link Google Drive menjadi
 * direct image URL, dan menampilkan placeholder rapi kalau gambar
 * kosong atau gagal dimuat (misal link belum di-set "Anyone with link").
 */
export function DriveImage({
  src,
  alt,
  thumbnail = false,
  thumbnailWidth = 600,
  className,
  fallbackClassName,
  ...props
}: DriveImageProps) {
  const resolvedSrc = thumbnail
    ? toDriveThumbnailUrl(src, thumbnailWidth)
    : toDriveImageUrl(src);

  const [errored, setErrored] = useState(false);

  // Penting: reset status error setiap kali src/resolvedSrc berubah.
  // Tanpa ini, kalau gambar SEBELUMNYA pernah gagal load di instance
  // komponen yang sama (mis. saat preview berganti-ganti foto), status
  // error itu "nempel" dan placeholder terus ditampilkan walau src baru
  // sebenarnya valid dan bisa dimuat.
  useEffect(() => {
    setErrored(false);
  }, [resolvedSrc]);

  if (!resolvedSrc || errored) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-secondary/40 text-muted-foreground",
          fallbackClassName || className
        )}
      >
        <ImageOff className="h-8 w-8 opacity-40" />
      </div>
    );
  }

  return (
    <img
      key={resolvedSrc}
      src={resolvedSrc}
      alt={alt}
      loading="lazy"
      onError={() => setErrored(true)}
      className={className}
      {...props}
    />
  );
}
