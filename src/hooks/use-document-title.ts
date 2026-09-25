import { useEffect } from "react";

const SITE_NAME = "Darrell Satriano";

/** Mengatur judul tab browser per halaman, mis. "Projects — Darrell Satriano". */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — Portfolio`;
  }, [title]);
}
