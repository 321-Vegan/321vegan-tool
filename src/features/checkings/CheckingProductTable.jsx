import { useSearchCheckingProducts } from "./useSearchCheckingProducts";
import { useState } from "react";

import Table from "@/ui/Table";
import Menus from "@/ui/Menus";
import Spinner from "@/ui/Spinner";
import Pagination from "@/ui/Pagination";
import Filters from "@/ui/Filters";
import SortBy from "@/ui/SortBy";

import CheckingProductTableRow from "./CheckingProductTableRow";

function CheckingProductTable() {
  const { isPending, products, count } = useSearchCheckingProducts();
  const [filterBrandName, setFilterBrandName] = useState("");

  const handleFilterBrandNameChange = (value) => {
    setFilterBrandName(value);
  };

  if (isPending) return <Spinner />;

  return (
    <Menus>
      <Table columns="1.8fr 2fr 1.4fr 1.4fr 1.4fr 1.4fr 1.4fr 3.2rem">
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
                  <Filters.Search
                    id="filterBrandName"
                    filterField="brand"
                    onChange={handleFilterBrandNameChange}
                  />
                </Filters.Filter>
              </div>

              <div>Problèmes</div>

              <div>
                Contacté le
                {filterBrandName === "" && <SortBy.Sort sortByField="last_requested_on" />}
              </div>

              <div>
                Contacté par
                <Filters.Filter>
                  <Filters.Toggle
                    id="filterCheckings"
                    filterField="last_requested_by"
                  />
                  <Filters.Search
                    id="filterCheckings"
                    filterField="last_requested_by"
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
                      { value: "NEED_CONTACT", label: "À contacter" },
                      { value: "WAITING_BRAND_REPLY", label: "Contacté" },
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
            <CheckingProductTableRow key={product.id} product={product} />
          )}
        />

        <Table.Footer>
          <Pagination count={count} />
        </Table.Footer>
      </Table>
    </Menus>
  );
}

export default CheckingProductTable;
