import * as fs from "fs";
import * as path from "path";

const version = process.env.REACT_APP_VERSION;
if (!version) {
  console.error("REACT_APP_VERSION is not defined");
  process.exit(1);
}
console.log("Version to inject:", version);

const indexPath = path.resolve(__dirname, "build", "index.html");

fs.readFile(indexPath, "utf8", (err, data) => {
  if (err) {
    return console.error("Error reading index.html:", err);
  }

  // Injecter la version dans une balise meta
  const result = data.replace(
    /<title>[^<]*<\/title>/,
    `<title>$&</title><meta name="version" content="${version}">`
  );

  // Écrire les modifications dans index.html
  fs.writeFile(indexPath, result, "utf8", (err) => {
    if (err) {
      return console.error("Error writing to index.html:", err);
    }
    console.log("Version injected into index.html");
  });
});
