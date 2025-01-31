import cors from "cors";
import express, { Request, Response } from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import unzipper from "unzipper";
import { PowerClass } from "../../front/src/types";
import { calculateRowSummaryForAllOptions } from "./calculators";
import { parseCsvToConsumptionLoadCurveData } from "./csvParser";
import priceMappingFile from "./price_mapping.json";
import { analyseHourByHourBySeason } from "./statistics";
import { findFirstAndLastDate } from "./utils";

const app = express();
const port = 10000;
/* const corsOptions = {
  origin: "http://localhost:3000",
}; */ /* TODO */

app.use(cors());
app.use(express.json());

const uploadRelativeDir = "./uploads";

const uploadDir = path.join(uploadRelativeDir);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const uploadHandler = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).send("No file uploaded.");
    return;
  }
  const { start, end, powerClass } = req.query;
  if (!start || !end || !powerClass) {
    res.status(400).send("Missing query parameters");
    return;
  }
  const startNumber = Number(start);
  const endNumber = Number(end);
  const dateRange: [Date, Date] = [new Date(startNumber), new Date(endNumber)];

  if (
    isNaN(startNumber) ||
    isNaN(endNumber) ||
    typeof powerClass !== "string"
  ) {
    res.status(400).send("Invalid start or end query parameters");
    return;
  }

  const zipFilePath = req.file.path;

  try {
    const directory = await unzipper.Open.file(zipFilePath);
    const csvFile = directory.files.find(
      (file) =>
        file.path.startsWith("mes-puissances-atteintes-30min") &&
        file.path.endsWith(".csv")
    );
    if (csvFile) {
      const csvContent = await new Promise<string>((resolve, reject) => {
        const chunks: Buffer[] = [];
        csvFile
          .stream()
          .on("data", (chunk) => chunks.push(chunk))
          .on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")))
          .on("error", reject);
      });
      const parsedData = parseCsvToConsumptionLoadCurveData(csvContent);
      const seasonData = analyseHourByHourBySeason({
        data: parsedData,
        dateRange,
      });

      const typedPowerClass = Number(powerClass) as PowerClass;
      res.json({
        seasonHourlyAnalysis: seasonData,
        analyzedDateRange: findFirstAndLastDate(parsedData),
        comparisonRows: await calculateRowSummaryForAllOptions({
          data: parsedData,
          dateRange,
          powerClass: typedPowerClass,
        }),
      });
    } else {
      res.status(404).send("CSV file not found in the zip.");
    }
  } catch (error) {
    console.error("Error extracting zip file:", error);
    res.status(500).send("Error extracting zip file.");
  } finally {
    // Unlink all files in the upload directory
    fs.readdir(uploadDir, (err, files) => {
      if (err) {
        console.error("Error reading upload directory:", err);
        return;
      }
      files.forEach((file) => {
        fs.unlink(path.join(uploadDir, file), (err) => {
          if (err) {
            console.error("Error deleting file:", err);
          }
        });
      });
    });
  }
};

const upload = multer({ dest: uploadRelativeDir });
app.post("/uploadEdfFile", upload.single("file"), uploadHandler);

app.get("/availableOffers", (req, res) => {
  res.status(200).json(priceMappingFile);
});

// Start the server
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.info(`Server is running on http://localhost:${port}`);
});
