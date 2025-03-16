import fs from "fs";
import { fetchTempoData } from "../src/scripts/utils";
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
