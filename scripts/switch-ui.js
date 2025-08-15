#!/usr/bin/env node

import fs from "fs";

const INDEX_HTML_PATH = "./index.html";

function readIndexHtml() {
  try {
    return fs.readFileSync(INDEX_HTML_PATH, "utf8");
  } catch (error) {
    console.error("❌ Erreur lors de la lecture de index.html:", error.message);
    process.exit(1);
  }
}

function writeIndexHtml(content) {
  try {
    fs.writeFileSync(INDEX_HTML_PATH, content, "utf8");
  } catch (error) {
    console.error("❌ Erreur lors de l'écriture de index.html:", error.message);
    process.exit(1);
  }
}

function switchToModern() {
  console.log("🔄 Passage à l'interface moderne...");

  let content = readIndexHtml();

  // Remplacer l'import de l'ancienne interface par la nouvelle
  content = content.replace(
    /src="\.\/src\/index\.tsx"/g,
    'src="./src/modernIndex.tsx"'
  );

  writeIndexHtml(content);
  console.log("✅ Interface moderne activée !");
  console.log("🚀 Redémarrez le serveur de développement si nécessaire.");
}

function switchToClassic() {
  console.log("🔄 Retour à l'interface classique...");

  let content = readIndexHtml();

  // Remplacer l'import de la nouvelle interface par l'ancienne
  content = content.replace(
    /src="\.\/src\/modernIndex\.tsx"/g,
    'src="./src/index.tsx"'
  );

  writeIndexHtml(content);
  console.log("✅ Interface classique activée !");
  console.log("🚀 Redémarrez le serveur de développement si nécessaire.");
}

function showStatus() {
  const content = readIndexHtml();
  const isModern = content.includes("modernIndex.tsx");

  console.log("📊 État actuel de l'interface :");
  console.log(isModern ? "🎨 Interface moderne" : "🏛️ Interface classique");
  console.log("");
  console.log("💡 Commandes disponibles :");
  console.log("  npm run ui:modern  - Passer à l'interface moderne");
  console.log("  npm run ui:classic - Retourner à l'interface classique");
  console.log("  npm run ui:status  - Voir l'état actuel");
}

function main() {
  const command = process.argv[2];

  switch (command) {
    case "modern":
      switchToModern();
      break;
    case "classic":
      switchToClassic();
      break;
    case "status":
      showStatus();
      break;
    default:
      console.log("❌ Commande invalide. Utilisez :");
      console.log("  node scripts/switch-ui.js modern");
      console.log("  node scripts/switch-ui.js classic");
      console.log("  node scripts/switch-ui.js status");
      process.exit(1);
  }
}

main();
