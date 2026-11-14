import {
  DUNGEONS,
  THIEF_LINE_CLASSES,
  ITEMS,
  RARITIES
} from '../data/masterData.js';
import { calculateCombatStats } from './stats.js';
import { generateWeaponInstance, generateFamiliarInstance } from './loot.js';
import { createBattleSession, runBattleToEnd } from './battle.js';
import { store } from '../state/store.js';

const NODE_META = {
  battle: { type: 'battle', icon: '⚔️', title: '魔物との遭遇', desc: '通常の敵グループが待ち構えている。' },
  elite: { type: 'elite', icon: '💀', title: '強敵（エリート）', desc: '手強い敵だが経験値とドロップ率が高い。' },
  treasure: { type: 'treasure', icon: '💎', title: '宝箱 / 採掘', desc: '装備や財宝が眠っている（盗賊系がいると有利）。' },
  fountain: { type: 'fountain', icon: '⛲', title: '癒しの泉 / 野営', desc: 'HP・MPを回復するか、探索中の強化バフを得られる。' },
  event: { type: 'event', icon: '❓', title: '奇妙な出来事', desc: '選択次第でリスクとリターンが発生するイベント。' },
  boss: { type: 'boss', icon: '👑', title: '階層ボス', desc: 'この階層の主。撃破すれば次階層へ進めるか帰還できる。' }
};

const RANDOM_EVENTS = [
  {
    id: 'altar',
    title: '血塗られた祭壇',
    desc: '古びた祭壇が妖しく光っている。捧げ物をすれば力が得られそうだが…。',
    choices: [
      { id: 'blood', label: '血を捧げる（全員HP-20% / 攻撃バフ+20% & ドロップ率+20%）' },
      { id: 'pray', label: '静かに祈る（全員MP+20%回復）' },
      { id: 'ignore', label: '無視して先へ進む' }
    ]
  },
  {
    id: 'chest_trap',
    title: '封印された遺物箱',
    desc: '厳重に鍵のかかった箱を見つけた。無理にこじ開ければ罠が作動するかもしれない。',
    choices: [
      { id: 'open', label: '無理やり開ける（高レア装備チャンス / 罠でHP-25%の危険）' },
      { id: 'careful', label: '周囲を調べてゴールドだけ回収（+80G）' }
    ]
  }
];

function buildFloorSteps(dungeon) {
  const steps = [];
  const totalSteps = dungeon.stepsPerFloor;
  const pool = ['battle', 'battle', 'elite', 'treasure', 'fountain', 'event'];

  for (let s = 0; s < totalSteps; s++) {
    if (s === totalSteps - 1) {
      steps.push([{ id: `n_${s}_boss`, ...NODE_META.boss }]);
    } else if (s === 0) {
      steps.push([
        { id: `n_${s}_0`, ...NODE_META.battle },
        { id: `n_${s}_1`, ...NODE_META.treasure }
      ]);
    } else {
      const count = Math.random() < 0.5 ? 2 : 3;
      const row = [];
      const used = new Set();
      for (let i = 0; i < count; i++) {
        let pick = pool[Math.floor(Math.random() * pool.length)];
        if (used.has(pick) && count <= 2) {
          pick = pick === 'battle' ? 'event' : 'battle';
        }
        used.add(pick);
        row.push({ id: `n_${s}_${i}`, ...NODE_META[pick] });
      }
      steps.push(row);
    }
  }
  return steps;
}

export class DungeonController {
  constructor() {
    this.run = null;
  }

  hasThiefInParty() {
    return store.getPartyCharacters().some(c => THIEF_LINE_CLASSES.includes(c.classId));
  }

