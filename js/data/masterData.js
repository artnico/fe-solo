/**
 * Phase 1 & Phase 2 マスターデータ定義
 * SPEC.md および DATA_MASTER.md に準拠
 */

export const STAT_KEYS = [
  'hp', 'mp', 'str', 'mag', 'skl', 'spd', 'lck', 'def', 'res', 'cha'
];

export const STAT_LABELS = {
  hp: 'HP',
  mp: 'MP',
  str: '力',
  mag: '魔力',
  skl: '技',
  spd: '速さ',
  lck: '幸運',
  def: '守備',
  res: '魔防',
  cha: '魅力'
};

// 8. 属性マスターデータ（基礎4属性 ＋ 複合6属性 ＋ 無属性）
export const ELEMENTS = {
  none: { id: 'none', name: '無', fullName: '無属性', tier: 0, color: '#9ca3af', strongAgainst: [], weakAgainst: [], status: null },
  fire: { id: 'fire', name: '火', fullName: '火属性', tier: 1, color: '#ef4444', strongAgainst: ['wind'], weakAgainst: ['water'], status: 'burn' },
  water: { id: 'water', name: '水', fullName: '水属性', tier: 1, color: '#3b82f6', strongAgainst: ['fire'], weakAgainst: ['earth'], status: 'wet' },
  earth: { id: 'earth', name: '土', fullName: '土属性', tier: 1, color: '#a16207', strongAgainst: ['water'], weakAgainst: ['wind'], status: 'heavy' },
  wind: { id: 'wind', name: '風', fullName: '風属性', tier: 1, color: '#22c55e', strongAgainst: ['earth'], weakAgainst: ['fire'], status: 'laceration' },
  thunder: { id: 'thunder', name: '雷', fullName: '雷属性', tier: 2, color: '#eab308', parents: ['water', 'wind'], strongAgainst: ['fire', 'earth'], weakAgainst: [], status: 'shock' },
  ice: { id: 'ice', name: '氷', fullName: '氷属性', tier: 2, color: '#38bdf8', parents: ['water', 'earth'], strongAgainst: ['fire', 'water'], weakAgainst: [], status: 'freeze' },
  lava: { id: 'lava', name: '熔', fullName: '熔属性', tier: 2, color: '#f97316', parents: ['fire', 'earth'], strongAgainst: ['wind', 'water'], weakAgainst: [], status: 'melt' },
  heatwave: { id: 'heatwave', name: '嵐', fullName: '嵐属性', tier: 2, color: '#e11d48', parents: ['fire', 'wind'], strongAgainst: ['wind', 'earth'], weakAgainst: [], status: 'blaze' },
  steam: { id: 'steam', name: '霧', fullName: '霧属性', tier: 2, color: '#cbd5e1', parents: ['fire', 'water'], strongAgainst: ['wind', 'fire'], weakAgainst: [], status: 'blind' },
  sandstorm: { id: 'sandstorm', name: '砂', fullName: '砂属性', tier: 2, color: '#d97706', parents: ['earth', 'wind'], strongAgainst: ['water', 'earth'], weakAgainst: [], status: 'knockback' }
};

export const ELEMENT_COMBINATIONS = {
  'water+wind': 'thunder',
  'wind+water': 'thunder',
  'water+earth': 'ice',
  'earth+water': 'ice',
  'fire+earth': 'lava',
  'earth+fire': 'lava',
  'fire+wind': 'heatwave',
  'wind+fire': 'heatwave',
  'fire+water': 'steam',
  'water+fire': 'steam',
  'earth+wind': 'sandstorm',
  'wind+earth': 'sandstorm'
};

export const STATUS_EFFECTS = {
  burn: { id: 'burn', name: '火傷', baseChance: 15, duration: 3 },
  laceration: { id: 'laceration', name: '裂傷', baseChance: 15, duration: 3 },
  heavy: { id: 'heavy', name: '鈍重', baseChance: 15, duration: 2 },
  wet: { id: 'wet', name: '湿潤', baseChance: 15, duration: 3 },
  shock: { id: 'shock', name: '感電', baseChance: 20, duration: 2, isDisable: true },
  freeze: { id: 'freeze', name: '凍結', baseChance: 20, duration: 1, isDisable: true },
  melt: { id: 'melt', name: '融解', baseChance: 20, duration: 3, stackable: true },
  blaze: { id: 'blaze', name: '猛火', baseChance: 20, duration: 3 },
  blind: { id: 'blind', name: '幻惑', baseChance: 20, duration: 2 },
  knockback: { id: 'knockback', name: '後退', baseChance: 20, duration: 2 }
};

// 2. 種族データ（4種）
export const RACES = {
  human: {
    id: 'human',
    name: '人間',
    description: 'すべてが平均的。魅力と幸運がやや高く扱いやすい万能型。',
    baseStats: { hp: 10, mp: 5, str: 6, mag: 5, skl: 6, spd: 6, lck: 7, def: 5, res: 5, cha: 8 },
    growthRates: { hp: 60, mp: 40, str: 45, mag: 40, skl: 45, spd: 45, lck: 50, def: 40, res: 40, cha: 55 }
  },
  elf: {
    id: 'elf',
    name: 'エルフ',
    description: '魔力・技・速さに優れる。物理耐久（HP・守備）が低い。',
    baseStats: { hp: 8, mp: 8, str: 4, mag: 8, skl: 8, spd: 8, lck: 5, def: 3, res: 7, cha: 7 },
    growthRates: { hp: 45, mp: 60, str: 30, mag: 60, skl: 60, spd: 55, lck: 40, def: 25, res: 55, cha: 50 }
  },
  dwarf: {
    id: 'dwarf',
    name: 'ドワーフ',
    description: 'HP・力・守備が極めて高い前衛向き。速さと魔力は苦手。',
    baseStats: { hp: 13, mp: 3, str: 8, mag: 3, skl: 5, spd: 4, lck: 5, def: 8, res: 4, cha: 4 },
    growthRates: { hp: 75, mp: 25, str: 60, mag: 20, skl: 40, spd: 25, lck: 40, def: 60, res: 35, cha: 30 }
  },
  beastkin: {
    id: 'beastkin',
    name: '獣人',
    description: '速さ・力・幸運が高い物理アタッカー気質。魔防が低い。',
    baseStats: { hp: 11, mp: 4, str: 7, mag: 3, skl: 7, spd: 9, lck: 7, def: 5, res: 3, cha: 5 },
    growthRates: { hp: 65, mp: 30, str: 55, mag: 25, skl: 50, spd: 65, lck: 50, def: 35, res: 20, cha: 35 }
  },
  dragonkin: {
    id: 'dragonkin',
    name: '竜人',
    description: 'HP・力・守備・魔防が高い大器晩成型。速さは控えめ。',
    baseStats: { hp: 14, mp: 5, str: 9, mag: 6, skl: 5, spd: 4, lck: 5, def: 8, res: 7, cha: 6 },
    growthRates: { hp: 80, mp: 35, str: 65, mag: 40, skl: 45, spd: 30, lck: 40, def: 60, res: 55, cha: 45 }
  },
  spirit: {
    id: 'spirit',
    name: '精霊族',
    description: 'MP・魔力・魔防・幸運が極めて高い魔法特化型。物理耐久は低い。',
    baseStats: { hp: 7, mp: 10, str: 3, mag: 10, skl: 7, spd: 7, lck: 8, def: 2, res: 9, cha: 8 },
    growthRates: { hp: 40, mp: 75, str: 20, mag: 70, skl: 55, spd: 55, lck: 60, def: 20, res: 65, cha: 60 }
  }
};

// 3. 性格データ（7種）
export const PERSONALITIES = {
  aggressive: {
    id: 'aggressive',
    name: '好戦的',
    aiDescription: 'HPが減っても防御せず攻撃スキルを優先。前衛に立つとヘイト微増。',
    growthMod: { str: 10, hp: 5, def: -5, res: -5 },
    hateBonus: 10
  },
  cautious: {
    id: 'cautious',
    name: '慎重',
    aiDescription: 'HP50%以下で防御または回復行動を優先。被弾リスクを避ける。',
    growthMod: { def: 10, res: 5, spd: -5, str: -5 },
    hateBonus: 0
  },
  cunning: {
    id: 'cunning',
    name: '狡猾',
    aiDescription: '最もHP割合が低い敵、または後衛の柔らかい敵を優先して狙う。',
    growthMod: { skl: 10, spd: 5, hp: -5, cha: -5 },
    hateBonus: 0
  },
  calm: {
    id: 'calm',
    name: '冷静',
    aiDescription: 'MPを温存しつつ、弱点属性やクリティカル期待値が高い相手を選ぶ。',
    growthMod: { mag: 10, skl: 5, lck: -5, hp: -5 },
    hateBonus: 0
  },
  noble: {
    id: 'noble',
    name: '高潔',
    aiDescription: '味方のHPが減っていると庇う・支援行動を優先。バフ効果微増。',
    growthMod: { cha: 10, lck: 5, skl: -5, mag: -5 },
    hateBonus: 5
  },
  stoic: {
    id: 'stoic',
    name: '求道者',
    aiDescription: '一撃の威力と技の冴えを追求する。防御より攻撃手数を優先。',
    growthMod: { skl: 10, str: 5, cha: -5, lck: -5 },
    hateBonus: 0
  },
  guardian: {
    id: 'guardian',
    name: '守護者',
    aiDescription: '前衛に立つと味方を守るため狙われ率が大きく上昇する。',
    growthMod: { hp: 10, def: 5, spd: -5, mag: -5 },
    hateBonus: 15
  }
};

