const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const dir = Buffer.from("RDpcR1lNIFdlYnNpdGU=", "base64").toString();
const logPath = path.join(__dirname, "gymrun.log");
const cmd = process.argv.slice(2).join(" ");
let buf = `RUN: ${cmd}\nIN: ${dir}\n---\n`;
try {
  buf += execSync(cmd, { cwd: dir, encoding: "utf8", timeout: 600000, maxBuffer: 8 * 1024 * 1024 });
  buf += "\n---EXIT: 0";
} catch (e) {
  buf += String(e.stdout || "");
  buf += String(e.stderr || "");
  buf += `\n---EXIT: ${e.status}`;
}
fs.writeFileSync(logPath, buf, "utf8");
console.log("LOG_WRITTEN", logPath);

