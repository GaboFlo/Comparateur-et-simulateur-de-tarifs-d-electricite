import { Paper } from "@mui/material";
import Typography from "@mui/material/Typography";
import { pieArcLabelClasses, PieChart } from "@mui/x-charts";
import { BarChart } from "@mui/x-charts/BarChart";
import { useFormContext } from "../context/FormContext";
import { Season } from "../types";

export default function HourlySeasonChart() {
  const { formState } = useFormContext();

  const valueFormatter = (value: number | null) => {
    return value ? `${Math.round(value).toFixed(0)} kWh` : "N/A";
  };
  const pieValueFormatter = (item: { value: number }) => `${item.value} kWh`;

  const colorPalette: Record<Season, string> = {
    Été: "#FFD700",
    Hiver: "#1E90FF",
    Automne: "#FF8C00",
    Printemps: "#32CD32",
  };

  const getColor = (season: Season) => {
    return colorPalette[season];
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
      <Typography component="h2" gutterBottom variant="h6">
        Répartition de la consommation par heure et par saison
      </Typography>
      {!formState.seasonHourlyAnalysis ? (
        <Typography>
          Aucune donnée à afficher. Veuillez importer un fichier EDF.
        </Typography>
      ) : (
        <>
          <BarChart
            borderRadius={5}
            xAxis={[
              {
                scaleType: "band",
                data: Array.from({ length: 24 }, (_, i) => i),
                label: "Heure",
              },
            ]}
            series={formState.seasonHourlyAnalysis.map((d) => ({
              id: d.season,
              data: d.hourly.map((h) => h.value),
              label: d.season,
              stack: "stack",
              valueFormatter,
              color: getColor(d.season),
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
                data: formState.seasonHourlyAnalysis.map((d) => ({
                  id: d.season,
                  label: d.season,
                  value: d.seasonTotalSum,
                  color: getColor(d.season),
                  arcLabel: (item: { value: any }) => `${item.value} lol`,
                  arcLabelMinAngle: 35,
                  arcLabelRadius: "60%",
                })),
                valueFormatter: pieValueFormatter,
              },
            ]}
            sx={{
              [`& .${pieArcLabelClasses.root}`]: {
                fontWeight: "bold",
              },
            }}
            height={300}
          />
        </>
      )}
    </Paper>
  );
}
