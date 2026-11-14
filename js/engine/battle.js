import {
  CLASSES,
  PERSONALITIES,
  MONSTERS,
  WEAPON_TYPES,
  ITEMS,
  ELEMENTS,
  STATUS_EFFECTS,
  getClassActiveSkill
} from '../data/masterData.js';
import { calculateCombatStats, getActiveSkillActivationChance } from './stats.js';
import {
  generateWeaponInstance,
  generateArmorInstance,
  generateAccessoryInstance
} from './loot.js';

const BASE_HATE = [40, 30, 20, 10];

function clamp(min, max, val) {
  return Math.max(min, Math.min(max, val));
}

function createUnitFromCharacter(char, index, weaponInstance, options = {}) {
  const combat = calculateCombatStats(char, weaponInstance);
  const buffs = options.partyBuffs || {};
  if (buffs.atkPct) {
    combat.physAtk = Math.round(combat.physAtk * (1 + buffs.atkPct / 100));
    combat.magAtk = Math.round(combat.magAtk * (1 + buffs.atkPct / 100));
  }
  if (buffs.defPct) {
    combat.physDef = Math.round(combat.physDef * (1 + buffs.defPct / 100));
    combat.magDef = Math.round(combat.magDef * (1 + buffs.defPct / 100));
  }
  if (buffs.dropPct) {
    combat.dropRatePct += buffs.dropPct;
  }

  const cls = CLASSES[char.classId] || {};
  const personality = PERSONALITIES[char.personalityId] || {};
  const isFront = index < 2;

  let hate = BASE_HATE[index] ?? 10;
  hate += cls.passives?.hateBonus || 0;
  if (isFront && personality.hateBonus) {
    hate += personality.hateBonus;
  }

  const savedHpMp = options.initialAllyHpMp?.[char.id];
  const hp = savedHpMp ? Math.min(combat.maxHp, Math.max(0, savedHpMp.hp)) : combat.maxHp;
  const mp = savedHpMp ? Math.min(combat.maxMp, Math.max(0, savedHpMp.mp)) : combat.maxMp;

  return {
    uid: `ally_${char.id}`,
    side: 'ally',
    sourceId: char.id,
    name: char.name,
    className: cls.name || '',
    classId: char.classId,
    personalityId: char.personalityId,
    position: index,
    hp,
    maxHp: combat.maxHp,
    mp,
    maxMp: combat.maxMp,
    baseStats: { ...char.baseStats },
    combat,
    passives: cls.passives || {},
    activeSkill: getClassActiveSkill(char.classId),
    hate: Math.max(5, hate),
    element: combat.attackElement || 'none',
    statusResist: 0,
    isBoss: false,
    statuses: {},
    isDefending: false
  };
}

function createUnitFromMonster(monsterId, index, suffix = '') {
  const m = MONSTERS[monsterId];
  const s = m.stats;
  const maxHp = s.hp * 5;
  const maxMp = s.mp * 2;
  const weaponType = WEAPON_TYPES[m.weaponType] || WEAPON_TYPES.sword;

  return {
    uid: `enemy_${monsterId}_${index}`,
    side: 'enemy',
    sourceId: monsterId,
    name: suffix ? `${m.name}${suffix}` : m.name,
    className: `Lv.${m.level}`,
    classId: 'monster',
    personalityId: 'aggressive',
    position: index,
    hp: maxHp,
    maxHp,
    mp: maxMp,
    maxMp,
    baseStats: { ...s },
    combat: {
      maxHp,
      maxMp,
      physAtk: Math.round(s.str * 2.0 + (m.atk || 0)),
      magAtk: Math.round(s.mag * 2.0 + (m.mag || 0)),
      physDef: Math.round(s.def * 1.5),
      magDef: Math.round(s.res * 1.5),
      physDmgReductionPct: 0,
      magDmgReductionPct: 0,
      hitRate: Math.round(78 + s.skl * 1.5 + s.lck * 0.5),
      evaRate: Math.round(s.spd * 1.5 + s.lck * 0.5),
      followUpBonusPct: 0,
      critRateBase: Math.round(s.skl * 1.0 + s.lck * 0.5),
      critDmgPct: 150,
      physPenPct: 0,
      magPenPct: 0,
      healMultiplierPct: 100,
      counterRatePct: 0,
      dropRatePct: 100,
      initiativeBonus: 0,
      lifestealPct: 0,
      weapon: { name: '爪牙', type: m.weaponType, atk: m.atk, mag: m.mag },
      weaponType,
      traitSnipeBackline: false
    },
    passives: {},
    hate: BASE_HATE[index] ?? 10,
    expReward: m.exp,
    goldReward: m.gold,
    drops: m.drops || [],
    element: m.element || 'none',
    statusResist: m.statusResist || 0,
    isBoss: Boolean(m.isBoss),
    statuses: {},
    isDefending: false
  };
}

