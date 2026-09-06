import { useState } from "react";
import { PageHeader, Table, Badge, statusTone, inputClass } from "../../../shared/ui";
import { useProviderData } from "../../../shared/ProviderContext";

function attendanceTone(pct) {
  if (pct >= 75) return "active";
  if (pct >= 50) return "ongoing";
  return "dropped";
}

export default function Attendance() {
  const { trainees, batches, updateTrainee } = useProviderData();
  const [batchFilter, setBatchFilter] = useState("all");

  const list = trainees.filter((t) => t.status !== "Dropped Out" && (batchFilter === "all" || t.batchId === batchFilter));

  const adjust = (id, delta) => {
    const t = trainees.find((x) => x.id === id);
    const next = Math.max(0, Math.min(100, t.attendancePct + delta));
    updateTrainee(id, { attendancePct: next });
  };

  return (
    <div>
      <PageHeader
        title="Attendance"
        subtitle="Running attendance percentage per trainee, used to flag risk of dropout early."
      />

      <div className="mb-4">
        <select className={inputClass + " w-auto"} value={batchFilter} onChange={(e) => setBatchFilter(e.target.value)}>
          <option value="all">All batches</option>
          {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      <Table columns={["Trainee", "Batch", "Attendance", "Trend", ""]}>
        {list.map((t) => {
          const batch = batches.find((b) => b.id === t.batchId);
          return (
            <tr key={t.id} className="border-b border-ink/5 last:border-0 hover:bg-ink/[0.02]">
              <td className="px-4 py-3 font-medium text-ink">{t.name}</td>
              <td className="px-4 py-3 text-ink/70 text-[13px]">{batch?.name}</td>
              <td className="px-4 py-3">
                <Badge tone={attendanceTone(t.attendancePct)}>{t.attendancePct}%</Badge>
              </td>
              <td className="px-4 py-3 w-40">
                <div className="w-full h-1.5 bg-ink/10 rounded-full overflow-hidden">
                  <div
                    className={t.attendancePct >= 75 ? "h-full bg-moss" : t.attendancePct >= 50 ? "h-full bg-ochre" : "h-full bg-brick"}
                    style={{ width: `${t.attendancePct}%` }}
                  />
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2 justify-end">
                  <button onClick={() => adjust(t.id, -5)} className="text-[13px] px-2 py-0.5 border border-ink/15 rounded-sm text-ink/60 hover:border-pine">−5</button>
                  <button onClick={() => adjust(t.id, 5)} className="text-[13px] px-2 py-0.5 border border-ink/15 rounded-sm text-ink/60 hover:border-pine">+5</button>
                </div>
              </td>
            </tr>
          );
        })}
      </Table>
    </div>
  );
}
