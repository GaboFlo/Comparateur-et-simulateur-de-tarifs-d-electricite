import { Paper } from "@mui/material";
import Typography from "@mui/material/Typography";
import { PieChart } from "@mui/x-charts";
import { BarChart } from "@mui/x-charts/BarChart";
import { useFormContext } from "../context/FormContext";
import { analyseHourByHourBySeason } from "../services/statistics";
import { Season } from "../types";

export default function HourlySeasonChart() {
  const { formState } = useFormContext();
  if (!formState.dateRange) {
    return null;
  }

  const data = analyseHourByHourBySeason({
    data: formState.consumptionData,
    dateRange: formState.dateRange,
  });

  function valueFormatter(value: number | null) {
    return value ? `${Math.round(value).toFixed(0)} kWh` : "N/A";
  }

  const colorPalette: { [key in Season]: string } = {
    Été: "#FFC107", // Yellow
    Hiver: "#00BFFF", // DeepSkyBlue
    Automne: "#FF5722", // DeepOrange
    Printemps: "#4CAF50", // Green
  };

  const chartSetting = {
    yAxis: [
      {
        label: "Consommation (kWh)",
      },
    ],
    height: 300,
  };

  return (
    <Paper>
      <Typography component="h2" gutterBottom variant="h4">
        Répartition de la consommation par heure et par saison
      </Typography>
      <BarChart
        borderRadius={5}
        xAxis={[
          {
            scaleType: "band",
            data: Array.from({ length: 24 }, (_, i) => i),
            label: "Heure",
          },
        ]}
        series={data.map((d) => ({
          id: d.season,
          data: d.hourly.map((h) => h.value),
          label: d.season,
          stack: "stack",
          valueFormatter,
          color: colorPalette[d.season],
        }))}
        margin={{ left: 50, right: 20, top: 20, bottom: 20 }}
        grid={{ horizontal: true }}
        slotProps={{
          axisLabel: {
            textAnchor: "middle",
          },
          legend: {
            hidden: true,
          },
        }}
        {...chartSetting}
      />
      <PieChart
        series={[
          {
            data: data.map(
              (d) => ({
                id: d.season,
                label: d.season,
                value: d.seasonTotalSum,
                color: colorPalette[d.season],
              }),
              valueFormatter
            ),
          },
        ]}
        height={300}
        slotProps={{
          legend: {
            hidden: false,
          },
        }}
      />
    </Paper>
  );
}
