import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import styled from "styled-components";
import Textarea from "./Textarea";

const StyledTextarea = styled(Textarea)`
  min-height: 8rem;
  resize: none;
  overflow-y: hidden;
`;

// Textarea that grows with its content so the whole text is readable
// without scrolling inside the box.
function AutoResizeTextarea({ value, ...props }) {
  const ref = useRef(null);

  const resize = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    const border = el.offsetHeight - el.clientHeight;
    el.style.height = `${el.scrollHeight + border}px`;
  }, []);

  useLayoutEffect(resize, [value, resize]);

  useEffect(() => {
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [resize]);

  return <StyledTextarea ref={ref} value={value} {...props} />;
}

export default AutoResizeTextarea;