// 4. 職業データ（Tier 1 〜 Tier 3 分岐ツリー）
export const CLASSES = {
  // ===== Tier 1 =====
  warrior: {
    id: 'warrior', name: '戦士', tier: 1, maxLevel: 10,
    allowedWeapons: ['sword', 'lance', 'axe'],
    allowedArmors: ['heavy_armor', 'light_armor'],
    passiveDescription: '自身の狙われ率(ヘイト)+15%。前衛での耐久に優れる。',
    passives: { hateBonus: 15 },
    statBonus: { hp: 4, mp: 0, str: 2, mag: 0, skl: 1, spd: 0, lck: 0, def: 3, res: 0, cha: 0 },
    growthMod: { hp: 25, mp: 0, str: 15, mag: -10, skl: 5, spd: 5, lck: 5, def: 20, res: 5, cha: 5 },
    nextClasses: ['light_warrior', 'heavy_tank']
  },
  swordsman: {
    id: 'swordsman', name: '剣士', tier: 1, maxLevel: 10,
    allowedWeapons: ['sword', 'katana'],
    allowedArmors: ['light_armor'],
    passiveDescription: 'クリティカル率+10%。技と速さが伸びる一撃・連撃の要。',
    passives: { critBonus: 10 },
    statBonus: { hp: 2, mp: 1, str: 2, mag: 0, skl: 3, spd: 3, lck: 1, def: 0, res: 0, cha: 1 },
    growthMod: { hp: 10, mp: 5, str: 15, mag: -5, skl: 25, spd: 20, lck: 10, def: 0, res: 0, cha: 5 },
    nextClasses: ['samurai', 'dual_blade']
  },
  mage: {
    id: 'mage', name: '魔法使い', tier: 1, maxLevel: 10,
    allowedWeapons: ['tome', 'staff'],
    allowedArmors: ['robe'],
    passiveDescription: '魔法攻撃の与ダメージ+15%。後衛からの火力・回復役。',
    passives: { magicDmgBonusPct: 15 },
    statBonus: { hp: 0, mp: 5, str: 0, mag: 4, skl: 1, spd: 1, lck: 0, def: 0, res: 3, cha: 1 },
    growthMod: { hp: -5, mp: 30, str: -15, mag: 30, skl: 10, spd: 5, lck: 5, def: -10, res: 20, cha: 10 },
    nextClasses: ['elementalist', 'sage']
  },
  archer: {
    id: 'archer', name: '弓使い', tier: 1, maxLevel: 10,
    allowedWeapons: ['bow'],
    allowedArmors: ['light_armor', 'robe'],
    passiveDescription: '後衛(3〜4番目)からの攻撃時、命中+15%・敵後衛を直接狙える。',
    passives: { backlineHitBonus: 15, snipeBackline: true },
    statBonus: { hp: 1, mp: 2, str: 1, mag: 0, skl: 4, spd: 2, lck: 1, def: 0, res: 1, cha: 1 },
    growthMod: { hp: 5, mp: 10, str: 10, mag: -5, skl: 30, spd: 15, lck: 10, def: 0, res: 5, cha: 10 },
    nextClasses: ['sniper', 'ranger']
  },
  thief: {
    id: 'thief', name: '盗賊', tier: 1, maxLevel: 10,
    allowedWeapons: ['dagger', 'bow'],
    allowedArmors: ['light_armor'],
    passiveDescription: '戦闘終了時のドロップ率+15%、先制行動補正。',
    passives: { dropRateBonus: 15, initiativeBonus: 10 },
    statBonus: { hp: 1, mp: 2, str: 1, mag: 0, skl: 2, spd: 4, lck: 3, def: 0, res: 0, cha: 2 },
    growthMod: { hp: 5, mp: 10, str: 5, mag: 0, skl: 15, spd: 30, lck: 25, def: -5, res: 0, cha: 15 },
    nextClasses: ['assassin', 'treasure_hunter']
  },
  cleric: {
    id: 'cleric', name: '僧侶', tier: 1, maxLevel: 10,
    allowedWeapons: ['staff'],
    allowedArmors: ['robe', 'light_armor'],
    passiveDescription: '回復量+20%、被魔法ダメージ軽減に優れる後衛の癒やし手。',
    passives: { healBonusPct: 20 },
    statBonus: { hp: 1, mp: 4, str: 0, mag: 3, skl: 1, spd: 1, lck: 1, def: 0, res: 3, cha: 2 },
    growthMod: { hp: 5, mp: 25, str: -5, mag: 25, skl: 10, spd: 5, lck: 10, def: 0, res: 25, cha: 20 },
    nextClasses: ['priest', 'battle_monk']
  },

  // ===== Tier 2 =====
  light_warrior: {
    id: 'light_warrior', name: '軽戦士', tier: 2, maxLevel: 20,
    allowedWeapons: ['sword', 'lance', 'dagger'],
    passiveDescription: '回避率+10%、ヘイト+10%。素早さで攻撃を捌く回避盾。',
    passives: { evaBonus: 10, hateBonus: 10 },
    promotionBonus: { hp: 2, spd: 3, skl: 2 },
    growthMod: { hp: 20, mp: 5, str: 15, mag: -10, skl: 15, spd: 25, lck: 10, def: 10, res: 5, cha: 5 },
    nextClasses: ['blade_dancer', 'rune_smith']
  },
  heavy_tank: {
    id: 'heavy_tank', name: '重戦車', tier: 2, maxLevel: 20,
    allowedWeapons: ['sword', 'lance', 'axe'],
    passiveDescription: 'ヘイト+25%、反撃率+15%。味方を守る鉄壁の防御反撃盾。',
    passives: { hateBonus: 25, counterBonus: 15 },
    promotionBonus: { hp: 4, def: 3, str: 2 },
    growthMod: { hp: 35, mp: 0, str: 20, mag: -10, skl: 5, spd: -5, lck: 5, def: 30, res: 10, cha: 5 },
    nextClasses: ['fortress_knight', 'dragon_knight', 'rune_smith']
  },
  samurai: {
    id: 'samurai', name: '侍', tier: 2, maxLevel: 20,
    allowedWeapons: ['katana', 'sword'],
    passiveDescription: '会心率+15%、会心ダメージ+20%。一撃必殺の剣豪。',
    passives: { critBonus: 15, critDmgBonus: 20 },
    promotionBonus: { str: 2, skl: 3, spd: 2 },
    growthMod: { hp: 15, mp: 5, str: 25, mag: -5, skl: 30, spd: 20, lck: 10, def: 5, res: 5, cha: 5 },
    nextClasses: ['sword_saint', 'dragon_knight']
  },
  dual_blade: {
    id: 'dual_blade', name: '双剣士', tier: 2, maxLevel: 20,
    allowedWeapons: ['sword', 'dagger'],
    passiveDescription: '追撃発生率+20%、会心率+8%。手数で圧倒する連撃手。',
    passives: { followUpBonus: 20, critBonus: 8 },
    promotionBonus: { spd: 3, str: 2, skl: 2 },
    growthMod: { hp: 10, mp: 5, str: 20, mag: -5, skl: 25, spd: 30, lck: 15, def: 0, res: 0, cha: 5 },
    nextClasses: ['tempest_blade']
  },
  elementalist: {
    id: 'elementalist', name: '元素術師', tier: 2, maxLevel: 20,
    allowedWeapons: ['tome'],
    passiveDescription: '魔法与ダメ+25%、魔法貫通+10%。破壊に特化した魔導師。',
    passives: { magicDmgBonusPct: 25, magPenBonus: 10 },
    promotionBonus: { mag: 3, mp: 2, skl: 2 },
    growthMod: { hp: 0, mp: 30, str: -15, mag: 35, skl: 15, spd: 10, lck: 5, def: -5, res: 20, cha: 10 },
    nextClasses: ['archmage', 'chrono_mage']
  },
  sage: {
    id: 'sage', name: '賢者', tier: 2, maxLevel: 20,
    allowedWeapons: ['tome', 'staff'],
    passiveDescription: '回復量+25%、魔法与ダメ+15%。攻防一体の支援魔導師。',
    passives: { healBonusPct: 25, magicDmgBonusPct: 15 },
    promotionBonus: { mag: 2, res: 3, cha: 2 },
    growthMod: { hp: 5, mp: 35, str: -15, mag: 30, skl: 10, spd: 10, lck: 10, def: 0, res: 25, cha: 20 },
    nextClasses: ['high_priest', 'chrono_mage']
  },
  sniper: {
    id: 'sniper', name: '狙撃手', tier: 2, maxLevel: 20,
    allowedWeapons: ['bow'],
    passiveDescription: '後衛命中+20%、会心+10%、敵後衛を直接狙える。',
    passives: { backlineHitBonus: 20, critBonus: 10, snipeBackline: true },
    promotionBonus: { skl: 3, str: 2, spd: 1 },
    growthMod: { hp: 5, mp: 10, str: 15, mag: -5, skl: 35, spd: 15, lck: 15, def: 0, res: 5, cha: 10 },
    nextClasses: ['deadeye']
  },
  ranger: {
    id: 'ranger', name: '遊撃手', tier: 2, maxLevel: 20,
    allowedWeapons: ['bow', 'dagger'],
    passiveDescription: '先制+10、ドロップ率+10%、後衛命中+15%。機動力に優れる。',
    passives: { initiativeBonus: 10, dropRateBonus: 10, backlineHitBonus: 15, snipeBackline: true },
    promotionBonus: { spd: 3, skl: 2, cha: 2 },
    growthMod: { hp: 10, mp: 15, str: 15, mag: 0, skl: 25, spd: 25, lck: 15, def: 5, res: 10, cha: 15 },
    nextClasses: ['phantom_strider']
  },
  assassin: {
    id: 'assassin', name: '暗殺者', tier: 2, maxLevel: 20,
    allowedWeapons: ['dagger', 'katana'],
    passiveDescription: '会心率+15%、回避+10%、先制+10。急所を突く影の刃。',
    passives: { critBonus: 15, evaBonus: 10, initiativeBonus: 10 },
    promotionBonus: { spd: 3, skl: 3, str: 1 },
    growthMod: { hp: 5, mp: 10, str: 15, mag: 0, skl: 25, spd: 35, lck: 20, def: -5, res: 5, cha: 5 },
    nextClasses: ['shadow_master']
  },
  treasure_hunter: {
    id: 'treasure_hunter', name: 'トレジャーハンター', tier: 2, maxLevel: 20,
    allowedWeapons: ['dagger', 'bow'],
    passiveDescription: 'ドロップ率+30%、先制+15。財宝を引き寄せる探索の専門家。',
    passives: { dropRateBonus: 30, initiativeBonus: 15 },
    promotionBonus: { lck: 4, spd: 2, cha: 2 },
    growthMod: { hp: 10, mp: 15, str: 10, mag: 0, skl: 20, spd: 30, lck: 35, def: 0, res: 5, cha: 20 },
    nextClasses: ['grand_seeker']
  },
  priest: {
    id: 'priest', name: '司祭', tier: 2, maxLevel: 20,
    allowedWeapons: ['staff'],
    allowedArmors: ['robe', 'light_armor'],
    passiveDescription: '回復量+35%、ヘイト-10%。純粋な癒やしに特化した神官。',
    passives: { healBonusPct: 35, hateBonus: -10 },
    promotionBonus: { mag: 3, mp: 3, res: 2 },
    growthMod: { hp: 5, mp: 35, str: -10, mag: 30, skl: 10, spd: 5, lck: 15, def: 0, res: 30, cha: 25 },
    nextClasses: ['bishop']
  },
  battle_monk: {
    id: 'battle_monk', name: 'バトルモンク', tier: 2, maxLevel: 20,
    allowedWeapons: ['staff', 'sword', 'dagger', 'lance'],
    allowedArmors: ['light_armor', 'robe'],
    passiveDescription: '反撃率+10%、回復量+15%。拳と杖を振るう前衛武闘僧。',
    passives: { counterBonus: 10, healBonusPct: 15 },
    promotionBonus: { hp: 3, str: 3, mag: 1 },
    growthMod: { hp: 25, mp: 15, str: 25, mag: 15, skl: 15, spd: 15, lck: 10, def: 15, res: 15, cha: 10 },
    nextClasses: ['templar']
  },

  // ===== Tier 3（転職の証が必要） =====
  blade_dancer: {
    id: 'blade_dancer', name: '剣舞士', tier: 3, maxLevel: 30, requiresCrest: true,
    allowedWeapons: ['sword', 'lance', 'dagger', 'katana'],
    passiveDescription: '回避+15%、追撃+15%、ヘイト+15%。舞うように敵を翻弄する。',
    passives: { evaBonus: 15, followUpBonus: 15, hateBonus: 15 },
    promotionBonus: { hp: 3, spd: 4, skl: 3 },
    growthMod: { hp: 25, mp: 10, str: 20, mag: 0, skl: 25, spd: 35, lck: 15, def: 10, res: 10, cha: 10 },
    nextClasses: ['tempest_dancer']
  },
  fortress_knight: {
    id: 'fortress_knight', name: '要塞騎士', tier: 3, maxLevel: 30, requiresCrest: true,
    allowedWeapons: ['sword', 'lance', 'axe'],
    passiveDescription: 'ヘイト+35%、反撃率+25%。あらゆる攻撃を跳ね返す城塞。',
    passives: { hateBonus: 35, counterBonus: 25 },
    promotionBonus: { hp: 6, def: 4, res: 2 },
    growthMod: { hp: 40, mp: 5, str: 25, mag: -5, skl: 10, spd: 0, lck: 10, def: 35, res: 15, cha: 10 },
    nextClasses: ['aegis_warden']
  },
  sword_saint: {
    id: 'sword_saint', name: '剣聖', tier: 3, maxLevel: 30, requiresCrest: true,
    allowedWeapons: ['katana', 'sword'],
    passiveDescription: '会心率+20%、会心ダメ+35%、物理貫通+10%。極致に達した剣技。',
    passives: { critBonus: 20, critDmgBonus: 35, physPenBonus: 10 },
    promotionBonus: { str: 3, skl: 4, spd: 3 },
    growthMod: { hp: 20, mp: 10, str: 30, mag: 0, skl: 35, spd: 25, lck: 15, def: 10, res: 10, cha: 10 },
    nextClasses: ['kensei_master']
  },
  tempest_blade: {
    id: 'tempest_blade', name: '疾風剣士', tier: 3, maxLevel: 30, requiresCrest: true,
    allowedWeapons: ['sword', 'dagger', 'katana'],
    passiveDescription: '追撃発生率+35%、先制+15、会心+12%。嵐の如き連続斬撃。',
    passives: { followUpBonus: 35, initiativeBonus: 15, critBonus: 12 },
    promotionBonus: { spd: 4, str: 3, skl: 3 },
    growthMod: { hp: 15, mp: 10, str: 25, mag: 0, skl: 30, spd: 35, lck: 20, def: 5, res: 5, cha: 10 },
    nextClasses: ['gale_sovereign']
  },
  archmage: {
    id: 'archmage', name: '大魔導士', tier: 3, maxLevel: 30, requiresCrest: true,
    allowedWeapons: ['tome', 'staff'],
    passiveDescription: '魔法与ダメ+35%、魔法貫通+20%。深淵の魔力を操る。',
    passives: { magicDmgBonusPct: 35, magPenBonus: 20 },
    promotionBonus: { mag: 5, mp: 4, skl: 2 },
    growthMod: { hp: 5, mp: 35, str: -10, mag: 40, skl: 20, spd: 15, lck: 10, def: 0, res: 25, cha: 15 },
    nextClasses: ['void_archmage']
  },
  high_priest: {
    id: 'high_priest', name: '大賢者', tier: 3, maxLevel: 30, requiresCrest: true,
    allowedWeapons: ['tome', 'staff'],
    passiveDescription: '回復量+40%、魔法与ダメ+25%。パーティの不沈を支える聖者。',
    passives: { healBonusPct: 40, magicDmgBonusPct: 25 },
    promotionBonus: { mag: 3, res: 4, cha: 3 },
    growthMod: { hp: 10, mp: 40, str: -10, mag: 35, skl: 15, spd: 15, lck: 15, def: 5, res: 30, cha: 25 },
    nextClasses: ['oracle']
  },
  deadeye: {
    id: 'deadeye', name: '魔弾の射手', tier: 3, maxLevel: 30, requiresCrest: true,
    allowedWeapons: ['bow'],
    passiveDescription: '後衛命中+25%、会心+15%、会心ダメ+25%、敵後衛直接狙い。',
    passives: { backlineHitBonus: 25, critBonus: 15, critDmgBonus: 25, snipeBackline: true },
    promotionBonus: { skl: 4, str: 3, spd: 2 },
    growthMod: { hp: 10, mp: 15, str: 20, mag: 0, skl: 40, spd: 20, lck: 20, def: 5, res: 10, cha: 10 },
    nextClasses: ['starfall_sniper']
  },
  phantom_strider: {
    id: 'phantom_strider', name: '幻影遊撃士', tier: 3, maxLevel: 30, requiresCrest: true,
    allowedWeapons: ['bow', 'dagger'],
    passiveDescription: '先制+20、回避+12%、ドロップ+15%、敵後衛直接狙い。',
    passives: { initiativeBonus: 20, evaBonus: 12, dropRateBonus: 15, backlineHitBonus: 20, snipeBackline: true },
    promotionBonus: { spd: 4, skl: 3, lck: 3 },
    growthMod: { hp: 15, mp: 15, str: 20, mag: 5, skl: 30, spd: 30, lck: 20, def: 10, res: 15, cha: 20 },
    nextClasses: ['mirage_lord']
  },
  shadow_master: {
    id: 'shadow_master', name: '影の達人', tier: 3, maxLevel: 30, requiresCrest: true,
    allowedWeapons: ['dagger', 'katana'],
    passiveDescription: '会心+20%、回避+15%、物理貫通+15%、先制+15。',
    passives: { critBonus: 20, evaBonus: 15, physPenBonus: 15, initiativeBonus: 15 },
    promotionBonus: { spd: 4, skl: 4, str: 2 },
    growthMod: { hp: 10, mp: 15, str: 20, mag: 0, skl: 30, spd: 40, lck: 25, def: 0, res: 10, cha: 10 },
    nextClasses: ['nightmare_blade']
  },
  grand_seeker: {
    id: 'grand_seeker', name: '大探索家', tier: 3, maxLevel: 30, requiresCrest: true,
    allowedWeapons: ['dagger', 'bow'],
    passiveDescription: 'ドロップ率+50%、先制+20。あらゆる秘宝を暴く伝説の探索者。',
    passives: { dropRateBonus: 50, initiativeBonus: 20 },
    promotionBonus: { lck: 5, spd: 3, cha: 3 },
    growthMod: { hp: 15, mp: 20, str: 15, mag: 5, skl: 25, spd: 35, lck: 40, def: 5, res: 10, cha: 25 },
    nextClasses: ['relic_monarch']
  },
  bishop: {
    id: 'bishop', name: '司教', tier: 3, maxLevel: 30, requiresCrest: true,
    allowedWeapons: ['staff'],
    allowedArmors: ['robe', 'light_armor'],
    passiveDescription: '回復量+50%、ヘイト-15%。神聖な祈りで仲間を癒やす高僧。',
    passives: { healBonusPct: 50, hateBonus: -15 },
    promotionBonus: { mag: 4, res: 4, cha: 3 },
    growthMod: { hp: 10, mp: 40, str: -10, mag: 35, skl: 15, spd: 10, lck: 15, def: 5, res: 35, cha: 30 },
    nextClasses: ['cardinal']
  },
  templar: {
    id: 'templar', name: 'テンプラー', tier: 3, maxLevel: 30, requiresCrest: true,
    allowedWeapons: ['staff', 'sword', 'lance', 'axe'],
    allowedArmors: ['heavy_armor', 'light_armor', 'robe'],
    passiveDescription: '反撃率+20%、被物理-10%、回復量+20%。聖なる闘気を纏う守護僧。',
    passives: { counterBonus: 20, physDmgRedBonus: 10, healBonusPct: 20 },
    promotionBonus: { hp: 4, str: 4, def: 3 },
    growthMod: { hp: 30, mp: 20, str: 30, mag: 20, skl: 20, spd: 15, lck: 10, def: 20, res: 20, cha: 15 },
    nextClasses: ['sacred_brawler']
  },

  // ===== Tier 4（転職の証が必要・上限Lv.40） =====
  tempest_dancer: {
    id: 'tempest_dancer', name: '嵐舞の騎士', tier: 4, maxLevel: 40, requiresCrest: true,
    allowedWeapons: ['sword', 'lance', 'dagger', 'katana'],
    passiveDescription: '回避+20%、追撃+25%、ヘイト+18%。嵐の如く舞う前衛。',
    passives: { evaBonus: 20, followUpBonus: 25, hateBonus: 18 },
    promotionBonus: { hp: 4, spd: 5, skl: 4 },
    growthMod: { hp: 30, mp: 10, str: 25, mag: 5, skl: 30, spd: 40, lck: 20, def: 15, res: 15, cha: 15 },
    nextClasses: ['celestial_blade']
  },
  aegis_warden: {
    id: 'aegis_warden', name: 'イージスの守護者', tier: 4, maxLevel: 40, requiresCrest: true,
    allowedWeapons: ['sword', 'lance', 'axe'],
    passiveDescription: 'ヘイト+45%、反撃率+35%。神盾の名を冠する不動の盾。',
    passives: { hateBonus: 45, counterBonus: 35 },
    promotionBonus: { hp: 8, def: 5, res: 4 },
    growthMod: { hp: 45, mp: 5, str: 30, mag: 0, skl: 15, spd: 5, lck: 10, def: 40, res: 20, cha: 15 },
    nextClasses: ['immortal_bastion']
  },
  kensei_master: {
    id: 'kensei_master', name: '無双剣聖', tier: 4, maxLevel: 40, requiresCrest: true,
    allowedWeapons: ['katana', 'sword'],
    passiveDescription: '会心率+25%、会心ダメ+50%、物理貫通+15%。',
    passives: { critBonus: 25, critDmgBonus: 50, physPenBonus: 15 },
    promotionBonus: { str: 4, skl: 5, spd: 4 },
    growthMod: { hp: 25, mp: 10, str: 35, mag: 0, skl: 40, spd: 30, lck: 20, def: 10, res: 10, cha: 15 },
    nextClasses: ['transcendent_blade']
  },
  gale_sovereign: {
    id: 'gale_sovereign', name: '疾風王', tier: 4, maxLevel: 40, requiresCrest: true,
    allowedWeapons: ['sword', 'dagger', 'katana'],
    passiveDescription: '追撃+45%、先制+20、会心+16%。',
    passives: { followUpBonus: 45, initiativeBonus: 20, critBonus: 16 },
    promotionBonus: { spd: 5, str: 4, skl: 4 },
    growthMod: { hp: 20, mp: 10, str: 30, mag: 0, skl: 35, spd: 40, lck: 25, def: 10, res: 10, cha: 15 },
    nextClasses: ['flash_incarnate']
  },
  void_archmage: {
    id: 'void_archmage', name: '虚空の大魔導', tier: 4, maxLevel: 40, requiresCrest: true,
    allowedWeapons: ['tome', 'staff'],
    passiveDescription: '魔法与ダメ+45%、魔法貫通+30%。虚空より魔力を引き出す。',
    passives: { magicDmgBonusPct: 45, magPenBonus: 30 },
    promotionBonus: { mag: 6, mp: 5, skl: 3 },
    growthMod: { hp: 10, mp: 40, str: -5, mag: 45, skl: 25, spd: 20, lck: 15, def: 5, res: 30, cha: 15 },
    nextClasses: ['astral_sovereign']
  },
  oracle: {
    id: 'oracle', name: '神託の大賢者', tier: 4, maxLevel: 40, requiresCrest: true,
    allowedWeapons: ['tome', 'staff'],
    passiveDescription: '回復量+55%、魔法与ダメ+35%。神託を授ける聖導者。',
    passives: { healBonusPct: 55, magicDmgBonusPct: 35 },
    promotionBonus: { mag: 4, res: 5, cha: 5 },
    growthMod: { hp: 15, mp: 45, str: -5, mag: 40, skl: 20, spd: 20, lck: 20, def: 10, res: 35, cha: 30 },
    nextClasses: ['seraphic_sage']
  },
  starfall_sniper: {
    id: 'starfall_sniper', name: '星落の狙撃王', tier: 4, maxLevel: 40, requiresCrest: true,
    allowedWeapons: ['bow'],
    passiveDescription: '後衛命中+30%、会心+20%、会心ダメ+35%、敵後衛直接狙い。',
    passives: { backlineHitBonus: 30, critBonus: 20, critDmgBonus: 35, snipeBackline: true },
    promotionBonus: { skl: 5, str: 4, spd: 3 },
    growthMod: { hp: 15, mp: 15, str: 25, mag: 0, skl: 45, spd: 25, lck: 25, def: 5, res: 15, cha: 15 },
    nextClasses: ['divine_archer']
  },
  mirage_lord: {
    id: 'mirage_lord', name: '蜃気楼の覇者', tier: 4, maxLevel: 40, requiresCrest: true,
    allowedWeapons: ['bow', 'dagger'],
    passiveDescription: '先制+25、回避+16%、ドロップ+20%、敵後衛直接狙い。',
    passives: { initiativeBonus: 25, evaBonus: 16, dropRateBonus: 20, backlineHitBonus: 25, snipeBackline: true },
    promotionBonus: { spd: 5, skl: 4, lck: 4 },
    growthMod: { hp: 20, mp: 20, str: 25, mag: 5, skl: 35, spd: 35, lck: 25, def: 10, res: 20, cha: 25 },
    nextClasses: ['horizon_walker']
  },
  nightmare_blade: {
    id: 'nightmare_blade', name: '夜魔の暗殺王', tier: 4, maxLevel: 40, requiresCrest: true,
    allowedWeapons: ['dagger', 'katana'],
    passiveDescription: '会心+25%、回避+20%、物理貫通+20%、先制+20。',
    passives: { critBonus: 25, evaBonus: 20, physPenBonus: 20, initiativeBonus: 20 },
    promotionBonus: { spd: 5, skl: 5, str: 3 },
    growthMod: { hp: 15, mp: 15, str: 25, mag: 0, skl: 35, spd: 45, lck: 30, def: 5, res: 15, cha: 15 },
    nextClasses: ['abyss_reaper']
  },
  relic_monarch: {
    id: 'relic_monarch', name: '秘宝王', tier: 4, maxLevel: 40, requiresCrest: true,
    allowedWeapons: ['dagger', 'bow'],
    passiveDescription: 'ドロップ率+75%、先制+25。世界すべての宝を統べる者。',
    passives: { dropRateBonus: 75, initiativeBonus: 25 },
    promotionBonus: { lck: 6, spd: 4, cha: 4 },
    growthMod: { hp: 20, mp: 20, str: 20, mag: 10, skl: 30, spd: 40, lck: 45, def: 10, res: 15, cha: 30 },
    nextClasses: ['mythic_explorer']
  },
  cardinal: {
    id: 'cardinal', name: '枢機卿', tier: 4, maxLevel: 40, requiresCrest: true,
    allowedWeapons: ['staff'],
    allowedArmors: ['robe', 'light_armor'],
    passiveDescription: '回復量+70%、被魔法-15%、ヘイト-20%。大聖堂を統べる最高位聖職者。',
    passives: { healBonusPct: 70, magDmgRedBonus: 15, hateBonus: -20 },
    promotionBonus: { mag: 5, res: 5, cha: 4 },
    growthMod: { hp: 15, mp: 45, str: -10, mag: 40, skl: 15, spd: 15, lck: 20, def: 10, res: 40, cha: 35 },
    nextClasses: ['saint']
  },
  sacred_brawler: {
    id: 'sacred_brawler', name: '聖拳士', tier: 4, maxLevel: 40, requiresCrest: true,
    allowedWeapons: ['staff', 'sword', 'lance', 'axe'],
    allowedArmors: ['heavy_armor', 'light_armor', 'robe'],
    passiveDescription: '反撃率+25%、追撃+15%、回復量+25%。邪を砕く聖なる拳。',
    passives: { counterBonus: 25, followUpBonus: 15, healBonusPct: 25 },
    promotionBonus: { hp: 5, str: 5, mag: 3, spd: 3 },
    growthMod: { hp: 35, mp: 25, str: 35, mag: 25, skl: 25, spd: 20, lck: 15, def: 25, res: 25, cha: 20 },
    nextClasses: ['enlightened_one']
  },

  // ===== Tier 5（英雄の証が必要・上限Lv.50・最終職） =====
  celestial_blade: {
    id: 'celestial_blade', name: '天舞の剣姫', tier: 5, maxLevel: 50, requiresHeroCrest: true,
    allowedWeapons: ['sword', 'lance', 'dagger', 'katana'],
    passiveDescription: '回避+28%、追撃+35%、ヘイト+22%。天界の舞で敵を討つ。',
    passives: { evaBonus: 28, followUpBonus: 35, hateBonus: 22 },
    promotionBonus: { hp: 6, spd: 6, skl: 5, str: 4 },
    growthMod: { hp: 35, mp: 15, str: 30, mag: 10, skl: 35, spd: 45, lck: 25, def: 20, res: 20, cha: 20 },
    nextClasses: []
  },
  immortal_bastion: {
    id: 'immortal_bastion', name: '不滅の城塞', tier: 5, maxLevel: 50, requiresHeroCrest: true,
    allowedWeapons: ['sword', 'lance', 'axe'],
    passiveDescription: 'ヘイト+55%、反撃率+45%。いかなる災厄も通さぬ究極の盾。',
    passives: { hateBonus: 55, counterBonus: 45 },
    promotionBonus: { hp: 10, def: 7, res: 6, str: 3 },
    growthMod: { hp: 50, mp: 10, str: 35, mag: 5, skl: 20, spd: 10, lck: 15, def: 45, res: 25, cha: 20 },
    nextClasses: []
  },
  transcendent_blade: {
    id: 'transcendent_blade', name: '剣神', tier: 5, maxLevel: 50, requiresHeroCrest: true,
    allowedWeapons: ['katana', 'sword'],
    passiveDescription: '会心率+32%、会心ダメ+70%、物理貫通+25%。神域の剣。',
    passives: { critBonus: 32, critDmgBonus: 70, physPenBonus: 25 },
    promotionBonus: { str: 6, skl: 6, spd: 5 },
    growthMod: { hp: 30, mp: 15, str: 40, mag: 5, skl: 45, spd: 35, lck: 25, def: 15, res: 15, cha: 20 },
    nextClasses: []
  },
  flash_incarnate: {
    id: 'flash_incarnate', name: '閃光の化身', tier: 5, maxLevel: 50, requiresHeroCrest: true,
    allowedWeapons: ['sword', 'dagger', 'katana'],
    passiveDescription: '追撃+60%、先制+30、会心+22%。光速の連撃。',
    passives: { followUpBonus: 60, initiativeBonus: 30, critBonus: 22 },
    promotionBonus: { spd: 7, str: 5, skl: 5 },
    growthMod: { hp: 25, mp: 15, str: 35, mag: 5, skl: 40, spd: 50, lck: 30, def: 15, res: 15, cha: 20 },
    nextClasses: []
  },
  astral_sovereign: {
    id: 'astral_sovereign', name: '星辰の支配者', tier: 5, maxLevel: 50, requiresHeroCrest: true,
    allowedWeapons: ['tome', 'staff'],
    passiveDescription: '魔法与ダメ+60%、魔法貫通+40%。星々の魔力を統べる者。',
    passives: { magicDmgBonusPct: 60, magPenBonus: 40 },
    promotionBonus: { mag: 8, mp: 7, skl: 4 },
    growthMod: { hp: 15, mp: 45, str: 0, mag: 50, skl: 30, spd: 25, lck: 20, def: 10, res: 35, cha: 20 },
    nextClasses: []
  },
  seraphic_sage: {
    id: 'seraphic_sage', name: '聖天の賢神', tier: 5, maxLevel: 50, requiresHeroCrest: true,
    allowedWeapons: ['tome', 'staff'],
    passiveDescription: '回復量+75%、魔法与ダメ+45%。奇跡を起こす至高の賢者。',
    passives: { healBonusPct: 75, magicDmgBonusPct: 45 },
    promotionBonus: { mag: 6, res: 7, cha: 6 },
    growthMod: { hp: 20, mp: 50, str: 0, mag: 45, skl: 25, spd: 25, lck: 25, def: 15, res: 40, cha: 35 },
    nextClasses: []
  },
  divine_archer: {
    id: 'divine_archer', name: '神弓の超越者', tier: 5, maxLevel: 50, requiresHeroCrest: true,
    allowedWeapons: ['bow'],
    passiveDescription: '後衛命中+40%、会心+28%、会心ダメ+50%、敵後衛直接狙い。',
    passives: { backlineHitBonus: 40, critBonus: 28, critDmgBonus: 50, snipeBackline: true },
    promotionBonus: { skl: 7, str: 5, spd: 4 },
    growthMod: { hp: 20, mp: 20, str: 30, mag: 5, skl: 50, spd: 30, lck: 30, def: 10, res: 20, cha: 20 },
    nextClasses: []
  },
  horizon_walker: {
    id: 'horizon_walker', name: '地平の旅人', tier: 5, maxLevel: 50, requiresHeroCrest: true,
    allowedWeapons: ['bow', 'dagger'],
    passiveDescription: '先制+35、回避+22%、ドロップ+30%、敵後衛直接狙い。',
    passives: { initiativeBonus: 35, evaBonus: 22, dropRateBonus: 30, backlineHitBonus: 30, snipeBackline: true },
    promotionBonus: { spd: 7, skl: 5, lck: 5 },
    growthMod: { hp: 25, mp: 25, str: 30, mag: 10, skl: 40, spd: 40, lck: 30, def: 15, res: 25, cha: 30 },
    nextClasses: []
  },
  abyss_reaper: {
    id: 'abyss_reaper', name: '深淵の死神', tier: 5, maxLevel: 50, requiresHeroCrest: true,
    allowedWeapons: ['dagger', 'katana'],
    passiveDescription: '会心+32%、回避+26%、物理貫通+30%、先制+28。',
    passives: { critBonus: 32, evaBonus: 26, physPenBonus: 30, initiativeBonus: 28 },
    promotionBonus: { spd: 7, skl: 6, str: 5 },
    growthMod: { hp: 20, mp: 20, str: 30, mag: 5, skl: 40, spd: 50, lck: 35, def: 10, res: 20, cha: 20 },
    nextClasses: []
  },
  mythic_explorer: {
    id: 'mythic_explorer', name: '神話の探究者', tier: 5, maxLevel: 50, requiresHeroCrest: true,
    allowedWeapons: ['dagger', 'bow'],
    passiveDescription: 'ドロップ率+100%、先制+35。神話の秘宝すら手中に収める。',
    passives: { dropRateBonus: 100, initiativeBonus: 35 },
    promotionBonus: { lck: 8, spd: 6, cha: 6 },
    growthMod: { hp: 25, mp: 25, str: 25, mag: 15, skl: 35, spd: 45, lck: 50, def: 15, res: 20, cha: 35 },
    nextClasses: []
  },
  saint: {
    id: 'saint', name: '聖者', tier: 5, maxLevel: 50, requiresHeroCrest: true,
    allowedWeapons: ['staff'],
    allowedArmors: ['robe', 'light_armor'],
    passiveDescription: '回復量+100%、被魔法-20%、ヘイト-25%。神域の慈愛で仲間を守る。',
    passives: { healBonusPct: 100, magDmgRedBonus: 20, hateBonus: -25 },
    promotionBonus: { mag: 8, res: 7, cha: 6 },
    growthMod: { hp: 20, mp: 55, str: -5, mag: 50, skl: 20, spd: 20, lck: 25, def: 15, res: 50, cha: 45 },
    nextClasses: []
  },
  enlightened_one: {
    id: 'enlightened_one', name: '悟りし拳聖', tier: 5, maxLevel: 50, requiresHeroCrest: true,
    allowedWeapons: ['staff', 'sword', 'lance', 'axe'],
    allowedArmors: ['heavy_armor', 'light_armor', 'robe'],
    passiveDescription: '反撃率+35%、追撃+20%、物理貫通+15%、回復量+35%。心技体を極めた闘神僧。',
    passives: { counterBonus: 35, followUpBonus: 20, physPenBonus: 15, healBonusPct: 35 },
    promotionBonus: { hp: 8, str: 7, mag: 5, spd: 5 },
    growthMod: { hp: 40, mp: 30, str: 45, mag: 30, skl: 30, spd: 25, lck: 20, def: 30, res: 30, cha: 25 },
    nextClasses: []
  },

  // ===== 隠し職業（クエスト報酬で解放） =====
  dragon_knight: {
    id: 'dragon_knight', name: '竜騎士', tier: 3, maxLevel: 35, requiresCrest: true, hiddenUnlock: true,
    allowedWeapons: ['lance', 'sword', 'katana'],
    allowedArmors: ['heavy_armor', 'light_armor'],
    passiveDescription: '【隠し職】物理貫通+20%、追撃+20%、ヘイト+20%。古竜の力を宿す天空の槍使い。',
    passives: { physPenBonus: 20, followUpBonus: 20, hateBonus: 20 },
    promotionBonus: { hp: 5, str: 5, spd: 4, def: 3 },
    growthMod: { hp: 35, mp: 15, str: 35, mag: 10, skl: 25, spd: 25, lck: 15, def: 20, res: 15, cha: 20 },
    nextClasses: []
  },
  rune_smith: {
    id: 'rune_smith', name: 'ルーン鍛冶師', tier: 3, maxLevel: 35, requiresCrest: true, hiddenUnlock: true,
    allowedWeapons: ['axe', 'sword', 'lance'],
    allowedArmors: ['heavy_armor', 'light_armor'],
    passiveDescription: '【隠し職】被物理-15%、反撃率+20%、ドロップ率+20%。魔導ルーンを刻む剛腕の匠。',
    passives: { physDmgRedBonus: 15, counterBonus: 20, dropRateBonus: 20 },
    promotionBonus: { hp: 5, str: 4, def: 5, lck: 3 },
    growthMod: { hp: 35, mp: 15, str: 30, mag: 20, skl: 20, spd: 10, lck: 25, def: 30, res: 20, cha: 15 },
    nextClasses: []
  },
  chrono_mage: {
    id: 'chrono_mage', name: '時空魔導士', tier: 3, maxLevel: 35, requiresCrest: true, hiddenUnlock: true,
    allowedWeapons: ['tome', 'staff'],
    allowedArmors: ['robe', 'light_armor'],
    passiveDescription: '【隠し職】先制+20、魔法与ダメ+35%、魔法貫通+20%。時空を操る禁断の魔導師。',
    passives: { initiativeBonus: 20, magicDmgBonusPct: 35, magPenBonus: 20 },
    promotionBonus: { mp: 6, mag: 5, spd: 5 },
    growthMod: { hp: 10, mp: 45, str: -5, mag: 40, skl: 20, spd: 30, lck: 20, def: 5, res: 30, cha: 20 },
    nextClasses: []
  }
};