/**
 * バトルセッション初期化
 */
export function createBattleSession(
  partyChars,
  encounterMonsterIds,
  weaponResolver = () => null,
  areaRarityBonus = 0,
  options = {}
) {
  const allies = partyChars
    .slice(0, 4)
    .map((c, idx) => createUnitFromCharacter(c, idx, weaponResolver(c), options));

  const counts = {};
  for (const id of encounterMonsterIds) {
    counts[id] = (counts[id] || 0) + 1;
  }
  const seen = {};
  const enemies = encounterMonsterIds.slice(0, 4).map((id, idx) => {
    let suffix = '';
    if (counts[id] > 1) {
      seen[id] = (seen[id] || 0) + 1;
      suffix = String.fromCharCode(64 + seen[id]);
    }
    return createUnitFromMonster(id, idx, suffix);
  });

  return {
    round: 0,
    maxRounds: 20,
    areaRarityBonus,
    allies,
    enemies,
    turnQueue: [],
    logs: [{ type: 'system', text: '戦闘開始！' }],
    status: 'ongoing',
    rewards: null
  };
}

function getLivingUnits(units) {
  return units.filter(u => u.hp > 0);
}

function buildTurnQueue(session) {
  const living = [
    ...getLivingUnits(session.allies),
    ...getLivingUnits(session.enemies)
  ];

  const withInitiative = living.map(u => {
    const rand = Math.random() * 4;
    const initBonus = u.combat.initiativeBonus || 0;
    let effectiveSpd = u.baseStats.spd;
    if (u.statuses?.heavy) effectiveSpd *= 0.8;
    if (u.statuses?.freeze_after) effectiveSpd *= 0.85;
    return {
      uid: u.uid,
      init: effectiveSpd + rand + initBonus
    };
  });

  withInitiative.sort((a, b) => b.init - a.init);
  return withInitiative.map(x => x.uid);
}

function getElementMultiplier(atkElemId, defElemId) {
  if (!atkElemId || atkElemId === 'none' || !defElemId || defElemId === 'none') {
    return 1.0;
  }
  const atkElem = ELEMENTS[atkElemId];
  if (!atkElem) return 1.0;

  if (atkElem.tier === 2 && Array.isArray(atkElem.parents)) {
    let strongCount = 0;
    for (const p of atkElem.parents) {
      if (ELEMENTS[p]?.strongAgainst?.includes(defElemId)) {
        strongCount += 1;
      }
    }
    if (strongCount >= 2) return 1.5;
    if (strongCount === 1) return 1.3;
    return 1.0;
  }

  if (atkElem.strongAgainst?.includes(defElemId)) return 1.3;
  if (atkElem.weakAgainst?.includes(defElemId)) return 0.7;
  return 1.0;
}

