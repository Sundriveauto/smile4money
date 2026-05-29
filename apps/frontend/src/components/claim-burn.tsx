import { useState } from 'react';
import '../styles/claim-burn.css';

type Mode = 'claim' | 'burn';

type WalletState = 'checking' | 'notInstalled' | 'disconnected' | 'connecting' | 'connected' | 'wrongNetwork';

interface ClaimBurnProps {
  walletState?: WalletState;
  onConnect?: () => void;
  onClaim?: (amount: string) => Promise<void>;
  onBurn?: (amount: string) => Promise<void>;
  onSwitchNetwork?: () => void;
  onDisconnect?: () => void;
  publicKey?: string | null;
  expectedNetwork?: string;
  balance?: string | null;
}

function Spinner({ size = 16 }: { size?: number }) {
  return (
    <span
      className="spinner-icon"
      style={{ width: size, height: size, borderWidth: 2 }}
      data-testid="spinner-icon"
    />
  );
}

export function ClaimBurn({
  walletState = 'checking',
  onConnect,
  onClaim,
  onBurn,
  onSwitchNetwork,
  onDisconnect,
  publicKey,
  expectedNetwork = 'testnet',
  balance,
}: ClaimBurnProps) {
  const [mode, setMode] = useState<Mode>('claim');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = Number(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) return;

    setStatus('pending');
    setErrorMsg('');
    try {
      if (mode === 'claim') {
        await onClaim?.(amount);
      } else {
        await onBurn?.(amount);
      }
      setStatus('success');
      setAmount('');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Transaction failed');
    }
  }

  function renderNotInstalled() {
    return (
      <div className="wallet-state" data-testid="wallet-not-installed">
        <div className="wallet-state-icon">&#9888;&#65039;</div>
        <h3 className="wallet-state-title">Freighter Not Found</h3>
        <p className="wallet-state-message">
          Please install the{' '}
          <a href="https://freighter.app" target="_blank" rel="noopener noreferrer">
            Freighter wallet extension
          </a>{' '}
          to continue.
        </p>
      </div>
    );
  }

  function renderDisconnected() {
    return (
      <div className="wallet-state" data-testid="wallet-disconnected">
        <div className="wallet-state-icon">&#128188;</div>
        <h3 className="wallet-state-title">Connect Your Wallet</h3>
        <p className="wallet-state-message">
          Connect your Freighter wallet to claim rewards or burn tokens.
        </p>
        <button className="btn btn-connect" onClick={onConnect} data-testid="connect-wallet-btn">
          Connect Wallet
        </button>
      </div>
    );
  }

  function renderChecking() {
    return (
      <div className="wallet-state" data-testid="wallet-checking">
        <Spinner size={32} />
        <p className="wallet-state-message">Checking wallet connection&hellip;</p>
      </div>
    );
  }

  function renderConnecting() {
    return (
      <div className="wallet-state" data-testid="wallet-connecting">
        <Spinner size={32} />
        <p className="wallet-state-message">Connecting to Freighter&hellip;</p>
      </div>
    );
  }

  function renderWrongNetwork() {
    return (
      <div className="wallet-state" data-testid="wallet-wrong-network">
        <div className="wallet-state-icon">&#127760;</div>
        <h3 className="wallet-state-title">Wrong Network</h3>
        <p className="wallet-state-message">
          Please switch your Freighter wallet to <strong>{expectedNetwork}</strong>.
        </p>
        <button
          className="btn btn-switch-network"
          onClick={onSwitchNetwork}
          data-testid="switch-network-btn"
        >
          Switch to {expectedNetwork}
        </button>
      </div>
    );
  }

  function renderForm() {
    return (
      <>
        <div className="toggle" role="group" aria-label="Select mode">
          <button
            className={`toggle-btn${mode === 'claim' ? ' active' : ''}`}
            onClick={() => { setMode('claim'); setStatus('idle'); }}
            aria-pressed={mode === 'claim'}
            data-testid="toggle-claim"
          >
            Claim
          </button>
          <button
            className={`toggle-btn${mode === 'burn' ? ' active' : ''}`}
            onClick={() => { setMode('burn'); setStatus('idle'); }}
            aria-pressed={mode === 'burn'}
            data-testid="toggle-burn"
          >
            Burn
          </button>
        </div>

        {publicKey && (
          <div className="wallet-info" data-testid="wallet-info">
            <div className="wallet-info-left">
              <span className="wallet-info-label">Connected</span>
              <span className="wallet-info-address" data-testid="wallet-address">
                {publicKey.slice(0, 4)}&hellip;{publicKey.slice(-4)}
              </span>
              <button
                className="btn-copy"
                onClick={() => navigator.clipboard.writeText(publicKey)}
                data-testid="copy-address-btn"
                title="Copy address"
                aria-label="Copy wallet address"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </button>
            </div>
            {onDisconnect && (
              <button
                className="btn-disconnect"
                onClick={onDisconnect}
                data-testid="disconnect-btn"
                title="Disconnect wallet"
                aria-label="Disconnect wallet"
              >
                &times;
              </button>
            )}
          </div>
        )}

        {balance !== null && balance !== undefined && (
          <div className="balance-display" data-testid="balance-display">
            <span className="balance-label">Balance</span>
            <span className="balance-value">{balance} XLM</span>
          </div>
        )}

        <form onSubmit={handleSubmit} data-testid="claim-burn-form">
          <label htmlFor="amount">
            {mode === 'claim' ? 'Claim amount' : 'Burn amount'} (XLM)
          </label>
          <div className="input-row">
            <input
              id="amount"
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setStatus('idle'); }}
              placeholder="0.00"
              disabled={status === 'pending'}
              data-testid="amount-input"
            />
          </div>
          <button
            type="submit"
            className={`btn btn-${mode}`}
            disabled={status === 'pending' || !amount || Number(amount) <= 0}
            data-testid="submit-btn"
          >
            {status === 'pending' ? (
              <span className="btn-loading">
                <Spinner size={16} />
                Processing&hellip;
              </span>
            ) : (
              mode === 'claim' ? 'Claim' : 'Burn'
            )}
          </button>
        </form>

        <div aria-live="polite" aria-atomic="true">
          {status === 'success' && (
            <p className="feedback success" role="status" data-testid="success-msg">
              {mode === 'claim' ? 'Claimed successfully!' : 'Burned successfully!'}
            </p>
          )}
          {status === 'error' && (
            <p className="feedback error" role="alert" data-testid="error-msg">
              {errorMsg}
            </p>
          )}
        </div>
      </>
    );
  }

  const stateMap: Record<WalletState, React.ReactNode> = {
    checking: renderChecking(),
    notInstalled: renderNotInstalled(),
    disconnected: renderDisconnected(),
    connecting: renderConnecting(),
    wrongNetwork: renderWrongNetwork(),
    connected: renderForm(),
  };

  return (
    <div className="claim-burn" data-testid="claim-burn">
      <h2 className="claim-burn-title">Claim &amp; Burn</h2>
      {stateMap[walletState]}
    </div>
  );
}
