import { PlayGameClient } from "@/components/PlayGameClient";

export function generateStaticParams() {
    return [
        { slug: 'mariokart' },
        { slug: 'supersmashbros' },
        { slug: 'geometry-dash' },
        { slug: 'hexgl' },
        { slug: 'chess' },
        { slug: 'wordle' },
        { slug: 'runner' },
        { slug: 'snake' },
        { slug: 'tictactoe' },
        { slug: 'memory' },
    ];
}

export default async function PlayGamePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    return <PlayGameClient slug={slug} />;
}
