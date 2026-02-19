import { useOutletContext } from 'react-router-dom';
import DashboardSurface from '../components/surfaces/DashboardSurface';
import type { UseChatState } from '../hooks/useChatState';

export default function DashboardPage() {
  const chat = useOutletContext<UseChatState>();
  return (
    <DashboardSurface
      chat={chat}
      onOpenLaunchWizard={() => chat.setShowLaunchWizard(true)}
      onOpenAuthModal={() => chat.setShowAuthModal(true)}
    />
  );
}