// クラスツリー構造（表示・職歴確認用）
export const CLASS_TREES = [
  {
    rootId: 'warrior',
    name: '戦士系',
    branches: [
      ['warrior', 'light_warrior', 'blade_dancer', 'tempest_dancer', 'celestial_blade'],
      ['warrior', 'heavy_tank', 'fortress_knight', 'aegis_warden', 'immortal_bastion']
    ]
  },
  {
    rootId: 'swordsman',
    name: '剣士系',
    branches: [
      ['swordsman', 'samurai', 'sword_saint', 'kensei_master', 'transcendent_blade'],
      ['swordsman', 'dual_blade', 'tempest_blade', 'gale_sovereign', 'flash_incarnate']
    ]
  },
  {
    rootId: 'mage',
    name: '魔法使い系',
    branches: [
      ['mage', 'elementalist', 'archmage', 'void_archmage', 'astral_sovereign'],
      ['mage', 'sage', 'high_priest', 'oracle', 'seraphic_sage']
    ]
  },
  {
    rootId: 'archer',
    name: '弓使い系',
    branches: [
      ['archer', 'sniper', 'deadeye', 'starfall_sniper', 'divine_archer'],
      ['archer', 'ranger', 'phantom_strider', 'mirage_lord', 'horizon_walker']
    ]
  },
  {
    rootId: 'thief',
    name: '盗賊系',
    branches: [
      ['thief', 'assassin', 'shadow_master', 'nightmare_blade', 'abyss_reaper'],
      ['thief', 'treasure_hunter', 'grand_seeker', 'relic_monarch', 'mythic_explorer']
    ]
  },
  {
    rootId: 'cleric',
    name: '僧侶系',
    branches: [
      ['cleric', 'priest', 'bishop', 'cardinal', 'saint'],
      ['cleric', 'battle_monk', 'templar', 'sacred_brawler', 'enlightened_one']
    ]
  }
];

