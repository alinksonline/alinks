export function PlatformDiagram() {
  return (
    <div className="relative">
      <svg viewBox="0 0 420 380" className="w-full" aria-hidden>
        <defs>
          <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        <rect x="30" y="40" width="150" height="80" rx="8" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
        <text x="105" y="72" textAnchor="middle" fill="#fbbf24" fontSize="11" fontWeight="600">Public site</text>
        <text x="105" y="92" textAnchor="middle" fill="#94a3b8" fontSize="9">5 pages · mobile</text>
        <text x="105" y="108" textAnchor="middle" fill="#64748b" fontSize="8">/handle</text>

        <rect x="240" y="40" width="150" height="80" rx="8" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
        <text x="315" y="72" textAnchor="middle" fill="#fbbf24" fontSize="11" fontWeight="600">Dashboard</text>
        <text x="315" y="92" textAnchor="middle" fill="#94a3b8" fontSize="9">Editor · AI · publish</text>

        <rect x="120" y="170" width="180" height="70" rx="8" fill="url(#glow)" stroke="rgba(251,191,36,0.4)" strokeWidth="1.5" />
        <text x="210" y="200" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="600">Artix Platform DB</text>
        <text x="210" y="220" textAnchor="middle" fill="#94a3b8" fontSize="9">Config only</text>

        <rect x="30" y="290" width="165" height="65" rx="8" fill="rgba(255,255,255,0.05)" stroke="rgba(52,211,153,0.3)" strokeWidth="1.5" />
        <text x="112" y="318" textAnchor="middle" fill="#34d399" fontSize="10" fontWeight="600">Google Sheets</text>
        <text x="112" y="336" textAnchor="middle" fill="#94a3b8" fontSize="8">Orders · bookings</text>

        <rect x="225" y="290" width="165" height="65" rx="8" fill="rgba(255,255,255,0.05)" stroke="rgba(167,139,250,0.3)" strokeWidth="1.5" />
        <text x="307" y="318" textAnchor="middle" fill="#a78bfa" fontSize="10" fontWeight="600">Tenant Supabase</text>
        <text x="307" y="336" textAnchor="middle" fill="#94a3b8" fontSize="8">Enterprise</text>

        <line x1="105" y1="120" x2="170" y2="170" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4 3" />
        <line x1="315" y1="120" x2="250" y2="170" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4 3" />
        <line x1="170" y1="240" x2="112" y2="290" stroke="rgba(52,211,153,0.3)" strokeWidth="1" />
        <line x1="250" y1="240" x2="307" y2="290" stroke="rgba(167,139,250,0.3)" strokeWidth="1" />
      </svg>
    </div>
  );
}