"use client";

import { useState } from 'react';
import { Button } from '../ui/Button';

export function Runner() {
    const [isPlaying, setIsPlaying] = useState(false);

    return (
        <div className="flex flex-col items-center gap-4 w-full h-full">
            <div className="relative w-full h-full min-h-[600px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-gray-900">
                {!isPlaying ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-cyan-900">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550951415-c2f82d8c30aa?q=80&w=2669&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                        <div className="relative z-10 text-center">
                            <Button
                                onClick={() => setIsPlaying(true)}
                                size="lg"
                                className="px-20 py-8 text-3xl font-black bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-[0_10px_0_rgba(0,0,0,0.3)] hover:shadow-[0_8px_0_rgba(0,0,0,0.3)] hover:translate-y-[2px] transition-all rounded-2xl"
                            >
                                ▶ PLAY
                            </Button>
                        </div>
                    </div>
                ) : (
                    <iframe
                        src="https://musaatif01.github.io/subwaysurfer/"
                        className="w-full h-full border-0 rounded-3xl"
                        allow="autoplay; fullscreen; gamepad"
                        title="Subway Surfers"
                    />
                )}
            </div>

            <div className="text-sm text-gray-500 font-medium">
                Hosted via GitHub Pages • Controls: Arrow Keys / Swipe
            </div>
        </div>
    );
}
