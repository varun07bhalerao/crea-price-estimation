// Crea Space Pricing Matrix (INR)
// All numbers in ₹

export const fmtINR = (n: number) =>
  "₹" + Math.round(n).toLocaleString("en-IN");

// ---------- WEB DEVELOPMENT ----------
export const WEB_TYPES = {
  blogging: { label: "Blogging", base: 18000, perPage: 1200, basePages: 5 },
  ecommerce: { label: "E-Commerce", base: 65000, perPage: 2500, basePages: 8 },
  cms: { label: "CMS / WordPress", base: 30000, perPage: 1800, basePages: 6 },
  portfolio: { label: "Portfolio", base: 15000, perPage: 1000, basePages: 4 },
} as const;
export type WebType = keyof typeof WEB_TYPES;

export const HOSTING = {
  none: { label: "None", price: 0 },
  "1y": { label: "1 Year", price: 3500 },
  "2y": { label: "2 Years", price: 6500 },
  "3y": { label: "3 Years", price: 9000 },
} as const;
export const DOMAIN = {
  none: { label: "None", price: 0 },
  "1y": { label: "1 Year", price: 900 },
  "2y": { label: "2 Years", price: 1700 },
  "3y": { label: "3 Years", price: 2400 },
} as const;
export const SEO_INTEGRATION = {
  none: { label: "None", price: 0 },
  basic: { label: "Basic", price: 5000 },
  advanced: { label: "Advanced / On-Page", price: 15000 },
} as const;

export type WebInputs = {
  type: WebType;
  pages: number;
  hosting: keyof typeof HOSTING;
  domain: keyof typeof DOMAIN;
  seo: keyof typeof SEO_INTEGRATION;
};

export function calcWeb(i: WebInputs) {
  const t = WEB_TYPES[i.type];
  const extra = Math.max(0, i.pages - t.basePages) * t.perPage;
  const items = [
    { label: `${t.label} base (${t.basePages} pages)`, amount: t.base },
    { label: `Extra pages (${Math.max(0, i.pages - t.basePages)} × ${fmtINR(t.perPage)})`, amount: extra },
    { label: `Hosting — ${HOSTING[i.hosting].label}`, amount: HOSTING[i.hosting].price },
    { label: `Domain — ${DOMAIN[i.domain].label}`, amount: DOMAIN[i.domain].price },
    { label: `SEO Integration — ${SEO_INTEGRATION[i.seo].label}`, amount: SEO_INTEGRATION[i.seo].price },
  ].filter((x) => x.amount > 0 || x.label.includes("base"));
  const total = items.reduce((s, x) => s + x.amount, 0);
  return { items, total };
}

// ---------- APP DEVELOPMENT ----------
export const APP_PLATFORM = {
  ios: { label: "iOS (Native)", mult: 1.2, base: 120000 },
  android: { label: "Android (Native)", mult: 1.0, base: 100000 },
  cross: { label: "Cross-Platform (Flutter / RN)", mult: 1.4, base: 150000 },
} as const;
export const APP_COMPLEXITY = {
  simple: { label: "Simple (Informational)", mult: 1.0 },
  medium: { label: "Medium (CRUD + Auth)", mult: 1.6 },
  complex: { label: "Complex (Realtime / Marketplace)", mult: 2.4 },
} as const;
export const APP_MODULES = {
  pushNotifications: { label: "Push Notifications", price: 8000 },
  paymentGateway: { label: "Payment Gateway", price: 18000 },
  userProfiles: { label: "User Profiles & Auth", price: 12000 },
  adminDashboard: { label: "Admin Dashboard", price: 35000 },
  chat: { label: "In-App Chat", price: 22000 },
  analytics: { label: "Analytics Integration", price: 9000 },
} as const;

export type AppInputs = {
  platform: keyof typeof APP_PLATFORM;
  complexity: keyof typeof APP_COMPLEXITY;
  modules: Record<keyof typeof APP_MODULES, boolean>;
};

export function calcApp(i: AppInputs) {
  const p = APP_PLATFORM[i.platform];
  const c = APP_COMPLEXITY[i.complexity];
  const baseCost = p.base * c.mult;
  const items: { label: string; amount: number }[] = [
    { label: `${p.label} · ${c.label}`, amount: baseCost },
  ];
  (Object.keys(APP_MODULES) as (keyof typeof APP_MODULES)[]).forEach((k) => {
    if (i.modules[k]) items.push({ label: APP_MODULES[k].label, amount: APP_MODULES[k].price });
  });
  const total = items.reduce((s, x) => s + x.amount, 0);
  return { items, total };
}

