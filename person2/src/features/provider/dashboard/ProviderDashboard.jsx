import { PageHeader, StatStub, Card, Badge, statusTone } from "../../../shared/ui";
import { useProviderData } from "../../../shared/ProviderContext";

export default function ProviderDashboard({ navigate }) {
  const { courses, batches, trainees } = useProviderData();

  const ongoing = trainees.filter((t) => t.status === "Ongoing").length;
  const completed = trainees.filter((t) => t.status === "Completed").length;
  const droppedOut = trainees.filter((t) => t.status === "Dropped Out").length;
  const placed = trainees.filter((t) => t.outcome?.placed).length;
  const activeBatches = batches.filter((b) => b.status === "Ongoing");

  const recentDropouts = trainees
    .filter((t) => t.status === "Dropped Out")
    .slice(-4)
    .reverse();

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="A snapshot of your trainees, batches and outcomes across all courses."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatStub label="Trainees ongoing" value={ongoing} accent="ochre" />
        <StatStub label="Completed training" value={completed} accent="pine" />
        <StatStub label="Dropped out" value={droppedOut} accent="brick" sub={`${trainees.length ? ((droppedOut / trainees.length) * 100).toFixed(0) : 0}% of total`} />
        <StatStub label="Placed in jobs" value={placed} accent="moss" sub={`of ${completed} completed`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-[17px] font-semibold text-ink">Batches in progress</h3>
            <button onClick={() => navigate("batches")} className="text-[13px] text-pine hover:underline">
              View all
            </button>
          </div>
          <div className="space-y-3">
            {activeBatches.map((b) => {
              const course = courses.find((c) => c.id === b.courseId);
              const batchTrainees = trainees.filter((t) => t.batchId === b.id);
              return (
                <div key={b.id} className="flex items-center justify-between border-b border-ink/5 pb-3 last:border-0">
                  <div>
                    <div className="text-[14px] font-medium text-ink">{b.name}</div>
                    <div className="text-[12px] text-sage">{course?.name} · Trainer {b.trainer}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[14px] font-mono text-ink">{batchTrainees.length}/{b.capacity}</div>
                    <div className="text-[11px] text-sage">enrolled</div>
                  </div>
                </div>
              );
            })}
            {activeBatches.length === 0 && <p className="text-sage text-[14px]">No batches currently running.</p>}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-display text-[17px] font-semibold text-ink mb-4">Recent dropout flags</h3>
          <div className="space-y-3">
            {recentDropouts.map((t) => (
              <div key={t.id} className="border-b border-ink/5 pb-3 last:border-0">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-ink">{t.name}</span>
                  <Badge tone={statusTone(t.status)}>{t.status}</Badge>
                </div>
                <div className="text-[12px] text-sage mt-0.5">{t.dropoutReason}</div>
              </div>
            ))}
            {recentDropouts.length === 0 && <p className="text-sage text-[14px]">No dropouts recorded.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
