type GameTagProps = {
  game: string;
  className?: string;
};

export function GameTag({ game, className = "" }: GameTagProps) {
  return (
    <span className={["rb-pill rounded-full px-3 py-1 text-xs font-medium", className].join(" ")}>
      {game}
    </span>
  );
}
