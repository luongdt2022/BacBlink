import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { RequireAuth, useAuth } from '@/app/providers/AuthProvider';
import { useApp } from '@/app/providers/AppProvider';
import { RootLayout } from '@/app/layouts/RootLayout';

// ─── Pages ────────────────────────────────────────────────────────────────────
import { MarketplacePage } from '@/features/marketplace/pages/MarketplacePage';
import { MarketplaceIPDetailPage } from '@/features/marketplace/pages/MarketplaceIPDetailPage';
import { ChallengeDetailPage } from '@/features/marketplace/pages/ChallengeDetailPage';
// import { DealRoomPage } from '@/features/deal-room/pages/DealRoomPage';
// Hidden until these sections are ready for use:
// import { InfrastructurePage } from '@/features/infrastructure/pages/InfrastructurePage';
// import { EquipmentDetailPage } from '@/features/infrastructure/pages/EquipmentDetailPage';
// import { MyRequestsPage } from '@/features/infrastructure/pages/MyRequestsPage';
// import { MyAssetsPage } from '@/features/infrastructure/pages/MyAssetsPage';
// import { CreateAssetPage } from '@/features/infrastructure/pages/CreateAssetPage';
// import { ManageRentalRequestsPage } from '@/features/infrastructure/pages/ManageRentalRequestsPage';
// import { OwnerEquipmentDetailPage } from '@/features/infrastructure/pages/OwnerEquipmentDetailPage';
// import { ValuationListPage } from '@/features/valuation/pages/ValuationListPage';
// import { CreateValuationPage } from '@/features/valuation/pages/CreateValuationPage';
// import { ValuationDetailPage } from '@/features/valuation/pages/ValuationDetailPage';
// import { IPConsultingPage } from '@/features/services/pages/IPConsultingPage';
import { ContactPage } from '@/features/contact/pages/ContactPage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { VerifyEmailPage } from '@/features/auth/pages/VerifyEmailPage';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage';
// import { InnovationAssessmentPage } from '@/features/services/pages/InnovationAssessmentPage';
// import { CreateAssessmentPage } from '@/features/services/pages/CreateAssessmentPage';
// import { TechExpertPage } from '@/features/services/pages/TechExpertPage';
// import { CreateTechExpertRequestPage } from '@/features/services/pages/CreateTechExpertRequestPage';
// import { OperationExpertPage } from '@/features/services/pages/OperationExpertPage';
// import { CreateOperationExpertRequestPage } from '@/features/services/pages/CreateOperationExpertRequestPage';
// import { TrainingPage } from '@/features/services/pages/TrainingPage';
// import { CreateTrainingRequestPage } from '@/features/services/pages/CreateTrainingRequestPage';
// import { ServicePricingPage } from '@/features/services/pages/ServicePricingPage';
// import { ServicePaymentPage } from '@/features/services/pages/ServicePaymentPage';
// import { ServiceSuccessPage } from '@/features/services/pages/ServiceSuccessPage';
// import { ProposeCollaborationPage } from '@/features/marketplace/pages/ProposeCollaborationPage';
// import { NegotiateTechnologyPage } from '@/features/marketplace/pages/NegotiateTechnologyPage';
// import { RegisterTrialPage } from '@/features/marketplace/pages/RegisterTrialPage';
// (ProposeCollaboration, Negotiate, RegisterTrial pages kept hidden until API integration is ready)
import { IntakesPage } from '@/features/intakes/pages/IntakesPage';
import { CreateIpPage } from '@/features/intakes/pages/CreateIpPage';
import { CreateChallengePage } from '@/features/intakes/pages/CreateChallengePage';
import { IpDetailPage } from '@/features/intakes/pages/IpDetailPage';
import { ChallengeDetailPage as IntakeChallengeDetailPage } from '@/features/intakes/pages/ChallengeDetailPage';
import { IpEditPage } from '@/features/intakes/pages/IpEditPage';
import { ChallengeEditPage } from '@/features/intakes/pages/ChallengeEditPage';
import { SettingsPage } from '@/features/settings/pages/SettingsPage';
import { CollaborationRequestsPage } from '@/features/collaboration/pages/CollaborationRequestsPage';
import { StoriesPage } from '@/features/stories/pages/StoriesPage';
import { CreateStoryPage } from '@/features/stories/pages/CreateStoryPage';
import { EditStoryPage } from '@/features/stories/pages/EditStoryPage';
import { StoryDetailPage } from '@/features/stories/pages/StoryDetailPage';

