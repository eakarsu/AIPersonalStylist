import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FEATURES } from '../config/features';
import './AppSidebar.css';

const LINKS = [
  { to: '/insights/timeline', label: 'Timeline View', group: 'Insights' },
  { to: '/codex/custom-viz', label: 'Custom Viz', group: 'Insights' },
  { to: '/codex/operations', label: 'Operations', group: 'Insights' },
  { to: '/', label: 'Dashboard', group: 'Workspace' },
  { to: '/outfit-generator', label: 'Outfit Generator', group: 'Workspace' },
  { to: '/seasonal-analysis', label: 'Seasonal Analysis', group: 'Workspace' },
  { to: '/style-profile-wizard', label: 'Style Profile Wizard', group: 'Workspace' },
  { to: '/cost-per-wear', label: 'Cost Per Wear', group: 'Workspace' },
  { to: '/wardrobe-photo', label: 'Wardrobe Photo', group: 'Workspace' },
  { to: '/ai-recommendations', label: 'AI Recommendations', group: 'Workspace' },
  { to: '/custom-views', label: 'Custom Views', group: 'Workspace' },
  { to: '/cf-photo-based-outfit-generation', label: 'CF Photo Based Outfit Generation', group: 'Workspace' },
  { to: '/cf-shopping-advisor', label: 'CF Shopping Advisor', group: 'Workspace' },
  { to: '/cf-sustainability-tracking', label: 'CF Sustainability Tracking', group: 'Workspace' },
  { to: '/cf-occasion-specific-styling', label: 'CF Occasion Specific Styling', group: 'Workspace' },
  { to: '/cf-social-style-collab', label: 'CF Social Style Collab', group: 'Workspace' },
  { to: '/gap-the-aiadvanced-js-and-ai-js-stubs-need-real-implem', label: 'Gap The Aiadvanced Js And Ai Js Stubs Need Real Implem', group: 'Workspace' },
  { to: '/gap-trends-without-trend', label: 'Gap Trends Without Trend', group: 'Workspace' },
  { to: '/gap-occasions-without-occasion', label: 'Gap Occasions Without Occasion', group: 'Workspace' },
  { to: '/gap-color-analysis-without-skin', label: 'Gap Color Analysis Without Skin', group: 'Workspace' },
  { to: '/gap-no-body-type-size-tracking-for-better-fit-recommen', label: 'Gap No Body Type Size Tracking For Better Fit Recommen', group: 'Workspace' },
  { to: '/gap-no-shopping-integration-link-to-retailer-apis-pric', label: 'Gap No Shopping Integration Link To Retailer Apis Pric', group: 'Workspace' },
  { to: '/gap-no-virtual-try', label: 'Gap No Virtual Try', group: 'Workspace' },
  { to: '/gap-limited-social-features-sharing-outfits-style-insp', label: 'Gap Limited Social Features Sharing Outfits Style Insp', group: 'Workspace' },
  { to: '/gap-no-notifications-layer-grep-0', label: 'Gap No Notifications Layer Grep0', group: 'Workspace' },
  { to: '/gap-no-audit-logging-grep-0', label: 'Gap No Audit Logging Grep0', group: 'Workspace' },
  { to: '/gap-no-webhooks', label: 'Gap No Webhooks', group: 'Workspace' },
  { to: '/gap-only-9-frontend-pages-despite-20-routes', label: 'Gap Only9 Frontend Pages Despite20 Routes', group: 'Workspace' },
  ...FEATURES.map(feature => ({ to: `/${feature.key}`, label: feature.title, group: 'Workspace' })),
];

export default function AppSidebar() {
  const [query, setQuery] = useState('');
  const visible = LINKS.filter(link => link.label.toLowerCase().includes(query.toLowerCase().trim()));
  return <aside className="codex-side" aria-label="Application navigation">
    <div className="codex-side-brand"><strong>AIPersonal Stylist</strong><span>Workspace</span></div>
    <label className="codex-side-search-label" htmlFor="codex-side-search">Find a section</label>
    <input id="codex-side-search" className="codex-side-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search navigation" />
    <nav className="codex-side-links" aria-label="Sections">
      {['Workspace', 'AI tools', 'Insights'].map(group => {
        const items = visible.filter(link => link.group === group);
        return items.length ? <div className="codex-side-group" key={group}>
          <span className="codex-side-heading">{group}</span>
          {items.map(link => <NavLink key={link.to} to={link.to} end={link.to === '/'} className={({ isActive }) => `codex-side-link${isActive ? ' active' : ''}`}>{link.label}</NavLink>)}
        </div> : null;
      })}
      {visible.length === 0 && <p className="codex-side-empty">No matching sections</p>}
    </nav>
  </aside>;
}
