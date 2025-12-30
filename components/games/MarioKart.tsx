"use client";

import { useState } from "react";
import { Button } from "../ui/Button";

export function MarioKart({ isFullscreen }: { isFullscreen?: boolean }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasError, setHasError] = useState(false);

    return (
        <div className="flex flex-col items-center gap-4 w-full h-full">
            <div className={`relative w-full h-full ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'min-h-[700px] rounded-2xl'} overflow-hidden shadow-2xl bg-black transition-all duration-300`}>
                {isPlaying && isFullscreen && (
                    <button
                        onClick={() => document.exitFullscreen()}
                        className="absolute top-4 right-4 z-[60] bg-black/50 hover:bg-black/80 text-white p-2 rounded-full transition-colors"
                        title="Exit Fullscreen"
                    >
                        ✕
                    </button>
                )}
                {!isPlaying ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-red-600 via-blue-600 to-green-600">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                        <div className="relative z-10 text-center">
                            <h2 className="text-7xl font-black mb-8 text-white drop-shadow-2xl" style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}>
                                MARIO KART DS
                            </h2>
                            <Button
                                onClick={() => setIsPlaying(true)}
                                size="lg"
                                className="px-20 py-8 text-3xl font-black bg-gradient-to-r from-red-500 to-yellow-500 hover:from-red-400 hover:to-yellow-400 shadow-[0_10px_0_rgba(0,0,0,0.3)] hover:shadow-[0_8px_0_rgba(0,0,0,0.3)] hover:translate-y-[2px] transition-all rounded-2xl"
                            >
                                ▶ PLAY
                            </Button>
                        </div>
                    </div>
                ) : hasError ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white p-8">
                        <div className="text-center max-w-md">
                            <div className="text-6xl mb-4">🚧</div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">Game Error</h3>
                            <p className="text-gray-600 mb-6">
                                Could not load the game. Please check your connection.
                            </p>
                            <Button onClick={() => { setIsPlaying(false); setHasError(false); }} className="mt-6">
                                Try Again
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
                        <iframe
                            src="https://musaatif01.github.io/mariokartds/"
                            className="absolute border-0 transition-all duration-500"
                            style={isFullscreen ? {
                                width: '100%',
                                height: '200%', // Doubled height to allow better scaling of the top screen
                                transform: 'scale(1.1) translateY(0%)', // Focus on the top screen
                                transformOrigin: 'top center',
                                top: 0,
                                left: 0,
                                position: 'absolute'
                            } : {
                                width: '100%',
                                height: '100%',
                                top: '0',
                                left: '0',
                                transform: 'scale(1)',
                            }}
                            allow="autoplay; fullscreen; gamepad"
                            title="Mario Kart DS"
                            onError={() => setHasError(true)}
                        />
                    </div>
                )}
            </div>

            {!isFullscreen && (
                <div className="text-sm text-gray-500 font-medium">
                    Controls: <b>Q</b> to use item • <b>X</b> to accelerate • <b>E</b> to drift • Click 🎮 for all
                </div>
            )}
        </div>
    );
}
