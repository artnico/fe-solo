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
  const mythicChance = rarityBonus >= 0.80 ? (rarityBonus - 0.70) * 0.008 : 0;
  const legendaryChance = rarityBonus >= 0.35 ? 0.006 + (rarityBonus - 0.30) * 0.032 : 0;
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
  if (!pool || pool.length === 0) return [];
  const picked = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    picked.push(pool[idx]);
  }
  return picked;
}

function formatEquipName(baseName, traitIds) {
  if (!Array.isArray(traitIds) || traitIds.length === 0) return baseName;
  const counts = {};
  for (const tid of traitIds) {
    counts[tid] = (counts[tid] || 0) + 1;
  }
  let bestTid = traitIds[0];
  let bestCount = counts[bestTid] || 1;
  for (const tid of traitIds) {
    if (counts[tid] > bestCount) {
      bestTid = tid;
      bestCount = counts[tid];
    }
  }
  const basePrefix = WEAPON_TRAITS[bestTid]?.prefix || '';
  const nameWithPrefix = basePrefix ? `${basePrefix}${baseName}` : baseName;
  return bestCount >= 2 ? `${nameWithPrefix} ★${bestCount}` : nameWithPrefix;
}

const REROLL_BASE_COSTS = {
  uncommon: 500,
  rare: 1200,
  epic: 3000,
  legendary: 8000,
  mythic: 20000
};

/**
 * 装備種別に応じた特性プールを返す
 */
export function getTraitPoolForEquipment(slot, templateId) {
  if (slot === 'armor') {
    return [
      'vital', 'mana', 'sturdy', 'ward', 'swift', 'greed', 'titan', 'mirror',
      'ironwall', 'aegis', 'inspired', 'phantom', 'guardian'
    ];
  }
  if (slot === 'accessory') {
    return [
      'vital', 'mana', 'sturdy', 'ward', 'swift', 'greed', 'deadly', 'blessed',
      'fierce', 'wise', 'accurate', 'relentless', 'ironwall', 'aegis', 'inspired', 'phantom', 'guardian',
      'elem_fire', 'elem_water', 'elem_earth', 'elem_wind', 'elem_thunder', 'elem_ice'
    ];
  }
  const tpl = WEAPONS[templateId];
  const armorOnly = ['vital', 'mana', 'sturdy', 'ward', 'titan', 'mirror', 'ironwall', 'aegis', 'phantom', 'guardian'];
  const physOnly = ['sharp', 'executioner', 'fierce', 'berserk'];
  const magOnly = ['arcane', 'blessed', 'astral', 'wise', 'archmage'];
  return Object.keys(WEAPON_TRAITS).filter(id => {
    if (armorOnly.includes(id)) return false;
    if (tpl && (tpl.type === 'tome' || tpl.type === 'staff')) return !physOnly.includes(id);
    return !magOnly.includes(id);
  });
}

/**
 * 特性リロールに必要なゴールドを計算する
 */
export function getTraitRerollCost(eq) {
  if (!eq) return 0;
  const base = REROLL_BASE_COSTS[eq.rarity] || 1000;
  const count = eq.rerollCount || 0;
  return Math.round(base * (1 + count * 0.2));
}

/**
 * 装備の指定インデックスの特性を再抽選し、装備名を更新する
 */
export function rerollEquipmentTraitAt(eq, traitIndex) {
  if (!eq || !Array.isArray(eq.traits) || traitIndex < 0 || traitIndex >= eq.traits.length) {
    return null;
  }
  const slot = eq.slot || 'weapon';
  const pool = getTraitPoolForEquipment(slot, eq.templateId);
  if (!pool || pool.length === 0) return null;

  const oldTraitId = eq.traits[traitIndex];
  const candidates = pool.filter(id => id !== oldTraitId);
  const pickPool = candidates.length > 0 ? candidates : pool;
  const newTraitId = pickPool[Math.floor(Math.random() * pickPool.length)];

  eq.traits[traitIndex] = newTraitId;
  eq.rerollCount = (eq.rerollCount || 0) + 1;

  const tpl =
    slot === 'armor'
      ? ARMORS[eq.templateId]
      : slot === 'accessory'
      ? ACCESSORIES[eq.templateId]
      : WEAPONS[eq.templateId];
  if (tpl) {
    eq.name = formatEquipName(tpl.name, eq.traits);
  }
  return { oldTraitId, newTraitId };
}

/**
 * 武器インスタンス生成
 */
