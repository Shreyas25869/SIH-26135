import { useState } from "react";
import { PageHeader, Table, Badge, Card, EmptyState } from "../../../shared/ui";
import { useProviderData } from "../../../shared/ProviderContext";
import { DROPOUT_REASONS } from "../../../data/mockData";

export default function Dropouts() {
  const { trainees, batches } = useProviderData();
  const [reasonFilter, setReasonFilter] = useState("all");

  const dropped = trainees.filter((t) => t.status === "Dropped Out");
  const notPlaced = trainees.filter((t) => t.status === "Completed" && t.outcome && !t.outcome.placed);

  const counts = DROPOUT_REASONS.map((r) => ({
    reason: r,
    count: dropped.filter((t) => t.dropoutReason === r).length,
  })).filter((r) => r.count > 0);

  const filtered = reasonFilter === "all" ? dropped : dropped.filter((t) => t.dropoutReason === reasonFilter);

  return (
    <div>
      <PageHeader
        title="Dropouts & non-placement"
        subtitle="Why trainees left training, or completed without finding a suitable job — grouped by reason."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2 p-6">
          <h3 className="font-display text-[16px] font-semibold text-ink mb-4">Dropout reasons</h3>
          {counts.length === 0 ? (
            <p className="text-sage text-[14px]">No dropouts recorded.</p>
          ) : (
            <div className="space-y-2.5">
              {counts.map((c) => (
                <div key={c.reason} className="flex items-center gap-3">
                  <button
                    onClick={() => setReasonFilter(reasonFilter === c.reason ? "all" : c.reason)}
                    className={`text-[13px] w-40 text-left shrink-0 ${reasonFilter === c.reason ? "text-pine font-medium" : "text-ink/70"}`}
                  >
                    {c.reason}
                  </button>
                  <div className="flex-1 h-2 bg-ink/5 rounded-full overflow-hidden">
                    <div className="h-full bg-brick" style={{ width: `${(c.count / dropped.length) * 100}%` }} />
                  </div>
                  <span className="text-[13px] font-mono text-ink/60 w-6 text-right">{c.count}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card className="p-6">
          <h3 className="font-display text-[16px] font-semibold text-ink mb-2">Completed, not placed</h3>
          <p className="text-sage text-[13px] mb-3">Trainees who finished training but haven't found suitable work.</p>
          <div className="font-display text-[30px] font-semibold text-ochre-dark">{notPlaced.length}</div>
          {notPlaced.slice(0, 3).map((t) => (
            <div key={t.id} className="text-[13px] text-ink/70 border-t border-ink/5 pt-2 mt-2">{t.name}</div>
          ))}
        </Card>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No records" body="No dropouts match this filter." />
      ) : (
        <Table columns={["Trainee", "Batch", "Reason", "Notes"]}>
          {filtered.map((t) => {
            const batch = batches.find((b) => b.id === t.batchId);
            return (
              <tr key={t.id} className="border-b border-ink/5 last:border-0 hover:bg-ink/[0.02]">
                <td className="px-4 py-3 font-medium text-ink">{t.name}</td>
                <td className="px-4 py-3 text-ink/70 text-[13px]">{batch?.name}</td>
                <td className="px-4 py-3"><Badge tone="dropped">{t.dropoutReason}</Badge></td>
                <td className="px-4 py-3 text-ink/60 text-[13px]">{t.dropoutNotes || "—"}</td>
              </tr>
            );
          })}
        </Table>
      )}
    </div>
  );
}
