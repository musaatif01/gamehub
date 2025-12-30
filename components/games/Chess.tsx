"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { Chess as ChessLogic } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';

interface ChessProps {
    gameId?: string;
    userId?: string;
}

export function Chess({ gameId: initialGameId, userId }: ChessProps) {
    const [game, setGame] = useState(new ChessLogic());
    const [gameId, setGameId] = useState<string | null>(initialGameId || null);
    const [status, setStatus] = useState<'local' | 'waiting' | 'playing' | 'ended' | 'ai'>('local');
    const [playerColor, setPlayerColor] = useState<'white' | 'black'>('white');
    const [moveHistory, setMoveHistory] = useState<string[]>([]);
    const [rightClickedSquares, setRightClickedSquares] = useState<Record<string, any>>({});
    const [optionSquares, setOptionSquares] = useState<Record<string, any>>({});
    const [moveFrom, setMoveFrom] = useState<string | null>(null);
    const [onlineCount, setOnlineCount] = useState(0);
    const [isThinking, setIsThinking] = useState(false);

    // Sync state with local game object
    const updateGame = useCallback((modify: (g: ChessLogic) => void) => {
        setGame((g) => {
            const update = new ChessLogic(g.fen());
            modify(update);
            return update;
        });
    }, []);

    // Online players tracking
    useEffect(() => {
        const channel = supabase.channel('online-players', {
            config: {
                presence: {
                    key: userId || 'guest-' + Math.random().toString(36).substr(2, 9),
                },
            },
        });

        channel
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();
                setOnlineCount(Object.keys(state).length);
            })
            .on('presence', { event: 'join' }, ({ newPresences }) => {
                // Handle join
            })
            .on('presence', { event: 'leave' }, ({ leftPresences }) => {
                // Handle leave
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({ online_at: new Date().toISOString() });
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    // Handle online move
    useEffect(() => {
        if (!gameId) return;

        const channel = supabase
            .channel(`chess-game-${gameId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'chess_moves', filter: `game_id=eq.${gameId}` },
                (payload) => {
                    const move = payload.new.move;
                    setGame((prevGame) => {
                        const newGame = new ChessLogic(prevGame.fen());
                        try {
                            newGame.move(move);
                            setMoveHistory(newGame.history());
                            return newGame;
                        } catch (e) {
                            return prevGame;
                        }
                    });
                }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'chess_games', filter: `id=eq.${gameId}` },
                (payload) => {
                    const newFen = payload.new.fen;
                    const newStatus = payload.new.status;
                    setGame((prevGame) => {
                        if (newFen !== prevGame.fen()) {
                            const newGame = new ChessLogic(newFen);
                            setMoveHistory(newGame.history());
                            return newGame;
                        }
                        return prevGame;
                    });
                    if (newStatus === 'playing') setStatus('playing');
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [gameId]); // Removed game dependency to avoid loop

    // AI Move Logic
    useEffect(() => {
        if (status === 'ai' && game.turn() === 'b' && !game.isGameOver()) {
            const timer = setTimeout(makeComputerMove, 1000);
            return () => clearTimeout(timer);
        }
    }, [status, game]);

    function makeComputerMove() {
        const verboseMoves = game.moves({ verbose: true });
        if (verboseMoves.length === 0) return;

        // Simple Heuristic: 
        // 1. Try to capture a piece (prioritize high value)
        // 2. Otherwise pick a random legal move

        const moveWeights: Record<string, number> = {
            'q': 90,
            'r': 50,
            'b': 30,
            'n': 30,
            'p': 10,
        };

        let bestMove = verboseMoves[Math.floor(Math.random() * verboseMoves.length)];
        let bestScore = -1;

        verboseMoves.forEach(move => {
            let score = 0;
            if (move.captured) {
                score = moveWeights[move.captured] || 0;
            }
            if (move.san.includes('#')) score += 1000;
            if (move.san.includes('+')) score += 5;

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        });

        makeAMove(bestMove);
    }

    function makeAMove(move: { from: string; to: string; promotion?: string } | string) {
        const gameCopy = new ChessLogic(game.fen());
        try {
            const result = gameCopy.move(move);
            if (result) {
                setGame(gameCopy);
                setMoveHistory(gameCopy.history());
                setRightClickedSquares({});
                setOptionSquares({});
                setMoveFrom(null);

                if (gameId) {
                    supabase.from('chess_moves').insert({
                        game_id: gameId,
                        move: result.san,
                        move_number: Math.floor(gameCopy.history().length / 2) + 1
                    }).then();

                    supabase.from('chess_games').update({
                        fen: gameCopy.fen(),
                        last_move_at: new Date().toISOString()
                    }).eq('id', gameId).then();
                }
                return true;
            }
        } catch (e) {
            return false;
        }
        return false;
    }

    function onDrop(sourceSquare: string, targetSquare: string) {
        if (status === 'playing' && game.turn() !== (playerColor === 'white' ? 'w' : 'b')) {
            return false;
        }

        if (status === 'ai' && game.turn() === 'b') {
            return false;
        }

        return makeAMove({
            from: sourceSquare,
            to: targetSquare,
            promotion: 'q',
        });
    }

    function onSquareClick(square: string) {
        setRightClickedSquares({});

        // If it's the player's turn or local play
        if (status === 'playing' && game.turn() !== (playerColor === 'white' ? 'w' : 'b')) {
            return;
        }

        if (status === 'ai' && game.turn() === 'b') {
            return;
        }

        // Handle move if a piece was already selected
        if (moveFrom) {
            const move = makeAMove({
                from: moveFrom,
                to: square,
                promotion: 'q',
            });

            if (move) return;
        }

        // Highlight valid moves for the clicked piece
        const moves = game.moves({
            square: square as any,
            verbose: true
        });

        if (moves.length === 0) {
            setOptionSquares({});
            setMoveFrom(null);
            return;
        }

        setMoveFrom(square);
        const newSquares: Record<string, any> = {};
        moves.forEach((move) => {
            const targetPiece = game.get(move.to as any);
            const sourcePiece = game.get(square as any);
            newSquares[move.to] = {
                background:
                    targetPiece && sourcePiece && targetPiece.color !== sourcePiece.color
                        ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
                        : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
                borderRadius: '50%',
            };
        });
        newSquares[square] = {
            background: 'rgba(255, 255, 0, 0.4)',
        };
        setOptionSquares(newSquares);
    }

    function onSquareRightClick(square: string) {
        setRightClickedSquares((prev) => {
            const newStyles = { ...prev };
            if (newStyles[square]) {
                delete newStyles[square];
            } else {
                newStyles[square] = { backgroundColor: 'rgba(255, 0, 0, 0.4)' };
            }
            return newStyles;
        });
    }

    const startMatchmaking = async () => {
        if (!userId) {
            alert("Please log in to play online!");
            return;
        }

        setStatus('waiting');

        // Find a waiting game
        const { data: waitingGames } = await supabase
            .from('chess_games')
            .select('*')
            .eq('status', 'waiting')
            .is('black_player_id', null)
            .neq('white_player_id', userId)
            .limit(1);

        if (waitingGames && waitingGames.length > 0) {
            const hostGame = waitingGames[0];
            const { error } = await supabase
                .from('chess_games')
                .update({
                    black_player_id: userId,
                    status: 'playing'
                })
                .eq('id', hostGame.id);

            if (!error) {
                setGameId(hostGame.id);
                setPlayerColor('black');
                setStatus('playing');
                // Sync game state
                const syncGame = new ChessLogic(hostGame.fen);
                setGame(syncGame);
                setMoveHistory(syncGame.history());
            }
        } else {
            // Create a new game
            const { data: newGame, error } = await supabase
                .from('chess_games')
                .insert({
                    white_player_id: userId,
                    status: 'waiting',
                    fen: new ChessLogic().fen()
                })
                .select()
                .single();

            if (!error && newGame) {
                setGameId(newGame.id);
                setPlayerColor('white');
            }
        }
    };

    const Board = Chessboard as any;

    const ranks = playerColor === 'white' ? ['8', '7', '6', '5', '4', '3', '2', '1'] : ['1', '2', '3', '4', '5', '6', '7', '8'];
    const files = playerColor === 'white' ? ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] : ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'];

    const startLocalGame = () => {
        setGame(new ChessLogic());
        setMoveHistory([]);
        setStatus('local');
        setGameId(null);
        setRightClickedSquares({});
        setOptionSquares({});
        setMoveFrom(null);
    };

    const startAiGame = () => {
        setGame(new ChessLogic());
        setMoveHistory([]);
        setStatus('ai');
        setPlayerColor('white');
        setGameId(null);
        setRightClickedSquares({});
        setOptionSquares({});
        setMoveFrom(null);
    };

    return (
        <div className="flex flex-col xl:flex-row gap-8 w-full max-w-[1400px] mx-auto p-8 bg-[#1e293b] rounded-[2.5rem] shadow-2xl border border-white/10">
            {/* Board Section */}
            <div className="flex-1 max-w-[800px] mx-auto">
                <div className="relative p-10 bg-[#0f172a] rounded-[2rem] border border-white/5 shadow-inner flex flex-col items-center">
                    <div className="flex w-full">
                        {/* Rank Labels */}
                        <div className="flex flex-col justify-around pr-6 py-2 font-black text-slate-500 text-sm select-none">
                            {ranks.map(rank => <div key={rank}>{rank}</div>)}
                        </div>

                        <div className="flex-1 relative aspect-square shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-lg overflow-hidden border border-slate-800">
                            <Board
                                position={game.fen()}
                                onPieceDrop={onDrop}
                                onSquareClick={onSquareClick}
                                onSquareRightClick={onSquareRightClick}
                                boardOrientation={playerColor}
                                customDarkSquareStyle={{ backgroundColor: '#1e293b' }}
                                customLightSquareStyle={{ backgroundColor: '#334155' }}
                                customSquareStyles={{ ...optionSquares, ...rightClickedSquares }}
                                showBoardNotation={false}
                                animationDuration={300}
                                customPieces={{
                                    // Custom piece rendering if needed, but default is fine for now
                                }}
                                boardStyle={{
                                    borderRadius: '4px',
                                    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)'
                                }}
                            />
                        </div>
                    </div>

                    {/* File Labels */}
                    <div className="flex w-full pl-8">
                        <div className="flex flex-1 justify-around pt-6 font-black text-slate-500 text-sm select-none">
                            {files.map(file => <div key={file}>{file}</div>)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar Section */}
            <div className="w-full xl:w-[400px] flex flex-col gap-6 bg-[#2d3748] p-8 rounded-[2rem] border border-white/5 shadow-xl">
                <div className="flex items-center justify-between bg-black/20 p-4 rounded-2xl border border-white/5">
                    <div className="flex flex-col">
                        <h3 className="text-3xl font-black text-white flex items-center gap-3 tracking-tighter">
                            <span className="text-4xl">♟️</span> CHESS
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <p className="text-[10px] text-green-100 font-extrabold uppercase tracking-widest">{onlineCount} Players Online</p>
                        </div>
                    </div>
                    <div className="px-4 py-2 bg-blue-600/20 border border-blue-400/30 rounded-xl">
                        <p className="text-[10px] text-blue-200 font-bold uppercase tracking-widest text-center">
                            {status === 'local' ? 'Pass & Play' : status === 'ai' ? 'VS Computer' : 'Online Match'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-center py-4 bg-black/40 rounded-2xl border border-white/5 shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all duration-300 ${game.turn() === 'w' ? 'bg-white shadow-[0_0_20px_white] scale-105' : 'bg-white/5'}`}>
                            <span className={`w-3 h-3 rounded-full ${game.turn() === 'w' ? 'bg-blue-600' : 'bg-white/20'}`} />
                            <span className={`font-black uppercase tracking-tighter text-sm ${game.turn() === 'w' ? 'text-blue-900' : 'text-white/20'}`}>WHITE</span>
                        </div>
                        <div className="text-slate-600 font-black text-xl italic">VS</div>
                        <div className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all duration-300 ${game.turn() === 'b' ? 'bg-orange-500 shadow-[0_0_20px_#f97316] scale-105' : 'bg-white/5'}`}>
                            <span className={`w-3 h-3 rounded-full ${game.turn() === 'b' ? 'bg-white' : 'bg-white/20'}`} />
                            <span className={`font-black uppercase tracking-tighter text-sm ${game.turn() === 'b' ? 'text-white' : 'text-white/20'}`}>BLACK</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto min-h-[250px] max-h-[400px] bg-black/30 rounded-2xl p-6 border border-white/5 font-mono text-sm custom-scrollbar shadow-inner">
                    {moveHistory.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 italic space-y-4">
                            <span className="text-6xl opacity-10">♖</span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700">Awaiting Move</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-1">
                            {Array.from({ length: Math.ceil(moveHistory.length / 2) }).map((_, i) => (
                                <div key={i} className="flex gap-4 items-center group/move hover:bg-white/5 p-2 rounded-xl transition-all border border-transparent hover:border-white/10">
                                    <span className="text-slate-600 w-8 font-black text-xs text-right italic">{i + 1}.</span>
                                    <div className="flex-1 flex justify-between gap-3">
                                        <div className="flex-1 bg-white/5 px-3 py-2 rounded-lg text-white font-bold text-center text-xs shadow-sm border border-white/5">
                                            {moveHistory[i * 2]}
                                        </div>
                                        {moveHistory[i * 2 + 1] ? (
                                            <div className="flex-1 bg-white/10 px-3 py-2 rounded-lg text-white font-bold text-center text-xs shadow-md border border-white/10">
                                                {moveHistory[i * 2 + 1]}
                                            </div>
                                        ) : (
                                            <div className="flex-1" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-4 mt-auto">
                    {(status === 'local' || status === 'ended') && (
                        <>
                            <Button
                                onClick={startMatchmaking}
                                className="w-full py-6 text-xl font-black bg-blue-600 hover:bg-blue-500 text-white rounded-2xl shadow-[0_8px_0_0_#1e40af] active:shadow-none active:translate-y-2 transition-all transform hover:scale-[1.02]"
                            >
                                PLAY ONLINE 🌐
                            </Button>
                            <Button
                                onClick={startAiGame}
                                className="w-full py-6 text-xl font-black bg-orange-600 hover:bg-orange-500 text-white rounded-2xl shadow-[0_8px_0_0_#9a3412] active:shadow-none active:translate-y-2 transition-all transform hover:scale-[1.02]"
                            >
                                VS COMPUTER 🤖
                            </Button>
                        </>
                    )}

                    {(status === 'playing' || status === 'ai' || status === 'waiting') && (
                        <Button
                            onClick={startLocalGame}
                            className="w-full py-6 text-lg font-black bg-slate-600 hover:bg-slate-500 text-white rounded-2xl shadow-[0_6px_0_0_#1e293b] active:shadow-none active:translate-y-1.5 transition-all uppercase tracking-tighter"
                        >
                            {status === 'waiting' ? 'Cancel Matchmaking' : 'Back to Pass & Play 🤝'}
                        </Button>
                    )}

                    {status === 'waiting' && (
                        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4">
                            <div className="text-center py-8 bg-slate-800 border border-white/10 rounded-2xl animate-pulse flex flex-col items-center gap-2">
                                <span className="text-2xl">⚡</span>
                                <span className="text-white font-black tracking-[0.3em] text-[10px] uppercase">Matching with Global Players...</span>
                            </div>
                        </div>
                    )}

                    {status === 'local' && (
                        <Button
                            variant="ghost"
                            onClick={startLocalGame}
                            className="w-full py-4 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] border border-transparent hover:border-white/5 transition-all"
                        >
                            Reset Board
                        </Button>
                    )}
                </div>

                {game.isGameOver() && (
                    <div className="mt-4 p-8 bg-orange-500/20 border-2 border-orange-500/50 rounded-3xl text-orange-200 text-center font-black uppercase tracking-widest italic animate-bounce shadow-2xl shadow-orange-500/20">
                        <div className="text-3xl mb-2">🏆</div>
                        {game.isCheckmate() ? 'CHECKMATE!' : game.isDraw() ? 'DRAW GAME' : 'GAME OVER'}
                    </div>
                )}
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
            `}</style>
        </div>
    );
}
