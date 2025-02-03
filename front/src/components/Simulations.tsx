import { Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { format } from "date-fns";
import { useFormContext } from "../context/FormContext";
import { ComparisonTable } from "./ComparisonTable";
import HourlySeasonChart from "./HourlySeasonChart";

export default function Simulations() {
  const { formState } = useFormContext();
  return (
    <Stack textAlign={"center"}>
      <Typography variant="h5">
        Selon votre consommation du{" "}
        {formState.analyzedDateRange
          ? format(formState.analyzedDateRange[0], "dd/MM/yyyy")
          : format(formState.dateRange[0], "dd/MM/yyyy")}{" "}
        au{" "}
        {formState.analyzedDateRange
          ? format(formState.analyzedDateRange[1], "dd/MM/yyyy")
          : format(formState.dateRange[1], "dd/MM/yyyy")}
      </Typography>
      <HourlySeasonChart />
      <ComparisonTable />
    </Stack>
  );
}
