import { useCountProducts } from "./useCountProducts";

import Stat from "./Stat";

function StatCount({ icon, title, color, filters = [], to }) {
  const { isPending, count } = useCountProducts(filters);
  return (
    <Stat
      icon={icon}
      title={title}
      color={color}
      value={count}
      isPending={isPending}
      to={to}
    />
  );
}

export default StatCount;
