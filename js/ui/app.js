import {
  STAT_KEYS,
  STAT_LABELS,
  RACES,
  CLASSES,
  PERSONALITIES,
  WEAPONS,
  WEAPON_TYPES,
  ARMOR_TYPES,
  ACCESSORY_TYPES,
  FAMILIAR_TYPES,
  ARMORS,
  ACCESSORIES,
  FAMILIARS,
  getAllowedArmors,
  WEAPON_TRAITS,
  RARITIES,
  ITEMS,
  MONSTERS,
  AREAS,
  DUNGEONS,
  RANDOM_NAMES,
  ELEMENTS,
  STATUS_EFFECTS,
  CLASS_TREES,
  getClassActiveSkill,
  QUEST_SERIES,
  QUESTS,
  STAR_BLESSINGS,
  STAR_EXCHANGES
} from '../data/masterData.js';
import {
  calculateCombatStats,
  getGrowthRates,
  getExpForNextLevel,
  canClassChange,
  canReclassToTier1,
  getActiveSkillActivationChance
} from '../engine/stats.js';
import { store } from '../state/store.js';
import { AutoExploreController } from '../engine/explore.js';
import { dungeonCtrl } from '../engine/dungeon.js';

let activeTab = 'explore';
let exploreSubTab = 'auto'; // 'auto' | 'dungeon'
let isAreaConfigOpen = false;
let isDropHintOpen = false;
let isClassTreeOpen = false;
let lastDungeonSummary = null;
let levelUpQueue = [];
let levelUpAutoTimer = null;
let showSettingsModal = false;
let showAltarModal = false;
let altarSubTab = 'blessing';
let selectedCharId = store.state.partyIds[0] || store.state.roster[0]?.id;
let swapSourceIndex = null;
let equipTargetCharId = store.state.partyIds[0] || store.state.roster[0]?.id;
let equipCategoryTab = 'weapon'; // 'weapon' | 'armor' | 'accessory'
let equipSubTypeTab = 'all';
const expandedEquipGroups = new Set();

const tavernDraft = {
  name: RANDOM_NAMES[0],
  raceId: 'human',
  classId: 'warrior',
  personalityId: 'aggressive'
};

const explorer = new AutoExploreController(
  () => {
    if (activeTab === 'explore') {
      render();
    }
    updateHeader();
  },
  levelUps => {
    if (levelUps && levelUps.length > 0) {
      levelUpQueue.push(...levelUps);
      renderModal();
    }
  }
);

