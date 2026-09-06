import { useState } from "react";
import {
  LayoutDashboard, Building2, BookOpen, Layers, Users, CalendarCheck,
  ClipboardList, Award, TrendingUp, UserX, BarChart3, Menu, X,
} from "lucide-react";
import { ProviderProvider, useProviderData } from "./shared/ProviderContext";
import ProviderProfile from "./features/provider/profile/ProviderProfile";
import ProviderDashboard from "./features/provider/dashboard/ProviderDashboard";
import Courses from "./features/provider/courses/Courses";
import Batches from "./features/provider/batches/Batches";
import Trainees from "./features/provider/trainees/Trainees";
import Attendance from "./features/provider/attendance/Attendance";
import Assessments from "./features/provider/assessments/Assessments";
import Certifications from "./features/provider/certifications/Certifications";
import Outcomes from "./features/provider/outcomes/Outcomes";
import Dropouts from "./features/provider/dropouts/Dropouts";
import Analytics from "./features/provider/analytics/Analytics";

const NAV = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "profile", label: "Profile", icon: Building2 },
  { key: "courses", label: "Courses", icon: BookOpen },
  { key: "batches", label: "Batches", icon: Layers },
  { key: "trainees", label: "Trainees", icon: Users },
  { key: "attendance", label: "Attendance", icon: CalendarCheck },
  { key: "assessments", label: "Assessments", icon: ClipboardList },
  { key: "certifications", label: "Certifications", icon: Award },
  { key: "outcomes", label: "Outcomes", icon: TrendingUp },
  { key: "dropouts", label: "Dropouts", icon: UserX },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
];

const PAGES = {
  dashboard: ProviderDashboard,
  profile: ProviderProfile,
  courses: Courses,
  batches: Batches,
  trainees: Trainees,
  attendance: Attendance,
  assessments: Assessments,
  certifications: Certifications,
  outcomes: Outcomes,
  dropouts: Dropouts,
  analytics: Analytics,
};

function AppShell() {
  const [view, setView] = useState("dashboard");
  const [params, setParams] = useState({});
  const [mobileOpen, setMobileOpen] = useState(false);
  const { loading, error } = useProviderData();

  const navigate = (key, p = {}) => {
    setView(key);
    setParams(p);
    setMobileOpen(false);
  };

  const Page = PAGES[view];

  return (
    <div className="min-h-screen bg-paper flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static z-30 inset-y-0 left-0 w-64 bg-pine-dark text-white flex flex-col transition-transform duration-200 ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <div className="font-display font-semibold text-[16px] leading-tight">Rozgaar Mitra</div>
            <div className="text-white/50 text-[12px]">Training Provider Portal</div>
          </div>
          <button className="lg:hidden text-white/70" onClick={() => setMobileOpen(false)}><X size={20} /></button>
        </div>
        <nav className="flex-1 overflow-y-auto py-3">
          {NAV.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => navigate(key)}
              className={`w-full flex items-center gap-3 px-5 py-2.5 text-[14px] transition-colors ${
                view === key ? "bg-white/10 text-white border-r-2 border-ochre" : "text-white/65 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-white/10 text-[12px] text-white/40">
          TP-KA-2019-0417
        </div>
      </aside>

      {mobileOpen && <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Main */}
      <div className="flex-1 min-w-0">
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-surface border-b border-ink/10 sticky top-0 z-10">
          <button onClick={() => setMobileOpen(true)} className="text-ink"><Menu size={22} /></button>
          <span className="font-display font-semibold text-ink">Rozgaar Mitra</span>
          <span className="w-[22px]" />
        </header>
        <main className="p-6 lg:p-10 max-w-7xl mx-auto">
          {error && (
            <div className="mb-6 px-4 py-3 border border-brick/30 bg-brick/5 text-brick text-[13px] rounded-sm">
              Couldn't reach Supabase: {error}. Check your <code>.env</code> values and that <code>supabase/schema.sql</code> has been run.
            </div>
          )}
          {loading ? (
            <div className="text-sage text-[14px] py-20 text-center">Loading provider data…</div>
          ) : (
            <Page navigate={navigate} params={params} />
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ProviderProvider>
      <AppShell />
    </ProviderProvider>
  );
}
