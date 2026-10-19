"use client";

import Link from "next/link";
import { GAMES, RECENT_ACTIVITY, TOP_PLAYERS_TODAY } from "@/app/data/games";
import { GameMiniCard } from "@/app/components/game-mini-card";
import { Reveal } from "@/app/components/reveal";

const FEATURES = [
  {
    kind: "JOYSTICK",
    title: "JUEGOS CLÁSICOS",
    desc: "Arkanoid, Tetris, Snake y muchos más. Los mejores arcades de todos los tiempos en un solo lugar.",
    color: "cyan",
  },
  {
    kind: "FREE",
    title: "100% GRATIS",
    desc: "Sin suscripciones, sin pagos ocultos. Todos los juegos disponibles de forma gratuita.",
    color: "yellow",
  },
  {
    kind: "TROPHY",
    title: "LADDER BOARDS",
    desc: "Compite con jugadores de todo el mundo. Escala el ranking y demuestra quién es el mejor.",
    color: "magenta",
  },
  {
    kind: "ROCKET",
    title: "SIEMPRE CRECIENDO",
    desc: "Agregamos nuevos juegos constantemente. Vuelve seguido, siempre habrá algo nuevo que jugar.",
    color: "green",
  },
];

const SILOS = [
  { cls: "s1" },
  { cls: "s2" },
  { cls: "s3" },
  { cls: "s4" },
  { cls: "s5" },
  { cls: "s6" },
  { cls: "s7" },
  { cls: "s8" },
];

const NAME_COLORS = ["neon-cyan", "neon-magenta", "neon-yellow", "neon-green"];