// ─── Route Wrappers ─────────────────────────────────────────────────────────────
// Each wrapper injects the required props that the original routes.tsx defined.

/*
 * Hidden unused sections. Keep the route wrappers commented so direct URLs do
 * not mount these screens and their in-progress props are not typechecked.
function MarketplaceRouteWrapper() {
  const navigate = useNavigate();
  return (
    <MarketplacePage
      onViewIPDetail={(id) => navigate(`/marketplace/ip/${id}`)}
      onViewChallengeDetail={(id) => navigate(`/marketplace/challenge/${id}`)}
      onNavigate={(id) => {
        const paths: Record<string, string> = { marketplace: '/marketplace' };
        if (paths[id]) navigate(paths[id]);
      }}
      onActionClick={(id, action) => {
        if (action === 'propose-collaboration') navigate(`/marketplace/propose/${id}`);
        else if (action === 'negotiate') navigate(`/marketplace/negotiate/${id}`);
        else if (action === 'register-trial') navigate(`/marketplace/trial/${id}`);
      }}
    />
  );
}

function MarketplaceIPDetailRouteWrapper() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  if (!id) return <Navigate to="/marketplace" replace />;
  return (
    <MarketplaceIPDetailPage
      ipId={id}
      onBack={() => navigate('/marketplace')}
      onOpenDealRoom={() => navigate('/deal-room')}
      onNavigate={(itemId) => {
        const paths: Record<string, string> = { marketplace: '/marketplace', 'deal-room': '/deal-room' };
        if (paths[itemId]) navigate(paths[itemId]);
      }}
    />
  );
}

function MarketplaceChallengeDetailRouteWrapper() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const app = useApp();
  if (!id) return <Navigate to="/marketplace" replace />;
  return (
    <ChallengeDetailPage
      challengeId={id}
      onBack={() => navigate('/marketplace')}
      onSubmitProposal={() => {
        app.openProposalModal({
          challengeId: id,
          enterpriseName: id === '1' ? 'Tập đoàn Dệt May Việt Nam' : 'VinCommerce',
        });
      }}
      onNavigate={(itemId) => {
        const paths: Record<string, string> = { marketplace: '/marketplace' };
        if (paths[itemId]) navigate(paths[itemId]);
      }}
    />
  );
}

function ProposeRouteWrapper() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  if (!id) return <Navigate to="/marketplace" replace />;
  return (
    <ProposeCollaborationPage
      technologyId={id}
      technologyName={undefined}
      onNavigate={(itemId) => {
        const paths: Record<string, string> = { marketplace: '/marketplace' };
        if (paths[itemId]) navigate(paths[itemId]);
      }}
      onBack={() => navigate('/marketplace')}
      onSuccess={() => navigate('/marketplace')}
    />
  );
}

function NegotiateRouteWrapper() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  if (!id) return <Navigate to="/marketplace" replace />;
  return (
    <NegotiateTechnologyPage
      technologyId={id}
      technologyName={undefined}
      onNavigate={(itemId) => {
        const paths: Record<string, string> = { marketplace: '/marketplace' };
        if (paths[itemId]) navigate(paths[itemId]);
      }}
      onBack={() => navigate('/marketplace')}
      onSuccess={() => navigate('/marketplace')}
    />
  );
}

function RegisterTrialRouteWrapper() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  if (!id) return <Navigate to="/marketplace" replace />;
  return (
    <RegisterTrialPage
      technologyId={id}
      technologyName={undefined}
      onNavigate={(itemId) => {
        const paths: Record<string, string> = { marketplace: '/marketplace' };
        if (paths[itemId]) navigate(paths[itemId]);
      }}
      onBack={() => navigate('/marketplace')}
      onSuccess={() => navigate('/marketplace')}
    />
  );
}

function DealRoomRouteWrapper() {
  const navigate = useNavigate();
  return (
    <DealRoomPage
      onNavigate={(id) => {
        const paths: Record<string, string> = { 'deal-room': '/deal-room', marketplace: '/marketplace' };
        if (paths[id]) navigate(paths[id]);
      }}
    />
  );
}

function InfrastructureRouteWrapper() {
  const navigate = useNavigate();
  return (
    <InfrastructurePage
      onNavigate={(id) => {
        const paths: Record<string, string> = {
          infrastructure: '/infrastructure',
          'my-requests': '/infrastructure/requests',
          'my-assets': '/infrastructure/assets',
        };
        if (paths[id]) navigate(paths[id]);
      }}
      onViewDetail={(id) => navigate(`/infrastructure/equipment/${id}`)}
      onViewMyRequests={() => navigate('/infrastructure/requests')}
      onViewMyAssets={() => navigate('/infrastructure/assets')}
      onCreateAsset={() => navigate('/infrastructure/assets/create')}
      onManageRentalRequests={() => navigate('/infrastructure/rentals')}
      onViewOwnerEquipmentDetail={(id) => navigate(`/infrastructure/owner-equipment/${id}`)}
    />
  );
}

function EquipmentDetailRouteWrapper() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  if (!id) return <Navigate to="/infrastructure" replace />;
  return (
    <EquipmentDetailPage
      equipmentId={id}
      onBack={() => navigate('/infrastructure')}
      onNavigate={(itemId) => {
        const paths: Record<string, string> = { infrastructure: '/infrastructure' };
        if (paths[itemId]) navigate(paths[itemId]);
      }}
    />
  );
}

function MyRequestsRouteWrapper() {
  const navigate = useNavigate();
  return (
    <MyRequestsPage
      onBack={() => navigate('/infrastructure')}
      onNavigate={(id) => {
        const paths: Record<string, string> = { infrastructure: '/infrastructure' };
        if (paths[id]) navigate(paths[id]);
      }}
    />
  );
}

function MyAssetsRouteWrapper() {
  const navigate = useNavigate();
  return (
    <MyAssetsPage
      onBack={() => navigate('/infrastructure')}
      onCreateAsset={() => navigate('/infrastructure/assets/create')}
      onNavigate={(id) => {
        const paths: Record<string, string> = { infrastructure: '/infrastructure' };
        if (paths[id]) navigate(paths[id]);
      }}
    />
  );
}

function CreateAssetRouteWrapper() {
  const navigate = useNavigate();
  return (
    <CreateAssetPage
      onBack={() => navigate('/infrastructure')}
      onNavigate={(id) => {
        const paths: Record<string, string> = { infrastructure: '/infrastructure' };
        if (paths[id]) navigate(paths[id]);
      }}
    />
  );
}

function ManageRentalsRouteWrapper() {
  const navigate = useNavigate();
  return (
    <ManageRentalRequestsPage
      onBack={() => navigate('/infrastructure')}
      onNavigate={(id) => {
        const paths: Record<string, string> = { infrastructure: '/infrastructure' };
        if (paths[id]) navigate(paths[id]);
      }}
    />
  );
}

function OwnerEquipmentDetailRouteWrapper() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  if (!id) return <Navigate to="/infrastructure" replace />;
  return (
    <OwnerEquipmentDetailPage
      equipmentId={id}
      onBack={() => navigate('/infrastructure')}
      onNavigate={(itemId) => {
        const paths: Record<string, string> = { infrastructure: '/infrastructure' };
        if (paths[itemId]) navigate(paths[itemId]);
      }}
    />
  );
}

function ValuationListRouteWrapper() {
  const navigate = useNavigate();
  return (
    <ValuationListPage
      onNavigate={(id) => {
        const paths: Record<string, string> = { 'service-valuation': '/valuation' };
        if (paths[id]) navigate(paths[id]);
      }}
      onCreateValuation={() => navigate('/valuation/create')}
      onEdit={(id) => navigate(`/valuation/${id}/edit`)}
      onViewDetail={(id) => navigate(`/valuation/${id}`)}
    />
  );
}

function ValuationDetailRouteWrapper() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  if (!id) return <Navigate to="/valuation" replace />;
  return (
    <ValuationDetailPage
      valuationId={id}
      onBack={() => navigate('/valuation')}
      onNavigate={(itemId) => {
        const paths: Record<string, string> = { 'service-valuation': '/valuation' };
        if (paths[itemId]) navigate(paths[itemId]);
      }}
    />
  );
}

function CreateValuationRouteWrapper() {
  const navigate = useNavigate();
  return (
    <CreateValuationPage
      onBack={() => navigate('/valuation')}
      onComplete={() => navigate('/valuation')}
      onNavigate={(id) => {
        const paths: Record<string, string> = { 'service-valuation': '/valuation' };
        if (paths[id]) navigate(paths[id]);
      }}
    />
  );
}

function EditValuationRouteWrapper() {
  const navigate = useNavigate();
  return (
    <CreateValuationPage
      onBack={() => navigate('/valuation')}
      onComplete={() => navigate('/valuation')}
      onNavigate={(id) => {
        const paths: Record<string, string> = { 'service-valuation': '/valuation' };
        if (paths[id]) navigate(paths[id]);
      }}
      editData={null}
    />
  );
}

function IPConsultingRouteWrapper() {
  const navigate = useNavigate();
  return (
    <IPConsultingPage
      onNavigate={(id) => {
        const paths: Record<string, string> = {
          'service-ip-consulting': '/services/ip-consulting',
          contact: '/contact',
        };
        if (paths[id]) navigate(paths[id]);
      }}
      onContactClick={() => navigate('/contact')}
      onRegisterService={() => navigate('/services/pricing')}
    />
  );
}

function InnovationAssessmentRouteWrapper() {
  const navigate = useNavigate();
  return (
    <InnovationAssessmentPage
      onNavigate={(id) => {
        const paths: Record<string, string> = {
          'service-innovation-assessment': '/services/innovation-assessment',
        };
        if (paths[id]) navigate(paths[id]);
      }}
      onCreate={() => navigate('/services/innovation-assessment/create')}
    />
  );
}

function CreateAssessmentRouteWrapper() {
  const navigate = useNavigate();
  return (
    <CreateAssessmentPage
      onBack={() => navigate('/services/innovation-assessment')}
      onComplete={() => navigate('/services/innovation-assessment')}
      onNavigate={(id) => {
        const paths: Record<string, string> = {
          'service-innovation-assessment': '/services/innovation-assessment',
        };
        if (paths[id]) navigate(paths[id]);
      }}
    />
  );
}

function TechExpertRouteWrapper() {
  const navigate = useNavigate();
  return (
    <TechExpertPage
      onNavigate={(id) => {
        const paths: Record<string, string> = { 'service-tech-expert': '/services/tech-expert' };
        if (paths[id]) navigate(paths[id]);
      }}
      onCreate={() => navigate('/services/tech-expert/create')}
    />
  );
}

function CreateTechExpertRouteWrapper() {
  const navigate = useNavigate();
  return (
    <CreateTechExpertRequestPage
      onBack={() => navigate('/services/tech-expert')}
      onSuccess={() => navigate('/services/tech-expert')}
      onNavigate={(id) => {
        const paths: Record<string, string> = { 'service-tech-expert': '/services/tech-expert' };
        if (paths[id]) navigate(paths[id]);
      }}
    />
  );
}

function OperationExpertRouteWrapper() {
  const navigate = useNavigate();
  return (
    <OperationExpertPage
      onNavigate={(id) => {
        const paths: Record<string, string> = { 'service-operation-expert': '/services/operation-expert' };
        if (paths[id]) navigate(paths[id]);
      }}
      onCreate={() => navigate('/services/operation-expert/create')}
    />
  );
}

function CreateOperationExpertRouteWrapper() {
  const navigate = useNavigate();
  return (
    <CreateOperationExpertRequestPage
      onBack={() => navigate('/services/operation-expert')}
      onSuccess={() => navigate('/services/operation-expert')}
      onNavigate={(id) => {
        const paths: Record<string, string> = { 'service-operation-expert': '/services/operation-expert' };
        if (paths[id]) navigate(paths[id]);
      }}
    />
  );
}

function TrainingRouteWrapper() {
  const navigate = useNavigate();
  return (
    <TrainingPage
      onNavigate={(id) => {
        const paths: Record<string, string> = { 'service-training': '/services/training' };
        if (paths[id]) navigate(paths[id]);
      }}
      onCreate={() => navigate('/services/training/create')}
    />
  );
}

function CreateTrainingRouteWrapper() {
  const navigate = useNavigate();
  return (
    <CreateTrainingRequestPage
      onBack={() => navigate('/services/training')}
      onComplete={() => navigate('/services/training')}
      onNavigate={(id) => {
        const paths: Record<string, string> = { 'service-training': '/services/training' };
        if (paths[id]) navigate(paths[id]);
      }}
    />
  );
}

function ServicePricingRouteWrapper() {
  const navigate = useNavigate();
  const app = useApp();
  return (
    <ServicePricingPage
      onNavigate={(id) => {
        const paths: Record<string, string> = { 'service-pricing': '/services/pricing' };
        if (paths[id]) navigate(paths[id]);
      }}
      onSelectPackage={(pkgId) => {
        app.setSelectedPackageId(pkgId);
        navigate('/services/payment');
      }}
    />
  );
}

function ServicePaymentRouteWrapper() {
  const navigate = useNavigate();
  const app = useApp();
  return (
    <ServicePaymentPage
      packageId={app.selectedPackageId}
      onNavigate={(id) => {
        const paths: Record<string, string> = { 'service-payment': '/services/payment' };
        if (paths[id]) navigate(paths[id]);
      }}
      onPaymentSuccess={() => navigate('/services/success')}
    />
  );
}

function ServiceSuccessRouteWrapper() {
  const navigate = useNavigate();
  const app = useApp();
  return (
    <ServiceSuccessPage
      packageId={app.selectedPackageId}
      onNavigate={(id) => {
        const paths: Record<string, string> = { 'service-success': '/services/success' };
        if (paths[id]) navigate(paths[id]);
      }}
      onGoHome={() => navigate('/ips')}
    />
  );
}
*/

