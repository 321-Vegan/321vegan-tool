import { formatDistanceFromNow, formatDate } from "@/utils/helpers";
import { REVIEWS_STATUSES } from "@/utils/constants";
import { useUpdateReviewStatus } from "./useUpdateReviewStatus";
import { useDeleteReview } from "./useDeleteReview";

import Tag from "@/ui/Tag";
import Table from "@/ui/Table";
import Stacked from "@/ui/Stacked";
import NoDataItem from "@/ui/NoDataItem";
import Modal from "@/ui/Modal";
import ButtonAction from "@/ui/ButtonAction";
import ConfirmAction from "@/ui/ConfirmAction";
import Tooltip from "@/ui/Tooltip";

import { HiTrash, HiXMark, HiCheck } from "react-icons/hi2";
import styled from "styled-components";

const Rating = styled.div`
  font-weight: 600;
  color: var(--color-brand-700);
`;

const ActionCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

function ReviewTableRow({ resource, review, subject }) {
  const { id: reviewId, user, rating, comment, status, created_at } = review;
  const { isUpdatingStatus, updateReviewStatus } =
    useUpdateReviewStatus(resource);
  const { isDeleting, deleteReview } = useDeleteReview(resource);
  const isWorking = isUpdatingStatus || isDeleting;

  function handleUpdateStatus(status) {
    updateReviewStatus({
      id: reviewId,
      newStatus: status,
    });
  }

  return (
    <Table.Row>
      <Rating>{rating}/5</Rating>
      <Stacked>{comment || <NoDataItem>--</NoDataItem>}</Stacked>

      <Stacked>{subject.render(review)}</Stacked>

      <Stacked>{user?.nickname || <NoDataItem>--</NoDataItem>}</Stacked>

      <Stacked>
        <span>{formatDate(created_at)}</span>
        <span>{formatDistanceFromNow(created_at)}</span>
      </Stacked>

      <Tag type={REVIEWS_STATUSES[status].color}>
        {REVIEWS_STATUSES[status].label}
      </Tag>

      <Modal>
        <ActionCell>
          <Tooltip content="Valider" id={`approve-${reviewId}`}>
            <Modal.Open opens="approve">
              <ButtonAction
                disabled={isWorking || status === "APPROVED"}
                $variation="confirm"
              >
                <HiCheck />
              </ButtonAction>
            </Modal.Open>
          </Tooltip>

          <Tooltip content="Rejeter" id={`reject-${reviewId}`}>
            <Modal.Open opens="reject">
              <ButtonAction
                disabled={isWorking || status === "REJECTED"}
                $variation="accent"
              >
                <HiXMark />
              </ButtonAction>
            </Modal.Open>
          </Tooltip>

          <Tooltip content="Supprimer" id={`delete-${reviewId}`}>
            <Modal.Open opens="delete">
              <ButtonAction disabled={isWorking} $variation="danger">
                <HiTrash />
              </ButtonAction>
            </Modal.Open>
          </Tooltip>
        </ActionCell>

        <Modal.Window name="approve">
          <ConfirmAction
            variation="confirm"
            title="Valider un avis"
            message="Êtes-vous sûr de vouloir valider cet avis ?"
            onConfirm={() => handleUpdateStatus("APPROVED")}
            disabled={isWorking}
          />
        </Modal.Window>

        <Modal.Window name="reject">
          <ConfirmAction
            variation="delete"
            title="Rejeter un avis"
            message="Êtes-vous sûr de vouloir rejeter cet avis ?"
            onConfirm={() => handleUpdateStatus("REJECTED")}
            disabled={isWorking}
          />
        </Modal.Window>

        <Modal.Window name="delete">
          <ConfirmAction
            variation="delete"
            title="Supprimer un avis"
            message="Cette action est irréversible. Êtes-vous sûr de vouloir supprimer définitivement cet avis ?"
            onConfirm={() => deleteReview(reviewId)}
            disabled={isWorking}
          />
        </Modal.Window>
      </Modal>
    </Table.Row>
  );
}

export default ReviewTableRow;