  startDungeon(dungeonId) {
    const dungeon = DUNGEONS.find(d => d.id === dungeonId);
    const party = store.getPartyCharacters();
    if (!dungeon || party.length === 0) return null;

    const partyHpMp = {};
    for (const c of party) {
      const cs = calculateCombatStats(c, store.getCharacterEquips(c));
      partyHpMp[c.id] = { hp: cs.maxHp, mp: cs.maxMp, maxHp: cs.maxHp, maxMp: cs.maxMp };
    }

    this.run = {
      dungeonId: dungeon.id,
      dungeonName: dungeon.name,
      floor: 1,
      totalFloors: dungeon.totalFloors,
      stepIndex: 0,
      floorSteps: buildFloorSteps(dungeon),
      partyHpMp,
      buffs: { atkPct: 0, defPct: 0, dropPct: 0 },
      lootBag: { gold: 0, exp: 0, weapons: [], items: {} },
      phase: 'map',
      activeNode: null,
      activeEvent: null,
      lastBattle: null,
      showBattleLog: false,
      logs: [`🏰 [${dungeon.name}] 第1階層へ突入した！`]
    };
    return this.run;
  }

  getDungeonDef() {
    if (!this.run) return null;
    return DUNGEONS.find(d => d.id === this.run.dungeonId) || null;
  }

  addLog(text) {
    if (!this.run) return;
    this.run.logs.unshift(text);
    if (this.run.logs.length > 30) this.run.logs.length = 30;
  }

  selectNode(nodeId) {
    if (!this.run || this.run.phase !== 'map') return;
    const currentRow = this.run.floorSteps[this.run.stepIndex] || [];
    const node = currentRow.find(n => n.id === nodeId);
    if (!node) return;

    this.run.activeNode = node;
    this.run.showBattleLog = false;

    if (node.type === 'battle' || node.type === 'elite' || node.type === 'boss') {
      this.run.phase = 'battle_prep';
      return;
    }

    if (node.type === 'treasure') {
      this.resolveTreasure();
      return;
    }

    if (node.type === 'fountain') {
      this.run.phase = 'event';
      this.run.activeEvent = {
        title: '癒しの泉 / 野営',
        desc: '清らかな泉が湧いている。休息をとるか、気合を入れて先へ進もう。',
        choices: [
          { id: 'heal_all', label: '泉で休む（生存メンバーのHP/MP 50%回復）' },
          { id: 'buff_atk', label: '戦いの祈り（探索中 攻撃+15%）' },
          { id: 'buff_def', label: '守りの祈り（探索中 防御+15%）' }
        ]
      };
      return;
    }

    if (node.type === 'event') {
      this.run.phase = 'event';
      const ev = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
      this.run.activeEvent = ev;
    }
  }

  resolveTreasure() {
    const dungeon = this.getDungeonDef();
    const hasThief = this.hasThiefInParty();
    const bonus = (dungeon?.rarityBonus || 0) + (hasThief ? 0.25 : 0);

    // 罠判定（盗賊がいれば完全回避）
    if (!hasThief && Math.random() < 0.25) {
      for (const hpMp of Object.values(this.run.partyHpMp)) {
        if (hpMp.hp > 1) {
          hpMp.hp = Math.max(1, Math.round(hpMp.hp * 0.85));
        }
      }
      this.addLog('💥 宝箱の罠が作動！ パーティ全員がHP15%ダメージを受けた！');
    } else if (hasThief) {
      this.addLog('🗝️ 盗賊系メンバーが華麗に罠を解除し、レア率を上げた！');
    }

    const pool = dungeon?.exclusiveLootIds || ['steel_sword', 'hunter_bow'];
    const tplId = pool[Math.floor(Math.random() * pool.length)];
    const wpn = generateWeaponInstance(tplId, { rarityBonus: bonus });
    const goldFound = 40 + this.run.floor * 30;

    this.run.lootBag.weapons.push(wpn);
    this.run.lootBag.gold += goldFound;
    this.addLog(`💎 宝箱から [${RARITIES[wpn.rarity]?.name}] ${wpn.name} と ${goldFound}G を発見！`);

    this.advanceStep();
  }

