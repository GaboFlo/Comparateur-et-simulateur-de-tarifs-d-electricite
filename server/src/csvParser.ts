import { format } from "date-fns";

export interface ConsumptionLoadCurveData {
  recordedAt: string;
  value: number;
}

export function parseCsvToConsumptionLoadCurveData(
  csvString: string
): ConsumptionLoadCurveData[] {
  const allData: ConsumptionLoadCurveData[] = [];
  const lines = csvString.trim().split("\n").slice(3);

  let currentDateString = "";

  for (const line of lines) {
    if (line.trim() === "") {
      // Check for empty line (day separator)
      currentDateString = "";
      continue;
    }

    const dateRegex = /^(\d{2}\/\d{2}\/\d{4});;/;
    const dateMatch = dateRegex.exec(line);
    if (dateMatch) {
      currentDateString = dateMatch[1];
      continue; // Skip the date line itself
    }

    if (currentDateString && line.includes(";")) {
      // Process data lines
      const [time, value] = line.split(";");
      const combinedDateString = `${currentDateString} ${time}`;
      const [day, month, year] = combinedDateString.split(" ")[0].split("/");
      const formattedDate = `${year}-${month}-${day} ${
        combinedDateString.split(" ")[1]
      }`;
      const date = new Date(formattedDate);

      /* A améliorer mais pour les HP-HC plus simple  */
      if ([0, 30].includes(date.getMinutes())) {
        allData.push({
          recordedAt: format(date, "yyyy-MM-dd'T'HH:mm:ssXXX"),
          value: Number(value),
        });
      }
    }
  }

  return allData;
}
