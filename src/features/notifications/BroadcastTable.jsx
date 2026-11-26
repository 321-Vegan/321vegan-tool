import { formatDate, formatDistanceFromNow } from "@/utils/helpers";

import { useBroadcasts } from "./useBroadcasts";

import Table from "@/ui/Table";
import Stacked from "@/ui/Stacked";
import Spinner from "@/ui/Spinner";
import Empty from "@/ui/Empty";
import Tag from "@/ui/Tag";

import styled from "styled-components";

const Body = styled.span`
  white-space: pre-line;
`;

const Pushes = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
`;

function BroadcastTable() {
  const { isPending, broadcasts } = useBroadcasts();

  if (isPending) return <Spinner />;

  if (!broadcasts?.length)
    return <Empty message="Aucune notification envoyée pour l'instant." />;

  return (
    <Table columns="1.2fr 3fr 0.8fr 0.8fr 1.4fr">
      <Table.Header>
        <div>Envoyée</div>
        <div>Notification</div>
        <div>Comptes</div>
        <div>Lues</div>
        <div>Push</div>
      </Table.Header>

      <Table.Body
        data={broadcasts}
        render={(broadcast) => (
          <BroadcastRow key={broadcast.id} broadcast={broadcast} />
        )}
      />
    </Table>
  );
}

function BroadcastRow({ broadcast }) {
  const {
    title,
    body,
    created_at,
    sent_by,
    recipient_count,
    read_count,
    pushes_sent,
    pushes_failed,
    pushes_pending,
  } = broadcast;

  return (
    <Table.Row>
      <Stacked>
        <span>{formatDate(created_at, "dd MMM yyyy HH:mm")}</span>
        <span>
          {formatDistanceFromNow(created_at)}
          {sent_by && ` · ${sent_by}`}
        </span>
      </Stacked>

      <Stacked>
        <span>{title}</span>
        <Body>{body}</Body>
      </Stacked>

      <div>{recipient_count}</div>

      <div>{read_count}</div>

      <Pushes>
        {pushes_sent > 0 && <Tag type="green">{pushes_sent} reçus</Tag>}
        {pushes_pending > 0 && (
          <Tag type="yellow">{pushes_pending} en cours</Tag>
        )}
        {pushes_failed > 0 && <Tag type="red">{pushes_failed} échecs</Tag>}
      </Pushes>
    </Table.Row>
  );
}

export default BroadcastTable;
