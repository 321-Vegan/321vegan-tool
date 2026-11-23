import Row from "@/ui/Row";
import Heading from "@/ui/Heading";
import Admonition from "@/ui/Admonition";
import ListOperations from "@/ui/ListOperations";

import VeganuaryWeekTable from "@/features/veganuary/VeganuaryWeekTable";
import ImportWeeks from "@/features/veganuary/ImportWeeks";

import { HiOutlineCalendarDays } from "react-icons/hi2";

function Veganuary() {
  return (
    <>
      <Row type="horizontal">
        <Heading as="h1">
          <HiOutlineCalendarDays /> Veganuary
        </Heading>
        <ListOperations>
          <ImportWeeks />
        </ListOperations>
      </Row>

      <Admonition variation="general_info" icon="help">
        Les semaines enregistrées ici remplacent celles que l&apos;app embarque,
        sans mise à jour de l&apos;app. Une semaine supprimée redevient celle de
        l&apos;app.
      </Admonition>

      <VeganuaryWeekTable />
    </>
  );
}

export default Veganuary;