function applyStatusAilment(session, actor, target, elemId) {
  if (!target || target.hp <= 0 || !elemId || elemId === 'none') return;
  const elem = ELEMENTS[elemId];
  const statusId = elem?.status;
  if (!statusId) return;
  const stDef = STATUS_EFFECTS[statusId];
  if (!stDef) return;

  const baseChance = elem.tier === 2 ? 20 : 15;
  const isDisable = statusId === 'freeze' || statusId === 'shock';
  const bossExtraResist = isDisable && target.isBoss ? 30 : 0;
  const rawChance =
    baseChance +
    actor.baseStats.skl * 0.5 -
    (target.baseStats.lck * 0.5 + (target.statusResist || 0) + bossExtraResist);
  const chance = clamp(0, 90, rawChance);

  if (Math.random() * 100 >= chance) return;

  if (!target.statuses) target.statuses = {};

  if (statusId === 'knockback') {
    const team = target.side === 'ally' ? session.allies : session.enemies;
    const pos = team.indexOf(target);
    let moved = false;
    if (pos !== -1 && pos + 1 < team.length) {
      const next = team[pos + 1];
      team[pos] = next;
      team[pos + 1] = target;
      team.forEach((u, idx) => {
        u.position = idx;
      });
      moved = true;
    }
    target.statuses.knockback = { remaining: stDef.duration };
    session.logs.push({
      type: 'system',
      text: `${target.name}は【${stDef.name}】を受けた！${moved ? ' (後列へノックバック!)' : ''}`
    });
    return;
  }

  if (statusId === 'melt') {
    const prevStacks = target.statuses.melt?.stacks || 0;
    const stacks = Math.min(3, prevStacks + 1);
    target.statuses.melt = { remaining: stDef.duration, stacks };
    session.logs.push({
      type: 'system',
      text: `${target.name}は【${stDef.name}】(x${stacks})になった！`
    });
    return;
  }

  target.statuses[statusId] = { remaining: stDef.duration };
  session.logs.push({
    type: 'system',
    text: `${target.name}は【${stDef.name}】になった！`
  });
}

function processRoundEndStatuses(session) {
  const allUnits = [...session.allies, ...session.enemies];
  for (const u of allUnits) {
    if (u.hp <= 0 || !u.statuses) continue;

    if (u.statuses.burn) {
      const dmg = Math.max(1, Math.round(u.maxHp * 0.05));
      u.hp = Math.max(0, u.hp - dmg);
      session.logs.push({
        type: 'system',
        text: `${u.name}は火傷のダメージ！ ${dmg} ダメージ${u.hp === 0 ? ` → ${u.name}は倒れた！` : ''}`
      });
    }

    if (u.hp > 0 && u.statuses.blaze) {
      const dmg = Math.max(1, Math.round(u.maxHp * 0.08));
      u.hp = Math.max(0, u.hp - dmg);
      session.logs.push({
        type: 'system',
        text: `${u.name}は猛火のダメージ！ ${dmg} ダメージ${u.hp === 0 ? ` → ${u.name}は倒れた！` : ''}`
      });
    }

    for (const [stId, stObj] of Object.entries(u.statuses)) {
      if (stId === 'freeze') continue;
      stObj.remaining -= 1;
      if (stObj.remaining <= 0) {
        delete u.statuses[stId];
      }
    }
  }
}

function pickWeightedTarget(candidates) {
  const total = candidates.reduce((sum, u) => sum + u.hate, 0);
  let r = Math.random() * total;
  for (const u of candidates) {
    r -= u.hate;
    if (r <= 0) return u;
  }
  return candidates[0];
}

function chooseAttackTarget(actor, enemies) {
  const living = getLivingUnits(enemies);
  if (living.length === 0) return null;

  const isBackline = actor.position >= 2;
  const canSnipeBackline =
    (actor.passives?.snipeBackline && isBackline) ||
    actor.combat.traitSnipeBackline;

  if (actor.personalityId === 'cunning') {
    const sorted = [...living].sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp);
    return sorted[0];
  }

  if (canSnipeBackline) {
    const backliners = living.filter(e => e.position >= 2);
    if (backliners.length > 0) {
      return pickWeightedTarget(backliners);
    }
  }

  return pickWeightedTarget(living);
}