// アクティブスキルマスター（戦闘中にMP消費＋基礎ステ依存確率で発動）
export const ACTIVE_SKILLS = {
  power_smash: {
    id: 'power_smash', name: 'パワースマッシュ', mpCost: 4,
    type: 'attack', power: 1.45, baseChance: 20, scaleStat: 'str', statFactor: 0.6,
    description: '力を込めた一撃で敵単体に1.45倍のダメージ。'
  },
  mirage_slash: {
    id: 'mirage_slash', name: 'ミラージュスラッシュ', mpCost: 6,
    type: 'attack', power: 1.65, baseChance: 22, scaleStat: 'spd', statFactor: 0.65,
    description: '残像を伴う連撃で敵単体に1.65倍のダメージ。'
  },
  shield_bash: {
    id: 'shield_bash', name: 'シールドバッシュ', mpCost: 5,
    type: 'attack', power: 1.45, bonusDefScale: 0.6, selfDefend: true,
    baseChance: 22, scaleStat: 'def', statFactor: 0.65,
    description: '守備力も上乗せした1.45倍打撃を与え、自身は防御態勢をとる。'
  },
  iaigiri: {
    id: 'iaigiri', name: '居合斬り', mpCost: 4,
    type: 'attack', power: 1.45, critBonus: 20, baseChance: 20, scaleStat: 'skl', statFactor: 0.6,
    description: '会心率+20%で敵単体に1.45倍の鋭い斬撃。'
  },
  hiken_issen: {
    id: 'hiken_issen', name: '秘剣・一閃', mpCost: 7,
    type: 'attack', power: 1.8, critBonus: 30, baseChance: 22, scaleStat: 'skl', statFactor: 0.65,
    description: '会心率+30%で敵単体に1.8倍の必殺剣を放つ。'
  },
  twin_tempest: {
    id: 'twin_tempest', name: '疾風双連撃', mpCost: 6,
    type: 'multi_attack', hits: 2, power: 0.95, baseChance: 22, scaleStat: 'spd', statFactor: 0.65,
    description: '敵単体に0.95倍の連続攻撃を2回叩き込む。'
  },
  magic_burst: {
    id: 'magic_burst', name: 'マジックバースト', mpCost: 5,
    type: 'attack', power: 1.5, forceMagic: true, baseChance: 20, scaleStat: 'mag', statFactor: 0.6,
    description: '魔力を凝縮し敵単体に1.5倍の魔法ダメージ。'
  },
  astral_tempest: {
    id: 'astral_tempest', name: 'アストラル・テンペスト', mpCost: 9,
    type: 'aoe_attack', power: 1.15, forceMagic: true, baseChance: 22, scaleStat: 'mag', statFactor: 0.65,
    description: '敵全体に1.15倍の強烈な魔法攻撃を放つ。'
  },
  starlight_rain: {
    id: 'starlight_rain', name: '星光の慈雨', mpCost: 8,
    type: 'aoe_heal', power: 0.95, baseChance: 24, scaleStat: 'mag', statFactor: 0.65,
    description: '味方全員のHPを魔攻0.95倍基準で回復する。'
  },
  precision_shot: {
    id: 'precision_shot', name: '精密射撃', mpCost: 4,
    type: 'attack', power: 1.4, hitBonus: 35, baseChance: 20, scaleStat: 'skl', statFactor: 0.6,
    description: '命中+35%で敵単体に1.4倍の正確な矢を放つ。'
  },
  piercing_shot: {
    id: 'piercing_shot', name: '魔弾・貫通射', mpCost: 7,
    type: 'attack', power: 1.7, penBonus: 30, baseChance: 22, scaleStat: 'skl', statFactor: 0.65,
    description: '防御貫通+30%で敵単体に1.7倍の貫通射撃。'
  },
  arrow_rain: {
    id: 'arrow_rain', name: 'レインアロー', mpCost: 8,
    type: 'aoe_attack', power: 1.0, baseChance: 22, scaleStat: 'spd', statFactor: 0.65,
    description: '空から矢の雨を降らせ、敵全体に1.0倍の範囲攻撃。'
  },
  vital_strike: {
    id: 'vital_strike', name: '急所突き', mpCost: 4,
    type: 'attack', power: 1.35, critBonus: 25, baseChance: 20, scaleStat: 'lck', statFactor: 0.6,
    description: '会心率+25%で敵の急所を突く1.35倍攻撃。'
  },
  shadow_bind: {
    id: 'shadow_bind', name: '影縫い・絶', mpCost: 7,
    type: 'attack', power: 1.75, critBonus: 30, baseChance: 22, scaleStat: 'spd', statFactor: 0.65,
    description: '影から音もなく急所を穿つ会心+30%・1.75倍の一撃。'
  },
  lucky_steal: {
    id: 'lucky_steal', name: 'ラッキースティール', mpCost: 5,
    type: 'drain_attack', power: 1.35, drainPct: 25, baseChance: 22, scaleStat: 'lck', statFactor: 0.65,
    description: '敵単体に1.35倍ダメージを与え、与ダメの25%HPを吸収。'
  },
  holy_heal: {
    id: 'holy_heal', name: 'ホーリーヒール', mpCost: 4,
    type: 'heal', power: 1.4, cleanseCount: 1, baseChance: 25, scaleStat: 'mag', statFactor: 0.65,
    description: '味方単体を魔攻1.4倍基準で回復し、状態異常を1つ浄化。'
  },
  area_heal: {
    id: 'area_heal', name: 'エリアヒール', mpCost: 7,
    type: 'aoe_heal', power: 1.0, baseChance: 25, scaleStat: 'mag', statFactor: 0.65,
    description: '神聖な光で味方全員を魔攻1.0倍基準で回復する。'
  },
  sacred_cure: {
    id: 'sacred_cure', name: 'セイクリッドキュア', mpCost: 10,
    type: 'aoe_heal', power: 1.2, cleanseAll: true, baseChance: 26, scaleStat: 'cha', statFactor: 0.65,
    description: '味方全員を大回復(1.2倍)し、すべての状態異常を解除する。'
  },
  haja_palm: {
    id: 'haja_palm', name: '破邪掌', mpCost: 5,
    type: 'drain_attack', power: 1.4, bonusMagScale: 0.5, drainPct: 30,
    baseChance: 22, scaleStat: 'str', statFactor: 0.6,
    description: '魔力も乗せた1.4倍の掌底で敵を打ち、与ダメの30%自身を回復。'
  },
  holy_fist: {
    id: 'holy_fist', name: '金剛聖拳', mpCost: 8,
    type: 'attack_and_ally_heal', power: 1.65, bonusMagScale: 0.5, healScale: 0.6,
    baseChance: 24, scaleStat: 'str', statFactor: 0.65,
    description: '1.65倍の聖拳を叩き込み、最も傷ついた味方1人を回復する。'
  },
  dragon_dive: {
    id: 'dragon_dive', name: 'ドラゴンダイブ', mpCost: 8,
    type: 'attack', power: 1.95, penBonus: 25, critBonus: 20,
    baseChance: 25, scaleStat: 'str', statFactor: 0.65,
    description: '蒼穹より急降下し、防御貫通+25%・会心+20%で1.95倍の一撃を放つ。'
  },
  rune_forge_strike: {
    id: 'rune_forge_strike', name: 'ルーンブレイク', mpCost: 7,
    type: 'attack', power: 1.65, bonusDefScale: 0.7, selfDefend: true,
    baseChance: 25, scaleStat: 'def', statFactor: 0.65,
    description: 'ルーンの槌で守備力を乗せた1.65倍撃を放ち、防御態勢をとる。'
  },
  chrono_meteor: {
    id: 'chrono_meteor', name: 'クロノ・メテオ', mpCost: 10,
    type: 'aoe_attack', power: 1.35, forceMagic: true, penBonus: 20,
    baseChance: 25, scaleStat: 'spd', statFactor: 0.65,
    description: '時空の彼方から隕石を呼び寄せ、敵全体に貫通+20%・1.35倍の魔法攻撃。'
  }
};

