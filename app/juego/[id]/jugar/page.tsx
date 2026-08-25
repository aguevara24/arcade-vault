import { notFound } from "next/navigation";
import { GamePlayer } from "@/app/components/game-player";
import { GAMES } from "@/app/data/games";

export default async function PlayPage(props: PageProps<"/juego/[id]/jugar">) {
  const { id } = await props.params;
  const game = GAMES.find((g) => g.id === id);

  if (!game) notFound();

  return <GamePlayer game={game} />;
}
