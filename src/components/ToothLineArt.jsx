export default function ToothLineArt({ style }) {
  return (
    <svg
      viewBox="0 0 200 240"
      className="tooth-line-art"
      style={{ position: 'absolute', pointerEvents: 'none', ...style }}
    >
      <path
        d="M100 20
           C 70 20, 40 35, 35 65
           C 32 85, 38 105, 42 130
           C 46 158, 52 195, 62 215
           C 66 222, 74 222, 78 213
           C 84 195, 88 165, 92 150
           C 95 138, 105 138, 108 150
           C 112 165, 116 195, 122 213
           C 126 222, 134 222, 138 215
           C 148 195, 154 158, 158 130
           C 162 105, 168 85, 165 65
           C 160 35, 130 20, 100 20 Z"
        fill="none"
        stroke="var(--gold)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
