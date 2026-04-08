import elvebreddData from './elvebredd-values.json' assert { type: 'json' };
import imageOverrides from './pet-image-overrides.json' assert { type: 'json' };

// ============================================
// Core Data & Catalog
// ============================================

export const PETS_CATALOG = elvebreddData.map(pet => {
  const rarity = normalizeRarity(pet.rarity);
  const imageUrl = imageOverrides[pet.name] || pet.image;
  return {
    ...pet,
    image: imageUrl,
    demand: calculateDemandFromScore(pet.score),
    category: pet.categoryNormal || 'Other',
    rarity
  };
});

export const PET_AGES = ['New Born', 'Junior', 'Pre Teen', 'Teen', 'Full Grown'];

// ============================================
// Utility Functions
// ============================================

function normalizeRarity(rarity) {
  const rarityMap = {
    'legendary': 'Legendary',
    'ultra rare': 'Ultra Rare',
    'rare': 'Rare',
    'uncommon': 'Uncommon',
    'common': 'Common',
    'event': 'Event'
  };
  return rarityMap[rarity?.toLowerCase()] || rarity || 'Common';
}

export function getRarityClass(rarity) {
  const normalized = normalizeRarity(rarity);
  const classMap = {
    'legendary': 'badge-legendary',
    'ultra rare': 'badge-ultra-rare',
    'rare': 'badge-rare',
    'uncommon': 'badge-uncommon',
    'common': 'badge-common',
    'event': 'badge-event'
  };
  return classMap[normalized.toLowerCase()] || 'badge-common';
}

export function getPetById(petId) {
  return PETS_CATALOG.find(pet => pet.id === Number(petId));
}

export function getDemandTier(demand) {
  if (demand >= 90) return 'Muy Alta';
  if (demand >= 70) return 'Alta';
  if (demand >= 50) return 'Media';
  if (demand >= 30) return 'Baja';
  return 'Muy Baja';
}

function calculateDemandFromScore(score) {
  if (!score) return 50;
  // Score 1-220, map to demand 0-100
  return Math.min(100, Math.round((score / 220) * 100));
}

// ============================================
// Pet Value Calculation
// ============================================

export function calculatePetValue(petId, isFly = false, isRide = false, isNeon = false, isMega = false) {
  const pet = getPetById(petId);
  if (!pet || !pet.values) return 0;

  // Determine which modifier tier to use
  let tier = 'normal';
  if (isMega) tier = 'mega';
  else if (isNeon) tier = 'neon';

  // Determine potion type
  let potionType = 'noPotion';
  if (isFly && isRide) potionType = 'flyRide';
  else if (isFly) potionType = 'fly';
  else if (isRide) potionType = 'ride';

  const tierValues = pet.values[tier];
  if (!tierValues) return 0;

  return tierValues[potionType] || 0;
}

// ============================================
// Demand & Scoring
// ============================================

export function calculateDemandScore(petId, isFly = false, isRide = false, isNeon = false, isMega = false) {
  const pet = getPetById(petId);
  if (!pet) return 0;

  let demand = pet.demand || 50;

  // Modifiers based on potion/version
  if (isMega) demand *= 1.5;
  else if (isNeon) demand *= 1.3;

  if (isFly || isRide) demand *= 1.1;
  if (isFly && isRide) demand *= 1.15;

  return Math.round(Math.min(100, demand));
}

// ============================================
// Trade Analysis
// ============================================

export function analyzeTradeOffer(yourPets, theirPets) {
  const yourValue = yourPets.reduce(
    (sum, pet) => sum + calculatePetValue(pet.id, pet.isFly, pet.isRide, pet.isNeon, pet.isMega),
    0
  );

  const theirValue = theirPets.reduce(
    (sum, pet) => sum + calculatePetValue(pet.id, pet.isFly, pet.isRide, pet.isNeon, pet.isMega),
    0
  );

  const yourDemand = yourPets.reduce(
    (sum, pet) => sum + calculateDemandScore(pet.id, pet.isFly, pet.isRide, pet.isNeon, pet.isMega),
    0
  );

  const theirDemand = theirPets.reduce(
    (sum, pet) => sum + calculateDemandScore(pet.id, pet.isFly, pet.isRide, pet.isNeon, pet.isMega),
    0
  );

  // Determine outcome
  let outcome = 'fair';
  const valueDiff = yourValue - theirValue;
  const demandDiff = yourDemand - theirDemand;

  if (valueDiff > 5 || demandDiff > 15) {
    outcome = 'win';
  } else if (valueDiff < -5 || demandDiff < -15) {
    outcome = 'lose';
  }

  let recommendation = '';
  const drivers = [];

  if (outcome === 'win') {
    recommendation = 'Tu oferta sale beneficiada. Aceptar si el otro jugador lo permite.';
    if (valueDiff > 0) drivers.push(`(+${valueDiff.toFixed(1)} valor)`);
    if (demandDiff > 0) drivers.push(`(+${demandDiff} demanda)`);
  } else if (outcome === 'lose') {
    recommendation = 'La otra oferta tiene mas ventaja. Considera rechazar o negociar.';
    if (valueDiff < 0) drivers.push(`(${valueDiff.toFixed(1)} valor)`);
    if (demandDiff < 0) drivers.push(`(${demandDiff} demanda)`);
  } else {
    recommendation = 'Los dos lados estan bastante equilibrados. Trade justo.';
  }

  return {
    outcome,
    yourValue: yourValue.toFixed(2),
    theirValue: theirValue.toFixed(2),
    valueDiff: valueDiff.toFixed(2),
    demandDiff,
    recommendation,
    drivers
  };
}

// ============================================
// Explanation & Details
// ============================================

export function explainPetValuation(petId, isFly = false, isRide = false, isNeon = false, isMega = false) {
  const pet = getPetById(petId);
  if (!pet) return null;

  const value = calculatePetValue(petId, isFly, isRide, isNeon, isMega);
  const demand = calculateDemandScore(petId, isFly, isRide, isNeon, isMega);
  const demandTier = getDemandTier(demand);

  const reasons = [];
  reasons.push(`Base rarity: ${pet.rarity}`);

  if (pet.demand) {
    reasons.push(`Demanda base: ${getDemandTier(pet.demand)}`);
  }

  if (isMega) {
    reasons.push(`Mega: +50% demanda, +modificador valor`);
  } else if (isNeon) {
    reasons.push(`Neon: +30% demanda, +modificador valor`);
  }

  if (isFly && isRide) {
    reasons.push(`Fly + Ride: +15% demanda cada uno`);
  } else if (isFly) {
    reasons.push(`Fly: +10% demanda`);
  } else if (isRide) {
    reasons.push(`Ride: +10% demanda`);
  }

  return {
    pet,
    finalValue: value.toFixed(2),
    finalDemand: demand,
    demand,
    demandTier,
    reasons
  };
}

// ============================================
// Import/Export Utilities
// ============================================

export function searchPets(query, rarity = null) {
  let results = PETS_CATALOG;

  if (rarity && rarity !== 'all') {
    results = results.filter(p => p.rarity === rarity);
  }

  if (query) {
    const q = query.toLowerCase();
    results = results.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.category && p.category.toLowerCase().includes(q))
    );
  }

  return results;
}

export function getPetsByRarity(rarity) {
  if (!rarity || rarity === 'all') return PETS_CATALOG;
  return PETS_CATALOG.filter(p => p.rarity === rarity);
}

export function getAllRarities() {
  return ['Legendary', 'Ultra Rare', 'Rare', 'Uncommon', 'Common', 'Event'];
}