export function getClassActiveSkill(classId) {
  const map = {
    warrior: 'power_smash',
    light_warrior: 'mirage_slash', blade_dancer: 'mirage_slash', tempest_dancer: 'mirage_slash', celestial_blade: 'mirage_slash',
    heavy_tank: 'shield_bash', fortress_knight: 'shield_bash', aegis_warden: 'shield_bash', immortal_bastion: 'shield_bash',
    swordsman: 'iaigiri',
    samurai: 'hiken_issen', sword_saint: 'hiken_issen', kensei_master: 'hiken_issen', transcendent_blade: 'hiken_issen',
    dual_blade: 'twin_tempest', tempest_blade: 'twin_tempest', gale_sovereign: 'twin_tempest', flash_incarnate: 'twin_tempest',
    mage: 'magic_burst',
    elementalist: 'astral_tempest', archmage: 'astral_tempest', void_archmage: 'astral_tempest', astral_sovereign: 'astral_tempest',
    sage: 'starlight_rain', high_priest: 'starlight_rain', oracle: 'starlight_rain', seraphic_sage: 'starlight_rain',
    archer: 'precision_shot',
    sniper: 'piercing_shot', deadeye: 'piercing_shot', starfall_sniper: 'piercing_shot', divine_archer: 'piercing_shot',
    ranger: 'arrow_rain', phantom_strider: 'arrow_rain', mirage_lord: 'arrow_rain', horizon_walker: 'arrow_rain',
    thief: 'vital_strike',
    assassin: 'shadow_bind', shadow_master: 'shadow_bind', nightmare_blade: 'shadow_bind', abyss_reaper: 'shadow_bind',
    treasure_hunter: 'lucky_steal', grand_seeker: 'lucky_steal', relic_monarch: 'lucky_steal', mythic_explorer: 'lucky_steal',
    cleric: 'holy_heal',
    priest: 'area_heal',
    bishop: 'sacred_cure', cardinal: 'sacred_cure', saint: 'sacred_cure',
    battle_monk: 'haja_palm',
    templar: 'holy_fist', sacred_brawler: 'holy_fist', enlightened_one: 'holy_fist',
    dragon_knight: 'dragon_dive',
    rune_smith: 'rune_forge_strike',
    chrono_mage: 'chrono_meteor'
  };
  const skillId = map[classId];
  return skillId ? ACTIVE_SKILLS[skillId] : null;
}

// 武器種定義
export const WEAPON_TYPES = {
  sword: { id: 'sword', name: '剣', range: 'melee', damageType: 'physical' },
  katana: { id: 'katana', name: '刀', range: 'melee', damageType: 'physical' },
  lance: { id: 'lance', name: '槍', range: 'melee', damageType: 'physical' },
  axe: { id: 'axe', name: '斧', range: 'melee', damageType: 'physical' },
  dagger: { id: 'dagger', name: '短剣', range: 'melee', damageType: 'physical' },
  bow: { id: 'bow', name: '弓', range: 'ranged', damageType: 'physical' },
  tome: { id: 'tome', name: '魔道書', range: 'ranged', damageType: 'magical' },
  staff: { id: 'staff', name: '杖', range: 'ranged', damageType: 'magical', isHealing: true }
};

// 防具種別定義
export const ARMOR_TYPES = {
  heavy_armor: { id: 'heavy_armor', name: '重鎧' },
  light_armor: { id: 'light_armor', name: '軽装' },
  robe: { id: 'robe', name: 'ローブ' }
};

// アクセサリー種別定義
export const ACCESSORY_TYPES = {
  ring: { id: 'ring', name: '指輪' },
  amulet: { id: 'amulet', name: 'お守り' },
  bracelet: { id: 'bracelet', name: '腕輪' }
};

export function getAllowedArmors(classId) {
  const cls = CLASSES[classId];
  if (cls?.allowedArmors) return cls.allowedArmors;
  if (['heavy_tank', 'fortress_knight', 'aegis_warden', 'immortal_bastion'].includes(classId)) {
    return ['heavy_armor', 'light_armor'];
  }
  if (['elementalist', 'archmage', 'void_archmage', 'astral_sovereign'].includes(classId)) {
    return ['robe'];
  }
  if (['sage', 'high_priest', 'oracle', 'seraphic_sage', 'ranger', 'phantom_strider', 'mirage_lord', 'horizon_walker'].includes(classId)) {
    return ['light_armor', 'robe'];
  }
  return ['light_armor'];
}

// レアリティ定義
export const RARITIES = {
  common: { id: 'common', name: 'コモン', short: 'コ', statMult: 1.0, traitCount: 0, sellPrice: 25 },
  uncommon: { id: 'uncommon', name: 'アンコモン', short: 'ア', statMult: 1.15, traitCount: 1, sellPrice: 60 },
  rare: { id: 'rare', name: 'レア', short: 'レ', statMult: 1.3, traitCount: 2, sellPrice: 140 },
  epic: { id: 'epic', name: 'エピック', short: 'エ', statMult: 1.5, traitCount: 3, sellPrice: 320 },
  legendary: { id: 'legendary', name: '伝説', short: '伝', statMult: 1.75, traitCount: 4, sellPrice: 750 },
  mythic: { id: 'mythic', name: '神話', short: 'ミ', statMult: 2.05, traitCount: 4, sellPrice: 1800 }
};

// ランダムエンチャント武器特性マスター
export const WEAPON_TRAITS = {
  sharp: { id: 'sharp', prefix: '鋭利な', label: '[鋭利] 物理貫通+10%', physPen: 10 },
  arcane: { id: 'arcane', prefix: '魔導の', label: '[魔導] 魔法貫通+10%', magPen: 10 },
  vampire: { id: 'vampire', prefix: '吸血の', label: '[吸血] 与ダメの10%HP回復', lifestealPct: 10 },
  snipe: { id: 'snipe', prefix: '狙撃の', label: '[狙撃] 敵後衛を優先攻撃', snipeBackline: true },
  counter: { id: 'counter', prefix: '反撃の', label: '[反撃の構え] 反撃率+15%', counterBonus: 15 },
  greed: { id: 'greed', prefix: '強欲な', label: '[強欲] ドロップ率+10%', dropBonus: 10 },
  deadly: { id: 'deadly', prefix: '必殺の', label: '[必殺] 会心率+8%', critBonus: 8 },
  swift: { id: 'swift', prefix: '俊敏な', label: '[俊敏] 回避+5%/先制+5', evaBonus: 5, initiativeBonus: 5 },
  blessed: { id: 'blessed', prefix: '祝福の', label: '[祝福] 回復量+15%', healBonus: 15 },
  vital: { id: 'vital', prefix: '活力の', label: '[活力] HP+15', hpBonus: 15 },
  mana: { id: 'mana', prefix: '魔泉の', label: '[魔泉] MP+8', mpBonus: 8 },
  sturdy: { id: 'sturdy', prefix: '堅牢な', label: '[堅牢] 物防+4', defBonus: 4 },
  ward: { id: 'ward', prefix: '魔壁の', label: '[魔壁] 魔防+4', resBonus: 4 },
  executioner: { id: 'executioner', prefix: '処刑の', label: '[処刑] 会心ダメ+25%', critDmgBonus: 25 },
  titan: { id: 'titan', prefix: '巨神の', label: '[巨神] HP+25/物防+5', hpBonus: 25, defBonus: 5 },
  astral: { id: 'astral', prefix: '星辰の', label: '[星辰] 魔貫+15%/MP+10', magPen: 15, mpBonus: 10 },
  mirror: { id: 'mirror', prefix: '鏡盾の', label: '[鏡盾] 反撃+20%/魔防+4', counterBonus: 20, resBonus: 4 },
  elem_fire: { id: 'elem_fire', prefix: '灼熱の', label: '[火の加護] 火属性付与', element: 'fire' },
  elem_water: { id: 'elem_water', prefix: '清流の', label: '[水の加護] 水属性付与', element: 'water' },
  elem_earth: { id: 'elem_earth', prefix: '大地の', label: '[土の加護] 土属性付与', element: 'earth' },
  elem_wind: { id: 'elem_wind', prefix: '疾風の', label: '[風の加護] 風属性付与', element: 'wind' }
};

// 防具テンプレートマスター
export const ARMORS = {
  iron_plate: { id: 'iron_plate', name: '鉄の胸当て', type: 'heavy_armor', hp: 12, mp: 0, def: 6, res: 2, eva: -2 },
  steel_armor: { id: 'steel_armor', name: '鋼の重鎧', type: 'heavy_armor', hp: 22, mp: 0, def: 10, res: 4, eva: -3 },
  dragon_mail: { id: 'dragon_mail', name: '竜鱗の重鎧', type: 'heavy_armor', hp: 38, mp: 4, def: 17, res: 10, eva: 0 },
  leather_vest: { id: 'leather_vest', name: '革の鎧', type: 'light_armor', hp: 8, mp: 0, def: 4, res: 3, eva: 3 },
  wind_jerkin: { id: 'wind_jerkin', name: '疾風の軽鎧', type: 'light_armor', hp: 14, mp: 2, def: 7, res: 5, eva: 7 },
  astral_coat: { id: 'astral_coat', name: '星辰の軽衣', type: 'light_armor', hp: 24, mp: 6, def: 12, res: 11, eva: 11 },
  apprentice_robe: { id: 'apprentice_robe', name: '見習いのローブ', type: 'robe', hp: 5, mp: 6, def: 2, res: 6, eva: 2 },
  sage_vestment: { id: 'sage_vestment', name: '賢者の法衣', type: 'robe', hp: 10, mp: 12, def: 4, res: 11, eva: 4 },
  seraph_robe: { id: 'seraph_robe', name: '熾天使の神衣', type: 'robe', hp: 18, mp: 22, def: 8, res: 19, eva: 8 }
};

// アクセサリーテンプレートマスター
export const ACCESSORIES = {
  power_ring: { id: 'power_ring', name: '力の指輪', type: 'ring', hp: 5, mp: 0, atk: 4, mag: 0, crit: 3, eva: 0 },
  crit_ring: { id: 'crit_ring', name: '必殺の指輪', type: 'ring', hp: 0, mp: 0, atk: 2, mag: 0, crit: 8, eva: 0 },
  magic_ring: { id: 'magic_ring', name: '魔力の指輪', type: 'ring', hp: 0, mp: 6, atk: 0, mag: 5, crit: 3, eva: 0 },
  lucky_amulet: { id: 'lucky_amulet', name: '幸運のお守り', type: 'amulet', hp: 8, mp: 4, def: 2, res: 4, dropBonus: 10 },
  ward_amulet: { id: 'ward_amulet', name: '魔除けの護符', type: 'amulet', hp: 10, mp: 6, def: 2, res: 7, dropBonus: 0 },
  swift_bracelet: { id: 'swift_bracelet', name: '俊敏の腕輪', type: 'bracelet', hp: 5, mp: 0, hit: 5, eva: 6, initiativeBonus: 5 },
  hero_bracelet: { id: 'hero_bracelet', name: '勇者の腕輪', type: 'bracelet', hp: 15, mp: 4, atk: 3, mag: 3, hit: 5, eva: 4 },
  eternal_crown: { id: 'eternal_crown', name: '永劫の王冠', type: 'amulet', hp: 28, mp: 14, atk: 6, mag: 6, def: 5, res: 8, dropBonus: 20 }
};

