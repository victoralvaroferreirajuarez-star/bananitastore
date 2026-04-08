import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const allPets = JSON.parse(await fs.readFile(path.join(ROOT, 'adoptme_all_pets.json'), 'utf8'));
const outputPath = path.join(ROOT, 'src', 'data', 'pet-image-overrides.json');
const current = JSON.parse(await fs.readFile(outputPath, 'utf8'));

const aliases = {
  'Garden Snake': 'Garden Snake',
  Mole: 'Mole',
  Weevil: 'Weevil',
  'Blue Jay': 'Blue Jay',
  'Business Monkey': 'Business Monkey',
  'Toy Monkey': 'Toy Monkey',
  'Chef Gorilla': 'Chef Gorilla',
  'Karate Gorilla': 'Karate Gorilla',
  'Tortuga de la Isla': 'Island Turtle',
  'Praying Mantis': 'Praying Mantis',
  Skunk: 'Skunk',
  'Ringmaster Gibbon': 'Ringmaster Gibbon',
  'Monkey King': 'Monkey King',
  'Ninja Monkey': 'Ninja Monkey',
  'Frost Fury': 'Frost Fury',
  Phoenix: 'Phoenix',
  'Astronaut Gorilla': 'Astronaut Gorilla',
  'Emperor Gorilla': 'Emperor Gorilla',
  'Rosy Maple Moth': 'Rosy Maple Moth',
  'Mushroom Friend': 'Mushroom Friend',
  Frostclaw: 'Frostclaw',
  'Dragonfruit Fox': 'Dragonfruit Fox'
};

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 BananaStore Bot' }
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

async function queryThumbnailByTitle(title) {
  const url = `https://adoptme.fandom.com/api.php?action=query&format=json&prop=pageimages&piprop=thumbnail&pithumbsize=220&redirects=1&titles=${encodeURIComponent(title)}`;
  const data = await fetchJson(url);
  for (const page of Object.values(data?.query?.pages || {})) {
    if (page?.thumbnail?.source) {
      return page.thumbnail.source;
    }
  }
  return null;
}

async function searchTitles(term) {
  const url = `https://adoptme.fandom.com/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(term)}&srlimit=5`;
  const data = await fetchJson(url);
  return (data?.query?.search || []).map((entry) => entry.title);
}

const missing = allPets.map((pet) => pet.name).filter((name) => !current[name]);

for (const name of missing) {
  const titleCandidates = [];
  if (aliases[name]) titleCandidates.push(aliases[name]);
  titleCandidates.push(name);

  let image = null;

  for (const candidate of titleCandidates) {
    image = await queryThumbnailByTitle(candidate);
    if (image) break;
  }

  if (!image) {
    const searchResults = await searchTitles(aliases[name] || name);
    for (const title of searchResults) {
      image = await queryThumbnailByTitle(title);
      if (image) break;
    }
  }

  if (image) {
    current[name] = image;
    console.log(`Resolved: ${name}`);
  } else {
    console.log(`Still missing: ${name}`);
  }
}

await fs.writeFile(outputPath, JSON.stringify(current, null, 2));
console.log(`Updated overrides: ${Object.keys(current).length}`);
