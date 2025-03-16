import axios from "axios";
import fs from "fs";
import { TempoDates } from "../src/types";

async function fetchTempoData() {
  try {
    const response = await axios
      .get(
        "https://www.api-couleur-tempo.fr/api/joursTempo?periode%5B%5D=2024-2025&periode%5B%5D=2023-2024&periode%5B%5D=2022-2023"
      )
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
