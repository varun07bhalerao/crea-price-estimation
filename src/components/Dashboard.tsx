import { useEffect, useMemo, useState } from "react";
import {
  Calculator, Globe, Smartphone, Palette, Megaphone, Target, Users, LogOut,
  CheckCircle, Sparkles, Search, FilePlus, FolderClock, Trash2, Building2, Mail, Phone, User as UserIcon,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  fmtINR, WEB_TYPES, HOSTING, DOMAIN, SEO_INTEGRATION, calcWeb,
  APP_PLATFORM, APP_COMPLEXITY, APP_MODULES, calcApp,
  DESIGN_TOOL, DESIGN_COMPLEXITY, calcDesign,
  SEO_SCOPE, CONTENT_PACK, RETAINER, calcSeo,
  AD_PLATFORM, calcAds,
  type WebInputs, type AppInputs, type DesignInputs, type SeoInputs, type AdsInputs,
} from "@/lib/pricing";

type ServiceKey = "web" | "app" | "design" | "seo" | "ads";

type SavedClient = {
  id: string;
  createdAt: string;
  lead: { name: string; company: string; email: string; phone: string };
  services: ServiceKey[];
  lines: { service: string; items: { label: string; amount: number }[]; total: number }[];
  grandTotal: number;
};

const STORAGE = "crea_clients_v1";
const SERVICES: { key: ServiceKey; label: string; Icon: typeof Globe }[] = [
  { key: "web", label: "Web Development", Icon: Globe },
  { key: "app", label: "App Development", Icon: Smartphone },
  { key: "design", label: "UI/UX Design", Icon: Palette },
  { key: "seo", label: "Digital Marketing & SEO", Icon: Megaphone },
  { key: "ads", label: "Meta & Google Ads", Icon: Target },
];

const defaults = {
  web: { type: "portfolio", pages: 5, hosting: "1y", domain: "1y", seo: "basic" } as WebInputs,
  app: {
    platform: "cross", complexity: "medium",
    modules: { pushNotifications: true, paymentGateway: false, userProfiles: true, adminDashboard: false, chat: false, analytics: false },
  } as AppInputs,
  design: { tool: "figma", complexity: "standard", screens: 10 } as DesignInputs,
  seo: { scope: "local", content: "basic", retainer: "3" } as SeoInputs,
  ads: { platform: "meta", monthlyBudget: 50000, managementPct: 15, months: 3 } as AdsInputs,
};

