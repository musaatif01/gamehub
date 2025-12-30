"use client";

import { useLeaderboard } from "./LeaderboardProvider";

interface LeaderboardProps {
    gameId: string;
}

export function Leaderboard({ gameId }: LeaderboardProps) {
    const { getScores } = useLeaderboard();
    const scores = getScores(gameId);

    return (
        <div className="bg-surface rounded-2xl shadow-lg overflow-hidden border border-border p-6 min-w-[300px] transition-colors duration-300">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">🏆</span> Leaderboard
            </h3>

            <div className="space-y-3">
                {scores.length === 0 ? (
                    <p className="text-gray-500 text-center italic">No scores yet. Be the first!</p>
                ) : (
                    scores.map((score, index) => (
                        <div
                            key={`${score.username}-${index}`}
                            className={`flex items-center justify-between p-3 rounded-xl transition-colors duration-300 ${index === 0 ? 'bg-yellow-500/10 border border-yellow-500/20' :
                                index === 1 ? 'bg-slate-500/10 border border-slate-500/20' :
                                    index === 2 ? 'bg-orange-500/10 border border-orange-500/20' :
                                        'bg-surface border border-border/50 hover:bg-black/5 dark:hover:bg-white/5'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${index === 0 ? 'bg-yellow-400 text-white shadow-sm' :
                                    index === 1 ? 'bg-gray-400 text-white shadow-sm' :
                                        index === 2 ? 'bg-orange-400 text-white shadow-sm' :
                                            'bg-gray-100 text-gray-500'
                                    }`}>
                                    {index + 1}
                                </div>
                                <span className={`font-semibold ${index < 3 ? 'text-foreground' : 'text-foreground/70'}`}>
                                    {score.username}
                                </span>
                            </div>
                            <span className="font-mono font-bold text-primary">
                                {score.score}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
