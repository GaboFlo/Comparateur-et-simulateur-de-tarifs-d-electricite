import { PowerClass, PriceMappingFile } from "../types";

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

interface UploadEdfFileProps {
  formData: FormData;
  start: Date;
  end: Date;
}
export const uploadEdfFile = async ({
  formData,
  start,
  end,
}: UploadEdfFileProps) => {
  const route = `${getBaseURL()}/uploadEdfFile`;
  try {
    const resp = await fetch(
      `${route}?start=${start.getTime()}&end=${end.getTime()}`,
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

interface StreamedDataProps {
  fileId: string;
  start: Date;
  end: Date;
  powerClass: PowerClass;
}
export const getStreamedData = async ({
  fileId,
  start,
  end,
  powerClass,
}: StreamedDataProps) => {
  const route = `${getBaseURL()}/stream/${fileId}?start=${start.getTime()}&end=${end.getTime()}&powerClass=${powerClass}`;
  return route;
};
