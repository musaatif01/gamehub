"use client";

import { useState } from "react";
import { Button } from "../ui/Button";

export function GeometryDash() {
    const [isPlaying, setIsPlaying] = useState(false);

    return (
        <div className="flex flex-col items-center gap-4 w-full h-full">
            <div className="relative w-full h-full min-h-[600px] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500">
                {!isPlaying ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                        <div className="relative z-10 text-center">
                            <h2 className="text-7xl font-black mb-8 text-white drop-shadow-2xl">
                                GEOMETRY DASH
                            </h2>
                            <Button
                                onClick={() => setIsPlaying(true)}
                                size="lg"
                                className="px-20 py-8 text-3xl font-black bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 shadow-[0_10px_0_rgba(0,0,0,0.3)] hover:shadow-[0_8px_0_rgba(0,0,0,0.3)] hover:translate-y-[2px] transition-all rounded-2xl"
                            >
                                ▶ PLAY
                            </Button>
                        </div>
                    </div>
                ) : (
                    <iframe
                        src="https://musaatif01.github.io/geometrydashlite/"
                        className="w-full h-full border-0"
                        allow="autoplay; fullscreen; gamepad"
                        title="Geometry Dash Lite"
                    />
                )}
            </div>

            <div className="text-sm text-gray-500 font-medium">
                Click 🎮 Controls button above to see controls
            </div>
        </div>
    );
}
