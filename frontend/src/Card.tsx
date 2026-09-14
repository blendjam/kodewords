import { useEffect, useRef, useState } from "react";
import { CardProps, Color } from "./types/types";
import { useWs } from "./hooks/wsContext";
import { useRoomState } from "./state/roomState";
import { ConnectionStatus } from "@kodewords/shared/types";

const IMGPATH = "";

type AgentInfo = {
  count: number;
  width: number;
  height: number;
};

const AGENTS: Record<Color, AgentInfo> = {
  red: {
    count: 9,
    width: 231,
    height: 1903,
  },
  blue: {
    count: 9,
    width: 231,
    height: 1903,
  },
  gray: {
    count: 6,
    width: 231,
    height: 1267,
  },
  black: {
    count: 0,
    width: 0,
    height: 0,
  },
};

const CardNames: Record<Color, string> = {
  red: "red",
  blue: "blue",
  black: "assassin",
  gray: "neutral",
};

function capitalizeFirstLetter(val: string) {
  return val.charAt(0).toUpperCase() + val.slice(1);
}

const Card = ({ word, type, showColor, id }: CardProps) => {
  const serverRevealed = useRoomState(state => state.room?.guessedWords.some(guessedWord => guessedWord.word === word));
  const [peek, setPeek] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const { send, connectionStatus } = useWs();
  const isOffline = connectionStatus !== ConnectionStatus.CONNECTED;
  const [localRevealed, setLocalRevealed] = useState(false);
  const isRevealed = isOffline ? localRevealed : serverRevealed;

  const cardRef = useRef<HTMLButtonElement>(null);
  const wordRef = useRef<HTMLHeadingElement>(null);

  const agent = AGENTS[type];
  const hasAgent = agent.count > 0;
  const frameIndex = hasAgent ? id % agent.count : 0;

  const showBgColor = isRevealed ? true : showColor;
  const fontColor = showBgColor && type === "black" ? "white" : "black";
  const originalType = showBgColor ? type : "gray";
  const cardLabel = showBgColor ? CardNames[type].toUpperCase() : CardNames.gray.toUpperCase();

  // Dynamically fit the word to the card.
  useEffect(() => {
    const card = cardRef.current;
    const wordElement = wordRef.current;

    if (!card || !wordElement) return;

    const fitText = () => {
      const cardWidth = card.clientWidth;
      const cardHeight = card.clientHeight;

      const maxWidth = cardWidth * 0.7;

      // Initial guess based on card size.
      let size = Math.min(cardWidth * 0.18, cardHeight * 0.22);

      wordElement.style.fontSize = `${size}px`;
      wordElement.style.whiteSpace = "nowrap";

      // Reduce until it fits.
      while (wordElement.scrollWidth > maxWidth && size > 8) {
        size -= 1;
        wordElement.style.fontSize = `${size}px`;
      }

      setFontSize(size);
    };
    const resizeObserver = new ResizeObserver(fitText);

    resizeObserver.observe(card);

    return () => resizeObserver.disconnect();
  }, [word]);

  const handleOnCardClick = () => {
    if (isRevealed) {
      setPeek(s => !s);
      return;
    }
    if (isOffline) {
      setLocalRevealed(true);
      return;
    }
    send({ type: "select_word", word });
  };

  return (
    <button ref={cardRef} onClick={handleOnCardClick} className="relative h-full w-full select-none">
      <img
        src={`${IMGPATH}/assets/card/${originalType}.png`}
        alt={`Card_${type}`}
        className="absolute inset-0 h-full w-full object-fill"
      />
      <h2
        className="absolute left-[40%] top-[34%] z-1 -translate-x-1/2 -translate-y-1/2 font-black leading-none text-[clamp(0.4rem,1vw,0.8rem)] text-black/50"
        style={{
          fontSize: `${fontSize / 1.5}px`,
        }}>
        {cardLabel}
      </h2>
      <div className="absolute left-1/2 top-[68%] z-1 flex h-[25%] w-[80%] -translate-x-1/2 -translate-y-1/2 items-center justify-center text-center ">
        <h1
          ref={wordRef}
          style={{
            color: fontColor,
            fontSize: `${fontSize}px`,
          }}
          className="m-0 max-w-full whitespace-nowrap font-black leading-none">
          {capitalizeFirstLetter(word)}
        </h1>
      </div>

      {
        <div
          className={`absolute inset-0 w-full bg-black ${peek ? "opacity-25 h-12.5" : "opacity-0 h-full"} transition-all duration-500`}></div>
      }
      <div className={`perspective-[600px] relative h-full w-full ${peek ? "z-5" : "z-3"}`}>
        {isRevealed && <Agent agent={agent} type={type} frameIndex={frameIndex} peek={peek} />}
      </div>
    </button>
  );
};

type AgentProps = {
  type: Color;
  agent: AgentInfo;
  frameIndex: number;
  peek?: boolean;
};

function Agent({ type, agent, frameIndex, peek }: AgentProps) {
  return (
    <div
      className={`
        relative
        h-full
        w-full
        origin-top
        overflow-hidden
        transition-transform
        duration-500
        ease-in-out
        ${peek && "rotate-x-75 z-30"}
      `}>
      <img
        src={`${IMGPATH}/assets/bg/${type}.png`}
        alt={`Card_${type}`}
        className="absolute inset-0 h-full w-full object-fill"
      />
      {agent.count > 0 && (
        <div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 overflow-hidden h-full"
          style={{
            aspectRatio: `${agent.width} / 212`,
          }}>
          <img
            src={`${IMGPATH}/assets/agent/${type}.png`}
            alt={`${type} agent`}
            className="absolute left-0 top-0 h-auto w-full max-w-none"
            style={{
              height: `${agent.count * 100} %`,
              transform: `translateY(-${(frameIndex * 100) / agent.count}%)`,
            }}
          />
        </div>
      )}
      {
        <div
          className={`absolute inset-0 h-full w-full rounded-lg bg-black ${peek ? "opacity-50" : "opacity-0"} transition-all duration-500`}></div>
      }
    </div>
  );
}

export default Card;
