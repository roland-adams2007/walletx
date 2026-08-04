export default function Loading() {
  const dots = Array.from({ length: 8 });

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <div className="absolute inset-0 animate-spin [animation-duration:1.4s]">
          {dots.map((_, i) => (
            <span
              key={i}
              className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-[var(--red)]"
              style={{
                opacity: 1 - i * 0.11,
                transform: `rotate(${i * 45}deg) translate(40px) translate(-50%, -50%)`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
