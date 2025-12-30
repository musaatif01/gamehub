"use client";

import { useState } from "react";
import { Button } from "./ui/Button";
import { useControls } from "./ControlsProvider";

interface ControlsModalProps {
    gameId: string;
    isOpen: boolean;
    onClose: () => void;
}

export function ControlsModal({ gameId, isOpen, onClose }: ControlsModalProps) {
    const { getControls, setControl, resetControls } = useControls();
    const [editingAction, setEditingAction] = useState<string | null>(null);
    const controls = getControls(gameId);

    if (!isOpen) return null;

    const handleKeyPress = (e: KeyboardEvent, action: string) => {
        e.preventDefault();
        setControl(gameId, action, e.code);
        setEditingAction(null);
    };

    const startEditing = (action: string) => {
        setEditingAction(action);
        const handler = (e: KeyboardEvent) => {
            handleKeyPress(e, action);
            window.removeEventListener('keydown', handler);
        };
        window.addEventListener('keydown', handler);
    };

    const getKeyLabel = (code: string) => {
        return code
            .replace('Key', '')
            .replace('Arrow', '↑ ')
            .replace('Space', 'Space')
            .replace('Up', '↑')
            .replace('Down', '↓')
            .replace('Left', '←')
            .replace('Right', '→');
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-gray-800">🎮 Controls</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
                </div>

                <div className="space-y-3 mb-6">
                    {Object.entries(controls).map(([action, key]) => (
                        <div key={action} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                            <span className="font-semibold capitalize text-gray-700">{action.replace(/([A-Z])/g, ' $1')}</span>
                            <button
                                onClick={() => startEditing(action)}
                                className={`px-4 py-2 rounded-lg font-mono font-bold transition-all ${editingAction === action
                                        ? 'bg-blue-500 text-white animate-pulse'
                                        : 'bg-white border-2 border-gray-300 text-gray-800 hover:border-blue-500'
                                    }`}
                            >
                                {editingAction === action ? 'Press any key...' : getKeyLabel(key)}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="flex gap-3">
                    <Button
                        variant="secondary"
                        onClick={() => resetControls(gameId)}
                        className="flex-1"
                    >
                        Reset to Default
                    </Button>
                    <Button
                        onClick={onClose}
                        className="flex-1"
                    >
                        Done
                    </Button>
                </div>
            </div>
        </div>
    );
}