function updateHeader() {
  const goldEl = document.getElementById('header-gold');
  if (goldEl) {
    goldEl.textContent = `${store.state.gold.toLocaleString()} G`;
  }
  const crestEl = document.getElementById('header-crest');
  if (crestEl) {
    crestEl.textContent = `🏅 ${store.state.items?.class_crest || 0}`;
  }
  const heroCrestEl = document.getElementById('header-hero-crest');
  if (heroCrestEl) {
    heroCrestEl.textContent = `👑 ${store.state.items?.hero_crest || 0}`;
  }
  const starStoneEl = document.getElementById('header-star-stones');
  if (starStoneEl) {
    starStoneEl.textContent = String(store.state.starStones || 0);
  }
  const questBadge = document.getElementById('quest-nav-badge');
  if (questBadge) {
    const cnt = store.getClaimableQuestsCount();
    questBadge.style.display = cnt > 0 ? 'inline-block' : 'none';
    questBadge.textContent = String(cnt);
  }
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

/* =========================================================
 * 1. 探索タブ
 * ======================================================= */
function renderExploreTab() {
  const subSwitch = `
    <div class="mode-toggle">
      <button class="mode-btn ${exploreSubTab === 'auto' ? 'active' : ''}" data-explore-sub="auto">🔄 自動探索（周回）</button>
      <button class="mode-btn ${exploreSubTab === 'dungeon' ? 'active' : ''}" data-explore-sub="dungeon">🏰 手動探索（ダンジョン）</button>
    </div>
  `;

  if (exploreSubTab === 'dungeon') {
    return subSwitch + renderDungeonSection();
  }

  return subSwitch + renderAutoExploreSection();
}

function renderDungeonSection() {
  const run = dungeonCtrl.run;
  const party = store.getPartyCharacters();

  // ダンジョン未突入時：ダンジョン選択画面
  if (!run) {
    const summaryHtml = lastDungeonSummary
      ? `
      <section class="card" style="border-color:var(--accent-gold);">
        <div class="card-title"><span>🎒 帰還リザルト</span></div>
        <div style="font-size:12px;">
          獲得ゴールド: <strong style="color:var(--accent-gold)">+${lastDungeonSummary.rewardObj.gold} G</strong> ／
          経験値: <strong>+${lastDungeonSummary.rewardObj.exp}</strong>
          ${
            lastDungeonSummary.msgs.length > 0
              ? `<div style="margin-top:6px;color:var(--text-muted);">${lastDungeonSummary.msgs.map(m => `<div>${escapeHtml(m)}</div>`).join('')}</div>`
              : ''
          }
        </div>
      </section>
    `
      : '';

    return `
      ${summaryHtml}
      <section class="card">
        <div class="card-title"><span>インスタンスダンジョン選択</span></div>
        <p class="area-desc" style="margin-top:0;margin-bottom:8px;">
          HP/MPを引き継ぎながら分岐マスを進む手動攻略モードです。全滅すると未帰還戦利品の一部を失います。
        </p>
        ${DUNGEONS.map(d => {
          const isDiscovered = store.isDungeonDiscovered(d.id);
          const sourceAreaName = AREAS.find(a => a.id === d.sourceAreaId)?.name || '通常エリア';
          if (!isDiscovered) {
            return `
              <div class="cc-option" style="margin-top:8px;opacity:0.7;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <div>
                    <strong>🔒 ${escapeHtml(d.name)}</strong>
                    <span style="font-size:11px;color:var(--accent-blue);margin-left:4px;">推奨Lv.${d.recommendedLv}〜 / 全${d.totalFloors}階層</span>
                  </div>
                  <span style="font-size:11px;color:var(--text-muted);">未発見</span>
                </div>
                <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">
                  『${escapeHtml(sourceAreaName)}』を探索すると見つかります
                </div>
              </div>
            `;
          }
          const lootNames = d.exclusiveLootIds
            .map(id => WEAPONS[id]?.name || id)
            .join('・');
          return `
            <div class="cc-option" style="margin-top:8px;">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <div>
                  <strong>${escapeHtml(d.name)}</strong>
                  <span style="font-size:11px;color:var(--accent-blue);margin-left:4px;">推奨Lv.${d.recommendedLv}〜 / 全${d.totalFloors}階層</span>
                </div>
                <button class="btn btn-sm btn-primary" data-enter-dungeon="${d.id}">突入</button>
              </div>
              <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">
                ${escapeHtml(d.description)}<br/>
                <span style="color:var(--accent-gold);">限定・注目ドロップ: ${escapeHtml(lootNames)}</span><br/>
                <span style="color:#ff9c9c;">踏破鍛錬率: ${Math.round((d.trainingChance || 0.05) * 100)}%（基礎ステ+1）</span>
              </div>
            </div>
          `;
        }).join('')}
      </section>
    `;
  }

  // ダンジョン探索中ヘッダー（階層・ステップ・バフ・戦利品）
  const totalSteps = run.floorSteps.length;
  const dotsHtml = run.floorSteps
    .map((_, idx) => {
      const cls = idx < run.stepIndex ? 'done' : idx === run.stepIndex ? 'current' : '';
      return `<div class="step-dot ${cls}"></div>`;
    })
    .join('');

  const partyStatusHtml = party
    .map((c, idx) => {
      const hpMp = run.partyHpMp[c.id] || { hp: 0, maxHp: 1, mp: 0, maxMp: 1 };
      const hpPct = Math.max(0, Math.min(100, Math.round((hpMp.hp / hpMp.maxHp) * 100)));
      return `
        <div class="unit-card ${idx < 2 ? 'frontline' : 'backline'} ${hpMp.hp <= 0 ? 'dead' : ''}" style="min-height:60px;">
          <div class="unit-name">${escapeHtml(c.name)}</div>
          <div class="bar-wrap"><div class="bar-fill-hp ${hpPct <= 30 ? 'low' : ''}" style="width:${hpPct}%"></div></div>
          <div class="bar-nums">${hpMp.hp}/${hpMp.maxHp}</div>
        </div>
      `;
    })
    .join('');

  const bag = run.lootBag;
  const bagWeaponCount = bag.weapons.length;
  const bagCrestCount = bag.items.class_crest || 0;
  const bagHeroCrestCount = bag.items.hero_crest || 0;

  const statusCard = `
    <section class="card">
      <div class="card-title">
        <span>🏰 ${escapeHtml(run.dungeonName)} - 第${run.floor}/${run.totalFloors}階層</span>
        <span style="font-size:11px;color:var(--text-muted)">Step ${Math.min(run.stepIndex + 1, totalSteps)}/${totalSteps}</span>
      </div>
      <div class="dungeon-step-dots">${dotsHtml}</div>
      <div class="formation-grid" style="margin-top:8px;">${partyStatusHtml}</div>
      <div style="margin-top:8px;font-size:11px;color:var(--text-muted);display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px;">
        <span>🎒 未帰還: <strong style="color:var(--accent-gold)">${bag.gold}G</strong> / EXP+${bag.exp} / 装備${bagWeaponCount}個${bagCrestCount > 0 ? ` / 🏅${bagCrestCount}` : ''}${bagHeroCrestCount > 0 ? ` / 👑${bagHeroCrestCount}` : ''}</span>
        ${
          run.buffs.atkPct || run.buffs.defPct || run.buffs.dropPct
            ? `<span style="color:var(--accent-green)">バフ: 攻+${run.buffs.atkPct}% 防+${run.buffs.defPct}% 泥+${run.buffs.dropPct}%</span>`
            : ''
        }
      </div>
    </section>
  `;

  // フェーズ別アクションカード
  let actionCard = '';

  if (run.phase === 'map') {
    const currentRow = run.floorSteps[run.stepIndex] || [];
    actionCard = `
      <section class="card">
        <div class="card-title"><span>行き先を選択してください</span></div>
        <div class="node-grid">
          ${currentRow
            .map(n => {
              const extraClass = n.type === 'boss' ? 'boss' : n.type === 'treasure' ? 'treasure' : n.type === 'fountain' ? 'fountain' : '';
              return `
                <button class="node-btn ${extraClass}" data-select-node="${n.id}">
                  <div style="font-weight:700;font-size:13px;">${n.icon} ${escapeHtml(n.title)}</div>
                  <div style="font-size:11px;color:var(--text-muted);">${escapeHtml(n.desc)}</div>
                </button>
              `;
            })
            .join('')}
        </div>
      </section>
    `;
  } else if (run.phase === 'battle_prep') {
    actionCard = `
      <section class="card" style="border-color:var(--accent-red);">
        <div class="card-title"><span>${run.activeNode.icon} ${escapeHtml(run.activeNode.title)}</span></div>
        <p style="font-size:12px;color:var(--text-muted);margin-bottom:10px;">
          陣形や装備を整えたい場合は「編成・育成」「装備・倉庫」タブで変更できます。準備ができたら戦闘を開始してください。
        </p>
        <button class="btn btn-primary" id="btn-dungeon-battle-start" style="width:100%;">⚔️ 戦闘開始（ワンタップ決着）</button>
      </section>
    `;
  } else if (run.phase === 'battle_result') {
    const b = run.lastBattle;
    const rw = b?.rewards || { gold: 0, exp: 0, droppedWeapons: [], droppedItems: [] };
    const dropNames = [
      ...rw.droppedWeapons.map(w => `[${RARITIES[w.rarity]?.name}] ${w.name}`),
      ...rw.droppedItems.map(id => ITEMS[id]?.name || id)
    ];
    actionCard = `
      <section class="card" style="border-color:var(--accent-gold);">
        <div class="card-title"><span>🏆 戦闘勝利！</span></div>
        <div style="font-size:12px;margin-bottom:8px;">
          獲得: <strong>${rw.gold}G</strong> / <strong>EXP +${rw.exp}</strong>
          ${dropNames.length > 0 ? `<div style="color:var(--accent-gold);margin-top:4px;">ドロップ: ${escapeHtml(dropNames.join(', '))}</div>` : ''}
        </div>
        <div class="btn-row" style="margin-bottom:8px;">
          <button class="btn btn-sm" id="btn-toggle-dungeon-log">${run.showBattleLog ? '詳細ログを隠す' : '詳細ログを見る'}</button>
          <button class="btn btn-primary" id="btn-dungeon-next-step">次へ進む</button>
        </div>
        ${
          run.showBattleLog && b
            ? `<div class="log-box">${b.logs.map(l => `<div class="log-line ${l.type}">${escapeHtml(l.text)}</div>`).join('')}</div>`
            : ''
        }
      </section>
    `;
  } else if (run.phase === 'event') {
    const ev = run.activeEvent;
    actionCard = `
      <section class="card" style="border-color:var(--accent-blue);">
        <div class="card-title"><span>${escapeHtml(ev.title)}</span></div>
        <p style="font-size:12px;color:var(--text-muted);margin-bottom:10px;">${escapeHtml(ev.desc)}</p>
        <div style="display:flex;flex-direction:column;gap:6px;">
          ${ev.choices
            .map(c => `<button class="btn" data-event-choice="${c.id}" style="justify-content:flex-start;text-align:left;">${escapeHtml(c.label)}</button>`)
            .join('')}
        </div>
      </section>
    `;
  } else if (run.phase === 'floor_clear') {
    actionCard = `
      <section class="card" style="border-color:var(--accent-gold);">
        <div class="card-title"><span>👑 第${run.floor}階層ボス撃破！</span></div>
        <p style="font-size:12px;color:var(--text-muted);margin-bottom:10px;">
          このまま次の階層へ挑むか、戦利品を持って安全に帰還するかを選択できます。
        </p>
        <div class="btn-row">
          <button class="btn btn-primary" id="btn-dungeon-next-floor">⬇️ 第${run.floor + 1}階層へ進む</button>
          <button class="btn btn-blue" id="btn-dungeon-retreat">🎒 戦利品を持って帰還</button>
        </div>
      </section>
    `;
  } else if (run.phase === 'dungeon_clear') {
    actionCard = `
      <section class="card" style="border-color:var(--accent-gold);">
        <div class="card-title"><span>🎉 ダンジョン完全制覇！</span></div>
        <p style="font-size:12px;color:var(--text-muted);margin-bottom:10px;">
          最深部のボスを撃破しました！すべての戦利品を持って拠点へ凱旋しましょう！
        </p>
        <button class="btn btn-primary" id="btn-dungeon-retreat" style="width:100%;">🎒 戦利品を持って帰還する</button>
      </section>
    `;
  } else if (run.phase === 'defeat') {
    actionCard = `
      <section class="card" style="border-color:var(--accent-red);">
        <div class="card-title"><span>💀 パーティ全滅…</span></div>
        <p style="font-size:12px;color:var(--text-muted);margin-bottom:10px;">
          全滅したため未帰還戦利品の一部を失いました。残った戦利品を回収して帰還します。
        </p>
        <button class="btn btn-danger" id="btn-dungeon-defeat-claim" style="width:100%;">拠点へ帰還する</button>
      </section>
    `;
  }

  const logsHtml = run.logs.map(t => `<div class="log-line">${escapeHtml(t)}</div>`).join('');

  return `
    ${statusCard}
    ${actionCard}
    <section class="card">
      <div class="card-title"><span>ダンジョン探索ログ</span></div>
      <div class="log-box" style="height:105px;">${logsHtml}</div>
    </section>
  `;
}

function renderAutoExploreSection() {
  const area = explorer.getSelectedArea();
  const mode = store.state.exploreMode;
  const battle = explorer.currentBattle;
  const party = store.getPartyCharacters();

  const allyDisplayUnits = battle
    ? battle.allies
    : party.map((c, idx) => {
        const cs = calculateCombatStats(c, store.getCharacterEquips(c));
        return {
          name: c.name,
          className: CLASSES[c.classId]?.name || '',
          position: idx,
          hp: cs.maxHp,
          maxHp: cs.maxHp,
          mp: cs.maxMp,
          maxMp: cs.maxMp
        };
      });

  const enemyDisplayUnits = battle ? battle.enemies : [];

  // エリアの出現モンスターと固有ドロップ一覧
  const uniqueMonsterIds = [...new Set(area.encounters.flat())];
  const dropHintsHtml = uniqueMonsterIds
    .map(mId => {
      const m = MONSTERS[mId];
      if (!m) return '';
      const dropNames = (m.drops || [])
        .map(d => {
          if (d.kind === 'item') return ITEMS[d.id]?.name;
          if (d.kind === 'armor') return ARMORS[d.id]?.name;
          if (d.kind === 'accessory') return ACCESSORIES[d.id]?.name;
          return WEAPONS[d.id]?.name;
        })
        .filter(Boolean)
        .join('・');
      return `<div><strong>${escapeHtml(m.name)}</strong>(Lv.${m.level}): ${escapeHtml(dropNames || 'なし')}</div>`;
    })
    .join('');

  const renderUnitGrid = (units, isEnemy = false) => {
    const slots = [0, 1, 2, 3].map(pos => {
      const u = units[pos];
      if (!u) {
        return `<div class="unit-card ${pos < 2 ? 'frontline' : 'backline'}" style="opacity:0.25;justify-content:center;align-items:center;font-size:10px;">空</div>`;
      }
      const hpPct = Math.max(0, Math.min(100, Math.round((u.hp / u.maxHp) * 100)));
      const mpPct = u.maxMp > 0 ? Math.max(0, Math.min(100, Math.round((u.mp / u.maxMp) * 100))) : 0;
      const posLabel = pos < 2 ? `前${pos + 1}` : `後${pos + 1}`;
      const deadClass = u.hp <= 0 ? 'dead' : '';
      const elemDef = u.element && u.element !== 'none' ? ELEMENTS[u.element] : null;
      const elemBadge = elemDef
        ? `<span class="elem-badge" style="color:${elemDef.color};border-color:${elemDef.color};">${elemDef.name}</span>`
        : '';
      const statusEntries = Object.entries(u.statuses || {});
      const statusBadges =
        statusEntries.length > 0
          ? `<div class="unit-statuses">${statusEntries
              .map(([stId, stObj]) => {
                const stDef = STATUS_EFFECTS[stId];
                if (!stDef) return '';
                const stackTxt = stObj.stacks > 1 ? `x${stObj.stacks}` : '';
                return `<span class="status-badge" style="color:${stDef.color};border-color:${stDef.color};">${stDef.name}${stackTxt}</span>`;
              })
              .join('')}</div>`
          : '';
      return `
        <div class="unit-card ${pos < 2 ? 'frontline' : 'backline'} ${deadClass}">
          <div class="unit-pos-tag">
            <span>${posLabel} ${elemBadge}</span>
            <span>${isEnemy ? u.className : ''}</span>
          </div>
          <div class="unit-name" title="${escapeHtml(u.name)}">${escapeHtml(u.name)}</div>
          <div class="unit-sub">${isEnemy ? '' : escapeHtml(u.className)}</div>
          <div class="bar-wrap"><div class="bar-fill-hp ${hpPct <= 30 ? 'low' : ''}" style="width:${hpPct}%"></div></div>
          <div class="bar-nums">${u.hp}/${u.maxHp}</div>
          ${
            !isEnemy
              ? `<div class="bar-wrap"><div class="bar-fill-mp" style="width:${mpPct}%"></div></div>`
              : ''
          }
          ${statusBadges}
        </div>
      `;
    });
    return `<div class="formation-grid">${slots.join('')}</div>`;
  };

  const battleLogsHtml = (battle?.logs || [])
    .slice(-30)
    .map(l => `<div class="log-line ${l.type}">${escapeHtml(l.text)}</div>`)
    .join('');

  const exploreLogsHtml = explorer.exploreLogs
    .map(t => `<div class="log-line">${escapeHtml(t)}</div>`)
    .join('');

  const modeLabel = mode === 'watch' ? '観戦' : '高速';

  return `
    <section class="card" style="padding:10px 12px;">
      <div id="btn-toggle-area-config" style="display:flex;align-items:center;justify-content:space-between;cursor:pointer;gap:8px;">
        <div style="display:flex;align-items:center;gap:6px;min-width:0;">
          <span style="font-size:13px;font-weight:700;color:var(--accent-gold);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
            📍 ${escapeHtml(area.name)}（Lv.${area.recommendedLv}〜）
          </span>
          <span style="font-size:10px;background:var(--bg-card-alt);border:1px solid var(--border);padding:1px 6px;border-radius:999px;color:var(--accent-blue);flex-shrink:0;">
            ${modeLabel}
          </span>
        </div>
        <span style="font-size:11px;color:var(--text-muted);flex-shrink:0;">
          ${isAreaConfigOpen ? '▲ 閉じる' : '▼ エリア変更'}
        </span>
      </div>

      ${
        isAreaConfigOpen
          ? `
        <div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border);">
          <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted);margin-bottom:4px;">
            <span>探索エリア選択</span>
            <span>戦績: ${store.state.stats.victories}/${store.state.stats.totalBattles}勝</span>
          </div>
          <select class="select-input" id="select-area">
            ${AREAS.map(
              a => `<option value="${a.id}" ${a.id === area.id ? 'selected' : ''}>${a.name}（推奨Lv.${a.recommendedLv}〜）</option>`
            ).join('')}
          </select>
          <p class="area-desc">${escapeHtml(area.description)}</p>
          <details class="drop-hint-box" id="drop-hint-details" ${isDropHintOpen ? 'open' : ''}>
            <summary style="font-weight:700;color:var(--accent-blue);cursor:pointer;list-style:none;">
              ▶ 出現モンスター＆固有ドロップ狙い目（タップで開閉）
            </summary>
            <div style="margin-top:6px;">${dropHintsHtml}</div>
          </details>
          <div style="margin-top:10px;">
            <div class="mode-toggle">
              <button class="mode-btn ${mode === 'watch' ? 'active' : ''}" data-mode="watch">観戦モード</button>
              <button class="mode-btn ${mode === 'fast' ? 'active' : ''}" data-mode="fast">高速周回</button>
            </div>
          </div>
        </div>
      `
          : ''
      }

      <div class="btn-row" style="margin-top:10px;">
        ${
          explorer.isRunning
            ? `<button class="btn btn-danger" id="btn-toggle-explore">⏹ 自動探索を停止</button>`
            : `<button class="btn btn-primary" id="btn-toggle-explore">▶ 自動探索を開始</button>`
        }
        <button class="btn btn-blue" id="btn-instant-battle">⚡ クイック戦闘</button>
      </div>
    </section>

    <section class="card battle-stage">
      <div>
        <div class="team-label">
          <span>敵パーティ（前衛2 / 後衛2）</span>
          <span>${battle ? `Round ${battle.round}` : '待機中'}</span>
        </div>
        ${renderUnitGrid(enemyDisplayUnits, true)}
      </div>
      <div>
        <div class="team-label">
          <span>味方パーティ（左から1〜4番目）</span>
          <span>前衛:赤 / 後衛:青</span>
        </div>
        ${renderUnitGrid(allyDisplayUnits, false)}
      </div>
    </section>

    <section class="card">
      <div class="card-title"><span>戦闘ログ</span></div>
      <div class="log-box" id="battle-log-box">${battleLogsHtml || '<div class="log-line" style="color:var(--text-muted)">まだ戦闘が開始されていません。</div>'}</div>
    </section>

    <section class="card">
      <div class="card-title"><span>探索・ドロップ履歴</span></div>
      <div class="log-box" style="height:110px;">${exploreLogsHtml}</div>
    </section>
  `;
}

