import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import { AppProvider, useApp } from '@/app/providers/AppProvider';
import { AuthProvider, useAuth } from '@/app/providers/AuthProvider';
import { AppRoutes } from '@/app/router/routes';
import { OpenDealModal } from '@/shared/components/modals/OpenDealModal';
import { SubmitProposalModal } from '@/shared/components/modals/SubmitProposalModal';
import { ChangePasswordModal } from '@/shared/components/modals/ChangePasswordModal';
import { removeAccessToken } from '@/shared/utils/authCookie';
import { TooltipProvider } from '@/shared/components/ui/tooltip';

function AppShell() {
  const navigate = useNavigate();
  const app = useApp();
  const { isAuthenticated, logout, user } = useAuth();

  const handleChangePasswordSuccess = () => {
    app.closeChangePasswordModal();
    // Show toast BEFORE navigating so it renders before component unmounts
    setTimeout(() => {
      removeAccessToken();
      logout();
      navigate('/login', { replace: true });
    }, 100);
    toast.success('Đổi mật khẩu thành công. Vui lòng đăng nhập lại.');
  };

  return (
    <>
      <AppRoutes />
      <OpenDealModal
        isOpen={app.showDealModal}
        onClose={app.closeDealModal}
        onConfirm={app.confirmDealRoom}
        ownerName={app.dealOwnerName}
      />
      <SubmitProposalModal
        isOpen={app.showProposalModal}
        onClose={app.closeProposalModal}
        onConfirm={app.confirmProposal}
        proposalData={app.proposalData}
      />
      <ChangePasswordModal
        isOpen={app.showChangePasswordModal}
        onClose={app.closeChangePasswordModal}
        onSuccess={handleChangePasswordSuccess}
        resetKey={isAuthenticated ? String(user?.id ?? user?.email ?? 'authenticated') : 'guest'}
      />
      <Toaster />
    </>
  );
}

export default function App() {
  const navigate = useNavigate();

  return (
    <TooltipProvider>
    <AuthProvider>
      <AppProvider
        onConfirmDealRoom={() => {
          alert('Bạn đã xác nhận tham gia Deal Room. Chuyển đến Deal Room.');
          navigate('/deal-room');
        }}
        onConfirmProposal={(_ipId, _message) => {
          toast.success('Đề xuất đã được gửi thành công.');
          navigate('/marketplace');
        }}
      >
        <AppShell />
      </AppProvider>
    </AuthProvider>
    </TooltipProvider>
  );
}
