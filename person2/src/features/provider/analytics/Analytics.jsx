import { PageHeader, StatStub, Card } from "../../../shared/ui";
import { useProviderData } from "../../../shared/ProviderContext";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell,
} from "recharts";

const PIE_COLORS = ["#1E4844", "#C4832A", "#AE3D33", "#8B9A8C"];

export default function Analytics() {
  const { courses, batches, trainees } = useProviderData();

  const total = trainees.length;
  const completed = trainees.filter((t) => t.status === "Completed");
  const dropped = trainees.filter((t) => t.status === "Dropped Out");
  const placed = trainees.filter((t) => t.outcome?.placed);
  const completionRate = total ? ((completed.length / total) * 100).toFixed(0) : 0;
  const dropoutRate = total ? ((dropped.length / total) * 100).toFixed(0) : 0;
  const placementRate = completed.length ? ((placed.length / completed.length) * 100).toFixed(0) : 0;
  const retentionRate = 100 - dropoutRate;
  const avgSalary = placed.length
    ? Math.round(placed.reduce((s, t) => s + (t.outcome.salary || 0), 0) / placed.length)
    : 0;

  const skillImprovement = (() => {
    const withTwo = trainees.filter((t) => t.assessments.length >= 2);
    if (!withTwo.length) return 0;
    const deltas = withTwo.map((t) => {
      const first = t.assessments[0];
      const last = t.assessments[t.assessments.length - 1];
      return (last.score / last.maxScore - first.score / first.maxScore) * 100;
    });
    return (deltas.reduce((a, b) => a + b, 0) / deltas.length).toFixed(1);
  })();

  const statusSplit = [
    { name: "Ongoing", value: trainees.filter((t) => t.status === "Ongoing").length },
    { name: "Completed", value: completed.length },
    { name: "Dropped out", value: dropped.length },
  ];

  const coursePerf = courses
    .filter((c) => c.status !== "Archived")
    .map((c) => {
      const batchIds = batches.filter((b) => b.courseId === c.id).map((b) => b.id);
      const courseTrainees = trainees.filter((t) => batchIds.includes(t.batchId));
      const courseCompleted = courseTrainees.filter((t) => t.status === "Completed");
      return {
        name: c.name.length > 18 ? c.name.slice(0, 16) + "…" : c.name,
        completed: courseCompleted.length,
        enrolled: courseTrainees.length,
      };
    });

  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle="Training and outcome performance across all your courses and batches."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatStub label="Completion rate" value={`${completionRate}%`} accent="pine" />
        <StatStub label="Dropout rate" value={`${dropoutRate}%`} accent="brick" />
        <StatStub label="Placement rate" value={`${placementRate}%`} accent="moss" sub="of completed" />
        <StatStub label="Retention rate" value={`${retentionRate}%`} accent="ochre" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatStub label="Avg. placement salary" value={avgSalary ? `₹${avgSalary.toLocaleString("en-IN")}` : "—"} accent="moss" />
        <StatStub label="Avg. skill improvement" value={`${skillImprovement > 0 ? "+" : ""}${skillImprovement}%`} accent="pine" sub="theory → practical delta" />
        <StatStub label="Total trainees" value={total} accent="ochre" />
        <StatStub label="Active courses" value={courses.filter((c) => c.status === "Active").length} accent="pine" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <h3 className="font-display text-[16px] font-semibold text-ink mb-4">Course performance — enrolled vs. completed</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={coursePerf} margin={{ left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1C232115" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#1C2321aa" }} />
              <YAxis tick={{ fontSize: 12, fill: "#1C2321aa" }} />
              <Tooltip contentStyle={{ fontSize: 13, borderRadius: 2, border: "1px solid #1C232120" }} />
              <Bar dataKey="enrolled" fill="#8B9A8C" radius={[2, 2, 0, 0]} name="Enrolled" />
              <Bar dataKey="completed" fill="#1E4844" radius={[2, 2, 0, 0]} name="Completed" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="font-display text-[16px] font-semibold text-ink mb-4">Trainee status split</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusSplit} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2}>
                {statusSplit.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 13, borderRadius: 2, border: "1px solid #1C232120" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {statusSplit.map((s, i) => (
              <div key={s.name} className="flex items-center justify-between text-[13px]">
                <span className="flex items-center gap-2 text-ink/70">
                  <span className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i] }} />
                  {s.name}
                </span>
                <span className="font-mono text-ink/60">{s.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
