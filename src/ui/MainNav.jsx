import { NavLink } from "react-router-dom";

import { useCurrentUserContext } from "@/contexts/CurrentUserContext";

import {
  HiOutlineBeaker,
  HiOutlineHome,
  HiOutlineUsers,
  HiOutlineBuildingOffice,
  HiMiniGlobeAlt,
  HiOutlineExclamationTriangle,
  HiOutlineEnvelope,
  HiOutlineTrophy,
  HiOutlineRectangleGroup,
  HiOutlineCheckCircle,
  HiOutlineShieldCheck,
  HiOutlineDocumentCheck,
  HiOutlinePercentBadge,
  HiOutlineBuildingStorefront,
  HiOutlineMapPin,
  HiChevronDown,
  HiChevronUp,
} from "react-icons/hi2";
import { PiHandSoap, PiPlant, PiSparkle, PiSprayBottle } from "react-icons/pi";
import { GiForkKnifeSpoon } from "react-icons/gi";
import { MdOutlineReviews } from "react-icons/md";

import styled from "styled-components";
import { useState } from "react";

const StyledNav = styled.nav`
  overflow-y: scroll;
`;

const NavList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const StyledNavLink = styled(NavLink)`
  &:link,
  &:visited {
    display: flex;
    align-items: center;
    gap: 1.2rem;

    color: var(--color-grey-600);
    font-size: 1.6rem;
    font-weight: 500;
    padding: 1.2rem 2.4rem;
    transition: all 0.3s;
  }

  &:hover,
  &:active,
  &.active:link,
  &.active:visited {
    color: var(--color-grey-800);
    background-color: var(--color-grey-50);
    border-radius: var(--border-radius-sm);

    & svg {
      color: var(--color-brand-600);
    }
  }

  & svg {
    width: 2.4rem;
    height: 2.4rem;
    color: var(--color-grey-400);
    transition: all 0.3s;
  }
`;

const NestedNavLink = styled(StyledNavLink)`
  &:link,
  &:visited {
    width: 100%;
    padding-left: 4rem;
  }
`;

const StyledNavSubItem = styled.span`
  display: flex;
  align-items: center;
  gap: 1.2rem;

  color: var(--color-grey-600);
  font-size: 1.6rem;
  font-weight: 500;
  padding: 1.2rem 2.4rem;
  transition: all 0.3s;

  &:hover {
    color: var(--color-grey-800);
    background-color: var(--color-grey-50);
    border-radius: var(--border-radius-sm);
    & svg {
      color: var(--color-brand-600);
    }
  }

  & svg {
    color: var(--color-grey-400);
    transition: all 0.3s;
  }
  & svg:first-child {
    width: 2.4rem;
    height: 2.4rem;
  }
  & svg:last-child {
    margin-left: auto;
  }
`;

