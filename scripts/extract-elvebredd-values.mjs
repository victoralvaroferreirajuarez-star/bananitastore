import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const inputPath = path.join(rootDir, 'tmp_elvebredd_calculator.html');
const outputPath = path.join(rootDir, 'src', 'data', 'elvebredd-values.json');

if (!fs.existsSync(inputPath)) {
  throw new Error(`Missing source file: ${inputPath}`);
}

const html = fs.readFileSync(inputPath, 'utf8');
const matches = [...html.matchAll(/\{[^{}]*\\\"type\\\":\\\"pets\\\"[^{}]*\}/g)];

function decodeEscapedObject(source) {
  return JSON.parse(eval('`' + source.replace(/`/g, '\\`') + '`'));
}

function normalizeBooleanString(value) {
  if (typeof value !== 'string') return null;
  const cleaned = value.replace(/^"+|"+$/g, '').trim().toLowerCase();
  if (cleaned === 'true') return true;
  if (cleaned === 'false') return false;
  return null;
}

function getVariantValue(item, prefix, potionKey) {
  const exactKey = `${prefix} - ${potionKey}`;
  if (typeof item[exactKey] === 'number') return item[exactKey];
  return typeof item[prefix] === 'number' ? item[prefix] : null;
}

const records = matches
  .map((match) => decodeEscapedObject(match[0]))
  .filter((item) => item.type === 'pets' && item.name)
  .map((item) => ({
    id: item.id,
    name: item.name,
    image: item.image || '',
    rarity: item.rarity || '',
    score: typeof item.score === 'number' ? item.score : null,
    categoryNormal: item.categoryd || null,
    categoryNeon: item.categoryn || null,
    categoryMega: item.categorym || null,
    preppyNormal: normalizeBooleanString(item.categorypreppyd ?? item.preppybonusd),
    preppyNeon: normalizeBooleanString(item.categorypreppyn ?? item.preppybonusn),
    preppyMega: normalizeBooleanString(item.categorypreppym ?? item.preppybonusm),
    values: {
      normal: {
        noPotion: getVariantValue(item, 'rvalue', 'nopotion'),
        ride: getVariantValue(item, 'rvalue', 'ride'),
        fly: getVariantValue(item, 'rvalue', 'fly'),
        flyRide: getVariantValue(item, 'rvalue', 'fly&ride')
      },
      neon: {
        noPotion: getVariantValue(item, 'nvalue', 'nopotion'),
        ride: getVariantValue(item, 'nvalue', 'ride'),
        fly: getVariantValue(item, 'nvalue', 'fly'),
        flyRide: getVariantValue(item, 'nvalue', 'fly&ride')
      },
      mega: {
        noPotion: getVariantValue(item, 'mvalue', 'nopotion'),
        ride: getVariantValue(item, 'mvalue', 'ride'),
        fly: getVariantValue(item, 'mvalue', 'fly'),
        flyRide: getVariantValue(item, 'mvalue', 'fly&ride')
      }
    }
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

fs.writeFileSync(outputPath, JSON.stringify(records, null, 2));
console.log(`Extracted ${records.length} pet values to ${outputPath}`);
