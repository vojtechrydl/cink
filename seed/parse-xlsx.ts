import * as XLSX from "xlsx";
import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const COLOR_BASE_MAP: [string, RegExp][] = [
  ["žlutošedá", /žlutošedá/i],
  ["modrá", /modr/i],
  ["červená", /červen/i],
  ["zelená", /zelen/i],
  ["bílá", /bíl/i],
  ["černá", /čern/i],
  ["růžová", /růžov/i],
  ["oranžová", /oranžov/i],
  ["barevná", /barevn/i],
];

function getColorBase(raw: string): string {
  for (const [base, pattern] of COLOR_BASE_MAP) {
    if (pattern.test(raw)) return base;
  }
  return "speciální";
}

function parseYear(raw: string): number {
  const match = raw.match(/^(\d{4})/);
  return match ? parseInt(match[1], 10) : 0;
}

function normalizeType(raw: string): string {
  if (raw === "VarioLF plus") return "VARIO LF plus";
  return raw;
}

const workbook = XLSX.readFile(resolve(__dirname, "../data.xlsx"));
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
  range: 1,
});

interface TramSeed {
  number: number;
  type: string;
  color: string;
  colorBase: string;
  yearBuilt: number;
  yearNote: string | null;
  photoUrl: string | null;
  note: string | null;
}

const trams: TramSeed[] = [];

for (const row of rows) {
  const yearRaw = String(row["Rok výroby"] ?? "");
  if (/odstaven|vyřazen/i.test(yearRaw)) continue;

  const number = parseInt(String(row["Číslo"]), 10);
  const type = normalizeType(String(row["Typ"] ?? ""));
  const color = String(row["Barva / nátěr"] ?? "");
  const yearBuilt = parseYear(yearRaw);
  const yearNote = yearRaw !== String(yearBuilt) ? yearRaw : null;
  const photoUrl = row["Foto"] ? String(row["Foto"]) : null;
  const note = row["Poznámky"] ? String(row["Poznámky"]) : null;

  trams.push({
    number,
    type,
    color,
    colorBase: getColorBase(color),
    yearBuilt,
    yearNote,
    photoUrl,
    note,
  });
}

const outPath = resolve(__dirname, "trams.json");
writeFileSync(outPath, JSON.stringify(trams, null, 2));
console.log(`Wrote ${trams.length} trams to ${outPath}`);

const types = [...new Set(trams.map((t) => t.type))].sort();
const colorBases = [...new Set(trams.map((t) => t.colorBase))].sort();
const years = [...new Set(trams.map((t) => t.yearBuilt))].sort();
console.log(`Types (${types.length}): ${types.join(", ")}`);
console.log(`Color bases (${colorBases.length}): ${colorBases.join(", ")}`);
console.log(`Years (${years.length}): ${years.join(", ")}`);
