import {
  createCharacter,
  getExpForNextLevel,
  levelUpCharacter,
  canClassChange,
  applyClassChange,
  canReclassToTier1,
  applyReclassToTier1
} from '../engine/stats.js';
import {
  generateWeaponInstance,
  generateArmorInstance,
  generateAccessoryInstance,
  generateFamiliarInstance
} from '../engine/loot.js';
import {
  STAT_KEYS,
  STAT_LABELS,
  ITEMS,
  RARITIES,
  CLASSES,
  QUESTS,
  STAR_BLESSINGS,
  STAR_EXCHANGES,
  getAllowedArmors
} from '../data/masterData.js';

const STORAGE_KEY = 'fesolo_rpg_save_v1';

function getDefaultWeaponTemplateForClass(classId) {
  const map = {
    warrior: 'iron_sword',
    swordsman: 'bamboo_katana',
    mage: 'fire_tome',
    archer: 'short_bow',
    thief: 'iron_dagger',
    cleric: 'heal_staff'
  };
  return map[classId] || 'iron_sword';
}

function createInitialState() {
  const w1 = generateWeaponInstance('iron_sword', { rarity: 'common', traits: [] });
  const w2 = generateWeaponInstance('bamboo_katana', { rarity: 'common', traits: [] });
  const w3 = generateWeaponInstance('fire_tome', { rarity: 'common', traits: [] });
  const w4 = generateWeaponInstance('short_bow', { rarity: 'common', traits: [] });
  const w5 = generateWeaponInstance('heal_staff', { rarity: 'common', traits: [] });
  const w6 = generateWeaponInstance('iron_dagger', { rarity: 'common', traits: [] });

  const a1 = generateArmorInstance('iron_plate', { rarity: 'common', traits: [] });
  const a2 = generateArmorInstance('leather_vest', { rarity: 'common', traits: [] });
  const a3 = generateArmorInstance('apprentice_robe', { rarity: 'common', traits: [] });
  const acc1 = generateAccessoryInstance('power_ring', { rarity: 'common', traits: [] });
  const acc2 = generateAccessoryInstance('lucky_amulet', { rarity: 'common', traits: [] });

  const starter1 = createCharacter({
    id: 'starter_1',
    name: 'ガルド',
    raceId: 'dwarf',
    classId: 'warrior',
    personalityId: 'cautious',
    equippedWeaponUid: w1.uid,
    equippedArmorUid: a1.uid
  });
  const starter2 = createCharacter({
    id: 'starter_2',
    name: 'アレン',
    raceId: 'human',
    classId: 'swordsman',
    personalityId: 'aggressive',
    equippedWeaponUid: w2.uid,
    equippedArmorUid: a2.uid,
    equippedAccessoryUid: acc1.uid
  });
  const starter3 = createCharacter({
    id: 'starter_3',
    name: 'セレス',
    raceId: 'elf',
    classId: 'mage',
    personalityId: 'calm',
    equippedWeaponUid: w3.uid,
    equippedArmorUid: a3.uid
  });
  const starter4 = createCharacter({
    id: 'starter_4',
    name: 'ミレイ',
    raceId: 'beastkin',
    classId: 'archer',
    personalityId: 'cunning',
    equippedWeaponUid: w4.uid,
    equippedAccessoryUid: acc2.uid
  });

  return {
    version: 3,
    gold: 100,
    roster: [starter1, starter2, starter3, starter4],
    partyIds: ['starter_1', 'starter_2', 'starter_3', 'starter_4'],
    weapons: [w1, w2, w3, w4, w5, w6],
    armors: [a1, a2, a3],
    accessories: [acc1, acc2],
    familiars: [],
    items: {
      class_crest: 0,
      hero_crest: 0
    },
    starStones: 0,
    blessings: {},
    selectedAreaId: 'meadow',
    exploreMode: 'watch',
    settings: {
      skipLevelUpPopup: false,
      debugMode: false,
      battleIntervalMs: 1000,
      expMultiplier: 1
    },
    stats: {
      totalBattles: 0,
      victories: 0,
      totalKills: 0,
      areaClears: {},
      dungeonClears: {},
      reclassCount: 0
    },
    quests: {
      completed: []
    },
    unlockedHiddenClasses: []
  };
}

