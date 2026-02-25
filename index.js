const express = require("express");
const path = require("path");
const app = express();
const dotenv = require("dotenv");
const fs = require("fs");
const yaml = require("js-yaml");
const { spawnSync } = require("child_process");
const PORT = 3000;

dotenv.config();

// Check if the password variable has been set
if (!process.env.PASSWORD) {
  console.error("No Password detected, check your environment file. Exiting");
  process.exit(1);
}

app.get("/desktop-config", (req, res) => {
  // Need to do some trickery and add the password from the .env
  const filePath = path.join(__dirname, "public", "desktop-config");
  const fileContents = fs.readFileSync(filePath, "utf8");
  let doc = yaml.load(fileContents, "utf8");
  // Doing password hashing with openssl
  const result = spawnSync("openssl", ["passwd", "-6", process.env.PASSWORD]);
  const hashedPassword = result.stdout.toString().trim();

  doc.autoinstall = doc.autoinstall || {};
  doc.autoinstall.identity = doc.autoinstall.identity || {};
  doc.autoinstall.identity.password = hashedPassword;

  const updated = yaml.dump(doc, {
    lineWidth: -1,
    quotingType: '"',
    noCompatMode: true,
  });
  res.type("text/yaml");
  res.send(updated);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `Check the desktop-config: http://localhost:${PORT}/desktop-config`,
  );
});