  resolveEventChoice(choiceId) {
    if (!this.run || this.run.phase !== 'event') return;

    if (choiceId === 'heal_all') {
      for (const hpMp of Object.values(this.run.partyHpMp)) {
        if (hpMp.hp > 0) {
          hpMp.hp = Math.min(hpMp.maxHp, hpMp.hp + Math.round(hpMp.maxHp * 0.5));
          hpMp.mp = Math.min(hpMp.maxMp, hpMp.mp + Math.round(hpMp.maxMp * 0.5));
        }
      }
      this.addLog('⛲ 泉の恵みでパーティのHP・MPが50%回復した！');
    } else if (choiceId === 'buff_atk') {
      this.run.buffs.atkPct += 15;
      this.addLog('🔥 戦いの祈り！ ダンジョン内の攻撃力が +15% 上昇した！');
    } else if (choiceId === 'buff_def') {
      this.run.buffs.defPct += 15;
      this.addLog('🛡️ 守りの祈り！ ダンジョン内の防御力が +15% 上昇した！');
    } else if (choiceId === 'blood') {
      for (const hpMp of Object.values(this.run.partyHpMp)) {
        if (hpMp.hp > 1) hpMp.hp = Math.max(1, Math.round(hpMp.hp * 0.8));
      }
      this.run.buffs.atkPct += 20;
      this.run.buffs.dropPct += 20;
      this.addLog('🩸 祭壇に血を捧げた！ HP-20%の代償に攻撃+20%＆ドロップ+20%を得た！');
    } else if (choiceId === 'pray') {
      for (const hpMp of Object.values(this.run.partyHpMp)) {
        if (hpMp.hp > 0) hpMp.mp = Math.min(hpMp.maxMp, hpMp.mp + Math.round(hpMp.maxMp * 0.2));
      }
      this.addLog('✨ 静かな祈りでMPが20%回復した。');
    } else if (choiceId === 'open') {
      const hasThief = this.hasThiefInParty();
      if (!hasThief && Math.random() < 0.45) {
        for (const hpMp of Object.values(this.run.partyHpMp)) {
          if (hpMp.hp > 1) hpMp.hp = Math.max(1, Math.round(hpMp.hp * 0.75));
        }
        this.addLog('💥 遺物箱の呪いでHPが25%減少した…');
      } else {
        const dungeon = this.getDungeonDef();
        const pool = dungeon?.exclusiveLootIds || ['steel_sword'];
        const tplId = pool[Math.floor(Math.random() * pool.length)];
        const wpn = generateWeaponInstance(tplId, { rarityBonus: (dungeon?.rarityBonus || 0) + 0.4 });
        this.run.lootBag.weapons.push(wpn);
        this.addLog(`✨ 遺物箱から [${RARITIES[wpn.rarity]?.name}] ${wpn.name} を獲得！`);
      }
    } else if (choiceId === 'careful') {
      this.run.lootBag.gold += 80;
      this.addLog('💰 周囲から 80G を回収して先へ進んだ。');
    } else {
      this.addLog('🚶 何もせず先へ進んだ。');
    }

    this.run.activeEvent = null;
    this.advanceStep();
  }

  startNodeBattle() {
    if (!this.run || this.run.phase !== 'battle_prep') return;
    const dungeon = this.getDungeonDef();
    const party = store.getPartyCharacters();
    const nodeType = this.run.activeNode?.type;

    let encounter = dungeon.normalEncounters[0];
    let rarityBonus = dungeon.rarityBonus || 0;

    if (nodeType === 'boss') {
      encounter = dungeon.bossEncounter;
      rarityBonus += 0.35;
    } else if (nodeType === 'elite') {
      encounter = dungeon.eliteEncounters[Math.floor(Math.random() * dungeon.eliteEncounters.length)];
      rarityBonus += 0.2;
    } else {
      encounter = dungeon.normalEncounters[Math.floor(Math.random() * dungeon.normalEncounters.length)];
    }

    const session = createBattleSession(
      party,
      encounter,
      c => store.getCharacterEquips(c),
      rarityBonus,
      {
        initialAllyHpMp: this.run.partyHpMp,
        partyBuffs: this.run.buffs
      }
    );

    runBattleToEnd(session);
    this.run.lastBattle = session;

    // 戦闘後のHP/MPをダンジョン状態へ反映
    for (const ally of session.allies) {
      if (this.run.partyHpMp[ally.sourceId]) {
        this.run.partyHpMp[ally.sourceId].hp = ally.hp;
        this.run.partyHpMp[ally.sourceId].mp = ally.mp;
      }
    }

    if (session.status === 'victory') {
      const rw = session.rewards;
      this.run.lootBag.gold += rw.gold;
      this.run.lootBag.exp += rw.exp;
      for (const wpn of rw.droppedWeapons || []) {
        this.run.lootBag.weapons.push(wpn);
      }
      for (const itemId of rw.droppedItems || []) {
        this.run.lootBag.items[itemId] = (this.run.lootBag.items[itemId] || 0) + 1;
      }
      if (
        this.run.activeNode?.type === 'boss' &&
        dungeon?.familiarPool?.length > 0
      ) {
        const dropRate =
          (dungeon.familiarDropRate || 0.06) *
          (this.run.floor >= this.run.totalFloors ? 1.5 : 1.0);
        if (Math.random() < dropRate) {
          const tplId =
            dungeon.familiarPool[Math.floor(Math.random() * dungeon.familiarPool.length)];
          const fam = generateFamiliarInstance(tplId);
          this.run.lootBag.weapons.push(fam);
          this.addLog(`🐾 希少な使い魔「${fam.name}」が仲間になりたそうにこちらを見ている！（バッグへ追加）`);
        }
      }
      this.addLog(`⚔️ 勝利！ (未帰還戦利品: +${rw.gold}G / EXP+${rw.exp})`);
      this.run.phase = 'battle_result';
    } else {
      // 全滅時：未帰還アイテムの半分をロストして残りを持ち帰り終了
      this.handleDefeat();
    }
  }

