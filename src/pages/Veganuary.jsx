import Row from "@/ui/Row";
import Heading from "@/ui/Heading";
import Admonition from "@/ui/Admonition";
import ListOperations from "@/ui/ListOperations";

import VeganuaryWeekTable from "@/features/veganuary/VeganuaryWeekTable";
import ImportWeeks from "@/features/veganuary/ImportWeeks";
import VeganuaryImages from "@/features/veganuary/VeganuaryImages";

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
        Le contenu du Veganuary n&apos;est que sur l&apos;API (pas sur
        GitHub) : les apps le téléchargent à leur première ouverture du
        Veganuary, puis à chaque modification, sans mise à jour de l&apos;app.
      </Admonition>

      <VeganuaryWeekTable />

      <VeganuaryImages />
    </>
  );
}

export default Veganuary;