function toTitleCase(s: string) {
  return s
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function FeatureIcon({ kind }: { kind: string }) {
  const C = "currentColor";
  if (kind === "JOYSTICK")
    return (
      <svg className="ft-icon" viewBox="0 0 16 16">
        <g fill={C}>
          <rect x="6" y="2" width="4" height="6" />
          <rect x="4" y="8" width="8" height="2" />
          <rect x="3" y="10" width="10" height="3" />
          <rect x="4" y="13" width="2" height="2" />
          <rect x="10" y="13" width="2" height="2" />
        </g>
      </svg>
    );
  if (kind === "FREE")
    return (
      <svg className="ft-icon" viewBox="0 0 16 16">
        <g fill={C}>
          <rect x="6" y="1" width="4" height="2" />
          <rect x="4" y="3" width="8" height="2" />
          <rect x="3" y="5" width="10" height="6" />
          <rect x="4" y="11" width="8" height="2" />
          <rect x="6" y="13" width="4" height="2" />
          <rect x="7" y="4" width="2" height="8" fill="#0a0a0f" />
        </g>
      </svg>
    );
  if (kind === "TROPHY")
    return (
      <svg className="ft-icon" viewBox="0 0 16 16">
        <g fill={C}>
          <rect x="4" y="2" width="8" height="5" />
          <rect x="2" y="3" width="2" height="3" />
          <rect x="12" y="3" width="2" height="3" />
          <rect x="6" y="7" width="4" height="3" />
          <rect x="4" y="10" width="8" height="2" />
          <rect x="5" y="12" width="6" height="2" />
        </g>
      </svg>
    );
  if (kind === "ROCKET")
    return (
      <svg className="ft-icon" viewBox="0 0 16 16">
        <g fill={C}>
          <rect x="7" y="1" width="2" height="3" />
          <rect x="6" y="4" width="4" height="5" />
          <rect x="5" y="9" width="2" height="3" />
          <rect x="9" y="9" width="2" height="3" />
          <rect x="7" y="9" width="2" height="4" />
          <rect x="4" y="6" width="2" height="3" />
          <rect x="10" y="6" width="2" height="3" />
        </g>
      </svg>
    );
  return null;
}

function SiloIcon() {
  return (
    <svg className="silo-icon" viewBox="0 0 16 16" width="100%" height="100%">
      <g fill="currentColor">
        <rect x="4" y="2" width="8" height="2" />
        <rect x="2" y="4" width="12" height="6" />
        <rect x="4" y="10" width="2" height="2" />
        <rect x="10" y="10" width="2" height="2" />
        <rect x="4" y="6" width="2" height="2" fill="#0a0a0f" />
        <rect x="10" y="6" width="2" height="2" fill="#0a0a0f" />
      </g>
    </svg>
  );
}

export default function Home() {
  const featured = GAMES.slice(0, 6);

  return (
    <div className="home fade-in">
      <Reveal />
      <section className="home-hero">
        <div className="home-silos">
          {SILOS.map((s) => (
            <div key={s.cls} className={"silo " + s.cls} style={{ aspectRatio: "1 / 1" }}>
              <SiloIcon />
            </div>
          ))}
        </div>

        <div className="home-hero-inner">
          <div className="hero-eyebrow pixel neon-yellow">▸ INSERTA UNA MONEDA_</div>
          <h1 className="home-title">
            <span className="line-1">EL ARCADE</span>
            <span className="line-2">CLÁSICO ESTÁ</span>
            <span className="line-3">DE VUELTA</span>
          </h1>
          <p className="home-sub">
            Juega los mejores clásicos directamente en tu navegador.
            <br />
            Sin descargas. Sin costo. Solo diversión.
          </p>
          <div className="home-ctas">
            <Link href="/games" className="btn lg">
              ▶ EXPLORAR JUEGOS
            </Link>
            <Link href="/iniciar-sesion" className="btn magenta lg">
              ✦ CREAR CUENTA
            </Link>
          </div>
        </div>

        <div className="hero-scroll">
          <span>DESLIZA</span>
          <span className="arrow">▼</span>
        </div>
      </section>

      <section className="home-section reveal">
        <div className="section-head">
          <span className="kicker pixel neon-magenta">{"// 01"}</span>
          <h2 className="section-title">¿POR QUÉ ARCADE VAULT?</h2>
          <div className="section-rule"></div>
        </div>
        <div className="feature-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className={"feature-card " + f.color}>
              <FeatureIcon kind={f.kind} />
              <div className="ft-title">{f.title}</div>
              <div className="ft-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="home-section reveal">
        <div className="section-head">
          <span className="kicker pixel neon-magenta">{"// 02"}</span>
          <h2 className="section-title">JUEGOS DISPONIBLES AHORA</h2>
          <div className="section-rule"></div>
        </div>
        <div className="mini-rail">
          {featured.map((g) => (
            <GameMiniCard key={g.id} game={g} />
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 28 }}>
          <Link href="/games" className="btn ghost">
            VER TODOS LOS JUEGOS →
          </Link>
        </div>
      </section>

      <section className="home-stats reveal">
        <div className="stats-inner">
          <div className="stat-block">
            <div className="stat-n neon-cyan">{GAMES.length}+</div>
            <div className="stat-u">JUEGOS</div>
            <div className="stat-s">Y CONTANDO</div>
          </div>
          <div className="stat-block">
            <div className="stat-n neon-magenta">MILES</div>
            <div className="stat-u">DE PARTIDAS</div>
            <div className="stat-s">JUGADAS CADA DÍA</div>
          </div>
          <div className="stat-block">
            <div className="stat-n neon-yellow">GLOBAL</div>
            <div className="stat-u">RANKING</div>
            <div className="stat-s">COMPITE CON EL MUNDO</div>
          </div>
        </div>
      </section>

      <section className="home-section reveal">
        <div className="section-head">
          <span className="kicker pixel neon-magenta">{"// 03"}</span>
          <h2 className="section-title">ACTIVIDAD EN VIVO</h2>
          <div className="section-rule"></div>
        </div>
        <div className="activity-grid">
          <div className="activity-card">
            <div className="ac-head">
              <span className="ac-title pixel">▸ ÚLTIMAS PUNTUACIONES</span>
              <span className="live-led">
                <span></span>LIVE
              </span>
            </div>
            <div className="ticker">
              {RECENT_ACTIVITY.map((row, i) => {
                const game = GAMES.find((g) => g.id === row.gameId)!;
                return (
                  <div key={row.name + i} className="tick-row" style={{ animationDelay: `${i * 60}ms` }}>
                    <span className={"tk-p " + NAME_COLORS[i % NAME_COLORS.length]}>{row.name}</span>
                    <span className="tk-mid">▸ {toTitleCase(game.title)}</span>
                    <span className="tk-s">+{row.score.toLocaleString("es-ES")}</span>
                    <span className="tk-t">{row.ago}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="activity-card">
            <div className="ac-head">
              <span className="ac-title pixel">▸ TOP JUGADORES · HOY</span>
              <Link href="/salon-de-la-fama" className="lb-link">
                VER SALÓN →
              </Link>
            </div>
            <div className="top-list">
              {TOP_PLAYERS_TODAY.map((p) => (
                <div
                  key={p.rank}
                  className={"top-row" + (p.rank === 1 ? " top1" : p.rank === 2 ? " top2" : p.rank === 3 ? " top3" : "")}
                >
                  <span className="tp-rk">#{String(p.rank).padStart(2, "0")}</span>
                  <span className="tp-p">{p.name}</span>
                  <span className="tp-s">{p.score.toLocaleString("es-ES")}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="home-section reveal">
        <div className="section-head">
          <span className="kicker pixel neon-magenta">{"// 04"}</span>
          <h2 className="section-title">PRECIOS</h2>
          <div className="section-rule"></div>
        </div>
        <div className="pricing-grid">
          <div className="price-card">
            <div className="pc-stamp pixel">
              FREE
              <br />
              PLAY
            </div>
            <div className="pc-label pixel">PLAN ÚNICO</div>
            <div className="pc-name pixel">JUGADOR VAULT</div>
            <div className="pc-amount">
              <span className="pc-amount-n">$0</span>
              <span className="pc-amount-u">/ SIEMPRE</span>
            </div>
            <div className="pc-tag">SIN TRUCOS · SIN LETRA PEQUEÑA</div>
            <ul className="pc-list">
              <li>Acceso a todos los juegos</li>
              <li>Ranking global y salón de la fama</li>
              <li>Sin anuncios entre partidas</li>
              <li>Guarda tus puntuaciones</li>
              <li>Nuevos juegos cada mes</li>
              <li>Funciona en cualquier navegador</li>
            </ul>
            <Link href="/iniciar-sesion" className="btn xl pulse" style={{ width: "100%" }}>
              EMPEZAR GRATIS →
            </Link>
            <div className="pc-foot">No pedimos tarjeta. Nunca lo haremos.</div>
          </div>

          <div className="pricing-faq">
            <div className="faq-item">
              <div className="faq-q pixel">¿REALMENTE ES GRATIS?</div>
              <div className="faq-a">
                Sí. Arcade Vault es un proyecto sin fines de lucro hecho por amor a los clásicos. No hay versión
                &quot;premium&quot; escondida.
              </div>
            </div>
            <div className="faq-item">
              <div className="faq-q pixel">¿NECESITO CREAR CUENTA?</div>
              <div className="faq-a">
                No. Puedes jugar como invitado. Si quieres guardar tu puntuación y aparecer en el ranking,
                regístrate en 10 segundos.
              </div>
            </div>
            <div className="faq-item">
              <div className="faq-q pixel">¿CÓMO SOBREVIVEN SIN COBRAR?</div>
              <div className="faq-a">Es un proyecto comunitario. Si te gusta, compártelo. Esa es toda la moneda que aceptamos.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-final reveal">
        <h2 className="final-title pixel">¿LISTO PARA JUGAR?</h2>
        <Link href="/games" className="btn xl pulse final-cta">
          INSERTAR MONEDA →
        </Link>
        <div className="final-tag">Gratis. Sin registro obligatorio. Empieza en segundos.</div>
      </section>
    </div>
  );
}
