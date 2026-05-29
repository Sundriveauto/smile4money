import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ClaimBurn } from '../src/components/claim-burn';

describe('ClaimBurn — wallet states', () => {
  it('shows checking state while detecting wallet', () => {
    render(<ClaimBurn walletState="checking" />);
    expect(screen.getByTestId('wallet-checking')).toBeInTheDocument();
    expect(screen.getByText(/Checking wallet/)).toBeInTheDocument();
  });

  it('shows checking state uses different testid from connecting', () => {
    render(<ClaimBurn walletState="checking" />);
    expect(screen.getByTestId('wallet-checking')).toBeInTheDocument();
    expect(screen.queryByTestId('wallet-connecting')).not.toBeInTheDocument();
  });

  it('shows connect prompt when disconnected', () => {
    render(<ClaimBurn walletState="disconnected" />);
    expect(screen.getByTestId('wallet-disconnected')).toBeInTheDocument();
    expect(screen.getByTestId('connect-wallet-btn')).toBeInTheDocument();
  });

  it('calls onConnect when connect button clicked', () => {
    const onConnect = vi.fn();
    render(<ClaimBurn walletState="disconnected" onConnect={onConnect} />);
    fireEvent.click(screen.getByTestId('connect-wallet-btn'));
    expect(onConnect).toHaveBeenCalledOnce();
  });

  it('shows connecting state', () => {
    render(<ClaimBurn walletState="connecting" />);
    expect(screen.getByTestId('wallet-connecting')).toBeInTheDocument();
    expect(screen.getByTestId('spinner-icon')).toBeInTheDocument();
  });

  it('shows notInstalled state', () => {
    render(<ClaimBurn walletState="notInstalled" />);
    expect(screen.getByTestId('wallet-not-installed')).toBeInTheDocument();
    expect(screen.getByText(/Freighter Not Found/i)).toBeInTheDocument();
  });

  it('shows wrongNetwork state', () => {
    render(<ClaimBurn walletState="wrongNetwork" expectedNetwork="testnet" />);
    expect(screen.getByTestId('wallet-wrong-network')).toBeInTheDocument();
    expect(screen.getByText('Wrong Network')).toBeInTheDocument();
    expect(screen.getByTestId('switch-network-btn')).toHaveTextContent('Switch to testnet');
  });

  it('calls onSwitchNetwork when switch network button clicked', () => {
    const onSwitchNetwork = vi.fn();
    render(
      <ClaimBurn
        walletState="wrongNetwork"
        onSwitchNetwork={onSwitchNetwork}
      />,
    );
    fireEvent.click(screen.getByTestId('switch-network-btn'));
    expect(onSwitchNetwork).toHaveBeenCalledOnce();
  });

  it('shows form when connected', () => {
    render(<ClaimBurn walletState="connected" />);
    expect(screen.getByTestId('claim-burn-form')).toBeInTheDocument();
  });

  it('shows wallet info when publicKey provided', () => {
    render(
      <ClaimBurn
        walletState="connected"
        publicKey="GABCDEF1234567890XYZ"
      />,
    );
    expect(screen.getByTestId('wallet-info')).toBeInTheDocument();
    expect(screen.getByTestId('wallet-address')).toHaveTextContent('GABC');
  });

  it('shows copy address button when publicKey provided', () => {
    render(
      <ClaimBurn
        walletState="connected"
        publicKey="GABCDEF1234567890XYZ"
      />,
    );
    expect(screen.getByTestId('copy-address-btn')).toBeInTheDocument();
    expect(screen.getByTestId('copy-address-btn')).toHaveAttribute('aria-label', 'Copy wallet address');
  });

  it('shows disconnect button when onDisconnect provided', () => {
    const onDisconnect = vi.fn();
    render(
      <ClaimBurn
        walletState="connected"
        publicKey="GABCDEF1234567890XYZ"
        onDisconnect={onDisconnect}
      />,
    );
    expect(screen.getByTestId('disconnect-btn')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('disconnect-btn'));
    expect(onDisconnect).toHaveBeenCalledOnce();
  });

  it('shows balance when provided', () => {
    render(
      <ClaimBurn
        walletState="connected"
        balance="1000.50"
      />,
    );
    expect(screen.getByTestId('balance-display')).toBeInTheDocument();
    expect(screen.getByTestId('balance-display')).toHaveTextContent('1000.50 XLM');
  });

  it('does not show balance when null', () => {
    render(
      <ClaimBurn
        walletState="connected"
        balance={null}
      />,
    );
    expect(screen.queryByTestId('balance-display')).not.toBeInTheDocument();
  });
});

