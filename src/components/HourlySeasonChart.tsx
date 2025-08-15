import { CircularProgress, Divider, Paper } from "@mui/material";
import Typography from "@mui/material/Typography";
import { pieArcLabelClasses, PieChart } from "@mui/x-charts";
import { BarChart } from "@mui/x-charts/BarChart";
import { useEffect, useState } from "react";
import { useFormContext } from "../context/FormContext";
import { formatKWhLarge, getSeasonColor } from "../scripts/utils";

export default function HourlySeasonChart() {
  const { formState } = useFormContext();
  const [isChartReady, setIsChartReady] = useState(false);

  useEffect(() => {
    if (formState.seasonHourlyAnalysis) {
      setIsChartReady(true);
    } else {
      setIsChartReady(false);
    }
  }, [formState.seasonHourlyAnalysis]);

  const valueFormatter = (value: number | null) => {
    return value ? formatKWhLarge(value) : "N/A";
  };
  const pieValueFormatter = (item: { value: number }) =>
    formatKWhLarge(item.value);

  const chartSetting = {
    yAxis: [
      {
        label: `Consommation (kWh)
        `,
      },
    ],
    height: 300,
  };

  return (
    <Paper sx={{ padding: 2 }}>
      <Typography component="h2" gutterBottom variant="h6">
        Répartition de la consommation par heure et par saison
      </Typography>
      {!formState.seasonHourlyAnalysis ? (
        <Typography>
          Aucune donnée à afficher. Veuillez importer un fichier EDF.
        </Typography>
      ) : !isChartReady ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 300,
          }}
        >
          <CircularProgress thickness={8} size={60} />
        </div>
      ) : (
        <>
          <BarChart
            borderRadius={10}
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
              color: getSeasonColor(d.season),
            }))}
            margin={{ left: 75, right: 20, top: 20, bottom: 20 }}
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
          <Typography component="h3" gutterBottom variant="body2">
            Heure
          </Typography>
          <Divider sx={{ m: 2 }} />
          <Typography component="h2" gutterBottom variant="h6">
            Répartition de la consommation par saison
          </Typography>
          <PieChart
            series={[
              {
                arcLabel: (item: { value: number }) =>
                  `${Math.round(
                    (item.value / formState.totalConsumption) * 100
                  )}%`,
                data: formState.seasonHourlyAnalysis.map((d) => ({
                  id: d.season,
                  label: d.season,
                  value: d.seasonTotalSum,
                  color: getSeasonColor(d.season),
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
              padding: 2,
            }}
            height={300}
          />
        </>
      )}
    </Paper>
  );
}
