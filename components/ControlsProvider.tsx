"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

// Default control schemes for different games
const DEFAULT_CONTROLS = {
    mariokart: {
        up: 'ArrowUp',
        down: 'ArrowDown',
        left: 'ArrowLeft',
        right: 'ArrowRight',
        accelerate: 'KeyX',
        brake: 'KeyZ',
        item: 'Space',
    },
    snake: {
        up: 'ArrowUp',
        down: 'ArrowDown',
        left: 'ArrowLeft',
        right: 'ArrowRight',
    },
    runner: {
        left: 'ArrowLeft',
        right: 'ArrowRight',
        jump: 'Space',
    },
    general: {
        pause: 'KeyP',
        restart: 'KeyR',
        fullscreen: 'KeyF',
    }
};

interface ControlsContextType {
    getControls: (gameId: string) => Record<string, string>;
    setControl: (gameId: string, action: string, key: string) => void;
    resetControls: (gameId: string) => void;
    getAllControls: () => Record<string, Record<string, string>>;
}

const ControlsContext = createContext<ControlsContextType | undefined>(undefined);

export function ControlsProvider({ children }: { children: ReactNode }) {
    const [controls, setControls] = useState<Record<string, Record<string, string>>>({});

    useEffect(() => {
        // Load controls from localStorage
        const savedControls = localStorage.getItem('gamehub_controls');
        if (savedControls) {
            setControls(JSON.parse(savedControls));
        } else {
            setControls(DEFAULT_CONTROLS);
            localStorage.setItem('gamehub_controls', JSON.stringify(DEFAULT_CONTROLS));
        }
    }, []);

    const getControls = (gameId: string) => {
        return controls[gameId] || DEFAULT_CONTROLS[gameId as keyof typeof DEFAULT_CONTROLS] || {};
    };

    const setControl = (gameId: string, action: string, key: string) => {
        setControls(prev => {
            const newControls = {
                ...prev,
                [gameId]: {
                    ...prev[gameId],
                    [action]: key
                }
            };
            localStorage.setItem('gamehub_controls', JSON.stringify(newControls));
            return newControls;
        });
    };

    const resetControls = (gameId: string) => {
        setControls(prev => {
            const newControls = {
                ...prev,
                [gameId]: DEFAULT_CONTROLS[gameId as keyof typeof DEFAULT_CONTROLS]
            };
            localStorage.setItem('gamehub_controls', JSON.stringify(newControls));
            return newControls;
        });
    };

    const getAllControls = () => {
        return controls;
    };

    return (
        <ControlsContext.Provider value={{ getControls, setControl, resetControls, getAllControls }}>
            {children}
        </ControlsContext.Provider>
    );
}

export function useControls() {
    const context = useContext(ControlsContext);
    if (!context) {
        throw new Error('useControls must be used within ControlsProvider');
    }
    return context;
}
