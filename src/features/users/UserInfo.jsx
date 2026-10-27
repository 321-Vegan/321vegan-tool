import styled from "styled-components";

import { USER_ROLES } from "@/utils/constants";
import { formatDistanceFromNow } from "@/utils/helpers";

import NoDataItem from "@/ui/NoDataItem";
import SpinnerMini from "@/ui/SpinnerMini";
import Tag from "@/ui/Tag";

import { useUserBrief } from "./useUserBrief";

const Lines = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const Line = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.8rem;
`;

const Muted = styled.span`
  color: var(--color-grey-500);
`;

const plural = (count, singular, pluralForm = `${singular}s`) =>
  `${count} ${count > 1 ? pluralForm : singular}`;

// Contribution counts shown when not zero, in this order
const CONTRIBUTIONS = [
  {
    field: "nb_restaurants_validated",
    color: "green",
    label: (n) => plural(n, "lieu validé", "lieux validés"),
  },
  {
    field: "nb_restaurants_pending",
    color: "silver",
    label: (n) => `${plural(n, "lieu", "lieux")} en attente`,
  },
  {
    field: "nb_restaurants_rejected",
    color: "red",
    label: (n) => plural(n, "lieu refusé", "lieux refusés"),
  },
  {
    field: "nb_products_sent",
    color: "indigo",
    label: (n) => plural(n, "produit envoyé", "produits envoyés"),
  },
  {
    field: "nb_products_modified",
    color: "indigo",
    label: (n) => plural(n, "produit modifié", "produits modifiés"),
  },
  {
    field: "nb_product_reviews",
    color: "indigo",
    label: (n) => plural(n, "avis produit", "avis produits"),
  },
];

// Who wrote something to moderate and how much they contributed, to judge
// how much to trust it. Without a user (automatic import...), shows
// `emptyLabel`.
function UserInfo({ userId, emptyLabel = "Inconnu·e" }) {
  const { isPending, user } = useUserBrief(userId);

  if (userId == null) return <NoDataItem>{emptyLabel}</NoDataItem>;
  if (isPending) return <SpinnerMini size="xs" />;
  if (!user) return <NoDataItem>Compte supprimé</NoDataItem>;

  const role = USER_ROLES[user.role];
  const contributions = CONTRIBUTIONS.filter(({ field }) => user[field] > 0);

  return (
    <Lines>
      <Line>
        <strong>{user.nickname}</strong>
        {role && user.role !== "user" && (
          <Tag type={role.color}>{role.label}</Tag>
        )}
        <Muted>inscrit·e {formatDistanceFromNow(user.created_at)}</Muted>
      </Line>
      <Line>
        {contributions.length === 0 ? (
          <Muted>Aucune contribution</Muted>
        ) : (
          contributions.map(({ field, color, label }) => (
            <Tag key={field} type={color}>
              {label(user[field])}
            </Tag>
          ))
        )}
      </Line>
    </Lines>
  );
}

export default UserInfo;
