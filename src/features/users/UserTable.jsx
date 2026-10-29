import { useSearchUsers } from "./useSearchUsers";

import Table from "@/ui/Table";
import Menus from "@/ui/Menus";
import Spinner from "@/ui/Spinner";
import Pagination from "@/ui/Pagination";
import Filters from "@/ui/Filters";
import SortBy from "@/ui/SortBy";
import UserTableRow from "./UserTableRow";

function UserTable() {
  const { isPending, users, count } = useSearchUsers();

  if (isPending) return <Spinner />;

  return (
    <Menus>
      <Table columns="0.6fr 1.4fr 1.4fr 1fr 1.4fr 3.2rem">
        <Filters>
          <SortBy>
            <Table.Header>
              <div>Id</div>
              <div>
                Profil
                <SortBy.Sort sortByField="nickname" />
                <Filters.Filter>
                  <Filters.Toggle id="filterName" filterField="nickname" />
                  <Filters.Search id="filterName" filterField="nickname" />
                </Filters.Filter>
              </div>
              <div>
                Date de création
                <SortBy.Sort sortByField="created_at" />
              </div>
              <div>
                Statut{" "}
                <Filters.Filter>
                  <Filters.Toggle id="filterStatus" filterField="is_active" />
                  <Filters.List
                    id="filterStatus"
                    filterField="is_active"
                    options={[
                      { value: "all", label: "Tous" },
                      { value: "1", label: "Activés" },
                      { value: "0", label: "Désactivés" },
                    ]}
                  />
                </Filters.Filter>
              </div>
              <div>
                Rôle{" "}
                <Filters.Filter>
                  <Filters.Toggle id="filterRole" filterField="role" />
                  <Filters.List
                    id="filterRole"
                    filterField="role"
                    options={[
                      { value: "all", label: "Tous" },
                      { value: "user", label: "Utilisateurices" },
                      { value: "contributor", label: "Contributeurices" },
                      { value: "moderator", label: "Modérateurices" },
                      { value: "admin", label: "Administrateurices" },
                    ]}
                  />
                </Filters.Filter>
              </div>
              <div></div>
            </Table.Header>
          </SortBy>
        </Filters>

        <Table.Body
          data={users}
          render={(user) => <UserTableRow key={user.id} user={user} />}
        />

        <Table.Footer>
          <Pagination count={count} />
        </Table.Footer>
      </Table>
    </Menus>
  );
}

export default UserTable;
