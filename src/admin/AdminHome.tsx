import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Link } from "react-router";

function StatCard({
  label,
  value,
  icon,
  linkTo,
  warn,
}: {
  label: string;
  value: number | undefined;
  icon: string;
  linkTo?: string;
  warn?: boolean;
}) {
  const content = (
    <div
      className={`bg-neutral-900 rounded-xl p-5 flex flex-col gap-1 transition-colors ${
        linkTo ? "hover:bg-neutral-800 cursor-pointer" : ""
      } ${warn ? "ring-1 ring-yellow-500/40" : ""}`}
    >
      <span className="text-lg">{icon}</span>
      <span
        className={`text-3xl font-bold ${
          warn ? "text-yellow-400" : "text-white"
        }`}
      >
        {value ?? "-"}
      </span>
      <span className="text-sm text-white/60">{label}</span>
    </div>
  );

  if (linkTo) {
    return <Link to={linkTo}>{content}</Link>;
  }

  return content;
}

function FactsByMetricChart({
  factsByMetric,
}: {
  factsByMetric: Record<string, number>;
}) {
  const entries = Object.entries(factsByMetric).sort(
    ([, a], [, b]) => b - a
  );
  const max = entries.length > 0 ? entries[0][1] : 1;

  return (
    <div className="bg-neutral-900 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
        Facts by Metric
      </h2>
      {entries.length === 0 ? (
        <p className="text-white/40 text-sm">No facts yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {entries.map(([metric, count]) => (
            <div key={metric} className="flex items-center gap-3">
              <span className="text-sm text-white/80 w-32 shrink-0 truncate">
                {metric}
              </span>
              <div className="flex-1 h-6 bg-neutral-800 rounded-md overflow-hidden">
                <div
                  className="h-full bg-indigo-500/70 rounded-md transition-all duration-500"
                  style={{ width: `${(count / max) * 100}%` }}
                />
              </div>
              <span className="text-sm text-white/60 w-10 text-right tabular-nums">
                {count}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function VerificationBar({
  verified,
  unverified,
  total,
}: {
  verified: number;
  unverified: number;
  total: number;
}) {
  const verifiedPct = total > 0 ? (verified / total) * 100 : 0;
  const unverifiedPct = total > 0 ? (unverified / total) * 100 : 0;
  const disputedPct = total > 0 ? 100 - verifiedPct - unverifiedPct : 0;

  return (
    <div className="bg-neutral-900 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
        Verification Status
      </h2>
      {total === 0 ? (
        <p className="text-white/40 text-sm">No facts yet.</p>
      ) : (
        <>
          <div className="h-4 bg-neutral-800 rounded-full overflow-hidden flex">
            {verifiedPct > 0 && (
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${verifiedPct}%` }}
              />
            )}
            {unverifiedPct > 0 && (
              <div
                className="h-full bg-amber-500 transition-all duration-500"
                style={{ width: `${unverifiedPct}%` }}
              />
            )}
            {disputedPct > 0 && (
              <div
                className="h-full bg-red-500 transition-all duration-500"
                style={{ width: `${disputedPct}%` }}
              />
            )}
          </div>
          <div className="flex gap-5 mt-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-sm text-white/60">
                Verified{" "}
                <span className="text-white font-medium">{verified}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-sm text-white/60">
                Unverified{" "}
                <span className="text-white font-medium">{unverified}</span>
              </span>
            </div>
            {total - verified - unverified > 0 && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm text-white/60">
                  Disputed{" "}
                  <span className="text-white font-medium">
                    {total - verified - unverified}
                  </span>
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export function AdminHome() {
  const stats = useQuery(api.stats.overview);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>

      {/* Stat cards grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Items"
          value={stats?.totalItems}
          icon="&#x1F4E6;"
        />
        <StatCard
          label="Total Facts"
          value={stats?.totalFacts}
          icon="&#x1F4CA;"
        />
        <StatCard
          label="Open Disputes"
          value={stats?.openDisputes}
          icon="&#x26A0;"
          linkTo="/admin/disputes"
          warn={(stats?.openDisputes ?? 0) > 0}
        />
        <StatCard
          label="Enabled Categories"
          value={stats?.enabledCategories}
          icon="&#x1F3F7;"
        />
      </div>

      {/* Details sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FactsByMetricChart
          factsByMetric={stats?.factsByMetric ?? {}}
        />
        <VerificationBar
          verified={stats?.verifiedFacts ?? 0}
          unverified={stats?.unverifiedFacts ?? 0}
          total={stats?.totalFacts ?? 0}
        />
      </div>
    </div>
  );
}
