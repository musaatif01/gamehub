"use client";

import { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/Button';
import { useAuth } from '../AuthProvider';
import { useLeaderboard } from '../LeaderboardProvider';

const GRID_SIZE = 20; // Larger grid for bigger canvas
const CELL_SIZE = 28; // Adjusted for better fit
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE; // 560x560
const SPEED = 110;

// Colors
const COLOR_BOARD_LIGHT = '#aad751';
const COLOR_BOARD_DARK = '#a2d149';
const COLOR_SNAKE_BODY = '#4674e9';
const COLOR_SNAKE_HEAD = '#4674e9';
const COLOR_APPLE = '#e7471d';

export function Snake() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { user } = useAuth();
    const { addScore } = useLeaderboard();

    const [snake, setSnake] = useState<number[][]>([[4, 7], [3, 7], [2, 7]]);
    const [food, setFood] = useState<number[]>([10, 7]);
    const [dir, setDir] = useState<number[]>([1, 0]); // Right
    const [nextDir, setNextDir] = useState<number[]>([1, 0]); // Prevent 180 turns
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);

    // Load High Score
    useEffect(() => {
        const saved = localStorage.getItem('snake_highscore');
        if (saved) setHighScore(parseInt(saved));
    }, []);

    // Controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Prevent scrolling
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }

            if (e.key === ' ' && !gameOver) {
                setIsPaused(p => !p);
                return;
            }

            if (!hasStarted && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                setHasStarted(true);
            }

            const newDir = [...nextDir];
            switch (e.key) {
                case 'ArrowUp': if (dir[1] !== 1) newDir.splice(0, 2, 0, -1); break;
                case 'ArrowDown': if (dir[1] !== -1) newDir.splice(0, 2, 0, 1); break;
                case 'ArrowLeft': if (dir[0] !== 1) newDir.splice(0, 2, -1, 0); break;
                case 'ArrowRight': if (dir[0] !== -1) newDir.splice(0, 2, 1, 0); break;
            }
            setNextDir(newDir);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [dir, nextDir, gameOver, hasStarted]);

    // Loop
    useEffect(() => {
        if (gameOver || isPaused || !hasStarted) return;

        const moveSnake = setInterval(() => {
            setDir(nextDir);
            setSnake(prev => {
                const head = [prev[0][0] + nextDir[0], prev[0][1] + nextDir[1]];
                const newSnake = [...prev];

                // Wall Collision (Loop or Die? Google Snake dies on wall usually unless specific mode)
                // Let's make it die on wall for "Classic" feel
                if (head[0] < 0 || head[0] >= GRID_SIZE || head[1] < 0 || head[1] >= GRID_SIZE) {
                    handleGameOver(newSnake.length - 3); // Score is length - 3
                    return prev;
                }

                // Self Collision
                if (newSnake.some(s => s[0] === head[0] && s[1] === head[1])) {
                    handleGameOver(newSnake.length - 3);
                    return prev;
                }

                newSnake.unshift(head);

                // Eat Food
                if (head[0] === food[0] && head[1] === food[1]) {
                    setScore(s => s + 1);
                    // Spawn new food
                    let newFood;
                    do {
                        newFood = [Math.floor(Math.random() * GRID_SIZE), Math.floor(Math.random() * GRID_SIZE)];
                    } while (newSnake.some(s => s[0] === newFood![0] && s[1] === newFood![1]));
                    setFood(newFood);
                    // Play crunch sound (optional, maybe later)
                } else {
                    newSnake.pop();
                }
                return newSnake;
            });
        }, SPEED);

        return () => clearInterval(moveSnake);
    }, [hasStarted, gameOver, isPaused, nextDir, food]);

    const handleGameOver = (finalScore: number) => {
        setGameOver(true);
        setHasStarted(false);
        if (finalScore > highScore) {
            setHighScore(finalScore);
            localStorage.setItem('snake_highscore', finalScore.toString());
        }
        if (user) {
            const username = user.user_metadata?.username || user.email?.split('@')[0] || 'Player';
            addScore("snake", username, finalScore);
        }
    };

    const restartGame = () => {
        setSnake([[4, 7], [3, 7], [2, 7]]);
        setDir([1, 0]);
        setNextDir([1, 0]);
        setScore(0);
        setGameOver(false);
        // Don't auto start, wait for input
    };

    // Drawing
    useEffect(() => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;

        // 1. Draw Checkerboard Background
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                ctx.fillStyle = (row + col) % 2 === 0 ? COLOR_BOARD_LIGHT : COLOR_BOARD_DARK;
                ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
        }

        // 2. Draw Food (Apple)
        const [fx, fy] = food;
        const cx = fx * CELL_SIZE + CELL_SIZE / 2;
        const cy = fy * CELL_SIZE + CELL_SIZE / 2;
        const r = CELL_SIZE / 2 - 4;

        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetY = 3;

        ctx.fillStyle = COLOR_APPLE;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();

        // Leaf
        ctx.shadowColor = 'transparent';
        ctx.fillStyle = '#6fa318'; // green
        ctx.beginPath();
        ctx.ellipse(cx, cy - r, 4, 8, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();


        // 3. Draw Snake
        ctx.shadowColor = 'rgba(0,0,0,0.1)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetY = 2;

        snake.forEach((segment, i) => {
            const [sx, sy] = segment;
            const x = sx * CELL_SIZE;
            const y = sy * CELL_SIZE;

            ctx.fillStyle = COLOR_SNAKE_BODY;

            // If head
            if (i === 0) {
                // Draw Eyes based on direction
                ctx.beginPath();
                ctx.roundRect(x, y, CELL_SIZE, CELL_SIZE, 8); // rounded head
                ctx.fill();

                // White of eye
                ctx.fillStyle = 'white';
                let ex1, ey1, ex2, ey2;
                // Direction offsets for eyes...
                // Simplified: just draw eyes looking in direction
                const eyeOffset = 8;
                const eyeSize = 6;

                if (dir[0] === 1) { // Right
                    ex1 = x + CELL_SIZE - 10; ey1 = y + 8;
                    ex2 = x + CELL_SIZE - 10; ey2 = y + CELL_SIZE - 12;
                } else if (dir[0] === -1) { // Left
                    ex1 = x + 10 - eyeSize; ey1 = y + 8;
                    ex2 = x + 10 - eyeSize; ey2 = y + CELL_SIZE - 12;
                } else if (dir[1] === -1) { // Up
                    ex1 = x + 8; ey1 = y + 10 - eyeSize;
                    ex2 = x + CELL_SIZE - 12; ey2 = y + 10 - eyeSize;
                } else { // Down
                    ex1 = x + 8; ey1 = y + CELL_SIZE - 10;
                    ex2 = x + CELL_SIZE - 12; ey2 = y + CELL_SIZE - 10;
                }

                ctx.beginPath(); ctx.arc(ex1 + 2, ey1 + 2, eyeSize, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(ex2 + 2, ey2 + 2, eyeSize, 0, Math.PI * 2); ctx.fill();

                // Pupil
                ctx.fillStyle = 'black';
                ctx.beginPath(); ctx.arc(ex1 + 2, ey1 + 2, 2.5, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(ex2 + 2, ey2 + 2, 2.5, 0, Math.PI * 2); ctx.fill();

            } else {
                // Body segments with rounded corners like Google Snake
                ctx.beginPath();
                ctx.roundRect(x, y, CELL_SIZE, CELL_SIZE, 6);
                ctx.fill();
            }
        });

        // Reset shadow
        ctx.shadowColor = 'transparent';

    }, [snake, food, dir]);

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="bg-[#4a752c] w-full max-w-[560px] p-4 rounded-t-2xl flex justify-between items-center text-white shadow-md">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 relative">
                        <div className="absolute inset-0 bg-red-500 rounded-full"></div>
                        <div className="absolute top-0 right-1/2 w-4 h-2 bg-green-200 transform -rotate-45"></div>
                    </div>
                    <span className="text-2xl font-bold">{score}</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-sm opacity-80">🏆 {highScore}</div>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={() => setIsPaused(p => !p)}>
                        {isPaused ? '▶️' : '⏸️'}
                    </Button>
                </div>
            </div>

            <div className="relative rounded-b-xl overflow-hidden shadow-2xl">
                <canvas
                    ref={canvasRef}
                    width={CANVAS_SIZE}
                    height={CANVAS_SIZE}
                    className="block cursor-pointer outline-none"
                    tabIndex={0}
                />

                {(!hasStarted && !gameOver) && (
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center animate-pulse">
                        <div className="bg-white/90 px-6 py-3 rounded-xl shadow-lg text-gray-800 font-bold">
                            Press Arrows to Start
                        </div>
                    </div>
                )}

                {gameOver && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center backdrop-blur-sm">
                        <div className="bg-white p-8 rounded-2xl shadow-2xl text-center transform scale-110">
                            <h3 className="text-3xl font-black text-gray-800 mb-2">Game Over</h3>
                            <p className="text-4xl font-bold text-[#4a752c] mb-6">{score}</p>
                            <div className="flex gap-4 justify-center">
                                <Button onClick={restartGame} size="lg" className="bg-[#4a752c] hover:bg-[#5a863c]">
                                    Play Again
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