// 武器テンプレートマスター
export const WEAPONS = {
  iron_sword: { id: 'iron_sword', name: '鉄の剣', type: 'sword', atk: 6, mag: 0, hit: 5, crit: 5 },
  bronze_lance: { id: 'bronze_lance', name: '青銅の槍', type: 'lance', atk: 7, mag: 0, hit: 0, crit: 0 },
  hand_axe: { id: 'hand_axe', name: '手斧', type: 'axe', atk: 9, mag: 0, hit: -5, crit: 5 },
  bamboo_katana: { id: 'bamboo_katana', name: '打刀', type: 'katana', atk: 6, mag: 0, hit: 5, crit: 12 },
  short_bow: { id: 'short_bow', name: 'ショートボウ', type: 'bow', atk: 6, mag: 0, hit: 10, crit: 5 },
  fire_tome: { id: 'fire_tome', name: 'ファイアーの書', type: 'tome', element: 'fire', atk: 0, mag: 7, hit: 5, crit: 5 },
  water_tome: { id: 'water_tome', name: 'ウォータの書', type: 'tome', element: 'water', atk: 0, mag: 7, hit: 5, crit: 5 },
  wind_tome: { id: 'wind_tome', name: 'ウィンドの書', type: 'tome', element: 'wind', atk: 0, mag: 7, hit: 5, crit: 5 },
  heal_staff: { id: 'heal_staff', name: '癒しの杖', type: 'staff', atk: 2, mag: 6, hit: 10, crit: 0 },
  iron_dagger: { id: 'iron_dagger', name: '鉄の短剣', type: 'dagger', atk: 4, mag: 0, hit: 10, crit: 10 },

  // 中〜上位武器テンプレート（敵固有ドロップ）
  steel_sword: { id: 'steel_sword', name: '鋼の長剣', type: 'sword', atk: 11, mag: 0, hit: 5, crit: 8 },
  knight_lance: { id: 'knight_lance', name: '騎士の槍', type: 'lance', atk: 13, mag: 0, hit: 5, crit: 5 },
  battle_axe: { id: 'battle_axe', name: '戦斧', type: 'axe', atk: 16, mag: 0, hit: -5, crit: 10 },
  thunder_katana: { id: 'thunder_katana', name: '名刀・雷切', type: 'katana', element: 'thunder', atk: 13, mag: 0, hit: 10, crit: 18 },
  hunter_bow: { id: 'hunter_bow', name: '狩人の長弓', type: 'bow', atk: 11, mag: 0, hit: 15, crit: 10 },
  silver_dagger: { id: 'silver_dagger', name: '銀の短剣', type: 'dagger', atk: 9, mag: 0, hit: 15, crit: 15 },
  arcane_tome: { id: 'arcane_tome', name: '秘術の魔道書', type: 'tome', element: 'water', atk: 0, mag: 13, hit: 10, crit: 8 },
  saint_staff: { id: 'saint_staff', name: '聖女の杖', type: 'staff', atk: 3, mag: 12, hit: 15, crit: 5 },

  // ダンジョン限定・高Tier武器テンプレート（Phase 3〜4）
  goblin_slayer_blade: { id: 'goblin_slayer_blade', name: '妖魔殺しの剛剣', type: 'sword', element: 'fire', atk: 17, mag: 0, hit: 10, crit: 12 },
  soul_reaper_scythe: { id: 'soul_reaper_scythe', name: '魂刈りの大鎌', type: 'lance', element: 'wind', atk: 20, mag: 5, hit: 10, crit: 15 },
  abyssal_grimoire: { id: 'abyssal_grimoire', name: '深淵の魔導書', type: 'tome', element: 'ice', atk: 0, mag: 21, hit: 15, crit: 12 },
  dragon_slayer: { id: 'dragon_slayer', name: '竜殺しの大剣', type: 'sword', element: 'lava', atk: 27, mag: 0, hit: 12, crit: 15 },
  celestial_bow: { id: 'celestial_bow', name: '天穹の聖弓', type: 'bow', element: 'wind', atk: 24, mag: 0, hit: 22, crit: 18 },
  genesis_staff: { id: 'genesis_staff', name: '創世の聖杖', type: 'staff', element: 'water', atk: 5, mag: 26, hit: 20, crit: 10 }
};

// 特殊アイテム（転職の証など）
export const ITEMS = {
  class_crest: {
    id: 'class_crest',
    name: '転職の証',
    description: 'Tier 3〜4 へのクラスチェンジに必要な神秘の紋章。'
  },
  hero_crest: {
    id: 'hero_crest',
    name: '英雄の証',
    description: '最終職（Tier 5）へのクラスチェンジに必要な伝説の紋章。'
  }
};

// モンスター定義（敵固有ドロップテーブル付き）
export const MONSTERS = {
  slime: {
    id: 'slime', name: 'スライム', element: 'water',
    level: 1, exp: 12, gold: 12,
    stats: { hp: 12, mp: 2, str: 7, mag: 3, skl: 5, spd: 5, lck: 3, def: 5, res: 4, cha: 1 },
    weaponType: 'dagger', atk: 5, mag: 0,
    drops: [
      { kind: 'weapon', id: 'iron_dagger', rate: 0.14 },
      { kind: 'weapon', id: 'water_tome', rate: 0.06 },
      { kind: 'weapon', id: 'heal_staff', rate: 0.06 },
      { kind: 'armor', id: 'leather_vest', rate: 0.08 }
    ]
  },
  goblin: {
    id: 'goblin', name: 'ゴブリン', element: 'earth',
    level: 2, exp: 17, gold: 18,
    stats: { hp: 15, mp: 2, str: 10, mag: 2, skl: 7, spd: 7, lck: 4, def: 6, res: 3, cha: 1 },
    weaponType: 'sword', atk: 7, mag: 0,
    drops: [
      { kind: 'weapon', id: 'iron_sword', rate: 0.15 },
      { kind: 'weapon', id: 'steel_sword', rate: 0.06 },
      { kind: 'armor', id: 'iron_plate', rate: 0.08 },
      { kind: 'accessory', id: 'power_ring', rate: 0.05 }
    ]
  },
  goblin_archer: {
    id: 'goblin_archer', name: 'ゴブリン弓兵', element: 'wind',
    level: 2, exp: 18, gold: 20,
    stats: { hp: 12, mp: 3, str: 9, mag: 2, skl: 9, spd: 8, lck: 5, def: 4, res: 4, cha: 1 },
    weaponType: 'bow', atk: 7, mag: 0,
    drops: [
      { kind: 'weapon', id: 'short_bow', rate: 0.14 },
      { kind: 'weapon', id: 'wind_tome', rate: 0.05 },
      { kind: 'weapon', id: 'hunter_bow', rate: 0.05 },
      { kind: 'accessory', id: 'swift_bracelet', rate: 0.05 }
    ]
  },
  wolf: {
    id: 'wolf', name: '人狼の斥候', element: 'wind',
    level: 4, exp: 28, gold: 32,
    stats: { hp: 20, mp: 3, str: 14, mag: 2, skl: 11, spd: 13, lck: 6, def: 7, res: 5, cha: 2 },
    weaponType: 'dagger', atk: 10, mag: 0,
    drops: [
      { kind: 'weapon', id: 'silver_dagger', rate: 0.08 },
      { kind: 'weapon', id: 'thunder_katana', rate: 0.04 },
      { kind: 'armor', id: 'wind_jerkin', rate: 0.08 },
      { kind: 'accessory', id: 'crit_ring', rate: 0.05 }
    ]
  },
  dark_mage: {
    id: 'dark_mage', name: '闇の術師', element: 'fire',
    level: 5, exp: 35, gold: 45,
    stats: { hp: 16, mp: 12, str: 4, mag: 15, skl: 10, spd: 9, lck: 5, def: 5, res: 10, cha: 3 },
    weaponType: 'tome', atk: 0, mag: 11,
    drops: [
      { kind: 'weapon', id: 'arcane_tome', rate: 0.09 },
      { kind: 'weapon', id: 'saint_staff', rate: 0.05 },
      { kind: 'armor', id: 'sage_vestment', rate: 0.07 },
      { kind: 'accessory', id: 'magic_ring', rate: 0.06 },
      { kind: 'item', id: 'class_crest', rate: 0.04 }
    ]
  },
  orc_warrior: {
    id: 'orc_warrior', name: 'オーク戦士', element: 'earth',
    level: 7, exp: 50, gold: 65,
    stats: { hp: 28, mp: 4, str: 19, mag: 2, skl: 9, spd: 6, lck: 4, def: 13, res: 6, cha: 2 },
    weaponType: 'axe', atk: 14, mag: 0,
    drops: [
      { kind: 'weapon', id: 'battle_axe', rate: 0.09 },
      { kind: 'weapon', id: 'knight_lance', rate: 0.07 },
      { kind: 'armor', id: 'steel_armor', rate: 0.09 },
      { kind: 'accessory', id: 'lucky_amulet', rate: 0.05 },
      { kind: 'item', id: 'class_crest', rate: 0.06 }
    ]
  },
  ruin_guardian: {
    id: 'ruin_guardian', name: '遺跡の守護者', element: 'earth', statusResist: 15,
    level: 10, exp: 80, gold: 110,
    stats: { hp: 38, mp: 6, str: 23, mag: 8, skl: 13, spd: 9, lck: 6, def: 17, res: 12, cha: 3 },
    weaponType: 'lance', atk: 17, mag: 0,
    drops: [
      { kind: 'weapon', id: 'knight_lance', rate: 0.14 },
      { kind: 'weapon', id: 'thunder_katana', rate: 0.10 },
      { kind: 'accessory', id: 'hero_bracelet', rate: 0.08 },
      { kind: 'item', id: 'class_crest', rate: 0.15 }
    ]
  },
  goblin_king: {
    id: 'goblin_king', name: 'ゴブリンキング', element: 'fire', statusResist: 25, isBoss: true,
    level: 6, exp: 75, gold: 150,
    stats: { hp: 36, mp: 4, str: 18, mag: 3, skl: 11, spd: 8, lck: 6, def: 12, res: 7, cha: 4 },
    weaponType: 'axe', atk: 15, mag: 0,
    drops: [
      { kind: 'weapon', id: 'goblin_slayer_blade', rate: 0.35 },
      { kind: 'item', id: 'class_crest', rate: 0.25 }
    ]
  },
  skeleton_knight: {
    id: 'skeleton_knight', name: '骸骨騎士', element: 'none',
    level: 9, exp: 65, gold: 80,
    stats: { hp: 30, mp: 3, str: 20, mag: 2, skl: 12, spd: 10, lck: 4, def: 16, res: 8, cha: 2 },
    weaponType: 'sword', atk: 15, mag: 0,
    drops: [
      { kind: 'weapon', id: 'steel_sword', rate: 0.15 },
      { kind: 'item', id: 'class_crest', rate: 0.10 }
    ]
  },
  lich_lord: {
    id: 'lich_lord', name: 'リッチロード', element: 'ice', statusResist: 35, isBoss: true,
    level: 13, exp: 150, gold: 300,
    stats: { hp: 46, mp: 24, str: 8, mag: 26, skl: 15, spd: 12, lck: 8, def: 14, res: 20, cha: 6 },
    weaponType: 'tome', atk: 0, mag: 20,
    drops: [
      { kind: 'weapon', id: 'abyssal_grimoire', rate: 0.35 },
      { kind: 'weapon', id: 'soul_reaper_scythe', rate: 0.30 },
      { kind: 'item', id: 'class_crest', rate: 0.50 }
    ]
  },
  wyvern: {
    id: 'wyvern', name: 'ワイバーン', element: 'wind',
    level: 15, exp: 130, gold: 160,
    stats: { hp: 48, mp: 6, str: 28, mag: 6, skl: 16, spd: 18, lck: 8, def: 18, res: 14, cha: 4 },
    weaponType: 'lance', atk: 20, mag: 0,
    drops: [
      { kind: 'armor', id: 'astral_coat', rate: 0.12 },
      { kind: 'weapon', id: 'thunder_katana', rate: 0.10 },
      { kind: 'item', id: 'class_crest', rate: 0.14 }
    ]
  },
  dragon_knight: {
    id: 'dragon_knight', name: '竜騎士', element: 'fire',
    level: 18, exp: 175, gold: 220,
    stats: { hp: 58, mp: 10, str: 34, mag: 8, skl: 18, spd: 14, lck: 9, def: 24, res: 16, cha: 6 },
    weaponType: 'lance', atk: 24, mag: 0,
    drops: [
      { kind: 'armor', id: 'dragon_mail', rate: 0.12 },
      { kind: 'weapon', id: 'dragon_slayer', rate: 0.08 },
      { kind: 'item', id: 'class_crest', rate: 0.18 },
      { kind: 'item', id: 'hero_crest', rate: 0.05 }
    ]
  },
  celestial_warden: {
    id: 'celestial_warden', name: '星界の番人', element: 'thunder', statusResist: 20,
    level: 24, exp: 260, gold: 340,
    stats: { hp: 72, mp: 20, str: 38, mag: 30, skl: 22, spd: 20, lck: 12, def: 26, res: 26, cha: 10 },
    weaponType: 'bow', atk: 28, mag: 0,
    drops: [
      { kind: 'weapon', id: 'celestial_bow', rate: 0.12 },
      { kind: 'weapon', id: 'genesis_staff', rate: 0.10 },
      { kind: 'armor', id: 'seraph_robe', rate: 0.12 },
      { kind: 'item', id: 'hero_crest', rate: 0.12 }
    ]
  },
  abyss_dragon: {
    id: 'abyss_dragon', name: '深淵竜バハムート', element: 'heatwave', statusResist: 50, isBoss: true,
    level: 30, exp: 500, gold: 800,
    stats: { hp: 110, mp: 35, str: 46, mag: 42, skl: 25, spd: 22, lck: 14, def: 32, res: 30, cha: 15 },
    weaponType: 'sword', atk: 34, mag: 0,
    drops: [
      { kind: 'weapon', id: 'dragon_slayer', rate: 0.45 },
      { kind: 'weapon', id: 'genesis_staff', rate: 0.35 },
      { kind: 'accessory', id: 'eternal_crown', rate: 0.40 },
      { kind: 'item', id: 'hero_crest', rate: 0.65 }
    ]
  }
};