function Section({ icon: Icon, title, children }: { icon: typeof Globe; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/15 text-indigo-400">
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="font-semibold text-white">{title}</h3>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30";

function Select<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <select className={inputCls} value={value} onChange={(e) => onChange(e.target.value as T)}>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function NewEstimate({ onSave }: { onSave: (c: SavedClient) => void }) {
  const [lead, setLead] = useState({ name: "", company: "", email: "", phone: "" });
  const [active, setActive] = useState<Record<ServiceKey, boolean>>({ web: true, app: false, design: false, seo: false, ads: false });
  const [web, setWeb] = useState<WebInputs>(defaults.web);
  const [app, setApp] = useState<AppInputs>(defaults.app);
  const [design, setDesign] = useState<DesignInputs>(defaults.design);
  const [seo, setSeo] = useState<SeoInputs>(defaults.seo);
  const [ads, setAds] = useState<AdsInputs>(defaults.ads);
  const [saved, setSaved] = useState(false);

  const computed = useMemo(() => {
    const blocks: { key: ServiceKey; service: string; items: { label: string; amount: number }[]; total: number }[] = [];
    if (active.web) blocks.push({ key: "web", service: "Web Development", ...calcWeb(web) });
    if (active.app) blocks.push({ key: "app", service: "App Development", ...calcApp(app) });
    if (active.design) blocks.push({ key: "design", service: "UI/UX Design", ...calcDesign(design) });
    if (active.seo) blocks.push({ key: "seo", service: "Digital Marketing & SEO", ...calcSeo(seo) });
    if (active.ads) blocks.push({ key: "ads", service: "Meta & Google Ads", ...calcAds(ads) });
    const grand = blocks.reduce((s, b) => s + b.total, 0);
    return { blocks, grand };
  }, [active, web, app, design, seo, ads]);

  const valid = lead.name.trim() && lead.company.trim() && computed.blocks.length > 0;

  const handleSave = () => {
    if (!valid) return;
    const client: SavedClient = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      lead,
      services: computed.blocks.map((b) => b.key),
      lines: computed.blocks.map(({ service, items, total }) => ({ service, items, total })),
      grandTotal: computed.grand,
    };
    onSave(client);
    setLead({ name: "", company: "", email: "", phone: "" });
    setActive({ web: true, app: false, design: false, seo: false, ads: false });
    setWeb(defaults.web); setApp(defaults.app); setDesign(defaults.design); setSeo(defaults.seo); setAds(defaults.ads);
    setSaved(true);
    setTimeout(() => setSaved(false), 2400);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">

      <div className="space-y-6">
        {/* Step 1: Lead */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/15 text-indigo-400"><Users className="h-4 w-4" /></div>
            <h3 className="font-semibold text-white">Step 1 · Lead Capture</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Client Name">
              <div className="relative">
                <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input className={inputCls + " pl-10"} value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })} placeholder="Full name" />
              </div>
            </Field>
            <Field label="Company / Business">
              <div className="relative">
                <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input className={inputCls + " pl-10"} value={lead.company} onChange={(e) => setLead({ ...lead, company: e.target.value })} placeholder="Company name" />
              </div>
            </Field>
            <Field label="Email Address">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input type="email" className={inputCls + " pl-10"} value={lead.email} onChange={(e) => setLead({ ...lead, email: e.target.value })} placeholder="client@company.com" />
              </div>
            </Field>
            <Field label="Phone Number">
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input className={inputCls + " pl-10"} value={lead.phone} onChange={(e) => setLead({ ...lead, phone: e.target.value })} placeholder="+91 ..." />
              </div>
            </Field>
          </div>
        </div>

        {/* Step 2: Services */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/15 text-indigo-400"><Calculator className="h-4 w-4" /></div>
            <h3 className="font-semibold text-white">Step 2 · Service Matrix</h3>
          </div>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
            {SERVICES.map(({ key, label, Icon }) => {
              const on = active[key];
              return (
                <button
                  key={key}
                  onClick={() => setActive({ ...active, [key]: !on })}
                  className={`group flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition ${on ? "border-indigo-500 bg-indigo-600/10" : "border-slate-700 bg-slate-950/40 hover:border-slate-600"}`}
                >
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${on ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className={`text-sm font-medium ${on ? "text-white" : "text-slate-300"}`}>{label}</span>
                  {on && <CheckCircle className="ml-auto h-4 w-4 text-indigo-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Conditional inputs */}
        {active.web && (
          <Section icon={Globe} title="Web Development Specifications">
            <Field label="Website Type">
              <Select value={web.type} onChange={(v) => setWeb({ ...web, type: v as WebInputs["type"] })}
                options={(Object.keys(WEB_TYPES) as (keyof typeof WEB_TYPES)[]).map((k) => ({ value: k, label: WEB_TYPES[k].label }))} />
            </Field>
            <Field label={`Page Count (base ${WEB_TYPES[web.type].basePages})`}>
              <input type="number" min={1} className={inputCls} value={web.pages} onChange={(e) => setWeb({ ...web, pages: Math.max(1, +e.target.value || 1) })} />
            </Field>
            <Field label="Hosting Tenure">
              <Select value={web.hosting} onChange={(v) => setWeb({ ...web, hosting: v as WebInputs["hosting"] })}
                options={(Object.keys(HOSTING) as (keyof typeof HOSTING)[]).map((k) => ({ value: k, label: `${HOSTING[k].label} — ${fmtINR(HOSTING[k].price)}` }))} />
            </Field>
            <Field label="Domain Tenure">
              <Select value={web.domain} onChange={(v) => setWeb({ ...web, domain: v as WebInputs["domain"] })}
                options={(Object.keys(DOMAIN) as (keyof typeof DOMAIN)[]).map((k) => ({ value: k, label: `${DOMAIN[k].label} — ${fmtINR(DOMAIN[k].price)}` }))} />
            </Field>
            <Field label="SEO Integration">
              <Select value={web.seo} onChange={(v) => setWeb({ ...web, seo: v as WebInputs["seo"] })}
                options={(Object.keys(SEO_INTEGRATION) as (keyof typeof SEO_INTEGRATION)[]).map((k) => ({ value: k, label: `${SEO_INTEGRATION[k].label} — ${fmtINR(SEO_INTEGRATION[k].price)}` }))} />
            </Field>
          </Section>
        )}

        {active.app && (
          <Section icon={Smartphone} title="App Development Specifications">
            <Field label="Platform">
              <Select value={app.platform} onChange={(v) => setApp({ ...app, platform: v as AppInputs["platform"] })}
                options={(Object.keys(APP_PLATFORM) as (keyof typeof APP_PLATFORM)[]).map((k) => ({ value: k, label: APP_PLATFORM[k].label }))} />
            </Field>
            <Field label="Complexity">
              <Select value={app.complexity} onChange={(v) => setApp({ ...app, complexity: v as AppInputs["complexity"] })}
                options={(Object.keys(APP_COMPLEXITY) as (keyof typeof APP_COMPLEXITY)[]).map((k) => ({ value: k, label: APP_COMPLEXITY[k].label }))} />
            </Field>
            <div className="sm:col-span-2">
              <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-400">Feature Modules</span>
              <div className="grid gap-2 sm:grid-cols-2">
                {(Object.keys(APP_MODULES) as (keyof typeof APP_MODULES)[]).map((k) => {
                  const on = app.modules[k];
                  return (
                    <button key={k} onClick={() => setApp({ ...app, modules: { ...app.modules, [k]: !on } })}
                      className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition ${on ? "border-indigo-500 bg-indigo-600/10 text-white" : "border-slate-700 bg-slate-950/40 text-slate-300 hover:border-slate-600"}`}>
                      <span className="flex items-center gap-2">
                        {on ? <CheckCircle className="h-4 w-4 text-indigo-400" /> : <span className="h-4 w-4 rounded border border-slate-600" />}
                        {APP_MODULES[k].label}
                      </span>
                      <span className="text-xs text-slate-400">{fmtINR(APP_MODULES[k].price)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </Section>
        )}

        {active.design && (
          <Section icon={Palette} title="UI/UX Design Specifications">
            <Field label="Design Tool">
              <Select value={design.tool} onChange={(v) => setDesign({ ...design, tool: v as DesignInputs["tool"] })}
                options={(Object.keys(DESIGN_TOOL) as (keyof typeof DESIGN_TOOL)[]).map((k) => ({ value: k, label: DESIGN_TOOL[k].label }))} />
            </Field>
            <Field label="Visual Complexity">
              <Select value={design.complexity} onChange={(v) => setDesign({ ...design, complexity: v as DesignInputs["complexity"] })}
                options={(Object.keys(DESIGN_COMPLEXITY) as (keyof typeof DESIGN_COMPLEXITY)[]).map((k) => ({ value: k, label: `${DESIGN_COMPLEXITY[k].label} — ${fmtINR(DESIGN_COMPLEXITY[k].perScreen)}/screen` }))} />
            </Field>
            <Field label="Number of Screens / Frames">
              <input type="number" min={1} className={inputCls} value={design.screens} onChange={(e) => setDesign({ ...design, screens: Math.max(1, +e.target.value || 1) })} />
            </Field>
          </Section>
        )}

        {active.seo && (
          <Section icon={Megaphone} title="Digital Marketing & SEO Specifications">
            <Field label="SEO Scope">
              <Select value={seo.scope} onChange={(v) => setSeo({ ...seo, scope: v as SeoInputs["scope"] })}
                options={(Object.keys(SEO_SCOPE) as (keyof typeof SEO_SCOPE)[]).map((k) => ({ value: k, label: `${SEO_SCOPE[k].label} — ${fmtINR(SEO_SCOPE[k].monthly)}/mo` }))} />
            </Field>
            <Field label="Monthly Content Pack">
              <Select value={seo.content} onChange={(v) => setSeo({ ...seo, content: v as SeoInputs["content"] })}
                options={(Object.keys(CONTENT_PACK) as (keyof typeof CONTENT_PACK)[]).map((k) => ({ value: k, label: `${CONTENT_PACK[k].label}${CONTENT_PACK[k].monthly ? ` — ${fmtINR(CONTENT_PACK[k].monthly)}/mo` : ""}` }))} />
            </Field>
            <Field label="Retainer Contract">
              <Select value={seo.retainer} onChange={(v) => setSeo({ ...seo, retainer: v as SeoInputs["retainer"] })}
                options={(Object.keys(RETAINER) as (keyof typeof RETAINER)[]).map((k) => ({ value: k, label: `${RETAINER[k].label}${RETAINER[k].discount ? ` (-${Math.round(RETAINER[k].discount * 100)}%)` : ""}` }))} />
            </Field>
          </Section>
        )}

        {active.ads && (
          <Section icon={Target} title="Meta & Google Ads Specifications">
            <Field label="Ad Platform">
              <Select value={ads.platform} onChange={(v) => setAds({ ...ads, platform: v as AdsInputs["platform"] })}
                options={(Object.keys(AD_PLATFORM) as (keyof typeof AD_PLATFORM)[]).map((k) => ({ value: k, label: `${AD_PLATFORM[k].label} — Setup ${fmtINR(AD_PLATFORM[k].setup)}` }))} />
            </Field>
            <Field label="Client Monthly Ad Spend (₹)">
              <input type="number" min={0} step={1000} className={inputCls} value={ads.monthlyBudget} onChange={(e) => setAds({ ...ads, monthlyBudget: Math.max(0, +e.target.value || 0) })} />
            </Field>
            <Field label="Agency Management Premium (%)">
              <input type="number" min={0} max={50} className={inputCls} value={ads.managementPct} onChange={(e) => setAds({ ...ads, managementPct: Math.max(0, Math.min(50, +e.target.value || 0)) })} />
            </Field>
            <Field label="Campaign Duration (months)">
              <input type="number" min={1} max={24} className={inputCls} value={ads.months} onChange={(e) => setAds({ ...ads, months: Math.max(1, +e.target.value || 1) })} />
            </Field>
          </Section>
        )}
      </div>

      {/* Sticky pricing widget */}
      <aside className="xl:sticky xl:top-6 xl:self-start">
        <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-900/60 p-5 shadow-xl">
          <div className="mb-4 flex items-center gap-2">
            <Calculator className="h-4 w-4 text-indigo-400" />
            <h3 className="font-semibold text-white">Live Estimate</h3>
          </div>

          {computed.blocks.length === 0 ? (
            <p className="text-sm text-slate-400">Select at least one service to see pricing.</p>
          ) : (
            <div className="space-y-4">
              {computed.blocks.map((b) => (
                <div key={b.service} className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-white">{b.service}</span>
                    <span className="text-sm font-semibold text-indigo-400">{fmtINR(b.total)}</span>
                  </div>
                  <ul className="space-y-1">
                    {b.items.map((it, i) => (
                      <li key={i} className="flex justify-between gap-3 text-xs text-slate-400">
                        <span className="truncate">{it.label}</span>
                        <span className={it.amount < 0 ? "text-emerald-400" : ""}>{fmtINR(it.amount)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <div className="border-t border-slate-800 pt-4">
                <div className="flex items-end justify-between">
                  <span className="text-xs uppercase tracking-wider text-slate-400">Grand Total</span>
                  <span className="text-2xl font-bold text-white">{fmtINR(computed.grand)}</span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={!valid}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:shadow-none"
          >
            <FilePlus className="h-4 w-4" />
            Save Client Estimate
          </button>
          {!valid && <p className="mt-2 text-center text-xs text-slate-500">Add client name, company & at least one service.</p>}
          {saved && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
              <CheckCircle className="h-4 w-4" /> Estimate saved successfully.
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function SavedClients({ clients, onDelete }: { clients: SavedClient[]; onDelete: (id: string) => void }) {
  const [q, setQ] = useState("");
  const filtered = clients.filter((c) => {
    const s = q.toLowerCase().trim();
    if (!s) return true;
    return c.lead.name.toLowerCase().includes(s) || c.lead.company.toLowerCase().includes(s);
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Saved Clients</h2>
          <p className="text-sm text-slate-400">{clients.length} estimate{clients.length !== 1 ? "s" : ""} recorded</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or company..."
            className={inputCls + " pl-10"}
          />
        </div>
      </div>

      {/* Mobile card list */}
      <div className="space-y-3 md:hidden">
        {filtered.length === 0 && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-10 text-center text-sm text-slate-500">
            {clients.length === 0 ? "No estimates yet. Create one from the New Estimate tab." : "No matches."}
          </div>
        )}
        {filtered.map((c) => (
          <div key={c.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate font-medium text-white">{c.lead.name}</div>
                <div className="truncate text-xs text-slate-500">{c.lead.company}</div>
                <div className="truncate text-xs text-slate-500">{c.lead.email || "—"}</div>
              </div>
              <button onClick={() => onDelete(c.id)} className="shrink-0 rounded-md p-1.5 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400" title="Delete">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {c.services.map((s) => {
                const meta = SERVICES.find((x) => x.key === s)!;
                const Icon = meta.Icon;
                return (
                  <span key={s} className="inline-flex items-center gap-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-xs text-indigo-300">
                    <Icon className="h-3 w-3" /> {meta.label.split(" ")[0]}
                  </span>
                );
              })}
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-3">
              <span className="text-xs text-slate-500">{new Date(c.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
              <span className="text-sm font-semibold text-indigo-400">{fmtINR(c.grandTotal)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Table from md+ */}
      <div className="hidden overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-slate-800 bg-slate-950/40 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 py-3 text-left">Client</th>
                <th className="px-4 py-3 text-left">Company</th>
                <th className="px-4 py-3 text-left">Services</th>
                <th className="hidden px-4 py-3 text-left lg:table-cell">Date</th>
                <th className="px-4 py-3 text-right">Quote</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-500">{clients.length === 0 ? "No estimates yet. Create one from the New Estimate tab." : "No matches."}</td></tr>
              )}
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-slate-800/60 last:border-0 hover:bg-slate-950/30">
                  <td className="px-4 py-3 text-white">
                    <div className="font-medium">{c.lead.name}</div>
                    <div className="text-xs text-slate-500">{c.lead.email || "—"}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{c.lead.company}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {c.services.map((s) => {
                        const meta = SERVICES.find((x) => x.key === s)!;
                        const Icon = meta.Icon;
                        return (
                          <span key={s} className="inline-flex items-center gap-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-xs text-indigo-300">
                            <Icon className="h-3 w-3" /> {meta.label.split(" ")[0]}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-slate-400 lg:table-cell">{new Date(c.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</td>
                  <td className="px-4 py-3 text-right font-semibold text-indigo-400">{fmtINR(c.grandTotal)}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => onDelete(c.id)} className="rounded-md p-1.5 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export function Dashboard() {
  const { logout } = useAuth();
  const [tab, setTab] = useState<"new" | "saved">("new");
  const [clients, setClients] = useState<SavedClient[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE);
      if (raw) setClients(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE, JSON.stringify(clients)); } catch {}
  }, [clients]);

  const saveClient = (c: SavedClient) => setClients((prev) => [c, ...prev]);
  const deleteClient = (id: string) => setClients((prev) => prev.filter((c) => c.id !== id));

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <aside className="hidden w-56 flex-shrink-0 border-r border-slate-800 bg-slate-900/60 md:flex md:flex-col xl:w-64">
        <div className="flex items-center gap-3 border-b border-slate-800 px-4 py-5 xl:px-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-white">Creā Space</div>
            <div className="truncate text-xs text-slate-400">Pricing Console</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          <button onClick={() => setTab("new")}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${tab === "new" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-300 hover:bg-slate-800"}`}>
            <FilePlus className="h-4 w-4 shrink-0" /> <span className="truncate">New Estimate</span>
          </button>
          <button onClick={() => setTab("saved")}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${tab === "saved" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-300 hover:bg-slate-800"}`}>
            <FolderClock className="h-4 w-4 shrink-0" /> <span className="truncate">Saved Clients</span>
            <span className="ml-auto rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">{clients.length}</span>
          </button>
        </nav>

        <div className="border-t border-slate-800 p-3">
          <button onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 transition hover:bg-red-500/10 hover:text-red-400">
            <LogOut className="h-4 w-4 shrink-0" /> <span className="truncate">Log out</span>
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile header */}
        <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900/60 px-4 py-3 md:hidden">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="truncate font-semibold">Creā Space</span>
          </div>
          <button onClick={logout} className="shrink-0 rounded-md p-2 text-slate-400 hover:bg-slate-800 hover:text-white"><LogOut className="h-4 w-4" /></button>
        </header>

        <div className="flex gap-2 border-b border-slate-800 bg-slate-900/40 px-4 py-2 md:hidden">
          {(["new", "saved"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`rounded-md px-3 py-1.5 text-sm ${tab === t ? "bg-indigo-600 text-white" : "text-slate-300"}`}>
              {t === "new" ? "New Estimate" : `Saved (${clients.length})`}
            </button>
          ))}
        </div>

        <main className="flex-1 overflow-x-hidden p-3 sm:p-4 md:p-6 xl:p-8">
          <div className="mx-auto w-full max-w-7xl">
            <div className="mb-5 md:mb-6">
              <h1 className="text-xl font-bold text-white sm:text-2xl">
                {tab === "new" ? "Build a New Estimate" : "Client Records"}
              </h1>
              <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                {tab === "new" ? "Capture lead details, select services, and generate an itemized quote in ₹." : "Filter, review and manage historic estimates."}
              </p>
            </div>
            {tab === "new" ? <NewEstimate onSave={saveClient} /> : <SavedClients clients={clients} onDelete={deleteClient} />}
          </div>
        </main>
      </div>
    </div>
  );
}

