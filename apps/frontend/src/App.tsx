import { ClaimBurn } from './components/claim-burn';
import { useWallet } from './hooks/useWallet';

export function App() {
  const { state, publicKey, expectedNetwork, connect, switchNetwork, disconnect } = useWallet();

  return (
    <main style={{ padding: '2rem', minHeight: '100vh', background: '#f5f5f5' }}>
      <ClaimBurn
        walletState={state}
        onConnect={connect}
        onSwitchNetwork={switchNetwork}
        onDisconnect={disconnect}
        publicKey={publicKey}
        expectedNetwork={expectedNetwork}
      />
    </main>
  );
}
