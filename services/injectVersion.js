const fs = require("fs");
const path = require("path");

// Get the version from command-line arguments
const args = process.argv.slice(2);
const version = args[0]; // First argument passed to the script

if (!version) {
  console.error("Error: Version parameter is required.");
  process.exit(1);
}

const indexPath = path.resolve(__dirname, "..", "build", "index.html");

fs.readFile(indexPath, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading file:", err.message);
    process.exit(1);
  }

  const result = data.replace(
    /<title>[^<]*<\/title>/,
    `$&<meta name="version" content="${version}">`
  );

  fs.writeFile(indexPath, result, "utf8", (err) => {
    if (err) return console.log(err);
    console.log("Version injected into index.html");
  });
});
