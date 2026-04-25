"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowUpDown,
  Bell,
  Blocks,
  ChevronRight,
  Clock3,
  Database,
  Eye,
  ExternalLink,
  Filter,
  Flame,
  Gauge,
  Link2,
  Loader2,
  Network,
  Radar,
  ScanLine,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type TabId =
  | "Dashboard"
  | "Wallet Search"
  | "Cluster Map"
  | "Signals"
  | "Linked Activity"
  | "Watchlists"
  | "Settings";

type SortField = "score" | "activityMatch" | "confidence" | "lastActiveMinutes";
type SortDirection = "asc" | "desc";
type ConfidenceGate = "all" | "80+" | "90+";

type WalletRecord = {
  id: string;
  wallet: string;
  fullWallet: string;
  score: number;
  cluster: string;
  sharedSource: string;
  activityMatch: number;
  confidence: number;
  lastActive: string;
  lastActiveMinutes: number;
  tags: string[];
  connectionSummary: string;
  evidence: string[];
  behaviorNotes: string[];
  timeline: {
    time: string;
    event: string;
  }[];
};

type ClusterNode = {
  id: string;
  x: number;
  y: number;
  tone: "lead" | "core" | "peripheral";
  label: string;
};

type ClusterEdge = {
  from: string;
  to: string;
  label: string;
};

const tabs: { id: TabId; icon: LucideIcon; badge?: string }[] = [
  { id: "Dashboard", icon: Gauge },
  { id: "Wallet Search", icon: Search },
  { id: "Cluster Map", icon: Network },
  { id: "Signals", icon: Radar, badge: "8" },
  { id: "Linked Activity", icon: Link2 },
  { id: "Watchlists", icon: Eye },
  { id: "Settings", icon: Settings2 },
];

const tickerItems = [
  "LIVE CLUSTERS DETECTED",
  "WALLET CORRELATIONS",
  "SHARED FUNDING SOURCES",
  "SYNCHRONIZED BUYS",
  "EARLY-RUNNER SIGNALS",
  "REPEATED CO-ACTIVITY",
  "BRIDGE OVERLAP",
];

const walletRows: WalletRecord[] = [
  {
    id: "w-901",
    wallet: "0x9F...72a",
    fullWallet: "0x9F41D7a8A4f31B9E3e18fC53A8d113b66AEF072a",
    score: 94,
    cluster: "Cluster-07",
    sharedSource: "Bybit hot wallet",
    activityMatch: 91,
    confidence: 93,
    lastActive: "2m ago",
    lastActiveMinutes: 2,
    tags: ["Possible team-linked", "Funding overlap", "Early buyer"],
    connectionSummary:
      "Repeated synchronized entries with 5 wallets in Cluster-07 within 90 seconds of first liquidity push.",
    evidence: [
      "3 shared funding events within last 48h",
      "Entry timing variance under 74 seconds",
      "Matches bridge route used by cluster anchor wallet",
    ],
    behaviorNotes: [
      "Exits in staggered clips after momentum candles",
      "No interaction with public social wallets",
      "Prefers low-liquidity launches under 4m market cap",
    ],
    timeline: [
      { time: "21:02", event: "Bridge in from Base (12.4 SOL equivalent)" },
      { time: "21:05", event: "First buy on PUMP/USDC pair" },
      { time: "21:07", event: "Mirrored buy with 4 linked wallets" },
      { time: "21:16", event: "Partial trim during first breakout" },
    ],
  },
  {
    id: "w-512",
    wallet: "0xA2...B11",
    fullWallet: "0xA2e1773C0f19Ab14cF72d4C0286bdA2dd4Ac8B11",
    score: 89,
    cluster: "Cluster-07",
    sharedSource: "KuCoin relay",
    activityMatch: 88,
    confidence: 90,
    lastActive: "4m ago",
    lastActiveMinutes: 4,
    tags: ["Synchronized entry", "Repeated co-activity"],
    connectionSummary:
      "Shows highly similar buy sizes and entry windows with Cluster-07 leader wallets across 12 launches.",
    evidence: [
      "11 co-trades in last 7 days",
      "Average slippage profile overlap: 86%",
      "Frequent reuse of same Jito tip range",
    ],
    behaviorNotes: [
      "Rarely opens position alone",
      "Uses same liquidity pools as linked wallets",
      "Quick de-risk after +35% moves",
    ],
    timeline: [
      { time: "20:44", event: "Wallet topped from shared source" },
      { time: "20:47", event: "Entered token within 52s of w-901" },
      { time: "20:50", event: "Follow-up buy with identical size bucket" },
    ],
  },
  {
    id: "w-228",
    wallet: "0x3D...4f9",
    fullWallet: "0x3Dc53f6B4B20Df137B6308Ac5Fa98Bc6147b94f9",
    score: 86,
    cluster: "Cluster-14",
    sharedSource: "MEXC transfer rail",
    activityMatch: 84,
    confidence: 87,
    lastActive: "6m ago",
    lastActiveMinutes: 6,
    tags: ["Funding overlap", "Early buyer"],
    connectionSummary:
      "Links to Cluster-14 through repeated funding overlap and correlated bridge timing patterns.",
    evidence: [
      "Shared funder observed on 4 wallets",
      "Bridge window overlap of 12 minutes",
      "Token rotation sequence repeats every 2-3 days",
    ],
    behaviorNotes: [
      "Front-loads into launches with thin books",
      "Uses low-profile routing paths",
      "Reduced activity during weekend sessions",
    ],
    timeline: [
      { time: "19:58", event: "Funding top-up via MEXC rail" },
      { time: "20:03", event: "Multi-buy burst on new listing" },
      { time: "20:14", event: "Cross-wallet transfer to 0x6B...3A2" },
    ],
  },
  {
    id: "w-773",
    wallet: "0x77...d20",
    fullWallet: "0x77b89EAc2eB2e12dB7958FcA3B17eDa9A89Abd20",
    score: 82,
    cluster: "Cluster-14",
    sharedSource: "Bridge overlap",
    activityMatch: 79,
    confidence: 84,
    lastActive: "11m ago",
    lastActiveMinutes: 11,
    tags: ["Repeated co-activity", "Bridge overlap"],
    connectionSummary:
      "Tracks Cluster-14 entries with consistent bridge overlap and mirrored post-entry position management.",
    evidence: [
      "6 same-window entries",
      "Correlated de-risk timing",
      "Shared bridge destination wallets",
    ],
    behaviorNotes: [
      "Maintains medium-sized entries",
      "Moves funds after 2x volume spikes",
      "Prefers pairs with low holder counts",
    ],
    timeline: [
      { time: "19:33", event: "Bridge overlap detected with 3 linked wallets" },
      { time: "19:41", event: "Coordinated entry window flagged" },
      { time: "19:59", event: "Distributed exits across 2 wallets" },
    ],
  },
  {
    id: "w-461",
    wallet: "0xF0...91d",
    fullWallet: "0xF0d36C6bd6E1bA1488ecCA937B86d297cfFb691d",
    score: 91,
    cluster: "Cluster-03",
    sharedSource: "Binance hot wallet",
    activityMatch: 90,
    confidence: 92,
    lastActive: "1m ago",
    lastActiveMinutes: 1,
    tags: ["Synchronized entry", "Possible team-linked"],
    connectionSummary:
      "Likely cluster orchestrator with top confidence across synchronized entries and mirrored liquidity behavior.",
    evidence: [
      "Highest co-trade frequency in Cluster-03",
      "Shared source seen in 5 related wallets",
      "Coordinated entry in first 2 candle closes",
    ],
    behaviorNotes: [
      "Initiates earliest entries in sequence",
      "Maintains position while linked wallets trim",
      "Rotates into follow-up token pairs",
    ],
    timeline: [
      { time: "21:11", event: "Primary funding event from Binance source" },
      { time: "21:12", event: "Lead entry, followed by 3 linked wallets" },
      { time: "21:19", event: "Minor trim on local top" },
    ],
  },
  {
    id: "w-600",
    wallet: "0xC8...3A2",
    fullWallet: "0xC8f1375E1A3248b6Ab6f8eD4Bf9D5215a2A0F3A2",
    score: 78,
    cluster: "Cluster-09",
    sharedSource: "Funding relay",
    activityMatch: 76,
    confidence: 81,
    lastActive: "17m ago",
    lastActiveMinutes: 17,
    tags: ["Funding overlap", "Early buyer"],
    connectionSummary:
      "Mid-confidence link through recurring funding relay overlap and entry pattern similarities.",
    evidence: [
      "4 repeated top-up events",
      "Shared launch participation",
      "Comparable position sizing bands",
    ],
    behaviorNotes: [
      "Aggressive in first 3 minutes",
      "Switches quickly between narratives",
      "Stable across market chop sessions",
    ],
    timeline: [
      { time: "18:42", event: "Funding relay top-up" },
      { time: "18:49", event: "Early entry on new meme pair" },
      { time: "19:02", event: "Position reduced by 30%" },
    ],
  },
  {
    id: "w-318",
    wallet: "0x11...8Df",
    fullWallet: "0x11Ab8890B298b42f4a76F2A5A4bc4D91E7A0A8Df",
    score: 88,
    cluster: "Cluster-03",
    sharedSource: "Binance hot wallet",
    activityMatch: 86,
    confidence: 89,
    lastActive: "8m ago",
    lastActiveMinutes: 8,
    tags: ["Repeated co-activity", "Synchronized entry"],
    connectionSummary:
      "Consistently mirrors w-461 entries and exits with minor latency and matching liquidity preference.",
    evidence: [
      "9 repeated co-trade events",
      "Shared counterparty overlap",
      "Signal co-occurrence score 0.89",
    ],
    behaviorNotes: [
      "Trades shortly after cluster lead",
      "Keeps tighter stop patterns",
      "Sells into crowd momentum spikes",
    ],
    timeline: [
      { time: "20:31", event: "Funded from shared source" },
      { time: "20:34", event: "Entered with Cluster-03 wave" },
      { time: "20:52", event: "Correlation alert triggered" },
    ],
  },
  {
    id: "w-040",
    wallet: "0x4A...901",
    fullWallet: "0x4A94Ff34f90B0E5ecFc2D43D552f2b77d3B08901",
    score: 74,
    cluster: "Cluster-12",
    sharedSource: "Bridge overlap",
    activityMatch: 72,
    confidence: 77,
    lastActive: "23m ago",
    lastActiveMinutes: 23,
    tags: ["Bridge overlap", "Early buyer"],
    connectionSummary:
      "Emerging wallet in Cluster-12 with recurring bridge overlap but fewer high-confidence co-trades.",
    evidence: [
      "3 overlapping bridge events",
      "Entry cadence similarity to cluster core",
      "Shared route with 2 linked wallets",
    ],
    behaviorNotes: [
      "Appears during high-volatility windows",
      "Keeps small but frequent entries",
      "Potential feeder wallet",
    ],
    timeline: [
      { time: "18:10", event: "Bridge overlap recorded" },
      { time: "18:16", event: "Early entry on fresh listing" },
      { time: "18:27", event: "Exited into volume spike" },
    ],
  },
];