export function generateWeaponInstance(templateId, options = {}) {
  const tpl = WEAPONS[templateId];
  if (!tpl) throw new Error(`Unknown weapon templateId: ${templateId}`);

  const rarityId = options.rarity || rollRarity(options.rarityBonus || 0);
  const rarity = RARITIES[rarityId] || RARITIES.common;
  const armorOnly = ['vital', 'mana', 'sturdy', 'ward', 'titan', 'mirror', 'ironwall', 'aegis', 'phantom', 'guardian'];
  const physOnly = ['sharp', 'executioner', 'fierce', 'berserk'];
  const magOnly = ['arcane', 'blessed', 'astral', 'wise', 'archmage'];
  const pool = Object.keys(WEAPON_TRAITS).filter(id => {
    if (armorOnly.includes(id)) return false;
    if (tpl.type === 'tome' || tpl.type === 'staff') return !physOnly.includes(id);
    return !magOnly.includes(id);
  });
  const traitIds = options.traits || pickRandomTraits(rarity.traitCount, pool);

  const atk = tpl.atk > 0 ? Math.max(1, Math.round(tpl.atk * rarity.statMult)) : 0;
  const mag = tpl.mag > 0 ? Math.max(1, Math.round(tpl.mag * rarity.statMult)) : 0;
  const hit = tpl.hit + (rarityId === 'rare' ? 3 : rarityId === 'epic' ? 6 : 0);
  const crit = tpl.crit + (rarityId === 'rare' ? 2 : rarityId === 'epic' ? 5 : 0);

  return {
    uid: `wpn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    slot: 'weapon',
    templateId: tpl.id,
    name: formatEquipName(tpl.name, traitIds),
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
  const pool = [
    'vital', 'mana', 'sturdy', 'ward', 'swift', 'greed', 'titan', 'mirror',
    'ironwall', 'aegis', 'inspired', 'phantom', 'guardian'
  ];
  const traitIds = options.traits || pickRandomTraits(rarity.traitCount, pool);

  const hp = tpl.hp > 0 ? Math.round(tpl.hp * rarity.statMult) : 0;
  const mp = tpl.mp > 0 ? Math.round(tpl.mp * rarity.statMult) : 0;
  const def = tpl.def > 0 ? Math.round(tpl.def * rarity.statMult) : 0;
  const res = tpl.res > 0 ? Math.round(tpl.res * rarity.statMult) : 0;
  const eva = tpl.eva || 0;

  return {
    uid: `arm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    slot: 'armor',
    templateId: tpl.id,
    name: formatEquipName(tpl.name, traitIds),
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
  const pool = [
    'vital', 'mana', 'sturdy', 'ward', 'swift', 'greed', 'deadly', 'blessed',
    'fierce', 'wise', 'accurate', 'relentless', 'ironwall', 'aegis', 'inspired', 'phantom', 'guardian',
    'elem_fire', 'elem_water', 'elem_earth', 'elem_wind', 'elem_thunder', 'elem_ice'
  ];
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

  return {
    uid: `acc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    slot: 'accessory',
    templateId: tpl.id,
    name: formatEquipName(tpl.name, traitIds),
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
    atkBonus: 0,
    magBonus: 0,
    hitBonus: 0,
    followUpBonus: 0,
    physDmgRedBonus: 0,
    magDmgRedBonus: 0,
    skillChanceBonus: 0,
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
    const traitCounts = {};
    for (const tid of eq.traits) {
      traitCounts[tid] = (traitCounts[tid] || 0) + 1;
    }
    for (const [tid, count] of Object.entries(traitCounts)) {
      const t = WEAPON_TRAITS[tid];
      if (!t) continue;
      // 同一装備内で同じ特性が重なった場合、2個目以降は1.5倍ブースト
      const mult = 1 + (count - 1) * 1.5;
      if (t.atkBonus) effects.atkBonus += Math.round(t.atkBonus * mult);
      if (t.magBonus) effects.magBonus += Math.round(t.magBonus * mult);
      if (t.hitBonus) effects.hitBonus += Math.round(t.hitBonus * mult);
      if (t.followUpBonus) effects.followUpBonus += Math.round(t.followUpBonus * mult);
      if (t.physDmgRedBonus) effects.physDmgRedBonus += Math.round(t.physDmgRedBonus * mult);
      if (t.magDmgRedBonus) effects.magDmgRedBonus += Math.round(t.magDmgRedBonus * mult);
      if (t.skillChanceBonus) effects.skillChanceBonus += Math.round(t.skillChanceBonus * mult);
      if (t.physPen) effects.physPen += Math.round(t.physPen * mult);
      if (t.magPen) effects.magPen += Math.round(t.magPen * mult);
      if (t.lifestealPct) effects.lifestealPct += Math.round(t.lifestealPct * mult);
      if (t.snipeBackline) {
        effects.snipeBackline = true;
        if (count >= 2) effects.critBonus += (count - 1) * 8;
      }
      if (t.counterBonus) effects.counterBonus += Math.round(t.counterBonus * mult);
      if (t.dropBonus) effects.dropBonus += Math.round(t.dropBonus * mult);
      if (t.critBonus) effects.critBonus += Math.round(t.critBonus * mult);
      if (t.critDmgBonus) effects.critDmgBonus += Math.round(t.critDmgBonus * mult);
      if (t.evaBonus) effects.evaBonus += Math.round(t.evaBonus * mult);
      if (t.initiativeBonus) effects.initiativeBonus += Math.round(t.initiativeBonus * mult);
      if (t.healBonus) effects.healBonus += Math.round(t.healBonus * mult);
      if (t.hpBonus) effects.hpBonus += Math.round(t.hpBonus * mult);
      if (t.mpBonus) effects.mpBonus += Math.round(t.mpBonus * mult);
      if (t.defBonus) effects.defBonus += Math.round(t.defBonus * mult);
      if (t.resBonus) effects.resBonus += Math.round(t.resBonus * mult);
      if (t.element) {
        effects.elements.push(t.element);
        if (count >= 2) {
          effects.atkBonus += (count - 1) * 6;
          effects.magBonus += (count - 1) * 6;
        }
      }
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
