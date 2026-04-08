import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const inputPath = path.join(ROOT, 'adoptme_all_pets.json');
const outputPath = path.join(ROOT, 'src', 'data', 'pet-image-overrides.json');

const pets = JSON.parse(await fs.readFile(inputPath, 'utf8'));

function chunk(array, size) {
  const parts = [];
  for (let index = 0; index < array.length; index += size) {
    parts.push(array.slice(index, index + size));
  }
  return parts;
}

async function fetchBatch(batch) {
  const titles = batch.map((pet) => pet.name).join('|');
  const url = `https://adoptme.fandom.com/api.php?action=query&format=json&prop=pageimages&piprop=thumbnail&pithumbsize=220&redirects=1&titles=${encodeURIComponent(titles)}`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 BananaStore Bot'
    }
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  const data = await response.json();
  const normalized = {};

  for (const page of Object.values(data?.query?.pages || {})) {
    const title = page?.title;
    const source = page?.thumbnail?.source;
    if (title && source) {
      normalized[title] = source;
    }
  }

  return normalized;
}

const output = {};
const batches = chunk(pets, 40);

for (let index = 0; index < batches.length; index += 1) {
  const batch = batches[index];
  try {
    const results = await fetchBatch(batch);
    Object.assign(output, results);
    console.log(`Fetched batch ${index + 1}/${batches.length}`);
  } catch (error) {
    console.error(`Batch ${index + 1} failed:`, error.message);
  }
}

await fs.writeFile(outputPath, JSON.stringify(output, null, 2));
console.log(`Saved ${Object.keys(output).length} image overrides to ${outputPath}`);
