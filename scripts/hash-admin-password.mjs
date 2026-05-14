import { pbkdf2Sync, randomBytes } from "node:crypto";

const password = process.argv[2] ?? "";

if (password.length < 8) {
  console.error("Usage: node scripts/hash-admin-password.mjs <password-at-least-8-chars>");
  process.exit(1);
}

const algorithm = "pbkdf2_sha256";
const iterations = 210_000;
const salt = randomBytes(16);
const hash = pbkdf2Sync(password, salt, iterations, 32, "sha256");

console.log([algorithm, iterations, salt.toString("hex"), hash.toString("hex")].join("$"));
