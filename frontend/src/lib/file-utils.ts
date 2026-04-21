
/**
 * Smart Preview Helper:
 * Routes Microsoft Office files through the official Office Web Viewer.
 * Returns the standard Cloudinary URL for PDFs, images, and other formats.
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
    // Encode the URL so Microsoft can read it properly
    return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`;
  }

  return url;
};

/**
 * Smart Download Helper:
 * Uses Cloudinary's native `fl_attachment` flag to force a download
 * and rename the file to its original, human-readable filename.
 */
export const getDownloadUrl = (
  url: string | null | undefined,
  originalFilename: string | null | undefined,
): string => {
  if (!url) return "";

  if (!originalFilename) {
    return url.replace("/upload/", "/upload/fl_attachment/");
  }

  const nameParts = originalFilename.split(".");
  nameParts.pop(); // Remove extension, Cloudinary handles it automatically
  const safeName = nameParts.join("").replace(/[^a-zA-Z0-9_-]/g, "_"); // Remove spaces/special chars

  return url.replace("/upload/", `/upload/fl_attachment:${safeName}/`);
};
