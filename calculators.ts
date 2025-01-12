import { AvailableOptions, CalculatedData } from "./types";

interface CalculateBaseProps {
  data: CalculatedData[];
  base_price: number;
  option: AvailableOptions;
}

export function calculateBasePrices({
  data,
  base_price,
  option,
}: CalculateBaseProps): CalculatedData[] {
  return data.map((item) => ({
    ...item,
    costs: [
      ...(item.costs ?? []),
      {
        name: option,
        cost: item.value * base_price,
      },
    ],
  }));
}
