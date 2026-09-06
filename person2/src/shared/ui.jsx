import { X } from "lucide-react";

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between gap-6 mb-8">
      <div>
        <h1 className="font-display text-[28px] font-semibold text-ink tracking-tight">{title}</h1>
        {subtitle && <p className="text-sage mt-1 text-[15px] max-w-xl">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Button({ children, variant = "primary", className = "", ...props }) {
  const base = "inline-flex items-center gap-2 px-4 py-2 text-[14px] font-medium rounded-sm transition-colors duration-150";
  const styles = {
    primary: "bg-pine text-white hover:bg-pine-dark",
    ochre: "bg-ochre text-white hover:bg-ochre-dark",
    ghost: "bg-transparent text-pine border border-pine/30 hover:border-pine hover:bg-pine/5",
    danger: "bg-transparent text-brick border border-brick/30 hover:bg-brick/5",
  };
  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Badge({ tone = "neutral", children }) {
  const tones = {
    neutral: "bg-ink/5 text-ink/70",
    active: "bg-moss/10 text-moss",
    ongoing: "bg-ochre/10 text-ochre-dark",
    completed: "bg-pine/10 text-pine",
    dropped: "bg-brick/10 text-brick",
    archived: "bg-ink/5 text-ink/40",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[12px] font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function statusTone(status) {
  switch (status) {
    case "Active":
    case "Placed":
      return "active";
    case "Ongoing":
      return "ongoing";
    case "Completed":
      return "completed";
    case "Dropped Out":
      return "dropped";
    case "Archived":
      return "archived";
    default:
      return "neutral";
  }
}

export function StatStub({ label, value, sub, accent = "pine" }) {
  const accentMap = { pine: "text-pine", ochre: "text-ochre-dark", brick: "text-brick", moss: "text-moss" };
  return (
    <div className="counterfoil bg-surface px-5 py-4 rise-in">
      <div className="text-[12px] uppercase tracking-wide text-sage font-medium">{label}</div>
      <div className={`font-display text-[30px] font-semibold mt-1 ${accentMap[accent]}`}>{value}</div>
      {sub && <div className="text-[13px] text-ink/50 mt-0.5">{sub}</div>}
    </div>
  );
}

export function Card({ children, className = "" }) {
  return (
    <div className={`bg-surface border border-ink/10 rounded-sm ${className}`}>{children}</div>
  );
}

export function Table({ columns, children }) {
  return (
    <div className="overflow-x-auto border border-ink/10 rounded-sm bg-surface">
      <table className="w-full text-[14px]">
        <thead>
          <tr className="border-b border-ink/10 text-left">
            {columns.map((c) => (
              <th key={c} className="px-4 py-3 font-medium text-ink/50 text-[12px] uppercase tracking-wide whitespace-nowrap">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function EmptyState({ title, body }) {
  return (
    <div className="border border-dashed border-ink/15 rounded-sm py-14 text-center bg-surface/50">
      <p className="font-display text-[17px] text-ink/70">{title}</p>
      <p className="text-sage text-[14px] mt-1 max-w-sm mx-auto">{body}</p>
    </div>
  );
}

export function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 bg-ink/40 z-40 flex items-start justify-center overflow-y-auto py-10 px-4">
      <div className={`bg-surface rounded-sm border border-ink/10 w-full ${wide ? "max-w-2xl" : "max-w-lg"} rise-in`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink/10">
          <h2 className="font-display text-[18px] font-semibold text-ink">{title}</h2>
          <button onClick={onClose} className="text-ink/40 hover:text-ink" aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <label className="block mb-4">
      <span className="block text-[13px] font-medium text-ink/70 mb-1.5">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full border border-ink/15 rounded-sm px-3 py-2 text-[14px] bg-white focus:border-pine outline-none";
