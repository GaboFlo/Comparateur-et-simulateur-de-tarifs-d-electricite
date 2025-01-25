import { Paper } from "@mui/material";
import Typography from "@mui/material/Typography";
import { PieChart } from "@mui/x-charts";
import { BarChart } from "@mui/x-charts/BarChart";
import { useFormContext } from "../context/FormContext";
import { analyseHourByHourBySeason } from "../services/statistics";

export default function HourlySeasonChart() {
  const { formState } = useFormContext();
  if (!formState.dateRange) {
    return null;
  }

  const data = analyseHourByHourBySeason({
    data: formState.consumptionData,
    dateRange: formState.dateRange,
  });

  const sumBySeason = data.reduce((acc, d) => {
    acc[d.season] = d.hourlyPercentages.reduce((acc2, h) => acc2 + h.value, 0);
    return acc;
  }, {} as { [key: string]: number });

  function transformData(input: { [key: string]: number }) {
    const transformed = [];

    const data = Object.entries(input).map(([key, value], index) => ({
      id: index,
      value: Math.round(value),
      label: key,
      color: colorPalette[key],
    }));

    transformed.push({ data });

    return transformed;
  }

  const colorPalette: { [key: string]: string } = {
    Été: "#FFC107", // Yellow
    Hiver: "#00BFFF", // DeepSkyBlue
    Automne: "#FF5722", // DeepOrange
    Printemps: "#4CAF50", // Green
  };

  function valueFormatter(value: number | null) {
    return value ? `${Math.round(value).toFixed(0)} kWh` : "N/A";
  }

  return (
    <Paper>
      <Typography component="h2" gutterBottom>
        Répartition de la consommation par heure et par saison
      </Typography>
      <BarChart
        borderRadius={8}
        xAxis={[
          {
            scaleType: "band",
            data: Array.from({ length: 24 }, (_, i) => i),
          },
        ]}
        series={data.map((d) => ({
          id: d.season,
          data: d.hourlyPercentages.map((h) => h.value),
          label: d.season,
          stack: "stack",
          valueFormatter,
          color: colorPalette[d.season],
        }))}
        height={250}
        margin={{ left: 50, right: 0, top: 20, bottom: 20 }}
        grid={{ horizontal: true }}
        slotProps={{
          legend: {
            hidden: true,
          },
        }}
      />
      <PieChart
        series={transformData(sumBySeason)}
        height={250}
        margin={{ left: 0, right: 0, top: 20, bottom: 20 }}
      />
    </Paper>
  );
}
