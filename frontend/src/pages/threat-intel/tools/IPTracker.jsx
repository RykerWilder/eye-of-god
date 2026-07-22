import { useState } from "react";
import { MapPin } from "lucide-react";

function buildLines(ip, data) {
  const geo = data.geo ?? {};
  const net = data.network ?? {};

  const flags = [
    data.isPrivate && "PRIVATE",
    data.isLoopback && "LOOPBACK",
    data.isLinkLocal && "LINK-LOCAL",
    data.isMulticast && "MULTICAST",
    data.isReserved && "RESERVED",
    geo.proxy && "PROXY/VPN",
    geo.hosting && "HOSTING/DATACENTER",
    geo.mobile && "MOBILE",
  ].filter(Boolean);

  const lines = [
    { text: "> IP TRACKER — Network & Geolocation", color: "text-[rgba(200,255,208,0.4)]" },
    { text: `> Target   : ${ip}  (IPv${data.version})`, color: "text-[rgba(200,255,208,0.7)]" },
    { text: "> " + "─".repeat(32), color: "text-[rgba(200,255,208,0.15)]" },
  ];

  if (geo.error) {
    lines.push({ text: `> GEO      : ${geo.error}`, color: "text-[rgba(200,255,208,0.35)]" });
  } else {
    lines.push(
      { text: `> Location : ${geo.city ?? "N/A"}, ${geo.regionName ?? "N/A"}, ${geo.country ?? "N/A"} (${geo.countryCode ?? "??"})`, color: "text-[rgba(200,255,208,0.55)]" },
      { text: `> Coords   : ${geo.lat ?? "N/A"}, ${geo.lon ?? "N/A"}`, color: "text-[rgba(200,255,208,0.5)]" },
      { text: `> Timezone : ${geo.timezone ?? "N/A"}`, color: "text-[rgba(200,255,208,0.5)]" },
      { text: `> ISP      : ${geo.isp ?? "N/A"}`, color: "text-[rgba(200,255,208,0.55)]" },
      { text: `> Org      : ${geo.org ?? "N/A"}`, color: "text-[rgba(200,255,208,0.5)]" },
      { text: `> AS       : ${geo.as ?? "N/A"}`, color: "text-[rgba(200,255,208,0.5)]" },
    );
    if (geo.reverse) {
      lines.push({ text: `> Reverse  : ${geo.reverse}`, color: "text-[rgba(200,255,208,0.45)]" });
    }
  }

  lines.push({ text: "> " + "─".repeat(32), color: "text-[rgba(200,255,208,0.15)]" });

  if (net.error) {
    lines.push({ text: `> NET      : ${net.error}`, color: "text-[rgba(200,255,208,0.35)]" });
  } else {
    lines.push(
      { text: `> CIDR     : ${net.networkCidr ?? "N/A"}`, color: "text-[#00ff41]" },
      { text: `> Range    : ${net.networkStartAddress ?? "N/A"} - ${net.networkEndAddress ?? "N/A"}`, color: "text-[rgba(200,255,208,0.5)]" },
      { text: `> Network  : ${net.networkName ?? "N/A"} (${net.networkType ?? "N/A"})`, color: "text-[rgba(200,255,208,0.55)]" },
      { text: `> ASN      : ${net.asn ?? "N/A"} — ${net.asnDescription ?? "N/A"}`, color: "text-[rgba(200,255,208,0.55)]" },
      { text: `> Registry : ${net.asnRegistry?.toUpperCase() ?? "N/A"}`, color: "text-[rgba(200,255,208,0.5)]" },
    );
    if (net.abuseEmails?.length) {
      lines.push({ text: `> Abuse    : ${net.abuseEmails.join(", ")}`, color: "text-[rgba(200,255,208,0.45)]" });
    }
  }

  if (flags.length) {
    lines.push({ text: "> " + "─".repeat(32), color: "text-[rgba(200,255,208,0.15)]" });
    flags.forEach((f) =>
      lines.push({ text: `> FLAG     : ${f}`, color: "text-[#ffaa00]" })
    );
  }

  return lines;
}

export const ipTrackerLoadingLines = [
  { text: "> resolving geolocation...", color: "text-[rgba(200,255,208,0.6)]" },
  { text: "> querying RDAP registries...", color: "text-[rgba(200,255,208,0.4)]" },
];

export function getIPTrackerLines(result) {
  if (result?.type !== "iptracker") return null;
  return buildLines(result.ip, result.data);
}

export default function IPTracker({ onResult, onError, onLoading }) {
  const [ip, setIp] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    onLoading(true);
    onError("");
    onResult(null);

    try {
      const res = await fetch("http://localhost:8000/api/iptracker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "API Error");
      onResult({ type: "iptracker", ip, data });
      setIp("");
    } catch (err) {
      onError(err.message);
    } finally {
      onLoading(false);
    }
  };

  return (
    <section className="border border-[rgba(0,255,65,0.12)] bg-[#0d0d0d] p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <MapPin size={20} className="text-[#00ff41]" />
        <p className="font-['Share_Tech_Mono'] text-l uppercase tracking-[0.25em] text-[rgba(200,255,208,0.45)]">
          IP Tracker
        </p>
        <p className="font-['Share_Tech_Mono'] text-xs text-[rgba(200,255,208,0.3)] -mt-1">
          - Geolocation, ISP &amp; CIDR Lookup
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3 mt-1">
        <div className="relative flex-1 flex items-center">
          <input
            type="text"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            placeholder="8.8.8.8 or 2001:4860:4860::8888"
            required
            className="w-full h-8.5 bg-black/60 border border-[rgba(0,255,65,0.15)] pl-4 pr-4 py-3 font-['Share_Tech_Mono'] text-sm text-[#c8ffd0] placeholder-[rgba(200,255,208,0.2)] outline-none focus:border-[rgba(0,255,65,0.45)] transition"
          />
        </div>

        <button
          type="submit"
          className="w-28 shrink-0 border border-[rgba(0,255,65,0.3)] bg-[rgba(0,255,65,0.06)] font-['Share_Tech_Mono'] text-xs uppercase tracking-[0.2em] text-[#00ff41] transition hover:bg-[rgba(0,255,65,0.12)] hover:border-[rgba(0,255,65,0.5)]"
        >
          Track
        </button>
      </form>
    </section>
  );
}