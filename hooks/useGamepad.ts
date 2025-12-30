"use client";

import { useState, useEffect } from 'react';

export interface GamepadInfo {
    index: number;
    id: string;
}

export function useGamepad() {
    const [gamepads, setGamepads] = useState<GamepadInfo[]>([]);
    const [selectedGamepadIndex, setSelectedGamepadIndex] = useState<number | null>(null);
    const [isInputActive, setIsInputActive] = useState(false);

    useEffect(() => {
        let rafId: number;
        let lastInputTime = 0;

        const checkInput = () => {
            const gps = navigator.getGamepads();
            if (selectedGamepadIndex !== null) {
                const gp = gps[selectedGamepadIndex];
                if (gp) {
                    const hasButtonInput = gp.buttons.some(b => b.pressed || b.value > 0);
                    const hasAxisInput = gp.axes.some(a => Math.abs(a) > 0.1);

                    if (hasButtonInput || hasAxisInput) {
                        setIsInputActive(true);
                        lastInputTime = Date.now();
                    } else if (Date.now() - lastInputTime > 1000) {
                        // Reset activity after 1 second of no input
                        setIsInputActive(false);
                    }
                }
            }
            rafId = requestAnimationFrame(checkInput);
        };

        const updateGamepads = () => {
            const gps = navigator.getGamepads();
            const activeGps: GamepadInfo[] = [];
            for (let i = 0; i < gps.length; i++) {
                const gp = gps[i];
                if (gp) {
                    activeGps.push({ index: gp.index, id: gp.id });
                }
            }
            setGamepads(activeGps);

            // Set default if none selected
            if (activeGps.length > 0 && selectedGamepadIndex === null) {
                setSelectedGamepadIndex(activeGps[0].index);
            }
        };

        window.addEventListener("gamepadconnected", updateGamepads);
        window.addEventListener("gamepaddisconnected", updateGamepads);

        // Initial check
        updateGamepads();
        rafId = requestAnimationFrame(checkInput);

        return () => {
            window.removeEventListener("gamepadconnected", updateGamepads);
            window.removeEventListener("gamepaddisconnected", updateGamepads);
            cancelAnimationFrame(rafId);
        };
    }, [selectedGamepadIndex]);

    return {
        gamepads,
        selectedGamepadIndex,
        setSelectedGamepadIndex,
        isInputActive
    };
}