// ─── Marketplace & Deal Room ──────────────────────────────────────────────────

function MarketplaceRouteWrapper() {
  const navigate = useNavigate();
  return (
    <MarketplacePage
      onViewIPDetail={(id) => navigate(`/marketplace/ip/${id}`)}
      onViewChallengeDetail={(id) => navigate(`/marketplace/challenge/${id}`)}
      onNavigate={(id) => {
        const paths: Record<string, string> = { marketplace: '/marketplace' };
        if (paths[id]) navigate(paths[id]);
      }}
      onActionClick={(id, action) => {
        if (action === 'propose-collaboration') navigate(`/marketplace/propose/${id}`);
        else if (action === 'negotiate') navigate(`/marketplace/negotiate/${id}`);
        else if (action === 'register-trial') navigate(`/marketplace/trial/${id}`);
      }}
    />
  );
}

function MarketplaceIPDetailRouteWrapper() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  if (!id) return <Navigate to="/marketplace" replace />;
  return (
    <MarketplaceIPDetailPage
      ipId={id}
      onBack={() => navigate('/marketplace')}
      onOpenDealRoom={() => navigate('/deal-room')}
      onNavigate={(itemId) => {
        const paths: Record<string, string> = { marketplace: '/marketplace', 'deal-room': '/deal-room' };
        if (paths[itemId]) navigate(paths[itemId]);
      }}
    />
  );
}

