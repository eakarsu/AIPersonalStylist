import React from 'react';
import OutfitUsageChart from '../components/OutfitUsageChart';
import StyleHeatmap from '../components/StyleHeatmap';
import LookbookPdfPanel from '../components/LookbookPdfPanel';
import PreferenceRulesEditor from '../components/PreferenceRulesEditor';

export default function CustomViewsPage() {
  return (
    <div style={{ padding: 24, color: '#e5e7eb' }}>
      <header style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700 }}>Stylist Views</h1>
        <p style={{ color: '#9ca3af', marginTop: 6 }}>
          Custom dashboards and editors for your wardrobe insights, lookbook export, and style preferences.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 18 }}>
        <OutfitUsageChart />
        <StyleHeatmap />
        <LookbookPdfPanel />
        <div style={{ gridColumn: '1 / -1' }}>
          <PreferenceRulesEditor />
        </div>
      </div>
    </div>
  );
}
