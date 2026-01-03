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

        const checkInput = () => {
            const gps = navigator.getGamepads();
            let active = false;

            for (const gp of gps) {
                if (gp) {
                    // Check buttons
                    for (const button of gp.buttons) {
                        if (button.pressed || button.value > 0.1) {
                            active = true;
                            break;
                        }
                    }
                    if (active) break;

                    // Check axes
                    for (const axis of gp.axes) {
                        if (Math.abs(axis) > 0.1) {
                            active = true;
                            break;
                        }
                    }
                    if (active) break;
                }
            }

            setIsInputActive(active);
            rafId = requestAnimationFrame(checkInput);
        };

        rafId = requestAnimationFrame(checkInput);

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
