import { hash } from "bcryptjs";

const password = process.argv[2];

if (!password) {
  console.error("Verwendung: npm run auth:hash -- <passwort>");
  process.exit(1);
}

console.log(Buffer.from(await hash(password, 12)).toString("base64"));