/**
 * Phase 1 → Phase 2 セーブデータ自動マイグレーション
 */
function migrateState(parsed) {
  if (!parsed || typeof parsed !== 'object') return null;

  if (!Array.isArray(parsed.weapons)) {
    const migratedWeapons = [];
    const oldInv = parsed.inventoryWeapons || {};
    for (const [tplId, count] of Object.entries(oldInv)) {
      for (let i = 0; i < count; i++) {
        try {
          migratedWeapons.push(generateWeaponInstance(tplId, { rarity: 'common', traits: [] }));
        } catch {
          // 無視
        }
      }
    }
    parsed.weapons = migratedWeapons;
    delete parsed.inventoryWeapons;
  }

  for (const char of parsed.roster || []) {
    if (!char.equippedWeaponUid && char.equippedWeaponId) {
      let match = parsed.weapons.find(w => w.templateId === char.equippedWeaponId);
      if (!match) {
        try {
          match = generateWeaponInstance(char.equippedWeaponId, { rarity: 'common', traits: [] });
          parsed.weapons.push(match);
        } catch {
          match = null;
        }
      }
      if (match) {
        char.equippedWeaponUid = match.uid;
      }
      delete char.equippedWeaponId;
    }
  }

  if (!parsed.items) {
    parsed.items = { class_crest: 0, hero_crest: 0 };
  }
  if (parsed.items.hero_crest === undefined) {
    parsed.items.hero_crest = 0;
  }
  if (!parsed.settings) {
    parsed.settings = { skipLevelUpPopup: false, debugMode: false, battleIntervalMs: 1000, expMultiplier: 1 };
  } else {
    if (parsed.settings.debugMode === undefined) parsed.settings.debugMode = false;
    if (parsed.settings.battleIntervalMs === undefined) parsed.settings.battleIntervalMs = 1000;
    if (parsed.settings.expMultiplier === undefined) parsed.settings.expMultiplier = 1;
  }
  if (!Array.isArray(parsed.armors)) {
    parsed.armors = [];
  }
  if (!Array.isArray(parsed.accessories)) {
    parsed.accessories = [];
  }
  if (!Array.isArray(parsed.familiars)) {
    parsed.familiars = [];
  }
  for (const w of parsed.weapons || []) {
    if (!w.slot) w.slot = 'weapon';
  }
  for (const char of parsed.roster || []) {
    if (char.equippedArmorUid === undefined) char.equippedArmorUid = null;
    if (char.equippedAccessoryUid === undefined) char.equippedAccessoryUid = null;
    if (char.equippedFamiliarUid === undefined) char.equippedFamiliarUid = null;
    if (!Array.isArray(char.classHistory)) {
      char.classHistory = [char.classId];
    }
  }
  if (!parsed.stats) parsed.stats = { totalBattles: 0, victories: 0 };
  if (parsed.stats.totalKills === undefined) parsed.stats.totalKills = 0;
  if (parsed.starStones === undefined) parsed.starStones = 0;
  if (!parsed.blessings) parsed.blessings = {};
  if (!parsed.stats.areaClears) parsed.stats.areaClears = {};
  if (!parsed.stats.dungeonClears) parsed.stats.dungeonClears = {};
  if (parsed.stats.reclassCount === undefined) parsed.stats.reclassCount = 0;
  if (!parsed.quests || !Array.isArray(parsed.quests.completed)) {
    parsed.quests = { completed: [] };
  }
  if (!Array.isArray(parsed.unlockedHiddenClasses)) {
    parsed.unlockedHiddenClasses = [];
  }
  parsed.version = 3;
  return parsed;
}

