const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'db.json');

function readDB() {
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

function slugify(str) {
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9آ-ی\u0600-\u06FF\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 60) || 'item-' + Date.now();
}

module.exports = { readDB, writeDB, slugify };