/* =========================================================
 * 2. 編成・育成タブ
 * ======================================================= */
function renderPartyTab() {
  const party = store.getPartyCharacters();
  const bench = store.state.roster.filter(c => !store.state.partyIds.includes(c.id));
  const detailChar =
    store.state.roster.find(c => c.id === selectedCharId) || party[0];

  const hateLabels = ['40%', '30%', '20%', '10%'];

  const slotsHtml = [0, 1, 2, 3]
    .map(idx => {
      const c = party[idx];
      const isFront = idx < 2;
      const isSelected = c && detailChar && c.id === detailChar.id;
      const isSwapSource = swapSourceIndex === idx;
      if (!c) {
        return `
          <div class="party-slot-item" data-slot-idx="${idx}">
            <div>
              <span class="slot-badge ${isFront ? 'front' : 'back'}">${isFront ? '前衛' : '後衛'} ${idx + 1}</span>
              <span style="color:var(--text-muted)">空きスロット</span>
            </div>
          </div>
        `;
      }
      const cls = CLASSES[c.classId];
      const race = RACES[c.raceId];
      return `
        <div class="party-slot-item ${isSelected ? 'selected' : ''}" data-slot-idx="${idx}" data-char-id="${c.id}">
          <div>
            <span class="slot-badge ${isFront ? 'front' : 'back'}">${isFront ? '前衛' : '後衛'} ${idx + 1}</span>
            <strong>${escapeHtml(c.name)}</strong>
            <span style="font-size:11px;color:var(--text-muted);margin-left:4px;">Lv.${c.level} ${race?.name}/${cls?.name}</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="font-size:10px;color:var(--text-muted)">ヘイト${hateLabels[idx]}</span>
            <button class="btn btn-sm ${isSwapSource ? 'btn-primary' : ''}" data-swap-idx="${idx}">
              ${isSwapSource ? '入替先?' : '入替'}
            </button>
          </div>
        </div>
      `;
    })
    .join('');

  let detailHtml = '';
  if (detailChar) {
    const race = RACES[detailChar.raceId];
    const cls = CLASSES[detailChar.classId];
    const pers = PERSONALITIES[detailChar.personalityId];
    const equips = store.getCharacterEquips(detailChar);
    const rates = getGrowthRates(
      detailChar,
      equips.familiar,
      store.getBlessingBonus('growth_boost')
    );
    const combat = calculateCombatStats(detailChar, equips);
    const neededExp = getExpForNextLevel(detailChar.level);

    const thresholds = [];
    if (combat.thresholds.strTier > 0) thresholds.push(`力閾値: 物攻+${combat.thresholds.strTier * 5}%`);
    if (combat.thresholds.magTier > 0) thresholds.push(`魔力閾値: 魔攻+${combat.thresholds.magTier * 5}%`);
    if (combat.thresholds.defTier > 0) thresholds.push(`守備閾値: 被物-${combat.thresholds.defTier * 3}%`);
    if (combat.thresholds.resTier > 0) thresholds.push(`魔防閾値: 被魔-${combat.thresholds.resTier * 3}%`);
    if (combat.thresholds.spdTier > 0) thresholds.push(`速さ閾値: 回避+${combat.thresholds.spdTier * 3}% / 追撃+${combat.thresholds.spdTier * 5}%`);
    if (combat.thresholds.sklTier > 0) thresholds.push(`技閾値: 会心ダメ+${combat.thresholds.sklTier * 10}%`);

    // クラスチェンジセクション
    const nextClassIds = cls?.nextClasses || [];
    let ccHtml = '';
    if (nextClassIds.length > 0) {
      const optionsHtml = nextClassIds
        .map(nextId => {
          const nextCls = CLASSES[nextId];
          const check = canClassChange(
            detailChar,
            nextId,
            store.state.items,
            store.state.unlockedHiddenClasses
          );
          const bonusText = nextCls.promotionBonus
            ? Object.entries(nextCls.promotionBonus)
                .map(([k, v]) => `${STAT_LABELS[k]}+${v}`)
                .join(' ')
            : '';
          return `
            <div class="cc-option">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <div>
                  <strong>${escapeHtml(nextCls.name)}</strong>
                  <span style="font-size:10px;color:var(--accent-blue);margin-left:4px;">Tier ${nextCls.tier} (上限Lv.${nextCls.maxLevel})</span>
                </div>
                ${
                  check.ok
                    ? `<button class="btn btn-sm btn-primary" data-promote-to="${nextId}">✨ 転職</button>`
                    : `<span style="font-size:10px;color:var(--text-muted);">${escapeHtml(check.reason)}</span>`
                }
              </div>
              <div style="font-size:11px;color:var(--text-muted);margin-top:3px;">
                ${escapeHtml(nextCls.passiveDescription)}
                ${bonusText ? `<br/><span style="color:var(--accent-green);">昇格ボーナス: ${bonusText}</span>` : ''}
              </div>
            </div>
          `;
        })
        .join('');

      ccHtml = `
        <div class="cc-card">
          <div style="font-size:12px;font-weight:700;color:var(--accent-gold);">
            🌟 クラスチェンジ（現在 Tier ${cls.tier} / 上限Lv.${cls.maxLevel}）
          </div>
          ${optionsHtml}
        </div>
      `;
    }

    const historySet = new Set(detailChar.classHistory || [detailChar.classId]);
    const activeSkill = getClassActiveSkill(detailChar.classId);
    const activeChance = activeSkill
      ? getActiveSkillActivationChance(detailChar, activeSkill, equips.familiar)
      : 0;

    const skillsHtml = `
      <div class="skill-box">
        <div class="skill-item">
          <span class="skill-tag passive">パッシブ</span>
          <span class="skill-desc">${escapeHtml(cls?.passiveDescription || 'なし')}</span>
        </div>
        ${
          activeSkill
            ? `
          <div class="skill-item">
            <span class="skill-tag active">アクティブ</span>
            <div style="flex:1;min-width:0;">
              <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;">
                <strong style="font-size:12px;color:var(--accent-gold);">${escapeHtml(activeSkill.name)}</strong>
                <span style="font-size:10px;color:var(--accent-blue);">MP ${activeSkill.mpCost} / 発動率 ${activeChance}% (${STAT_LABELS[activeSkill.scaleStat]}依存)</span>
              </div>
              <div class="skill-desc">${escapeHtml(activeSkill.description)}</div>
            </div>
          </div>
        `
            : ''
        }
      </div>
    `;

    const treeHtml = `
      <div class="class-tree-wrap">
        <button id="btn-toggle-class-tree" class="btn btn-sm" style="width:100%;display:flex;justify-content:space-between;align-items:center;background:var(--bg-card-alt);border:1px solid var(--border);color:var(--text-main);">
          <span>🌳 クラスツリー・職歴 / 初期職へ転職 (習得済 ${historySet.size}職)</span>
          <span style="font-size:11px;color:var(--text-muted);">${isClassTreeOpen ? '▲ 閉じる' : '▼ 開く'}</span>
        </button>
        ${
          isClassTreeOpen
            ? `
          <div class="class-tree-panel">
            <div style="font-size:11px;color:var(--text-muted);margin-bottom:8px;">
              ※ ★現在職 / ✓習得済。初期職（Tier 1）へ転職すると<strong style="color:var(--accent-red);">基礎ステータスが半減しLv.1</strong>に戻りますが、別系統の育成やさらなる鍛錬が可能です。
            </div>
            ${CLASS_TREES.map(tree => {
              const rootCls = CLASSES[tree.rootId];
              const reclassCheck = canReclassToTier1(detailChar, tree.rootId);
              return `
                <div class="tree-group">
                  <div class="tree-group-header">
                    <span style="font-weight:700;font-size:12px;">${escapeHtml(tree.name)}</span>
                    ${
                      reclassCheck.ok
                        ? `<button class="btn btn-sm" style="font-size:10px;padding:2px 8px;background:rgba(245,158,11,0.18);border:1px solid var(--accent-gold);color:var(--accent-gold);" data-reclass-tier1="${tree.rootId}">🔄 ${escapeHtml(rootCls.name)}へ転職</button>`
                        : `<span style="font-size:10px;color:var(--text-muted);">${escapeHtml(reclassCheck.reason)}</span>`
                    }
                  </div>
                  ${tree.branches
                    .map(
                      branch => `
                    <div class="tree-branch-row">
                      ${branch
                        .map((cid, idx) => {
                          const cDef = CLASSES[cid];
                          const isCurrent = detailChar.classId === cid;
                          const isDone = historySet.has(cid);
                          const nodeClass = isCurrent ? 'current' : isDone ? 'done' : '';
                          const mark = isCurrent ? '★' : isDone ? '✓' : '';
                          const arrow = idx > 0 ? '<span class="tree-arrow">›</span>' : '';
                          return `${arrow}<span class="tree-node ${nodeClass}" title="${escapeHtml(cDef?.name || cid)} (Tier ${cDef?.tier || '?'})">${mark}${escapeHtml(cDef?.name || cid)}</span>`;
                        })
                        .join('')}
                    </div>
                  `
                    )
                    .join('')}
                </div>
              `;
            }).join('')}
          </div>
        `
            : ''
        }
      </div>
    `;

    detailHtml = `
      <section class="card">
        <div class="card-title">
          <span>${escapeHtml(detailChar.name)}（Lv.${detailChar.level} / ${cls?.maxLevel || 10}）</span>
          <span style="font-size:11px;color:var(--text-muted)">EXP ${detailChar.exp}/${neededExp}</span>
        </div>
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:8px;">
          種族: <strong style="color:var(--text-main)">${race?.name}</strong> ／
          職業: <strong style="color:var(--text-main)">${cls?.name} (Tier ${cls?.tier})</strong> ／
          性格: <strong style="color:var(--text-main)">${pers?.name}</strong>
          ${detailChar.trainingCount ? ` ／ <strong style="color:#ff9c9c;">鍛錬+${detailChar.trainingCount}</strong>` : ''}
          <div style="margin-top:4px;font-size:11px;">装備武器: <span class="rarity-${combat.weapon.rarity || 'common'}">${escapeHtml(combat.weapon.name)}</span> ／ 使い魔: ${equips.familiar ? `<span class="rarity-${equips.familiar.rarity}">${escapeHtml(equips.familiar.name)}</span>` : 'なし'}</div>
        </div>

        ${skillsHtml}
        ${ccHtml}
        ${treeHtml}

        <div style="font-size:11px;font-weight:700;color:var(--text-muted);margin:10px 0 4px;">基礎ステータス（青字は成長率）</div>
        <div class="stat-grid">
          ${STAT_KEYS.map(k => `
            <div class="stat-cell">
              <span class="label">${STAT_LABELS[k]}</span>
              <span>
                <span class="val">${detailChar.baseStats[k]}</span>
                <span class="growth">(${rates[k]}%)</span>
              </span>
            </div>
          `).join('')}
        </div>

        <div style="font-size:11px;font-weight:700;color:var(--text-muted);margin:10px 0 4px;">戦闘ステータス（二段階計算）</div>
        <div class="stat-grid">
          <div class="stat-cell"><span class="label">最大HP / MP</span><span class="val">${combat.maxHp} / ${combat.maxMp}</span></div>
          <div class="stat-cell"><span class="label">物攻 / 魔攻</span><span class="val">${combat.physAtk} / ${combat.magAtk}</span></div>
          <div class="stat-cell"><span class="label">物防 / 魔防</span><span class="val">${combat.physDef} / ${combat.magDef}</span></div>
          <div class="stat-cell"><span class="label">命中 / 回避</span><span class="val">${combat.hitRate}% / ${combat.evaRate}%</span></div>
          <div class="stat-cell"><span class="label">会心 / 倍率</span><span class="val">${combat.critRateBase}% / ${combat.critDmgPct}%</span></div>
          <div class="stat-cell"><span class="label">ドロップ補正</span><span class="val">${combat.dropRatePct}%</span></div>
          <div class="stat-cell"><span class="label">攻撃属性</span><span class="val" style="color:${ELEMENTS[combat.attackElement || 'none']?.color || '#9ca3af'}">${ELEMENTS[combat.attackElement || 'none']?.fullName || '無属性'}</span></div>
        </div>

        ${
          thresholds.length > 0
            ? `<div style="margin-top:8px;">${thresholds.map(t => `<span class="threshold-chip">${t}</span>`).join('')}</div>`
            : `<div style="margin-top:8px;font-size:11px;color:var(--text-muted);">※基礎ステータス20以上で段階的閾値ボーナスが解放されます</div>`
        }
      </section>
    `;
  }

  const benchHtml =
    bench.length > 0
      ? `
    <section class="card">
      <div class="card-title"><span>控えメンバー（タップで詳細 / 4番目と交代）</span></div>
      ${bench
        .map(c => {
          const cls = CLASSES[c.classId];
          const race = RACES[c.raceId];
          return `
            <div class="weapon-item" data-bench-id="${c.id}">
              <div>
                <strong>${escapeHtml(c.name)}</strong>
                <span style="font-size:11px;color:var(--text-muted);margin-left:6px;">Lv.${c.level} ${race?.name} / ${cls?.name}</span>
              </div>
              <button class="btn btn-sm btn-blue" data-put-party="${c.id}">編成へ</button>
            </div>
          `;
        })
        .join('')}
    </section>
  `
      : '';

  return `
    <section class="card">
      <div class="card-title">
        <span>パーティ隊列（1〜2前衛 / 3〜4後衛）</span>
        <span style="font-size:11px;color:var(--text-muted)">入替ボタンで順変更</span>
      </div>
      <div class="party-slot-list">${slotsHtml}</div>
    </section>
    ${detailHtml}
    ${benchHtml}
  `;
}

