'use client';

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';

const ICON_HEIGHT = 188;
const LOSER_MESSAGES = [
  'Not quite',
  'Stop gambling',
  'Hey, you lost!',
  'Ouch! I felt that',
  "Don't beat yourself up",
  'There goes the college fund',
  'I have a cat. You have a loss',
  "You're awesome at losing",
  'Coding is hard',
  "Don't hate the coder",
];

const RepeatButton = ({ onClick }) => (
  <button
    aria-label="Play again"
    onClick={onClick}
    className="w-12 h-12 bg-[url('https://github.com/antibland/codes/blob/gh-pages/random-assets/img/slots/repeat.png?raw=true')] bg-no-repeat bg-cover animate-spin absolute top-2.5 right-5"
  />
);

const WinningSound = () => (
  <audio autoPlay className="player" preload="none">
    <source src="https://andyhoffman.codes/random-assets/img/slots/winning_slot.wav" />
  </audio>
);

const Spinner = forwardRef(({ onFinish, timer }, ref) => {
  const [position, setPosition] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(timer);
  const timerRef = useRef();
  const multiplierRef = useRef(Math.floor(Math.random() * 3) + 1);
  const startPositionRef = useRef(
    Math.floor(Math.random() * 9) * ICON_HEIGHT * -1
  );
  const speedRef = useRef(ICON_HEIGHT * multiplierRef.current);

  const reset = useCallback(() => {
    clearInterval(timerRef.current);
    startPositionRef.current = Math.floor(Math.random() * 9) * ICON_HEIGHT * -1;
    multiplierRef.current = Math.floor(Math.random() * 3) + 1;
    speedRef.current = ICON_HEIGHT * multiplierRef.current;

    setPosition(startPositionRef.current);
    setTimeRemaining(timer);

    timerRef.current = setInterval(() => {
      tick();
    }, 100);
  }, [timer]);

  const getSymbolFromPosition = useCallback(() => {
    const totalSymbols = 9;
    const maxPosition = ICON_HEIGHT * (totalSymbols - 1) * -1;
    const moved = (timer / 100) * multiplierRef.current;
    let currentPosition = startPositionRef.current;

    for (let i = 0; i < moved; i++) {
      currentPosition -= ICON_HEIGHT;
      if (currentPosition < maxPosition) currentPosition = 0;
    }

    setTimeout(() => onFinish(currentPosition), 0);
  }, [timer, onFinish]);

  const tick = useCallback(() => {
    setTimeRemaining((prev) => {
      if (prev <= 0) {
        clearInterval(timerRef.current);
        getSymbolFromPosition();
        return 0;
      }
      setPosition((prevPosition) => prevPosition - speedRef.current);
      return prev - 100;
    });
  }, [getSymbolFromPosition]);

  useEffect(() => {
    reset();
    return () => clearInterval(timerRef.current);
  }, [reset]);

  useImperativeHandle(ref, () => ({ reset }), [reset]);

  return (
    <div
      className="w-32 h-[564px] overflow-hidden bg-white bg-[url('https://github.com/antibland/codes/blob/gh-pages/random-assets/img/slots/sprite5.png?raw=true')] bg-repeat-y transition-all ease-in-out duration-300 transform"
      style={{ backgroundPosition: `0px ${position}px` }}
    />
  );
});

Spinner.displayName = 'Spinner';

const SlotMachine = () => {
  const [winner, setWinner] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loserMessage, setLoserMessage] = useState('');
  const spinnerRefs = useRef(Array.from({ length: 5 }, () => null));

  const handleClick = () => {
    setWinner(null);
    setMatches([]);
    setLoserMessage('');
    spinnerRefs.current.forEach((spinner) => spinner?.reset());
  };

  const handleFinish = (value) => {
    setMatches((prev) => {
      const updated = [...prev, value];
      if (updated.length === 5) {
        const allSame = updated.every((v) => v === updated[0]);
        setTimeout(() => {
          setWinner(allSame);
          if (!allSame) {
            setLoserMessage(
              LOSER_MESSAGES[Math.floor(Math.random() * LOSER_MESSAGES.length)]
            );
          }
        }, 0);
      }
      return updated;
    });
  };

  return (
    <div className="relative w-screen h-screen bg-[#292929] font-sans">
      {winner && <WinningSound />}
      <h1 className="text-white text-[150%] font-cairo text-center mt-8">
        <span className="inline-block border border-white/10 px-4 py-3 bg-white/5 text-white">
          {winner === null
            ? 'Waiting…'
            : winner
            ? '🤑 Pure skill! 🤑'
            : loserMessage}
        </span>
      </h1>

      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 scale-[0.62] flex overflow-hidden h-[632px] p-8 transition-transform duration-300 spinner-container">
        {[1000, 1200, 1400, 1600, 1800].map((timer, index) => (
          <div key={index} className={index !== 0 && index !== 4 ? 'mx-2' : ''}>
            <Spinner
              onFinish={handleFinish}
              timer={timer}
              ref={(el) => (spinnerRefs.current[index] = el)}
            />
          </div>
        ))}
        <div className="absolute top-8 right-8 bottom-8 left-8 bg-gradient-to-b from-neutral-700 via-transparent to-neutral-700 pointer-events-none" />
        <div className="absolute top-1/2 left-8 right-8 h-[180px] bg-red-500/10 transform -translate-y-1/2 z-10 pointer-events-none" />
      </div>

      {winner !== null && <RepeatButton onClick={handleClick} />}
    </div>
  );
};

export default SlotMachine;
