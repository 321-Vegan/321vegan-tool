import { useNavigate } from "react-router-dom";

import { formatDistanceFromNow, formatDate } from "@/utils/helpers";
import { PRODUCT_STATES } from "@/utils/constants";

import { useCurrentUserContext } from "@/contexts/CurrentUserContext";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

import Tag from "@/ui/Tag";
import Table from "@/ui/Table";
import Stacked from "@/ui/Stacked";
import Menus from "@/ui/Menus";
import Modal from "@/ui/Modal";
import NoDataItem from "@/ui/NoDataItem";
import SpinnerMini from "@/ui/SpinnerMini";
import Tooltip from "@/ui/Tooltip";

import CreateCheckingForm from "./CreateCheckingForm";
import UpdateCheckingForm from "./UpdateCheckingForm";
import CheckingTable from "./CheckingTable";
import GenerateCheckingMessage from "./GenerateCheckingMessage";
import {
  HiArrowTopRightOnSquare,
  HiEye,
  HiListBullet,
  HiOutlineEnvelope,
  HiOutlineEnvelopeOpen,
  HiAtSymbol,
} from "react-icons/hi2";
import styled from "styled-components";

const Ref = styled.div`
  font-weight: 600;
  color: var(--color-grey-600);
`;

const BrandData = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;

  & > small {
    cursor: pointer;
  }
  &:hover svg {
    color: var(--color-brand-600);
  }
`;

function CheckingProductTableRow({ product }) {
  const { currentUser } = useCurrentUserContext();
  const navigate = useNavigate();
  const { isCopying, copyToClipboard } = useCopyToClipboard();
  const {
    id: productId,
    name,
    ean,
    state,
    problem_description,
    brand,
    checkings,
  } = product;
  const lastChecking = checkings.reduce((a, b) => {
    return new Date(a.requested_on) > new Date(b.requested_on) ? a : b;
  }, {});

  return (
    <Table.Row>
      <Ref>{ean}</Ref>

      <Stacked>{name || <NoDataItem>Inconnue</NoDataItem>}</Stacked>

      {brand ? (
        <Stacked>
          <BrandData>
            {brand.name}
            {brand.root_email && (
              <Tooltip content={brand.root_email} id="root_email">
                <small
                  aria-describedby="root_email"
                  onClick={() => copyToClipboard(brand.root_email)}
                >
                  {isCopying ? <SpinnerMini size="xs" /> : <HiAtSymbol />}
                </small>
              </Tooltip>
            )}
            {brand.root_contact_form_url && (
              <Tooltip
                content="Ouvrir le formulaire de contact"
                id="root_contact_form_url"
              >
                <small aria-describedby="root_contact_form_url">
                  <a
                    href={brand.root_contact_form_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <HiArrowTopRightOnSquare />
                  </a>
                </small>
              </Tooltip>
            )}
          </BrandData>
        </Stacked>
      ) : (
        <Stacked>
          <NoDataItem>Inconnue</NoDataItem>
        </Stacked>
      )}

      <Stacked>{lastChecking?.response || problem_description}</Stacked>

      <Stacked>
        {lastChecking?.requested_on ? (
          <>
            <span>{formatDate(lastChecking.requested_on)}</span>
            <span>{formatDistanceFromNow(lastChecking.requested_on)}</span>
          </>
        ) : (
          <NoDataItem>--</NoDataItem>
        )}
      </Stacked>

      <Stacked>
        {lastChecking?.user ? (
          <>{lastChecking.user.nickname}</>
        ) : (
          <NoDataItem>--</NoDataItem>
        )}
      </Stacked>

      <Tag type={PRODUCT_STATES[state].color}>
        {PRODUCT_STATES[state].label}
      </Tag>

      <Modal>
        <Menus.Menu>
          <Menus.Toggle id={productId} />
          <Menus.List id={productId}>
            <Menus.Button
              icon={<HiEye />}
              onClick={() => navigate(`/products/${productId}`)}
            >
              Voir le détail
            </Menus.Button>
            {checkings.length > 0 && (
              <Modal.Open opens="checking-list">
                <Menus.Button icon={<HiListBullet />}>
                  Voir toutes les prises de contact
                </Menus.Button>
              </Modal.Open>
            )}

            <Modal.Open opens="generate-email">
              <Menus.Button icon={<HiAtSymbol />}>
                Générer un message de contact
              </Menus.Button>
            </Modal.Open>

            <Modal.Open opens="register-request">
              <Menus.Button icon={<HiOutlineEnvelope />}>
                Enregistrer une prise de contact
              </Menus.Button>
            </Modal.Open>

            {lastChecking?.user && (
              <Modal.Open opens="register-response">
                <Menus.Button
                  icon={<HiOutlineEnvelopeOpen />}
                  disabled={lastChecking.user.id !== currentUser.id}
                >
                  Enregistrer la réponse
                </Menus.Button>
              </Modal.Open>
            )}
          </Menus.List>
        </Menus.Menu>

        <Modal.Window name="checking-list">
          <CheckingTable checkings={checkings} product={product} $nopadding />
        </Modal.Window>

        <Modal.Window name="generate-email">
          <GenerateCheckingMessage product={product} />
        </Modal.Window>

        <Modal.Window name="register-request">
          <CreateCheckingForm product={product} />
        </Modal.Window>

        <Modal.Window name="register-response">
          <UpdateCheckingForm
            checkingToUpdate={lastChecking}
            product={product}
          />
        </Modal.Window>
      </Modal>
    </Table.Row>
  );
}

export default CheckingProductTableRow;