/* =========================================================
 * 3. 装備・倉庫タブ（2階層タブ＆武器/防具/装飾対応）
 * ======================================================= */
function formatEquipStats(eq) {
  if (eq.slot === 'familiar') {
    return eq.description || '使い魔';
  }
  const parts = [];
  if (eq.atk) parts.push(`物攻+${eq.atk}`);
  if (eq.mag) parts.push(`魔攻+${eq.mag}`);
  if (eq.hp) parts.push(`HP+${eq.hp}`);
  if (eq.mp) parts.push(`MP+${eq.mp}`);
  if (eq.def) parts.push(`物防+${eq.def}`);
  if (eq.res) parts.push(`魔防+${eq.res}`);
  if (eq.hit) parts.push(`命中+${eq.hit}`);
  if (eq.crit) parts.push(`会心+${eq.crit}`);
  if (eq.eva) parts.push(`回避${eq.eva > 0 ? `+${eq.eva}` : eq.eva}`);
  if (eq.dropBonus) parts.push(`泥+${eq.dropBonus}%`);
  if (eq.initiativeBonus) parts.push(`先制+${eq.initiativeBonus}`);
  return parts.join(' ');
}

function renderEquipTab() {
  const roster = store.state.roster;
  const target = roster.find(c => c.id === equipTargetCharId) || roster[0];
  const cls = target ? CLASSES[target.classId] : null;
  const equips = store.getCharacterEquips(target);
  const allowedArmors = target ? getAllowedArmors(target.classId) : [];

  // 大カテゴリに応じたリスト・種別マップ
  const rawList = store.getEquipListBySlot(equipCategoryTab);
  const typeMap =
    equipCategoryTab === 'armor'
      ? ARMOR_TYPES
      : equipCategoryTab === 'accessory'
      ? ACCESSORY_TYPES
      : equipCategoryTab === 'familiar'
      ? FAMILIAR_TYPES
      : WEAPON_TYPES;

  const isTypeAllowed = typeId => {
    if (!cls) return false;
    if (equipCategoryTab === 'weapon') return cls.allowedWeapons.includes(typeId);
    if (equipCategoryTab === 'armor') return allowedArmors.includes(typeId);
    return true; // アクセサリーは全職業装備可
  };

  // 小種別タブ（所持数カウント付き）
  const typeCounts = {};
  for (const item of rawList) {
    typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
  }

  const subTabsHtml = `
    <div class="sub-chip-scroll">
      <button class="sub-chip ${equipSubTypeTab === 'all' ? 'active' : ''}" data-equip-subtype="all">
        すべて (${rawList.length})
      </button>
      ${Object.values(typeMap)
        .map(t => {
          const cnt = typeCounts[t.id] || 0;
          const allowed = isTypeAllowed(t.id);
          return `
            <button class="sub-chip ${equipSubTypeTab === t.id ? 'active' : ''} ${allowed ? '' : 'unusable'}" data-equip-subtype="${t.id}">
              ${escapeHtml(t.name)} (${cnt})
            </button>
          `;
        })
        .join('')}
    </div>
  `;

  // フィルタ & テンプレートごとにグループ化
  const rarityRank = { mythic: 6, legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 };
  const filteredList = rawList
    .filter(item => equipSubTypeTab === 'all' || item.type === equipSubTypeTab)
    .sort((a, b) => {
      const rDiff = (rarityRank[b.rarity] || 0) - (rarityRank[a.rarity] || 0);
      if (rDiff !== 0) return rDiff;
      const powerA = (a.atk || 0) + (a.mag || 0) + (a.def || 0) + (a.res || 0);
      const powerB = (b.atk || 0) + (b.mag || 0) + (b.def || 0) + (b.res || 0);
      return powerB - powerA;
    });

  const tplMap =
    equipCategoryTab === 'armor'
      ? ARMORS
      : equipCategoryTab === 'accessory'
      ? ACCESSORIES
      : equipCategoryTab === 'familiar'
      ? FAMILIARS
      : WEAPONS;

  const groupsMap = new Map();
  for (const eq of filteredList) {
    const key = `${equipCategoryTab}:${eq.templateId || eq.name}`;
    if (!groupsMap.has(key)) {
      groupsMap.set(key, {
        key,
        templateId: eq.templateId,
        baseName: tplMap[eq.templateId]?.name || eq.name,
        type: eq.type,
        items: []
      });
    }
    groupsMap.get(key).items.push(eq);
  }
  const equipGroups = [...groupsMap.values()];

  const currentSlotUid =
    equipCategoryTab === 'armor'
      ? target?.equippedArmorUid
      : equipCategoryTab === 'accessory'
      ? target?.equippedAccessoryUid
      : equipCategoryTab === 'familiar'
      ? target?.equippedFamiliarUid
      : target?.equippedWeaponUid;

  const renderSlotCard = (slotKey, icon, label, eqObj) => {
    const isActive = equipCategoryTab === slotKey;
    return `
      <div class="equip-slot-card ${isActive ? 'active' : ''}" data-equip-cat="${slotKey}">
        <div class="equip-slot-label">
          <span>${icon} ${label}</span>
          ${
            eqObj
              ? `<span data-unequip-slot="${slotKey}" style="color:var(--accent-red);font-weight:700;padding:0 3px;" title="外す">✕</span>`
              : ''
          }
        </div>
        <div class="equip-slot-name rarity-${eqObj?.rarity || 'common'}">
          ${eqObj ? escapeHtml(eqObj.name) : '<span style="color:var(--text-muted);font-weight:400;">未装備</span>'}
        </div>
      </div>
    `;
  };

  return `
    <section class="card">
      <div class="card-title"><span>装備中キャラクター</span></div>
      <select class="select-input" id="select-equip-char">
        ${roster
          .map(c => {
            const cCls = CLASSES[c.classId];
            return `<option value="${c.id}" ${target && c.id === target.id ? 'selected' : ''}>${escapeHtml(c.name)}（Lv.${c.level} ${cCls?.name}）</option>`;
          })
          .join('')}
      </select>
      <div class="equip-slot-row">
        ${renderSlotCard('weapon', '⚔️', '武器', equips.weapon)}
        ${renderSlotCard('armor', '🛡️', '防具', equips.armor)}
        ${renderSlotCard('accessory', '💍', '装飾', equips.accessory)}
        ${renderSlotCard('familiar', '🐾', '使い魔', equips.familiar)}
      </div>
      ${
        target && cls
          ? `<div style="margin-top:8px;font-size:11px;color:var(--text-muted);">
              装備可: 武器[${cls.allowedWeapons.map(t => WEAPON_TYPES[t]?.name).join('・')}] / 防具[${allowedArmors.map(t => ARMOR_TYPES[t]?.name).join('・')}] / 装飾・使い魔[全て]
            </div>`
          : ''
      }
    </section>

    <section class="card">
      <div class="card-title">
        <span>倉庫・装備変更</span>
        <button class="btn btn-sm" id="btn-sell-commons">💰 コモン一括売却</button>
      </div>

      <div class="equip-cat-tabs">
        <button class="equip-cat-tab ${equipCategoryTab === 'weapon' ? 'active' : ''}" data-equip-cat="weapon">
          ⚔️ 武器 (${store.state.weapons.length})
        </button>
        <button class="equip-cat-tab ${equipCategoryTab === 'armor' ? 'active' : ''}" data-equip-cat="armor">
          🛡️ 防具 (${store.state.armors.length})
        </button>
        <button class="equip-cat-tab ${equipCategoryTab === 'accessory' ? 'active' : ''}" data-equip-cat="accessory">
          💍 装飾 (${store.state.accessories.length})
        </button>
        <button class="equip-cat-tab ${equipCategoryTab === 'familiar' ? 'active' : ''}" data-equip-cat="familiar">
          🐾 使い魔 (${(store.state.familiars || []).length})
        </button>
      </div>

      ${subTabsHtml}

      ${
        equipGroups.length === 0
          ? '<p style="font-size:12px;color:var(--text-muted);padding:8px 0;">該当する装備がありません。</p>'
          : equipGroups
              .map(group => {
                const isOpen = expandedEquipGroups.has(group.key);
                const topRarity = group.items[0]?.rarity || 'common';
                const canEquip = isTypeAllowed(group.type);
                const typeName = typeMap[group.type]?.name || group.type;
                const hasEquippedByTarget = group.items.some(i => i.uid === currentSlotUid);

                // レアリティ別カウント
                const rCounts = { mythic: 0, legendary: 0, epic: 0, rare: 0, uncommon: 0, common: 0 };
                for (const item of group.items) {
                  rCounts[item.rarity] = (rCounts[item.rarity] || 0) + 1;
                }
                const rBadgesHtml = ['mythic', 'legendary', 'epic', 'rare', 'uncommon', 'common']
                  .filter(r => rCounts[r] > 0)
                  .map(
                    r =>
                      `<span class="rarity-count-badge rarity-${r}">${RARITIES[r].short || RARITIES[r].name[0]}${rCounts[r]}</span>`
                  )
                  .join('');

                const itemsHtml = group.items
                  .map(eq => {
                    const isEquippedByTarget = currentSlotUid === eq.uid;
                    const owner = store.getEquipOwner(equipCategoryTab, eq.uid);
                    const sellPrice = RARITIES[eq.rarity]?.sellPrice || 20;
                    const rarityName = RARITIES[eq.rarity]?.name || '';
                    const traitChips = (eq.traits || [])
                      .map(tid => WEAPON_TRAITS[tid]?.label || tid)
                      .map(lbl => `<span class="trait-chip">${escapeHtml(lbl)}</span>`)
                      .join('');

                    return `
                      <div class="equip-card-item border-${eq.rarity || 'common'}">
                        <div style="flex:1;padding-right:8px;">
                          <div class="rarity-${eq.rarity}" style="font-weight:700;font-size:12px;">
                            [${rarityName}] ${escapeHtml(eq.name)}
                          </div>
                          <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">
                            ${escapeHtml(formatEquipStats(eq))}
                            ${owner ? `<span style="color:var(--accent-gold);margin-left:4px;">(${escapeHtml(owner.name)}装備中)</span>` : ''}
                          </div>
                          ${traitChips ? `<div>${traitChips}</div>` : ''}
                        </div>
                        <div style="display:flex;flex-direction:column;gap:4px;align-items:flex-end;">
                          ${
                            isEquippedByTarget
                              ? `<span class="btn btn-sm" style="opacity:0.6;cursor:default;">装備中</span>`
                              : canEquip
                              ? `<button class="btn btn-sm btn-primary" data-equip-uid="${eq.uid}">装備</button>`
                              : `<span style="font-size:10px;color:var(--text-muted);">装備不可</span>`
                          }
                          ${
                            !owner
                              ? `<button class="btn btn-sm btn-danger" data-sell-uid="${eq.uid}">売 ${sellPrice}G</button>`
                              : ''
                          }
                        </div>
                      </div>
                    `;
                  })
                  .join('');

                return `
                  <div class="equip-group border-${topRarity}">
                    <div class="equip-group-header" data-toggle-equip-group="${escapeHtml(group.key)}" style="padding:7px 10px;">
                      <div class="rarity-${topRarity}" style="font-weight:700;font-size:12px;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                        ${hasEquippedByTarget ? '★' : ''}${escapeHtml(group.baseName)}
                        <span style="font-size:10px;color:var(--text-muted);font-weight:400;">[${typeName}]×${group.items.length}</span>
                      </div>
                      <div style="display:flex;align-items:center;gap:4px;flex-shrink:0;">
                        ${rBadgesHtml}
                        <span style="font-size:11px;color:var(--text-muted);margin-left:2px;">${isOpen ? '▴' : '▾'}</span>
                      </div>
                    </div>
                    ${isOpen ? `<div class="equip-group-body">${itemsHtml}</div>` : ''}
                  </div>
                `;
              })
              .join('')
      }
    </section>
  `;
}

