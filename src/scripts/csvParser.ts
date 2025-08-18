import dayjs from "dayjs";

export interface ConsumptionLoadCurveData {
  recordedAt: string;
  value: number;
}

// Fonction utilitaire pour valider les données CSV
function validateCsvInput(csvString: string): void {
  if (!csvString || typeof csvString !== "string") {
    throw new Error("Données CSV invalides");
  }

  const MAX_CSV_SIZE = 10 * 1024 * 1024; // 10MB
  if (csvString.length > MAX_CSV_SIZE) {
    throw new Error("Fichier CSV trop volumineux");
  }

  const MAX_LINES = 100000; // 100k lignes maximum
  const lines = csvString.trim().split("\n");
  if (lines.length > MAX_LINES) {
    throw new Error("Fichier CSV trop volumineux (trop de lignes)");
  }
}

// Fonction utilitaire pour extraire la date depuis une ligne
function extractDateFromLine(line: string): string | null {
  const dateRegex = /^(\d{2}\/\d{2}\/\d{4});;/;
  const dateMatch = dateRegex.exec(line);
  return dateMatch ? dateMatch[1] : null;
}

// Fonction utilitaire pour valider et traiter une ligne de données
function processDataLine(
  line: string,
  currentDateString: string
): ConsumptionLoadCurveData | null {
  if (!currentDateString || !line.includes(";")) {
    return null;
  }

  const [time, value] = line.split(";");
  if (!time || !value) {
    return null;
  }

  const numericValue = Number(value);
  if (isNaN(numericValue) || !isFinite(numericValue) || numericValue < 0) {
    return null;
  }

  const combinedDateString = `${currentDateString} ${time}`;
  const [day, month, year] = combinedDateString.split(" ")[0].split("/");

  if (
    !day ||
    !month ||
    !year ||
    day.length !== 2 ||
    month.length !== 2 ||
    year.length !== 4
  ) {
    return null;
  }

  const formattedDate = `${year}-${month}-${day} ${
    combinedDateString.split(" ")[1]
  }`;
  const date = new Date(formattedDate);

  if (isNaN(date.getTime()) || ![0, 30].includes(date.getMinutes())) {
    return null;
  }

  return {
    recordedAt: dayjs(date).format("YYYY-MM-DDTHH:mm:ssZ"),
    value: numericValue,
  };
}

export function parseCsvToConsumptionLoadCurveData(
  csvString: string
): ConsumptionLoadCurveData[] {
  validateCsvInput(csvString);

  const lines = csvString.trim().split("\n");
  const dataLines = lines.slice(3); // Skip header lines
  const allData: ConsumptionLoadCurveData[] = [];
  let currentDateString = "";

  for (const line of dataLines) {
    if (line.trim() === "") {
      currentDateString = "";
      continue;
    }

    const extractedDate = extractDateFromLine(line);
    if (extractedDate) {
      currentDateString = extractedDate;
      continue;
    }

    const dataItem = processDataLine(line, currentDateString);
    if (dataItem) {
      allData.push(dataItem);
    }
  }

  return allData;
}
