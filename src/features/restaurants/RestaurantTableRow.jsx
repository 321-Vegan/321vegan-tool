import { useNavigate } from "react-router-dom";

import { S3_STORAGE_URL } from "@/utils/constants";
import { formatDistanceFromNow, formatDate } from "@/utils/helpers";
import { useCurrentUserContext } from "@/contexts/CurrentUserContext";
import { useDeleteRestaurant } from "./useDeleteRestaurant";

import Table from "@/ui/Table";
import Menus from "@/ui/Menus";
import Stacked from "@/ui/Stacked";
import Tag from "@/ui/Tag";
import NoDataItem from "@/ui/NoDataItem";
import ImageDetail from "@/ui/ImageDetail";
import Modal from "@/ui/Modal";
import DeleteRestaurantWindow from "./DeleteRestaurantWindow";

import {
  OPERATING_STATUSES,
  RESTAURANT_TAGS,
  VEGAN_STATUSES,
} from "./restaurantConstants";

import { HiPencil, HiTrash } from "react-icons/hi2";

const tagLabel = (value) =>
  RESTAURANT_TAGS.find((t) => t.value === value)?.label || value;

function RestaurantTableRow({ restaurant }) {
  const navigate = useNavigate();
  const { hasAccess } = useCurrentUserContext();
  const { isDeleting, deleteRestaurant } = useDeleteRestaurant();
  const {
    id: restaurantId,
    name,
    address,
    city,
    country,
    tags,
    vegan_status,
    operating_status,
    has_storefront,
    validated,
    updated_at,
    featured_photo,
  } = restaurant;

  return (
    <Table.Row>
      <ImageDetail
        path={featured_photo?.path}
        previewBaseUrl={S3_STORAGE_URL}
        alt={name}
      />

      <Stacked>
        <span>{name}</span>
        <span>{has_storefront ? address : "Sans boutique"}</span>
      </Stacked>

      <Stacked>
        {city ? <span>{city}</span> : <NoDataItem>--</NoDataItem>}
        {country && <span>{country}</span>}
      </Stacked>

      <span>{tags.map(tagLabel).join(", ")}</span>

      <Tag type={VEGAN_STATUSES[vegan_status].color}>
        {VEGAN_STATUSES[vegan_status].label}
      </Tag>

      <Tag type={OPERATING_STATUSES[operating_status].color}>
        {OPERATING_STATUSES[operating_status].label}
      </Tag>

      {validated ? (
        <Tag type="green">Oui</Tag>
      ) : (
        <Tag type="silver">En attente</Tag>
      )}

      <Stacked>
        <span>{formatDate(updated_at)}</span>
        <span>{formatDistanceFromNow(updated_at)}</span>
      </Stacked>

      <Modal>
        <Menus.Menu>
          <Menus.Toggle id={restaurantId} />
          <Menus.List id={restaurantId}>
            <Menus.Button
              icon={<HiPencil />}
              onClick={() => navigate(`/restaurants/${restaurantId}`)}
            >
              Voir / éditer
            </Menus.Button>

            {hasAccess("moderator") && (
              <Modal.Open opens="delete">
                <Menus.Button icon={<HiTrash />}>
                  {validated ? "Supprimer" : "Refuser"}
                </Menus.Button>
              </Modal.Open>
            )}
          </Menus.List>
        </Menus.Menu>

        <Modal.Window name="delete">
          <DeleteRestaurantWindow
            restaurant={restaurant}
            onDelete={(rejectionReason) =>
              deleteRestaurant({ id: restaurantId, rejectionReason })
            }
            disabled={isDeleting}
          />
        </Modal.Window>
      </Modal>
    </Table.Row>
  );
}

export default RestaurantTableRow;
