import { useEffect, useState } from "react";
import { Building2, MapPin, Phone, Mail, IdCard, BookOpen } from "lucide-react";
import { PageHeader, Card, Field, inputClass, Button } from "../../../shared/ui";
import { useProviderData } from "../../../shared/ProviderContext";
import { supabase } from "../../../lib/supabaseClient";

const rowToProfile = (r) => ({
  id: r.id,
  orgName: r.organization_name || "",
  providerId: r.user_id || "",
  district: r.district || "",
  address: r.address || r.city || "",
  contactPerson: r.provider_type || "",
  phone: r.phone || "",
  email: r.email || "",
  affiliation: r.verification_status || "",
  established: "",
});

const profileToRow = (p) => ({
  organization_name: p.orgName,
  user_id: p.providerId || null,
  district: p.district,
  address: p.address,
  provider_type: p.contactPerson,
  phone: p.phone,
  email: p.email,
  city: p.address,
});

export default function ProviderProfile() {
  const { courses } = useProviderData();
  const [profile, setProfile] = useState(null);
  const [draft, setDraft] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("training_providers").select("*").limit(1).maybeSingle();
      if (error) setSaveError(error.message);
      if (data) {
        setProfile(rowToProfile(data));
        setDraft(rowToProfile(data));
      }
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaveError(null);
    if (profile?.id) {
      const { error } = await supabase.from("training_providers").update(profileToRow(draft)).eq("id", profile.id);
      if (error) return setSaveError(error.message);
    } else {
      const { data, error } = await supabase.from("training_providers").insert(profileToRow(draft)).select().single();
      if (error) return setSaveError(error.message);
      setDraft({ ...draft, id: data.id });
    }
    setProfile(draft);
    setEditing(false);
  };

  if (loading) return <p className="text-sage text-[14px] py-10 text-center">Loading profile…</p>;

  const p = profile || {
    orgName: "", providerId: "", district: "", address: "", contactPerson: "", phone: "", email: "", affiliation: "", established: "",
  };
  const d = draft || p;

  return (
    <div>
      <PageHeader
        title="Provider profile"
        subtitle="Your organization's registered details, as shared with trainees and the placement network."
        action={
          editing ? (
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => { setDraft(profile); setEditing(false); }}>Cancel</Button>
              <Button onClick={save}>Save changes</Button>
            </div>
          ) : (
            <Button variant="ghost" onClick={() => { setDraft(profile || d); setEditing(true); }}>Edit profile</Button>
          )
        }
      />

      {saveError && (
        <div className="mb-6 px-4 py-3 border border-brick/30 bg-brick/5 text-brick text-[13px] rounded-sm">{saveError}</div>
      )}

      {!profile && !editing && (
        <div className="mb-6 px-4 py-3 border border-ochre/30 bg-ochre/5 text-ochre-dark text-[13px] rounded-sm">
          No provider record found in Supabase yet — click "Edit profile" to create one.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          {!editing ? (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-sm bg-pine text-white flex items-center justify-center">
                  <Building2 size={22} />
                </div>
                <div>
                  <div className="font-display text-[20px] font-semibold text-ink">{p.orgName || "Unnamed provider"}</div>
                  <div className="text-sage text-[13px]">{p.affiliation}{p.established ? ` · Est. ${p.established}` : ""}</div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-ink/10">
                <InfoRow icon={<IdCard size={16} />} label="Provider ID" value={p.providerId || "—"} />
                <InfoRow icon={<MapPin size={16} />} label="District" value={p.district || "—"} />
                <InfoRow icon={<Phone size={16} />} label="Contact number" value={p.phone || "—"} />
                <InfoRow icon={<Mail size={16} />} label="Email" value={p.email || "—"} />
                <InfoRow icon={<Building2 size={16} />} label="Registered address" value={p.address || "—"} full />
                <InfoRow icon={<IdCard size={16} />} label="Primary contact" value={p.contactPerson || "—"} />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
              <Field label="Organization name">
                <input className={inputClass} value={d.orgName} onChange={(e) => setDraft({ ...d, orgName: e.target.value })} />
              </Field>
              <Field label="Provider ID">
                <input className={inputClass} value={d.providerId} onChange={(e) => setDraft({ ...d, providerId: e.target.value })} />
              </Field>
              <Field label="District">
                <input className={inputClass} value={d.district} onChange={(e) => setDraft({ ...d, district: e.target.value })} />
              </Field>
              <Field label="Contact person">
                <input className={inputClass} value={d.contactPerson} onChange={(e) => setDraft({ ...d, contactPerson: e.target.value })} />
              </Field>
              <Field label="Phone">
                <input className={inputClass} value={d.phone} onChange={(e) => setDraft({ ...d, phone: e.target.value })} />
              </Field>
              <Field label="Email">
                <input className={inputClass} value={d.email} onChange={(e) => setDraft({ ...d, email: e.target.value })} />
              </Field>
              <Field label="Affiliation">
                <input className={inputClass} value={d.affiliation} onChange={(e) => setDraft({ ...d, affiliation: e.target.value })} />
              </Field>
              <Field label="Established">
                <input className={inputClass} value={d.established} onChange={(e) => setDraft({ ...d, established: e.target.value })} />
              </Field>
              <Field label="Registered address">
                <textarea className={inputClass} rows={2} value={d.address} onChange={(e) => setDraft({ ...d, address: e.target.value })} />
              </Field>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 text-ink/70 mb-3">
            <BookOpen size={16} />
            <span className="text-[13px] font-medium uppercase tracking-wide">Courses offered</span>
          </div>
          <ul className="space-y-2">
            {courses.filter((c) => c.status === "Active").map((c) => (
              <li key={c.id} className="text-[14px] text-ink flex items-center justify-between border-b border-ink/5 pb-2">
                <span>{c.name}</span>
                <span className="text-sage text-[12px] font-mono">{c.level?.replace("NSQF Level ", "L")}</span>
              </li>
            ))}
            {courses.filter((c) => c.status === "Active").length === 0 && (
              <li className="text-sage text-[13px]">No active courses yet.</li>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value, full }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <div className="flex items-center gap-1.5 text-sage text-[12px] uppercase tracking-wide mb-1">
        {icon}
        {label}
      </div>
      <div className="text-ink text-[14px]">{value}</div>
    </div>
  );
}
