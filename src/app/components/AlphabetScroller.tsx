const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

interface AlphabetScrollerProps {
  onLetterClick: (letter: string) => void;
}

export function AlphabetScroller({ onLetterClick }: AlphabetScrollerProps) {
  return (
    <div className="fixed right-2 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 pointer-events-auto">
      {alphabet.map((letter) => (
        <button
          key={letter}
          onClick={() => onLetterClick(letter)}
          className="w-5 h-5 flex items-center justify-center text-[10px] text-[#1A3A6B] font-medium active:bg-[#1A3A6B] active:text-white rounded-full transition-colors"
        >
          {letter}
        </button>
      ))}
    </div>
  );
}
