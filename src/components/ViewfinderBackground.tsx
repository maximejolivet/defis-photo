import type { CSSProperties } from 'react';
import { useLocation } from 'react-router-dom';

type Shape = [
  kind: 'frame' | 'ring',
  x: number, y: number, size: number, ratio: number,
  dx: number, dy: number, drift: number, lock: number, delay: number,
];

// Fond « viseur » : des cadres de visée et des points de mise au point dérivent lentement,
// comme un autofocus qui cherche son sujet, et « verrouillent » (flash jaune) chacun leur tour.
// [forme, x %, y %, taille (vmin), ratio h/l, dérive x px, dérive y px, durée dérive s, cycle verrouillage s, décalage s]
const SHAPES: Shape[] = [
  ['frame', 4, 10, 17, 1.33, 50, 36, 52, 16, -3],
  ['frame', 80, 6, 22, 1.33, -44, 40, 58, 19, -9],
  ['ring', 66, 30, 9, 1, 30, -26, 41, 13, -6],
  ['frame', 88, 46, 13, 1, -34, 44, 47, 17, -12],
  ['frame', 10, 52, 21, 1.33, 40, -32, 60, 21, -15],
  ['ring', 42, 66, 11, 1, -36, -30, 44, 15, -1],
  ['frame', 70, 68, 19, 1.33, 32, -48, 55, 18, -7],
  ['ring', 24, 84, 8, 1, 28, -34, 39, 12, -10],
  ['frame', 50, 4, 12, 1, -26, 34, 43, 14, -5],
  ['frame', 92, 84, 15, 1.33, -38, -28, 50, 20, -17],
  ['ring', 4, 30, 10, 1, 24, 40, 46, 16, -13],
];

export default function ViewfinderBackground() {
  // Le diaporama projeté a son propre décor.
  const { pathname } = useLocation();
  if (pathname === '/diaporama') return null;

  return (
    <div className="vf-layer" aria-hidden="true">
      {SHAPES.map(([shape, x, y, size, ratio, dx, dy, drift, lock, delay], i) => (
        <div
          key={i}
          className={`vf vf-${shape}`}
          style={{
            '--x': `${x}%`,
            '--y': `${y}%`,
            '--s': size,
            '--r': ratio,
            '--dx': `${dx}px`,
            '--dy': `${dy}px`,
            '--drift': `${drift}s`,
            '--lock': `${lock}s`,
            '--delay': `${delay}s`,
          } as CSSProperties}
        >
          <div className="vf-box" />
        </div>
      ))}
    </div>
  );
}
