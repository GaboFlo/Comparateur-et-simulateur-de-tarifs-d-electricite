const fs = require("fs");
const path = require("path");

const indexPath = path.resolve(__dirname, "..", "build", "index.html");
const version = process.env.REACT_APP_VERSION;

fs.readFile(indexPath, "utf8", (err, data) => {
  if (err) {
    return console.log(err);
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
