import { useQuery } from "@tanstack/react-query";

import { getVeganuaryWeeks } from "@/services/apiVeganuary";

import { veganuaryKeys } from "./queryKeyFactory";

export function useVeganuaryWeeks() {
  const { isPending, data: weeks, error } = useQuery({
    queryKey: veganuaryKeys.all(),
    queryFn: getVeganuaryWeeks,
  });

  return { isPending, error, weeks };
}
