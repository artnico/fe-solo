import {
  WEAPONS,
  ARMORS,
  ACCESSORIES,
  FAMILIARS,
  RARITIES,
  WEAPON_TRAITS
} from '../data/masterData.js';

function rollRarity(rarityBonus = 0) {
  const r = Math.random();
  const mythicChance = rarityBonus >= 0.55 ? (rarityBonus - 0.45) * 0.02 : 0;
  const legendaryChance = rarityBonus >= 0.30 ? 0.01 + (rarityBonus - 0.25) * 0.05 : 0;
  const epicChance = 0.005 + rarityBonus * 0.06;
  const rareChance = 0.05 + rarityBonus * 0.12;
  const uncommonChance = 0.22 + rarityBonus * 0.18;

  if (r < mythicChance) return 'mythic';
  if (r < mythicChance + legendaryChance) return 'legendary';
  if (r < mythicChance + legendaryChance + epicChance) return 'epic';
  if (r < mythicChance + legendaryChance + epicChance + rareChance) return 'rare';
  if (r < mythicChance + legendaryChance + epicChance + rareChance + uncommonChance) {
    return 'uncommon';
  }
  return 'common';
}

function pickRandomTraits(count, pool) {
  const copy = [...pool];
  const picked = [];
  for (let i = 0; i < count && copy.length > 0; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    picked.push(copy.splice(idx, 1)[0]);
  }
  return picked;
}

/**
 * 武器インスタンス生成
 */
export function generateWeaponInstance(templateId, options = {}) {
  const tpl = WEAPONS[templateId];
  if (!tpl) throw new Error(`Unknown weapon templateId: ${templateId}`);

  const rarityId = options.rarity || rollRarity(options.rarityBonus || 0);
  const rarity = RARITIES[rarityId] || RARITIES.common;
  const pool = Object.keys(WEAPON_TRAITS).filter(id => {
    if (['vital', 'mana', 'sturdy', 'ward', 'titan', 'mirror'].includes(id)) return false;
    if (tpl.type === 'tome' || tpl.type === 'staff') return id !== 'sharp' && id !== 'executioner';
    return id !== 'arcane' && id !== 'blessed' && id !== 'astral';
  });
  const traitIds = options.traits || pickRandomTraits(rarity.traitCount, pool);

  const atk = tpl.atk > 0 ? Math.max(1, Math.round(tpl.atk * rarity.statMult)) : 0;
  const mag = tpl.mag > 0 ? Math.max(1, Math.round(tpl.mag * rarity.statMult)) : 0;
  const hit = tpl.hit + (rarityId === 'rare' ? 3 : rarityId === 'epic' ? 6 : 0);
  const crit = tpl.crit + (rarityId === 'rare' ? 2 : rarityId === 'epic' ? 5 : 0);

  const prefix = traitIds.length > 0 ? WEAPON_TRAITS[traitIds[0]]?.prefix || '' : '';

  return {
    uid: `wpn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    slot: 'weapon',
    templateId: tpl.id,
    name: prefix ? `${prefix}${tpl.name}` : tpl.name,
    type: tpl.type,
    rarity: rarityId,
    atk,
    mag,
    hit,
    crit,
    traits: traitIds
  };
}

/**
 * 防具インスタンス生成
 */
export function generateArmorInstance(templateId, options = {}) {
  const tpl = ARMORS[templateId];
  if (!tpl) throw new Error(`Unknown armor templateId: ${templateId}`);

  const rarityId = options.rarity || rollRarity(options.rarityBonus || 0);
  const rarity = RARITIES[rarityId] || RARITIES.common;
  const pool = ['vital', 'mana', 'sturdy', 'ward', 'swift', 'greed', 'titan', 'mirror'];
  const traitIds = options.traits || pickRandomTraits(rarity.traitCount, pool);

  const hp = tpl.hp > 0 ? Math.round(tpl.hp * rarity.statMult) : 0;
  const mp = tpl.mp > 0 ? Math.round(tpl.mp * rarity.statMult) : 0;
  const def = tpl.def > 0 ? Math.round(tpl.def * rarity.statMult) : 0;
  const res = tpl.res > 0 ? Math.round(tpl.res * rarity.statMult) : 0;
  const eva = tpl.eva || 0;

  const prefix = traitIds.length > 0 ? WEAPON_TRAITS[traitIds[0]]?.prefix || '' : '';

  return {
    uid: `arm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    slot: 'armor',
    templateId: tpl.id,
    name: prefix ? `${prefix}${tpl.name}` : tpl.name,
    type: tpl.type,
    rarity: rarityId,
    hp,
    mp,
    def,
    res,
    eva,
    traits: traitIds
  };
}

/**
 * アクセサリーインスタンス生成
 */