function MarketplaceChallengeDetailRouteWrapper() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const app = useApp();
  if (!id) return <Navigate to="/marketplace" replace />;
  return (
    <ChallengeDetailPage
      challengeId={id}
      onBack={() => navigate('/marketplace')}
      onSubmitProposal={() => {
        app.openProposalModal({
          challengeId: id,
          enterpriseName: id === '1' ? 'Tập đoàn Dệt May Việt Nam' : 'VinCommerce',
        });
      }}
      onNavigate={(itemId) => {
        const paths: Record<string, string> = { marketplace: '/marketplace' };
        if (paths[itemId]) navigate(paths[itemId]);
      }}
    />
  );
}

function ContactRouteWrapper() {
  const navigate = useNavigate();
  return (
    <ContactPage
      onNavigate={(id) => {
        const paths: Record<string, string> = { contact: '/contact' };
        if (paths[id]) navigate(paths[id]);
      }}
    />
  );
}

function SettingsRouteWrapper() {
  return <SettingsPage />;
}

function IpsRouteWrapper() {
  return <IntakesPage forcedType="ip" namespace="ips" />;
}

function ChallengesRouteWrapper() {
  return <IntakesPage forcedType="challenge" namespace="challenges" />;
}

function FallbackRouteWrapper() {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? '/ips' : '/login'} replace />;
}