const mapNodes: ClusterNode[] = [
  { id: "n1", x: 14, y: 24, tone: "lead", label: "0x9F...72a" },
  { id: "n2", x: 33, y: 16, tone: "core", label: "0xA2...B11" },
  { id: "n3", x: 26, y: 46, tone: "core", label: "0x11...8Df" },
  { id: "n4", x: 47, y: 30, tone: "lead", label: "0xF0...91d" },
  { id: "n5", x: 64, y: 14, tone: "peripheral", label: "0x3D...4f9" },
  { id: "n6", x: 70, y: 46, tone: "core", label: "0x77...d20" },
  { id: "n7", x: 86, y: 30, tone: "lead", label: "0xC8...3A2" },
  { id: "n8", x: 57, y: 72, tone: "peripheral", label: "0x4A...901" },
  { id: "n9", x: 36, y: 76, tone: "core", label: "0x91...6Dd" },
];

const mapEdges: ClusterEdge[] = [
  { from: "n1", to: "n2", label: "shared funder" },
  { from: "n1", to: "n3", label: "same entry window" },
  { from: "n2", to: "n4", label: "repeat co-trades" },
  { from: "n4", to: "n5", label: "bridge overlap" },
  { from: "n5", to: "n7", label: "cluster association" },
  { from: "n3", to: "n6", label: "repeat co-trades" },
  { from: "n6", to: "n8", label: "same entry window" },
  { from: "n8", to: "n9", label: "shared funder" },
  { from: "n9", to: "n4", label: "cluster association" },
  { from: "n3", to: "n9", label: "bridge overlap" },
  { from: "n6", to: "n7", label: "same entry window" },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-8 max-w-3xl">
      <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[rgba(13,23,39,0.72)] px-3 py-1 text-xs uppercase tracking-[0.15em] text-[var(--accent-teal)]">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-teal)] pulse-dot" />
        {eyebrow}
      </p>
      <h2 className="[font-family:var(--font-sora)] text-3xl leading-tight text-[var(--text-primary)] sm:text-4xl">
        {title}
      </h2>
      <p className="mt-3 max-w-2xl text-base text-[var(--text-secondary)]">{description}</p>
    </div>
  );
}

