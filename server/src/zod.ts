import { z } from "zod";

// Define the schema for ConsumptionLoadCurveData
const ConsumptionLoadCurveDataSchema = z.object({
  recordedAt: z.string(),
  value: z.number(),
});

// Define the schema for an array of ConsumptionLoadCurveData
export const ConsumptionLoadCurveDataArraySchema = z.array(
  ConsumptionLoadCurveDataSchema
);

/* TODO */
