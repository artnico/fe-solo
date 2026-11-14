import { AREAS } from '../data/masterData.js';
import { createBattleSession, stepBattle, runBattleToEnd } from './battle.js';
import { store } from '../state/store.js';

export class AutoExploreController {
  constructor(onUpdate, onLevelUps = () => {}) {
    this.onUpdate = onUpdate;
    this.onLevelUps = onLevelUps;
    this.isRunning = false;
    this.isPausedForPopup = false;
    this.currentBattle = null;
    this.exploreLogs = [
      '探索エリアを選択して「自動探索を開始」をタップしてください。'
    ];
    this.timerId = null;
  }

  addExploreLog(text) {
    this.exploreLogs.unshift(text);
    if (this.exploreLogs.length > 40) {
      this.exploreLogs.length = 40;
    }
  }

  getSelectedArea() {
    return AREAS.find(a => a.id === store.state.selectedAreaId) || AREAS[0];
  }

  startNewBattle() {
    const area = this.getSelectedArea();
    const party = store.getPartyCharacters();
    if (party.length === 0) {
      this.addExploreLog('⚠️ パーティにメンバーがいません。編成タブで追加してください。');
      this.stop();
      return null;
    }
    const encounter =
      area.encounters[Math.floor(Math.random() * area.encounters.length)];
    this.currentBattle = createBattleSession(
      party,
      encounter,
      c => store.getCharacterEquips(c),
      area.rarityBonus || 0
    );
    this.addExploreLog(`⚔️ [${area.name}] で敵グループと遭遇！`);
    return this.currentBattle;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    if (!this.currentBattle || this.currentBattle.status !== 'ongoing') {
      this.startNewBattle();
    }
    this.scheduleNextTick();
    this.onUpdate();
  }

  stop() {
    this.isRunning = false;
    this.isPausedForPopup = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.onUpdate();
  }

  resumeAfterPopup() {
    this.isPausedForPopup = false;
    if (this.isRunning) {
      this.scheduleNextTick();
    }
  }

  /**
   * 現在の戦闘を即座にワンタップ決着させる
   */
  resolveInstant() {
    if (!this.currentBattle || this.currentBattle.status !== 'ongoing') {
      this.startNewBattle();
    }
    if (!this.currentBattle) return;
    runBattleToEnd(this.currentBattle);
    this.handleBattleEnd();
    this.onUpdate();
  }

  scheduleNextTick() {
    if (!this.isRunning || this.isPausedForPopup) return;
    if (this.timerId) clearTimeout(this.timerId);

    const mode = store.state.exploreMode;

    if (mode === 'fast') {
      // 高速周回モード
      this.timerId = setTimeout(() => {
        if (!this.isRunning || this.isPausedForPopup) return;
        if (!this.currentBattle || this.currentBattle.status !== 'ongoing') {
          this.startNewBattle();
        }
        if (this.currentBattle) {
          runBattleToEnd(this.currentBattle);
          this.handleBattleEnd();
        }
        this.onUpdate();
        if (this.isRunning && !this.isPausedForPopup) {
          this.scheduleNextTick();
        }
      }, 950);
    } else {
      // 観戦モード（1手ずつ進行）
      const delay =
        !this.currentBattle || this.currentBattle.status !== 'ongoing' ? 1400 : 380;

      this.timerId = setTimeout(() => {
        if (!this.isRunning || this.isPausedForPopup) return;
        if (!this.currentBattle || this.currentBattle.status !== 'ongoing') {
          this.startNewBattle();
        } else {
          const ongoing = stepBattle(this.currentBattle);
          if (!ongoing) {
            this.handleBattleEnd();
          }
        }
        this.onUpdate();
        if (this.isRunning && !this.isPausedForPopup) {
          this.scheduleNextTick();
        }
      }, delay);
    }
  }

  handleBattleEnd() {
    const b = this.currentBattle;
    if (!b) return;
    if (b.status === 'victory') {
      const { messages, levelUps } = store.applyBattleRewards(
        b.rewards,
        store.state.selectedAreaId
      );
      this.addExploreLog(
        `✅ 勝利！ EXP +${b.rewards.exp} / +${b.rewards.gold}G`
      );
      for (const msg of messages) {
        this.addExploreLog(msg);
      }
      if (!store.state.settings?.skipLevelUpPopup && levelUps.length > 0) {
        if (this.isRunning) {
          this.isPausedForPopup = true;
          if (this.timerId) {
            clearTimeout(this.timerId);
            this.timerId = null;
          }
        }
        this.onLevelUps(levelUps);
      }
    } else if (b.status === 'defeat') {
      store.recordDefeat();
      this.addExploreLog('💀 全滅したため拠点へ帰還しました…（自動探索を停止）');
      this.stop();
    } else {
      store.recordDefeat();
      this.addExploreLog('⚖️ 引き分けのため戦闘を離脱しました。');
    }
  }
}
