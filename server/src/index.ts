import cors from "cors";
import express from "express";
import { z } from "zod";
import hpHcFile from "./hp_hc.json";
import priceMappingFile from "./price_mapping.json";
import { analyseHourByHourBySeason } from "./statistics";
import { ConsumptionLoadCurveDataArraySchema } from "./zod";

const app = express();
const port = 4000;
/* const corsOptions = {
  origin: "http://localhost:3000",
}; */ /* TODO */

app.use(cors());
app.use(express.json());
app.use(express.json({ limit: "500mb" })); /* TODO */

app.get("/availableOffers", (req, res) => {
  res.status(200).json(priceMappingFile);
});

app.get("/hphc", (req, res) => {
  res.status(200).json(hpHcFile);
});

app.post("/offersSimulation", (req, res) => {
  const data = req.body;
  const { powerClass, from, to } = req.query;
  if (!powerClass || typeof powerClass !== "string") {
    res.status(400).json({ error: "Missing query parameters" });
    return;
  }
  try {
    // Validate the JSON data
    const validatedData = ConsumptionLoadCurveDataArraySchema.parse(data);
    /* TODO */
    res.status(200).send(validatedData);
  } catch (e) {
    if (e instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: e.errors });
    } else {
      res.status(500).send("Internal Server Error");
    }
  }
  // eslint-disable-next-line no-console
  console.log(data);
  res.status(200).send("Data received");
});

app.post("/seasonAnalysis", (req, res) => {
  const data = req.body;
  const { from, to } = req.query;

  try {
    // Validate the JSON data
    const validatedData = ConsumptionLoadCurveDataArraySchema.parse(data);
    if (!from || !to || typeof from !== "string" || typeof to !== "string") {
      res
        .status(400)
        .json({ error: "Missing query parameters 'from' and 'to'" });
      return;
    }
    const analysis = analyseHourByHourBySeason({
      data: validatedData,
      dateRange: [new Date(from), new Date(to)],
    });
    res.status(200).send(analysis);
  } catch (e) {
    if (e instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: e.errors });
    } else {
      res.status(500).send("Internal Server Error");
    }
  }
});

// Start the server
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.info(`Server is running on http://localhost:${port}`);
});
