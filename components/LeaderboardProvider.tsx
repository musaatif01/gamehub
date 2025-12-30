"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface Score {
    username: string;
    score: number;
    date: string;
}

interface LeaderboardContextType {
    getScores: (gameId: string) => Score[];
    addScore: (gameId: string, username: string, score: number) => void;
}

const LeaderboardContext = createContext<LeaderboardContextType | undefined>(undefined);

// Simulated "Other Players" scores to populate the board initially
const MOCK_SCORES: Record<string, Score[]> = {
    tictactoe: [
        { username: "ProGamer123", score: 10, date: new Date().toISOString() },
        { username: "GameMaster", score: 8, date: new Date().toISOString() },
        { username: "NoobSlayer", score: 5, date: new Date().toISOString() },
    ],
    snake: [
        { username: "SnekKing", score: 15, date: new Date().toISOString() },
        { username: "AppleEater", score: 12, date: new Date().toISOString() },
        { username: "LongBoi", score: 8, date: new Date().toISOString() },
    ],
    memory: [
        { username: "BigBrain", score: 12, date: new Date().toISOString() }, // Low moves is better usually, but let's stick to high score for simplicity or invert logic in component
        { username: "Elephant", score: 16, date: new Date().toISOString() },
        { username: "Forgetful", score: 24, date: new Date().toISOString() },
    ],
    runner: [
        { username: "SubwaySurfer", score: 1500, date: new Date().toISOString() },
        { username: "TrainDodger", score: 1200, date: new Date().toISOString() },
        { username: "SprayPaint", score: 950, date: new Date().toISOString() },
    ]
};

export function LeaderboardProvider({ children }: { children: ReactNode }) {
    const [scores, setScores] = useState<Record<string, Score[]>>({});

    useEffect(() => {
        const loadedScores: Record<string, Score[]> = {};
        // Load from local storage
        Object.keys(MOCK_SCORES).forEach(gameId => {
            const stored = localStorage.getItem(`gamehub_scores_${gameId}`);
            if (stored) {
                loadedScores[gameId] = JSON.parse(stored);
            } else {
                // Seed with mock data if empty
                loadedScores[gameId] = MOCK_SCORES[gameId];
                localStorage.setItem(`gamehub_scores_${gameId}`, JSON.stringify(MOCK_SCORES[gameId]));
            }
        });
        setScores(loadedScores);
    }, []);

    const getScores = (gameId: string) => {
        return scores[gameId] || [];
    };

    const addScore = (gameId: string, username: string, score: number) => {
        const newScore: Score = { username, score, date: new Date().toISOString() };
        setScores(prev => {
            const currentGameScores = prev[gameId] || [];
            // Add new score, sort descending (higher is better), keep top 10
            const updatedGameScores = [...currentGameScores, newScore]
                .sort((a, b) => b.score - a.score)
                .slice(0, 10);

            const newScores = { ...prev, [gameId]: updatedGameScores };
            localStorage.setItem(`gamehub_scores_${gameId}`, JSON.stringify(updatedGameScores));
            return newScores;
        });
    };

    return (
        <LeaderboardContext.Provider value={{ getScores, addScore }}>
            {children}
        </LeaderboardContext.Provider>
    );
}

export function useLeaderboard() {
    const context = useContext(LeaderboardContext);
    if (context === undefined) {
        throw new Error("useLeaderboard must be used within a LeaderboardProvider");
    }
    return context;
}
