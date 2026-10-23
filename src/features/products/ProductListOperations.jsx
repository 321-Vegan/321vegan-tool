import { useCurrentUserContext } from "@/contexts/CurrentUserContext";

import ListOperations from "@/ui/ListOperations";
import AddAction from "@/ui/AddAction";
import ExportAction from "@/ui/ExportAction";

import CreateProductForm from "./CreateProductForm";
import ValidatorAction from "./ValidatorAction";
import PublisherAction from "./PublisherAction";

function ProductListOperations() {
  const { hasAccess } = useCurrentUserContext();

  return (
    <ListOperations>
      {hasAccess("contributor") && <ValidatorAction />}
      {hasAccess("admin") && <PublisherAction />}
      {hasAccess("admin") && <ExportAction />}
      <AddAction
        id="product-create-form"
        formComponent={<CreateProductForm />}
      />
    </ListOperations>
  );
}

export default ProductListOperations;