/* =========================================================
 * 4. 酒場・募集タブ
 * ======================================================= */
function renderTavernTab() {
  const race = RACES[tavernDraft.raceId];
  const cls = CLASSES[tavernDraft.classId];
  const pers = PERSONALITIES[tavernDraft.personalityId];

  const tier1Classes = Object.values(CLASSES).filter(c => c.tier === 1);

  return `
    <section class="card">
      <div class="card-title">
        <span>新規キャラクター作成（酒場募集）</span>
        <button class="btn btn-sm" id="btn-random-draft">🎲 ランダム</button>
      </div>

      <div class="form-group">
        <label class="form-label">名前</label>
        <input class="text-input" id="input-char-name" type="text" maxlength="12" value="${escapeHtml(tavernDraft.name)}" />
      </div>

      <div class="form-group">
        <label class="form-label">種族（基礎ステータスと成長率の土台）</label>
        <select class="select-input" id="select-race">
          ${Object.values(RACES)
            .map(r => `<option value="${r.id}" ${r.id === tavernDraft.raceId ? 'selected' : ''}>${r.name}</option>`)
            .join('')}
        </select>
        <div class="preview-box" style="margin-top:4px;">${escapeHtml(race.description)}</div>
      </div>

      <div class="form-group">
        <label class="form-label">初期職業（Tier 1）</label>
        <select class="select-input" id="select-class">
          ${tier1Classes
            .map(c => `<option value="${c.id}" ${c.id === tavernDraft.classId ? 'selected' : ''}>${c.name}</option>`)
            .join('')}
        </select>
        <div class="preview-box" style="margin-top:4px;">
          武器: ${cls.allowedWeapons.map(t => WEAPON_TYPES[t]?.name).join('・')}<br/>
          パッシブ: ${escapeHtml(cls.passiveDescription)}
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">性格（成長率微補正 & 戦闘AI）</label>
        <select class="select-input" id="select-personality">
          ${Object.values(PERSONALITIES)
            .map(p => `<option value="${p.id}" ${p.id === tavernDraft.personalityId ? 'selected' : ''}>${p.name}</option>`)
            .join('')}
        </select>
        <div class="preview-box" style="margin-top:4px;">AI傾向: ${escapeHtml(pers.aiDescription)}</div>
      </div>

      <button class="btn btn-primary" id="btn-recruit" style="width:100%;margin-top:6px;">
        🍺 この条件で仲間を募集する（無料）
      </button>
    </section>

    <section class="card">
      <div class="card-title"><span>現在の登録メンバー（${store.state.roster.length}人）</span></div>
      <div style="font-size:12px;color:var(--text-muted);">
        ${store.state.roster.map(c => `${escapeHtml(c.name)}(Lv.${c.level} ${CLASSES[c.classId]?.name})`).join('、 ')}
      </div>
    </section>
  `;
}

