"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/Button";

// Game imports
import { TicTacToe } from "@/components/games/TicTacToe";
import { Snake } from "@/components/games/Snake";
import { MemoryMatch } from "@/components/games/MemoryMatch";
import { Runner } from "@/components/games/Runner";
import { GeometryDash } from '@/components/games/GeometryDash';
import { MarioKart } from '@/components/games/MarioKart';
import { Wordle } from '@/components/games/Wordle';
import { Chess } from '@/components/games/Chess';
import { Leaderboard } from "@/components/Leaderboard";
import { ControlsModal } from "@/components/ControlsModal";
import { useAuth } from "@/components/AuthProvider";
import { useGamepad } from "@/hooks/useGamepad";

export default function PlayGamePage({ params }: { params: Promise<{ slug: string }> }) {
    const router = useRouter();
    const { user } = useAuth();
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(false);
    const { slug } = use(params);
    const { gamepads, selectedGamepadIndex, setSelectedGamepadIndex, isInputActive } = useGamepad();

    const isLargeGame = slug === 'supersmashbros' || slug === 'hexgl' || slug === 'chess';

    const toggleFullscreen = () => {
        const elem = document.getElementById('game-container');
        if (!elem) return;

        if (!document.fullscreenElement) {
            elem.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, []);

    const renderGame = () => {
        switch (slug) {
            case 'tictactoe':
                return <TicTacToe />;
            case 'snake':
                return <Snake />;
            case 'memory':
                return <MemoryMatch />;
            case 'runner':
                return <Runner />;
            case 'geometry-dash':
                return <GeometryDash />;
            case 'mariokart':
                return <MarioKart isFullscreen={isFullscreen} />;
            case 'wordle':
                return <Wordle />;
            case 'chess':
                return <Chess userId={user?.id} />;
            case 'supersmashbros':
                return (
                    <div className="w-full h-full flex flex-col items-center gap-4">
                        <iframe
                            src="https://musaatif01.github.io/supersmashbros/"
                            className="w-full h-[70vh] border-0 rounded-2xl bg-black"
                            allow="autoplay; fullscreen; gamepad"
                            title="Super Smash Bros"
                        />
                    </div>
                );
            case 'hexgl':
                return (
                    <div className="w-full h-full flex flex-col items-center gap-4">
                        <iframe
                            src="https://musaatif01.github.io/hexgl/"
                            className="w-full h-[70vh] border-0 rounded-2xl bg-black"
                            allow="autoplay; fullscreen; gamepad"
                            title="HexGL"
                        />
                    </div>
                );
            default:
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <div className="text-6xl mb-4">🎮</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Game Not Found</h2>
                        <p className="text-gray-600 mb-6">This game doesn't exist yet.</p>
                        <Button onClick={() => router.push("/")}>Back to Games</Button>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-background transition-colors duration-300">
            <Navbar />

            <main className="container mx-auto px-4 py-6 max-w-[1600px]">
                <div className={`grid grid-cols-1 ${isLargeGame ? '' : 'lg:grid-cols-[1fr_350px]'} gap-6`}>
                    <div id="game-container" className="flex flex-col gap-4 bg-white dark:bg-slate-950 rounded-3xl shadow-lg p-6 text-foreground overflow-x-auto">
                        <div className="flex justify-between items-center text-foreground uppercase">
                            <h1 className="text-2xl font-black capitalize">{slug.replace('-', ' ')}</h1>
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowControls(true)}
                                    title="Controls"
                                >
                                    🎮
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={toggleFullscreen}
                                    title="Toggle Fullscreen"
                                >
                                    {isFullscreen ? '🗗' : '⛶'}
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => router.push("/")}>Exit</Button>
                            </div>
                        </div>

                        <div className="flex-1 flex items-center justify-center bg-surface/50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-border p-4">
                            {renderGame()}
                        </div>

                        <style jsx global>{`
                            #game-container:fullscreen {
                                width: 100vw;
                                height: 100vh;
                                max-width: 100vw;
                                padding: 0;
                                border-radius: 0;
                                background: black;
                                display: flex;
                                flex-direction: column;
                            }
                            #game-container:fullscreen > div:first-of-type {
                                display: none;
                            }
                            #game-container:fullscreen > div:nth-of-type(2) {
                                flex: 1;
                                background: transparent;
                                border: none;
                                padding: 1rem;
                                margin: 0;
                                border-radius: 1rem;
                                overflow: hidden;
                            }
                        `}</style>
                    </div>

                    <div className={`flex flex-col gap-6 ${isLargeGame ? 'lg:grid lg:grid-cols-2' : ''}`}>
                        <Leaderboard gameId={slug} />

                        <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                            <h3 className="font-bold text-xl mb-2">Pro Tip 💡</h3>
                            <p className="text-blue-100 text-sm mb-4">Play daily to keep your spot on the leaderboard!</p>

                            {/* Controller Status Section */}
                            <div className="pt-4 border-t border-blue-400 mt-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xl">🎮</span>
                                    <h4 className="font-bold text-sm uppercase tracking-wider">Controller Status</h4>
                                </div>
                                {gamepads.length > 0 ? (
                                    <div className="space-y-3">
                                        <div className={`flex items-center gap-2 text-xs bg-white ${isInputActive ? 'text-green-600' : 'text-blue-600'} px-3 py-1.5 rounded-lg font-bold transition-colors duration-200`}>
                                            <span className={`w-2 h-2 ${isInputActive ? 'bg-green-500 scale-125' : 'bg-green-400'} rounded-full animate-pulse capitalize`} />
                                            {gamepads.find(g => g.index === selectedGamepadIndex)?.id.split('(')[0] || 'Controller Connected'}
                                            {isInputActive && <span className="ml-auto text-[10px] animate-bounce">ACTIVE</span>}
                                        </div>
                                        {gamepads.length > 1 && (
                                            <select
                                                className="w-full bg-blue-700 border border-blue-500 rounded-lg px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-white"
                                                value={selectedGamepadIndex || ''}
                                                onChange={(e) => setSelectedGamepadIndex(Number(e.target.value))}
                                            >
                                                {gamepads.map(gp => (
                                                    <option key={gp.index} value={gp.index}>
                                                        {gp.id.substring(0, 20)}...
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                        <p className="text-[10px] text-blue-200">Gamepad is ready for all supported games!</p>
                                    </div>
                                ) : (
                                    <p className="text-xs text-blue-200 italic">No controller detected. Press any button to connect.</p>
                                )}
                            </div>
                        </div>

                        {/* Controls Display for Mario Kart */}
                        {slug === 'mariokart' && (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-800">
                                <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                                    <span>🎮</span> Controls
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Move/Steer:</span>
                                        <span className="font-mono font-bold">Arrow Keys</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Accelerate:</span>
                                        <span className="font-mono font-bold">X</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Brake:</span>
                                        <span className="font-mono font-bold">Z</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Use Item:</span>
                                        <span className="font-mono font-bold">Q</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Drift:</span>
                                        <span className="font-mono font-bold">E</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <ControlsModal gameId={slug} isOpen={showControls} onClose={() => setShowControls(false)} />
        </div>
    );
}
