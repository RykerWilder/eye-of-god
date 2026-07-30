import { ExternalLink, Link } from 'lucide-react'

const linkGroups = [
  {
    category: 'OSINT & Recon',
    links: [
      { name: 'Shodan',          url: 'https://shodan.io',             desc: 'Internet-wide device & service scanner.' },
      { name: 'Maltego',         url: 'https://maltego.com',           desc: 'Visual link analysis and OSINT graph mapping.' },
      { name: 'Osiris',          url: 'https://osirisai.live',         desc: 'Global Intelligence Platform'},
      { name: 'Yandex',          url: 'https://yandex.com',            desc: 'Search engine' },
      { name: 'DNSDumpster',     url: 'https://dnsdumpster.com',       desc: 'DNS recon & domain mapping.' },
      { name: 'Grabify',         url: 'https://grabify.link',          desc: 'IP & link tracking logger.' },
    ],
  },
  {
    category: 'Threat Intelligence',
    links: [
      { name: 'VirusTotal',      url: 'https://virustotal.com',        desc: 'Multi-AV file, URL & hash analysis.' },
      { name: 'AbuseIPDB',       url: 'https://abuseipdb.com',         desc: 'IP reputation & abuse reporting.' },
      { name: 'OTX AlienVault',  url: 'https://otx.alienvault.com',    desc: 'Open threat exchange & IoC feeds.' },
      { name: 'Wayback Machine', url: 'https://web.archive.org',       desc: 'Historical snapshots of web pages and domains.' },
      { name: 'Threat Fox',      url: 'https://threatfox.abuse.ch',    desc: 'IoC sharing platform by abuse.ch.' },
    ],
  },
  {
    category: 'CVE & Vulnerability',
    links: [
      { name: 'NVD NIST',        url: 'https://nvd.nist.gov',          desc: 'National vulnerability database.' },
      { name: 'CVE Mitre',       url: 'https://cve.mitre.org',         desc: 'Official CVE list and details.' },
      { name: 'Exploit-DB',      url: 'https://exploit-db.com',        desc: 'Public exploits & vulnerability archive.' },
      { name: 'Snyk Vuln DB',    url: 'https://security.snyk.io',      desc: 'Open source dependency vulns.' },
    ],
  },
  {
    category: 'Utilities & Tools',
    links: [
      { name: 'CyberChef',       url: 'https://gchq.github.io/CyberChef', desc: 'Encode, decode, transform data.' },
      { name: 'JWT.io',          url: 'https://jwt.io',                   desc: 'JWT token inspector and debugger.' },
      { name: 'SSL Labs',        url: 'https://ssllabs.com/ssltest',      desc: 'SSL/TLS certificate grader.' },
      { name: 'Regex101',        url: 'https://regex101.com',             desc: 'Regex builder and tester.' },
      { name: 'ExifTool',        url: 'https://exiftool.org',             desc: 'Read and strip metadata from files and images.' },
    ],
  },
  {
    category: 'Anonymity & Temp Comms',
    links: [
      { name: 'SMS24',           url: 'https://sms24.me',              desc: 'Temporary numbers for receiving SMS.' },
      { name: 'Yopmail',         url: 'https://yopmail.com',           desc: 'Temporary disposable emails.' },
    ],
  },
  {
    category: 'Cyber Security News',
    links: [
      { name: 'HackerNews',           url: 'https://thehackernews.com',              desc: 'Daily news on breaches, malware and emerging CVEs.' },
      { name: 'Bleeping Computer',    url: 'https://www.bleepingcomputer.com',       desc: 'News on ransomware, exploits and tech support guides.' },
      { name: 'Krebs On Security',    url: 'https://krebsonsecurity.com',            desc: 'In-depth investigative reporting on cybercrime and fraud.' },
      { name: 'SecurityWeek',         url: 'https://www.securityweek.com',           desc: 'News and analysis on vulnerabilities and threats.' },
    ],
  },
]

export default function UtilityLinks() {
  return (
    <div className="h-full flex flex-col gap-5 min-h-0 overflow-auto">

      {/* Page header */}
      <div className="flex items-center justify-center gap-4 border border-[rgba(0,255,65,0.12)] bg-[#0d0d0d] px-5 py-4">
        <Link size={20} className="text-[#00ff41] shrink-0" />
        <div>
          <p className="font-['Share_Tech_Mono'] text-[10px] uppercase tracking-[0.3em] text-[rgba(200,255,208,0.4)]">
            Module
          </p>
          <h2 className="font-['Share_Tech_Mono'] text-3xl uppercase tracking-[0.1em] text-[#d8ffe0]">
            Utility Links
          </h2>
        </div>
      </div>

      {/* Link groups */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {linkGroups.map(({ category, links }) => (
          <section
            key={category}
            className="border border-[rgba(0,255,65,0.12)] bg-[#0d0d0d]/95"
          >
            {/* Category header */}
            <div className="border-b border-[rgba(0,255,65,0.08)] px-5 py-3">
              <p className="font-['Share_Tech_Mono'] text-[10px] uppercase tracking-[0.28em] text-[rgba(200,255,208,0.4)]">
                {category}
              </p>
            </div>

            {/* Links list */}
            <ul className="divide-y divide-[rgba(0,255,65,0.05)]">
              {links.map(({ name, url, desc }) => (
                <li key={name}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start justify-between gap-4 px-5 py-4 transition hover:bg-[rgba(0,255,65,0.03)]"
                  >
                    <div className="min-w-0">
                      <p className="font-['Share_Tech_Mono'] text-sm text-[#d8ffe0] group-hover:text-[#00ff41] transition-colors">
                        {name}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[rgba(200,255,208,0.45)]">
                        {desc}
                      </p>
                    </div>
                    <ExternalLink
                      size={13}
                      className="shrink-0 mt-0.5 text-[rgba(200,255,208,0.2)] group-hover:text-[#00ff41] transition-colors"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

    </div>
  )
}