  confirmBattleResult() {
    if (!this.run || this.run.phase !== 'battle_result') return;
    if (this.run.activeNode?.type === 'boss') {
      if (this.run.floor >= this.run.totalFloors) {
        this.run.phase = 'dungeon_clear';
      } else {
        this.run.phase = 'floor_clear';
      }
    } else {
      this.advanceStep();
    }
  }

  advanceStep() {
    this.run.stepIndex += 1;
    this.run.activeNode = null;
    this.run.phase = 'map';
  }

  proceedNextFloor() {
    if (!this.run) return;
    const dungeon = this.getDungeonDef();
    this.run.floor += 1;
    this.run.stepIndex = 0;
    this.run.floorSteps = buildFloorSteps(dungeon);
    this.run.activeNode = null;
    this.run.phase = 'map';
    this.addLog(`⬇️ 第${this.run.floor}階層へ降りた！`);
  }

  retreatWithLoot() {
    if (!this.run) return null;
    const isFullClear = this.run.phase === 'dungeon_clear';
    const dungeon = this.getDungeonDef();
    const bag = this.run.lootBag;
    const rewardObj = {
      gold: bag.gold,
      exp: bag.exp,
      droppedWeapons: bag.weapons,
      droppedItems: Object.entries(bag.items).flatMap(([id, cnt]) => Array(cnt).fill(id))
    };
    const { messages, levelUps } = store.applyBattleRewards(rewardObj);
    let allMsgs = [...messages];
    let allEvents = [...levelUps];

    if (isFullClear) {
      store.recordDungeonClear(dungeon?.id);
      const training = store.applyDungeonTraining(dungeon?.trainingChance ?? 0.05);
      allMsgs.push(...training.messages);
      allEvents.push(...training.trainingEvents);
    }

    this.run = null;
    return { rewardObj, msgs: allMsgs, levelUps: allEvents };
  }

  handleDefeat() {
    if (!this.run) return;
    const bag = this.run.lootBag;
    // 未帰還アイテムの一部（半分）をロスト
    bag.gold = Math.floor(bag.gold * 0.5);
    bag.exp = Math.floor(bag.exp * 0.5);
    bag.weapons = bag.weapons.filter((_, idx) => idx % 2 === 0);
    for (const k of Object.keys(bag.items)) {
      bag.items[k] = Math.floor(bag.items[k] * 0.5);
    }
    this.run.phase = 'defeat';
    this.addLog('💀 全滅してしまった… 未帰還戦利品の一部を失った！');
    store.recordDefeat();
  }

  finishDefeatAndClaimRemaining() {
    return this.retreatWithLoot();
  }
}

export const dungeonCtrl = new DungeonController();
