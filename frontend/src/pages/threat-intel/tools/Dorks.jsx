import { useState } from "react";
import { Search } from "lucide-react";

function buildLines(data) {
  const parts = data?.parts ?? {};
  const sectionCount = [
    parts.terms,
    parts.exact_phrases,
    parts.exclude_terms,
    parts.site,
    parts.filetype,
    parts.ext,
    parts.inurl,
    parts.intitle,
    parts.intext,
    parts.allinurl,
    parts.allintitle,
    parts.allintext,
  ].filter((v) => Array.isArray(v) && v.length > 0).length;

  return [
    { text: "> GOOGLE DORKS BUILDER", color: "text-[rgba(200,255,208,0.4)]" },
    { text: `> ${data?.query || "N/A"}`, color: "text-[#00ff41]" },
    { text: `> Copy ready  : ${data?.copy_ready ? "YES" : "NO"}`, color: "text-[rgba(200,255,208,0.55)]" },
    { text: "> " + "─".repeat(36), color: "text-[rgba(200,255,208,0.15)]" },
    ...(parts.site?.length
      ? [
          {
            text: `> site: ${parts.site.join(", ")}`,
            color: "text-[rgba(200,255,208,0.65)]",
          },
        ]
      : []),
    ...(parts.filetype?.length
      ? [
          {
            text: `> filetype: ${parts.filetype.join(", ")}`,
            color: "text-[rgba(200,255,208,0.65)]",
          },
        ]
      : []),
    ...(parts.inurl?.length
      ? [
          {
            text: `> inurl: ${parts.inurl.join(", ")}`,
            color: "text-[rgba(200,255,208,0.55)]",
          },
        ]
      : []),
    ...(parts.intitle?.length
      ? [
          {
            text: `> intitle: ${parts.intitle.join(", ")}`,
            color: "text-[rgba(200,255,208,0.55)]",
          },
        ]
      : []),
    ...(parts.exclude_terms?.length
      ? [
          {
            text: `> excludes: ${parts.exclude_terms.join(", ")}`,
            color: "text-[#ffaa00]",
          },
        ]
      : []),
  ];
}

export const dorksLoadingLines = [
  {
    text: "> parsing user-selected operators...",
    color: "text-[rgba(200,255,208,0.6)]",
  },
  {
    text: "> building copy-ready dork string...",
    color: "text-[rgba(200,255,208,0.4)]",
  },
];

export function getDorksLines(result) {
  if (result?.type !== "dorks") return null;
  return buildLines(result.data);
}