// ---------- UI/UX DESIGN ----------
export const DESIGN_TOOL = {
  figma: { label: "Figma", mult: 1.0 },
  xd: { label: "Adobe XD", mult: 1.0 },
} as const;
export const DESIGN_COMPLEXITY = {
  minimalist: { label: "Minimalist", perScreen: 1200 },
  standard: { label: "Standard", perScreen: 2000 },
  premium: { label: "Premium / Motion", perScreen: 3500 },
} as const;

export type DesignInputs = {
  tool: keyof typeof DESIGN_TOOL;
  complexity: keyof typeof DESIGN_COMPLEXITY;
  screens: number;
};

export function calcDesign(i: DesignInputs) {
  const c = DESIGN_COMPLEXITY[i.complexity];
  const subtotal = c.perScreen * i.screens * DESIGN_TOOL[i.tool].mult;
  const items = [
    {
      label: `${DESIGN_TOOL[i.tool].label} · ${c.label} · ${i.screens} screens × ${fmtINR(c.perScreen)}`,
      amount: subtotal,
    },
  ];
  return { items, total: subtotal };
}

// ---------- DIGITAL MARKETING / SEO ----------
export const SEO_SCOPE = {
  local: { label: "Local SEO", monthly: 12000 },
  national: { label: "National SEO", monthly: 25000 },
  ecommerce: { label: "E-Commerce SEO", monthly: 40000 },
} as const;
export const CONTENT_PACK = {
  none: { label: "No content", monthly: 0 },
  basic: { label: "8 posts / month", monthly: 6000 },
  standard: { label: "16 posts / month", monthly: 11000 },
  premium: { label: "30 posts / month", monthly: 18000 },
} as const;
export const RETAINER = {
  "1": { label: "Month-to-month", months: 1, discount: 0 },
  "3": { label: "3-month contract", months: 3, discount: 0.05 },
  "6": { label: "6-month contract", months: 6, discount: 0.1 },
  "12": { label: "12-month contract", months: 12, discount: 0.18 },
} as const;

export type SeoInputs = {
  scope: keyof typeof SEO_SCOPE;
  content: keyof typeof CONTENT_PACK;
  retainer: keyof typeof RETAINER;
};

export function calcSeo(i: SeoInputs) {
  const monthly = SEO_SCOPE[i.scope].monthly + CONTENT_PACK[i.content].monthly;
  const r = RETAINER[i.retainer];
  const gross = monthly * r.months;
  const discount = gross * r.discount;
  const total = gross - discount;
  const items = [
    { label: `${SEO_SCOPE[i.scope].label} (${fmtINR(SEO_SCOPE[i.scope].monthly)}/mo)`, amount: SEO_SCOPE[i.scope].monthly * r.months },
    { label: `Content — ${CONTENT_PACK[i.content].label}`, amount: CONTENT_PACK[i.content].monthly * r.months },
  ].filter((x) => x.amount > 0);
  if (discount > 0) items.push({ label: `${r.label} discount (-${Math.round(r.discount * 100)}%)`, amount: -discount });
  return { items, total, monthly, months: r.months };
}

// ---------- ADS (META / GOOGLE) ----------
export const AD_PLATFORM = {
  meta: { label: "Meta Ads", setup: 8000 },
  google: { label: "Google Ads", setup: 10000 },
  both: { label: "Meta + Google", setup: 16000 },
} as const;

export type AdsInputs = {
  platform: keyof typeof AD_PLATFORM;
  monthlyBudget: number; // client's ad spend
  managementPct: number; // % of ad spend
  months: number;
};

export function calcAds(i: AdsInputs) {
  const setup = AD_PLATFORM[i.platform].setup;
  const flatMgmt = 7000 * i.months; // flat campaign management
  const pctMgmt = i.monthlyBudget * (i.managementPct / 100) * i.months;
  const items = [
    { label: `${AD_PLATFORM[i.platform].label} — Setup`, amount: setup },
    { label: `Flat campaign management (${i.months} mo × ₹7,000)`, amount: flatMgmt },
    { label: `Agency premium (${i.managementPct}% of ₹${i.monthlyBudget.toLocaleString("en-IN")} × ${i.months} mo)`, amount: pctMgmt },
  ];
  const total = items.reduce((s, x) => s + x.amount, 0);
  return { items, total };
}