describe('ClaimBurn — toggle', () => {
  it('defaults to claim mode', () => {
    render(<ClaimBurn walletState="connected" />);
    expect(screen.getByTestId('toggle-claim')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('toggle-burn')).toHaveAttribute('aria-pressed', 'false');
  });

  it('switches to burn mode', () => {
    render(<ClaimBurn walletState="connected" />);
    fireEvent.click(screen.getByTestId('toggle-burn'));
    expect(screen.getByTestId('toggle-burn')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('submit-btn')).toHaveTextContent('Burn');
  });

  it('switches back to claim mode', () => {
    render(<ClaimBurn walletState="connected" />);
    fireEvent.click(screen.getByTestId('toggle-burn'));
    fireEvent.click(screen.getByTestId('toggle-claim'));
    expect(screen.getByTestId('toggle-claim')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('submit-btn')).toHaveTextContent('Claim');
  });
});

describe('ClaimBurn — submit', () => {
  it('calls onClaim with amount', async () => {
    const onClaim = vi.fn().mockResolvedValue(undefined);
    render(<ClaimBurn walletState="connected" onClaim={onClaim} />);
    fireEvent.change(screen.getByTestId('amount-input'), { target: { value: '10' } });
    fireEvent.click(screen.getByTestId('submit-btn'));
    await waitFor(() => expect(screen.getByTestId('success-msg')).toBeInTheDocument());
    expect(onClaim).toHaveBeenCalledWith('10');
  });

  it('calls onBurn with amount', async () => {
    const onBurn = vi.fn().mockResolvedValue(undefined);
    render(<ClaimBurn walletState="connected" onBurn={onBurn} />);
    fireEvent.click(screen.getByTestId('toggle-burn'));
    fireEvent.change(screen.getByTestId('amount-input'), { target: { value: '25' } });
    fireEvent.click(screen.getByTestId('submit-btn'));
    await waitFor(() => expect(screen.getByTestId('success-msg')).toBeInTheDocument());
    expect(onBurn).toHaveBeenCalledWith('25');
  });

  it('shows spinner in button while pending', async () => {
    const onClaim = vi.fn().mockImplementation(() => new Promise((r) => setTimeout(r, 100)));
    render(<ClaimBurn walletState="connected" onClaim={onClaim} />);
    fireEvent.change(screen.getByTestId('amount-input'), { target: { value: '10' } });
    fireEvent.click(screen.getByTestId('submit-btn'));
    expect(screen.getByTestId('spinner-icon')).toBeInTheDocument();
    expect(screen.getByText(/Processing/)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('success-msg')).toBeInTheDocument());
  });

  it('shows error on failure', async () => {
    const onClaim = vi.fn().mockRejectedValue(new Error('Insufficient balance'));
    render(<ClaimBurn walletState="connected" onClaim={onClaim} />);
    fireEvent.change(screen.getByTestId('amount-input'), { target: { value: '5' } });
    fireEvent.click(screen.getByTestId('submit-btn'));
    await waitFor(() =>
      expect(screen.getByTestId('error-msg')).toHaveTextContent('Insufficient balance'),
    );
  });

  it('resets status on amount change after error', async () => {
    const onClaim = vi.fn().mockRejectedValue(new Error('Fail'));
    render(<ClaimBurn walletState="connected" onClaim={onClaim} />);
    fireEvent.change(screen.getByTestId('amount-input'), { target: { value: '5' } });
    fireEvent.click(screen.getByTestId('submit-btn'));
    await waitFor(() => expect(screen.getByTestId('error-msg')).toBeInTheDocument());
    fireEvent.change(screen.getByTestId('amount-input'), { target: { value: '10' } });
    expect(screen.queryByTestId('error-msg')).not.toBeInTheDocument();
  });

  it('disables submit when amount is empty', () => {
    render(<ClaimBurn walletState="connected" />);
    expect(screen.getByTestId('submit-btn')).toBeDisabled();
  });

  it('disables submit when amount is zero', () => {
    render(<ClaimBurn walletState="connected" />);
    fireEvent.change(screen.getByTestId('amount-input'), { target: { value: '0' } });
    expect(screen.getByTestId('submit-btn')).toBeDisabled();
  });
});
