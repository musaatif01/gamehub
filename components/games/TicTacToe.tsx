"use client";

import { useState } from 'react';
import { Button } from '../ui/Button';

export function TicTacToe() {
    const [board, setBoard] = useState(Array(9).fill(null));
    const [xIsNext, setXIsNext] = useState(true);

    const winner = calculateWinner(board);
    const status = winner
        ? `Winner: ${winner}`
        : board.every(Boolean)
            ? "Draw!"
            : `Next player: ${xIsNext ? 'X' : 'O'}`;

    function handleClick(i: number) {
        if (winner || board[i]) return;
        const nextBoard = board.slice();
        nextBoard[i] = xIsNext ? 'X' : 'O';
        setBoard(nextBoard);
        setXIsNext(!xIsNext);
    }

    function reset() {
        setBoard(Array(9).fill(null));
        setXIsNext(true);
    }

    return (
        <div className="flex flex-col items-center gap-8">
            <div className="text-2xl font-bold bg-white px-6 py-2 rounded-full shadow-sm border">
                {status}
            </div>

            <div className="grid grid-cols-3 gap-4 bg-gray-200 p-4 rounded-2xl">
                {board.map((square, i) => (
                    <button
                        key={i}
                        className={`w-32 h-32 text-6xl font-black rounded-xl transition-all duration-200 ${square
                            ? 'bg-white shadow-md transform scale-100'
                            : 'bg-white/50 hover:bg-white/80 shadow-sm'
                            } ${square === 'X' ? 'text-blue-500' : 'text-red-500'
                            }`}
                        onClick={() => handleClick(i)}
                    >
                        {square}
                    </button>
                ))}
            </div>

            <Button onClick={reset} variant="secondary">
                Reset Game
            </Button>
        </div>
    );
}

function calculateWinner(squares: any[]) {
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return squares[a];
        }
    }
    return null;
}
