import bcrypt from './node_modules/bcryptjs/dist/bcrypt.js';
const hash = '$2b$12$wAsdJO5ynbBJnAkeVzdDxO8b1tUzY63l7nCLNt1b8ZxonaYi8wfR2';
const candidates = ['IhrEigenesPasswort', 'IhrGewaehltesPa$$wort', 'MeinEigenesPasswort123!'];
for (const pw of candidates) {
  console.log(pw, ':', await bcrypt.compare(pw, hash));
}
