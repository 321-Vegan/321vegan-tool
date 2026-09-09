import { useNavigate } from "react-router-dom";

import { formatDistanceFromNow, formatDate } from "@/utils/helpers";
import {
  PRODUCT_STATUSES,
  PRODUCT_STATES,
  PRODUCT_TYPES,
} from "@/utils/constants";
import { useCurrentUserContext } from "@/contexts/CurrentUserContext";
import { useDeleteProduct } from "./useDeleteProduct";

import ButtonText from "@/ui/ButtonText";
import Tag from "@/ui/Tag";
import Table from "@/ui/Table";
import Stacked from "@/ui/Stacked";
import Menus from "@/ui/Menus";
import Modal from "@/ui/Modal";
import ConfirmAction from "@/ui/ConfirmAction";
import NoDataItem from "@/ui/NoDataItem";

import UpdateProductForm from "./UpdateProductForm";

import { HiDocumentCheck, HiEye, HiPencil, HiTrash } from "react-icons/hi2";
import styled from "styled-components";

const Ref = styled.div`
  font-weight: 600;
  color: var(--color-grey-600);
`;

function ProductTableRow({ product }) {
  const {
    id: productId,
    name,
    ean,
    status,
    state,
    product_type,
    brand,
    created_at,
    updated_at,
  } = product;
  const navigate = useNavigate();
  const { isDeleting, deleteProduct } = useDeleteProduct();
  const { hasAccess } = useCurrentUserContext();

  return (
    <Table.Row>
      <Ref>{ean}</Ref>

      <Stacked>{name || <NoDataItem>Inconnue</NoDataItem>}</Stacked>

      <Stacked>
        {brand ? (
          hasAccess("contributor") ? (
            <ButtonText onClick={() => navigate(`/brands/${brand.id}`)}>
              {brand.name}
            </ButtonText>
          ) : (
            brand.name
          )
        ) : (
          <NoDataItem>Inconnue</NoDataItem>
        )}
      </Stacked>

      <Stacked>
        <span>{formatDate(created_at)}</span>
        <span>{formatDistanceFromNow(created_at)}</span>
      </Stacked>

      <Stacked>
        <span>{formatDate(updated_at)}</span>
        <span>{formatDistanceFromNow(updated_at)}</span>
      </Stacked>

      <Tag type={PRODUCT_STATUSES[status].color}>
        {PRODUCT_STATUSES[status].label}
      </Tag>

      {state === "CREATED" && hasAccess("contributor") ? (
        <Tag
          type={PRODUCT_STATES[state].color}
          onClick={() => navigate(`/products/register/${ean}`)}
        >
          {PRODUCT_STATES[state].label}
        </Tag>
      ) : (
        <Tag type={PRODUCT_STATES[state].color}>
          {PRODUCT_STATES[state].label}
        </Tag>
      )}

      <Tag type={PRODUCT_TYPES[product_type].color}>
        {PRODUCT_TYPES[product_type].label}
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
            {hasAccess("contributor") && (
              <>
                {state === "CREATED" && (
                  <Menus.Button
                    icon={<HiDocumentCheck />}
                    onClick={() => navigate(`/products/register/${ean}`)}
                  >
                    Vérifier
                  </Menus.Button>
                )}
                <Modal.Open opens="edit">
                  <Menus.Button icon={<HiPencil />}>Éditer</Menus.Button>
                </Modal.Open>
                <Modal.Open opens="delete">
                  <Menus.Button icon={<HiTrash />}>Supprimer</Menus.Button>
                </Modal.Open>
              </>
            )}
          </Menus.List>
        </Menus.Menu>

        <Modal.Window name="edit">
          <UpdateProductForm productToUpdate={product} />
        </Modal.Window>
        <Modal.Window name="delete">
          <ConfirmAction
            variation="delete"
            title="Supprimer un produit"
            message="Cette action est irréversible. Êtes-vous sûr de vouloir supprimer définitivement ce produit ?"
            onConfirm={() => deleteProduct(productId)}
            disabled={isDeleting}
          />
        </Modal.Window>
      </Modal>
    </Table.Row>
  );
}

export default ProductTableRow;
