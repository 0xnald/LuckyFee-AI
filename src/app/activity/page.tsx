'use client';

import React, { useState, useEffect } from 'react';
import { User, Trophy, TrendingUp, Zap, Gift, Clock, ExternalLink, Loader2, Percent, Award } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { shortenAddress, formatSol } from '@/lib/constants';

type Tab = 'entries' | 'wins' | 'history';

export default function ActivityPage() {
  const { publicKey, connected } = useWallet();
  const [tab, setTab] = useState<Tab>('entries');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!publicKey) return;
    setLoading(true);
    fetch(`/api/activity?wallet=${publicKey.toBase58()}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [publicKey]);

  if (!connected) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3"><User size={28} className="text-bags-primary" /> My Activity</h1>
          <p className="text-bags-muted mt-1">Connect your wallet to view your pool history.</p>
        </div>
        <div className="card text-center py-16">
          <User size={48} className="mx-auto mb-4 text-bags-muted opacity-40" />
          <p className="text-bags-muted mb-6">Connect your Solana wallet to see your entries, wins, and stats.</p>
          <WalletMultiButton />
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: typeof Trophy }[] = [
    { key: 'entries', label: 'My Entries', icon: Zap },
    { key: 'wins', label: 'My Wins', icon: Trophy },
    { key: 'history', label: 'Draw History', icon: Clock },
  ];

  const s = data?.stats;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3"><User size={28} className="text-bags-primary" /> My Activity</h1>
        <p className="text-bags-muted mt-1">Your personal pool history · {shortenAddress(publicKey!.toBase58(), 6)}</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-bags-primary" /></div>
      ) : !data ? (
        <div className="card text-center py-16"><p className="text-bags-muted">No data found.</p></div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card text-center">
              <Zap size={20} className="mx-auto mb-2 text-bags-primary" />
              <p className="font-mono font-bold text-2xl">{s.totalEntries}</p>
              <p className="text-xs text-bags-muted mt-1">Total Entries</p>
            </div>
            <div className="card text-center">
              <Trophy size={20} className="mx-auto mb-2 text-bags-warning" />
              <p className="font-mono font-bold text-2xl text-bags-warning">{s.totalWins}</p>
              <p className="text-xs text-bags-muted mt-1">Total Wins</p>
            </div>
            <div className="card text-center">
              <TrendingUp size={20} className="mx-auto mb-2 text-bags-accent" />
              <p className="font-mono font-bold text-2xl text-bags-primary">{formatSol(s.totalVolume)} SOL</p>
              <p className="text-xs text-bags-muted mt-1">Total Contributed</p>
            </div>
            <div className="card text-center">
              <Award size={20} className="mx-auto mb-2 text-bags-primary" />
              <p className="font-mono font-bold text-2xl text-bags-primary">{formatSol(s.totalWon)} SOL</p>
              <p className="text-xs text-bags-muted mt-1">Total Won</p>
            </div>
          </div>

          {/* Secondary stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="card text-center">
              <p className="text-xs text-bags-muted mb-1">Win Rate</p>
              <p className="font-mono font-bold text-xl">{s.winRate}%</p>
            </div>
            <div className="card text-center">
              <p className="text-xs text-bags-muted mb-1">Draws Participated</p>
              <p className="font-mono font-bold text-xl">{s.totalParticipated}</p>
            </div>
            <div className="card text-center">
              <p className="text-xs text-bags-muted mb-1">Unclaimed</p>
              <p className="font-mono font-bold text-xl text-bags-warning">{s.unclaimedWins}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-bags-card rounded-xl p-1 border border-bags-border">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === key ? 'bg-bags-primary/10 text-bags-primary' : 'text-bags-muted hover:text-white'}`}>
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="card">
            {tab === 'entries' && (
              data.entries.length === 0 ? (
                <p className="text-center py-12 text-bags-muted text-sm">No entries yet. Join a pool to get started!</p>
              ) : (
                <div className="space-y-2">
                  {data.entries.map((e: any, i: number) => (
                    <div key={i} className="flex items-center justify-between bg-bags-dark/40 rounded-xl px-4 py-3 border border-bags-border/30">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-bags-primary/10 flex items-center justify-center"><Zap size={14} className="text-bags-primary" /></div>
                        <div>
                          <p className="font-mono text-sm font-bold">{e.tier} SOL Pool</p>
                          <p className="text-[10px] text-bags-muted">{new Date(e.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm text-bags-primary">-{formatSol(e.amount || e.tier)} SOL</span>
                        {e.txSignature && (
                          <a href={`https://solscan.io/tx/${e.txSignature}`} target="_blank" rel="noopener noreferrer" className="text-bags-muted hover:text-bags-primary">
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {tab === 'wins' && (
              data.wins.length === 0 ? (
                <p className="text-center py-12 text-bags-muted text-sm">No wins yet. Keep entering pools!</p>
              ) : (
                <div className="space-y-2">
                  {data.wins.map((w: any) => (
                    <div key={w.drawId} className="flex items-center justify-between bg-bags-dark/40 rounded-xl px-4 py-3 border border-bags-border/30">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-bags-warning/10 flex items-center justify-center"><Trophy size={14} className="text-bags-warning" /></div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-mono text-sm font-bold text-bags-primary">+{formatSol(w.payout)} SOL</p>
                            <span className="text-[10px] bg-bags-dark px-1.5 py-0.5 rounded text-bags-muted">{w.tier} SOL pool</span>
                          </div>
                          <p className="text-[10px] text-bags-muted">{w.participantCount} players · {new Date(w.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {w.paidOut ? (
                          <span className="text-[10px] text-bags-primary font-medium">Paid ✓</span>
                        ) : (
                          <span className="text-[10px] text-bags-warning font-medium">Unclaimed</span>
                        )}
                        {w.drawTx && (
                          <a href={`https://solscan.io/tx/${w.drawTx}`} target="_blank" rel="noopener noreferrer" className="text-bags-muted hover:text-bags-primary">
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {tab === 'history' && (
              data.participated.length === 0 ? (
                <p className="text-center py-12 text-bags-muted text-sm">No draw history yet.</p>
              ) : (
                <div className="space-y-2">
                  {data.participated.map((p: any) => (
                    <div key={p.drawId} className="flex items-center justify-between bg-bags-dark/40 rounded-xl px-4 py-3 border border-bags-border/30">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${p.isWinner ? 'bg-bags-warning/10' : 'bg-bags-dark/60'}`}>
                          {p.isWinner ? <Trophy size={14} className="text-bags-warning" /> : <Clock size={14} className="text-bags-muted" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-bags-dark px-1.5 py-0.5 rounded text-bags-muted">{p.tier} SOL</span>
                            <span className="text-[10px] text-bags-muted">{p.participantCount} players</span>
                            {p.isWinner && <span className="text-[10px] bg-bags-warning/10 text-bags-warning px-1.5 py-0.5 rounded font-medium">Won!</span>}
                          </div>
                          <p className="text-[10px] text-bags-muted mt-0.5">Winner: {shortenAddress(p.winner, 4)} · {new Date(p.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-mono text-sm font-bold ${p.isWinner ? 'text-bags-primary' : 'text-bags-muted'}`}>
                          {p.isWinner ? `+${formatSol(p.payout)}` : `-${formatSol(p.tier)}`} SOL
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}
