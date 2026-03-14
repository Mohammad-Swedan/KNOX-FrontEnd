// ── Confetti celebration overlay ────────────────────────────
// Drop this component anywhere and control it with the `active` prop.
// It renders 90 coloured pieces that fall from the top of the screen
// and auto-cleans after the animation finishes.

const CONFETTI_COLORS = [
  "#ff6b6b",
  "#ffd93d",
  "#6bcb77",
  "#4d96ff",
  "#c77dff",
  "#ff9a3c",
];

const CONFETTI_PIECES = Array.from({ length: 90 }, (_, i) => ({
  left: `${(i * 1.12) % 100}%`,
  width: 5 + (i % 5) * 2,
  height: 5 + ((i + 2) % 5) * 2,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  isCircle: i % 3 === 0,
  duration: 2.5 + (i % 7) * 0.3,
  delay: (i % 18) * 0.1,
}));

const ConfettiOverlay = ({ active }: { active: boolean }) => {
  if (!active) return null;
  return (
    <>
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translateY(-20px) rotate(0deg);   opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        @keyframes award-pop {
          0%   { transform: scale(0.4) rotate(-15deg); opacity: 0; }
          60%  { transform: scale(1.25) rotate(5deg);  opacity: 1; }
          80%  { transform: scale(0.95) rotate(-2deg); }
          100% { transform: scale(1) rotate(0deg);     opacity: 1; }
        }
        .confetti-piece { animation: confetti-fall linear forwards; }
        .award-pop-in   { animation: award-pop 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards; }
      `}</style>
      <div className="fixed inset-0 pointer-events-none z-150 overflow-hidden">
        {CONFETTI_PIECES.map((p, i) => (
          <div
            key={i}
            className="confetti-piece absolute top-0"
            style={{
              left: p.left,
              width: `${p.width}px`,
              height: `${p.height}px`,
              backgroundColor: p.color,
              borderRadius: p.isCircle ? "50%" : "2px",
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>
    </>
  );
};

export default ConfettiOverlay;
