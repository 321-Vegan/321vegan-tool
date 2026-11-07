import { useSearchProducts } from "./useSearchProducts";
import {
  PRODUCT_STATUSES,
  PRODUCT_STATES,
  PRODUCT_TYPES,
} from "@/utils/constants";
import { useState } from "react";

import Table from "@/ui/Table";
import Menus from "@/ui/Menus";
import Spinner from "@/ui/Spinner";
import Pagination from "@/ui/Pagination";
import Filters from "@/ui/Filters";
import SortBy from "@/ui/SortBy";
import ProductTableRow from "./ProductTableRow";

function ProductTable() {
  const { isPending, products, count } = useSearchProducts();
  const [filterBrandName, setFilterBrandName] = useState("");

  const handleFilterBrandNameChange = (value) => {
    setFilterBrandName(value);
  };

  if (isPending) return <Spinner />;

  return (
    <Menus>
      <Table columns="1.8fr 2fr 1.4fr 1.4fr 1.4fr 1.4fr 1.4fr 1.4fr 3.2rem">
        <Filters>
          <SortBy>
            <Table.Header>
              <div>
                Ean
                <Filters.Filter>
                  <Filters.Toggle id="filterEan" filterField="ean" />
                  <Filters.Search id="filterEan" filterField="ean" />
                </Filters.Filter>
              </div>

              <div>
                Dénomination
                {filterBrandName === "" && <SortBy.Sort sortByField="name" />}
                <Filters.Filter>
                  <Filters.Toggle id="filterName" filterField="name" />
                  <Filters.Search id="filterName" filterField="name" />
                </Filters.Filter>
              </div>

              <div>
                Marque
                {filterBrandName === "" && <SortBy.Sort sortByField="brand_name" />}
                <Filters.Filter>
                  <Filters.Toggle id="filterBrandName" filterField="brand" />
                  <Filters.Search id="filterBrandName" filterField="brand"
                    onChange={handleFilterBrandNameChange} />
                </Filters.Filter>
              </div>

              <div>
                Date de création
                {filterBrandName === "" && <SortBy.Sort sortByField="created_at" />}
              </div>

              <div>
                Mise à jour
                {filterBrandName === "" && <SortBy.Sort sortByField="updated_at" />}
              </div>

              <div>
                Statut{" "}
                <Filters.Filter>
                  <Filters.Toggle id="filterStatus" filterField="status" />
                  <Filters.List
                    id="filterStatus"
                    filterField="status"
                    options={[
                      { value: "all", label: "Tous" },
                      ...Object.entries(PRODUCT_STATUSES).map(([key, o]) => {
                        return { value: key, label: o.label };
                      }),
                    ]}
                  />
                </Filters.Filter>
              </div>

              <div>
                État{" "}
                <Filters.Filter>
                  <Filters.Toggle id="filterState" filterField="state" />
                  <Filters.List
                    id="filterState"
                    filterField="state"
                    options={[
                      { value: "all", label: "Tous" },
                      ...Object.entries(PRODUCT_STATES).map(([key, o]) => {
                        return { value: key, label: o.label };
                      }),
                    ]}
                  />
                </Filters.Filter>
              </div>

              <div>
                Type{" "}
                <Filters.Filter>
                  <Filters.Toggle
                    id="filterProductType"
                    filterField="product_type"
                  />
                  <Filters.List
                    id="filterProductType"
                    filterField="product_type"
                    options={[
                      { value: "all", label: "Tous" },
                      ...Object.entries(PRODUCT_TYPES).map(([key, o]) => {
                        return { value: key, label: o.label };
                      }),
                    ]}
                  />
                </Filters.Filter>
              </div>

              <div></div>
            </Table.Header>
          </SortBy>
        </Filters>

        <Table.Body
          data={products}
          render={(product) => (
            <ProductTableRow key={product.id} product={product} />
          )}
        />

        <Table.Footer>
          <Pagination count={count} />
        </Table.Footer>
      </Table>
    </Menus>
  );
}

export default ProductTable;
