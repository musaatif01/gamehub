import Link from 'next/link';
import { Card } from './ui/Card';

export interface Game {
    id: string;
    title: string;
    image: string; // URL or color gradient for now
    color: string;
    span?: string; // Tailwind class for spanning, e.g., "col-span-2 row-span-2"
}

interface GameGridProps {
    games: Game[];
}

export function GameGrid({ games }: GameGridProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 auto-rows-[200px] gap-4 p-4">
            {games.map((game, i) => (
                <Link
                    key={game.id}
                    href={game.id === 'coming_soon' ? '#' : `/play/${game.id}`}
                    className={game.span || "col-span-1 row-span-1"}
                >
                    <Card
                        hoverEffect
                        className={`w-full h-full flex flex-col items-center justify-center p-4 cursor-pointer overflow-hidden relative group border-0`}
                        style={{ background: game.color }}
                    >
                        {/* Simple visual representation for now */}
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />

                        <h3 className={`text-white font-extrabold text-center drop-shadow-md z-10 transform group-hover:scale-110 transition-transform duration-300 ${game.span?.includes('2') ? 'text-4xl' : 'text-xl'}`}>
                            {game.title}
                        </h3>

                        {game.id !== 'coming_soon' && (
                            <div className="absolute bottom-3 right-3 bg-white/20 p-1.5 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
                                    <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}

                        {game.id === 'coming_soon' && (
                            <div className="absolute top-2 right-2 bg-black/30 px-2 py-1 rounded text-white text-xs font-bold uppercase tracking-wider">
                                Soon
                            </div>
                        )}
                    </Card>
                </Link>
            ))}
        </div>
    );
}
