/**
 * Downloads a remote file. `<a download>` is ignored for cross-origin URLs,
 * so fetch it as a blob first; if CORS blocks that, open it in a new tab.
 */
export async function downloadFile(url, filename) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blobUrl = URL.createObjectURL(await response.blob());

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

export function outputFilename(output) {
  return `fomi-${output.id}.${output.type === "video" ? "mp4" : "jpg"}`;
}
