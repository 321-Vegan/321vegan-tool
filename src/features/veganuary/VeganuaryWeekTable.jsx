import { useNavigate } from "react-router-dom";

import { formatDate, formatDistanceFromNow } from "@/utils/helpers";

import { useVeganuaryWeeks } from "./useVeganuaryWeeks";
import { useDeleteVeganuaryWeek } from "./useDeleteVeganuaryWeek";
import { downloadWeek } from "./weekFile";

import Table from "@/ui/Table";
import Menus from "@/ui/Menus";
import Modal from "@/ui/Modal";
import Stacked from "@/ui/Stacked";
import Spinner from "@/ui/Spinner";
import Empty from "@/ui/Empty";
import ConfirmAction from "@/ui/ConfirmAction";

import { HiArrowDownTray, HiPencil, HiTrash } from "react-icons/hi2";
import styled from "styled-components";

const Ref = styled.div`
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--color-grey-600);
`;

function VeganuaryWeekTable() {
  const { isPending, weeks } = useVeganuaryWeeks();

  if (isPending) return <Spinner />;

  if (!weeks?.length)
    return (
      <Empty message="Aucune semaine sur l'API : le Veganuary de l'app est vide." />
    );

  return (
    <Menus>
      <Table columns="0.6fr 2.4fr 0.8fr 1.4fr 3.2rem">
        <Table.Header>
          <div>Semaine</div>
          <div>Titre</div>
          <div>Jours</div>
          <div>Mise à jour</div>
          <div></div>
        </Table.Header>

        <Table.Body
          data={weeks}
          render={(week) => <WeekRow key={week.number} week={week} />}
        />
      </Table>
    </Menus>
  );
}

function WeekRow({ week }) {
  const navigate = useNavigate();
  const { isDeleting, deleteVeganuaryWeek } = useDeleteVeganuaryWeek();
  const { number, content, updated_at } = week;
  const days = content.days ?? [];

  return (
    <Table.Row>
      <Ref>{number}</Ref>

      <Stacked>{content.title}</Stacked>

      <Stacked>
        {days.length > 0 &&
          `${days[0].number} → ${days[days.length - 1].number}`}
      </Stacked>

      <Stacked>
        <span>{formatDate(updated_at)}</span>
        <span>{formatDistanceFromNow(updated_at)}</span>
      </Stacked>

      <Modal>
        <Menus.Menu>
          <Menus.Toggle id={number} />
          <Menus.List id={number}>
            <Menus.Button
              icon={<HiPencil />}
              onClick={() => navigate(`/veganuary/${number}`)}
            >
              Modifier
            </Menus.Button>
            <Menus.Button
              icon={<HiArrowDownTray />}
              onClick={() => downloadWeek(content)}
            >
              Télécharger le JSON
            </Menus.Button>
            <Modal.Open opens="delete">
              <Menus.Button icon={<HiTrash />}>Supprimer</Menus.Button>
            </Modal.Open>
          </Menus.List>
        </Menus.Menu>

        <Modal.Window name="delete">
          <ConfirmAction
            variation="delete"
            title={`Supprimer la semaine ${number}`}
            message="Ses jours disparaîtront de l'app à sa prochaine ouverture du Veganuary. Téléchargez son JSON avant pour en garder une copie."
            onConfirm={() => deleteVeganuaryWeek(number)}
            disabled={isDeleting}
          />
        </Modal.Window>
      </Modal>
    </Table.Row>
  );
}

export default VeganuaryWeekTable;
