import React from 'react';
import { NavLink } from 'react-router-dom';

const LINKS = [
  { to: "/outfit-generator", label: "Outfit Generator Page" },
  { to: "/seasonal-analysis", label: "Seasonal Analysis Page" },
  { to: "/style-profile-wizard", label: "Style Profile Wizard Page" },
  { to: "/cost-per-wear", label: "Cost Per Wear Page" },
  { to: "/wardrobe-photo", label: "Wardrobe Photo Page" },
  { to: "/ai-recommendations", label: "AIRecommendations Page" },
  { to: "/custom-views", label: "Custom Views Page" },
  { to: "/cf-photo-based-outfit-generation", label: "CFPhoto Based Outfit Generation Page" },
  { to: "/cf-shopping-advisor", label: "CFShopping Advisor Page" },
  { to: "/cf-sustainability-tracking", label: "CFSustainability Tracking Page" },
  { to: "/cf-occasion-specific-styling", label: "CFOccasion Specific Styling Page" },
  { to: "/cf-social-style-collab", label: "CFSocial Style Collab Page" },
  { to: "/gap-the-aiadvanced-js-and-ai-js-stubs-need-real-implem", label: "Gap The Aiadvanced Js And Ai Js Stubs Need Real Implem Page" },
  { to: "/gap-trends-without-trend", label: "Gap Trends Without Trend Page" },
  { to: "/gap-occasions-without-occasion", label: "Gap Occasions Without Occasion Page" },
  { to: "/gap-color-analysis-without-skin", label: "Gap Color Analysis Without Skin Page" },
  { to: "/gap-no-body-type-size-tracking-for-better-fit-recommen", label: "Gap No Body Type Size Tracking For Better Fit Recommen Page" },
  { to: "/gap-no-shopping-integration-link-to-retailer-apis-pric", label: "Gap No Shopping Integration Link To Retailer Apis Pric Page" },
  { to: "/gap-no-virtual-try", label: "Gap No Virtual Try Page" },
  { to: "/gap-limited-social-features-sharing-outfits-style-insp", label: "Gap Limited Social Features Sharing Outfits Style Insp Page" },
  { to: "/gap-no-notifications-layer-grep-0", label: "Gap No Notifications Layer Grep0 Page" },
  { to: "/gap-no-audit-logging-grep-0", label: "Gap No Audit Logging Grep0 Page" },
  { to: "/gap-no-webhooks", label: "Gap No Webhooks Page" },
  { to: "/gap-only-9-frontend-pages-despite-20-routes", label: "Gap Only9 Frontend Pages Despite20 Routes Page" },
];

const CSS = `
.app-shell{display:grid;grid-template-columns:264px 1fr;min-height:100vh}
.sidebar{background:#0b1220;color:#fff;padding:22px 14px;position:sticky;top:0;height:100vh;overflow:auto;display:flex;flex-direction:column;gap:6px}
.sidebar-brand{padding:6px 10px 16px;border-bottom:1px solid #ffffff18;margin-bottom:10px}
.sidebar-brand .eyebrow{text-transform:uppercase;letter-spacing:.16em;font-size:11px;font-weight:800;color:#7dd3fc}
.sidebar-brand h1{font-size:17px;margin:8px 0 0;line-height:1.25;word-break:break-word}
.sidebar-nav{display:flex;flex-direction:column;gap:2px;flex:1;overflow:auto}
.sidebar-nav a{display:block;border-radius:10px;color:#94a3b8;padding:9px 12px;text-decoration:none;font-weight:600;font-size:13.5px}
.sidebar-nav a:hover{background:#ffffff12;color:#fff}
.sidebar-nav a.active{background:#2563eb;color:#fff}
.sidebar-foot{margin-top:12px;padding-top:12px;border-top:1px solid #ffffff18;display:flex;flex-direction:column;gap:8px}
.sidebar-user{font-size:12px;color:#cbd5e1}
.sidebar-logout{border:0;border-radius:10px;padding:10px 12px;font-weight:800;cursor:pointer;background:#1e293b;color:#e2e8f0}
.sidebar-logout:hover{background:#334155}
@media(max-width:900px){.app-shell{grid-template-columns:1fr}.sidebar{position:relative;height:auto}}
`;

export default function Sidebar({ user, onLogout }) {
  return (
    <>
      <style>{CSS}</style>
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="eyebrow">Sidebar app</span>
          <h1>AIPersonalStylist</h1>
        </div>
        <nav className="sidebar-nav">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-foot">
          {user && <span className="sidebar-user">{user.name || user.email || 'Signed in'}</span>}
          <button className="sidebar-logout" onClick={onLogout}>Logout</button>
        </div>
      </aside>
    </>
  );
}
