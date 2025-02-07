import cors from "cors";
import { endOfDay, isWithinInterval, startOfDay } from "date-fns";
import express, { NextFunction, Request, Response } from "express";
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
  origin: [
    "http://localhost:3000",
    "https://comparateur-electricite.gaboflo.fr",
  ],
};
app.use(cors(corsOptions));
app.use(express.json());

const uploadRelativeDir = "./uploads";
export const assetsRelativeDir = "./assets";

const uploadHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.file) {
    res.status(400).send("Aucun fichier n'a été chargé.");
    return;
  }
  const { start, end } = req.query;
  if (!start || !end) {
    res.status(400).send("Paramètres de requête manquants");
    return;
  }
  const startNumber = Number(start);
  const endNumber = Number(end);
  const askedDateRange: [Date, Date] = [
    new Date(startNumber),
    new Date(endNumber),
  ];
  if (isNaN(startNumber) || isNaN(endNumber)) {
    res.status(400).send("Paramètres start ou end invalides");
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
    if (!csvFile) {
      res.status(404).send("Fichier CSV introuvable dans le zip.");
      return;
    }
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
    const fullPath = path.join(uploadRelativeDir, `${fileId}.json`);
    fs.writeFile(fullPath, JSON.stringify(parsedData), (err) => {
      if (err) {
        console.error("Erreur lors de l'écriture du fichier JSON :", err);
        res.status(500).send("Impossible de sauvegarder le JSON");
        return;
      }
      const dateRangeOfFile = findFirstAndLastDate(parsedData);
      const analyzedDateRange: [number, number] = [
        Math.max(dateRangeOfFile[0], askedDateRange[0].getTime()),
        Math.min(dateRangeOfFile[1], askedDateRange[1].getTime()),
      ];
      const seasonData = analyseHourByHourBySeason({
        data: parsedData,
        dateRange: analyzedDateRange,
      });
      const totalConsumption = seasonData.reduce(
        (acc, cur) => acc + cur.seasonTotalSum,
        0
      );
      res.send({
        seasonData,
        fileId,
        analyzedDateRange,
        totalConsumption,
      });
    });
  } catch (error) {
    console.error("Erreur lors de l'extraction du fichier zip :", error);
    res.status(500).send("Erreur lors de l'extraction du fichier zip.");
  } finally {
    fs.unlink(zipFilePath, (err) => {
      if (err) {
        console.error("Erreur lors de la suppression du fichier zip :", err);
      }
    });
  }
};

const upload = multer({
  dest: uploadRelativeDir,
  limits: { fileSize: 2 * 1024 * 1024 },
});
app.post("/uploadEdfFile", upload.single("file"), uploadHandler);

app.get(
  "/stream/:fileId",
  async (req: Request, res: Response, next: NextFunction) => {
    const fileId = req.params.fileId;
    const { start, end, powerClass } = req.query;
    if (!fileId || !start || !end || !powerClass) {
      res.status(400).send("Champs manquants");
      return;
    }
    const dateRange: [Date, Date] = [
      new Date(Number(start)),
      new Date(Number(end)),
    ];
    const typedPowerClass = Number(powerClass) as PowerClass;
    const typedPriceMappingFile = priceMappingFile as PriceMappingFile;
    const filePath = path.join(uploadRelativeDir, `${fileId}.json`);
    let data: string;
    try {
      data = await readFileAsString(filePath);
    } catch (error) {
      console.error("Erreur lors de la lecture du fichier JSON :", error);
      res.status(500).send("Erreur lors de la lecture du fichier JSON");
      return;
    }
    let jsonData: ConsumptionLoadCurveData[];
    try {
      jsonData = JSON.parse(data);
    } catch (error) {
      console.error("Erreur lors de l'analyse du JSON :", error);
      res.status(500).send("Erreur lors de l'analyse du JSON");
      return;
    }
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    const sendData = async (option: Option) => {
      let filteredData = jsonData.filter((elt) =>
        isWithinInterval(elt.recordedAt, {
          start: startOfDay(dateRange[0]),
          end: endOfDay(dateRange[1]),
        })
      );
      try {
        const rowSummary = await calculateRowSummary({
          data: filteredData,
          dateRange,
          powerClass: typedPowerClass,
          optionKey: option.optionKey,
          offerType: option.offerType,
          optionName: option.optionName,
          link: option.link,
        });
        res.write(`data: ${JSON.stringify({ comparisonRow: rowSummary })}\n\n`);
      } catch (error) {
        console.error("Erreur lors du calcul du résumé :", error);
        res.write(
          `data: ${JSON.stringify({ error: "Erreur lors du calcul" })}\n\n`
        );
      }
    };
    (async () => {
      for (const option of typedPriceMappingFile) {
        await new Promise<void>((resolve) =>
          setImmediate(() => {
            sendData(option)
              .then(resolve)
              .catch((err) => {
                console.error("Erreur lors de l'envoi des données :", err);
                resolve();
              });
          })
        );
      }
      res.end();
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Erreur lors de la suppression du fichier JSON :", err);
        }
      });
    })();
  }
);

app.get("/availableOffers", (req: Request, res: Response) => {
  res.json(priceMappingFile);
});

app.listen(port, () => {
  console.info(`Le serveur fonctionne sur http://localhost:${port}`);
});

cron.schedule("10 */3 * * *", () => {
  (async () => {
    const firstDate = new Date("2020-01-01");
    const now = new Date();
    const holidays = getHolidaysBetweenDates([firstDate, now]);
    const holidayPath = path.join(assetsRelativeDir, "holidays.json");
    fs.writeFile(holidayPath, JSON.stringify(holidays), (err) => {
      if (err) {
        console.error(
          "Erreur lors de l'écriture du fichier holidays.json :",
          err
        );
      }
    });
    try {
      const tempoDates = await fetchTempoData();
      const tempoFilePath = path.join(assetsRelativeDir, "tempo.json");
      fs.writeFile(tempoFilePath, JSON.stringify(tempoDates), (err) => {
        if (err) {
          console.error(
            "Erreur lors de l'écriture du fichier tempo.json :",
            err
          );
        }
      });
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des données tempo :",
        error
      );
    }
  })().catch((err) => {
    console.error("Erreur dans la tâche cron :", err);
  });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Erreur non gérée :", err);
  res.status(500).send("Une erreur est survenue sur le serveur.");
});