function executeSingleAttack(session, actor, target, dmgScale = 1.0, label = '', options = {}) {
  const isActorFront = actor.position < 2;
  const isTargetBack = target.position >= 2;
  const weaponType = actor.combat.weaponType;
  const isMelee = weaponType.range === 'melee';
  const isRanged = weaponType.range === 'ranged';
  const isMagic = options.forceMagic || weaponType.damageType === 'magical';

  let frontRangedMod = 1.0;
  let frontRangedHitMod = 0;
  if (isActorFront && isRanged) {
    frontRangedMod = 0.8;
    frontRangedHitMod = -20;
  }

  const archerBackHitBonus =
    !isActorFront && actor.passives?.backlineHitBonus ? actor.passives.backlineHitBonus : 0;

  const actorStatusHitMod =
    -(actor.statuses?.blind ? 25 : 0) - (actor.statuses?.knockback ? 10 : 0);
  const targetEffectiveEva = Math.max(
    0,
    target.combat.evaRate - (target.statuses?.laceration ? 10 : 0)
  );

  const hitChance = clamp(
    10,
    99,
    actor.combat.hitRate +
      frontRangedHitMod +
      archerBackHitBonus +
      actorStatusHitMod +
      (options.hitBonus || 0) -
      targetEffectiveEva
  );

  if (Math.random() * 100 >= hitChance) {
    session.logs.push({
      type: 'miss',
      text: `${actor.name}の${label}攻撃！ → ${target.name}は素早く回避した！`
    });
    return { hit: false, crit: false, dmg: 0 };
  }

  let rawAtk = isMagic ? actor.combat.magAtk : actor.combat.physAtk;
  if (options.bonusDefScale) {
    rawAtk += Math.round(actor.combat.physDef * options.bonusDefScale);
  }
  if (options.bonusMagScale) {
    rawAtk += Math.round(actor.combat.magAtk * options.bonusMagScale);
  }
  let rawDef = isMagic ? target.combat.magDef : target.combat.physDef;
  if (!isMagic && target.statuses?.melt) {
    rawDef *= Math.max(0.25, 1 - 0.25 * (target.statuses.melt.stacks || 1));
  }
  if (isMagic && target.statuses?.blaze) {
    rawDef *= 0.85;
  }
  let penPct = (isMagic ? actor.combat.magPenPct : actor.combat.physPenPct) + (options.penBonus || 0);
  if (target.statuses?.shock) {
    penPct += 15;
  }
  const effectiveDef = rawDef * (1 - clamp(0, 80, penPct) / 100);

  let baseDmg = Math.max(1, rawAtk - effectiveDef * 0.7);

  if (isMagic && actor.passives?.magicDmgBonusPct) {
    baseDmg *= 1 + actor.passives.magicDmgBonusPct / 100;
  }

  baseDmg *= frontRangedMod;

  if (!isActorFront && isMelee && isTargetBack) {
    baseDmg *= 0.5;
  }

  if (isMelee && isTargetBack) {
    baseDmg *= 0.7;
  }

  if (target.isDefending) {
    baseDmg *= 0.5;
  }

  const dmgRedPct = isMagic
    ? target.combat.magDmgReductionPct
    : target.combat.physDmgReductionPct;
  baseDmg *= 1 - clamp(0, 60, dmgRedPct) / 100;

  baseDmg *= dmgScale;

  let elemMult = getElementMultiplier(actor.element, target.element);
  if (target.statuses?.wet) {
    if (actor.element === 'thunder' || actor.element === 'ice') {
      elemMult *= 1.25;
    } else if (actor.element === 'fire') {
      elemMult *= 0.75;
    }
  }
  baseDmg *= elemMult;

  const critChance = clamp(
    0,
    85,
    actor.combat.critRateBase + (options.critBonus || 0) - target.baseStats.lck
  );
  const isCrit = Math.random() * 100 < critChance;
  if (isCrit) {
    baseDmg *= actor.combat.critDmgPct / 100;
  }

  baseDmg *= 0.92 + Math.random() * 0.16;

  const finalDmg = Math.max(1, Math.round(baseDmg));
  target.hp = Math.max(0, target.hp - finalDmg);

  // 吸血特性・スキル吸収
  let drainText = '';
  const totalDrainPct = (actor.combat.lifestealPct || 0) + (options.drainPct || 0);
  if (totalDrainPct > 0 && actor.hp > 0) {
    const heal = Math.max(1, Math.round((finalDmg * totalDrainPct) / 100));
    const before = actor.hp;
    actor.hp = Math.min(actor.maxHp, actor.hp + heal);
    if (actor.hp > before) {
      drainText = ` (吸血+${actor.hp - before})`;
    }
  }

  const critTag = isCrit ? ' 【会心！】' : '';
  const elemTag =
    elemMult >= 1.45
      ? ' 【複合弱点!】'
      : elemMult >= 1.2
      ? ' (弱点)'
      : elemMult <= 0.8
      ? ' (耐性)'
      : '';
  const defTag = target.isDefending ? ' (防御)' : '';
  const koTag = target.hp === 0 ? ` → ${target.name}は倒れた！` : '';

  session.logs.push({
    type: isCrit ? 'crit' : actor.side === 'ally' ? 'ally-atk' : 'enemy-atk',
    text: `${actor.name}の${label}攻撃！ ${target.name}に ${finalDmg} ダメージ${elemTag}${critTag}${defTag}${drainText}${koTag}`
  });

  if (target.hp > 0 && actor.element && actor.element !== 'none') {
    applyStatusAilment(session, actor, target, actor.element);
  }

  return { hit: true, crit: isCrit, dmg: finalDmg };
}