function formatQuestRewards(rw) {
  if (!rw) return 'なし';
  const parts = [];
  if (rw.gold) parts.push(`💰 ${rw.gold}G`);
  if (rw.items) {
    for (const [id, qty] of Object.entries(rw.items)) {
      parts.push(`✨ ${ITEMS[id]?.name || id}×${qty}`);
    }
  }
  if (rw.uniqueEquip) {
    const ue = rw.uniqueEquip;
    const tpl =
      ue.slot === 'armor'
        ? ARMORS[ue.templateId]
        : ue.slot === 'accessory'
        ? ACCESSORIES[ue.templateId]
        : WEAPONS[ue.templateId];
    const rName = RARITIES[ue.rarity]?.name || '';
    parts.push(`🎁 [${rName}] ${tpl?.name || ue.templateId}`);
  }
  if (rw.familiarId) {
    parts.push(`🐾 使い魔「${FAMILIARS[rw.familiarId]?.name || rw.familiarId}」`);
  }
  if (rw.unlockClassId) {
    parts.push(`🌟 隠し職「${CLASSES[rw.unlockClassId]?.name || rw.unlockClassId}」解放`);
  }
  return parts.join(' / ');
}

function renderQuestTab() {
  const completedCount = (store.state.quests?.completed || []).length;
  const totalCount = QUESTS.length;
  const unlockedHidden = store.state.unlockedHiddenClasses || [];

  const activeCards = [];
  const completedSeriesCards = [];

  for (const series of QUEST_SERIES) {
    const seriesQuests = QUESTS.filter(q => q.seriesId === series.id).sort((a, b) => a.step - b.step);
    const currentQ = seriesQuests.find(q => !store.isQuestCompleted(q.id));

    if (!currentQ) {
      completedSeriesCards.push(`
        <div class="quest-card completed">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <strong style="font-size:12px;">${series.icon} ${escapeHtml(series.title)}（${escapeHtml(series.npc)}）</strong>
            <span style="font-size:10px;color:var(--accent-green);font-weight:700;">✓ 全${seriesQuests.length}話 完結</span>
          </div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">${escapeHtml(series.subtitle)}</div>
        </div>
      `);
      continue;
    }

    const prog = store.getQuestProgress(currentQ);
    const pct = Math.min(100, Math.round((prog.current / Math.max(1, prog.target)) * 100));

    activeCards.push({
      claimable: prog.met,
      html: `
        <div class="quest-card ${prog.met ? 'claimable' : ''}">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;">
            <div style="font-size:12px;font-weight:700;">
              ${series.icon} ${escapeHtml(series.title)}
              <span style="font-size:10px;color:var(--text-muted);font-weight:400;">(${escapeHtml(series.npc)})</span>
            </div>
            <span style="font-size:10px;color:var(--accent-blue);flex-shrink:0;">第${currentQ.step}話 / 全${seriesQuests.length}話</span>
          </div>
          <div style="font-size:12px;font-weight:700;color:var(--accent-gold);margin-top:3px;">
            ${escapeHtml(currentQ.title)}
          </div>
          <div style="font-size:11px;color:var(--text-main);margin-top:3px;line-height:1.45;">
            ${escapeHtml(currentQ.story)}
          </div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:6px;display:flex;justify-content:space-between;">
            <span>条件: ${escapeHtml(currentQ.condition.label)}</span>
            <strong style="color:${prog.met ? 'var(--accent-green)' : 'var(--text-main)'};">${prog.current} / ${prog.target}</strong>
          </div>
          <div class="quest-progress-bar">
            <div class="quest-progress-fill ${prog.met ? 'done' : ''}" style="width:${pct}%"></div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:6px;">
            <div style="font-size:11px;color:var(--accent-gold);min-width:0;">
              報酬: ${escapeHtml(formatQuestRewards(currentQ.rewards))}
            </div>
            ${
              prog.met
                ? `<button class="btn btn-sm btn-primary" style="flex-shrink:0;" data-claim-quest="${currentQ.id}">🎁 報酬受取</button>`
                : `<span style="font-size:10px;color:var(--text-muted);flex-shrink:0;">進行中</span>`
            }
          </div>
        </div>
      `
    });
  }

  // 達成可能を上にソート
  activeCards.sort((a, b) => Number(b.claimable) - Number(a.claimable));

  return `
    <section class="card">
      <div class="card-title">
        <span>📜 サブストーリー・クエスト</span>
        <span style="font-size:11px;color:var(--accent-gold);">達成 ${completedCount} / ${totalCount}</span>
      </div>
      <div style="font-size:11px;color:var(--text-muted);margin-bottom:8px;">
        探索・ダンジョン踏破・育成を進めることで街の人々や謎の存在との物語が進展し、特別な報酬が得られます。
      </div>
      ${
        unlockedHidden.length > 0
          ? `<div class="preview-box" style="margin-bottom:8px;">🌟 解放済み隠し職業: ${unlockedHidden.map(id => `<strong style="color:var(--accent-gold);">${escapeHtml(CLASSES[id]?.name || id)}</strong>`).join(' / ')}</div>`
          : ''
      }
      ${
        activeCards.length > 0
          ? activeCards.map(c => c.html).join('')
          : '<p style="font-size:12px;color:var(--accent-green);">すべてのクエストを達成しました！</p>'
      }
    </section>

    ${
      completedSeriesCards.length > 0
        ? `
      <section class="card">
        <div class="card-title"><span>完結済みストーリー (${completedSeriesCards.length})</span></div>
        ${completedSeriesCards.join('')}
      </section>
    `
        : ''
    }
  `;
}

/* =========================================================
 * 全体レンダリング & イベントバインド
 * ======================================================= */
function render() {
  updateHeader();
  const main = document.getElementById('app-main');
  if (!main) return;

  if (activeTab === 'explore') {
    main.innerHTML = renderExploreTab();
    const logBox = document.getElementById('battle-log-box');
    if (logBox) logBox.scrollTop = logBox.scrollHeight;
  } else if (activeTab === 'party') {
    main.innerHTML = renderPartyTab();
  } else if (activeTab === 'equip') {
    main.innerHTML = renderEquipTab();
  } else if (activeTab === 'tavern') {
    main.innerHTML = renderTavernTab();
  } else if (activeTab === 'quest') {
    main.innerHTML = renderQuestTab();
  }

  bindMainEvents();
}

