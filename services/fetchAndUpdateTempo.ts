import axios from "axios";
import fs from "fs";
import { TempoDates } from "../src/types";
import { getTempoSeasons } from "./tempoSeasons";

async function fetchTempoData() {
  try {
    const periodes = getTempoSeasons()
      .map((season) => `periode%5B%5D=${season}`)
      .join("&");
    const response = await axios
      .get(`https://www.api-couleur-tempo.fr/api/joursTempo?${periodes}`)
      .then((res) => res.data);
    return response as TempoDates;
  } catch {
    throw new Error("Error fetching tempo data");
  }
}

export async function updateTempoData() {
  try {
    const tempoDates = await fetchTempoData();
    const tempoFilePath = "../src/assets/tempo.json";

    fs.writeFile(tempoFilePath, JSON.stringify(tempoDates), (err) => {
      if (err) {
        console.error("Erreur lors de l'écriture du fichier tempo.json :", err);
      }
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des données tempo :", error);
  }
}
