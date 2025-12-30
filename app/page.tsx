"use client";

import { Navbar } from "@/components/Navbar";
import { GameGrid, Game } from "@/components/GameGrid";

const games: Game[] = [
  { id: "mariokart", title: "Mario Kart DS", image: "", color: "linear-gradient(135deg, #E74C3C 0%, #3498DB 50%, #2ECC71 100%)", span: "col-span-2 md:col-span-2 row-span-2" },
  { id: "supersmashbros", title: "Super Smash Bros", image: "", color: "linear-gradient(135deg, #FF6B6B 0%, #4834D4 100%)", span: "col-span-2 md:col-span-2 row-span-2" },
  { id: "geometry-dash", title: "Geometry Dash Lite", image: "", color: "linear-gradient(135deg, #F1C40F 0%, #F39C12 100%)", span: "col-span-2 md:col-span-2 row-span-2" },
  { id: "hexgl", title: "HexGL", image: "", color: "linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)", span: "col-span-2 md:col-span-2 row-span-2" },
  { id: "chess", title: "Chess Online", image: "", color: "linear-gradient(135deg, #2c3e50 0%, #000000 100%)", span: "col-span-2 md:col-span-2 row-span-2" },
  { id: "wordle", title: "Wordle", image: "", color: "linear-gradient(135deg, #10b981 0%, #059669 100%)", span: "col-span-1 row-span-1" },
  { id: "runner", title: "Subway Runner", image: "", color: "linear-gradient(135deg, #a55eea 0%, #45aaf2 100%)", span: "col-span-1 row-span-1" },
  { id: "snake", title: "Google Snake", image: "", color: "linear-gradient(135deg, #6ab04c 0%, #badc58 100%)", span: "col-span-1 row-span-1" },
  { id: "tictactoe", title: "Tic Tac Toe", image: "", color: "linear-gradient(135deg, #FF6B6B 0%, #EE5253 100%)", span: "col-span-1 row-span-1" },
  { id: "memory", title: "Memory", image: "", color: "linear-gradient(135deg, #1DD1A1 0%, #10AC84 100%)", span: "col-span-1 row-span-1" },
  { id: "coming_soon", title: "More Soon", image: "", color: "linear-gradient(135deg, #778ca3 0%, #4b6584 100%)", span: "col-span-1 row-span-1" },
];

export default function Home() {
  return (
    <div className="min-h-screen pb-20 bg-background transition-colors duration-300">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 p-8 md:p-12 bg-primary rounded-3xl text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Welcome to GameHub!</h1>
            <p className="text-blue-100 font-medium text-lg md:text-xl max-w-xl">
              Discover the best free games. Sign up to play and track your high scores!
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span className="bg-orange-500 w-2 h-8 rounded-full"></span>
          Popular Games
        </h2>
        <GameGrid games={games} />
      </main>
    </div>
  );
}
