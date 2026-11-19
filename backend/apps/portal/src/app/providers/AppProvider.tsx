import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface AppContextValue {
  openDealModal: (ownerName: string) => void;
  closeDealModal: () => void;
  confirmDealRoom: () => void;
  showDealModal: boolean;
  dealOwnerName: string;

  openProposalModal: (data: { challengeId: string | null; enterpriseName: string }) => void;
  closeProposalModal: () => void;
  showProposalModal: boolean;
  proposalData: { challengeId: string | null; enterpriseName: string } | null;
  confirmProposal: (ipId: string, message: string) => void;

  openChangePasswordModal: () => void;
  closeChangePasswordModal: () => void;
  showChangePasswordModal: boolean;

  selectedPackageId: string;
  setSelectedPackageId: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({
  children,
  onConfirmDealRoom,
  onConfirmProposal,
}: {
  children: ReactNode;
  onConfirmDealRoom: () => void;
  onConfirmProposal: (ipId: string, message: string) => void;
}) {
  const [showDealModal, setShowDealModal] = useState(false);
  const [dealOwnerName, setDealOwnerName] = useState('');
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [proposalData, setProposalData] = useState<{ challengeId: string | null; enterpriseName: string } | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState('basic');
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  const openDealModal = useCallback((ownerName: string) => {
    setDealOwnerName(ownerName);
    setShowDealModal(true);
  }, []);

  const closeDealModal = useCallback(() => {
    setShowDealModal(false);
  }, []);

  const openProposalModal = useCallback((data: { challengeId: string | null; enterpriseName: string }) => {
    setProposalData(data);
    setShowProposalModal(true);
  }, []);

  const closeProposalModal = useCallback(() => {
    setShowProposalModal(false);
    setProposalData(null);
  }, []);

  const confirmProposal = useCallback(
    (ipId: string, message: string) => {
      onConfirmProposal(ipId, message);
      closeProposalModal();
    },
    [onConfirmProposal, closeProposalModal]
  );

  const confirmDealRoom = useCallback(() => {
    closeDealModal();
    onConfirmDealRoom();
  }, [closeDealModal, onConfirmDealRoom]);

  const openChangePasswordModal = useCallback(() => {
    setShowChangePasswordModal(true);
  }, []);

  const closeChangePasswordModal = useCallback(() => {
    setShowChangePasswordModal(false);
  }, []);

  const value: AppContextValue = {
    openDealModal,
    closeDealModal,
    confirmDealRoom,
    showDealModal,
    dealOwnerName,
    openProposalModal,
    closeProposalModal,
    showProposalModal,
    proposalData,
    confirmProposal,
    openChangePasswordModal,
    closeChangePasswordModal,
    showChangePasswordModal,
    selectedPackageId,
    setSelectedPackageId,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