class GameStore {
  constructor() {
    this.state = this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = migrateState(JSON.parse(raw));
        if (parsed && Array.isArray(parsed.roster) && Array.isArray(parsed.partyIds)) {
          this.save(parsed);
          return parsed;
        }
      }
    } catch (e) {
      console.warn('セーブデータの読み込みに失敗しました:', e);
    }
    const init = createInitialState();
    this.save(init);
    return init;
  }

  save(nextState = this.state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    } catch (e) {
      console.warn('セーブデータの保存に失敗しました:', e);
    }
  }

  reset() {
    this.state = createInitialState();
    this.save();
    return this.state;
  }

  getPartyCharacters() {
    return this.state.partyIds
      .map(id => this.state.roster.find(c => c.id === id))
      .filter(Boolean);
  }

  getEquipListBySlot(slot) {
    if (slot === 'armor') return this.state.armors;
    if (slot === 'accessory') return this.state.accessories;
    if (slot === 'familiar') return this.state.familiars;
    return this.state.weapons;
  }

  getEquipByUid(slot, uid) {
    if (!uid) return null;
    return this.getEquipListBySlot(slot).find(e => e.uid === uid) || null;
  }

  getWeaponByUid(uid) {
    return this.getEquipByUid('weapon', uid);
  }

  getCharacterEquips(char) {
    if (!char) return { weapon: null, armor: null, accessory: null, familiar: null };
    return {
      weapon: this.getEquipByUid('weapon', char.equippedWeaponUid),
      armor: this.getEquipByUid('armor', char.equippedArmorUid),
      accessory: this.getEquipByUid('accessory', char.equippedAccessoryUid),
      familiar: this.getEquipByUid('familiar', char.equippedFamiliarUid)
    };
  }

  getEquipOwner(slot, uid) {
    const field =
      slot === 'armor'
        ? 'equippedArmorUid'
        : slot === 'accessory'
        ? 'equippedAccessoryUid'
        : slot === 'familiar'
        ? 'equippedFamiliarUid'
        : 'equippedWeaponUid';
    return this.state.roster.find(c => c[field] === uid) || null;
  }

  getWeaponOwner(weaponUid) {
    return this.getEquipOwner('weapon', weaponUid);
  }

  applyBattleRewards(rewards, areaId = null) {
    const messages = [];
    const levelUps = [];
    this.state.stats.totalBattles += 1;
    if (!rewards) return { messages, levelUps };

    this.state.stats.victories += 1;
    if (areaId) {
      if (!this.state.stats.areaClears) this.state.stats.areaClears = {};
      this.state.stats.areaClears[areaId] = (this.state.stats.areaClears[areaId] || 0) + 1;
    }

    const egMult = 1 + this.getBlessingBonus('exp_gold_boost');
    const earnedGold = Math.round((rewards.gold || 0) * egMult);
    this.state.gold += earnedGold;

    if (rewards.starStones > 0) {
      this.state.starStones = (this.state.starStones || 0) + rewards.starStones;
      messages.push(`💠 星屑の輝石×${rewards.starStones} を拾った！`);
    }

    const kills = rewards.killCount || 0;
    if (kills > 0) {
      const prevKills = this.state.stats.totalKills || 0;
      const newKills = prevKills + kills;
      this.state.stats.totalKills = newKills;
      const prevMilestone = Math.floor(prevKills / 100);
      const newMilestone = Math.floor(newKills / 100);
      if (newMilestone > prevMilestone) {
        const bonusStones = (newMilestone - prevMilestone) * 3;
        this.state.starStones = (this.state.starStones || 0) + bonusStones;
        messages.push(`🌟 討伐${newMilestone * 100}体達成！ 💠 星屑の輝石×${bonusStones} を獲得！`);
      }
    }

    for (const eq of rewards.droppedWeapons || []) {
      const slot = eq.slot || 'weapon';
      this.getEquipListBySlot(slot).push(eq);
      const rarityName = RARITIES[eq.rarity]?.name || '';
      messages.push(`🎁 [${rarityName}] ${eq.name} を手に入れた！`);
    }

    for (const itemId of rewards.droppedItems || []) {
      this.state.items[itemId] = (this.state.items[itemId] || 0) + 1;
      const item = ITEMS[itemId];
      messages.push(`✨ 貴重品 [${item?.name || itemId}] を手に入れた！`);
    }

    const party = this.getPartyCharacters();
    const expMult =
      (this.state.settings?.debugMode ? Number(this.state.settings.expMultiplier || 1) : 1) * egMult;
    const earnedExp = Math.round((rewards.exp || 0) * expMult);
    const growthBonusPct = this.getBlessingBonus('growth_boost');
    for (const char of party) {
      const fam = this.getEquipByUid('familiar', char.equippedFamiliarUid);
      char.exp += earnedExp;
      let needed = getExpForNextLevel(char.level);
      while (char.exp >= needed) {
        char.exp -= needed;
        const oldLevel = char.level;
        const gains = levelUpCharacter(char, fam, growthBonusPct);
        if (!gains) {
          char.exp = 0;
          break;
        }
        const gainText = Object.entries(gains)
          .map(([k, v]) => `${STAT_LABELS[k]}+${v}`)
          .join(' ');
        messages.push(`⬆️ ${char.name} が Lv.${char.level} にアップ！ (${gainText || '成長なし'})`);
        levelUps.push({
          charName: char.name,
          className: CLASSES[char.classId]?.name || '',
          oldLevel,
          newLevel: char.level,
          baseStats: { ...char.baseStats },
          gains
        });
        needed = getExpForNextLevel(char.level);
      }
    }

    this.save();
    return { messages, levelUps };
  }

  /**
   * ダンジョン完全踏破時の極限鍛錬判定（レベルは上がらず基礎ステータス+1）
   */
  applyDungeonTraining(chance = 0.05) {
    const messages = [];
    const trainingEvents = [];
    const party = this.getPartyCharacters();

    for (const char of party) {
      if (Math.random() < chance) {
        const key = STAT_KEYS[Math.floor(Math.random() * STAT_KEYS.length)];
        char.baseStats[key] = (char.baseStats[key] || 0) + 1;
        char.trainingCount = (char.trainingCount || 0) + 1;
        messages.push(
          `🔥 鍛錬の成果！ ${char.name} の [${STAT_LABELS[key]}] が +1 上昇！（鍛錬計 ${char.trainingCount}回）`
        );
        trainingEvents.push({
          isTraining: true,
          charName: char.name,
          className: CLASSES[char.classId]?.name || '',
          oldLevel: char.level,
          newLevel: char.level,
          trainingCount: char.trainingCount,
          baseStats: { ...char.baseStats },
          gains: { [key]: 1 }
        });
      }
    }

    if (trainingEvents.length > 0) {
      this.save();
    }
    return { messages, trainingEvents };
  }

  setSetting(key, value) {
    if (!this.state.settings) this.state.settings = {};
    this.state.settings[key] = value;
    this.save();
  }

  recordDefeat() {
    this.state.stats.totalBattles += 1;
    this.save();
  }

  swapPartyPositions(indexA, indexB) {
    const ids = this.state.partyIds;
    if (indexA < 0 || indexB < 0 || indexA >= ids.length || indexB >= ids.length) return;
    [ids[indexA], ids[indexB]] = [ids[indexB], ids[indexA]];
    this.save();
  }

  setPartySlot(slotIndex, charId) {
    const existingIdx = this.state.partyIds.indexOf(charId);
    if (existingIdx !== -1) {
      this.swapPartyPositions(slotIndex, existingIdx);
      return;
    }
    this.state.partyIds[slotIndex] = charId;
    this.save();
  }

  equipItem(charId, slot, uid) {
    const char = this.state.roster.find(c => c.id === charId);
    const eq = this.getEquipByUid(slot, uid);
    if (!char || !eq) return false;

    const field =
      slot === 'armor'
        ? 'equippedArmorUid'
        : slot === 'accessory'
        ? 'equippedAccessoryUid'
        : slot === 'familiar'
        ? 'equippedFamiliarUid'
        : 'equippedWeaponUid';

    const prevOwner = this.getEquipOwner(slot, uid);
    if (prevOwner && prevOwner.id !== char.id) {
      prevOwner[field] = null;
    }

    char[field] = uid;
    this.save();
    return true;
  }

  unequipItem(charId, slot) {
    const char = this.state.roster.find(c => c.id === charId);
    if (!char) return false;
    const field =
      slot === 'armor'
        ? 'equippedArmorUid'
        : slot === 'accessory'
        ? 'equippedAccessoryUid'
        : slot === 'familiar'
        ? 'equippedFamiliarUid'
        : 'equippedWeaponUid';
    char[field] = null;
    this.save();
    return true;
  }

  equipWeapon(charId, weaponUid) {
    return this.equipItem(charId, 'weapon', weaponUid);
  }

  sellEquipment(slot, uid) {
    const owner = this.getEquipOwner(slot, uid);
    if (owner) return 0;
    const list = this.getEquipListBySlot(slot);
    const idx = list.findIndex(e => e.uid === uid);
    if (idx === -1) return 0;
    const eq = list[idx];
    const price = RARITIES[eq.rarity]?.sellPrice || 20;
    list.splice(idx, 1);
    this.state.gold += price;
    this.save();
    return price;
  }

  sellWeapon(weaponUid) {
    return this.sellEquipment('weapon', weaponUid);
  }

  sellAllUnequippedCommons(slot = 'weapon') {
    let earned = 0;
    let count = 0;
    const list = this.getEquipListBySlot(slot);
    const filtered = list.filter(e => {
      const isEquipped = Boolean(this.getEquipOwner(slot, e.uid));
      if (!isEquipped && e.rarity === 'common') {
        earned += RARITIES.common.sellPrice;
        count += 1;
        return false;
      }
      return true;
    });
    if (slot === 'armor') this.state.armors = filtered;
    else if (slot === 'accessory') this.state.accessories = filtered;
    else this.state.weapons = filtered;

    this.state.gold += earned;
    this.save();
    return { count, earned };
  }

  promoteCharacter(charId, targetClassId) {
    const char = this.state.roster.find(c => c.id === charId);
    if (!char) return { ok: false, reason: 'キャラが見つかりません' };

    const items = this.state.items || {};
    const check = canClassChange(char, targetClassId, items, this.state.unlockedHiddenClasses);
    if (!check.ok) return check;

    const targetCls = CLASSES[targetClassId];
    if (targetCls.requiresCrest) {
      this.state.items.class_crest = Math.max(0, (items.class_crest || 0) - 1);
    }
    if (targetCls.requiresHeroCrest) {
      this.state.items.hero_crest = Math.max(0, (items.hero_crest || 0) - 1);
    }

    applyClassChange(char, targetClassId);

    const currentWpn = this.getEquipByUid('weapon', char.equippedWeaponUid);
    if (currentWpn && !targetCls.allowedWeapons.includes(currentWpn.type)) {
      char.equippedWeaponUid = null;
    }
    const currentArm = this.getEquipByUid('armor', char.equippedArmorUid);
    if (currentArm && !getAllowedArmors(targetClassId).includes(currentArm.type)) {
      char.equippedArmorUid = null;
    }

    this.save();
    return { ok: true, reason: '' };
  }

  reclassCharacterToTier1(charId, targetClassId) {
    const char = this.state.roster.find(c => c.id === charId);
    if (!char) return { ok: false, reason: 'キャラが見つかりません' };

    const check = canReclassToTier1(char, targetClassId);
    if (!check.ok) return check;

    const targetCls = CLASSES[targetClassId];
    applyReclassToTier1(char, targetClassId);
    this.state.stats.reclassCount = (this.state.stats.reclassCount || 0) + 1;

    const currentWpn = this.getEquipByUid('weapon', char.equippedWeaponUid);
    if (currentWpn && !targetCls.allowedWeapons.includes(currentWpn.type)) {
      char.equippedWeaponUid = null;
    }
    const currentArm = this.getEquipByUid('armor', char.equippedArmorUid);
    if (currentArm && !getAllowedArmors(targetClassId).includes(currentArm.type)) {
      char.equippedArmorUid = null;
    }

    this.save();
    return { ok: true, reason: '' };
  }

  recruitCharacter({ name, raceId, classId, personalityId }) {
    const wpn = generateWeaponInstance(getDefaultWeaponTemplateForClass(classId), {
      rarity: 'common',
      traits: []
    });
    this.state.weapons.push(wpn);

    const newChar = createCharacter({
      name,
      raceId,
      classId,
      personalityId,
      equippedWeaponUid: wpn.uid
    });
    this.state.roster.push(newChar);
    if (this.state.partyIds.length < 4) {
      this.state.partyIds.push(newChar.id);
    }
    this.save();
    return newChar;
  }

  recordDungeonClear(dungeonId) {
    if (!dungeonId) return;
    if (!this.state.stats.dungeonClears) this.state.stats.dungeonClears = {};
    this.state.stats.dungeonClears[dungeonId] = (this.state.stats.dungeonClears[dungeonId] || 0) + 1;
    this.save();
  }

  isQuestUnlocked(quest) {
    if (!quest) return false;
    if (!quest.prevQuestId) return true;
    return (this.state.quests?.completed || []).includes(quest.prevQuestId);
  }

  isQuestCompleted(questId) {
    return (this.state.quests?.completed || []).includes(questId);
  }

  getQuestProgress(quest) {
    const cond = quest.condition || {};
    const stats = this.state.stats || {};
    let current = 0;
    let target = cond.count || 1;

    switch (cond.type) {
      case 'area_clear':
        current = stats.areaClears?.[cond.areaId] || 0;
        break;
      case 'dungeon_clear':
        current = stats.dungeonClears?.[cond.dungeonId] || 0;
        break;
      case 'victories':
        current = stats.victories || 0;
        break;
      case 'reclass_count':
        current = stats.reclassCount || 0;
        break;
      case 'roster_count':
        current = (this.state.roster || []).length;
        break;
      case 'max_level':
        target = cond.level || 1;
        current = Math.max(0, ...(this.state.roster || []).map(c => c.level || 1));
        break;
      case 'max_tier':
        target = cond.tier || 1;
        current = Math.max(1, ...(this.state.roster || []).map(c => CLASSES[c.classId]?.tier || 1));
        break;
      default:
        current = 0;
    }

    return {
      current: Math.min(current, target),
      target,
      met: current >= target
    };
  }

  getClaimableQuestsCount() {
    let count = 0;
    for (const q of QUESTS) {
      if (!this.isQuestCompleted(q.id) && this.isQuestUnlocked(q) && this.getQuestProgress(q).met) {
        count += 1;
      }
    }
    return count;
  }

  claimQuestReward(questId) {
    const q = QUESTS.find(item => item.id === questId);
    if (!q) return { ok: false, reason: 'クエストが見つかりません' };
    if (this.isQuestCompleted(questId)) return { ok: false, reason: 'すでに報酬を受け取っています' };
    if (!this.isQuestUnlocked(q)) return { ok: false, reason: '前提クエストが未完了です' };
    if (!this.getQuestProgress(q).met) return { ok: false, reason: '達成条件を満たしていません' };

    const rw = q.rewards || {};
    const messages = [];

    if (rw.gold) {
      this.state.gold += rw.gold;
      messages.push(`💰 ${rw.gold}G`);
    }
    if (rw.items) {
      for (const [itemId, qty] of Object.entries(rw.items)) {
        this.state.items[itemId] = (this.state.items[itemId] || 0) + qty;
        messages.push(`✨ ${ITEMS[itemId]?.name || itemId}×${qty}`);
      }
    }
    if (rw.uniqueEquip) {
      const ue = rw.uniqueEquip;
      let inst = null;
      if (ue.slot === 'weapon') {
        inst = generateWeaponInstance(ue.templateId, { rarity: ue.rarity, traits: ue.traits });
      } else if (ue.slot === 'armor') {
        inst = generateArmorInstance(ue.templateId, { rarity: ue.rarity, traits: ue.traits });
      } else if (ue.slot === 'accessory') {
        inst = generateAccessoryInstance(ue.templateId, { rarity: ue.rarity, traits: ue.traits });
      }
      if (inst) {
        this.getEquipListBySlot(ue.slot).push(inst);
        messages.push(`🎁 [${RARITIES[inst.rarity]?.name || ''}] ${inst.name}`);
      }
    }
    if (rw.familiarId) {
      const fam = generateFamiliarInstance(rw.familiarId);
      this.state.familiars.push(fam);
      messages.push(`🐾 使い魔「${fam.name}」`);
    }
    if (rw.unlockClassId) {
      if (!Array.isArray(this.state.unlockedHiddenClasses)) {
        this.state.unlockedHiddenClasses = [];
      }
      if (!this.state.unlockedHiddenClasses.includes(rw.unlockClassId)) {
        this.state.unlockedHiddenClasses.push(rw.unlockClassId);
      }
      messages.push(`🌟 隠し職業「${CLASSES[rw.unlockClassId]?.name || rw.unlockClassId}」解放！`);
    }

    if (!this.state.quests) this.state.quests = { completed: [] };
    this.state.quests.completed.push(questId);
    this.save();
    return { ok: true, messages };
  }

  getBlessingLevel(id) {
    return this.state.blessings?.[id] || 0;
  }

  getBlessingBonus(id) {
    const def = STAR_BLESSINGS.find(b => b.id === id);
    if (!def) return 0;
    return this.getBlessingLevel(id) * def.perLevel;
  }

  getBlessingCost(id) {
    const def = STAR_BLESSINGS.find(b => b.id === id);
    if (!def) return 9999;
    const lv = this.getBlessingLevel(id);
    return def.baseCost + lv * def.costStep;
  }

  upgradeBlessing(id) {
    const def = STAR_BLESSINGS.find(b => b.id === id);
    if (!def) return { ok: false, reason: '祝福が見つかりません' };
    const lv = this.getBlessingLevel(id);
    if (lv >= def.maxLevel) return { ok: false, reason: 'すでに最大レベルです' };
    const cost = this.getBlessingCost(id);
    if ((this.state.starStones || 0) < cost) {
      return { ok: false, reason: `星屑の輝石が ${cost}個 必要です` };
    }
    this.state.starStones -= cost;
    if (!this.state.blessings) this.state.blessings = {};
    this.state.blessings[id] = lv + 1;
    this.save();
    return { ok: true };
  }

  exchangeStarItem(exchangeId) {
    const ex = STAR_EXCHANGES.find(e => e.id === exchangeId);
    if (!ex) return { ok: false, reason: '交換品が見つかりません' };
    if ((this.state.starStones || 0) < ex.cost) {
      return { ok: false, reason: `星屑の輝石が ${ex.cost}個 必要です` };
    }
    this.state.starStones -= ex.cost;
    let label = ex.name;

    if (ex.kind === 'item') {
      this.state.items[ex.itemId] = (this.state.items[ex.itemId] || 0) + (ex.qty || 1);
    } else if (ex.kind === 'familiar') {
      const fam = generateFamiliarInstance(ex.familiarId);
      this.state.familiars.push(fam);
      label = `使い魔「${fam.name}」`;
    } else if (ex.kind === 'uniqueEquip') {
      const ue = ex.uniqueEquip;
      const inst =
        ue.slot === 'armor'
          ? generateArmorInstance(ue.templateId, { rarity: ue.rarity, traits: ue.traits })
          : ue.slot === 'accessory'
          ? generateAccessoryInstance(ue.templateId, { rarity: ue.rarity, traits: ue.traits })
          : generateWeaponInstance(ue.templateId, { rarity: ue.rarity, traits: ue.traits });
      this.getEquipListBySlot(ue.slot).push(inst);
      label = `[${RARITIES[inst.rarity]?.name || ''}] ${inst.name}`;
    }

    this.save();
    return { ok: true, label };
  }

  addStarStones(amount) {
    if (!amount || amount <= 0) return;
    this.state.starStones = (this.state.starStones || 0) + amount;
    this.save();
  }
}

export const store = new GameStore();