// ─── Route definitions ────────────────────────────────────────────────────────
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/activate-account" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route
        path="/"
        element={
          <RequireAuth>
            <RootLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/ips" replace />} />

        {/*
          Hidden until these sections are ready for use:

          <Route path="marketplace" element={<MarketplaceRouteWrapper />} />
          <Route path="marketplace/ip/:id" element={<MarketplaceIPDetailRouteWrapper />} />
          <Route path="marketplace/challenge/:id" element={<MarketplaceChallengeDetailRouteWrapper />} />
          <Route path="marketplace/propose/:id" element={<ProposeRouteWrapper />} />
          <Route path="marketplace/negotiate/:id" element={<NegotiateRouteWrapper />} />
          <Route path="marketplace/trial/:id" element={<RegisterTrialRouteWrapper />} />

          <Route path="deal-room" element={<DealRoomRouteWrapper />} />

          <Route path="infrastructure" element={<InfrastructureRouteWrapper />} />
          <Route path="infrastructure/equipment/:id" element={<EquipmentDetailRouteWrapper />} />
          <Route path="infrastructure/requests" element={<MyRequestsRouteWrapper />} />
          <Route path="infrastructure/assets" element={<MyAssetsRouteWrapper />} />
          <Route path="infrastructure/assets/create" element={<CreateAssetRouteWrapper />} />
          <Route path="infrastructure/rentals" element={<ManageRentalsRouteWrapper />} />
          <Route path="infrastructure/owner-equipment/:id" element={<OwnerEquipmentDetailRouteWrapper />} />

          <Route path="valuation" element={<ValuationListRouteWrapper />} />
          <Route path="valuation/create" element={<CreateValuationRouteWrapper />} />
          <Route path="valuation/:id" element={<ValuationDetailRouteWrapper />} />
          <Route path="valuation/:id/edit" element={<EditValuationRouteWrapper />} />

          <Route path="services/ip-consulting" element={<IPConsultingRouteWrapper />} />
          <Route path="services/innovation-assessment" element={<InnovationAssessmentRouteWrapper />} />
          <Route path="services/innovation-assessment/create" element={<CreateAssessmentRouteWrapper />} />
          <Route path="services/tech-expert" element={<TechExpertRouteWrapper />} />
          <Route path="services/tech-expert/create" element={<CreateTechExpertRouteWrapper />} />
          <Route path="services/operation-expert" element={<OperationExpertRouteWrapper />} />
          <Route path="services/operation-expert/create" element={<CreateOperationExpertRouteWrapper />} />
          <Route path="services/training" element={<TrainingRouteWrapper />} />
          <Route path="services/training/create" element={<CreateTrainingRouteWrapper />} />
          <Route path="services/pricing" element={<ServicePricingRouteWrapper />} />
          <Route path="services/payment" element={<ServicePaymentRouteWrapper />} />
          <Route path="services/success" element={<ServiceSuccessRouteWrapper />} />
        */}

        {/* Marketplace */}
        <Route path="marketplace" element={<MarketplaceRouteWrapper />} />
        <Route path="marketplace/ip/:id" element={<MarketplaceIPDetailRouteWrapper />} />
        <Route path="marketplace/challenge/:id" element={<MarketplaceChallengeDetailRouteWrapper />} />

        {/* Contact */}
        <Route path="contact" element={<ContactRouteWrapper />} />

        {/* Settings */}
        <Route path="settings" element={<SettingsRouteWrapper />} />

        {/* Collaboration Requests */}
        <Route path="my/collaboration-requests" element={<CollaborationRequestsPage />} />

        {/* IPs */}
        <Route path="ips" element={<IpsRouteWrapper />} />
        <Route path="ips/create" element={<CreateIpPage />} />
        <Route path="ips/:id" element={<IpDetailPage />} />
        <Route path="ips/:id/edit" element={<IpEditPage />} />

        {/* Challenges */}
        <Route path="challenges" element={<ChallengesRouteWrapper />} />
        <Route path="challenges/create" element={<CreateChallengePage />} />
        <Route path="challenges/:id" element={<IntakeChallengeDetailPage />} />
        <Route path="challenges/:id/edit" element={<ChallengeEditPage />} />

        {/* Stories */}
        <Route path="stories" element={<StoriesPage />} />
        <Route path="stories/create" element={<CreateStoryPage />} />
        <Route path="stories/:id" element={<StoryDetailPage />} />
        <Route path="stories/:id/edit" element={<EditStoryPage />} />

        {/* Keep authenticated unknown routes inside shared shell */}
        <Route path="*" element={<Navigate to="/ips" replace />} />
      </Route>

      <Route path="*" element={<FallbackRouteWrapper />} />
    </Routes>
  );
}
