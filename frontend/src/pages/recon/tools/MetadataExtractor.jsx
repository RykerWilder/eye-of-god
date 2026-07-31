import { useRef, useState } from "react";
import { FileSearch, Upload } from "lucide-react";

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB, must match backend limit
const MAX_METADATA_ROWS = 40;

function formatBytes(bytes) {
  if (bytes === null || bytes === undefined) return "n/a";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

function buildLines(fileName, data) {
  const metadataEntries = Object.entries(data?.metadata || {});
  const shownEntries = metadataEntries.slice(0, MAX_METADATA_ROWS);
  const hiddenCount = metadataEntries.length - shownEntries.length;

  return [
    { text: "> METADATA — Tikara File Analyzer", color: "text-[rgba(200,255,208,0.4)]" },
    { text: `> File       : ${fileName}`, color: "text-[rgba(200,255,208,0.7)]" },
    { text: `> Size       : ${formatBytes(data?.sizeBytes)}`, color: "text-[rgba(200,255,208,0.6)]" },
    { text: `> MIME Type  : ${data?.mimeType || "n/a"}`, color: "text-[#00ff41]" },
    { text: `> Fields     : ${metadataEntries.length}`, color: "text-[rgba(200,255,208,0.55)]" },
    { text: "> " + "─".repeat(32), color: "text-[rgba(200,255,208,0.15)]" },

    ...(shownEntries.length === 0
      ? [{ text: "> No metadata fields found.", color: "text-[rgba(200,255,208,0.35)]" }]
      : shownEntries.map(([key, value]) => ({
          text: `> [${key}] ${Array.isArray(value) ? value.join(", ") : value}`,
          color: "text-[rgba(200,255,208,0.85)]",
        }))),

    ...(hiddenCount > 0
      ? [{ text: `> ...and ${hiddenCount} more field(s).`, color: "text-[rgba(200,255,208,0.35)]" }]
      : []),

    ...(data?.contentPreview
      ? [
          { text: "> " + "─".repeat(32), color: "text-[rgba(200,255,208,0.15)]" },
          { text: "> Content preview:", color: "text-[rgba(200,255,208,0.4)]" },
          ...data.contentPreview
            .split("\n")
            .slice(0, 20)
            .map((line) => ({ text: `> ${line}`, color: "text-[rgba(200,255,208,0.55)]" })),
          ...(data.contentTruncated
            ? [{ text: "> [content truncated]", color: "text-[rgba(200,255,208,0.35)]" }]
            : []),
        ]
      : []),
  ];
}

export const metadataLoadingLines = [
  { text: "> uploading file...", color: "text-[rgba(200,255,208,0.6)]" },
  { text: "> parsing with tikara / apache tika...", color: "text-[rgba(200,255,208,0.4)]" },
];

export function getMetadataLines(result) {
  if (result?.type !== "metadata") return null;
  return buildLines(result.fileName, result.data);
}

export default function MetadataExtractor({ onResult, onError, onLoading }) {
  const [file, setFile] = useState(null);
  const inputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0] || null;
    if (selected && selected.size > MAX_FILE_SIZE_BYTES) {
      onError(`File troppo grande (max ${formatBytes(MAX_FILE_SIZE_BYTES)}).`);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setFile(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    onLoading(true);
    onError("");
    onResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:8000/api/metadata", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "API Error");

      onResult({
        type: "metadata",
        fileName: file.name,
        data,
      });
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      onError(err.message);
    } finally {
      onLoading(false);
    }
  };

  return (
    <section className="group border border-[rgba(0,255,65,0.12)] bg-[linear-gradient(160deg,rgba(0,255,65,0.05),rgba(13,13,13,0.97)_65%)] p-4 flex flex-col gap-4 transition duration-200 hover:border-[rgba(0,255,65,0.32)]">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[rgba(0,255,65,0.25)] bg-[rgba(0,255,65,0.07)] transition duration-200 group-hover:border-[rgba(0,255,65,0.45)] group-hover:bg-[rgba(0,255,65,0.12)]">
          <FileSearch size={18} className="text-[#00ff41]" />
        </div>
        <div className="min-w-0">
          <p className="font-['Share_Tech_Mono'] text-sm uppercase tracking-[0.22em] text-[#d8ffe0] truncate">
            Metadata Extractor
          </p>
          <p className="font-['Share_Tech_Mono'] text-[11px] text-[rgba(200,255,208,0.4)] truncate">
            File Metadata &amp; Content Analysis
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3 mt-1">
        <label
          className="relative flex-1 flex items-center gap-3 h-8.5 bg-black/60 border border-[rgba(0,255,65,0.15)] pl-4 pr-4 py-3 font-['Share_Tech_Mono'] text-sm text-[#c8ffd0] cursor-pointer outline-none focus-within:border-[rgba(0,255,65,0.45)] transition truncate"
        >
          <Upload size={16} className="text-[#00ff41] shrink-0" />
          <span className="truncate text-[rgba(200,255,208,0.7)]">
            {file ? file.name : "Select a file"}
          </span>
          <input
            ref={inputRef}
            type="file"
            onChange={handleFileChange}
            required
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </label>

        <button
          type="submit"
          disabled={!file}
          className="w-28 shrink-0 border border-[rgba(0,255,65,0.3)] bg-[rgba(0,255,65,0.06)] font-['Share_Tech_Mono'] text-xs uppercase tracking-[0.2em] text-[#00ff41] transition hover:bg-[rgba(0,255,65,0.12)] hover:border-[rgba(0,255,65,0.5)] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Analyze
        </button>
      </form>
    </section>
  );
}