import dayjs from "dayjs";

export interface ConsumptionLoadCurveData {
  recordedAt: string;
  value: number;
}

export function parseCsvToConsumptionLoadCurveData(
  csvString: string
): ConsumptionLoadCurveData[] {
  // Validation de sécurité des données d'entrée
  if (!csvString || typeof csvString !== "string") {
    throw new Error("Données CSV invalides");
  }

  // Limitation de la taille pour éviter les attaques par déni de service
  const MAX_CSV_SIZE = 10 * 1024 * 1024; // 10MB
  if (csvString.length > MAX_CSV_SIZE) {
    throw new Error("Fichier CSV trop volumineux");
  }

  // Limitation du nombre de lignes
  const MAX_LINES = 100000; // 100k lignes maximum
  const lines = csvString.trim().split("\n");
  if (lines.length > MAX_LINES) {
    throw new Error("Fichier CSV trop volumineux (trop de lignes)");
  }

  const allData: ConsumptionLoadCurveData[] = [];
  const dataLines = lines.slice(3); // Skip header lines

  let currentDateString = "";

  for (const line of dataLines) {
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

      // Validation des données
      if (!time || !value) {
        continue; // Skip invalid lines
      }

      // Validation de la valeur numérique
      const numericValue = Number(value);
      if (isNaN(numericValue) || !isFinite(numericValue) || numericValue < 0) {
        continue; // Skip invalid values
      }

      const combinedDateString = `${currentDateString} ${time}`;
      const [day, month, year] = combinedDateString.split(" ")[0].split("/");

      // Validation de la date
      if (
        !day ||
        !month ||
        !year ||
        day.length !== 2 ||
        month.length !== 2 ||
        year.length !== 4
      ) {
        continue; // Skip invalid dates
      }

      const formattedDate = `${year}-${month}-${day} ${
        combinedDateString.split(" ")[1]
      }`;
      const date = new Date(formattedDate);

      // Validation de la date créée
      if (isNaN(date.getTime())) {
        continue; // Skip invalid dates
      }

      /* A améliorer mais pour les HP-HC plus simple  */
      if ([0, 30].includes(date.getMinutes())) {
        allData.push({
          recordedAt: dayjs(date).format("YYYY-MM-DDTHH:mm:ssZ"),
          value: numericValue,
        });
      }
    }
  }

  return allData;
}