function finalizeBattle(session, result) {
  session.status = result;
  if (result === 'victory') {
    const expTotal = session.enemies.reduce((sum, e) => sum + (e.expReward || 0), 0);
    const goldTotal = session.enemies.reduce((sum, e) => sum + (e.goldReward || 0), 0);

    const bestDropPct = session.allies.reduce(
      (max, a) => Math.max(max, a.combat.dropRatePct || 100),
      100
    );
    const dropMultiplier = bestDropPct / 100;

    const droppedWeapons = [];
    const droppedItems = [];

    for (const enemy of session.enemies) {
      for (const d of enemy.drops || []) {
        if (Math.random() < d.rate * dropMultiplier) {
          if (d.kind === 'item') {
            droppedItems.push(d.id);
          } else if (d.kind === 'armor') {
            droppedWeapons.push(
              generateArmorInstance(d.id, { rarityBonus: session.areaRarityBonus })
            );
          } else if (d.kind === 'accessory') {
            droppedWeapons.push(
              generateAccessoryInstance(d.id, { rarityBonus: session.areaRarityBonus })
            );
          } else {
            droppedWeapons.push(
              generateWeaponInstance(d.id, { rarityBonus: session.areaRarityBonus })
            );
          }
        }
      }
    }

    session.rewards = {
      exp: expTotal,
      gold: goldTotal,
      droppedWeapons,
      droppedItems
    };

    const dropLabels = [
      ...droppedWeapons.map(w => w.name),
      ...droppedItems.map(id => ITEMS[id]?.name || id)
    ];

    session.logs.push({
      type: 'victory',
      text:
        `勝利！ 経験値 +${expTotal} / ${goldTotal}G を獲得！` +
        (dropLabels.length > 0 ? ` ドロップ: ${dropLabels.join(', ')}` : '')
    });
  } else if (result === 'defeat') {
    session.rewards = { exp: 0, gold: 0, droppedWeapons: [], droppedItems: [] };
    session.logs.push({ type: 'defeat', text: 'パーティは全滅してしまった…' });
  } else {
    session.rewards = { exp: 0, gold: 0, droppedWeapons: [], droppedItems: [] };
    session.logs.push({ type: 'system', text: '長期戦のため引き分けた。' });
  }
}

