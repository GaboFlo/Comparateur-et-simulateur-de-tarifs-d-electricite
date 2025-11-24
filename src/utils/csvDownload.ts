import { ConsumptionLoadCurveData } from "../scripts/csvParser";

function downloadCsv(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadCsvString(csvString: string, filename: string): void {
  downloadCsv(csvString, filename);
}

export function downloadConsumptionDataAsCsv(
  data: ConsumptionLoadCurveData[],
  filename: string
): void {
  const header = "recordedAt;value\n";
  const rows = data
    .map((item) => `${item.recordedAt};${item.value}`)
    .join("\n");
  const csvContent = header + rows;
  downloadCsv(csvContent, filename);
}

