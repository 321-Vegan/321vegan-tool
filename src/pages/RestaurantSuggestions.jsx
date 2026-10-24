import { useSearchParams } from "react-router-dom";
import styled from "styled-components";

import Row from "@/ui/Row";
import Heading from "@/ui/Heading";
import Button from "@/ui/Button";
import Empty from "@/ui/Empty";
import Pagination from "@/ui/Pagination";
import Spinner from "@/ui/Spinner";

import RestaurantSuggestionCard from "@/features/restaurants/RestaurantSuggestionCard";
import {
  useModerateRestaurantSuggestion,
  useRestaurantSuggestions,
} from "@/features/restaurants/useRestaurantSuggestions";

import { HiOutlinePencilSquare } from "react-icons/hi2";

const STATUS_TABS = [
  ["PENDING", "En attente"],
  ["APPROVED", "Appliquées"],
  ["PARTIALLY_APPROVED", "En partie"],
  ["REJECTED", "Rejetées"],
  ["all", "Toutes"],
];

const Tabs = styled.div`
  display: flex;
  gap: 1.2rem;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.4rem;
  margin-bottom: 2.4rem;
`;

function RestaurantSuggestions() {
  const [, setSearchParams] = useSearchParams();
  const { isPending, suggestions, count, status } = useRestaurantSuggestions();
  const { isWorking, applySuggestion, rejectSuggestion } =
    useModerateRestaurantSuggestion();

  return (
    <>
      <Row type="horizontal">
        <Heading as="h1">
          <HiOutlinePencilSquare /> Propositions restaurants
        </Heading>
        <Tabs>
          {STATUS_TABS.map(([value, label]) => (
            <Button
              key={value}
              $size="small"
              $variation={value === status ? "primary" : "secondary"}
              onClick={() => setSearchParams({ status: value })}
            >
              {label}
            </Button>
          ))}
        </Tabs>
      </Row>

      {isPending ? (
        <Spinner />
      ) : !suggestions.length ? (
        <Empty message="Aucune proposition 💚" />
      ) : (
        <>
          <List>
            {suggestions.map((suggestion) => (
              <RestaurantSuggestionCard
                // Status in the key: a reviewed card resets its selection
                key={`${suggestion.id}-${suggestion.status}`}
                suggestion={suggestion}
                isWorking={isWorking}
                onApply={applySuggestion}
                onReject={rejectSuggestion}
              />
            ))}
          </List>
          <Pagination count={count} />
        </>
      )}
    </>
  );
}

export default RestaurantSuggestions;
