import { Stack } from "@mui/system";
import { ComparisonTable } from "./ComparisonTable";
import DatePickers from "./DatePickers";
import HourlySeasonChart from "./HourlySeasonChart";

export default function Simulations() {
  return (
    <Stack>
      <DatePickers />
      <HourlySeasonChart />
      <ComparisonTable />
    </Stack>
  );
}
