import { useSearchCheckingProducts } from "./useSearchCheckingProducts";
import { useSearchParams } from "react-router-dom";
import { HiEnvelope, HiOutlineEnvelope } from "react-icons/hi2";

import Table from "@/ui/Table";
import Menus from "@/ui/Menus";
import Spinner from "@/ui/Spinner";
import Pagination from "@/ui/Pagination";
import Filters from "@/ui/Filters";
import SortBy from "@/ui/SortBy";

import CheckingProductTableRow from "./CheckingProductTableRow";

function CheckingProductTable() {
  const { isPending, products = [], count } = useSearchCheckingProducts();
  const [searchParams] = useSearchParams();

  // Get the brandContact filter value from the URL
  const brandContactFilter = searchParams.get("brandContact") || "all";

  // Filter products based on the brandContact filter value
  const filteredProducts = products.filter((product) => {
    if (brandContactFilter === "all") return true;
    if (brandContactFilter === "true") {
      return product.brand?.root_email;
    } else if (brandContactFilter === "false") {
      return !product.brand?.root_email;
    }
    return true;
  });

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
                <SortBy.Sort sortByField="name" />
                <Filters.Filter>
                  <Filters.Toggle id="filterName" filterField="name" />
                  <Filters.Search id="filterName" filterField="name" />
                </Filters.Filter>
              </div>

              <div>
                Marque
                <SortBy.Sort sortByField="brand_name" />
                <Filters.Filter>
                  <Filters.Toggle id="filterBrandName" filterField="brand" />
                  <Filters.Search id="filterBrandName" filterField="brand" />
                </Filters.Filter>
                <Filters.Filter>
                  <Filters.Toggle
                    id="filterBrandContact"
                    filterField="brandContact"
                    activeIcon={<HiEnvelope />}
                    inactiveIcon={<HiOutlineEnvelope />}
                  />
                  <Filters.List
                    id="filterBrandContact"
                    filterField="brandContact"
                    options={[
                      { value: "all", label: "Tous" },
                      { value: "true", label: "Avec email" },
                      { value: "false", label: "Sans email" },
                    ]}
                  />
                </Filters.Filter>
              </div>

              <div>Problèmes</div>

              <div>
                Contacté le
                <SortBy.Sort sortByField="last_requested_on" />
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
          data={filteredProducts}
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
