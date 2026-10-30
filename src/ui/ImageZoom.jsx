import { useRef, useState, useCallback, useMemo } from "react";
import ButtonIcon from "./ButtonIcon";
import {
  AiOutlineZoomIn,
  AiOutlineRotateLeft,
  AiOutlineRotateRight,
} from "react-icons/ai";
import styled, { css } from "styled-components";

const ImageZoomContainer = styled.figure`
  overflow: hidden;
  position: relative;
  cursor: zoom-in;
  border-radius: 7px;
  border: 1px solid var(--color-grey-200);
  ${(props) =>
    props.width &&
    css`
      width: ${(props) => `${props.width}rem`};
    `}
  ${(props) =>
    props.height &&
    css`
      height: ${(props) => `${props.height}rem`};
    `}
`;

const StyledImageZoom = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  transition: transform 0.1s ease-out;
  will-change: transform;
  display: block;
`;

const Controls = styled.figcaption`
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  z-index: 5;
`;

const RotationWrapper = styled.div`
  display: inline-block;
  width: 100%;
  height: 100%;
  transform: rotate(${(props) => props.$rotation}deg);
  transition: transform 0.2s ease;
`;

// onClick: optional, replaces the click to zoom further (e.g. to open the photo)
const ImageZoom = ({
  src,
  width,
  height,
  alt = "",
  scaleInit = 1.5,
  onClick,
}) => {
  const containerRef = useRef(null);
  const temporizerRef = useRef(null);
  const lastPositionRef = useRef(null);
  const [zoomScale, setZoomScale] = useState(scaleInit);
  const [isZoomed, setIsZoomed] = useState(false);
  const [positionX, setPositionX] = useState(50);
  const [positionY, setPositionY] = useState(50);

  const updateMousePosition = useCallback((x, y) => {
    lastPositionRef.current = { x, y };
    if (temporizerRef.current === null) {
      temporizerRef.current = window.setTimeout(() => {
        if (lastPositionRef.current) {
          setPositionX(lastPositionRef.current.x);
          setPositionY(lastPositionRef.current.y);
        }
        temporizerRef.current = null;
        lastPositionRef.current = null;
      }, 16);
    }
  }, []);

  const [rotation, setRotation] = useState(0);

  const calculatePosition = useCallback(
    (clientX, clientY) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();

      const x = (clientX - rect.left) / rect.width;
      const y = (clientY - rect.top) / rect.height;

      const r = rotation % 360;
      const rad = (r * Math.PI) / 180;

      const cx = 0.5;
      const cy = 0.5;
      const dx = x - cx;
      const dy = y - cy;

      const rotatedX = cx + (dx * Math.cos(-rad) - dy * Math.sin(-rad));
      const rotatedY = cy + (dx * Math.sin(-rad) + dy * Math.cos(-rad));

      const finalX = Math.max(0, Math.min(1, rotatedX)) * 100;
      const finalY = Math.max(0, Math.min(1, rotatedY)) * 100;

      updateMousePosition(finalX, finalY);
    },
    [updateMousePosition, rotation],
  );

  const handleMouseEnter = useCallback(() => {
    setIsZoomed(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsZoomed(false);
    setZoomScale(scaleInit);
    if (temporizerRef.current !== null) {
      clearTimeout(temporizerRef.current);
      temporizerRef.current = null;
    }
    if (lastPositionRef.current) {
      setPositionX(lastPositionRef.current.x);
      setPositionY(lastPositionRef.current.y);
      lastPositionRef.current = null;
    }
  }, [scaleInit]);

  const handleMouseMove = useCallback(
    (e) => {
      calculatePosition(e.clientX, e.clientY);
    },
    [calculatePosition],
  );

  const handleIncreaseScale = () => {
    if (zoomScale >= scaleInit && zoomScale <= scaleInit + 10) {
      setZoomScale((z) => z + 0.1);
    } else {
      setZoomScale(scaleInit);
    }
  };

  const imageStyle = useMemo(
    () => ({
      transformOrigin: `${positionX}% ${positionY}%`,
      transform: isZoomed ? `scale(${zoomScale})` : "scale(1)",
    }),
    [positionX, positionY, isZoomed, zoomScale],
  );

  return (
    <ImageZoomContainer
      ref={containerRef}
      height={height}
      width={width}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={onClick || handleIncreaseScale}
    >
      <RotationWrapper $rotation={rotation}>
        <StyledImageZoom src={src} alt={alt} style={imageStyle} />
      </RotationWrapper>

      <Controls>
        <ButtonIcon
          onClick={(e) => {
            // Without onClick, the click also bubbles up to zoom (as before)
            if (onClick) e.stopPropagation();
            handleIncreaseScale();
          }}
        >
          <AiOutlineZoomIn />
        </ButtonIcon>
        <ButtonIcon
          onClick={(e) => {
            e.stopPropagation();
            setRotation((r) => r - 90);
          }}
        >
          <AiOutlineRotateLeft />
        </ButtonIcon>
        <ButtonIcon
          onClick={(e) => {
            e.stopPropagation();
            setRotation((r) => r + 90);
          }}
        >
          <AiOutlineRotateRight />
        </ButtonIcon>
      </Controls>
    </ImageZoomContainer>
  );
};

export default ImageZoom;
