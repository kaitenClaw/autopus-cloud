import { useOutletContext } from 'react-router-dom';
import HubSurface from '../components/surfaces/HubSurface';
import type { UseChatState } from '../hooks/useChatState';

export default function HubPage() {
  const chat = useOutletContext<UseChatState>();
  return (
    <HubSurface
      chat={chat}
      onOpenLaunchWizard={() => chat.setShowLaunchWizard(true)}
      onOpenAuthModal={() => chat.setShowAuthModal(true)}
    />
  );
}
