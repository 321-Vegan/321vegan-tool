import { useSearchReviews } from "./useSearchReviews";
import { REVIEWS_STATUSES } from "@/utils/constants";

import Table from "@/ui/Table";
import Menus from "@/ui/Menus";
import Spinner from "@/ui/Spinner";
import Pagination from "@/ui/Pagination";
import Filters from "@/ui/Filters";
import SortBy from "@/ui/SortBy";
import ReviewTableRow from "./ReviewTableRow";

/**
 * Moderation table for any reviewed resource.
 *
 * @param {String} resource: API prefix, e.g. "shop-reviews"
 * @param {Object} subject: the reviewed item column
 *   { label, filterField, toFilter: (value) => filter, render: (review) => node }
 * @param {Number} minRating: lowest rating allowed by the API
 * @param {String} defaultStatus: status filter applied when none is selected
 * */
function ReviewTable({ resource, subject, minRating = 1, defaultStatus }) {
  const { isPending, reviews, count } = useSearchReviews(
    resource,
    subject,
    defaultStatus,
  );

  if (isPending) return <Spinner />;

  return (
    <Menus>
      <Table columns="1.4fr 2fr 1.6fr 1.6fr 1.4fr 1.4fr 3.2rem">
        <Filters>
          <SortBy>
            <Table.Header>
              <div>
                Note
                <SortBy.Sort sortByField="rating" />
                <Filters.Filter>
                  <Filters.Toggle id="filterRating" filterField="rating" />
                  <Filters.List
                    id="filterRating"
                    filterField="rating"
                    options={[
                      { value: "all", label: "Tous" },
                      ...Array.from(
                        { length: 6 - minRating },
                        (_, i) => i + minRating,
                      ).map((i) => {
                        // String values: compared to search params, and "0" must stay truthy
                        return { value: String(i), label: `${i}/5` };
                      }),
                    ]}
                  />
                </Filters.Filter>
              </div>

              <div>
                Commentaire
                <Filters.Filter>
                  <Filters.Toggle id="filterComment" filterField="comment" />
                  <Filters.Search id="filterComment" filterField="comment" />
                </Filters.Filter>
              </div>

              <div>
                {subject.label}
                <Filters.Filter>
                  <Filters.Toggle
                    id="filterSubject"
                    filterField={subject.filterField}
                  />
                  <Filters.Search
                    id="filterSubject"
                    filterField={subject.filterField}
                  />
                </Filters.Filter>
              </div>

              <div>
                Utilisateurice
                <Filters.Filter>
                  <Filters.Toggle id="filterUser" filterField="user" />
                  <Filters.Search id="filterUser" filterField="user" />
                </Filters.Filter>
              </div>

              <div>
                Date de création
                <SortBy.Sort sortByField="created_at" />
              </div>

              <div>
                Status{" "}
                <Filters.Filter>
                  <Filters.Toggle
                    id="filterStatus"
                    filterField="status"
                    defaultValue={defaultStatus}
                  />
                  <Filters.List
                    id="filterStatus"
                    filterField="status"
                    defaultValue={defaultStatus}
                    options={[
                      { value: "all", label: "Tous" },
                      ...Object.entries(REVIEWS_STATUSES).map(([key, o]) => {
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
          data={reviews}
          render={(review) => (
            <ReviewTableRow
              key={review.id}
              resource={resource}
              review={review}
              subject={subject}
            />
          )}
        />

        <Table.Footer>
          <Pagination count={count} />
        </Table.Footer>
      </Table>
    </Menus>
  );
}

export default ReviewTable;
