import { PowerClass, PriceMappingFile } from "../types";

const getBaseURL = () => {
  const domain = window.location.hostname.split(".")[0];
  if (domain === "localhost") return "http://localhost:10000";
  else return `https://${domain}.todo.com`;
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
  powerClass: PowerClass;
}
export const uploadEdfFile = async ({
  formData,
  start,
  end,
  powerClass,
}: UploadEdfFileProps) => {
  try {
    const resp = await fetch(
      `${getBaseURL()}/uploadEdfFile?start=${start.getTime()}&end=${end.getTime()}&powerClass=${powerClass}`,
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