function HeroTerminalPreview() {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="show"
      className="terminal-shell scan-overlay relative overflow-hidden rounded-3xl p-4 sm:p-5"
    >
      <div className="mb-4 flex items-center justify-between rounded-xl border border-[var(--line-soft)] bg-[rgba(8,15,27,0.86)] px-4 py-2.5">
        <p className="font-mono text-xs text-[var(--text-muted)]">
          terminal://pumpsearch/live
          <span className="ml-1 inline-block h-3 w-[1.5px] bg-[var(--accent-green)] align-middle blink-cursor" />
        </p>
        <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
          <span className="h-2 w-2 rounded-full bg-[var(--accent-green)] pulse-dot" />
          node sync 12ms
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="terminal-panel data-glint relative overflow-hidden rounded-2xl p-4">
          <p className="mb-3 text-xs uppercase tracking-[0.13em] text-[var(--text-muted)]">Live wallet feed</p>
          <div className="space-y-2.5 font-mono text-xs">
            {walletRows.slice(0, 5).map((row) => (
              <div
                key={row.id}
                className="flex items-center justify-between rounded-lg border border-[var(--line-soft)] bg-[rgba(5,10,18,0.72)] px-3 py-2"
              >
                <p className="text-[var(--text-secondary)]">{row.wallet}</p>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-[rgba(116,246,176,0.14)] px-2 py-1 text-[10px] text-[var(--accent-green)]">
                    {row.cluster}
                  </span>
                  <span className="text-[var(--accent-blue)]">{row.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="terminal-panel rounded-2xl p-4">
            <p className="mb-3 text-xs uppercase tracking-[0.13em] text-[var(--text-muted)]">Signal intensity</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Cluster-07", "High"],
                ["Cluster-03", "Rising"],
                ["Cluster-14", "Medium"],
                ["Cluster-12", "Watch"],
              ].map(([cluster, tone]) => (
                <div key={cluster} className="rounded-xl border border-[var(--line-soft)] bg-[rgba(6,11,20,0.68)] p-3">
                  <p className="font-mono text-[11px] text-[var(--text-muted)]">{cluster}</p>
                  <p className="mt-1 text-sm text-[var(--text-primary)]">{tone}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="terminal-panel rounded-2xl p-4">
            <p className="mb-3 text-xs uppercase tracking-[0.13em] text-[var(--text-muted)]">Cluster map snapshot</p>
            <ClusterMap compact />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ClusterMap({ compact = false }: { compact?: boolean }) {
  const nodeSize = compact ? 18 : 26;
  const strokeWidth = compact ? 1 : 1.25;

  return (
    <div
      className={`scan-overlay relative overflow-hidden rounded-2xl border border-[var(--line-soft)] bg-[rgba(7,13,24,0.72)] ${
        compact ? "h-[220px]" : "h-[460px]"
      }`}
    >
      <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
        {mapEdges.map((edge, index) => {
          const source = mapNodes.find((node) => node.id === edge.from);
          const target = mapNodes.find((node) => node.id === edge.to);

          if (!source || !target) {
            return null;
          }

          const labelX = (source.x + target.x) / 2;
          const labelY = (source.y + target.y) / 2;

          return (
            <g key={`${edge.from}-${edge.to}-${index}`}>
              <line
                className="map-line"
                x1={`${source.x}%`}
                y1={`${source.y}%`}
                x2={`${target.x}%`}
                y2={`${target.y}%`}
                stroke="rgba(102, 230, 222, 0.45)"
                strokeWidth={strokeWidth}
              />
              {!compact && (
                <text
                  x={`${labelX}%`}
                  y={`${labelY - 1.6}%`}
                  textAnchor="middle"
                  className="font-mono text-[10px]"
                  fill="rgba(171, 192, 222, 0.72)"
                >
                  {edge.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {mapNodes.map((node, index) => (
        <motion.div
          key={node.id}
          initial={{ opacity: 0, scale: 0.7 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.03, duration: 0.35 }}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${node.x}%`, top: `${node.y}%` }}
        >
          <div
            className={`rounded-full border ${
              node.tone === "lead"
                ? "border-[rgba(116,246,176,0.9)] bg-[rgba(116,246,176,0.25)]"
                : node.tone === "core"
                  ? "border-[rgba(122,169,255,0.8)] bg-[rgba(122,169,255,0.2)]"
                  : "border-[rgba(87,214,207,0.7)] bg-[rgba(87,214,207,0.18)]"
            } pulse-dot`}
            style={{ width: nodeSize, height: nodeSize }}
          />
          {!compact && (
            <p className="mt-2 -translate-x-1/2 text-nowrap font-mono text-[11px] text-[var(--text-secondary)]">
              {node.label}
            </p>
          )}
        </motion.div>
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={`skeleton-${index}`}
          className="h-12 animate-pulse rounded-lg border border-[var(--line-soft)] bg-[rgba(7,14,24,0.78)]"
        />
      ))}
    </div>
  );
}

function PanelSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-16 animate-pulse rounded-xl border border-[var(--line-soft)] bg-[rgba(8,14,24,0.82)]" />
      <div className="h-32 animate-pulse rounded-xl border border-[var(--line-soft)] bg-[rgba(8,14,24,0.82)]" />
      <div className="h-24 animate-pulse rounded-xl border border-[var(--line-soft)] bg-[rgba(8,14,24,0.82)]" />
    </div>
  );
}

export default function PumpSearchSite() {
  const [activeTab, setActiveTab] = useState<TabId>("Dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [confidenceGate, setConfidenceGate] = useState<ConfidenceGate>("all");
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [sortField, setSortField] = useState<SortField>("confidence");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedWalletId, setSelectedWalletId] = useState(walletRows[0].id);
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const tabLoadTimeoutRef = useRef<number | null>(null);
  const tableLoadTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (tabLoadTimeoutRef.current) {
        window.clearTimeout(tabLoadTimeoutRef.current);
      }

      if (tableLoadTimeoutRef.current) {
        window.clearTimeout(tableLoadTimeoutRef.current);
      }
    };
  }, []);

  const triggerTabLoading = (nextTab: TabId) => {
    if (nextTab === activeTab) {
      return;
    }

    setActiveTab(nextTab);
    setIsTabLoading(true);

    if (tabLoadTimeoutRef.current) {
      window.clearTimeout(tabLoadTimeoutRef.current);
    }

    tabLoadTimeoutRef.current = window.setTimeout(() => {
      setIsTabLoading(false);
    }, 420);
  };

  const triggerTableLoading = () => {
    setIsTableLoading(true);

    if (tableLoadTimeoutRef.current) {
      window.clearTimeout(tableLoadTimeoutRef.current);
    }

    tableLoadTimeoutRef.current = window.setTimeout(() => {
      setIsTableLoading(false);
    }, 280);
  };

  const filteredWallets = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return walletRows
      .filter((row) => {
        if (!query) {
          return true;
        }

        return (
          row.wallet.toLowerCase().includes(query) ||
          row.fullWallet.toLowerCase().includes(query) ||
          row.cluster.toLowerCase().includes(query) ||
          row.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          row.sharedSource.toLowerCase().includes(query)
        );
      })
      .filter((row) => {
        if (confidenceGate === "all") {
          return true;
        }

        const min = Number(confidenceGate.replace("+", ""));
        return row.confidence >= min;
      })
      .filter((row) => {
        if (!flaggedOnly) {
          return true;
        }

        return row.tags.some(
          (tag) =>
            tag.toLowerCase().includes("team") ||
            tag.toLowerCase().includes("funding") ||
            tag.toLowerCase().includes("synchronized"),
        );
      })
      .sort((left, right) => {
        const direction = sortDirection === "asc" ? 1 : -1;

        if (sortField === "score") {
          return (left.score - right.score) * direction;
        }

        if (sortField === "activityMatch") {
          return (left.activityMatch - right.activityMatch) * direction;
        }

        if (sortField === "confidence") {
          return (left.confidence - right.confidence) * direction;
        }

        return (left.lastActiveMinutes - right.lastActiveMinutes) * direction;
      });
  }, [confidenceGate, flaggedOnly, searchQuery, sortDirection, sortField]);

  const selectedWallet =
    filteredWallets.find((wallet) => wallet.id === selectedWalletId) ?? filteredWallets[0];

  const metricCards = useMemo(() => {
    const clusters = new Set(filteredWallets.map((wallet) => wallet.cluster));
    const highConfidence = filteredWallets.filter((wallet) => wallet.confidence >= 90);
    const synchronized = filteredWallets.filter((wallet) =>
      wallet.tags.some((tag) => tag.toLowerCase().includes("synchronized")),
    );
    const fundingOverlap = filteredWallets.filter((wallet) =>
      wallet.tags.some((tag) => tag.toLowerCase().includes("funding")),
    );

    return [
      {
        label: "Active clusters",
        value: String(clusters.size).padStart(2, "0"),
        delta: "+2 vs last hour",
        icon: Blocks,
      },
      {
        label: "Coordinated wallets",
        value: String(filteredWallets.length).padStart(2, "0"),
        delta: "Realtime",
        icon: Users,
      },
      {
        label: "High-confidence links",
        value: String(highConfidence.length).padStart(2, "0"),
        delta: "+11% trend",
        icon: ShieldCheck,
      },
      {
        label: "Early runner signals",
        value: String(synchronized.length).padStart(2, "0"),
        delta: "Lead windows <90s",
        icon: Flame,
      },
      {
        label: "Shared funding sources",
        value: String(fundingOverlap.length).padStart(2, "0"),
        delta: "4 exchanges linked",
        icon: Database,
      },
    ];
  }, [filteredWallets]);

  const signalFeed = [
    "Cluster-07 opened synchronized entries across 3 wallets",
    "Shared funding source detected between Cluster-03 and Cluster-14",
    "Early buyer wallet 0x9F...72a re-entered within 2 minutes",
    "Bridge overlap pattern repeated on two new launches",
    "Confidence score for Cluster-03 moved to 92%",
  ];

  const watchlists = [
    {
      name: "Team-linked candidates",
      wallets: 12,
      alert: "3 fresh updates",
    },
    {
      name: "Early runner wallets",
      wallets: 19,
      alert: "2 synchronized entries",
    },
    {
      name: "Funding overlap pool",
      wallets: 27,
      alert: "1 new source detected",
    },
  ];

  const sortableHeader = (
    key: SortField,
    label: string,
    className?: string,
  ) => {
    const isActive = sortField === key;

    return (
      <button
        type="button"
        onClick={() => {
        if (isActive) {
          triggerTableLoading();
          setSortDirection((current) => (current === "desc" ? "asc" : "desc"));
          return;
        }

        triggerTableLoading();
        setSortField(key);
        setSortDirection("desc");
      }}
        className={`inline-flex items-center gap-1 text-left transition-colors hover:text-[var(--text-primary)] ${
          className ?? ""
        } ${isActive ? "text-[var(--accent-teal)]" : "text-[var(--text-muted)]"}`}
      >
        {label}
        <ArrowUpDown className="h-3.5 w-3.5" />
      </button>
    );
  };

  return (
    <main className="main-grid relative flex-1 overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(116,246,176,0.1),transparent_40%)]" />

      <header className="sticky top-0 z-40 border-b border-[var(--line-soft)] bg-[rgba(5,10,18,0.78)] backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-5 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-md border border-[var(--line)] bg-[rgba(13,24,41,0.94)]">
              <Radar className="h-4 w-4 text-[var(--accent-green)]" />
            </div>
            <div>
              <p className="[font-family:var(--font-sora)] text-sm text-[var(--text-primary)]">PumpSearch</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.13em] text-[var(--text-muted)]">
                On-chain intelligence terminal
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-5 text-sm text-[var(--text-secondary)] lg:flex">
            {[
              ["Terminal", "#terminal"],
              ["Cluster Map", "#cluster-map"],
              ["Features", "#features"],
              ["Pricing", "#pricing"],
            ].map(([name, href]) => (
              <a key={name} href={href} className="transition-colors hover:text-[var(--text-primary)]">
                {name}
              </a>
            ))}
          </nav>

          <a
            href="#terminal"
            className="inline-flex items-center gap-2 rounded-md border border-[rgba(116,246,176,0.45)] bg-[rgba(116,246,176,0.09)] px-3 py-2 text-xs font-medium text-[var(--accent-green)] transition hover:bg-[rgba(116,246,176,0.16)]"
          >
            Open Terminal
            <ChevronRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </header>

      <section className="relative mx-auto w-full max-w-[1280px] px-5 pb-14 pt-10 sm:px-6 lg:px-8 lg:pb-18 lg:pt-16">
        <div className="grid items-end gap-12 xl:grid-cols-[minmax(0,1fr)_640px]">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="show"
            className="max-w-xl"
          >
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[rgba(10,19,33,0.82)] px-3 py-1 text-xs uppercase tracking-[0.15em] text-[var(--accent-teal)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-teal)] pulse-dot" />
              Public on-chain intelligence for serious trench traders
            </p>

            <h1 className="[font-family:var(--font-sora)] text-5xl leading-[0.95] tracking-tight text-[var(--text-primary)] sm:text-6xl">
              PumpSearch
            </h1>

            <p className="mt-4 text-2xl leading-tight text-[var(--accent-green)] sm:text-3xl">
              Find coordinated wallets before the crowd.
            </p>

            <p className="mt-6 text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
              PumpSearch is an on-chain intelligence terminal that maps wallet relationships,
              detects coordinated behavior, and helps traders surface wallet clusters that may drive
              volume on pump.fun.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#terminal"
                className="inline-flex items-center gap-2 rounded-md border border-[rgba(116,246,176,0.55)] bg-[rgba(116,246,176,0.12)] px-5 py-3 text-sm font-medium text-[var(--accent-green)] transition hover:translate-y-[-1px] hover:bg-[rgba(116,246,176,0.18)]"
              >
                Open Terminal
                <ChevronRight className="h-4 w-4" />
              </a>
              <a
                href="#cluster-map"
                className="inline-flex items-center gap-2 rounded-md border border-[var(--line)] bg-[rgba(10,18,32,0.8)] px-5 py-3 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)]"
              >
                View Demo
                <ScanLine className="h-4 w-4" />
              </a>
              <a
                href="https://x.com/PumpFunSearch"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-[rgba(122,169,255,0.55)] bg-[rgba(122,169,255,0.12)] px-5 py-3 text-sm font-medium text-[var(--accent-blue)] transition hover:translate-y-[-1px] hover:bg-[rgba(122,169,255,0.18)]"
              >
                X / @PumpFunSearch
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                ["19", "active clusters tracked"],
                ["94%", "top confidence link score"],
                ["12ms", "signal refresh latency"],
                ["24/7", "public chain ingestion"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-xl border border-[var(--line-soft)] bg-[rgba(9,16,28,0.82)] px-4 py-3"
                >
                  <p className="font-mono text-lg text-[var(--text-primary)]">{value}</p>
                  <p className="text-xs uppercase tracking-[0.12em] text-[var(--text-muted)]">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <HeroTerminalPreview />
        </div>
      </section>

      <section className="border-y border-[var(--line-soft)] bg-[rgba(8,16,28,0.86)] py-3">
        <div className="marquee">
          <div className="marquee-track font-mono text-xs uppercase tracking-[0.16em] text-[var(--text-secondary)]">
            {[...tickerItems, ...tickerItems].map((item, index) => (
              <span key={`${item}-${index}`} className="inline-flex items-center gap-2">
                {item}
                <span className="h-1 w-1 rounded-full bg-[var(--accent-green)]" />
              </span>
            ))}
          </div>
        </div>
      </section>

      <motion.section
        id="terminal"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-120px" }}
        variants={fadeInUp}
        className="mx-auto w-full max-w-[1280px] px-5 py-16 sm:px-6 lg:px-8 lg:py-22"
      >
        <SectionHeading
          eyebrow="Terminal Preview"
          title="A live workspace for wallet intelligence"
          description="Search wallets, inspect cluster overlap, and drill into evidence-backed behavior signals from one terminal-grade interface."
        />

        <div className="terminal-shell scan-overlay relative overflow-hidden rounded-3xl p-3 sm:p-4">
          <div className="grid gap-3 xl:grid-cols-[220px_minmax(0,1fr)_320px]">
            <aside className="terminal-panel rounded-2xl p-3">
              <div className="mb-4 rounded-lg border border-[var(--line-soft)] bg-[rgba(8,14,25,0.9)] p-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  Session
                </p>
                <p className="mt-1 text-sm text-[var(--text-primary)]">terminal://ops/live</p>
                <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-[var(--accent-green)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-green)] pulse-dot" />
                  synced
                </p>
              </div>

              <nav className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = tab.id === activeTab;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => triggerTabLoading(tab.id)}
                      className={`group relative flex items-center justify-between rounded-lg border px-3 py-2 text-left transition ${
                        isActive
                          ? "border-[rgba(116,246,176,0.42)] bg-[rgba(116,246,176,0.11)]"
                          : "border-[var(--line-soft)] bg-[rgba(7,13,23,0.76)] hover:border-[var(--accent-teal)]"
                      }`}
                    >
                      <span className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                        <Icon
                          className={`h-3.5 w-3.5 ${
                            isActive ? "text-[var(--accent-green)]" : "text-[var(--text-muted)]"
                          }`}
                        />
                        {tab.id}
                      </span>

                      <span className="flex items-center gap-2">
                        {tab.badge && (
                          <span className="rounded bg-[rgba(122,169,255,0.2)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--accent-blue)]">
                            {tab.badge}
                          </span>
                        )}
                        {isActive ? (
                          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-green)] pulse-dot" />
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </aside>

            <div className="space-y-3">
              <div className="terminal-panel rounded-2xl p-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <label className="relative block max-w-xl flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      value={searchQuery}
                      onChange={(event) => {
                        triggerTableLoading();
                        setSearchQuery(event.target.value);
                      }}
                      placeholder="Search wallet / token / cluster"
                      className="w-full rounded-lg border border-[var(--line)] bg-[rgba(7,13,24,0.88)] py-2.5 pl-9 pr-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-teal)]"
                    />
                  </label>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <div className="inline-flex rounded-lg border border-[var(--line)] bg-[rgba(7,13,24,0.9)] p-1">
                      {(["all", "80+", "90+"] as ConfidenceGate[]).map((gate) => (
                        <button
                          key={gate}
                          type="button"
                          onClick={() => {
                            triggerTableLoading();
                            setConfidenceGate(gate);
                          }}
                          className={`rounded px-2.5 py-1 transition ${
                            confidenceGate === gate
                              ? "bg-[rgba(87,214,207,0.2)] text-[var(--accent-teal)]"
                              : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                          }`}
                        >
                          {gate === "all" ? "All confidence" : `${gate} confidence`}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        triggerTableLoading();
                        setFlaggedOnly((current) => !current);
                      }}
                      className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 transition ${
                        flaggedOnly
                          ? "border-[rgba(255,106,130,0.42)] bg-[rgba(255,106,130,0.13)] text-[var(--accent-red)]"
                          : "border-[var(--line)] bg-[rgba(7,13,24,0.9)] text-[var(--text-muted)]"
                      }`}
                    >
                      <Filter className="h-3.5 w-3.5" />
                      Flagged only
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                  <p>
                    {filteredWallets.length} wallets matched • sort {sortField} ({sortDirection})
                  </p>
                  <p className="font-mono text-[var(--accent-green)]">
                    signal refresh in 00:04
                    <span className="ml-1 inline-block h-2.5 w-[1.5px] bg-[var(--accent-green)] align-middle blink-cursor" />
                  </p>
                </div>
              </div>

              <AnimatePresence mode="wait" initial={false}>
                {isTabLoading ? (
                  <motion.div
                    key="loading-panel"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="terminal-panel rounded-2xl p-4"
                  >
                    <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-[var(--line)] bg-[rgba(7,13,24,0.8)] px-2.5 py-1 text-xs text-[var(--text-muted)]">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--accent-teal)]" />
                      Loading {activeTab}
                    </div>
                    <PanelSkeleton />
                  </motion.div>
                ) : (
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="space-y-3"
                  >
                    {(activeTab === "Dashboard" || activeTab === "Wallet Search") && (
                      <>
                        <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-5">
                          {metricCards.map((card) => {
                            const Icon = card.icon;

                            return (
                              <div
                                key={card.label}
                                className="terminal-panel rounded-xl px-3 py-3.5 transition hover:-translate-y-[1px]"
                              >
                                <p className="mb-2 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
                                  <Icon className="h-3.5 w-3.5 text-[var(--accent-teal)]" />
                                  {card.label}
                                </p>
                                <p className="font-mono text-xl text-[var(--text-primary)]">{card.value}</p>
                                <p className="mt-1 text-[11px] text-[var(--text-secondary)]">{card.delta}</p>
                              </div>
                            );
                          })}
                        </div>

                        <div className="terminal-panel rounded-2xl p-4">
                          <div className="mb-3 flex items-center justify-between">
                            <p className="text-sm text-[var(--text-primary)]">Wallet intelligence table</p>
                            <p className="text-xs text-[var(--text-muted)]">click row for detail drawer</p>
                          </div>

                          <div className="overflow-hidden rounded-xl border border-[var(--line-soft)]">
                            <div className="overflow-x-auto">
                              <table className="min-w-[930px] w-full border-collapse text-sm">
                                <thead className="bg-[rgba(11,19,33,0.9)]">
                                  <tr className="font-mono text-[11px] uppercase tracking-[0.09em]">
                                    <th className="px-3 py-2.5 text-left text-[var(--text-muted)]">Wallet</th>
                                    <th className="px-3 py-2.5 text-left">{sortableHeader("score", "Score")}</th>
                                    <th className="px-3 py-2.5 text-left text-[var(--text-muted)]">Cluster</th>
                                    <th className="px-3 py-2.5 text-left text-[var(--text-muted)]">Shared Source</th>
                                    <th className="px-3 py-2.5 text-left">{sortableHeader("activityMatch", "Activity Match")}</th>
                                    <th className="px-3 py-2.5 text-left">{sortableHeader("confidence", "Confidence")}</th>
                                    <th className="px-3 py-2.5 text-left">{sortableHeader("lastActiveMinutes", "Last Active")}</th>
                                  </tr>
                                </thead>

                                <tbody>
                                  {isTableLoading ? (
                                    <tr>
                                      <td colSpan={7} className="p-3">
                                        <TableSkeleton />
                                      </td>
                                    </tr>
                                  ) : filteredWallets.length ? (
                                    filteredWallets.map((wallet) => {
                                      const isSelected = selectedWallet?.id === wallet.id;

                                      return (
                                        <tr
                                          key={wallet.id}
                                          onClick={() => setSelectedWalletId(wallet.id)}
                                          className={`cursor-pointer border-t border-[var(--line-soft)] transition ${
                                            isSelected
                                              ? "bg-[rgba(87,214,207,0.11)]"
                                              : "bg-[rgba(7,13,24,0.72)] hover:bg-[rgba(122,169,255,0.12)]"
                                          }`}
                                        >
                                          <td className="px-3 py-2.5">
                                            <p className="font-mono text-[13px] text-[var(--text-primary)]">{wallet.wallet}</p>
                                            <div className="mt-1 flex flex-wrap gap-1">
                                              {wallet.tags.slice(0, 2).map((tag) => (
                                                <span
                                                  key={`${wallet.id}-${tag}`}
                                                  className="rounded bg-[rgba(87,214,207,0.12)] px-1.5 py-0.5 text-[10px] text-[var(--accent-teal)]"
                                                >
                                                  {tag}
                                                </span>
                                              ))}
                                            </div>
                                          </td>
                                          <td className="px-3 py-2.5 font-mono text-[var(--text-primary)]">
                                            {wallet.score}
                                          </td>
                                          <td className="px-3 py-2.5 text-[var(--text-secondary)]">{wallet.cluster}</td>
                                          <td className="px-3 py-2.5 text-[var(--text-secondary)]">
                                            {wallet.sharedSource}
                                          </td>
                                          <td className="px-3 py-2.5 text-[var(--text-primary)]">
                                            {wallet.activityMatch}%
                                          </td>
                                          <td className="px-3 py-2.5">
                                            <div className="flex items-center gap-2">
                                              <div className="h-1.5 w-16 rounded-full bg-[rgba(122,169,255,0.18)]">
                                                <div
                                                  className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent-teal),var(--accent-green))]"
                                                  style={{ width: `${wallet.confidence}%` }}
                                                />
                                              </div>
                                              <span className="font-mono text-xs text-[var(--text-secondary)]">
                                                {wallet.confidence}%
                                              </span>
                                            </div>
                                          </td>
                                          <td className="px-3 py-2.5 text-[var(--text-secondary)]">{wallet.lastActive}</td>
                                        </tr>
                                      );
                                    })
                                  ) : (
                                    <tr>
                                      <td
                                        colSpan={7}
                                        className="px-3 py-10 text-center text-sm text-[var(--text-muted)]"
                                      >
                                        No wallets matched this filter set.
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {activeTab === "Cluster Map" && (
                      <div className="terminal-panel rounded-2xl p-4">
                        <p className="mb-4 text-sm text-[var(--text-primary)]">
                          Cluster relationship graph • shared funder / same entry window / repeat co-trades
                        </p>
                        <ClusterMap />
                      </div>
                    )}

                    {activeTab === "Signals" && (
                      <div className="terminal-panel rounded-2xl p-4">
                        <p className="mb-4 text-sm text-[var(--text-primary)]">Live signal stream</p>
                        <div className="space-y-2.5">
                          {signalFeed.map((entry, index) => (
                            <div
                              key={entry}
                              className="flex items-start justify-between gap-3 rounded-lg border border-[var(--line-soft)] bg-[rgba(7,13,24,0.72)] px-3 py-2.5"
                            >
                              <p className="text-sm text-[var(--text-secondary)]">{entry}</p>
                              <span className="font-mono text-xs text-[var(--text-muted)]">
                                {index + 1}m ago
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === "Linked Activity" && (
                      <div className="terminal-panel rounded-2xl p-4">
                        <p className="mb-4 text-sm text-[var(--text-primary)]">Linked activity timeline</p>
                        <div className="grid gap-3 md:grid-cols-2">
                          {walletRows.slice(0, 4).map((wallet) => (
                            <div
                              key={`${wallet.id}-timeline`}
                              className="rounded-xl border border-[var(--line-soft)] bg-[rgba(8,14,24,0.75)] p-3"
                            >
                              <p className="font-mono text-xs text-[var(--accent-teal)]">{wallet.wallet}</p>
                              <p className="mt-1 text-xs text-[var(--text-muted)]">{wallet.cluster}</p>
                              <ul className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
                                {wallet.timeline.slice(0, 2).map((item) => (
                                  <li key={`${wallet.id}-${item.time}`} className="flex gap-2">
                                    <span className="font-mono text-xs text-[var(--text-muted)]">
                                      {item.time}
                                    </span>
                                    <span>{item.event}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === "Watchlists" && (
                      <div className="terminal-panel rounded-2xl p-4">
                        <p className="mb-4 text-sm text-[var(--text-primary)]">Saved watchlists</p>
                        <div className="space-y-3">
                          {watchlists.map((watch) => (
                            <div
                              key={watch.name}
                              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--line-soft)] bg-[rgba(8,14,24,0.75)] p-3"
                            >
                              <div>
                                <p className="text-sm text-[var(--text-primary)]">{watch.name}</p>
                                <p className="text-xs text-[var(--text-muted)]">
                                  {watch.wallets} wallets tracked
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="rounded bg-[rgba(116,246,176,0.13)] px-2 py-1 text-xs text-[var(--accent-green)]">
                                  {watch.alert}
                                </span>
                                <button
                                  type="button"
                                  className="rounded border border-[var(--line)] px-2.5 py-1.5 text-xs text-[var(--text-secondary)] transition hover:border-[var(--accent-teal)]"
                                >
                                  Open
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === "Settings" && (
                      <div className="terminal-panel rounded-2xl p-4">
                        <p className="mb-4 text-sm text-[var(--text-primary)]">Terminal settings</p>
                        <div className="space-y-3 text-sm">
                          {[
                            { label: "Real-time cluster alerts", enabled: true },
                            { label: "Suspicious overlap warnings", enabled: true },
                            { label: "Bridge route anomaly feed", enabled: false },
                            { label: "Daily digest summary", enabled: true },
                          ].map(({ label, enabled }) => (
                            <div
                              key={label}
                              className="flex items-center justify-between rounded-lg border border-[var(--line-soft)] bg-[rgba(8,14,24,0.75)] px-3 py-2.5"
                            >
                              <p className="text-[var(--text-secondary)]">{label}</p>
                              <span
                                className={`h-5 w-10 rounded-full border p-0.5 transition ${
                                  enabled
                                    ? "border-[rgba(116,246,176,0.4)] bg-[rgba(116,246,176,0.2)]"
                                    : "border-[var(--line)] bg-[rgba(20,32,50,0.9)]"
                                }`}
                              >
                                <span
                                  className={`block h-3.5 w-3.5 rounded-full transition ${
                                    enabled
                                      ? "translate-x-4 bg-[var(--accent-green)]"
                                      : "translate-x-0 bg-[var(--text-muted)]"
                                  }`}
                                />
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <aside className="terminal-panel rounded-2xl p-4">
              <p className="mb-3 inline-flex items-center gap-2 text-xs uppercase tracking-[0.13em] text-[var(--text-muted)]">
                <Wallet className="h-3.5 w-3.5 text-[var(--accent-teal)]" />
                Wallet detail drawer
              </p>

              {selectedWallet ? (
                <div className="space-y-4">
                  <div className="rounded-xl border border-[var(--line-soft)] bg-[rgba(7,13,24,0.82)] p-3">
                    <p className="font-mono text-sm text-[var(--text-primary)]">{selectedWallet.wallet}</p>
                    <p className="mt-1 font-mono text-[11px] text-[var(--text-muted)]">
                      {selectedWallet.fullWallet}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[var(--line-soft)] bg-[rgba(7,13,24,0.82)] p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs uppercase tracking-[0.11em] text-[var(--text-muted)]">
                        Risk / confidence score
                      </p>
                      <p className="font-mono text-sm text-[var(--accent-green)]">
                        {selectedWallet.confidence}%
                      </p>
                    </div>
                    <div className="h-1.5 rounded-full bg-[rgba(116,246,176,0.15)]">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent-teal),var(--accent-green))]"
                        style={{ width: `${selectedWallet.confidence}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-[var(--text-secondary)]">
                      {selectedWallet.connectionSummary}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[var(--line-soft)] bg-[rgba(7,13,24,0.82)] p-3">
                    <p className="mb-2 text-xs uppercase tracking-[0.11em] text-[var(--text-muted)]">
                      Evidence signals
                    </p>
                    <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                      {selectedWallet.evidence.map((item) => (
                        <li key={item} className="flex gap-2">
                          <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--accent-teal)]" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-[var(--line-soft)] bg-[rgba(7,13,24,0.82)] p-3">
                    <p className="mb-2 text-xs uppercase tracking-[0.11em] text-[var(--text-muted)]">
                      Behavior notes
                    </p>
                    <ul className="space-y-1.5 text-sm text-[var(--text-secondary)]">
                      {selectedWallet.behaviorNotes.map((note) => (
                        <li key={note} className="inline-flex items-start gap-2">
                          <Activity className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--accent-blue)]" />
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-[var(--line-soft)] bg-[rgba(7,13,24,0.82)] p-3">
                    <p className="mb-2 text-xs uppercase tracking-[0.11em] text-[var(--text-muted)]">
                      Recent activity timeline
                    </p>
                    <ul className="space-y-2">
                      {selectedWallet.timeline.map((event) => (
                        <li key={`${selectedWallet.id}-${event.time}`} className="flex gap-2 text-sm">
                          <span className="font-mono text-xs text-[var(--text-muted)]">{event.time}</span>
                          <span className="text-[var(--text-secondary)]">{event.event}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[var(--text-muted)]">No wallet selected.</p>
              )}
            </aside>
          </div>
        </div>
      </motion.section>

      <motion.section
        id="cluster-map"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-120px" }}
        variants={fadeInUp}
        className="mx-auto w-full max-w-[1280px] px-5 pb-16 sm:px-6 lg:px-8"
      >
        <SectionHeading
          eyebrow="Cluster Map"
          title="Wallet relationships, mapped as they evolve"
          description="Surface links between wallets through funding paths, entry timing, co-trades, and bridge overlap."
        />

        <div className="terminal-shell rounded-3xl p-4 sm:p-5">
          <ClusterMap />

          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {[
              ["shared funder", "6 links", "Funding source overlap across exchange rails"],
              ["same entry window", "8 links", "Sub-90s synchronized buy activity"],
              ["repeat co-trades", "11 links", "Recurrent co-positioning patterns"],
              ["bridge overlap", "4 links", "Matching bridge routes and timing"],
            ].map(([label, count, text]) => (
              <div
                key={label}
                className="rounded-xl border border-[var(--line-soft)] bg-[rgba(8,14,24,0.8)] p-3"
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--accent-teal)]">
                  {label}
                </p>
                <p className="mt-1 text-lg text-[var(--text-primary)]">{count}</p>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-120px" }}
        variants={fadeInUp}
        className="mx-auto w-full max-w-[1280px] px-5 pb-16 sm:px-6 lg:px-8"
      >
        <SectionHeading
          eyebrow="How it works"
          title="From public data to actionable cluster intelligence"
          description="PumpSearch keeps the workflow simple: ingest, link, score, and surface."
        />

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {[
            [
              "Ingest public on-chain activity",
              "Continuously index wallet transfers, swaps, bridge routes, and entry timestamps across pump.fun flows.",
            ],
            [
              "Detect overlaps and wallet relationships",
              "Connect wallets by shared sources, repeated co-trades, timing correlation, and route similarity.",
            ],
            [
              "Score coordinated behavior",
              "Apply confidence scoring to behavior bundles instead of single events, reducing noisy false positives.",
            ],
            [
              "Surface clusters worth investigating",
              "Highlight the wallets and groups most likely to influence volume so traders can investigate fast.",
            ],
          ].map(([title, description], index) => (
            <div
              key={title}
              className="terminal-panel rounded-2xl p-4"
            >
              <p className="font-mono text-xs text-[var(--accent-teal)]">0{index + 1}</p>
              <h3 className="mt-2 text-base text-[var(--text-primary)]">{title}</h3>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">{description}</p>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section
        id="features"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-120px" }}
        variants={fadeInUp}
        className="mx-auto w-full max-w-[1280px] px-5 pb-16 sm:px-6 lg:px-8"
      >
        <SectionHeading
          eyebrow="Key features"
          title="Built for high-speed wallet analysis"
          description="Everything you need to investigate clusters, validate links, and track activity with terminal-grade speed."
        />

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              icon: Wallet,
              title: "Wallet clustering",
              text: "Group wallets by behavior, source overlap, and execution patterns.",
            },
            {
              icon: Database,
              title: "Shared funding source detection",
              text: "Trace wallets back to common funding rails.",
            },
            {
              icon: Flame,
              title: "Synchronized buy analysis",
              text: "Spot wallets entering within the same execution window.",
            },
            {
              icon: Users,
              title: "Repeated co-activity detection",
              text: "Find wallets repeatedly trading together over time.",
            },
            {
              icon: ShieldCheck,
              title: "Signal scoring",
              text: "Confidence-based ranking to prioritize investigation.",
            },
            {
              icon: Eye,
              title: "Watchlists and tracking",
              text: "Monitor target wallets and clusters across sessions.",
            },
            {
              icon: Gauge,
              title: "Terminal-grade UI",
              text: "Dense data layout with fast navigation and filters.",
            },
            {
              icon: Search,
              title: "Fast search and filtering",
              text: "Find wallets, clusters, and tags with low latency.",
            },
          ].map((feature) => {
            const Icon = feature.icon;

            return (
            <div
              key={feature.title}
              className="terminal-panel rounded-2xl p-4"
            >
              <div className="inline-flex rounded-md border border-[var(--line)] bg-[rgba(7,13,24,0.82)] p-2">
                <Icon className="h-4 w-4 text-[var(--accent-green)]" />
              </div>
              <h3 className="mt-3 text-base text-[var(--text-primary)]">{feature.title}</h3>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">{feature.text}</p>
            </div>
            );
          })}
        </div>
      </motion.section>

      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-120px" }}
        variants={fadeInUp}
        className="mx-auto w-full max-w-[1280px] px-5 pb-16 sm:px-6 lg:px-8"
      >
        <SectionHeading
          eyebrow="Why it matters"
          title="Most traders watch tokens. Smart traders watch wallets."
          description="The edge is not seeing the candle first. The edge is seeing coordination before the crowd understands what is happening."
        />

        <div className="grid gap-3 lg:grid-cols-3">
          {[
            [
              "Most traders only see tokens",
              "Price and volume alone hide who is driving the move.",
            ],
            [
              "Smart traders track wallets",
              "Wallet behavior reveals repeat actors and coordinated patterns.",
            ],
            [
              "Real edge = early coordination detection",
              "PumpSearch helps analyze public wallet activity faster and clearer.",
            ],
          ].map(([title, text]) => (
            <div key={title} className="terminal-panel rounded-2xl p-5">
              <h3 className="text-lg text-[var(--text-primary)]">{title}</h3>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">{text}</p>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section
        id="pricing"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-120px" }}
        variants={fadeInUp}
        className="mx-auto w-full max-w-[1280px] px-5 pb-16 sm:px-6 lg:px-8"
      >
        <SectionHeading
          eyebrow="Pricing"
          title="Simple plans for different trading depth"
          description="Start free, upgrade when you need full map depth and unlimited signal history."
        />

        <div className="grid gap-3 lg:grid-cols-3">
          {[
            {
              tier: "Free",
              price: "$0",
              description: "Basic wallet search and limited results.",
              features: ["Basic wallet lookup", "Starter cluster hints", "Limited signal cards"],
              accent: "border-[var(--line)]",
            },
            {
              tier: "Pro",
              price: "$79",
              description: "Full cluster maps, full signal history, advanced filters.",
              features: ["Complete cluster map", "Confidence signal history", "Advanced filtering"],
              accent: "border-[rgba(87,214,207,0.5)]",
            },
            {
              tier: "Terminal",
              price: "$199",
              description: "Unlimited access, exports, priority updates, advanced watchlists.",
              features: ["Unlimited queries", "CSV + API exports", "Priority updates & watchlists"],
              accent: "border-[rgba(116,246,176,0.55)]",
            },
          ].map((plan) => (
            <div
              key={plan.tier}
              className={`terminal-shell rounded-2xl p-5 ${plan.accent}`}
            >
              <p className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--accent-teal)]">
                {plan.tier}
              </p>
              <p className="mt-2 [font-family:var(--font-sora)] text-4xl text-[var(--text-primary)]">
                {plan.price}
                {plan.tier !== "Free" && <span className="text-sm text-[var(--text-muted)]">/mo</span>}
              </p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">{plan.description}</p>
              <ul className="mt-4 space-y-2 text-sm text-[var(--text-secondary)]">
                {plan.features.map((feature) => (
                  <li key={feature} className="inline-flex items-start gap-2">
                    <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--accent-green)]" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </motion.section>

      <section className="mx-auto w-full max-w-[1280px] px-5 pb-8 sm:px-6 lg:px-8">
        <div className="terminal-shell rounded-3xl px-6 py-10 text-center sm:px-10">
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.13em] text-[var(--accent-teal)]">
            Final call
          </p>
          <h3 className="[font-family:var(--font-sora)] text-3xl text-[var(--text-primary)] sm:text-4xl">
            Start tracking smarter
          </h3>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-[var(--text-secondary)] sm:text-base">
            Open PumpSearch and see the wallets behind the move.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href="#terminal"
              className="inline-flex items-center gap-2 rounded-md border border-[rgba(116,246,176,0.6)] bg-[rgba(116,246,176,0.12)] px-5 py-2.5 text-sm font-medium text-[var(--accent-green)] transition hover:bg-[rgba(116,246,176,0.2)]"
            >
              Open PumpSearch
              <ChevronRight className="h-4 w-4" />
            </a>
            <a
              href="#cluster-map"
              className="inline-flex items-center gap-2 rounded-md border border-[var(--line)] px-5 py-2.5 text-sm text-[var(--text-secondary)] transition hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)]"
            >
              See the wallets behind the move
            </a>
          </div>
        </div>
      </section>

      <footer className="mx-auto w-full max-w-[1280px] px-5 pb-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 border-t border-[var(--line-soft)] pt-4 text-xs text-[var(--text-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} PumpSearch</p>
          <p className="max-w-2xl text-right">
            PumpSearch provides analytics based on public blockchain data. It does not provide
            financial advice or guarantee outcomes.
          </p>
        </div>
      </footer>

      <div className="pointer-events-none fixed bottom-4 right-4 z-30 hidden items-center gap-2 rounded-full border border-[var(--line)] bg-[rgba(6,12,22,0.86)] px-3 py-1.5 text-[11px] text-[var(--text-secondary)] shadow-xl backdrop-blur-lg md:flex">
        <Bell className="h-3.5 w-3.5 text-[var(--accent-teal)]" />
        Cluster-03 confidence spike
        <Clock3 className="h-3.5 w-3.5 text-[var(--text-muted)]" />
        now
      </div>

      <div className="pointer-events-none fixed left-4 top-24 z-30 hidden items-center gap-2 rounded-full border border-[rgba(255,106,130,0.3)] bg-[rgba(34,12,20,0.78)] px-3 py-1.5 text-[11px] text-[var(--accent-red)] lg:flex">
        <AlertTriangle className="h-3.5 w-3.5" />
        Suspicious overlap alert: Cluster-07
      </div>
    </main>
  );
}