export default function Dorks({ onResult, onError, onLoading }) {
  const [terms, setTerms] = useState("");
  const [exactPhrases, setExactPhrases] = useState("");
  const [excludeTerms, setExcludeTerms] = useState("");
  const [site, setSite] = useState("");
  const [filetype, setFiletype] = useState("");
  const [ext, setExt] = useState("");
  const [inurl, setInurl] = useState("");
  const [intitle, setIntitle] = useState("");
  const [intext, setIntext] = useState("");
  const [allinurl, setAllinurl] = useState("");
  const [allintitle, setAllintitle] = useState("");
  const [allintext, setAllintext] = useState("");
  const [after, setAfter] = useState("");
  const [before, setBefore] = useState("");

  const splitCSV = (value) =>
    value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    onLoading(true);
    onError("");
    onResult(null);

    try {
      const payload = {
        terms: splitCSV(terms),
        exact_phrases: splitCSV(exactPhrases),
        exclude_terms: splitCSV(excludeTerms),
        site: splitCSV(site),
        filetype: splitCSV(filetype),
        ext: splitCSV(ext),
        inurl: splitCSV(inurl),
        intitle: splitCSV(intitle),
        intext: splitCSV(intext),
        allinurl: splitCSV(allinurl),
        allintitle: splitCSV(allintitle),
        allintext: splitCSV(allintext),
        after: after.trim() || null,
        before: before.trim() || null,
      };

      const res = await fetch("http://localhost:8000/api/dorks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "API Error");

      onResult({ type: "dorks", data });

      setTerms("");
      setExactPhrases("");
      setExcludeTerms("");
      setSite("");
      setFiletype("");
      setExt("");
      setInurl("");
      setIntitle("");
      setIntext("");
      setAllinurl("");
      setAllintitle("");
      setAllintext("");
      setAfter("");
      setBefore("");
    } catch (err) {
      onError(err.message);
    } finally {
      onLoading(false);
    }
  };

  return (
    <section className="border border-[rgba(0,255,65,0.12)] bg-[#0d0d0d] p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Search size={20} className="text-[#00ff41]" />
        <p className="font-['Share_Tech_Mono'] text-l uppercase tracking-[0.25em] text-[rgba(200,255,208,0.45)]">
          Google Dorks
        </p>
        <p className="font-['Share_Tech_Mono'] text-xs text-[rgba(200,255,208,0.3)] -mt-1">
          - Custom Google Dorks Builder
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            placeholder="Terms (comma-separated)"
            className="bg-black/60 border border-[rgba(0,255,65,0.15)] px-4 py-3 font-['Share_Tech_Mono'] text-sm text-[#c8ffd0] placeholder-[rgba(200,255,208,0.2)] outline-none focus:border-[rgba(0,255,65,0.45)] transition"
          />
          <input
            type="text"
            value={exactPhrases}
            onChange={(e) => setExactPhrases(e.target.value)}
            placeholder="Exact phrases (comma-separated)"
            className="bg-black/60 border border-[rgba(0,255,65,0.15)] px-4 py-3 font-['Share_Tech_Mono'] text-sm text-[#c8ffd0] placeholder-[rgba(200,255,208,0.2)] outline-none focus:border-[rgba(0,255,65,0.45)] transition"
          />
          <input
            type="text"
            value={excludeTerms}
            onChange={(e) => setExcludeTerms(e.target.value)}
            placeholder="Exclude terms (comma-separated)"
            className="bg-black/60 border border-[rgba(0,255,65,0.15)] px-4 py-3 font-['Share_Tech_Mono'] text-sm text-[#c8ffd0] placeholder-[rgba(200,255,208,0.2)] outline-none focus:border-[rgba(0,255,65,0.45)] transition"
          />
          <input
            type="text"
            value={site}
            onChange={(e) => setSite(e.target.value)}
            placeholder="site domains: example.com, github.com"
            className="bg-black/60 border border-[rgba(0,255,65,0.15)] px-4 py-3 font-['Share_Tech_Mono'] text-sm text-[#c8ffd0] placeholder-[rgba(200,255,208,0.2)] outline-none focus:border-[rgba(0,255,65,0.45)] transition"
          />
          <input
            type="text"
            value={filetype}
            onChange={(e) => setFiletype(e.target.value)}
            placeholder="filetype: pdf, xls, docx"
            className="bg-black/60 border border-[rgba(0,255,65,0.15)] px-4 py-3 font-['Share_Tech_Mono'] text-sm text-[#c8ffd0] placeholder-[rgba(200,255,208,0.2)] outline-none focus:border-[rgba(0,255,65,0.45)] transition"
          />
          <input
            type="text"
            value={ext}
            onChange={(e) => setExt(e.target.value)}
            placeholder="ext: log, sql, bak"
            className="bg-black/60 border border-[rgba(0,255,65,0.15)] px-4 py-3 font-['Share_Tech_Mono'] text-sm text-[#c8ffd0] placeholder-[rgba(200,255,208,0.2)] outline-none focus:border-[rgba(0,255,65,0.45)] transition"
          />
          <input
            type="text"
            value={inurl}
            onChange={(e) => setInurl(e.target.value)}
            placeholder="inurl: admin, backup"
            className="bg-black/60 border border-[rgba(0,255,65,0.15)] px-4 py-3 font-['Share_Tech_Mono'] text-sm text-[#c8ffd0] placeholder-[rgba(200,255,208,0.2)] outline-none focus:border-[rgba(0,255,65,0.45)] transition"
          />
          <input
            type="text"
            value={intitle}
            onChange={(e) => setIntitle(e.target.value)}
            placeholder="intitle: login, index of"
            className="bg-black/60 border border-[rgba(0,255,65,0.15)] px-4 py-3 font-['Share_Tech_Mono'] text-sm text-[#c8ffd0] placeholder-[rgba(200,255,208,0.2)] outline-none focus:border-[rgba(0,255,65,0.45)] transition"
          />
          <input
            type="text"
            value={intext}
            onChange={(e) => setIntext(e.target.value)}
            placeholder="intext: password, confidential"
            className="bg-black/60 border border-[rgba(0,255,65,0.15)] px-4 py-3 font-['Share_Tech_Mono'] text-sm text-[#c8ffd0] placeholder-[rgba(200,255,208,0.2)] outline-none focus:border-[rgba(0,255,65,0.45)] transition"
          />
          <input
            type="text"
            value={allinurl}
            onChange={(e) => setAllinurl(e.target.value)}
            placeholder="allinurl values (comma-separated)"
            className="bg-black/60 border border-[rgba(0,255,65,0.15)] px-4 py-3 font-['Share_Tech_Mono'] text-sm text-[#c8ffd0] placeholder-[rgba(200,255,208,0.2)] outline-none focus:border-[rgba(0,255,65,0.45)] transition"
          />
          <input
            type="text"
            value={allintitle}
            onChange={(e) => setAllintitle(e.target.value)}
            placeholder="allintitle values (comma-separated)"
            className="bg-black/60 border border-[rgba(0,255,65,0.15)] px-4 py-3 font-['Share_Tech_Mono'] text-sm text-[#c8ffd0] placeholder-[rgba(200,255,208,0.2)] outline-none focus:border-[rgba(0,255,65,0.45)] transition"
          />
          <input
            type="text"
            value={allintext}
            onChange={(e) => setAllintext(e.target.value)}
            placeholder="allintext values (comma-separated)"
            className="bg-black/60 border border-[rgba(0,255,65,0.15)] px-4 py-3 font-['Share_Tech_Mono'] text-sm text-[#c8ffd0] placeholder-[rgba(200,255,208,0.2)] outline-none focus:border-[rgba(0,255,65,0.45)] transition"
          />
          <input
            type="text"
            value={after}
            onChange={(e) => setAfter(e.target.value)}
            placeholder="after: YYYY-MM-DD"
            className="bg-black/60 border border-[rgba(0,255,65,0.15)] px-4 py-3 font-['Share_Tech_Mono'] text-sm text-[#c8ffd0] placeholder-[rgba(200,255,208,0.2)] outline-none focus:border-[rgba(0,255,65,0.45)] transition"
          />
          <input
            type="text"
            value={before}
            onChange={(e) => setBefore(e.target.value)}
            placeholder="before: YYYY-MM-DD"
            className="bg-black/60 border border-[rgba(0,255,65,0.15)] px-4 py-3 font-['Share_Tech_Mono'] text-sm text-[#c8ffd0] placeholder-[rgba(200,255,208,0.2)] outline-none focus:border-[rgba(0,255,65,0.45)] transition"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="w-32 shrink-0 border border-[rgba(0,255,65,0.3)] bg-[rgba(0,255,65,0.06)] font-['Share_Tech_Mono'] text-xs uppercase tracking-[0.2em] text-[#00ff41] transition hover:bg-[rgba(0,255,65,0.12)] hover:border-[rgba(0,255,65,0.5)]"
          >
            Build
          </button>
        </div>
      </form>
    </section>
  );
}