function tryExecuteActiveSkill(session, actor, friendlyTeam, enemyTeam) {
  const skill = actor.activeSkill;
  if (!skill || actor.mp < skill.mpCost) return false;

  const livingFriends = getLivingUnits(friendlyTeam);
  const livingEnemies = getLivingUnits(enemyTeam);
  if (livingEnemies.length === 0) return false;

  const isHealSkill = skill.type === 'heal' || skill.type === 'aoe_heal';
  const injuredFriends = livingFriends.filter(f => f.hp < f.maxHp * 0.85);
  const statusFriends = livingFriends.filter(f => f.statuses && Object.keys(f.statuses).length > 0);
  if (isHealSkill && injuredFriends.length === 0 && !(skill.cleanseAll && statusFriends.length > 0)) {
    return false;
  }

  const chance = getActiveSkillActivationChance(actor, skill);
  if (Math.random() * 100 >= chance) return false;

  actor.mp -= skill.mpCost;
  session.logs.push({
    type: 'system',
    text: `✨ ${actor.name}のスキル【${skill.name}】発動！（MP-${skill.mpCost}）`
  });

  if (skill.type === 'heal') {
    const target = [...livingFriends].sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
    if (target) {
      let amount = Math.round(Math.max(10, actor.combat.magAtk * skill.power) * (actor.combat.healMultiplierPct / 100));
      if (target.statuses?.laceration) amount = Math.max(1, Math.round(amount * 0.5));
      const before = target.hp;
      target.hp = Math.min(target.maxHp, target.hp + amount);
      let cleanseTxt = '';
      if (skill.cleanseCount && target.statuses) {
        const keys = Object.keys(target.statuses);
        if (keys.length > 0) {
          delete target.statuses[keys[0]];
          cleanseTxt = ' (状態異常を浄化)';
        }
      }
      session.logs.push({
        type: 'heal',
        text: `→ ${target.name}のHPが ${target.hp - before} 回復！${cleanseTxt}`
      });
    }
    return true;
  }

  if (skill.type === 'aoe_heal') {
    for (const f of livingFriends) {
      let amount = Math.round(Math.max(8, actor.combat.magAtk * skill.power) * (actor.combat.healMultiplierPct / 100));
      if (f.statuses?.laceration) amount = Math.max(1, Math.round(amount * 0.5));
      const before = f.hp;
      f.hp = Math.min(f.maxHp, f.hp + amount);
      let cleanseTxt = '';
      if (skill.cleanseAll && f.statuses && Object.keys(f.statuses).length > 0) {
        f.statuses = {};
        cleanseTxt = ' (状態異常全解除)';
      }
      session.logs.push({
        type: 'heal',
        text: `→ ${f.name}のHPが ${f.hp - before} 回復！${cleanseTxt}`
      });
    }
    return true;
  }

  const atkOpts = {
    forceMagic: Boolean(skill.forceMagic),
    bonusDefScale: skill.bonusDefScale || 0,
    bonusMagScale: skill.bonusMagScale || 0,
    hitBonus: skill.hitBonus || 0,
    critBonus: skill.critBonus || 0,
    penBonus: skill.penBonus || 0,
    drainPct: skill.drainPct || 0
  };

  if (skill.type === 'aoe_attack') {
    for (const e of livingEnemies) {
      executeSingleAttack(session, actor, e, skill.power, `${skill.name} `, atkOpts);
    }
    return true;
  }

  const target = chooseAttackTarget(actor, enemyTeam);
  if (!target) return true;

  if (skill.type === 'multi_attack') {
    const hits = skill.hits || 2;
    for (let i = 0; i < hits; i += 1) {
      if (target.hp <= 0) break;
      executeSingleAttack(session, actor, target, skill.power, `${skill.name}(${i + 1}) `, atkOpts);
    }
    return true;
  }

  executeSingleAttack(session, actor, target, skill.power, `${skill.name} `, atkOpts);
  if (skill.selfDefend) {
    actor.isDefending = true;
  }
  if (skill.type === 'attack_and_ally_heal') {
    const healTarget = [...livingFriends].sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
    if (healTarget) {
      let healAmt = Math.round(
        Math.max(8, (actor.combat.magAtk + actor.combat.physAtk * 0.25) * (skill.healScale || 0.6)) *
          (actor.combat.healMultiplierPct / 100)
      );
      if (healTarget.statuses?.laceration) healAmt = Math.max(1, Math.round(healAmt * 0.5));
      const before = healTarget.hp;
      healTarget.hp = Math.min(healTarget.maxHp, healTarget.hp + healAmt);
      session.logs.push({
        type: 'heal',
        text: `→ 聖なる波動で ${healTarget.name}のHPが ${healTarget.hp - before} 回復！`
      });
    }
  }
  return true;
}