// 通常エリア（自動探索用）
export const AREAS = [
  {
    id: 'meadow',
    name: '静かな草原',
    recommendedLv: 1,
    rarityBonus: 0,
    description: 'スライムやゴブリンが徘徊する初心者向けの探索エリア。',
    encounters: [
      ['slime', 'slime'],
      ['slime', 'goblin'],
      ['goblin', 'goblin', 'goblin_archer']
    ]
  },
  {
    id: 'forest',
    name: '霧の深い森',
    recommendedLv: 4,
    rarityBonus: 0.15,
    description: '人狼や闇の術師が潜む森。レア装備や「転職の証」も稀にドロップ。',
    encounters: [
      ['goblin', 'wolf', 'goblin_archer'],
      ['wolf', 'wolf', 'dark_mage'],
      ['goblin', 'goblin', 'wolf', 'dark_mage']
    ]
  },
  {
    id: 'ruins',
    name: '古代遺跡の外縁',
    recommendedLv: 8,
    rarityBonus: 0.35,
    description: 'オーク戦士や守護者が守る危険地帯。上位装備と転職の証が狙いやすい。',
    encounters: [
      ['orc_warrior', 'wolf', 'dark_mage'],
      ['orc_warrior', 'orc_warrior', 'goblin_archer', 'dark_mage'],
      ['ruin_guardian', 'orc_warrior', 'dark_mage']
    ]
  },
  {
    id: 'dragon_peak',
    name: '竜の峰',
    recommendedLv: 15,
    rarityBonus: 0.65,
    description: 'ワイバーンや竜騎士が舞う霊峰。伝説級装備や「英雄の証」のドロップも狙える。',
    encounters: [
      ['wyvern', 'wyvern'],
      ['wyvern', 'dragon_knight', 'dark_mage'],
      ['dragon_knight', 'dragon_knight', 'wyvern']
    ]
  },
  {
    id: 'celestial_sanctum',
    name: '星界の神殿',
    recommendedLv: 24,
    rarityBonus: 1.0,
    description: '神話級の秘宝と「英雄の証」を求めて挑む最難関の通常エリア。',
    encounters: [
      ['celestial_warden', 'dragon_knight'],
      ['celestial_warden', 'celestial_warden', 'wyvern']
    ]
  }
];

export const RANDOM_NAMES = [
  'アレン', 'リア', 'ガルド', 'セレス', 'カイン', 'ミレイ', 'レオン', 'フィナ',
  'バルド', 'エリス', 'ゼクス', 'ノア', 'ルーク', 'シルフィ', 'ドラン', 'クララ'
];

// 盗賊系職業（宝箱・罠回避判定用）
export const THIEF_LINE_CLASSES = [
  'thief',
  'assassin',
  'treasure_hunter',
  'shadow_master',
  'grand_seeker',
  'nightmare_blade',
  'relic_monarch',
  'abyss_reaper',
  'mythic_explorer'
];

// インスタンスダンジョン定義（Phase 3〜4）
export const DUNGEONS = [
  {
    id: 'goblin_fort',
    name: 'ゴブリンの砦',
    recommendedLv: 3,
    totalFloors: 3,
    stepsPerFloor: 5,
    rarityBonus: 0.25,
    trainingChance: 0.01,
    description: 'ゴブリンたちが占拠する古い砦。階層ボスから限定武器「妖魔殺しの剛剣」が狙える。',
    normalEncounters: [
      ['goblin', 'goblin'],
      ['goblin', 'goblin_archer'],
      ['goblin', 'wolf', 'goblin_archer']
    ],
    eliteEncounters: [
      ['orc_warrior', 'goblin_archer'],
      ['wolf', 'wolf', 'dark_mage']
    ],
    bossEncounter: ['goblin_king', 'goblin', 'goblin_archer'],
    exclusiveLootIds: ['goblin_slayer_blade', 'hunter_bow', 'silver_dagger'],
    familiarPool: ['salamander', 'sylph', 'fortune_cat'],
    familiarDropRate: 0.06
  },
  {
    id: 'abyss_catacomb',
    name: '深淵の地下墓地',
    recommendedLv: 8,
    totalFloors: 4,
    stepsPerFloor: 6,
    rarityBonus: 0.55,
    trainingChance: 0.01,
    description: '骸骨騎士とリッチが統べる禁断の地下迷宮。強力な限定装備と「転職の証」が高確率でドロップ。',
    normalEncounters: [
      ['skeleton_knight', 'dark_mage'],
      ['orc_warrior', 'skeleton_knight', 'dark_mage'],
      ['wolf', 'skeleton_knight', 'dark_mage']
    ],
    eliteEncounters: [
      ['ruin_guardian', 'skeleton_knight', 'dark_mage'],
      ['orc_warrior', 'ruin_guardian', 'dark_mage']
    ],
    bossEncounter: ['lich_lord', 'skeleton_knight', 'dark_mage'],
    exclusiveLootIds: ['abyssal_grimoire', 'soul_reaper_scythe', 'thunder_katana'],
    familiarPool: ['undine', 'gnome', 'minerva_owl'],
    familiarDropRate: 0.09
  },
  {
    id: 'eternal_abyss',
    name: '永劫の竜宮',
    recommendedLv: 18,
    totalFloors: 5,
    stepsPerFloor: 7,
    rarityBonus: 1.0,
    trainingChance: 0.01,
    description: '深淵竜バハムートが眠る最終ダンジョン。伝説・神話級装備と「英雄の証」が狙える。',
    normalEncounters: [
      ['wyvern', 'dragon_knight'],
      ['wyvern', 'wyvern', 'skeleton_knight']
    ],
    eliteEncounters: [
      ['celestial_warden', 'dragon_knight'],
      ['dragon_knight', 'dragon_knight', 'celestial_warden']
    ],
    bossEncounter: ['abyss_dragon', 'celestial_warden', 'dragon_knight'],
    exclusiveLootIds: ['dragon_slayer', 'celestial_bow', 'genesis_staff'],
    familiarPool: ['valkyrie_drake', 'yggdrasil_sprout', 'minerva_owl'],
    familiarDropRate: 0.12
  }
];

// 使い魔種別定義
export const FAMILIAR_TYPES = {
  spirit: { id: 'spirit', name: '精霊' },
  beast: { id: 'beast', name: '幻獣' },
  dragon: { id: 'dragon', name: '竜族' }
};

// 使い魔マスター（4枠目装備・通常敵ドロップなし・ユニーク効果）
export const FAMILIARS = {
  salamander: {
    id: 'salamander',
    name: '紅蓮の火精',
    type: 'spirit',
    rarity: 'rare',
    element: 'fire',
    growthBonus: { str: 5, mag: 5 },
    skillChanceBonus: 5,
    combatBonus: { atk: 8, mag: 8 },
    description: '攻撃に火属性を付与。LvUP時の力・魔力成長率+5%、スキル発動率+5%。'
  },
  undine: {
    id: 'undine',
    name: '蒼海の氷精',
    type: 'spirit',
    rarity: 'rare',
    element: 'water',
    growthBonus: { mag: 6, res: 5 },
    skillChanceBonus: 5,
    combatBonus: { mp: 10, healBonus: 15 },
    description: '攻撃に水属性を付与。LvUP時の魔力+6%・魔防+5%、回復量+15%、スキル発動率+5%。'
  },
  sylph: {
    id: 'sylph',
    name: '翠風の小妖精',
    type: 'spirit',
    rarity: 'rare',
    element: 'wind',
    growthBonus: { spd: 6, skl: 5 },
    skillChanceBonus: 5,
    combatBonus: { eva: 8, initiativeBonus: 8 },
    description: '攻撃に風属性を付与。LvUP時の速さ+6%・技+5%、回避+8%、先制+8。'
  },
  gnome: {
    id: 'gnome',
    name: '岩窟の土精',
    type: 'spirit',
    rarity: 'rare',
    element: 'earth',
    growthBonus: { hp: 8, def: 6 },
    skillChanceBonus: 4,
    combatBonus: { hp: 20, def: 10, physDmgRed: 5 },
    description: '攻撃に土属性を付与。LvUP時のHP+8%・守備+6%、物防+10、被物-5%。'
  },
  fortune_cat: {
    id: 'fortune_cat',
    name: '黄金の招き猫',
    type: 'beast',
    rarity: 'epic',
    element: 'none',
    growthBonus: { lck: 10, cha: 8 },
    skillChanceBonus: 6,
    combatBonus: { dropBonus: 25, crit: 5 },
    description: 'LvUP時の幸運+10%・魅力+8%、ドロップ率+25%、会心+5%、スキル発動率+6%。'
  },
  minerva_owl: {
    id: 'minerva_owl',
    name: '賢者のフクロウ',
    type: 'beast',
    rarity: 'epic',
    element: 'none',
    growthBonus: { mp: 10, mag: 8, skl: 5 },
    skillChanceBonus: 10,
    combatBonus: { mp: 15, magPen: 10 },
    description: 'LvUP時のMP+10%・魔力+8%・技+5%、スキル発動率+10%、魔法貫通+10%。'
  },
  valkyrie_drake: {
    id: 'valkyrie_drake',
    name: '戦乙女のミニ竜',
    type: 'dragon',
    rarity: 'legendary',
    element: 'none',
    growthBonus: { hp: 5, str: 6, skl: 6, spd: 5 },
    skillChanceBonus: 12,
    combatBonus: { crit: 8, followUp: 10, physPen: 10 },
    description: 'LvUP時のHP/力/技/速さ成長率+5〜6%、スキル発動率+12%、追撃+10%、会心+8%。'
  },
  yggdrasil_sprout: {
    id: 'yggdrasil_sprout',
    name: '世界樹の若芽',
    type: 'spirit',
    rarity: 'mythic',
    element: 'none',
    growthBonus: { hp: 5, mp: 5, str: 4, mag: 4, skl: 4, spd: 4, lck: 4, def: 4, res: 4, cha: 4 },
    skillChanceBonus: 10,
    combatBonus: { hp: 25, mp: 15, healBonus: 10 },
    description: '全基礎ステータスの成長率+4〜5%、HP+25/MP+15、回復量+10%、スキル発動率+10%。'
  }
};

// MMO風サブストーリー・クエストシリーズ定義
export const QUEST_SERIES = [
  { id: 'flora', icon: '🌸', title: '花売りの少女', npc: 'フローラ', subtitle: '小さな希望と薬草の物語' },
  { id: 'dragon', icon: '🐉', title: '封印されたドラゴン', npc: 'イグニス', subtitle: '古竜との対話と覚醒' },
  { id: 'hero_youth', icon: '⚔️', title: '勇者を目指す青年', npc: 'レオン', subtitle: '憧れを現実にする試練' },
  { id: 'yggdrasil', icon: '🌱', title: '小さな苗木（ユグドラシル）', npc: '若木', subtitle: '世界樹へと育つ命の芽' },
  { id: 'old_cat', icon: '🐱', title: '街を見守る老猫', npc: 'クロ', subtitle: '気まぐれな守護者の恩返し' },
  { id: 'legend_mage', icon: '🧙', title: '伝説の魔法使い？', npc: 'アルケミア', subtitle: '忘れられた大魔導の謎' },
  { id: 'blacksmith', icon: '🔨', title: '見習い鍛冶師', npc: 'トール', subtitle: '魂の一振りを打つ日まで' },
  { id: 'ghost_knight', icon: '👻', title: '迷子の幽霊騎士', npc: 'セバス', subtitle: '誇り高き騎士の鎮魂歌' },
  { id: 'bard', icon: '🧭', title: '放浪の吟遊詩人', npc: 'オルフェ', subtitle: '英雄譚を紡ぐ旅路' },
  { id: 'oracle_miko', icon: '🌟', title: '星詠みの巫女', npc: 'ルナ', subtitle: '星辰が示す終末への導き' }
];

