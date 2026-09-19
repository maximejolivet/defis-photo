import { useEffect, useState, type CSSProperties } from 'react';
import { loadChallenges } from '../api/challenges';
import type { Challenge } from '../types';

interface FilmStripProps {
  doneIds?: (number | string)[];
  total?: number;
  develop?: boolean;
  preview?: boolean;
}

// Une pellicule de 8 vues : une vue par défi, avec son emoji et son numéro.
// - doneIds : ids des défis réalisés (vues jaune flash)
// - preview : vue d'ensemble décorative (connexion), emojis en couleur, rien de « réalisé »
export default function FilmStrip({ doneIds = [], total = 8, develop = false, preview = false }: FilmStripProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  useEffect(() => {
    let active = true;
    loadChallenges().then((list) => {
      if (active) setChallenges(list);
    });
    return () => {
      active = false;
    };
  }, []);

  const done = new Set(doneIds.map(Number));
  // challenges[i] est undefined tant que la liste n'est pas chargée (ou s'il y a moins de défis que de vues).
  const frames = Array.from({ length: total }, (_, i): Challenge | undefined => challenges[i]);
  const doneCount = frames.filter((c) => c && done.has(Number(c.id))).length;

  const label = preview
    ? `${total} défis à relever`
    : `${doneCount} défi${doneCount > 1 ? 's' : ''} réalisé${doneCount > 1 ? 's' : ''} sur ${total}`;

  return (
    <div className="film" role="img" aria-label={label} data-develop={develop || undefined}>
      <ol className="film-frames" aria-hidden="true">
        {frames.map((challenge, i) => (
          <li
            key={i}
            className="film-frame"
            data-done={(!preview && challenge && done.has(Number(challenge.id))) || undefined}
            data-preview={preview || undefined}
            title={challenge?.title}
            style={{ '--i': i } as CSSProperties}
          >
            <span className="film-emoji">{challenge?.icon}</span>
            <span className="film-num">{i + 1}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