export function stepBattle(session) {
  if (session.status !== 'ongoing') return false;

  if (session.turnQueue.length === 0) {
    if (session.round > 0) {
      processRoundEndStatuses(session);
      if (getLivingUnits(session.enemies).length === 0) {
        finalizeBattle(session, 'victory');
        return false;
      }
      if (getLivingUnits(session.allies).length === 0) {
        finalizeBattle(session, 'defeat');
        return false;
      }
    }
    session.round += 1;
    if (session.round > session.maxRounds) {
      finalizeBattle(session, 'draw');
      return false;
    }
    for (const u of [...session.allies, ...session.enemies]) {
      u.isDefending = false;
    }
    session.turnQueue = buildTurnQueue(session);
    session.logs.push({ type: 'round', text: `--- Round ${session.round} ---` });
  }

  let actor = null;
  const allUnits = [...session.allies, ...session.enemies];
  while (session.turnQueue.length > 0 && !actor) {
    const uid = session.turnQueue.shift();
    const candidate = allUnits.find(u => u.uid === uid && u.hp > 0);
    if (candidate) actor = candidate;
  }

  if (!actor) {
    return stepBattle(session);
  }

  if (actor.statuses?.freeze) {
    delete actor.statuses.freeze;
    actor.statuses.freeze_after = { remaining: 1 };
    session.logs.push({
      type: 'system',
      text: `${actor.name}は凍結していて動けない！`
    });
    return true;
  }

  if (actor.statuses?.shock && Math.random() < 0.3) {
    session.logs.push({
      type: 'system',
      text: `${actor.name}は感電して痺れて動けない！`
    });
    return true;
  }

  const friendlyTeam = actor.side === 'ally' ? session.allies : session.enemies;
  const enemyTeam = actor.side === 'ally' ? session.enemies : session.allies;

  const livingFriends = getLivingUnits(friendlyTeam);
  const livingEnemies = getLivingUnits(enemyTeam);

  if (livingEnemies.length === 0) {
    finalizeBattle(session, actor.side === 'ally' ? 'victory' : 'defeat');
    return false;
  }

  const hpRatio = actor.hp / actor.maxHp;
  const isStaffUser = actor.combat.weaponType.isHealing;
  const injuredFriend = [...livingFriends]
    .filter(f => f.hp < f.maxHp * 0.75)
    .sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];

  const wantsHeal =
    actor.mp >= 4 &&
    ((isStaffUser && injuredFriend) ||
      ((actor.personalityId === 'noble' || actor.personalityId === 'calm') &&
        (actor.classId === 'mage' || actor.classId === 'sage' || actor.classId === 'high_priest') &&
        injuredFriend &&
        injuredFriend.hp < injuredFriend.maxHp * 0.55));

  if (tryExecuteActiveSkill(session, actor, friendlyTeam, enemyTeam)) {
    // アクティブスキル発動完了
  } else if (wantsHeal) {
    actor.mp -= 4;
    const baseHeal = Math.max(8, actor.combat.magAtk * 1.1);
    let healAmount = Math.round(baseHeal * (actor.combat.healMultiplierPct / 100));
    const hasLaceration = Boolean(injuredFriend.statuses?.laceration);
    if (hasLaceration) {
      healAmount = Math.max(1, Math.round(healAmount * 0.5));
    }
    const before = injuredFriend.hp;
    injuredFriend.hp = Math.min(injuredFriend.maxHp, injuredFriend.hp + healAmount);
    const actual = injuredFriend.hp - before;
    session.logs.push({
      type: 'heal',
      text: `${actor.name}のヒール！ ${injuredFriend.name}のHPが ${actual} 回復！${hasLaceration ? ' (裂傷で半減)' : ''}`
    });
  } else if (actor.personalityId === 'cautious' && hpRatio <= 0.45 && Math.random() < 0.6) {
    actor.isDefending = true;
    session.logs.push({
      type: 'system',
      text: `${actor.name}は身を固めて防御している！`
    });
  } else {
    const target = chooseAttackTarget(actor, enemyTeam);
    if (target) {
      let label = '';
      let scale = 1.0;
      if (actor.combat.weaponType.damageType === 'magical' && actor.mp >= 3) {
        actor.mp -= 3;
        label = '魔法';
        scale = 1.15;
      }

      executeSingleAttack(session, actor, target, scale, label);

      if (target.hp > 0) {
        const spdDiff = actor.baseStats.spd - target.baseStats.spd;
        const followUpTrigger =
          spdDiff >= 4 || Math.random() * 100 < actor.combat.followUpBonusPct;
        if (followUpTrigger) {
          executeSingleAttack(session, actor, target, 0.7, '追撃');
        }
      }

      if (
        target.hp > 0 &&
        actor.combat.weaponType.range === 'melee' &&
        target.combat.weaponType.range === 'melee' &&
        target.combat.counterRatePct > 0 &&
        Math.random() * 100 < target.combat.counterRatePct
      ) {
        executeSingleAttack(session, target, actor, 0.8, '反撃');
      }
    }
  }

  if (getLivingUnits(session.enemies).length === 0) {
    finalizeBattle(session, 'victory');
    return false;
  }
  if (getLivingUnits(session.allies).length === 0) {
    finalizeBattle(session, 'defeat');
    return false;
  }

  return true;
}

export function runBattleToEnd(session) {
  while (stepBattle(session)) {
    // 決着まで実行
  }
  return session;
}
