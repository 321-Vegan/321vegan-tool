import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useDebounce } from "@/hooks/useDebounce";

import Input from "@/ui/Input";

import { HiMiniFunnel, HiOutlineFunnel } from "react-icons/hi2";
import styled, { css } from "styled-components";

const StyledFilter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  position: relative;
`;

const StyledToggle = styled.button`
  background: none;
  border: none;
  padding: 0.4rem;
  border-radius: var(--border-radius-sm);
  transform: translateX(0.8rem);
  transition: all 0.2s;

  &:hover {
    background-color: var(--color-grey-100);
  }

  & svg {
    width: 1.4rem;
    height: 1.4rem;
    color: var(--color-grey-700);
  }

  ${(props) =>
    props.$active &&
    css`
      background-color: var(--color-grey-100);
      & svg {
        color: var(--color-brand-600);
      }
    `}
`;

const StyledList = styled.ul`
  position: absolute;
  z-index: 1;
  width: max-content;

  background-color: var(--color-grey-0);
  box-shadow: var(--shadow-md);
  border-radius: var(--border-radius-md);

  left: ${(props) => props.$position.x}px;
  top: ${(props) => props.$position.y}px;
`;

const StyledListItem = styled.li`
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  padding: 0.6rem 0.8rem;
  font-size: 1.2rem;
  transition: all 0.2s;

  display: flex;
  align-items: center;
  gap: 1.6rem;

  &:hover {
    background-color: var(--color-grey-50);
  }

  ${(props) =>
    props.$active &&
    css`
      background-color: var(--color-grey-50);
      color: var(--color-brand-50);
    `}
`;

const FiltersContext = createContext();

function Filters({ children }) {
  const [openId, setOpenId] = useState("");
  const [position, setPosition] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const close = () => setOpenId("");
  const open = setOpenId;

  return (
    <FiltersContext
      value={{
        openId,
        close,
        open,
        position,
        setPosition,
        searchParams,
        setSearchParams,
      }}
    >
      {children}
    </FiltersContext>
  );
}

function Filter({ children }) {
  return <StyledFilter>{children}</StyledFilter>;
}

function Toggle({ id, filterField, defaultValue }) {
  const { openId, close, open, setPosition, searchParams } =
    useContext(FiltersContext);
  const currentFilter = searchParams.get(filterField) || defaultValue || null;
  const isActive = currentFilter && currentFilter !== "all";

  function handleClick(e) {
    e.stopPropagation();
    const rect = e.target.closest("button").getBoundingClientRect();
    setPosition({
      x: -8,
      y: rect.height + 8,
    });
    openId === "" || openId !== id ? open(id) : close();
  }

  return (
    <StyledToggle onClick={handleClick} $active={isActive ? 1 : 0}>
      {isActive ? <HiMiniFunnel /> : <HiOutlineFunnel />}
    </StyledToggle>
  );
}

/**
 * With a defaultValue, selecting it clears the URL param and "all" is
 * kept in the URL, so that the default can be overridden.
 * */
function List({ id, filterField, options, defaultValue }) {
  const { openId, position, close, searchParams, setSearchParams } =
    useContext(FiltersContext);
  const ref = useClickOutside(close, false);
  const currentFilter =
    searchParams.get(filterField) || defaultValue || options.at(0).value;
  const resetValue = defaultValue || "all";

  function handleClick(value) {
    if (value && value !== resetValue) {
      searchParams.set(filterField, value);
    } else {
      if (currentFilter) searchParams.delete(filterField);
    }
    if (searchParams.get("page")) searchParams.set("page", 1);
    setSearchParams(searchParams);
    close();
  }

  if (openId !== id) return null;

  return (
    <StyledList $position={position} ref={ref}>
      {options.map((option) => (
        <StyledListItem
          key={option.value}
          onClick={() => handleClick(option.value)}
          $active={option.value === currentFilter ? 1 : 0}
          disabled={option.value === currentFilter}
        >
          {option.label}
        </StyledListItem>
      ))}
    </StyledList>
  );
}

function Search({ id, filterField }) {
  const { openId, position, close, searchParams, setSearchParams } =
    useContext(FiltersContext);
  const debounce = useDebounce(1000);
  const ref = useClickOutside(close, false);
  const searchRef = useRef();
  const [currentFilter, setCurrentFilter] = useState(
    searchParams.get(filterField) || ""
  );

  function handleSearch(value) {
    setCurrentFilter(value);
    debounce(() => {
      if (value.trim()) {
        searchParams.set(
          filterField,
          value.trim().replace("___", "").replace("__", "")
        );
        if (searchParams.get("page")) searchParams.set("page", 1);
        setSearchParams(searchParams);
      } else {
        if (searchParams.get(filterField)) {
          searchParams.delete(filterField);
          if (searchParams.get("page")) searchParams.set("page", 1);
          setSearchParams(searchParams);
        }
      }
    });
  }

  useEffect(() => {
    if (openId === id && searchRef.current) {
      searchRef.current.focus();
    }
  }, [openId, id]);

  if (openId !== id) return null;

  return (
    <StyledList $position={position} ref={ref}>
      <StyledListItem key={filterField}>
        <Input
          type="search"
          name="filterSearch"
          ref={searchRef}
          onChange={(e) => handleSearch(e.target.value)}
          value={currentFilter}
          placeholder="Filtrer..."
        />
      </StyledListItem>
    </StyledList>
  );
}

Filters.Filter = Filter;
Filters.Toggle = Toggle;
Filters.List = List;
Filters.Search = Search;

export default Filters;
