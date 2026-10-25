import { useSearchRestaurants } from "./useSearchRestaurants";

import Table from "@/ui/Table";
import Menus from "@/ui/Menus";
import Spinner from "@/ui/Spinner";
import Pagination from "@/ui/Pagination";
import Filters from "@/ui/Filters";
import SortBy from "@/ui/SortBy";
import RestaurantTableRow from "./RestaurantTableRow";
import {
  OPERATING_STATUSES,
  RESTAURANT_TAGS,
  VEGAN_STATUSES,
} from "./restaurantConstants";

const ALL = { value: "all", label: "Tous" };

const toOptions = (statuses) =>
  Object.entries(statuses).map(([value, { label }]) => ({ value, label }));

function RestaurantTable() {
  const { isPending, restaurants, count } = useSearchRestaurants();

  if (isPending) return <Spinner />;

  return (
    <Menus>
      <Table columns="0.6fr 1.8fr 1.2fr 1.4fr 1fr 1.2fr 0.9fr 1.2fr 3.2rem">
        <Filters>
          <SortBy>
            <Table.Header>
              <div>Photo</div>

              <div>
                Nom
                <SortBy.Sort sortByField="name" />
                <Filters.Filter>
                  <Filters.Toggle id="filterName" filterField="name" />
                  <Filters.Search id="filterName" filterField="name" />
                </Filters.Filter>
              </div>

              <div>
                Ville
                <SortBy.Sort sortByField="city" />
                <Filters.Filter>
                  <Filters.Toggle id="filterCity" filterField="city" />
                  <Filters.Search id="filterCity" filterField="city" />
                </Filters.Filter>
              </div>

              <div>
                Types
                <Filters.Filter>
                  <Filters.Toggle id="filterTags" filterField="tags" />
                  <Filters.List
                    id="filterTags"
                    filterField="tags"
                    options={[ALL, ...RESTAURANT_TAGS]}
                  />
                </Filters.Filter>
              </div>

              <div>
                Végane
                <Filters.Filter>
                  <Filters.Toggle
                    id="filterVeganStatus"
                    filterField="vegan_status"
                  />
                  <Filters.List
                    id="filterVeganStatus"
                    filterField="vegan_status"
                    options={[ALL, ...toOptions(VEGAN_STATUSES)]}
                  />
                </Filters.Filter>
              </div>

              <div>
                Ouverture
                <Filters.Filter>
                  <Filters.Toggle
                    id="filterOperatingStatus"
                    filterField="operating_status"
                  />
                  <Filters.List
                    id="filterOperatingStatus"
                    filterField="operating_status"
                    options={[ALL, ...toOptions(OPERATING_STATUSES)]}
                  />
                </Filters.Filter>
              </div>

              <div>
                Validé
                <Filters.Filter>
                  <Filters.Toggle
                    id="filterValidated"
                    filterField="validated"
                  />
                  <Filters.List
                    id="filterValidated"
                    filterField="validated"
                    options={[
                      ALL,
                      { value: "1", label: "Oui" },
                      { value: "0", label: "En attente" },
                    ]}
                  />
                </Filters.Filter>
              </div>

              <div>
                Mise à jour
                <SortBy.Sort sortByField="updated_at" />
              </div>

              <div></div>
            </Table.Header>
          </SortBy>
        </Filters>

        <Table.Body
          data={restaurants}
          render={(restaurant) => (
            <RestaurantTableRow key={restaurant.id} restaurant={restaurant} />
          )}
        />

        <Table.Footer>
          <Pagination count={count} />
        </Table.Footer>
      </Table>
    </Menus>
  );
}

export default RestaurantTable;
