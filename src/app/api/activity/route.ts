export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get('wallet');
  if (!wallet) return NextResponse.json({ success: false, error: 'wallet required' }, { status: 400 });

  try {
    const db = await getDb();

    // All entries by this wallet
    const entries = await db.collection('pool_entries')
      .find({ wallet })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    // All draws where this wallet won
    const wins = await db.collection('draws')
      .find({ winner: wallet })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    // All draws where this wallet participated (even if didn't win)
    const participated = await db.collection('draws')
      .find({ participants: wallet })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    // Stats
    const totalEntries = await db.collection('pool_entries').countDocuments({ wallet });
    const totalWins = await db.collection('draws').countDocuments({ winner: wallet });
    const volAgg = await db.collection('pool_entries').aggregate([
      { $match: { wallet } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]).toArray();
    const wonAgg = await db.collection('draws').aggregate([
      { $match: { winner: wallet } },
      { $group: { _id: null, total: { $sum: '$payout' } } },
    ]).toArray();
    const totalParticipated = await db.collection('draws').countDocuments({ participants: wallet });
    const unclaimedWins = await db.collection('draws').countDocuments({ winner: wallet, paidOut: { $ne: true } });

    return NextResponse.json({
      success: true,
      stats: {
        totalEntries,
        totalWins,
        totalParticipated,
        totalVolume: volAgg[0]?.total || 0,
        totalWon: wonAgg[0]?.total || 0,
        unclaimedWins,
        winRate: totalParticipated > 0 ? ((totalWins / totalParticipated) * 100).toFixed(1) : '0',
      },
      entries: entries.map((e: any) => ({
        tier: e.tier,
        amount: e.amount || e.tier,
        txSignature: e.txSignature,
        createdAt: e.createdAt,
      })),
      wins: wins.map((w: any) => ({
        drawId: w._id.toString(),
        tier: w.tier,
        payout: w.payout,
        participantCount: w.participantCount,
        paidOut: w.paidOut || false,
        claimed: w.claimed || false,
        paidTx: w.paidTx || '',
        drawTx: w.drawTx || '',
        createdAt: w.createdAt,
      })),
      participated: participated.map((p: any) => ({
        drawId: p._id.toString(),
        tier: p.tier,
        winner: p.winner,
        payout: p.payout,
        participantCount: p.participantCount,
        isWinner: p.winner === wallet,
        createdAt: p.createdAt,
      })),
    });
  } catch (err) {
    console.error('[Activity] Error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
