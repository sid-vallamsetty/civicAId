const HOURGLASS_GRID = [
  'FFFFFFFFF',
  'FSSSSSSSF',
  'FSSSSSSSF',
  '.FSSSSSF.',
  '..FSSSF..',
  '...FSF...',
  '..F.S.F..',
  '.F.SSS.F.',
  'F.SSSSS.F',
  'FSSSSSSSF',
  'FFFFFFFFF'
]
const HOURGLASS_PALETTE = { F: '#5e4a36', S: '#f3c969' }

const FIRE_GRID = [
  '....Y....',
  '...YRY...',
  '..YRRRY..',
  '.YROOORY.',
  'YROOKKOOY',
  'YRKKWKKRY',
  'YRKWWWKRY',
  'YROKKKORY',
  '.YROOORY.',
  '..YRRRY..',
  '...YYY...'
]
const FIRE_PALETTE = {
  Y: '#ffe37a',
  O: '#f3a13a',
  R: '#e55a2b',
  K: '#b63434',
  W: '#ffffff'
}

const SEED_GRID = [
  '....L....',
  '..LLLLL..',
  '...LLL...',
  '....L....',
  '....S....',
  '..SSSSS..',
  '.SSSSSSS.',
  '..SSSSS..',
  '...SSS...'
]
const SEED_PALETTE = { L: '#6fae6c', S: '#8b7355' }

const MIC_GRID = [
  '...MMM...',
  '..MMMMM..',
  '..MHMHM..',
  '..MMMMM..',
  '..MHMHM..',
  '...MMM...',
  '....S....',
  '...SSS...',
  '..SSSSS..'
]
const MIC_PALETTE = { M: '#8b7355', H: '#fffdf3', S: '#5e4a36' }

const HOUSE_GRID = [
  '....R....',
  '...RRR...',
  '..RRRRR..',
  '.RRRRRRR.',
  'RRRRRRRRR',
  '.W.....W.',
  '.W.DDD.W.',
  '.W.DDD.W.',
  '.WWWDDWWW'
]
const HOUSE_PALETTE = { R: '#b63434', W: '#f5edda', D: '#5e4a36' }

const MEGAPHONE_GRID = [
  '.........',
  '......MMM',
  '.....MMMM',
  '....MM.MM',
  'BBBBMMMMM',
  'BBBBMMMMM',
  '....MM.MM',
  '.....MMMM',
  '......MMM'
]
const MEGAPHONE_PALETTE = { M: '#f3a13a', B: '#5e4a36' }

const CROWN_GRID = [
  '.........',
  'Y.Y.Y.Y.Y',
  'YYYYYYYYY',
  'YYRYYGYYR',
  'YYYYYYYYY',
  'YYYYYYYYY',
  '.YYYYYYY.',
  '.........',
  '.........'
]
const CROWN_PALETTE = { Y: '#f3c969', R: '#b63434', G: '#6fae6c' }

function renderGrid(grid, palette) {
  const pixels = []
  for (let r = 0; r < grid.length; r++) {
    const row = grid[r]
    for (let c = 0; c < row.length; c++) {
      const ch = row[c]
      if (ch !== '.' && ch !== ' ') {
        pixels.push(
          <rect
            key={`${r}-${c}`}
            x={c}
            y={r}
            width={1}
            height={1}
            fill={palette[ch] || '#000'}
          />
        )
      }
    }
  }
  return pixels
}

function PixelSvg({ grid, palette, size, title, className = '', style = {} }) {
  const rows = grid.length
  const cols = grid[0].length
  return (
    <svg
      viewBox={`0 0 ${cols} ${rows}`}
      width={size}
      height={size}
      shapeRendering="crispEdges"
      className={className}
      style={{ imageRendering: 'pixelated', ...style }}
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {renderGrid(grid, palette)}
    </svg>
  )
}

export function PixelHourglass({ size = 22, className = '' }) {
  return (
    <PixelSvg
      grid={HOURGLASS_GRID}
      palette={HOURGLASS_PALETTE}
      size={size}
      className={className}
      title="Hourglass"
    />
  )
}

export function PixelFire({ size = 40, className = '' }) {
  return (
    <PixelSvg
      grid={FIRE_GRID}
      palette={FIRE_PALETTE}
      size={size}
      className={className}
      title="Streak flame"
    />
  )
}

const RANK_GRIDS = {
  Seed: { grid: SEED_GRID, palette: SEED_PALETTE, label: 'Seed' },
  Voice: { grid: MIC_GRID, palette: MIC_PALETTE, label: 'Voice' },
  Neighbor: { grid: HOUSE_GRID, palette: HOUSE_PALETTE, label: 'Neighbor' },
  Advocate: { grid: MEGAPHONE_GRID, palette: MEGAPHONE_PALETTE, label: 'Advocate' },
  'Civic Champion': { grid: CROWN_GRID, palette: CROWN_PALETTE, label: 'Civic Champion' }
}

export function RankIcon({ rank, size = 26, className = '' }) {
  const entry = RANK_GRIDS[rank] || RANK_GRIDS.Seed
  return (
    <PixelSvg
      grid={entry.grid}
      palette={entry.palette}
      size={size}
      className={className}
      title={`${entry.label} rank icon`}
    />
  )
}
