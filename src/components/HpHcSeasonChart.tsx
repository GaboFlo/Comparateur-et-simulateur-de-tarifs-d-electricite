import { CircularProgress, Paper } from "@mui/material";
import Typography from "@mui/material/Typography";
import { BarChart } from "@mui/x-charts/BarChart";
import { useEffect, useState } from "react";
import { useFormContext } from "../context/FormContext";
import { calculateHpHcSeasonAnalysis } from "../scripts/calculators";
import { formatKWh } from "../scripts/utils";
import { HpHcSeasonAnalysis } from "../types";

export default function HpHcSeasonChart() {
  const { formState } = useFormContext();
  const [isChartReady, setIsChartReady] = useState(false);

  useEffect(() => {
    if (formState.parsedData && formState.hpHcConfig) {
      setIsChartReady(true);
    } else {
      setIsChartReady(false);
    }
  }, [formState.parsedData, formState.hpHcConfig]);

  const valueFormatter = (value: number | null) => {
    if (!value) return "N/A";
    return formatKWh(value);
  };

  const chartSetting = {
    yAxis: [
      {
        label: `Consommation (kWh)
        `,
        valueFormatter: (value: number) => formatKWh(value, false),
      },
    ],
    height: 300,
  };

  if (!formState.parsedData || !formState.hpHcConfig) {
    return (
      <Paper sx={{ padding: 2 }}>
        <Typography component="h2" gutterBottom variant="h6">
          Répartition de la consommation HP/HC par saison
        </Typography>
        <Typography>
          Aucune donnée à afficher. Veuillez importer un fichier EDF et
          configurer les heures creuses/pleines.
        </Typography>
      </Paper>
    );
  }

  const hpHcSeasonAnalysis: HpHcSeasonAnalysis[] = calculateHpHcSeasonAnalysis(
    formState.parsedData,
    formState.hpHcConfig
  );

  return (
    <>
      {!isChartReady ? (
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
        <BarChart
          borderRadius={10}
          xAxis={[
            {
              scaleType: "band",
              data: hpHcSeasonAnalysis.map((s) => s.season),
              label: "Saison",
            },
          ]}
          series={[
            {
              id: "HP",
              data: hpHcSeasonAnalysis.map((s) => s.hpHcData.HP / 1000),
              label: "Heures Pleines",
              valueFormatter,
              color: "#e0e0e0",
              stackOffset: "none",
              stack: "total",
            },
            {
              id: "HC",
              data: hpHcSeasonAnalysis.map((s) => s.hpHcData.HC / 1000),
              label: "Heures Creuses",
              valueFormatter,
              color: "#4CAF50",
              stackOffset: "none",
              stack: "total",
            },
          ]}
          margin={{ left: 120, right: 20, top: 50, bottom: 40 }}
          grid={{ horizontal: true }}
          slotProps={{
            axisLabel: {
              textAnchor: "middle",
            },
            legend: {
              hidden: false,
            },
          }}
          {...chartSetting}
        />
      )}
    </>
  );
}