function bindMainEvents() {
  // 探索サブタブ切替（自動探索 / 手動ダンジョン）
  document.querySelectorAll('[data-explore-sub]').forEach(btn => {
    btn.addEventListener('click', () => {
      exploreSubTab = btn.dataset.exploreSub;
      if (exploreSubTab === 'dungeon' && explorer.isRunning) {
        explorer.stop();
      }
      render();
    });
  });

  // ダンジョンイベント
  document.querySelectorAll('[data-enter-dungeon]').forEach(btn => {
    btn.addEventListener('click', () => {
      lastDungeonSummary = null;
      dungeonCtrl.startDungeon(btn.dataset.enterDungeon);
      render();
    });
  });

  document.querySelectorAll('[data-select-node]').forEach(btn => {
    btn.addEventListener('click', () => {
      dungeonCtrl.selectNode(btn.dataset.selectNode);
      render();
    });
  });

  document.getElementById('btn-dungeon-battle-start')?.addEventListener('click', () => {
    dungeonCtrl.startNodeBattle();
    render();
  });

  document.getElementById('btn-toggle-dungeon-log')?.addEventListener('click', () => {
    if (dungeonCtrl.run) {
      dungeonCtrl.run.showBattleLog = !dungeonCtrl.run.showBattleLog;
      render();
    }
  });

  document.getElementById('btn-dungeon-next-step')?.addEventListener('click', () => {
    dungeonCtrl.confirmBattleResult();
    render();
  });

  document.querySelectorAll('[data-event-choice]').forEach(btn => {
    btn.addEventListener('click', () => {
      dungeonCtrl.resolveEventChoice(btn.dataset.eventChoice);
      render();
    });
  });

  document.getElementById('btn-dungeon-next-floor')?.addEventListener('click', () => {
    dungeonCtrl.proceedNextFloor();
    render();
  });

  document.getElementById('btn-dungeon-retreat')?.addEventListener('click', () => {
    lastDungeonSummary = dungeonCtrl.retreatWithLoot();
    if (!store.state.settings?.skipLevelUpPopup && lastDungeonSummary?.levelUps?.length > 0) {
      levelUpQueue.push(...lastDungeonSummary.levelUps);
    }
    render();
    renderModal();
  });

  document.getElementById('btn-dungeon-defeat-claim')?.addEventListener('click', () => {
    lastDungeonSummary = dungeonCtrl.finishDefeatAndClaimRemaining();
    if (!store.state.settings?.skipLevelUpPopup && lastDungeonSummary?.levelUps?.length > 0) {
      levelUpQueue.push(...lastDungeonSummary.levelUps);
    }
    render();
    renderModal();
  });

  document.getElementById('btn-toggle-area-config')?.addEventListener('click', () => {
    isAreaConfigOpen = !isAreaConfigOpen;
    render();
  });

  document.getElementById('drop-hint-details')?.addEventListener('toggle', e => {
    isDropHintOpen = e.target.open;
  });

  document.getElementById('select-area')?.addEventListener('change', e => {
    store.state.selectedAreaId = e.target.value;
    store.save();
    explorer.currentBattle = null;
    isAreaConfigOpen = false;
    render();
  });

  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      store.state.exploreMode = btn.dataset.mode;
      store.save();
      if (explorer.isRunning) {
        explorer.scheduleNextTick();
      }
      render();
    });
  });

  document.getElementById('btn-toggle-explore')?.addEventListener('click', () => {
    if (explorer.isRunning) {
      explorer.stop();
    } else {
      explorer.start();
    }
  });

  document.getElementById('btn-instant-battle')?.addEventListener('click', () => {
    explorer.resolveInstant();
  });

  document.querySelectorAll('[data-swap-idx]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const idx = Number(btn.dataset.swapIdx);
      if (swapSourceIndex === null) {
        swapSourceIndex = idx;
      } else {
        if (swapSourceIndex !== idx) {
          store.swapPartyPositions(swapSourceIndex, idx);
        }
        swapSourceIndex = null;
      }
      render();
    });
  });

  document.querySelectorAll('.party-slot-item[data-char-id]').forEach(el => {
    el.addEventListener('click', () => {
      selectedCharId = el.dataset.charId;
      render();
    });
  });

  document.querySelectorAll('[data-put-party]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const charId = btn.dataset.putParty;
      const targetSlot = store.state.partyIds.length < 4 ? store.state.partyIds.length : 3;
      store.setPartySlot(targetSlot, charId);
      selectedCharId = charId;
      render();
    });
  });

  document.querySelectorAll('[data-bench-id]').forEach(el => {
    el.addEventListener('click', () => {
      selectedCharId = el.dataset.benchId;
      render();
    });
  });

  // クラスチェンジボタン
  document.querySelectorAll('[data-promote-to]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetClassId = btn.dataset.promoteTo;
      const targetChar =
        store.state.roster.find(c => c.id === selectedCharId) ||
        store.getPartyCharacters()[0];
      if (!targetChar) return;
      const res = store.promoteCharacter(targetChar.id, targetClassId);
      if (!res.ok) {
        alert(res.reason);
      }
      render();
    });
  });

  // クラスツリー開閉＆初期職への転職
  document.getElementById('btn-toggle-class-tree')?.addEventListener('click', () => {
    isClassTreeOpen = !isClassTreeOpen;
    render();
  });

  document.querySelectorAll('[data-reclass-tier1]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetClassId = btn.dataset.reclassTier1;
      const targetChar =
        store.state.roster.find(c => c.id === selectedCharId) ||
        store.getPartyCharacters()[0];
      if (!targetChar) return;
      const targetName = CLASSES[targetClassId]?.name || targetClassId;
      if (
        !confirm(
          `${targetChar.name} を初期職業「${targetName}」へ転職させますか？\n※ 現在の基礎ステータスが半減し、Lv.1 に戻ります（職歴は記録されます）。`
        )
      ) {
        return;
      }
      const res = store.reclassCharacterToTier1(targetChar.id, targetClassId);
      if (!res.ok) {
        alert(res.reason);
      }
      render();
    });
  });

  // 装備タブイベント
  document.getElementById('select-equip-char')?.addEventListener('change', e => {
    equipTargetCharId = e.target.value;
    render();
  });

  document.querySelectorAll('[data-equip-cat]').forEach(el => {
    el.addEventListener('click', () => {
      const nextCat = el.dataset.equipCat;
      if (equipCategoryTab !== nextCat) {
        equipCategoryTab = nextCat;
        equipSubTypeTab = 'all';
      }
      render();
    });
  });

  document.querySelectorAll('[data-unequip-slot]').forEach(el => {
    el.addEventListener('click', e => {
      e.stopPropagation();
      store.unequipItem(equipTargetCharId, el.dataset.unequipSlot);
      render();
    });
  });

  document.querySelectorAll('[data-equip-subtype]').forEach(btn => {
    btn.addEventListener('click', () => {
      equipSubTypeTab = btn.dataset.equipSubtype;
      render();
    });
  });

  document.querySelectorAll('[data-toggle-equip-group]').forEach(el => {
    el.addEventListener('click', () => {
      const key = el.dataset.toggleEquipGroup;
      if (expandedEquipGroups.has(key)) {
        expandedEquipGroups.delete(key);
      } else {
        expandedEquipGroups.add(key);
      }
      render();
    });
  });

  document.querySelectorAll('[data-equip-uid]').forEach(btn => {
    btn.addEventListener('click', () => {
      store.equipItem(equipTargetCharId, equipCategoryTab, btn.dataset.equipUid);
      render();
    });
  });

  document.querySelectorAll('[data-sell-uid]').forEach(btn => {
    btn.addEventListener('click', () => {
      store.sellEquipment(equipCategoryTab, btn.dataset.sellUid);
      render();
    });
  });

  document.getElementById('btn-sell-commons')?.addEventListener('click', () => {
    const res = store.sellAllUnequippedCommons(equipCategoryTab);
    if (res.count === 0) {
      alert('売却できる未装備のコモン装備がありません。');
    }
    render();
  });

  // 酒場タブイベント
  document.getElementById('input-char-name')?.addEventListener('input', e => {
    tavernDraft.name = e.target.value;
  });
  document.getElementById('select-race')?.addEventListener('change', e => {
    tavernDraft.raceId = e.target.value;
    render();
  });
  document.getElementById('select-class')?.addEventListener('change', e => {
    tavernDraft.classId = e.target.value;
    render();
  });
  document.getElementById('select-personality')?.addEventListener('change', e => {
    tavernDraft.personalityId = e.target.value;
    render();
  });

  document.getElementById('btn-random-draft')?.addEventListener('click', () => {
    const raceKeys = Object.keys(RACES);
    const tier1Keys = Object.values(CLASSES).filter(c => c.tier === 1).map(c => c.id);
    const persKeys = Object.keys(PERSONALITIES);
    tavernDraft.name = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    tavernDraft.raceId = raceKeys[Math.floor(Math.random() * raceKeys.length)];
    tavernDraft.classId = tier1Keys[Math.floor(Math.random() * tier1Keys.length)];
    tavernDraft.personalityId = persKeys[Math.floor(Math.random() * persKeys.length)];
    render();
  });

  document.getElementById('btn-recruit')?.addEventListener('click', () => {
    const name = (tavernDraft.name || '').trim() || '名無しの冒険者';
    const created = store.recruitCharacter({
      name,
      raceId: tavernDraft.raceId,
      classId: tavernDraft.classId,
      personalityId: tavernDraft.personalityId
    });
    selectedCharId = created.id;
    activeTab = 'party';
    document.querySelectorAll('.nav-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === 'party');
    });
    render();
  });

  // クエスト報酬受取
  document.querySelectorAll('[data-claim-quest]').forEach(btn => {
    btn.addEventListener('click', () => {
      const qid = btn.dataset.claimQuest;
      const res = store.claimQuestReward(qid);
      if (!res.ok) {
        alert(res.reason);
      } else {
        alert(`🎉 クエスト達成！\n獲得報酬:\n${res.messages.join('\n')}`);
      }
      render();
    });
  });
}

