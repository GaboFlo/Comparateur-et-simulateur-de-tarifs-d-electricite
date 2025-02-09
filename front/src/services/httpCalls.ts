import { HpHcSlot, PowerClass, PriceMappingFile } from "../types";

const getBaseURL = () => {
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:10000";
  } else {
    return "https://server.comparateur-electricite.gaboflo.fr";
  }
};

export const getAvailableOffers = async (): Promise<PriceMappingFile> => {
  const response = await fetch(`${getBaseURL()}/availableOffers`);
  const data: PriceMappingFile = await response.json();
  return data;
};

export const getDefaultHpHcConfig = async () => {
  const response = await fetch(`${getBaseURL()}/defaultHpHc`);
  const data = await response.json();
  return data as HpHcSlot[];
};

interface UploadEdfFileProps {
  formData: FormData;
  start: Date;
  end: Date;
  requestId: string;
}
export const uploadEdfFile = async ({
  formData,
  start,
  end,
  requestId,
}: UploadEdfFileProps) => {
  const route = `${getBaseURL()}/uploadEdfFile`;
  try {
    const resp = await fetch(
      `${route}?start=${start.getTime()}&end=${end.getTime()}&requestId=${requestId}`,
      {
        method: "POST",
        body: formData,
      }
    );

    return resp.json();
  } catch (error) {
    throw new Error("An error occurred during upload.");
  }
};

interface UploadHpHcConfigProps {
  formData: FormData;
}
export const uploadHpHcConfig = async ({ formData }: UploadHpHcConfigProps) => {
  const route = `${getBaseURL()}/uploadHpHcConfig`;
  try {
    const resp = await fetch(route, {
      method: "POST",
      body: formData,
    });

    return resp.json();
  } catch (error) {
    throw new Error("An error occurred during upload.");
  }
};

interface StreamedDataProps {
  requestId: string;
  start: Date;
  end: Date;
  powerClass: PowerClass;
}
export const getStreamedData = async ({
  requestId,
  start,
  end,
  powerClass,
}: StreamedDataProps) => {
  const route = `${getBaseURL()}/stream/${requestId}?start=${start.getTime()}&end=${end.getTime()}&powerClass=${powerClass}`;
  return route;
};
