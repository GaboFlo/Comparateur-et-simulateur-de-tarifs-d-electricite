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
  const dataLines = lines.slice(3);
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

function processEnedisDataLine(line: string): ConsumptionLoadCurveData | null {
  const parts = line.split(";");
  if (parts.length < 3) {
    return null;
  }

  let debutStr = parts[0].trim();
  const finStr = parts[1].trim();
  let kwStr = parts[2].trim();

  if (!debutStr || !finStr || !kwStr) {
    return null;
  }

  debutStr = debutStr.replace(/(?:^")|(?:"$)/g, "");
  kwStr = kwStr.replace(/(?:^")|(?:"$)/g, "");
  const numericValueKwh = Number(kwStr.replace(",", "."));
  if (
    isNaN(numericValueKwh) ||
    !isFinite(numericValueKwh) ||
    numericValueKwh < 0
  ) {
    return null;
  }
  const numericValue = numericValueKwh * 1000;

  const dateRegex = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})$/;
  if (!dateRegex.test(debutStr)) {
    return null;
  }

  const date = new Date(debutStr);
  if (isNaN(date.getTime())) {
    return null;
  }

  if (![0, 30].includes(date.getMinutes())) {
    console.warn("date étrange", date);
    return null;
  }

  return {
    recordedAt: dayjs(date).format("YYYY-MM-DDTHH:mm:ssZ"),
    value: numericValue,
  };
}

export function parseEnedisCsvToConsumptionLoadCurveData(
  csvString: string
): ConsumptionLoadCurveData[] {
  validateCsvInput(csvString);

  const lines = csvString.trim().split("\n");
  if (lines.length < 2) {
    throw new Error("Le fichier CSV Enedis est vide ou invalide");
  }

  const headerLine = lines[0].trim().toLowerCase();
  if (
    !headerLine.includes("debut") ||
    !headerLine.includes("fin") ||
    !headerLine.includes("kw")
  ) {
    throw new Error(
      "Le format du fichier CSV Enedis est invalide. Colonnes attendues : debut;fin;kW"
    );
  }

  const allData: ConsumptionLoadCurveData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      continue;
    }

    const dataItem = processEnedisDataLine(line);
    if (dataItem) {
      allData.push(dataItem);
    }
  }

  if (allData.length === 0) {
    throw new Error("Aucune donnée valide trouvée dans le fichier CSV Enedis");
  }

  console.log("allData", allData.pop());

  return allData;
}