function MainNav() {
  const { hasAccess } = useCurrentUserContext();
  const [currentOpen, setCurrentOpen] = useState(null);

  return (
    <StyledNav>
      <NavList>
        <li>
          <StyledNavLink to="/dashboard">
            <HiOutlineHome />
            <span>Dashboard</span>
          </StyledNavLink>
        </li>

        {hasAccess("contributor") && (
          <NavSubItem
            currentOpen={currentOpen}
            onOpen={setCurrentOpen}
            id="checkings"
            icon={<HiOutlineCheckCircle />}
            title="Vérification"
          >
            <NavList>
              <li>
                <NestedNavLink to="/verifications">
                  <HiOutlineDocumentCheck /> <span>Validations</span>
                </NestedNavLink>
              </li>
              <li>
                <NestedNavLink to="/checkings">
                  <HiOutlineEnvelope /> <span>Contacts</span>
                </NestedNavLink>
              </li>
              <li>
                <NestedNavLink to="/error-reports">
                  <HiOutlineExclamationTriangle /> <span>Signalements</span>
                </NestedNavLink>
              </li>

              {hasAccess("admin") && (
                <li>
                  <NestedNavLink to="/shop-reviews">
                    <MdOutlineReviews /> <span>Avis</span>
                  </NestedNavLink>
                </li>
              )}
              {hasAccess("admin") && (
                <li>
                  <NestedNavLink to="/places">
                    <HiOutlineMapPin /> <span>Lieux</span>
                  </NestedNavLink>
                </li>
              )}
            </NavList>
          </NavSubItem>
        )}

        <NavSubItem
          currentOpen={currentOpen}
          onOpen={setCurrentOpen}
          id="product"
          icon={<GiForkKnifeSpoon />}
          title="Alimentaire"
        >
          <NavList>
            <li>
              <NestedNavLink to="/products">
                <PiPlant />
                <span>Produits</span>
              </NestedNavLink>
            </li>
            {hasAccess("admin") && (
              <li>
                <NestedNavLink to="/interesting-products">
                  <PiSparkle />
                  <span>Vegandex</span>
                </NestedNavLink>
              </li>
            )}
            {hasAccess("admin") && (
              <li>
                <NestedNavLink to="/categories">
                  <HiOutlineRectangleGroup /> <span>Catégories</span>
                </NestedNavLink>
              </li>
            )}
            <li>
              <NestedNavLink to="/brands">
                <HiOutlineBuildingOffice />
                <span>Marques</span>
              </NestedNavLink>
            </li>
          </NavList>
        </NavSubItem>

        <li>
          <StyledNavLink to="/additives">
            <HiOutlineBeaker />
            <span>Additifs</span>
          </StyledNavLink>
        </li>

        <li>
          <StyledNavLink to="/household-cleaners">
            <PiSprayBottle />
            <span>Nettoyants</span>
          </StyledNavLink>
        </li>

        <li>
          <StyledNavLink to="/cosmetics">
            <PiHandSoap />
            <span>Cosmétiques</span>
          </StyledNavLink>
        </li>

        {hasAccess("admin") && (
          <NavSubItem
            currentOpen={currentOpen}
            onOpen={setCurrentOpen}
            id="partners"
            icon={<HiOutlinePercentBadge />}
            title="Partenaires"
          >
            <NavList>
              <li>
                <NestedNavLink to="/partners/companies">
                  <HiOutlineBuildingStorefront /> <span>Entreprises</span>
                </NestedNavLink>
                <NestedNavLink to="/partners/categories">
                  <HiOutlineRectangleGroup /> <span>Catégories</span>
                </NestedNavLink>
              </li>
            </NavList>
          </NavSubItem>
        )}

        {hasAccess("admin") && (
          <NavSubItem
            currentOpen={currentOpen}
            onOpen={setCurrentOpen}
            id="scoring"
            icon={<HiOutlineTrophy />}
            title="Évaluation"
          >
            <NavList>
              <li>
                <NestedNavLink to="/scoring/categories">
                  <HiOutlineRectangleGroup /> <span>Catégories</span>
                </NestedNavLink>
              </li>
            </NavList>
          </NavSubItem>
        )}

        {hasAccess("admin") && (
          <NavSubItem
            currentOpen={currentOpen}
            onOpen={setCurrentOpen}
            id="security"
            icon={<HiOutlineShieldCheck />}
            title="Sécurité"
          >
            <NavList>
              <li>
                <NestedNavLink to="/users">
                  <HiOutlineUsers /> <span>Utilisateurices</span>
                </NestedNavLink>
              </li>
              <li>
                <NestedNavLink to="/clients">
                  <HiMiniGlobeAlt /> <span>Clients API</span>
                </NestedNavLink>
              </li>
            </NavList>
          </NavSubItem>
        )}
      </NavList>
    </StyledNav>
  );
}

function NavSubItem({ currentOpen, onOpen, id, icon, title, children }) {
  const isOpen = id === currentOpen;
  function handleToggle() {
    onOpen(isOpen ? null : id);
  }
  return (
    <li>
      <StyledNavSubItem onClick={handleToggle}>
        {icon} <span>{title}</span>{" "}
        {isOpen ? <HiChevronUp /> : <HiChevronDown />}
      </StyledNavSubItem>
      {isOpen && children}
    </li>
  );
}

export default MainNav;