export function generateAccessoryInstance(templateId, options = {}) {
  const tpl = ACCESSORIES[templateId];
  if (!tpl) throw new Error(`Unknown accessory templateId: ${templateId}`);

  const rarityId = options.rarity || rollRarity(options.rarityBonus || 0);
  const rarity = RARITIES[rarityId] || RARITIES.common;
  const pool = ['vital', 'mana', 'sturdy', 'ward', 'swift', 'greed', 'deadly', 'blessed', 'elem_fire', 'elem_water', 'elem_earth', 'elem_wind'];
  const traitIds = options.traits || pickRandomTraits(rarity.traitCount, pool);

  const hp = tpl.hp ? Math.round(tpl.hp * rarity.statMult) : 0;
  const mp = tpl.mp ? Math.round(tpl.mp * rarity.statMult) : 0;
  const atk = tpl.atk ? Math.round(tpl.atk * rarity.statMult) : 0;
  const mag = tpl.mag ? Math.round(tpl.mag * rarity.statMult) : 0;
  const def = tpl.def ? Math.round(tpl.def * rarity.statMult) : 0;
  const res = tpl.res ? Math.round(tpl.res * rarity.statMult) : 0;
  const hit = tpl.hit || 0;
  const crit = tpl.crit || 0;
  const eva = tpl.eva || 0;
  const dropBonus = tpl.dropBonus || 0;
  const initiativeBonus = tpl.initiativeBonus || 0;

  const prefix = traitIds.length > 0 ? WEAPON_TRAITS[traitIds[0]]?.prefix || '' : '';

  return {
    uid: `acc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    slot: 'accessory',
    templateId: tpl.id,
    name: prefix ? `${prefix}${tpl.name}` : tpl.name,
    type: tpl.type,
    rarity: rarityId,
    hp,
    mp,
    atk,
    mag,
    def,
    res,
    hit,
    crit,
    eva,
    dropBonus,
    initiativeBonus,
    traits: traitIds
  };
}

/**
 * 装備品の特性効果を合算して返す
 */
export function getWeaponTraitEffects(equipList) {
  const list = Array.isArray(equipList) ? equipList : [equipList];
  const effects = {
    physPen: 0,
    magPen: 0,
    lifestealPct: 0,
    snipeBackline: false,
    counterBonus: 0,
    dropBonus: 0,
    critBonus: 0,
    critDmgBonus: 0,
    evaBonus: 0,
    initiativeBonus: 0,
    healBonus: 0,
    hpBonus: 0,
    mpBonus: 0,
    defBonus: 0,
    resBonus: 0,
    elements: []
  };

  for (const eq of list) {
    if (!eq) continue;
    if (eq.slot === 'familiar' && eq.element && eq.element !== 'none') {
      effects.elements.push(eq.element);
    }
    if (!Array.isArray(eq.traits)) continue;
    for (const tid of eq.traits) {
      const t = WEAPON_TRAITS[tid];
      if (!t) continue;
      if (t.physPen) effects.physPen += t.physPen;
      if (t.magPen) effects.magPen += t.magPen;
      if (t.lifestealPct) effects.lifestealPct += t.lifestealPct;
      if (t.snipeBackline) effects.snipeBackline = true;
      if (t.counterBonus) effects.counterBonus += t.counterBonus;
      if (t.dropBonus) effects.dropBonus += t.dropBonus;
      if (t.critBonus) effects.critBonus += t.critBonus;
      if (t.critDmgBonus) effects.critDmgBonus += t.critDmgBonus;
      if (t.evaBonus) effects.evaBonus += t.evaBonus;
      if (t.initiativeBonus) effects.initiativeBonus += t.initiativeBonus;
      if (t.healBonus) effects.healBonus += t.healBonus;
      if (t.hpBonus) effects.hpBonus += t.hpBonus;
      if (t.mpBonus) effects.mpBonus += t.mpBonus;
      if (t.defBonus) effects.defBonus += t.defBonus;
      if (t.resBonus) effects.resBonus += t.resBonus;
      if (t.element) effects.elements.push(t.element);
    }
  }
  return effects;
}

/**
 * 使い魔インスタンス生成（4枠目装備・ユニーク効果）
 */
export function generateFamiliarInstance(templateId) {
  const tpl = FAMILIARS[templateId];
  if (!tpl) throw new Error(`Unknown familiar templateId: ${templateId}`);

  return {
    uid: `fam_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    slot: 'familiar',
    templateId: tpl.id,
    name: tpl.name,
    type: tpl.type,
    rarity: tpl.rarity || 'rare',
    element: tpl.element || 'none',
    growthBonus: { ...(tpl.growthBonus || {}) },
    skillChanceBonus: tpl.skillChanceBonus || 0,
    combatBonus: { ...(tpl.combatBonus || {}) },
    description: tpl.description || '',
    traits: []
  };
}
