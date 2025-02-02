/* eslint-disable no-console */
import cors from "cors";
import { endOfDay, isWithinInterval, startOfDay } from "date-fns";
import express, { Request, Response } from "express";
import fs from "fs";
import multer from "multer";
import cron from "node-cron";
import path from "path";
import unzipper from "unzipper";
import { v4 as uuidv4 } from "uuid";
import { default as priceMappingFile } from "../statics/price_mapping.json";
import { calculateRowSummary } from "./calculators";
import {
  ConsumptionLoadCurveData,
  parseCsvToConsumptionLoadCurveData,
} from "./csvParser";
import { analyseHourByHourBySeason } from "./statistics";
import { Option, PowerClass, PriceMappingFile } from "./types";
import {
  fetchTempoData,
  findFirstAndLastDate,
  getHolidaysBetweenDates,
  readFileAsString,
} from "./utils";

const app = express();
app.disable("x-powered-by");
const port = 10000;

const corsOptions = {
  origin: "http://localhost:3000",
};
app.use(cors(corsOptions));

app.use(express.json());

const uploadRelativeDir = "./uploads";
export const staticsRelativeDir = "./statics";

const uploadHandler = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).send("No file uploaded.");
    throw new Error("No file uploaded.");
  }

  const { start, end } = req.query;
  if (!start || !end) {
    res.status(400).send("Missing query parameters");
  }
  const startNumber = Number(start);
  const endNumber = Number(end);
  const askedDateRange: [Date, Date] = [
    new Date(startNumber),
    new Date(endNumber),
  ];

  if (isNaN(startNumber) || isNaN(endNumber)) {
    res.status(400).send("Invalid start or end query parameters");
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
      const fileId = uuidv4();
      const fullPath = `${uploadRelativeDir}/${fileId}.json`;
      fs.writeFile(fullPath, JSON.stringify(parsedData), (err) => {
        if (err) {
          res.sendStatus(500).send("Impossible to save json");
          throw err;
        } else {
          const dateRangeOfFile = findFirstAndLastDate(parsedData);
          const analyzedDateRange: [number, number] = [
            Math.max(dateRangeOfFile[0], askedDateRange[0].getTime()),
            Math.min(dateRangeOfFile[1], askedDateRange[1].getTime()),
          ];
          const seasonData = analyseHourByHourBySeason({
            data: parsedData,
            dateRange: analyzedDateRange,
          });
          res.send({
            seasonData,
            fileId,
            analyzedDateRange,
          });
        }
      });
    } else {
      res.sendStatus(404).send("CSV file not found in the zip.");
    }
  } catch (error) {
    res.sendStatus(500).send("Error extracting zip file.");
  }
  fs.unlink(zipFilePath, (err) => {
    if (err) {
      console.error(err);
      throw err;
    }
  });
};

const upload = multer({
  dest: uploadRelativeDir,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB file size limit
});
app.post("/uploadEdfFile", upload.single("file"), uploadHandler);

app.get("/stream/:fileId", async (req, res) => {
  const fileId = req.params.fileId;
  const { start, end, powerClass } = req.query;

  if (!fileId || !start || !end || !powerClass) {
    res.status(400).send("Missing fields");
  }

  const dateRange: [Date, Date] = [
    new Date(Number(start)),
    new Date(Number(end)),
  ];
  const typedPowerClass = Number(powerClass) as PowerClass;
  const typedPriceMappingFile = priceMappingFile as PriceMappingFile;
  const filePath = path.join(uploadRelativeDir, `${fileId}.json`);

  let data: string | undefined;

  data = await readFileAsString(filePath);
  if (!data) {
    res.sendStatus(500);
    throw new Error("No data found");
  }

  let jsonData: ConsumptionLoadCurveData[] = JSON.parse(data);

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const sendData = async (option: Option) => {
    if (dateRange) {
      jsonData = jsonData.filter((elt) => {
        return isWithinInterval(elt.recordedAt, {
          start: startOfDay(dateRange[0]),
          end: endOfDay(dateRange[1]),
        });
      });
    }
    const rowSummary = await calculateRowSummary({
      data: jsonData,
      dateRange,
      powerClass: typedPowerClass,
      optionKey: option.optionKey,
      offerType: option.offerType,
      optionName: option.optionName,
      link: option.link,
    });

    res.write(`data: ${JSON.stringify({ comparisonRow: rowSummary })}\n\n`);
  };

  (async () => {
    for (const option of typedPriceMappingFile) {
      await new Promise((resolve) =>
        setImmediate(() => {
          (async () => {
            await sendData(option);
            resolve(null);
          })().catch((err) => {
            console.error(err);
          });
        })
      );
    }
    res.end();
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(err);
        throw err;
      }
    });
  })();
});

app.get("/availableOffers", (req, res) => {
  res.json(priceMappingFile);
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.info(`Server is running on http://localhost:${port}`);
});

cron.schedule("*/1 * * * *", () => {
  (async () => {
    const firstDate = new Date("2020-01-01");
    const now = new Date();

    /* Holidays */
    const holidays = getHolidaysBetweenDates([firstDate, now]);
    const holidayPath = `${staticsRelativeDir}/holidays.json`;
    fs.writeFile(holidayPath, JSON.stringify(holidays), (err) => {
      if (err) {
        console.error("Error writing holidays file", err);
        throw err;
      }
    });

    /* Tempo */
    const tempoDates = await fetchTempoData();
    const tempoFilePath = `${staticsRelativeDir}/tempo.json`;
    fs.writeFile(tempoFilePath, JSON.stringify(tempoDates), (err) => {
      if (err) {
        console.error("Error writing tempo file", err);
        throw err;
      }
    });
  })().catch((err) => {
    console.error(err);
  });
});
