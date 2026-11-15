import {
  STAT_KEYS,
  RACES,
  CLASSES,
  PERSONALITIES,
  WEAPONS,
  WEAPON_TYPES,
  ELEMENTS,
  ELEMENT_COMBINATIONS
} from '../data/masterData.js';
import { getWeaponTraitEffects } from './loot.js';

/**
 * 次のレベルに必要な経験値
 */
export function getExpForNextLevel(level) {
  return level * 70 + level * level * 10;
}

/**
 * キャラクター新規生成
 */
export function createCharacter({
  id,
  name,
  raceId,
  classId,
  personalityId,
  equippedWeaponUid = null,
  equippedArmorUid = null,
  equippedAccessoryUid = null,
  equippedFamiliarUid = null
}) {
  const race = RACES[raceId];
  const cls = CLASSES[classId];
  if (!race || !cls) {
    throw new Error(`Invalid raceId (${raceId}) or classId (${classId})`);
  }

  const baseStats = {};
  for (const key of STAT_KEYS) {
    baseStats[key] = (race.baseStats[key] || 0) + (cls.statBonus?.[key] || 0);
  }

  return {
    id: id || `char_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name,
    raceId,
    classId,
    classHistory: [classId],
    personalityId,
    level: 1,
    exp: 0,
    baseStats,
    equippedWeaponUid,
    equippedArmorUid,
    equippedAccessoryUid,
    equippedFamiliarUid
  };
}

/**
 * キャラクターの成長率(%)を計算
 * 最低5%保証
 */
export function getGrowthRates(character, familiar = null, extraGrowthPct = 0) {
  const race = RACES[character.raceId];
  const cls = CLASSES[character.classId];
  const personality = PERSONALITIES[character.personalityId];

  const rates = {};
  for (const key of STAT_KEYS) {
    const raw =
      (race?.growthRates[key] || 0) +
      (cls?.growthMod[key] || 0) +
      (personality?.growthMod[key] || 0) +
      (familiar?.growthBonus?.[key] || 0) +
      (extraGrowthPct || 0);
    rates[key] = Math.max(5, raw);
  }
  return rates;
}

/**
 * FE式確率成長によるレベルアップ処理
 */
export function levelUpCharacter(character, familiar = null, extraGrowthPct = 0) {
  const cls = CLASSES[character.classId];
  const maxLv = cls?.maxLevel || 10;
  if (character.level >= maxLv) {
    return null;
  }

  const rates = getGrowthRates(character, familiar, extraGrowthPct);
  const gains = {};
  character.level += 1;

  for (const key of STAT_KEYS) {
    const rate = rates[key];
    let gain = 0;
    if (rate >= 100) {
      gain += 1;
      if (Math.random() * 100 < rate - 100) {
        gain += 1;
      }
    } else {
      if (Math.random() * 100 < rate) {
        gain += 1;
      }
    }
    if (gain > 0) {
      character.baseStats[key] += gain;
      gains[key] = gain;
    }
  }

  return gains;
}

/**
 * クラスチェンジ可能か判定
 */
export function canClassChange(character, targetClassId, itemsOrCrestCount = 0, unlockedHiddenClasses = []) {
  const currentCls = CLASSES[character.classId];
  const targetCls = CLASSES[targetClassId];
  if (!currentCls || !targetCls) return { ok: false, reason: '職業データ不正' };
  if (!(currentCls.nextClasses || []).includes(targetClassId)) {
    return { ok: false, reason: '派生先ではありません' };
  }
  if (targetCls.hiddenUnlock && !(unlockedHiddenClasses || []).includes(targetClassId)) {
    return { ok: false, reason: 'クエストで解放が必要' };
  }
  if (character.level < currentCls.maxLevel) {
    return { ok: false, reason: `Lv.${currentCls.maxLevel} 到達が必要` };
  }
  const crestCount =
    typeof itemsOrCrestCount === 'number'
      ? itemsOrCrestCount
      : itemsOrCrestCount?.class_crest || 0;
  const heroCrestCount =
    typeof itemsOrCrestCount === 'object' ? itemsOrCrestCount?.hero_crest || 0 : 0;

  if (targetCls.requiresCrest && crestCount < 1) {
    return { ok: false, reason: '「転職の証」が1個必要' };
  }
  if (targetCls.requiresHeroCrest && heroCrestCount < 1) {
    return { ok: false, reason: '「英雄の証」が1個必要' };
  }
  return { ok: true, reason: '' };
}

/**
 * クラスチェンジ実行
 */
export function applyClassChange(character, targetClassId) {
  const targetCls = CLASSES[targetClassId];
  if (!targetCls) return false;
  if (!Array.isArray(character.classHistory)) {
    character.classHistory = [character.classId];
  }
  if (!character.classHistory.includes(character.classId)) {
    character.classHistory.push(character.classId);
  }
  character.classId = targetClassId;
  if (!character.classHistory.includes(targetClassId)) {
    character.classHistory.push(targetClassId);
  }
  if (targetCls.promotionBonus) {
    for (const [k, v] of Object.entries(targetCls.promotionBonus)) {
      character.baseStats[k] = (character.baseStats[k] || 0) + v;
    }
  }
  return true;
}

/**
 * 初期職業（Tier 1）への転職（転生/再修行）が可能か判定
 */
export function canReclassToTier1(character, targetClassId) {
  const targetCls = CLASSES[targetClassId];
  if (!targetCls || targetCls.tier !== 1) {
    return { ok: false, reason: '初期職業（Tier 1）のみ選択可能です' };
  }
  if (character.level < 2 && character.classId === targetClassId) {
    return { ok: false, reason: 'Lv.2以上または他職からの転職が必要です' };
  }
  return { ok: true, reason: '' };
}

/**
 * 初期職業（Tier 1）への転職を実行（基礎ステータス半減・レベル1へリセット・職歴記録）
 */
export function applyReclassToTier1(character, targetClassId) {
  const check = canReclassToTier1(character, targetClassId);
  if (!check.ok) return false;

  if (!Array.isArray(character.classHistory)) {
    character.classHistory = [character.classId];
  }
  if (!character.classHistory.includes(character.classId)) {
    character.classHistory.push(character.classId);
  }

  for (const key of STAT_KEYS) {
    character.baseStats[key] = Math.max(1, Math.floor((character.baseStats[key] || 1) / 2));
  }

  character.classId = targetClassId;
  if (!character.classHistory.includes(targetClassId)) {
    character.classHistory.push(targetClassId);
  }
  character.level = 1;
  character.exp = 0;
  return true;
}

/**
 * アクティブスキルの発動確率(%)を計算（基礎ステータスに応じて増減）
 */
export function getActiveSkillActivationChance(characterOrUnit, skill, familiar = null) {
  if (!skill) return 0;
  const statVal = characterOrUnit?.baseStats?.[skill.scaleStat] || 0;
  const famBonus = characterOrUnit?.combat?.skillChanceBonus || familiar?.skillChanceBonus || 0;
  const raw = (skill.baseChance || 15) + Math.floor(statVal * (skill.statFactor || 0.6)) + famBonus;
  return Math.max(10, Math.min(90, raw));
}

export function getRaceSkillEffects(character) {
  const race = RACES[character?.raceId];
  const lv = character?.level || 1;
  const fx = {};
  if (!race || !Array.isArray(race.raceSkills)) return fx;
  for (const sk of race.raceSkills) {
    if (lv >= sk.unlockLv && sk.effects) {
      for (const [k, v] of Object.entries(sk.effects)) {
        if (typeof v === 'boolean') {
          if (v) fx[k] = true;
        } else {
          fx[k] = (fx[k] || 0) + v;
        }
      }
    }
  }
  return fx;
}

/**
 * 基礎ステータス + 装備 → 戦闘ステータス変換（閾値ボーナス・武器特性含む）
 */
export function calculateCombatStats(character, equipArg = null) {
  const s = character.baseStats;
  const cls = CLASSES[character.classId] || {};
  const passives = cls.passives || {};
  const raceFx = getRaceSkillEffects(character);

  let weapon = null;
  let armor = null;
  let accessory = null;
  let familiar = null;

  if (
    equipArg &&
    ('weapon' in equipArg || 'armor' in equipArg || 'accessory' in equipArg || 'familiar' in equipArg)
  ) {
    weapon = equipArg.weapon || null;
    armor = equipArg.armor || null;
    accessory = equipArg.accessory || null;
    familiar = equipArg.familiar || null;
  } else {
    weapon = equipArg;
  }

  weapon = weapon || {
    name: '素手',
    type: 'sword',
    rarity: 'common',
    atk: 1,
    mag: 0,
    hit: 0,
    crit: 0,
    traits: []
  };
  const weaponType = WEAPON_TYPES[weapon.type] || WEAPON_TYPES.sword;
  const traitFx = getWeaponTraitEffects([weapon, armor, accessory, familiar]);
  const famBonus = familiar?.combatBonus || {};

  // 閾値ボーナスの計算
  const strTier = Math.floor(s.str / 20);
  const magTier = Math.floor(s.mag / 20);
  const defTier = Math.floor(s.def / 20);
  const resTier = Math.floor(s.res / 20);
  const spdTier = Math.floor(s.spd / 25);
  const sklTier = Math.floor(s.skl / 20);

  const physPenThreshold = s.skl >= 40 ? 5 + Math.floor((s.skl - 40) / 20) * 5 : 0;
  const magPenThreshold = s.mag >= 40 ? 5 + Math.floor((s.mag - 40) / 20) * 5 : 0;
  const counterThreshold = s.skl >= 60 ? 10 : s.skl >= 30 ? 5 : 0;

  const maxHp = Math.round(
    (s.hp * 5 + (armor?.hp || 0) + (accessory?.hp || 0) + (famBonus.hp || 0) + traitFx.hpBonus) *
      (1 + (raceFx.hpPct || 0) / 100)
  );
  const maxMp = Math.round(
    (s.mp * 2 + (armor?.mp || 0) + (accessory?.mp || 0) + (famBonus.mp || 0) + traitFx.mpBonus) *
      (1 + (raceFx.mpPct || 0) / 100)
  );
  const physAtk = Math.round(
    (s.str * 2.0 + (weapon.atk || 0) + (accessory?.atk || 0) + (famBonus.atk || 0) + traitFx.atkBonus) *
      (1 + strTier * 0.05 + (raceFx.atkPct || 0) / 100)
  );
  const magAtk = Math.round(
    (s.mag * 2.0 + (weapon.mag || 0) + (accessory?.mag || 0) + (famBonus.mag || 0) + traitFx.magBonus) *
      (1 + magTier * 0.05 + (raceFx.magPct || 0) / 100)
  );
  const physDef = Math.round(
    s.def * 1.5 + (armor?.def || 0) + (accessory?.def || 0) + (famBonus.def || 0) + traitFx.defBonus + (raceFx.defBonus || 0)
  );
  const magDef = Math.round(
    s.res * 1.5 + (armor?.res || 0) + (accessory?.res || 0) + (famBonus.res || 0) + traitFx.resBonus + (raceFx.resBonus || 0)
  );

  const physDmgReductionPct = defTier * 3 + (passives.physDmgRedBonus || 0) + (famBonus.physDmgRed || 0) + traitFx.physDmgRedBonus + (raceFx.physDmgRedBonus || 0);
  const magDmgReductionPct = resTier * 3 + (passives.magDmgRedBonus || 0) + (famBonus.magDmgRed || 0) + traitFx.magDmgRedBonus + (raceFx.magDmgRedBonus || 0);

  const hitRate = Math.round(
    80 + s.skl * 1.5 + s.lck * 0.5 + (weapon.hit || 0) + (accessory?.hit || 0) + traitFx.hitBonus + (raceFx.hitBonus || 0)
  );
  const evaRate = Math.round(
    s.spd * 1.5 +
      s.lck * 0.5 +
      spdTier * 3 +
      (armor?.eva || 0) +
      (accessory?.eva || 0) +
      (famBonus.eva || 0) +
      (passives.evaBonus || 0) +
      traitFx.evaBonus +
      (raceFx.evaBonus || 0)
  );
  const followUpBonusPct = spdTier * 5 + (passives.followUpBonus || 0) + (famBonus.followUp || 0) + traitFx.followUpBonus + (raceFx.followUpBonus || 0);

  const critRateBase = Math.round(
    s.skl * 1.0 +
      s.lck * 0.5 +
      (weapon.crit || 0) +
      (accessory?.crit || 0) +
      (famBonus.crit || 0) +
      (passives.critBonus || 0) +
      traitFx.critBonus +
      (raceFx.critBonus || 0)
  );
  const critDmgPct = Math.round(
    150 + s.skl * 0.5 + sklTier * 10 + (passives.critDmgBonus || 0) + traitFx.critDmgBonus + (raceFx.critDmgBonus || 0)
  );

  const physPenPct = physPenThreshold + (passives.physPenBonus || 0) + (famBonus.physPen || 0) + traitFx.physPen + (raceFx.physPenBonus || 0);
  const magPenPct = magPenThreshold + (passives.magPenBonus || 0) + (famBonus.magPen || 0) + traitFx.magPen + (raceFx.magPenBonus || 0);

  const healMultiplierPct = Math.round(
    100 + s.mag * 1.0 + s.cha * 0.5 + (passives.healBonusPct || 0) + (famBonus.healBonus || 0) + traitFx.healBonus + (raceFx.healBonusPct || 0)
  );
  const counterRatePct =
    counterThreshold + (passives.counterBonus || 0) + traitFx.counterBonus + (raceFx.counterBonus || 0);
  const dropRatePct = Math.round(
    100 +
      s.lck * 0.5 +
      s.cha * 0.5 +
      (passives.dropRateBonus || 0) +
      (accessory?.dropBonus || 0) +
      (famBonus.dropBonus || 0) +
      traitFx.dropBonus +
      (raceFx.dropRateBonus || 0)
  );

  const initiativeBonus =
    (passives.initiativeBonus || 0) +
    (accessory?.initiativeBonus || 0) +
    (famBonus.initiativeBonus || 0) +
    traitFx.initiativeBonus +
    (raceFx.initiativeBonus || 0);

  const skillChanceBonus = (familiar?.skillChanceBonus || 0) + traitFx.skillChanceBonus + (raceFx.skillChanceBonus || 0);
  const hateBonus = (passives.hateBonus || 0) + (raceFx.hateBonus || 0);

  const attackElement = resolveAttackElement(weapon, traitFx);

  return {
    maxHp,
    maxMp,
    physAtk,
    magAtk,
    physDef,
    magDef,
    physDmgReductionPct,
    magDmgReductionPct,
    hitRate,
    evaRate,
    followUpBonusPct,
    critRateBase,
    critDmgPct,
    physPenPct,
    magPenPct,
    healMultiplierPct,
    counterRatePct,
    dropRatePct,
    initiativeBonus,
    skillChanceBonus,
    hateBonus,
    raceFx,
    lifestealPct: traitFx.lifestealPct + (raceFx.lifestealPct || 0),
    attackElement,
    weapon,
    armor,
    accessory,
    familiar,
    weaponType,
    traitSnipeBackline: traitFx.snipeBackline,
    thresholds: {
      strTier,
      magTier,
      defTier,
      resTier,
      spdTier,
      sklTier,
      physPenThreshold,
      magPenThreshold,
      counterThreshold
    }
  };
}

/**
 * 武器の基礎属性と装備特性の付与属性から最終攻撃属性を解決する
 * 異なる基礎4属性が2つ以上揃った場合、複合属性へ自動昇華する
 */
export function resolveAttackElement(weapon, traitFx) {
  const candidates = [];
  if (weapon?.element && weapon.element !== 'none') {
    candidates.push(weapon.element);
  }
  if (traitFx && Array.isArray(traitFx.elements)) {
    for (const el of traitFx.elements) {
      if (el && el !== 'none') candidates.push(el);
    }
  }

  const baseElements = [];
  for (const el of candidates) {
    if (ELEMENTS[el]?.tier === 1 && !baseElements.includes(el)) {
      baseElements.push(el);
    }
  }

  if (baseElements.length >= 2) {
    const combo =
      ELEMENT_COMBINATIONS[`${baseElements[0]}+${baseElements[1]}`] ||
      ELEMENT_COMBINATIONS[`${baseElements[1]}+${baseElements[0]}`];
    if (combo) return combo;
  }

  if (weapon?.element && ELEMENTS[weapon.element]?.tier === 2) {
    return weapon.element;
  }

  if (baseElements.length === 1) {
    return baseElements[0];
  }

  return 'none';
}
