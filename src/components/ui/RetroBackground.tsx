export const RetroBackground = () => {
  return (
    <div className="animated-retro-bg">
      <div className="grid"></div>
      <div className="scanline"></div>
      <div className="glitch"></div>

      {/* Starfield */}
      {[...Array(50)].map((_, i) => (
        <div
          key={`star-${i}`}
          className={`star ${
            i % 3 === 0
              ? "star-small"
              : i % 3 === 1
              ? "star-medium"
              : "star-large"
          }`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        />
      ))}

      {/* Shooting Stars */}
      {[...Array(3)].map((_, i) => (
        <div
          key={`shooting-${i}`}
          className="shooting-star"
          style={{
            top: `${20 + Math.random() * 60}%`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${6 + Math.random() * 4}s`,
          }}
        />
      ))}

      {/* Floating Stars */}
      {[...Array(8)].map((_, i) => (
        <div
          key={`floating-${i}`}
          className="floating-star"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 6}s`,
            animationDuration: `${4 + Math.random() * 4}s`,
          }}
        />
      ))}

      {/* Pixel Particles */}
      {[...Array(18)].map((_, i) => (
        <div
          key={`pixel-${i}`}
          className="pixel"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  );
}; 