function renderModal() {
  const root = document.getElementById('modal-root');
  if (!root) return;

  if (levelUpAutoTimer) {
    clearTimeout(levelUpAutoTimer);
    levelUpAutoTimer = null;
  }

  if (showAltarModal) {
    const stones = store.state.starStones || 0;
    const totalKills = store.state.stats?.totalKills || 0;
    const remainForBonus = 100 - (totalKills % 100);

    const blessingsHtml = STAR_BLESSINGS.map(b => {
      const lv = store.getBlessingLevel(b.id);
      const isMax = lv >= b.maxLevel;
      const cost = store.getBlessingCost(b.id);
      const canBuy = !isMax && stones >= cost;
      return `
        <div class="setting-row" style="align-items:center;gap:8px;">
          <div style="min-width:0;flex:1;">
            <div style="font-weight:700;font-size:12px;">
              ${escapeHtml(b.name)}
              <span style="color:var(--accent-gold);margin-left:4px;">Lv.${lv}/${b.maxLevel}</span>
            </div>
            <div style="font-size:11px;color:var(--accent-blue);margin-top:2px;">
              現在: ${escapeHtml(b.formatEffect(lv))}
            </div>
          </div>
          ${
            isMax
              ? `<span style="font-size:11px;color:var(--accent-green);font-weight:700;">MAX</span>`
              : `<button class="btn btn-sm ${canBuy ? 'btn-primary' : ''}" ${canBuy ? '' : 'disabled'} data-upgrade-blessing="${b.id}">💠 ${cost}</button>`
          }
        </div>
      `;
    }).join('');

    const exchangesHtml = STAR_EXCHANGES.map(ex => {
      const canBuy = stones >= ex.cost;
      return `
        <div class="setting-row" style="align-items:center;gap:8px;">
          <div style="min-width:0;flex:1;">
            <div style="font-weight:700;font-size:12px;">${escapeHtml(ex.name)}</div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">${escapeHtml(ex.description)}</div>
          </div>
          <button class="btn btn-sm ${canBuy ? 'btn-primary' : ''}" ${canBuy ? '' : 'disabled'} data-exchange-star="${ex.id}">
            💠 ${ex.cost}
          </button>
        </div>
      `;
    }).join('');

    root.innerHTML = `
      <div class="modal-backdrop" id="modal-backdrop">
        <div class="settings-card" style="max-height:85vh;overflow-y:auto;">
          <div class="card-title">
            <span>💠 星屑の祭壇</span>
            <button class="btn btn-sm" id="btn-close-altar">✕</button>
          </div>
          <div class="preview-box" style="margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">
            <span>所持輝石: <strong style="color:var(--accent-blue);font-size:13px;">💠 ${stones}</strong></span>
            <span style="font-size:11px;color:var(--text-muted);">累計討伐 ${totalKills}体（次+3個まであと ${remainForBonus}体）</span>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px;">
            <button class="btn btn-sm ${altarSubTab === 'blessing' ? 'btn-primary' : ''}" id="btn-altar-tab-blessing">✨ 永続の祝福</button>
            <button class="btn btn-sm ${altarSubTab === 'exchange' ? 'btn-primary' : ''}" id="btn-altar-tab-exchange">🎁 秘宝交換所</button>
          </div>
          ${altarSubTab === 'blessing' ? blessingsHtml : exchangesHtml}
        </div>
      </div>
    `;

    document.getElementById('btn-close-altar')?.addEventListener('click', () => {
      showAltarModal = false;
      renderModal();
    });
    document.getElementById('modal-backdrop')?.addEventListener('click', e => {
      if (e.target.id === 'modal-backdrop') {
        showAltarModal = false;
        renderModal();
      }
    });
    document.getElementById('btn-altar-tab-blessing')?.addEventListener('click', () => {
      altarSubTab = 'blessing';
      renderModal();
    });
    document.getElementById('btn-altar-tab-exchange')?.addEventListener('click', () => {
      altarSubTab = 'exchange';
      renderModal();
    });
    document.querySelectorAll('[data-upgrade-blessing]').forEach(btn => {
      btn.addEventListener('click', () => {
        const res = store.upgradeBlessing(btn.dataset.upgradeBlessing);
        if (!res.ok) alert(res.reason);
        updateHeader();
        render();
        renderModal();
      });
    });
    document.querySelectorAll('[data-exchange-star]').forEach(btn => {
      btn.addEventListener('click', () => {
        const res = store.exchangeStarItem(btn.dataset.exchangeStar);
        if (!res.ok) {
          alert(res.reason);
        } else {
          alert(`✨ ${res.label} を獲得しました！`);
        }
        updateHeader();
        render();
        renderModal();
      });
    });
    return;
  }

  if (showSettingsModal) {
    const skipPopup = Boolean(store.state.settings?.skipLevelUpPopup);
    const debugMode = Boolean(store.state.settings?.debugMode);
    const battleIntervalMs = Number(store.state.settings?.battleIntervalMs || 1000);
    const expMultiplier = Number(store.state.settings?.expMultiplier || 1);
    root.innerHTML = `
      <div class="modal-backdrop" id="modal-backdrop">
        <div class="settings-card">
          <div class="card-title">
            <span>⚙️ ゲーム設定</span>
            <button class="btn btn-sm" id="btn-close-settings">✕</button>
          </div>
          <div class="setting-row">
            <div>
              <div style="font-weight:700;font-size:13px;">レベルアップ演出ポップアップ</div>
              <div style="font-size:11px;color:var(--text-muted);">OFFにするとスキップしてテンポ良く周回できます</div>
            </div>
            <button class="btn btn-sm ${skipPopup ? '' : 'btn-primary'}" id="btn-toggle-lvup-popup">
              ${skipPopup ? 'OFF (スキップ)' : 'ON (表示)'}
            </button>
          </div>
          <div class="setting-row">
            <div>
              <div style="font-weight:700;font-size:13px;">🛠️ デバッグモード</div>
              <div style="font-size:11px;color:var(--text-muted);">ONにすると戦闘間隔や経験値倍率を変更できます</div>
            </div>
            <button class="btn btn-sm ${debugMode ? 'btn-primary' : ''}" id="btn-toggle-debug-mode">
              ${debugMode ? 'ON' : 'OFF'}
            </button>
          </div>
          ${
            debugMode
              ? `
            <div class="setting-row">
              <div>
                <div style="font-weight:700;font-size:12px;">戦闘間隔</div>
                <div style="font-size:10px;color:var(--text-muted);">基本は 1000ms (1秒)</div>
              </div>
              <select class="select-input" id="select-debug-interval" style="width:auto;padding:4px 8px;font-size:12px;">
                ${[100, 250, 500, 1000, 1500, 2000]
                  .map(
                    ms =>
                      `<option value="${ms}" ${battleIntervalMs === ms ? 'selected' : ''}>${ms}ms (${ms / 1000}秒)</option>`
                  )
                  .join('')}
              </select>
            </div>
            <div class="setting-row">
              <div>
                <div style="font-weight:700;font-size:12px;">経験値獲得率</div>
                <div style="font-size:10px;color:var(--text-muted);">通常探索での獲得EXP倍率</div>
              </div>
              <select class="select-input" id="select-debug-exp-mult" style="width:auto;padding:4px 8px;font-size:12px;">
                ${[1, 2, 5, 10, 25, 50]
                  .map(
                    m =>
                      `<option value="${m}" ${expMultiplier === m ? 'selected' : ''}>${m}倍</option>`
                  )
                  .join('')}
              </select>
            </div>
          `
              : ''
          }
          <div class="setting-row" style="border-bottom:none;">
            <div>
              <div style="font-weight:700;font-size:13px;">セーブデータ初期化</div>
              <div style="font-size:11px;color:var(--text-muted);">初期状態からやり直します</div>
            </div>
            <button class="btn btn-sm btn-danger" id="btn-reset-save">初期化</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-close-settings')?.addEventListener('click', () => {
      showSettingsModal = false;
      renderModal();
    });
    document.getElementById('modal-backdrop')?.addEventListener('click', e => {
      if (e.target.id === 'modal-backdrop') {
        showSettingsModal = false;
        renderModal();
      }
    });
    document.getElementById('btn-toggle-lvup-popup')?.addEventListener('click', () => {
      store.setSetting('skipLevelUpPopup', !skipPopup);
      renderModal();
    });
    document.getElementById('btn-toggle-debug-mode')?.addEventListener('click', () => {
      store.setSetting('debugMode', !debugMode);
      renderModal();
    });
    document.getElementById('select-debug-interval')?.addEventListener('change', e => {
      store.setSetting('battleIntervalMs', Number(e.target.value));
    });
    document.getElementById('select-debug-exp-mult')?.addEventListener('change', e => {
      store.setSetting('expMultiplier', Number(e.target.value));
    });
    document.getElementById('btn-reset-save')?.addEventListener('click', () => {
      if (confirm('セーブデータを初期状態にリセットしますか？')) {
        explorer.stop();
        explorer.currentBattle = null;
        dungeonCtrl.run = null;
        lastDungeonSummary = null;
        levelUpQueue = [];
        showSettingsModal = false;
        store.reset();
        selectedCharId = store.state.partyIds[0];
        equipTargetCharId = store.state.partyIds[0];
        render();
        renderModal();
      }
    });
    return;
  }

  if (levelUpQueue.length > 0) {
    const ev = levelUpQueue[0];
    const remainCount = levelUpQueue.length - 1;
    let gainOrder = 0;
    const statsGridHtml = STAT_KEYS.map(k => {
      const g = ev.gains[k] || 0;
      const delayStyle = g > 0 ? `style="--delay: ${250 + gainOrder++ * 300}ms;"` : '';
      return `
        <div class="fe-stat-row ${g > 0 ? 'gained' : ''}" ${delayStyle}>
          <span style="color:var(--text-muted);">${STAT_LABELS[k]}</span>
          <span class="fe-stat-right">
            <strong>${ev.baseStats[k]}</strong>
            ${
              g > 0
                ? `<span class="fe-gain-badge">+${g}</span>`
                : `<span class="fe-gain-badge empty">+0</span>`
            }
          </span>
        </div>
      `;
    }).join('');

    const bannerText = ev.isTraining ? '🔥 極限鍛錬！ 🔥' : '★ LEVEL UP! ★';
    const levelText = ev.isTraining
      ? `Lv.${ev.newLevel}（鍛錬計 ${ev.trainingCount}回）`
      : `Lv.${ev.oldLevel} → Lv.${ev.newLevel}`;

    root.innerHTML = `
      <div class="modal-backdrop" id="lvup-backdrop">
        <div class="fe-levelup-card">
          <div class="fe-levelup-banner">${bannerText}</div>
          <div class="fe-levelup-sub">
            ${escapeHtml(ev.charName)}（${escapeHtml(ev.className)}）
            <span style="color:var(--accent-gold);margin-left:6px;">${levelText}</span>
          </div>
          <div class="fe-stat-grid">
            ${statsGridHtml}
          </div>
          <div class="btn-row">
            ${
              remainCount > 0
                ? `<button class="btn btn-sm" id="btn-lvup-skip-all">すべて閉じる</button>`
                : ''
            }
            <button class="btn btn-primary" id="btn-lvup-next">
              ${remainCount > 0 ? `次へ（残り${remainCount}件）` : 'OK'}
            </button>
          </div>
          <div style="text-align:center;font-size:10px;color:var(--text-muted);margin-top:6px;">
            ※ 演出終了後、そのままにすると自動で閉じます
          </div>
        </div>
      </div>
    `;

    const closeOne = () => {
      if (levelUpAutoTimer) {
        clearTimeout(levelUpAutoTimer);
        levelUpAutoTimer = null;
      }
      levelUpQueue.shift();
      renderModal();
      if (levelUpQueue.length === 0) {
        explorer.resumeAfterPopup();
      }
    };

    const autoCloseDelay = Math.max(2800, 250 + gainOrder * 300 + 2000);
    levelUpAutoTimer = setTimeout(closeOne, autoCloseDelay);

    document.getElementById('btn-lvup-next')?.addEventListener('click', closeOne);
    document.getElementById('lvup-backdrop')?.addEventListener('click', e => {
      if (e.target.id === 'lvup-backdrop') closeOne();
    });
    document.getElementById('btn-lvup-skip-all')?.addEventListener('click', () => {
      if (levelUpAutoTimer) {
        clearTimeout(levelUpAutoTimer);
        levelUpAutoTimer = null;
      }
      levelUpQueue = [];
      renderModal();
      explorer.resumeAfterPopup();
    });
    return;
  }

  root.innerHTML = '';
}

document.querySelectorAll('.nav-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    activeTab = tab.dataset.tab;
    swapSourceIndex = null;
    document.querySelectorAll('.nav-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === activeTab);
    });
    render();
  });
});

document.getElementById('btn-open-settings')?.addEventListener('click', () => {
  showAltarModal = false;
  showSettingsModal = true;
  renderModal();
});

document.getElementById('btn-open-altar')?.addEventListener('click', () => {
  showSettingsModal = false;
  showAltarModal = true;
  renderModal();
});

render();
