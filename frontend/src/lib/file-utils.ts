/**
 * Smart Preview Helper:
 * Routes Microsoft Office AND PDF files through dedicated viewers.
 */
export const getPreviewUrl = (url: string | null | undefined): string => {
  if (!url) return "";

  const lowerUrl = url.toLowerCase();

  if (
    lowerUrl.endsWith(".docx") ||
    lowerUrl.endsWith(".doc") ||
    lowerUrl.endsWith(".xlsx") ||
    lowerUrl.endsWith(".pptx")
  ) {
    return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`;
  }

  // 🚀 PDF PREVIEW FIX: Route PDFs through Google's Viewer for guaranteed rendering
  // This bypasses browser-specific PDF quirks and Cloudinary cross-origin issues.
  if (lowerUrl.endsWith(".pdf")) {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
  }

  return url;
};

/**
 * Smart Download Helper:
 * Uses Cloudinary's native `fl_attachment` flag for images/documents.
 */
export const getDownloadUrl = (
  url: string | null | undefined,
  originalFilename: string | null | undefined,
): string => {
  if (!url) return "";

  const lowerUrl = url.toLowerCase();

  // 🚀 PDF DOWNLOAD FIX PART 1:
  // Cloudinary blocks `fl_attachment` on PDFs. We MUST return the raw URL here.
  if (lowerUrl.endsWith(".pdf")) {
    return url;
  }

  if (!originalFilename) {
    return url.replace("/upload/", "/upload/fl_attachment/");
  }

  const nameParts = originalFilename.split(".");
  nameParts.pop();
  const safeName = nameParts.join("").replace(/[^a-zA-Z0-9_-]/g, "_");

  return url.replace("/upload/", `/upload/fl_attachment:${safeName}/`);
};

/**
 * 🚀 PDF DOWNLOAD FIX PART 2: The Blob Fetcher
 * Because cross-origin links ignore the HTML5 'download' attribute,
 * we must fetch the PDF as a Blob to force the browser to download it locally.
 */
export const forceFileDownload = async (url: string, filename: string) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename || "downloaded_file.pdf";
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Blob download failed, falling back to new tab:", error);
    window.open(url, "_blank"); // Safe Fallback
  }
};
