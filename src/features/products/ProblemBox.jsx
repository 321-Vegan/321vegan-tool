import styled from "styled-components";

const StyledProblemBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const IngredientBox = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
`;

const IngredientLabel = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: var(--border-radius-sm);
  box-shadow: var(--shadow-sm);
  text-transform: uppercase;
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--color-red-100);
  background-color: var(--color-red-700);

  &:hover,
  &:has(input:checked) {
    color: var(--color-red-700);
    background-color: var(--color-red-100);
  }

  & > input {
    display: none;
  }
`;

const FOOD_PROBLEMS = [
  "lait",
  "œuf",
  "miel",
  "viande",
  "poisson",
  "gélatine",
  "arômes",
  "arômes naturels",
  "vitamines",
  "cire d'abeille",
  "ingrédients inconnus",
];

const COSMETIC_PROBLEMS = [
  "marque non cruelty free",
  "lait",
  "œuf",
  "miel",
  "parfum",
  "cire d'abeille",
  "ingrédients inconnus",
  "formule vegan ?",
  "marque cruelty free ?"
];

const PROBLEMS_BY_PRODUCT_TYPE = {
  FOOD: FOOD_PROBLEMS,
  COSMETIC: COSMETIC_PROBLEMS,
};

function normalize(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/œ/g, "oe");
}

function splitProblems(value) {
  return (value || "")
    .split(/[,;]+/)
    .map((v) => v.trim())
    .filter((v) => v);
}

function ProblemBox({ children, defaultValue, onChange, productType }) {
  const problems = PROBLEMS_BY_PRODUCT_TYPE[productType] || FOOD_PROBLEMS;
  // Chips reflect the textarea content, so they stay in sync when the text
  // is edited by hand or when the product type (and thus the list) changes.
  const selectedProblems = splitProblems(defaultValue).map(normalize);

  function handleToggleProblem(e) {
    const { checked, value } = e.target;
    const valueToCheck = normalize(value);
    let valuesArray = splitProblems(defaultValue);
    const isIncluded = valuesArray.some(
      (val) => normalize(val) === valueToCheck,
    );
    if (checked && !isIncluded) {
      valuesArray.push(`${value.charAt(0).toUpperCase()}${value.slice(1)}`);
    } else if (!checked && isIncluded) {
      valuesArray = valuesArray.filter(
        (val) => normalize(val) !== valueToCheck,
      );
    }
    onChange("problem_description", valuesArray.join(", "));
  }

  return (
    <StyledProblemBox>
      {children}
      <IngredientBox>
        {problems.map((label) => (
          <IngredientLabel key={label}>
            <input
              type="checkbox"
              value={label}
              checked={selectedProblems.includes(normalize(label))}
              onChange={handleToggleProblem}
            />
            {label}
          </IngredientLabel>
        ))}
      </IngredientBox>
    </StyledProblemBox>
  );
}

export default ProblemBox;
