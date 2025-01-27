import { ConsumptionLoadCurveData, PowerClass } from "../types";

const getBaseURL = () => {
  const domain = window.location.hostname.split(".")[0];
  if (domain === "localhost") return "http://localhost:4000";
  else return `https://${domain}.todo.com`;
};

export const getAvailableOffers = async () => {
  const response = await fetch(`${getBaseURL()}/availableOffers`);
  return response.json();
};

export const getHphc = async () => {
  const response = await fetch(`${getBaseURL()}/hphc`);
  return response.json();
};

export const postSeasonAnalysis = async (
  data: ConsumptionLoadCurveData[],
  dateRange?: [Date, Date]
) => {
  if (!dateRange) {
    const dates = data.map((item) => new Date(item.recordedAt).getTime());
    dateRange = [new Date(Math.min(...dates)), new Date(Math.max(...dates))];
  }
  const response = await fetch(
    `${getBaseURL()}/seasonAnalysis?from=${dateRange[0].getTime()}&to=${dateRange[1].getTime()}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );
  return response.json();
};

interface FullCalculatePricesInterface {
  data: ConsumptionLoadCurveData[];
  powerClass: PowerClass;
  dateRange: [Date, Date];
}
export const postSimulation = async ({
  data,
  powerClass,
  dateRange,
}: FullCalculatePricesInterface) => {
  const response = await fetch(
    `${getBaseURL()}/simulation?powerClass=${powerClass}&from=${dateRange[0].getTime()}&to=${dateRange[1].getTime()}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );
  return response.json();
};
