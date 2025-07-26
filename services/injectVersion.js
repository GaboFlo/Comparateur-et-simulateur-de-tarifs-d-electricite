const fs = require("fs");
const path = require("path");

// Get the version from command-line arguments
const args = process.argv.slice(2);
const version = args[0]; // First argument passed to the script

if (!version) {
  console.error("Error: Version parameter is required.");
  process.exit(1);
}

// Paths to the index.html and sitemap.xml files
const indexPath = path.resolve(__dirname, "..", "build", "index.html");
const sitemapPath = path.resolve(__dirname, "..", "build", "sitemap.xml");

// Function to get current date in YYYY-MM-DD format
const getCurrentDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Update index.html with version
fs.readFile(indexPath, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading index.html file:", err.message);
    process.exit(1);
  }

  const result = data.replace(
    /<title>[^<]*<\/title>/,
    `$&<meta name="version" content="${version}">`
  );

  fs.writeFile(indexPath, result, "utf8", (err) => {
    if (err) {
      console.error("Error writing to index.html file:", err);
      process.exit(1);
    }
    console.log("Version injected into index.html");
  });
});

// Update sitemap.xml with current date
fs.readFile(sitemapPath, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading sitemap.xml file:", err.message);
    process.exit(1);
  }

  const currentDate = getCurrentDate();
  const result = data.replace(
    /<lastmod>[^<]*<\/lastmod>/g,
    `<lastmod>${currentDate}</lastmod>`
  );

  fs.writeFile(sitemapPath, result, "utf8", (err) => {
    if (err) {
      console.error("Error writing to sitemap.xml file:", err);
      process.exit(1);
    }
    console.log("Current date injected into sitemap.xml");
  });
});
