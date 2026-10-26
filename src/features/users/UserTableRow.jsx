import { USER_ROLES, USER_AVATARS } from "@/utils/constants";

import { formatDistanceFromNow, formatDate } from "@/utils/helpers";

import { useDeleteUser } from "./useDeleteUser";
import { useCurrentUserContext } from "@/contexts/CurrentUserContext";

import Tag from "@/ui/Tag";
import Table from "@/ui/Table";
import Stacked from "@/ui/Stacked";
import Menus from "@/ui/Menus";
import Modal from "@/ui/Modal";
import ConfirmAction from "@/ui/ConfirmAction";

import UpdateUserForm from "./UpdateUserForm";

import { HiPencil, HiTrash } from "react-icons/hi2";
import styled from "styled-components";

const Ref = styled.div`
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--color-grey-600);
`;

const UserBox = styled.span`
  display: grid;
  grid-template-columns: 4rem 1fr;
  align-items: center;
  gap: 0.8rem;
`;

const UserAvatar = styled.img`
  display: block;
  width: 4rem;
  aspect-ratio: 1;
  object-fit: cover;
  object-position: center;
  border-radius: var(--border-radius-sm);
  outline: 2px solid var(--color-grey-100);
  background-color: var(--color-brand-100);
`;

function UserTableRow({ user }) {
  const { id: userId, nickname, email, is_active, role, created_at } = user;
  const { isDeleting, deleteUser } = useDeleteUser();
  const { currentUser } = useCurrentUserContext();

  return (
    <Table.Row>
      <Ref># {userId}</Ref>

      <UserBox>
        <UserAvatar src={`/${user.avatar || USER_AVATARS.default}`} alt="" />
        <Stacked>
          <span>{nickname}</span>
          <span>{email}</span>
          {user.friend_code && <span>Code ami : {user.friend_code}</span>}
        </Stacked>
      </UserBox>

      <Stacked>
        <span>{formatDate(created_at)}</span>
        <span>{formatDistanceFromNow(created_at)}</span>
      </Stacked>

      {is_active ? (
        <Tag type="green">Activé</Tag>
      ) : (
        <Tag type="red">Désactivé</Tag>
      )}

      <Tag type={USER_ROLES[role].color}>{USER_ROLES[role].label}</Tag>

      {user.id !== currentUser.id && (
        <Modal>
          <Menus.Menu>
            <Menus.Toggle id={userId} />
            <Menus.List id={userId}>
              <Modal.Open opens="edit">
                <Menus.Button icon={<HiPencil />}>Éditer</Menus.Button>
              </Modal.Open>

              <Modal.Open opens="delete">
                <Menus.Button icon={<HiTrash />}>Supprimer</Menus.Button>
              </Modal.Open>
            </Menus.List>
          </Menus.Menu>

          <Modal.Window name="edit">
            <UpdateUserForm userToUpdate={user} />
          </Modal.Window>
          <Modal.Window name="delete">
            <ConfirmAction
              variation="delete"
              title="Supprimer un·e utilisateurice"
              message="Cette action est irréversible. Êtes-vous sûr de vouloir supprimer définitivement cet·te utilisateurice ?"
              onConfirm={() => deleteUser(userId)}
              disabled={isDeleting}
            />
          </Modal.Window>
        </Modal>
      )}
    </Table.Row>
  );
}

export default UserTableRow;
