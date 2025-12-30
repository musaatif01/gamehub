"use client";

import { useState, useEffect } from "react";
import { Button } from "../ui/Button";

const WORDS = [
    "REACT", "GAMES", "CODES", "BRAIN", "SMART", "QUICK", "FLASH", "BOOST",
    "POWER", "MAGIC", "SUPER", "ULTRA", "HYPER", "CYBER", "PIXEL", "BLOCK",
    "STACK", "QUEUE", "ARRAY", "LOGIC", "DEBUG", "BUILD", "CRAFT", "FORGE"
];

type LetterStatus = 'correct' | 'present' | 'absent' | 'unused';

export function Wordle() {
    const [targetWord, setTargetWord] = useState("");
    const [guesses, setGuesses] = useState<string[]>([]);
    const [currentGuess, setCurrentGuess] = useState("");
    const [gameOver, setGameOver] = useState(false);
    const [won, setWon] = useState(false);
    const [letterStatuses, setLetterStatuses] = useState<Record<string, LetterStatus>>({});

    useEffect(() => {
        startNewGame();
    }, []);

    // Physical keyboard support
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (gameOver) return;

            if (e.key === "Enter") {
                handleKeyPress("ENTER");
            } else if (e.key === "Backspace") {
                handleKeyPress("BACK");
            } else if (/^[a-zA-Z]$/.test(e.key)) {
                handleKeyPress(e.key.toUpperCase());
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentGuess, guesses, gameOver, targetWord]);

    const startNewGame = () => {
        const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
        setTargetWord(randomWord);
        setGuesses([]);
        setCurrentGuess("");
        setGameOver(false);
        setWon(false);
        setLetterStatuses({});
    };

    const updateLetterStatuses = (guess: string) => {
        const newStatuses = { ...letterStatuses };

        for (let i = 0; i < guess.length; i++) {
            const letter = guess[i];

            if (guess[i] === targetWord[i]) {
                newStatuses[letter] = 'correct';
            } else if (targetWord.includes(letter) && newStatuses[letter] !== 'correct') {
                newStatuses[letter] = 'present';
            } else if (!targetWord.includes(letter)) {
                newStatuses[letter] = 'absent';
            }
        }

        setLetterStatuses(newStatuses);
    };

    const handleKeyPress = (key: string) => {
        if (gameOver) return;

        if (key === "ENTER") {
            if (currentGuess.length === 5) {
                const newGuesses = [...guesses, currentGuess];
                setGuesses(newGuesses);
                updateLetterStatuses(currentGuess);

                if (currentGuess === targetWord) {
                    setWon(true);
                    setGameOver(true);
                } else if (newGuesses.length >= 6) {
                    setGameOver(true);
                }

                setCurrentGuess("");
            }
        } else if (key === "BACK") {
            setCurrentGuess(currentGuess.slice(0, -1));
        } else if (currentGuess.length < 5 && /^[A-Z]$/.test(key)) {
            setCurrentGuess(currentGuess + key);
        }
    };

    const getLetterColor = (letter: string, index: number, guess: string) => {
        if (guess[index] === targetWord[index]) {
            return "bg-green-500 text-white border-green-600";
        } else if (targetWord.includes(letter)) {
            return "bg-yellow-500 text-white border-yellow-600";
        } else {
            return "bg-gray-400 text-white border-gray-500";
        }
    };

    const getKeyboardColor = (key: string) => {
        const status = letterStatuses[key];
        if (status === 'correct') {
            return "bg-green-500 text-white hover:bg-green-600";
        } else if (status === 'present') {
            return "bg-yellow-500 text-white hover:bg-yellow-600";
        } else if (status === 'absent') {
            return "bg-gray-500 text-white hover:bg-gray-600";
        }
        return "bg-gray-200 hover:bg-gray-300";
    };

    const keyboard = [
        ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
        ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
        ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACK"]
    ];

    return (
        <div className="flex flex-col items-center justify-center w-full h-full min-h-[600px] bg-white rounded-2xl p-8 relative overflow-hidden">
            <h2 className="text-4xl font-black mb-8 text-gray-800 tracking-tighter">WORDLE</h2>

            {/* Game Board */}
            <div className="mb-8 space-y-2">
                {[...Array(6)].map((_, rowIndex) => (
                    <div key={rowIndex} className="flex gap-2">
                        {[...Array(5)].map((_, colIndex) => {
                            const guess = guesses[rowIndex] || "";
                            const isCurrentRow = rowIndex === guesses.length;
                            const letter = isCurrentRow ? currentGuess[colIndex] || "" : guess[colIndex] || "";
                            const colorClass = guess ? getLetterColor(guess[colIndex], colIndex, guess) : "bg-white border-gray-300";

                            return (
                                <div
                                    key={colIndex}
                                    className={`w-14 h-14 border-2 rounded-lg flex items-center justify-center text-2xl font-bold transition-all ${colorClass} ${letter ? 'scale-105 shadow-sm' : ''}`}
                                >
                                    {letter}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Keyboard */}
            <div className="space-y-2">
                {keyboard.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex gap-1 justify-center">
                        {row.map((key) => (
                            <button
                                key={key}
                                onClick={() => handleKeyPress(key)}
                                className={`${key === "ENTER" || key === "BACK" ? "px-4" : "w-10"
                                    } h-12 rounded-lg font-bold text-sm transition-all ${getKeyboardColor(key)}`}
                            >
                                {key === "BACK" ? "⌫" : key}
                            </button>
                        ))}
                    </div>
                ))}
            </div>

            <div className="mt-6 text-sm text-gray-500 text-center font-medium">
                Guess the 5-letter word in 6 tries.
            </div>

            {/* Game Over Modal */}
            {gameOver && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={startNewGame} />
                    <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center transform animate-in zoom-in-95 duration-300">
                        <div className={`text-6xl mb-6 ${won ? 'animate-bounce' : ''}`}>
                            {won ? '🎉' : '💀'}
                        </div>

                        <h3 className="text-3xl font-black mb-2 tracking-tight text-gray-900">
                            {won ? 'Splendid!' : 'Close Call!'}
                        </h3>

                        <p className="text-gray-500 font-medium mb-8">
                            {won ? `You found it in ${guesses.length} tries!` : 'Better luck next time!'}
                        </p>

                        <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">The word was</p>
                            <div className="flex justify-center gap-1">
                                {targetWord.split('').map((letter, i) => (
                                    <div key={i} className="w-10 h-10 bg-gray-900 text-white rounded-lg flex items-center justify-center text-xl font-bold shadow-lg">
                                        {letter}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Button
                            onClick={startNewGame}
                            variant={won ? 'primary' : 'secondary'}
                            size="lg"
                            className="w-full text-xl"
                        >
                            Play Again
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
