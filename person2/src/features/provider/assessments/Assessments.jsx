import { useState, Fragment } from "react";
import { Plus } from "lucide-react";
import { PageHeader, Button, Table, Modal, Field, inputClass, EmptyState } from "../../../shared/ui";
import { useProviderData } from "../../../shared/ProviderContext";

const emptyForm = { traineeId: "", skill: "", score: "", maxScore: 100, assessor: "", date: "" };

export default function Assessments() {
  const { trainees, addAssessment } = useProviderData();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [expanded, setExpanded] = useState(null);

  const openNew = () => { setForm({ ...emptyForm, traineeId: trainees[0]?.id || "" }); setModal(true); };
  const submit = () => {
    addAssessment(form.traineeId, {
      skill: form.skill,
      score: Number(form.score),
      maxScore: Number(form.maxScore),
      assessor: form.assessor,
      date: form.date || new Date().toISOString().slice(0, 10),
    });
    setModal(false);
  };

  const withAssessments = trainees.filter((t) => t.assessments.length > 0);

  return (
    <div>
      <PageHeader
        title="Skill assessments"
        subtitle="Score trainees on individual skills. Every entry is kept — nothing overwrites a past result."
        action={<Button onClick={openNew}><Plus size={16} /> Record score</Button>}
      />

      {withAssessments.length === 0 ? (
        <EmptyState title="No assessments recorded" body="Record a skill score for a trainee to start building their history." />
      ) : (
        <Table columns={["Trainee", "Latest skill", "Latest score", "History", ""]}>
          {withAssessments.map((t) => {
            const latest = t.assessments[t.assessments.length - 1];
            const isOpen = expanded === t.id;
            return (
              <Fragment key={t.id}>
                <tr className="border-b border-ink/5 hover:bg-ink/[0.02]">
                  <td className="px-4 py-3 font-medium text-ink">{t.name}</td>
                  <td className="px-4 py-3 text-ink/80">{latest.skill}</td>
                  <td className="px-4 py-3 font-mono text-ink/80">{latest.score}/{latest.maxScore}</td>
                  <td className="px-4 py-3 text-ink/60 text-[13px]">{t.assessments.length} record{t.assessments.length > 1 ? "s" : ""}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setExpanded(isOpen ? null : t.id)} className="text-[13px] text-pine hover:underline">
                      {isOpen ? "Hide" : "View history"}
                    </button>
                  </td>
                </tr>
                {isOpen && (
                  <tr className="border-b border-ink/5 bg-paper/40">
                    <td colSpan={5} className="px-4 py-3">
                      <div className="space-y-1.5">
                        {t.assessments.map((a) => (
                          <div key={a.id} className="flex items-center justify-between text-[13px]">
                            <span className="text-ink/80">{a.skill} <span className="text-sage">· {a.date} · {a.assessor}</span></span>
                            <span className="font-mono text-ink/80">{a.score}/{a.maxScore}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </Table>
      )}

      {modal && (
        <Modal title="Record skill score" onClose={() => setModal(false)}>
          <Field label="Trainee">
            <select className={inputClass} value={form.traineeId} onChange={(e) => setForm({ ...form, traineeId: e.target.value })}>
              {trainees.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </Field>
          <Field label="Skill assessed">
            <input className={inputClass} value={form.skill} onChange={(e) => setForm({ ...form, skill: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Score">
              <input type="number" className={inputClass} value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} />
            </Field>
            <Field label="Out of">
              <input type="number" className={inputClass} value={form.maxScore} onChange={(e) => setForm({ ...form, maxScore: e.target.value })} />
            </Field>
          </div>
          <Field label="Assessor">
            <input className={inputClass} value={form.assessor} onChange={(e) => setForm({ ...form, assessor: e.target.value })} />
          </Field>
          <Field label="Date">
            <input type="date" className={inputClass} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
            <Button onClick={submit} disabled={!form.skill || form.score === ""}>Save score</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
