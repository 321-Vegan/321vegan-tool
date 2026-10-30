import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AiOutlineRotateLeft, AiOutlineRotateRight } from "react-icons/ai";
import { HiChevronLeft, HiChevronRight, HiXMark } from "react-icons/hi2";
import styled from "styled-components";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.85);
`;

const Img = styled.img`
  max-width: 90vw;
  max-height: 88vh;
  object-fit: contain;
  border-radius: var(--border-radius-sm);
  transform: rotate(${(props) => props.$rotation}deg);
  transition: transform 0.2s ease;
`;

const Control = styled.button`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.8rem;
  border: none;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.15);
  color: #fff;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }

  & svg {
    width: 2.8rem;
    height: 2.8rem;
  }
`;

const Toolbar = styled.div`
  position: absolute;
  top: 1.6rem;
  right: 1.6rem;
  display: flex;
  gap: 0.8rem;

  & ${Control} {
    position: static;
  }
`;

const Counter = styled.span`
  position: absolute;
  bottom: 1.6rem;
  color: #fff;
  font-size: 1.4rem;
`;

/**
 * Photos shown full screen, one at a time. Closes with Escape or a click
 * beside the photo; the arrows (or keyboard arrows) go through the others.
 *
 * @param {Array} images: [{ src, alt }]
 * @param {Number} index: the photo shown, null when closed
 * @param {Function} onIndexChange: (index) => void, null to close
 * */
function Lightbox({ images, index, onIndexChange }) {
  const [rotation, setRotation] = useState(0);
  const isOpen = index !== null && index !== undefined && images[index];
  const count = images.length;

  useEffect(() => {
    setRotation(0);
  }, [index]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e) {
      if (e.key === "Escape") onIndexChange(null);
      if (count > 1 && e.key === "ArrowRight")
        onIndexChange((index + 1) % count);
      if (count > 1 && e.key === "ArrowLeft")
        onIndexChange((index - 1 + count) % count);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, index, count, onIndexChange]);

  if (!isOpen) return null;

  const { src, alt = "" } = images[index];
  // Buttons and the photo itself don't close the lightbox
  const stop = (handler) => (e) => {
    e.stopPropagation();
    handler();
  };

  return createPortal(
    <Overlay onClick={() => onIndexChange(null)}>
      <Img
        src={src}
        alt={alt}
        $rotation={rotation}
        onClick={(e) => e.stopPropagation()}
      />
      <Toolbar>
        <Control
          aria-label="Pivoter à gauche"
          onClick={stop(() => setRotation((r) => r - 90))}
        >
          <AiOutlineRotateLeft />
        </Control>
        <Control
          aria-label="Pivoter à droite"
          onClick={stop(() => setRotation((r) => r + 90))}
        >
          <AiOutlineRotateRight />
        </Control>
        <Control aria-label="Fermer" onClick={stop(() => onIndexChange(null))}>
          <HiXMark />
        </Control>
      </Toolbar>
      {count > 1 && (
        <>
          <Control
            aria-label="Photo précédente"
            style={{ left: "1.6rem" }}
            onClick={stop(() => onIndexChange((index - 1 + count) % count))}
          >
            <HiChevronLeft />
          </Control>
          <Control
            aria-label="Photo suivante"
            style={{ right: "1.6rem" }}
            onClick={stop(() => onIndexChange((index + 1) % count))}
          >
            <HiChevronRight />
          </Control>
          <Counter>
            {index + 1} / {count}
          </Counter>
        </>
      )}
    </Overlay>,
    document.body,
  );
}

export default Lightbox;