// 連鎖するクエスト一覧（prevQuestId 達成後に解放）
export const QUESTS = [
  // 🌸 花売りの少女
  {
    id: 'flora_1', seriesId: 'flora', step: 1, prevQuestId: null,
    title: '草原の花摘み',
    story: '「冒険者さん！風車の草原に咲く薬草をたくさん摘んできてくれませんか？」',
    condition: { type: 'area_clear', areaId: 'meadow', count: 30, label: '「風車の草原」で30回勝利' },
    rewards: { gold: 300 }
  },
  {
    id: 'flora_2', seriesId: 'flora', step: 2, prevQuestId: 'flora_1',
    title: '森の秘薬草',
    story: '「もっと珍しい花があれば、病気のみんなを助けられるんです！」',
    condition: { type: 'area_clear', areaId: 'forest', count: 80, label: '「迷いの森」で80回勝利' },
    rewards: { gold: 800, items: { class_crest: 1 } }
  },
  {
    id: 'flora_3', seriesId: 'flora', step: 3, prevQuestId: 'flora_2',
    title: '花売りの笑顔',
    story: '「おかげで町のみんなが元気になりました！お礼に大切な花のお守りをどうぞ！」',
    condition: { type: 'dungeon_clear', dungeonId: 'goblin_fort', count: 3, label: '「ゴブリンの砦」を3回踏破' },
    rewards: {
      gold: 1500,
      uniqueEquip: { slot: 'accessory', templateId: 'lucky_amulet', rarity: 'epic', traits: ['blessed', 'greed', 'vital'] }
    }
  },

  // 🐉 封印されたドラゴン
  {
    id: 'dragon_1', seriesId: 'dragon', step: 1, prevQuestId: null,
    title: '古竜の気配',
    story: '『……我が眠りを妨げるのは誰だ。まずはその力を示してみよ』',
    condition: { type: 'area_clear', areaId: 'ruins', count: 80, label: '「古代遺跡」で80回勝利' },
    rewards: { gold: 1000 }
  },
  {
    id: 'dragon_2', seriesId: 'dragon', step: 2, prevQuestId: 'dragon_1',
    title: '封印を解く鍵',
    story: '『ほう、悪くない。ならば深淵の墓地に眠る死者の王を討ち、楔を砕け』',
    condition: { type: 'dungeon_clear', dungeonId: 'abyss_catacomb', count: 3, label: '「深淵の地下墓地」を3回踏破' },
    rewards: { gold: 2000, items: { hero_crest: 1 } }
  },
  {
    id: 'dragon_3', seriesId: 'dragon', step: 3, prevQuestId: 'dragon_2',
    title: '古竜の認めし者',
    story: '『見事だ！汝らに古き竜の騎士の秘伝と、我が眷属を授けよう！』',
    condition: { type: 'dungeon_clear', dungeonId: 'eternal_abyss', count: 3, label: '「永劫の竜宮」を3回踏破' },
    rewards: { unlockClassId: 'dragon_knight', familiarId: 'valkyrie_drake' }
  },

  // ⚔️ 勇者を目指す青年
  {
    id: 'hero_1', seriesId: 'hero_youth', step: 1, prevQuestId: null,
    title: '最初の一歩',
    story: '「俺もいつか伝説の勇者になるんだ！まずは実戦経験を積まないと！」',
    condition: { type: 'victories', count: 50, label: '戦闘で合計50回勝利' },
    rewards: { gold: 400 }
  },
  {
    id: 'hero_2', seriesId: 'hero_youth', step: 2, prevQuestId: 'hero_1',
    title: '迷宮への挑戦',
    story: '「ゴブリンの砦を何度も突破したのか！？すごいな、俺も負けてられない！」',
    condition: { type: 'dungeon_clear', dungeonId: 'goblin_fort', count: 3, label: '「ゴブリンの砦」を3回踏破' },
    rewards: { gold: 1000, items: { class_crest: 2 } }
  },
  {
    id: 'hero_3', seriesId: 'hero_youth', step: 3, prevQuestId: 'hero_2',
    title: '英雄の背中',
    story: '「あんたたちの強さは本物だ！家宝の剣、俺なんかよりあんたが持っててくれ！」',
    condition: { type: 'max_level', level: 25, label: '誰か1人が Lv.25 に到達' },
    rewards: {
      uniqueEquip: { slot: 'weapon', templateId: 'mithril_sword', rarity: 'epic', traits: ['sharp', 'deadly', 'vampiric'] }
    }
  },

  // 🌱 小さな苗木（ユグドラシル）
  {
    id: 'ygg_1', seriesId: 'yggdrasil', step: 1, prevQuestId: null,
    title: '芽吹きの水やり',
    story: '街の片隅でかすかに光る小さな苗木。森の清らかな魔力に反応しているようだ。',
    condition: { type: 'area_clear', areaId: 'forest', count: 60, label: '「迷いの森」で60回勝利' },
    rewards: { gold: 500 }
  },
  {
    id: 'ygg_2', seriesId: 'yggdrasil', step: 2, prevQuestId: 'ygg_1',
    title: '大樹の試練',
    story: '苗木から神聖な輝きが溢れ出した。さらなる深淵の魔力を求めているようだ。',
    condition: { type: 'dungeon_clear', dungeonId: 'abyss_catacomb', count: 3, label: '「深淵の地下墓地」を3回踏破' },
    rewards: { gold: 1200, items: { class_crest: 2 } }
  },
  {
    id: 'ygg_3', seriesId: 'yggdrasil', step: 3, prevQuestId: 'ygg_2',
    title: 'ユグドラシルの祝福',
    story: '輪廻転生を繰り返した魂の輝きに共鳴し、世界樹の若芽が仲間に加わった！',
    condition: { type: 'reclass_count', count: 2, label: '「初期職への転職」を累計2回実行' },
    rewards: { familiarId: 'yggdrasil_sprout' }
  },

  // 🐱 街を見守る老猫
  {
    id: 'cat_1', seriesId: 'old_cat', step: 1, prevQuestId: null,
    title: '日向ぼっこのお供',
    story: '「ニャー…（新米の割には悪くない目をしてるニャ。少し強くなったらまた来いニャ）」',
    condition: { type: 'max_level', level: 10, label: '誰か1人が Lv.10 に到達' },
    rewards: { gold: 300 }
  },
  {
    id: 'cat_2', seriesId: 'old_cat', step: 2, prevQuestId: 'cat_1',
    title: '夜のパトロール',
    story: '「ニャア！（洞窟の魔物がうるさいニャ！静かにしてこいニャ！）」',
    condition: { type: 'area_clear', areaId: 'cave', count: 80, label: '「薄暗い洞窟」で80回勝利' },
    rewards: { gold: 900, items: { class_crest: 1 } }
  },
  {
    id: 'cat_3', seriesId: 'old_cat', step: 3, prevQuestId: 'cat_2',
    title: '招き猫の恩返し',
    story: '「ニャーン♪（気に入ったニャ！ワシの秘蔵っ子をお前さんたちに預けるニャ！）」',
    condition: { type: 'dungeon_clear', dungeonId: 'abyss_catacomb', count: 3, label: '「深淵の地下墓地」を3回踏破' },
    rewards: { familiarId: 'fortune_cat' }
  },

  // 🧙 伝説の魔法使い？
  {
    id: 'mage_1', seriesId: 'legend_mage', step: 1, prevQuestId: null,
    title: '魔力の残滓',
    story: '「ふぉっふぉっ、ワシこそ伝説の魔法使い！…え、杖？遺跡に忘れてきたんじゃよ」',
    condition: { type: 'area_clear', areaId: 'ruins', count: 60, label: '「古代遺跡」で60回勝利' },
    rewards: { gold: 800 }
  },
  {
    id: 'mage_2', seriesId: 'legend_mage', step: 2, prevQuestId: 'mage_1',
    title: '古文書の解読',
    story: '「ほほう、Tier 3 の高みに至った者がおるのか！大した修行の成果じゃな」',
    condition: { type: 'max_tier', tier: 3, label: '誰か1人が Tier 3 以上の職業に到達' },
    rewards: { gold: 1500, items: { hero_crest: 1 } }
  },
  {
    id: 'mage_3', seriesId: 'legend_mage', step: 3, prevQuestId: 'mage_2',
    title: '時空の真理',
    story: '「実はワシ、時空を超えてきた魔導士なんじゃ。奥義と賢者のフクロウを授けよう！」',
    condition: { type: 'dungeon_clear', dungeonId: 'eternal_abyss', count: 3, label: '「永劫の竜宮」を3回踏破' },
    rewards: { unlockClassId: 'chrono_mage', familiarId: 'minerva_owl' }
  },

  // 🔨 見習い鍛冶師
  {
    id: 'smith_1', seriesId: 'blacksmith', step: 1, prevQuestId: null,
    title: '鉄くず集め',
    story: '「兄ちゃん、鍛冶の練習に鉱石が足りねえんだ！洞窟でひと暴れしてきてくれよ！」',
    condition: { type: 'area_clear', areaId: 'cave', count: 50, label: '「薄暗い洞窟」で50回勝利' },
    rewards: { gold: 500 }
  },
  {
    id: 'smith_2', seriesId: 'blacksmith', step: 2, prevQuestId: 'smith_1',
    title: '灼熱の鍛錬',
    story: '「火山の炎なら伝説の鋼も打てるはずだ！マグマ地帯の魔物を蹴散らしてきてくれ！」',
    condition: { type: 'area_clear', areaId: 'volcano', count: 100, label: '「灼熱の火山」で100回勝利' },
    rewards: { gold: 1200, items: { class_crest: 2 } }
  },
  {
    id: 'smith_3', seriesId: 'blacksmith', step: 3, prevQuestId: 'smith_2',
    title: '魂を打つ槌',
    story: '「俺も一人前になれたよ！ルーンを刻む鍛冶師の技と特製鎧、受け取ってくれ！」',
    condition: { type: 'dungeon_clear', dungeonId: 'goblin_fort', count: 5, label: '「ゴブリンの砦」を5回踏破' },
    rewards: { unlockClassId: 'rune_smith', uniqueEquip: { slot: 'armor', templateId: 'knight_plate', rarity: 'epic', traits: ['sturdy', 'ward', 'vital'] } }
  },

  // 👻 迷子の幽霊騎士
  {
    id: 'ghost_1', seriesId: 'ghost_knight', step: 1, prevQuestId: null,
    title: '古城の噂',
    story: '「私はかつて王に仕えた騎士……自分が守るべき場所を思い出せないのだ」',
    condition: { type: 'area_clear', areaId: 'ruins', count: 100, label: '「古代遺跡」で100回勝利' },
    rewards: { gold: 1000 }
  },
  {
    id: 'ghost_2', seriesId: 'ghost_knight', step: 2, prevQuestId: 'ghost_1',
    title: '安らかな眠り',
    story: '「思い出した……！感謝する、友よ。この英雄の証を未来ある君たちに託そう」',
    condition: { type: 'dungeon_clear', dungeonId: 'abyss_catacomb', count: 5, label: '「深淵の地下墓地」を5回踏破' },
    rewards: { gold: 2000, items: { hero_crest: 2 } }
  },

  // 🧭 放浪の吟遊詩人
  {
    id: 'bard_1', seriesId: 'bard', step: 1, prevQuestId: null,
    title: '酒場の出会い',
    story: '「やあ旅人！いい物語は強い仲間から生まれるものさ。団員を増やしてみないかい？」',
    condition: { type: 'roster_count', count: 6, label: '仲間キャラクターを合計6人以上にする' },
    rewards: { gold: 400 }
  },
  {
    id: 'bard_2', seriesId: 'bard', step: 2, prevQuestId: 'bard_1',
    title: '千の戦いの詩',
    story: '「素晴らしい武勇伝だ！君たちの旅がさらに広がるようにこれを贈ろう！」',
    condition: { type: 'victories', count: 200, label: '戦闘で合計200回勝利' },
    rewards: { gold: 1500, items: { class_crest: 3 } }
  },

  // 🌟 星詠みの巫女
  {
    id: 'miko_1', seriesId: 'oracle_miko', step: 1, prevQuestId: null,
    title: '星々の観測',
    story: '「星々が新たな英雄の誕生を告げています…まずはこの大地を巡ってみてください」',
    condition: { type: 'area_clear', areaId: 'meadow', count: 100, label: '「風車の草原」で100回勝利' },
    rewards: { gold: 600 }
  },
  {
    id: 'miko_2', seriesId: 'oracle_miko', step: 2, prevQuestId: 'miko_1',
    title: '聖なる祈り',
    story: '「貴方の魂は清らかな光を放っています。さらなる高みを目指してくださいませ」',
    condition: { type: 'max_level', level: 20, label: '誰か1人が Lv.20 に到達' },
    rewards: { gold: 1500, items: { hero_crest: 1 } }
  },
  {
    id: 'miko_3', seriesId: 'oracle_miko', step: 3, prevQuestId: 'miko_2',
    title: '終末の星を超えて',
    story: '「深淵の竜宮すら踏破したのですね…星々の祝福が、永遠に貴方と共にありますように」',
    condition: { type: 'dungeon_clear', dungeonId: 'eternal_abyss', count: 5, label: '「永劫の竜宮」を5回踏破' },
    rewards: { gold: 5000, items: { hero_crest: 2 }, familiarId: 'undine' }
  }
];

// 星屑の祭壇：永続祝福マスター
export const STAR_BLESSINGS = [
  {
    id: 'rarity_boost',
    name: '幸運の祝福（レア率UP）',
    maxLevel: 10,
    baseCost: 5,
    costStep: 3,
    perLevel: 0.03,
    unit: 'rarityBonus',
    formatEffect: lv => `装備レア度補正 +${(lv * 0.03).toFixed(2)}`
  },
  {
    id: 'battle_speed',
    name: '疾風の加護（戦闘間隔緩和）',
    maxLevel: 5,
    baseCost: 8,
    costStep: 6,
    perLevel: 100,
    unit: 'ms',
    formatEffect: lv => `基本戦闘間隔 ${1000 - lv * 100}ms (-${lv * 100}ms)`
  },
  {
    id: 'growth_boost',
    name: '成長の祝福（基礎成長率UP）',
    maxLevel: 10,
    baseCost: 6,
    costStep: 4,
    perLevel: 1,
    unit: '%',
    formatEffect: lv => `全基礎ステ成長率 +${lv}%`
  },
  {
    id: 'training_boost',
    name: '極限鍛錬の加護',
    maxLevel: 10,
    baseCost: 8,
    costStep: 5,
    perLevel: 0.002,
    unit: 'chance',
    formatEffect: lv => `踏破時ステ+1確率 +${(lv * 0.2).toFixed(1)}%`
  },
  {
    id: 'exp_gold_boost',
    name: '導きの祝福（EXP & G）',
    maxLevel: 10,
    baseCost: 4,
    costStep: 3,
    perLevel: 0.1,
    unit: 'mult',
    formatEffect: lv => `獲得EXP・ゴールド +${lv * 10}%`
  }
];

// 星屑の輝石：秘宝交換所マスター
export const STAR_EXCHANGES = [
  {
    id: 'ex_class_crest',
    name: '転職の証 ×1',
    cost: 12,
    kind: 'item',
    itemId: 'class_crest',
    qty: 1,
    description: 'Tier 3〜4 クラスチェンジに必要な貴重な証。'
  },
  {
    id: 'ex_hero_crest',
    name: '英雄の証 ×1',
    cost: 35,
    kind: 'item',
    itemId: 'hero_crest',
    qty: 1,
    description: '最終職（Tier 5）へのクラスチェンジに必要な伝説の証。'
  },
  {
    id: 'ex_salamander',
    name: '使い魔「紅蓮の火精」',
    cost: 40,
    kind: 'familiar',
    familiarId: 'salamander',
    description: '火属性付与＋力/魔力成長率+5%＋スキル発動率+5%。'
  },
  {
    id: 'ex_fortune_cat',
    name: '使い魔「黄金の招き猫」',
    cost: 60,
    kind: 'familiar',
    familiarId: 'fortune_cat',
    description: '幸運+10%・魅力+8%成長率＋ドロップ率+25%。'
  },
  {
    id: 'ex_mythic_blade',
    name: '[伝説] ミスリルソード',
    cost: 80,
    kind: 'uniqueEquip',
    uniqueEquip: {
      slot: 'weapon',
      templateId: 'mithril_sword',
      rarity: 'legendary',
      traits: ['sharp', 'deadly', 'vampiric', 'swift']
    },
    description: '鋭利・必殺・吸血・疾風の4特性が付いた伝説の魔剣。'
  },
  {
    id: 'ex_yggdrasil',
    name: '使い魔「世界樹の若芽」',
    cost: 100,
    kind: 'familiar',
    familiarId: 'yggdrasil_sprout',
    description: '全基礎ステ成長率+4〜5%＋回復量+10%＋スキル発動率+10%。'
  }
];
