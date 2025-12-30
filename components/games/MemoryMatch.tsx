"use client";

import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';

const EMOJIS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];

interface Card {
    id: number;
    emoji: string;
    isFlipped: boolean;
    isMatched: boolean;
}

export function MemoryMatch() {
    const [cards, setCards] = useState<Card[]>([]);
    const [flippedCards, setFlippedCards] = useState<number[]>([]); // indices
    const [moves, setMoves] = useState(0);
    const [isLocked, setIsLocked] = useState(false);

    useEffect(() => {
        startNewGame();
    }, []);

    const startNewGame = () => {
        const shuffledEmojis = [...EMOJIS, ...EMOJIS].sort(() => Math.random() - 0.5);
        const newCards = shuffledEmojis.map((emoji, index) => ({
            id: index,
            emoji,
            isFlipped: false,
            isMatched: false,
        }));
        setCards(newCards);
        setFlippedCards([]);
        setMoves(0);
        setIsLocked(false);
    };

    const handleCardClick = (index: number) => {
        if (isLocked || cards[index].isFlipped || cards[index].isMatched) return;

        // Flip card
        const newCards = [...cards];
        newCards[index].isFlipped = true;
        setCards(newCards);

        const newFlipped = [...flippedCards, index];
        setFlippedCards(newFlipped);

        if (newFlipped.length === 2) {
            setIsLocked(true);
            setMoves(m => m + 1);
            checkForMatch(newFlipped);
        }
    };

    const checkForMatch = (currentFlipped: number[]) => {
        const [first, second] = currentFlipped;
        if (cards[first].emoji === cards[second].emoji) {
            // Match!
            setTimeout(() => {
                setCards(prev => prev.map((card, i) =>
                    i === first || i === second ? { ...card, isMatched: true } : card
                ));
                setFlippedCards([]);
                setIsLocked(false);
            }, 500);
        } else {
            // No match
            setTimeout(() => {
                setCards(prev => prev.map((card, i) =>
                    i === first || i === second ? { ...card, isFlipped: false } : card
                ));
                setFlippedCards([]);
                setIsLocked(false);
            }, 1000);
        }
    };

    const isWon = cards.length > 0 && cards.every(c => c.isMatched);

    return (
        <div className="flex flex-col items-center gap-6">
            <div className="flex justify-between w-full max-w-md px-4">
                <div className="text-xl font-bold">Moves: {moves}</div>
                <Button onClick={startNewGame} size="sm" variant="secondary">Restart</Button>
            </div>

            {isWon && (
                <div className="text-3xl font-extrabold text-green-500 animate-bounce">
                    You Won! 🎉
                </div>
            )}

            <div className="grid grid-cols-4 gap-4 bg-gray-200 p-5 rounded-2xl">
                {cards.map((card, index) => (
                    <div
                        key={card.id}
                        className={`w-24 h-24 sm:w-28 sm:h-28 cursor-pointer perspective-1000`}
                        onClick={() => handleCardClick(index)}
                    >
                        <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${card.isFlipped || card.isMatched ? 'rotate-y-180' : ''}`}>
                            {/* Front (Back of card actually, hidden) */}
                            <div className="absolute w-full h-full backface-hidden bg-white/50 rounded-xl flex items-center justify-center text-4xl shadow-sm hover:bg-white/70">
                                ❓
                            </div>
                            {/* Back (Face of card, shown when flipped) */}
                            <div className="absolute w-full h-full backface-hidden bg-white rounded-xl flex items-center justify-center text-5xl shadow-md rotate-y-180 border-2 border-secondary">
                                {card.emoji}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <style jsx global>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
        </div>
    );
}
