import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FeaturePage from './pages/FeaturePage';
import Navbar from './components/Navbar';
import { FEATURES } from './config/features';
import OutfitGeneratorPage from './pages/OutfitGeneratorPage';
import SeasonalAnalysisPage from './pages/SeasonalAnalysisPage';
import StyleProfileWizardPage from './pages/StyleProfileWizardPage';
import CostPerWearPage from './pages/CostPerWearPage';
import WardrobePhotoPage from './pages/WardrobePhotoPage';
import AIRecommendationsPage from './pages/AIRecommendationsPage';

// // === Batch 06 Gaps & Frontend Mounts ===
import CFPhotoBasedOutfitGenerationPage from './pages/CFPhotoBasedOutfitGenerationPage';
import CFShoppingAdvisorPage from './pages/CFShoppingAdvisorPage';
import CFSustainabilityTrackingPage from './pages/CFSustainabilityTrackingPage';
import CFOccasionSpecificStylingPage from './pages/CFOccasionSpecificStylingPage';
import CFSocialStyleCollabPage from './pages/CFSocialStyleCollabPage';
import GapTheAiadvancedJsAndAiJsStubsNeedRealImplemPage from './pages/GapTheAiadvancedJsAndAiJsStubsNeedRealImplemPage';
import GapTrendsWithoutTrendPage from './pages/GapTrendsWithoutTrendPage';
import GapOccasionsWithoutOccasionPage from './pages/GapOccasionsWithoutOccasionPage';
import GapColorAnalysisWithoutSkinPage from './pages/GapColorAnalysisWithoutSkinPage';
import GapNoBodyTypeSizeTrackingForBetterFitRecommenPage from './pages/GapNoBodyTypeSizeTrackingForBetterFitRecommenPage';
import GapNoShoppingIntegrationLinkToRetailerApisPricPage from './pages/GapNoShoppingIntegrationLinkToRetailerApisPricPage';
import GapNoVirtualTryPage from './pages/GapNoVirtualTryPage';
import GapLimitedSocialFeaturesSharingOutfitsStyleInspPage from './pages/GapLimitedSocialFeaturesSharingOutfitsStyleInspPage';
import GapNoNotificationsLayerGrep0Page from './pages/GapNoNotificationsLayerGrep0Page';
import GapNoAuditLoggingGrep0Page from './pages/GapNoAuditLoggingGrep0Page';
import GapNoWebhooksPage from './pages/GapNoWebhooksPage';
import GapOnly9FrontendPagesDespite20RoutesPage from './pages/GapOnly9FrontendPagesDespite20RoutesPage';
function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading AI Personal Stylist...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          {FEATURES.map((f) => (
            <Route
              key={f.key}
              path={`/${f.key}`}
              element={<FeaturePage config={f} />}
            />
          ))}
          <Route path="/outfit-generator" element={<OutfitGeneratorPage />} />
          <Route path="/seasonal-analysis" element={<SeasonalAnalysisPage />} />
          <Route path="/style-profile-wizard" element={<StyleProfileWizardPage />} />
          <Route path="/cost-per-wear" element={<CostPerWearPage />} />
          <Route path="/wardrobe-photo" element={<WardrobePhotoPage />} />
          <Route path="/ai-recommendations" element={<AIRecommendationsPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        
          {/* // === Batch 06 Gaps & Frontend Mounts === */}
          <Route path="/cf-photo-based-outfit-generation" element={<CFPhotoBasedOutfitGenerationPage />} />
          <Route path="/cf-shopping-advisor" element={<CFShoppingAdvisorPage />} />
          <Route path="/cf-sustainability-tracking" element={<CFSustainabilityTrackingPage />} />
          <Route path="/cf-occasion-specific-styling" element={<CFOccasionSpecificStylingPage />} />
          <Route path="/cf-social-style-collab" element={<CFSocialStyleCollabPage />} />
          <Route path="/gap-the-aiadvanced-js-and-ai-js-stubs-need-real-implem" element={<GapTheAiadvancedJsAndAiJsStubsNeedRealImplemPage />} />
          <Route path="/gap-trends-without-trend" element={<GapTrendsWithoutTrendPage />} />
          <Route path="/gap-occasions-without-occasion" element={<GapOccasionsWithoutOccasionPage />} />
          <Route path="/gap-color-analysis-without-skin" element={<GapColorAnalysisWithoutSkinPage />} />
          <Route path="/gap-no-body-type-size-tracking-for-better-fit-recommen" element={<GapNoBodyTypeSizeTrackingForBetterFitRecommenPage />} />
          <Route path="/gap-no-shopping-integration-link-to-retailer-apis-pric" element={<GapNoShoppingIntegrationLinkToRetailerApisPricPage />} />
          <Route path="/gap-no-virtual-try" element={<GapNoVirtualTryPage />} />
          <Route path="/gap-limited-social-features-sharing-outfits-style-insp" element={<GapLimitedSocialFeaturesSharingOutfitsStyleInspPage />} />
          <Route path="/gap-no-notifications-layer-grep-0" element={<GapNoNotificationsLayerGrep0Page />} />
          <Route path="/gap-no-audit-logging-grep-0" element={<GapNoAuditLoggingGrep0Page />} />
          <Route path="/gap-no-webhooks" element={<GapNoWebhooksPage />} />
          <Route path="/gap-only-9-frontend-pages-despite-20-routes" element={<GapOnly9FrontendPagesDespite20RoutesPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
