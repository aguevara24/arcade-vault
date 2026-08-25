import Link from "next/link";
import { notFound } from "next/navigation";
import { GAMES, seededScores } from "@/app/data/games";

export default async function GameDetailPage(props: PageProps<"/juego/[id]">) {
  const { id } = await props.params;
  const game = GAMES.find((g) => g.id === id);

  if (!game) notFound();

  const rows = seededScores(id.length * 23 + 7, 12);

  return (
    <div className="av-detail fade-in">
      <div>
        <div className="detail-cover">
          <div className={"cover-bg " + game.cover}></div>
        </div>

        <div className="leaderboard" style={{ marginTop: 24 }}>
          <h3>MEJORES PUNTUACIONES</h3>
          {rows.map((r, i) => (
            <div
              key={r.name + i}
              className={"lb-row" + (i === 0 ? " top1" : i === 1 ? " top2" : i === 2 ? " top3" : "")}
            >
              <div className="rk">#{String(r.rank).padStart(2, "0")}</div>
              <div className="pl">{r.name}</div>
              <div className="sc">{r.score.toLocaleString("es-ES")}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="detail-info">
        <h2>{game.title}</h2>
        <div className="detail-tags">
          <span>{game.cat}</span>
        </div>
        <p>{game.long}</p>

        <div className="stat-strip">
          <div>
            <div className="l">Mejor puntuación</div>
            <div className="v">{game.best.toLocaleString("es-ES")}</div>
          </div>
          <div>
            <div className="l">Partidas jugadas</div>
            <div className="v">{game.plays}</div>
          </div>
          <div>
            <div className="l">Categoría</div>
            <div className="v">{game.cat}</div>
          </div>
        </div>

        <div className="detail-actions">
          <Link href={`/juego/${game.id}/jugar`} className="btn xl pulse">
            JUGAR
          </Link>
          <Link href="/" className="btn ghost">
            VOLVER
          </Link>
        </div>
      </div>
    </div>
  );
}
