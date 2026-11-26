import Row from "@/ui/Row";
import Heading from "@/ui/Heading";
import Admonition from "@/ui/Admonition";

import BroadcastForm from "@/features/notifications/BroadcastForm";
import BroadcastTable from "@/features/notifications/BroadcastTable";

import { HiOutlineBellAlert } from "react-icons/hi2";

function Notifications() {
  return (
    <>
      <Row type="horizontal">
        <Heading as="h1">
          <HiOutlineBellAlert /> Notifications
        </Heading>
      </Row>

      <Admonition variation="general_info" icon="help">
        Une notification part à tous les comptes connectés qui ont activé les
        notifications dans l&apos;app : en push sur leurs téléphones, et dans
        le centre de notifications de l&apos;app. Les personnes sans compte ne
        la reçoivent pas.
      </Admonition>

      <BroadcastForm />

      <Heading as="h2">Déjà envoyées</Heading>
      <BroadcastTable />
    </>
  );
}

export default Notifications;
