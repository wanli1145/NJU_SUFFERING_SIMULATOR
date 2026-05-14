// ===== 南大受苦模拟器 - 游戏逻辑 =====

// 游戏状态
let game = {
    player: { hp: 100, maxHp: 100, gpa: 3.5, credits: 0, money: 200, energy: 3, maxEnergy: 3, defense: 0 },
    deck: [],
    currentWeekIndex: 0,
    randomEventPool: [...randomEventPool],
    relicsOwned: [],
    itemsOwned: [],
    // 战斗状态
    battle: null,
    // 状态效果
    statuses: { weak: 0, strength: 0, sick: false, noDamage: false, surviveLethal: false,
        banFun: false, banSocial: false, nextTurnEnergyMod: 0, defenseHalf: false,
        socialFreeCount: 0, studyDmgBonus: 0, allDmgBonus: 0, noGpaThisBattle: false,
        cardsPlayed: 0, highlighterUsed: false, loseDefenseNext: 0, maxCardsThisTurn: 99 },
    pendingAction: null
};

// ===== 工具函数 =====
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function getCardData(cardId) {
    return allCards.find(c => c.id === cardId);
}

function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function showFloatNumber(targetEl, text, type) {
    const rect = targetEl.getBoundingClientRect();
    const num = document.createElement('div');
    num.className = `float-number ${type}`;
    num.textContent = text;
    num.style.left = (rect.left + rect.width / 2 - 20) + 'px';
    num.style.top = (rect.top + rect.height / 3) + 'px';
    document.body.appendChild(num);
    setTimeout(() => num.remove(), 1000);
}

// ===== 界面切换 =====
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function updateAllStats() {
    const p = game.player;
    // GPA 上限 5.0
    p.gpa = Math.min(5.0, p.gpa);
    const hpText = `${Math.max(0, Math.round(p.hp))}/${p.maxHp}`;
    document.getElementById('stat-hp').textContent = hpText;
    document.getElementById('stat-money').textContent = p.money;
    document.getElementById('stat-energy').textContent = p.maxEnergy;
    document.getElementById('event-stat-hp').textContent = hpText;
    document.getElementById('event-stat-money').textContent = p.money;
    document.getElementById('event-stat-energy').textContent = p.maxEnergy;
    const weekIdx = game.currentWeekIndex;
    const weekNum = weekIdx < weekSchedule.length ? weekSchedule[weekIdx].week : 0;
    const weekText = `距离期末还有：${weekNum}周`;
    document.getElementById('week-text').textContent = weekText;
    document.getElementById('event-week-text').textContent = weekText;
    // 更新日历数字
    const calNum = document.getElementById('cal-number');
    if (calNum) calNum.textContent = weekNum;
    const eventCalNum = document.getElementById('event-cal-number');
    if (eventCalNum) eventCalNum.textContent = weekNum;
    // 更新遗物栏
    updateRelicBar();
}

function updateRelicBar() {
    const bar = document.getElementById('owned-relics-bar');
    if (!bar) return;
    bar.innerHTML = '';
    game.relicsOwned.forEach(key => {
        const relic = relics[key];
        if (!relic) return;
        const span = document.createElement('span');
        span.className = `owned-relic-icon ${relic.type === 'legendary' ? 'legendary' : ''}`;
        span.textContent = (relic.type === 'legendary' ? '⭐' : '🔹') + relic.name;
        span.setAttribute('data-tooltip', relic.effect);
        bar.appendChild(span);
    });
    game.itemsOwned.forEach(key => {
        const item = items[key];
        if (!item) return;
        const span = document.createElement('span');
        span.className = 'owned-relic-icon item';
        span.textContent = '🧪' + item.name;
        span.setAttribute('data-tooltip', item.effect);
        bar.appendChild(span);
    });
    // 更新迷你 GPA 折线图
    drawGpaMiniChart();
}

function drawGpaMiniChart() {
    const canvas = document.getElementById('gpa-chart-mini');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const data = (game.gpaHistory && game.gpaHistory.length > 0) ? game.gpaHistory : [game.player.gpa];
    const maxGpa = 5.0, minGpa = 0;
    const padX = 4, padY = 4;
    const plotW = w - padX * 2, plotH = h - padY * 2;

    // 警戒线
    [2.0, 3.0, 4.0].forEach(threshold => {
        const y = padY + plotH - ((threshold - minGpa) / (maxGpa - minGpa)) * plotH;
        ctx.strokeStyle = threshold === 2.0 ? 'rgba(231,76,60,0.4)' : 'rgba(255,255,255,0.08)';
        ctx.setLineDash([3, 3]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padX, y);
        ctx.lineTo(w - padX, y);
        ctx.stroke();
        ctx.setLineDash([]);
    });

    // 折线
    if (data.length >= 2) {
        ctx.strokeStyle = '#f5576c';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        data.forEach((gpa, i) => {
            const x = padX + (i / (data.length - 1)) * plotW;
            const y = padY + plotH - ((gpa - minGpa) / (maxGpa - minGpa)) * plotH;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();
    }

    // 当前点
    const lastVal = data[data.length - 1];
    const lastX = data.length >= 2 ? padX + plotW : padX + plotW / 2;
    const lastY = padY + plotH - ((lastVal - minGpa) / (maxGpa - minGpa)) * plotH;
    ctx.fillStyle = '#f5576c';
    ctx.beginPath();
    ctx.arc(lastX, lastY, 3, 0, Math.PI * 2);
    ctx.fill();

    // 当前数值
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(lastVal.toFixed(2), w - 4, 12);
}

function updateBattleStats() {
    const p = game.player;
    document.getElementById('battle-hp').textContent = `${Math.max(0, Math.round(p.hp))}/${p.maxHp}`;
    document.getElementById('battle-defense').textContent = p.defense;
    document.getElementById('battle-energy').textContent = `${game.battle.energy}/${game.battle.maxEnergy}`;
    document.getElementById('battle-money').textContent = p.money;
    const creditsEl = document.getElementById('battle-credits');
    if (creditsEl) creditsEl.textContent = p.credits;
    document.getElementById('draw-pile-count').textContent = game.battle.drawPile.length;
    document.getElementById('discard-pile-count').textContent = game.battle.discardPile.length;
    // 更新血条
    const hpPercent = Math.max(0, (p.hp / p.maxHp) * 100);
    const hpFill = document.getElementById('player-hp-fill');
    if (hpFill) {
        hpFill.style.width = hpPercent + '%';
        if (hpPercent <= 25) {
            hpFill.style.background = 'linear-gradient(90deg, #8b0000, #e74c3c)';
        } else if (hpPercent <= 50) {
            hpFill.style.background = 'linear-gradient(90deg, #e74c3c, #ff6b6b)';
        } else {
            hpFill.style.background = 'linear-gradient(90deg, #27ae60, #2ecc71)';
        }
    }
}


// ===== 初始化游戏 =====
function initGame() {
    game.player = { hp: 100, maxHp: 100, gpa: 3.5, credits: 0, money: 200, energy: 3, maxEnergy: 3, defense: 0 };
    game.deck = [...initialDeck];
    game.currentWeekIndex = 0;
    game.randomEventPool = shuffle([...randomEventPool]);
    game.relicsOwned = [];
    game.itemsOwned = [];
    game.battle = null;
    game.statuses = { weak: 0, strength: 0, sick: false, noDamage: false, surviveLethal: false,
        banFun: false, banSocial: false, nextTurnEnergyMod: 0, defenseHalf: false,
        socialFreeCount: 0, studyDmgBonus: 0, allDmgBonus: 0, noGpaThisBattle: false,
        cardsPlayed: 0, highlighterUsed: false, loseDefenseNext: 0, maxCardsThisTurn: 99 };
    game.pendingAction = null;
    game.gpaWarningTriggered = { level1: false, level2: false, expelled: false };
    game.gpaHistory = [3.5];
    updateAllStats();
    showScreen('map-screen');
    showCurrentWeek();
}

// ===== 地图流程 =====
function showCurrentWeek() {
    if (game.currentWeekIndex >= weekSchedule.length) {
        showEnding();
        return;
    }
    const week = weekSchedule[game.currentWeekIndex];
    document.getElementById('map-week-name').textContent = `第${13 - week.week}周：${week.name}`;
    const choicesDiv = document.getElementById('map-choices');
    choicesDiv.innerHTML = '';

    if (week.type === 'fixed') {
        const btn = document.createElement('button');
        btn.className = 'map-choice-btn';
        if (week.event.startsWith('battle:')) {
            const enemyKey = week.event.split(':')[1];
            const enemy = enemies[enemyKey];
            btn.innerHTML = `<span class="choice-icon">⚔️</span>${enemy.name}`;
            btn.onclick = () => startBattle(enemyKey);
        }
        choicesDiv.appendChild(btn);
    } else if (week.type === 'choice') {
        week.options.forEach(optKey => {
            const evt = events[optKey];
            const btn = document.createElement('button');
            btn.className = 'map-choice-btn';
            btn.innerHTML = `<span class="choice-icon">📋</span>${evt.name}`;
            btn.onclick = () => showEvent(optKey, false);
            choicesDiv.appendChild(btn);
        });
    } else if (week.type === 'random') {
        if (game.randomEventPool.length > 0) {
            let eventKey = game.randomEventPool[game.randomEventPool.length - 1];
            // 牛牛是隐藏事件，只有20%概率触发，否则跳过抽下一个
            if (eventKey === 'niuniu' && Math.random() > 0.2) {
                game.randomEventPool.pop();
                if (game.randomEventPool.length > 0) {
                    eventKey = game.randomEventPool.pop();
                } else {
                    advanceWeek();
                    return;
                }
            } else {
                game.randomEventPool.pop();
            }
            const btn = document.createElement('button');
            btn.className = 'map-choice-btn';
            const evt = randomEvents[eventKey];
            btn.innerHTML = `<span class="choice-icon">❓</span>${evt.name}`;
            btn.onclick = () => showEvent(eventKey, true);
            choicesDiv.appendChild(btn);
        } else {
            advanceWeek();
        }
    }
    updateAllStats();
}

function advanceWeek() {
    // 撕日历动画
    const calIcon = document.getElementById('calendar-icon');
    if (calIcon) {
        calIcon.classList.add('tearing');
        setTimeout(() => calIcon.classList.remove('tearing'), 600);
    }
    game.currentWeekIndex++;
    // 学分结算：每10学分转为0.1 GPA（向零取整余数保留）
    settleCredits();
    // 记录GPA历史
    game.gpaHistory.push(game.player.gpa);
    // 自动存档
    saveGame();
    checkGpaWarning(() => {
        if (game.player.hp <= 0) { showEnding(); return; }
        if (game.player.gpa < 2.0) { showEnding(); return; }
        showCurrentWeek();
    });
}

function settleCredits() {
    // 每10学分换算成0.1 GPA
    if (game.player.credits === 0) return;
    const conversion = Math.trunc(game.player.credits / 10);
    if (conversion !== 0) {
        game.player.gpa = Math.min(5.0, Math.max(0, game.player.gpa + conversion * 0.1));
        game.player.credits -= conversion * 10;
    }
}

function checkGpaWarning(callback) {
    const gpa = game.player.gpa;
    if (gpa < 2.0 && !game.gpaWarningTriggered.expelled) {
        game.gpaWarningTriggered.expelled = true;
        showGpaWarningModal("退学通知", "你的GPA低于2.0，学校已发出退学通知……", callback);
    } else if (gpa < 3.0 && !game.gpaWarningTriggered.level2) {
        game.gpaWarningTriggered.level2 = true;
        game.player.hp -= 10;
        showGpaWarningModal("学业二级预警", "你的GPA低于3.0！心态-10。", callback);
    } else if (gpa < 4.0 && !game.gpaWarningTriggered.level1) {
        game.gpaWarningTriggered.level1 = true;
        game.player.money -= 50;
        if (game.player.money < 0) {
            game.player.hp += game.player.money;
            game.player.money = 0;
        }
        showGpaWarningModal("学业一级预警", "你的GPA低于4.0！扣除50生活费。", callback);
    } else {
        callback();
    }
}

function showGpaWarningModal(title, desc, callback) {
    const modal = document.getElementById('gpa-warning-modal');
    document.getElementById('gpa-warning-title').textContent = title;
    document.getElementById('gpa-warning-desc').textContent = desc;
    modal.classList.remove('hidden');
    drawGpaChart();
    document.getElementById('btn-gpa-warning-ok').onclick = () => {
        modal.classList.add('hidden');
        callback();
    };
}

function drawGpaChart() {
    const canvas = document.getElementById('gpa-chart');
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const data = game.gpaHistory;
    if (data.length < 2) return;

    const maxGpa = 5.0, minGpa = 0;
    const padX = 30, padY = 10;
    const plotW = w - padX * 2, plotH = h - padY * 2;

    // 背景
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, 0, w, h);

    // 警戒线
    [2.0, 3.0, 4.0].forEach(threshold => {
        const y = padY + plotH - ((threshold - minGpa) / (maxGpa - minGpa)) * plotH;
        ctx.strokeStyle = threshold === 2.0 ? 'rgba(231,76,60,0.5)' : 'rgba(255,255,255,0.15)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(padX, y);
        ctx.lineTo(w - padX, y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#888';
        ctx.font = '9px sans-serif';
        ctx.fillText(threshold.toFixed(1), 4, y + 3);
    });

    // 折线
    ctx.strokeStyle = '#f5576c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    data.forEach((gpa, i) => {
        const x = padX + (i / (data.length - 1)) * plotW;
        const y = padY + plotH - ((gpa - minGpa) / (maxGpa - minGpa)) * plotH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // 当前点
    const lastX = padX + plotW;
    const lastY = padY + plotH - ((data[data.length - 1] - minGpa) / (maxGpa - minGpa)) * plotH;
    ctx.fillStyle = '#f5576c';
    ctx.beginPath();
    ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText(data[data.length - 1].toFixed(2), lastX - 15, lastY - 8);
}


// ===== 事件系统 =====
function showEvent(eventKey, isRandom) {
    const evt = isRandom ? randomEvents[eventKey] : events[eventKey];
    showScreen('event-screen');
    document.getElementById('event-title').textContent = evt.name;
    document.getElementById('event-desc').textContent = evt.desc;
    document.getElementById('event-result').classList.add('hidden');
    const choicesDiv = document.getElementById('event-choices');
    choicesDiv.innerHTML = '';
    choicesDiv.classList.remove('hidden');

    evt.choices.forEach((choice, idx) => {
        const btn = document.createElement('button');
        btn.className = 'event-choice-btn';
        let label = choice.text;
        if (choice.subtitle) label += `<div class="choice-subtitle">${choice.subtitle}</div>`;
        btn.innerHTML = label;

        // 检查费用
        if (choice.cost && game.player.money < choice.cost) {
            btn.classList.add('disabled');
            btn.onclick = null;
        } else {
            btn.onclick = () => resolveEventChoice(choice);
        }
        choicesDiv.appendChild(btn);
    });
    updateAllStats();
}

function resolveEventChoice(choice) {
    document.getElementById('event-choices').classList.add('hidden');
    const resultDiv = document.getElementById('event-result');
    resultDiv.classList.remove('hidden');

    // 扣费
    if (choice.cost) {
        game.player.money -= choice.cost;
    }

    let resultText = '';
    let effectStr = '';

    if (choice.isGamble) {
        const roll = Math.random() * 100;
        if (roll < choice.success.chance) {
            resultText = choice.success.result;
            effectStr = choice.success.effect;
        } else {
            resultText = choice.fail.result;
            effectStr = choice.fail.effect;
        }
    } else if (choice.isConditional) {
        const cond = evaluateCondition(choice.conditions);
        resultText = cond.result;
        effectStr = cond.effect;
    } else {
        resultText = choice.result || '完成。';
        effectStr = choice.effect || '';
    }

    applyEventEffect(effectStr);
    document.getElementById('event-result-text').textContent = resultText;
    document.getElementById('event-result-effect').textContent = choice.effectDesc || describeEffect(effectStr);
    updateAllStats();

    document.getElementById('btn-event-continue').onclick = () => {
        if (game.pendingAction) {
            executePendingAction();
        } else {
            showScreen('map-screen');
            advanceWeek();
        }
    };
}

function evaluateCondition(conditions) {
    for (const cond of conditions) {
        if (cond.check.includes('hp >=')) {
            const val = parseInt(cond.check.split('>=')[1]);
            if (game.player.hp >= val) return cond;
        } else if (cond.check.includes('hp <')) {
            const val = parseInt(cond.check.split('<')[1]);
            if (game.player.hp < val) return cond;
        } else if (cond.check.includes('deckSize <=')) {
            const val = parseInt(cond.check.split('<=')[1]);
            if (game.deck.length <= val) return cond;
        } else if (cond.check.includes('deckSize >')) {
            const val = parseInt(cond.check.split('>')[1]);
            if (game.deck.length > val) return cond;
        }
    }
    return conditions[conditions.length - 1];
}

function applyEventEffect(effectStr) {
    if (!effectStr || effectStr === 'nothing') return;
    const effects = effectStr.split(',');
    effects.forEach(eff => {
        eff = eff.trim();
        if (eff.startsWith('hp+')) game.player.hp = Math.min(game.player.maxHp, game.player.hp + parseInt(eff.slice(3)));
        else if (eff.startsWith('hp-')) game.player.hp -= parseInt(eff.slice(3));
        else if (eff.startsWith('money+')) game.player.money += parseInt(eff.slice(6));
        else if (eff.startsWith('money-')) game.player.money -= parseInt(eff.slice(6));
        else if (eff.startsWith('gpa+')) game.player.gpa = Math.min(5.0, game.player.gpa + parseFloat(eff.slice(4)));
        else if (eff.startsWith('gpa-')) game.player.gpa = Math.max(0, game.player.gpa - parseFloat(eff.slice(4)));
        else if (eff.startsWith('maxHp+')) game.player.maxHp += parseInt(eff.slice(6));
        else if (eff === 'fullHeal') game.player.hp = game.player.maxHp;
        else if (eff === 'chooseStudyCard') game.pendingAction = { type: 'chooseCard', filter: 'study' };
        else if (eff === 'removeFunCard') game.pendingAction = { type: 'removeCard', filter: 'fun' };
        else if (eff === 'removeCurse') game.pendingAction = { type: 'removeCard', filter: 'curse' };
        else if (eff === 'removeAnyCard') game.pendingAction = { type: 'removeCard', filter: 'any' };
        else if (eff === 'addSocialCard') addRandomCardOfType('social');
        else if (eff === 'addSick') game.statuses.sick = true;
        else if (eff === 'addSleepy') game.deck.push('c3');
        else if (eff === 'addRhinitis') game.deck.push('c1');
        else if (eff === 'addCrabCurse') game.deck.push('c2');
        else if (eff === 'addNobelRelic') game.relicsOwned.push('nobel');
        else if (eff === 'addPhilosophyRelic') game.relicsOwned.push('philosophy');
        else if (eff === 'addCaigenRelic') game.relicsOwned.push('caigen');
        else if (eff === 'randomRelic') addRandomRelic();
        else if (eff === 'chooseItem') game.pendingAction = { type: 'chooseItem' };
        else if (eff === 'addInnateToStudyCard') game.pendingAction = { type: 'addInnate' };
    });
    if (game.player.money < 0) {
        game.player.hp += game.player.money;
        game.player.money = 0;
    }
}

function describeEffect(effectStr) {
    return '';
}

function addRandomCardOfType(type) {
    const cards = allCards.filter(c => c.type === type);
    if (cards.length > 0) {
        const card = cards[Math.floor(Math.random() * cards.length)];
        game.deck.push(card.id);
    }
}

function addRandomRelic() {
    const commonKeys = Object.keys(relics).filter(k => relics[k].type === 'common' && !game.relicsOwned.includes(k));
    if (commonKeys.length > 0) {
        game.relicsOwned.push(commonKeys[Math.floor(Math.random() * commonKeys.length)]);
    }
}

function executePendingAction() {
    const action = game.pendingAction;
    game.pendingAction = null;
    if (!action) { showScreen('map-screen'); advanceWeek(); return; }

    if (action.type === 'chooseCard') {
        showCardChoice(action.filter);
    } else if (action.type === 'removeCard') {
        showRemoveCard(action.filter);
    } else if (action.type === 'chooseItem') {
        showItemChoice();
    } else if (action.type === 'addInnate') {
        showScreen('map-screen');
        advanceWeek();
    } else {
        showScreen('map-screen');
        advanceWeek();
    }
}

function showCardChoice(filter) {
    showScreen('card-choice-screen');
    document.getElementById('card-choice-title').textContent = '选择一张卡牌加入牌组';
    const area = document.getElementById('card-choice-area');
    area.innerHTML = '';
    let pool = allCards.filter(c => c.type === filter && c.id.indexOf('init') === -1);
    shuffle(pool);
    const choices = pool.slice(0, 3);
    choices.forEach(card => {
        const el = createCardElement(card, true);
        el.onclick = () => {
            game.deck.push(card.id);
            showScreen('map-screen');
            advanceWeek();
        };
        area.appendChild(el);
    });
    document.getElementById('btn-skip-card').onclick = () => {
        showScreen('map-screen');
        advanceWeek();
    };
}

function showRemoveCard(filter) {
    showScreen('remove-card-screen');
    document.getElementById('remove-card-title').textContent = filter === 'any' ? '选择要移除的卡牌' : `选择要移除的${getTypeName(filter)}`;
    const area = document.getElementById('remove-card-area');
    area.innerHTML = '';
    game.deck.forEach((cardId, idx) => {
        const card = getCardData(cardId);
        if (!card) return;
        if (filter !== 'any' && card.type !== filter) return;
        const el = createCardElement(card, true);
        el.onclick = () => {
            game.deck.splice(idx, 1);
            showScreen('map-screen');
            advanceWeek();
        };
        area.appendChild(el);
    });
    document.getElementById('btn-cancel-remove').onclick = () => {
        showScreen('map-screen');
        advanceWeek();
    };
}

function showItemChoice() {
    showScreen('card-choice-screen');
    document.getElementById('card-choice-title').textContent = '选择一件道具';
    const area = document.getElementById('card-choice-area');
    area.innerHTML = '';
    Object.keys(items).forEach(key => {
        const item = items[key];
        const el = document.createElement('div');
        el.className = 'card';
        el.innerHTML = `<div class="card-name">${item.name}</div><div class="card-desc">${item.effect}</div><div class="card-type-tag">${item.flavor}</div>`;
        el.onclick = () => {
            game.itemsOwned.push(key);
            showScreen('map-screen');
            advanceWeek();
        };
        area.appendChild(el);
    });
    document.getElementById('btn-skip-card').onclick = () => {
        showScreen('map-screen');
        advanceWeek();
    };
}

function getTypeName(type) {
    const names = { study: '学业牌', fun: '娱乐牌', social: '社交牌', curse: '诅咒牌', initial: '初始牌' };
    return names[type] || '牌';
}


// ===== 战斗系统 =====
function startBattle(enemyKey) {
    const enemyData = enemies[enemyKey];
    game.battle = {
        enemies: [createEnemy(enemyData)],
        drawPile: shuffle([...game.deck]),
        discardPile: [],
        hand: [],
        turn: 0,
        energy: game.player.maxEnergy,
        maxEnergy: game.player.maxEnergy,
        enemyKey: enemyKey,
        lastStudyCard: null,
        cardsPlayedThisTurn: 0
    };
    // 遗物效果：瑞星
    if (game.relicsOwned.includes('redbull')) {
        game.battle.maxEnergy++;
        game.battle.energy++;
    }
    // 遗物效果：嚼过的菜根
    if (game.relicsOwned.includes('caigen') && game.player.hp < game.player.maxHp * 0.5) {
        game.battle.maxEnergy++;
        game.battle.energy++;
    }

    game.player.defense = 0;
    game.statuses.noDamage = false;
    game.statuses.banFun = false;
    game.statuses.banSocial = false;
    game.statuses.studyDmgBonus = 0;
    game.statuses.allDmgBonus = 0;
    game.statuses.noGpaThisBattle = false;
    game.statuses.cardsPlayed = 0;
    game.statuses.highlighterUsed = false;
    game.statuses.maxCardsThisTurn = 99;
    game.statuses.loseDefenseNext = 0;
    game.statuses.surviveLethal = false;
    game.statuses.strength = 0;
    game.statuses.nextStudyDoubled = false;

    showScreen('battle-screen');
    // 遗物：保温杯
    if (game.relicsOwned.includes('thermos')) {
        game.player.defense += 8;
    }
    startPlayerTurn();
}

function createEnemy(data) {
    return {
        name: data.name,
        hp: data.hp,
        maxHp: data.hp,
        defense: 0,
        isElite: data.isElite || false,
        isBoss: data.isBoss || false,
        isSummon: data.isSummon || false,
        pattern: data.pattern || null,
        phase1: data.phase1 || null,
        phase2: data.phase2 || null,
        turn: 0,
        phase: 1,
        weak: 0
    };
}

function startPlayerTurn() {
    game.battle.turn++;
    game.battle.cardsPlayedThisTurn = 0;
    game.statuses.noDamage = false;
    game.statuses.studyDmgBonus = 0;
    game.statuses.allDmgBonus = 0;
    game.statuses.maxCardsThisTurn = 99;

    // 精力刷新
    let energy = game.battle.maxEnergy + game.statuses.nextTurnEnergyMod;
    game.statuses.nextTurnEnergyMod = 0;
    // 帝王蟹诅咒
    if (game.deck.includes('c2') && game.battle.turn % 2 === 0) {
        energy--;
    }
    const oldEnergy = game.battle.energy;
    game.battle.energy = Math.max(0, energy);
    // 显示精力恢复数字
    const energyDelta = game.battle.energy - oldEnergy;
    if (energyDelta > 0) {
        const panel = document.querySelector('.player-battle-panel');
        if (panel) setTimeout(() => showFloatNumber(panel, `+${energyDelta}⚡`, 'heal'), 100);
    }

    // 效率清零
    game.player.defense = 0;
    // 白日梦效果
    if (game.statuses.loseDefenseNext > 0) {
        // 已经清零了，不需要额外处理
        game.statuses.loseDefenseNext = 0;
    }
    // 效率减半状态
    if (game.statuses.defenseHalf) {
        game.statuses.defenseHalf = false;
        // 标记本回合效率减半
        game.statuses._defenseHalfActive = true;
    } else {
        game.statuses._defenseHalfActive = false;
    }

    // 抽牌
    let drawCount = 5;
    // 反胃：首回合少抽1张
    if (game.statuses.sick && game.battle.turn === 1) {
        drawCount--;
        game.statuses.sick = false;
    }
    // 遗物：降噪耳机
    if (game.relicsOwned.includes('headphones') && game.battle.turn === 1) {
        drawCount++;
    }
    drawCards(drawCount);
    renderBattle();
}

function drawCards(count, isMidTurn) {
    const startIdx = game.battle.hand.length;
    // 抽牌堆脉冲动画
    const drawPileEl = document.getElementById('draw-pile-visual');
    if (drawPileEl) {
        drawPileEl.classList.add('pulsing');
        setTimeout(() => drawPileEl.classList.remove('pulsing'), 400);
    }
    for (let i = 0; i < count; i++) {
        if (game.battle.hand.length >= 8) break;
        if (game.battle.drawPile.length === 0) {
            if (game.battle.discardPile.length === 0) break;
            game.battle.drawPile = shuffle([...game.battle.discardPile]);
            game.battle.discardPile = [];
        }
        const cardId = game.battle.drawPile.pop();
        game.battle.hand.push(cardId);
    }
    // 标记新抽的牌索引用于动画
    const newIndices = [];
    for (let i = startIdx; i < game.battle.hand.length; i++) {
        newIndices.push(i);
    }
    game.battle._newlyDrawn = newIndices;
    game.battle._drawIsMidTurn = !!isMidTurn;
}

// 中途抽牌到手牌（带动画标记）
function addCardToHand(cardId) {
    if (game.battle.hand.length >= 8) return;
    const idx = game.battle.hand.length;
    game.battle.hand.push(cardId);
    if (!game.battle._newlyDrawn) game.battle._newlyDrawn = [];
    game.battle._newlyDrawn.push(idx);
    game.battle._drawIsMidTurn = true;
}

function renderBattle() {
    // 渲染敌人
    const enemiesArea = document.getElementById('enemies-area');
    enemiesArea.innerHTML = '';
    game.battle.enemies.forEach((enemy, idx) => {
        if (enemy.hp <= 0) return;
        const div = document.createElement('div');
        div.className = `enemy-card ${enemy.isElite ? 'elite' : ''} ${enemy.isBoss ? 'boss' : ''}`;
        const hpPercent = Math.max(0, (enemy.hp / enemy.maxHp) * 100);
        const intent = getEnemyIntent(enemy);
        // 计算意图实际对玩家造成的伤害
        const action = getCurrentEnemyAction(enemy);
        let actualDmgText = '';
        if (action && action.damage > 0) {
            let dmg = action.damage;
            if (enemy.weak > 0 && !(action.effect && action.effect.includes('ignoreWeak'))) {
                dmg = Math.floor(dmg * 0.5);
            }
            // 减去玩家防御
            const playerDef = game.player.defense;
            const realDmg = Math.max(0, dmg - playerDef);
            actualDmgText = `<div class="actual-damage">实际扣血: <b>${realDmg}</b></div>`;
        }
        div.innerHTML = `
            <div class="enemy-name">${enemy.name}</div>
            <div class="enemy-hp">${enemy.hp}/${enemy.maxHp}
                <div class="enemy-hp-bar"><div class="enemy-hp-fill" style="width:${hpPercent}%"></div></div>
            </div>
            ${enemy.defense > 0 ? `<div class="enemy-defense">🛡️ ${enemy.defense}</div>` : ''}
            ${enemy.weak > 0 ? `<div class="enemy-defense" style="color:#ff6b6b">虚弱 ${enemy.weak}回合</div>` : ''}
            <div class="enemy-intent">意图：${intent}</div>
            ${actualDmgText}
        `;
        div.dataset.idx = idx;
        enemiesArea.appendChild(div);
    });

    // 渲染手牌
    const handArea = document.getElementById('hand-area');
    handArea.innerHTML = '';
    game.battle.hand.forEach((cardId, idx) => {
        const card = getCardData(cardId);
        if (!card) return;
        const el = createCardElement(card, false);
        const canPlay = canPlayCard(card);
        if (!canPlay) el.classList.add('disabled');
        if (game.battle._newlyDrawn && game.battle._newlyDrawn.includes(idx)) {
            const drawIdx = game.battle._newlyDrawn.indexOf(idx);
            const delay = drawIdx * 0.12;
            el.style.animationDelay = delay + 's';
            el.style.animationFillMode = 'backwards';
            if (game.battle._drawIsMidTurn) {
                el.classList.add('card-drawing-mid');
            } else {
                el.classList.add('card-drawing');
            }
        }
        // 拖动出牌：mousedown 启动，移动跟随，松手时检查是否在出牌区
        if (canPlay) {
            attachDragHandler(el, idx);
        }
        handArea.appendChild(el);
    });
    game.battle._newlyDrawn = null;
    game.battle._drawIsMidTurn = false;

    updateBattleStats();

    // 状态显示
    const statusDiv = document.getElementById('battle-status');
    let statusText = [];
    if (game.statuses.banFun) statusText.push('🚫娱乐牌');
    if (game.statuses.banSocial) statusText.push('🚫社交牌');
    if (game.statuses.noDamage) statusText.push('🔇本回合无伤害');
    if (game.statuses.surviveLethal) statusText.push('💪致死保护');
    if (game.statuses.studyDmgBonus > 0) statusText.push(`📚学业+${game.statuses.studyDmgBonus}`);
    if (game.statuses.allDmgBonus > 0) statusText.push(`⚔️全伤害+${game.statuses.allDmgBonus}`);
    if (game.statuses.strength > 0) statusText.push(`💪专注+${game.statuses.strength}`);
    if (game.statuses.socialFreeCount > 0) statusText.push(`🤝社交免费×${game.statuses.socialFreeCount}`);
    statusDiv.textContent = statusText.join(' | ');

    // 道具按钮可用性
    const useItemBtn = document.getElementById('btn-use-item');
    if (useItemBtn) {
        useItemBtn.style.display = game.itemsOwned.length > 0 ? '' : 'none';
        useItemBtn.textContent = `🧪 道具 (${game.itemsOwned.length})`;
    }
}

function getEnemyIntent(enemy) {
    const action = getCurrentEnemyAction(enemy);
    if (!action) return '???';
    let parts = [];
    if (action.damage > 0) parts.push(`⚔️${action.damage}`);
    if (action.defense > 0) parts.push(`🛡️+${action.defense}`);
    if (action.effect) {
        if (action.effect.includes('addAnxiety')) parts.push('📜+焦虑');
        if (action.effect.includes('banFun')) parts.push('🚫娱乐');
        if (action.effect.includes('banSocial')) parts.push('🚫社交');
        if (action.effect.includes('banFunAndSocial')) parts.push('🚫娱乐&社交');
        if (action.effect.includes('gpa')) parts.push('📉GPA');
        if (action.effect.includes('summonMiniDDL')) parts.push('👥召唤');
        if (action.effect.includes('playerMaxEnergy') || action.effect.includes('playerEnergy')) parts.push('⚡精力');
        if (action.effect.includes('defenseHalf')) parts.push('⬇️效率减半');
        if (action.effect.includes('maxCards2')) parts.push('✋限出2牌');
        if (action.effect.includes('discardRandom')) parts.push('🗑️弃牌');
        if (action.effect.includes('doubleDefense')) parts.push('🛡️×2');
        if (action.effect.includes('ignoreWeak')) parts.push('💀无视虚弱');
        if (action.effect.includes('loop')) parts.push('🔄');
    }
    let intentStr = action.intent;
    if (parts.length > 0) intentStr += ' ' + parts.join(' ');
    return intentStr;
}

function getCurrentEnemyAction(enemy) {
    // 2.4km体测的阶段系统
    if (enemy.phase1 && enemy.phase2) {
        if (enemy.hp <= enemy.maxHp * 0.5) {
            enemy.phase = 2;
            return enemy.phase2[0];
        }
        const turnIdx = (enemy.turn % enemy.phase1.length);
        return enemy.phase1[turnIdx];
    }
    // 普通模式
    if (enemy.pattern) {
        const turnIdx = (enemy.turn % enemy.pattern.length);
        return enemy.pattern[turnIdx];
    }
    return null;
}

function canPlayCard(card) {
    if (card.cost === -1) return false; // 诅咒牌不可打出（除焦虑）
    if (card.id === 'c4') return game.battle.energy >= 1; // 焦虑可以打出
    if (card.cost > game.battle.energy) return false;
    if (card.moneyCost && game.player.money < card.moneyCost) return false;
    if (game.statuses.banFun && card.type === 'fun') return false;
    if (game.statuses.banSocial && card.type === 'social') return false;
    if (game.battle.cardsPlayedThisTurn >= game.statuses.maxCardsThisTurn) return false;
    return true;
}

function createCardElement(card, isChoice) {
    const el = document.createElement('div');
    el.className = `card type-${card.type}`;
    const costDisplay = card.cost >= 0 ? card.cost : '×';
    let creditTag = '';
    if (card.gpa && card.gpa > 0) creditTag = `<span class="card-credit-tag">+${card.gpa}学分</span>`;
    else if (card.gpa && card.gpa < 0) creditTag = `<span class="card-credit-tag negative">${card.gpa}学分</span>`;
    el.innerHTML = `
        <div class="card-cost">${costDisplay}</div>
        <div class="card-name">${card.name}</div>
        <div class="card-desc">${card.desc}</div>
        <div class="card-bottom">
            ${creditTag}
            <div class="card-type-tag">${getTypeName(card.type)}</div>
        </div>
    `;
    return el;
}

// ===== 拖动出牌系统 =====
function attachDragHandler(cardEl, handIdx) {
    let isDragging = false;
    let startX = 0, startY = 0;
    let originalRect = null;
    let dragThreshold = 30; // 拖动超过30像素才算开始拖动
    let hasMoved = false;

    const onPointerDown = (e) => {
        // 忽略右键
        if (e.button !== 0) return;
        isDragging = true;
        hasMoved = false;
        startX = e.clientX;
        startY = e.clientY;
        originalRect = cardEl.getBoundingClientRect();
        cardEl.classList.add('is-dragging');
        cardEl.style.transition = 'none';
        cardEl.style.zIndex = '100';
        cardEl.setPointerCapture && cardEl.setPointerCapture(e.pointerId);
        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
        e.preventDefault();
    };

    const onPointerMove = (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const dist = Math.hypot(dx, dy);
        if (dist > dragThreshold) hasMoved = true;
        if (hasMoved) {
            cardEl.style.transform = `translate(${dx}px, ${dy}px) rotate(0deg) scale(1.1)`;
            cardEl.style.boxShadow = '0 20px 50px rgba(102,126,234,0.5)';
            const enemyArea = document.getElementById('enemies-area');
            const inDropZone = e.clientY < (originalRect.top - 50);
            cardEl.style.opacity = inDropZone ? '1' : '0.85';
            if (inDropZone) {
                enemyArea.classList.add('drop-zone-active');
            } else {
                enemyArea.classList.remove('drop-zone-active');
            }
        }
    };

    const onPointerUp = (e) => {
        if (!isDragging) return;
        isDragging = false;
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
        const enemyArea = document.getElementById('enemies-area');
        enemyArea.classList.remove('drop-zone-active');

        const draggedFarEnough = hasMoved && (e.clientY < originalRect.top - 50);

        if (draggedFarEnough) {
            cardEl.classList.remove('is-dragging');
            cardEl.style.transition = '';
            cardEl.style.transform = '';
            cardEl.style.boxShadow = '';
            cardEl.style.opacity = '';
            cardEl.style.zIndex = '';
            playCard(handIdx);
        } else {
            cardEl.style.transition = 'all 0.25s ease-out';
            cardEl.style.transform = '';
            cardEl.style.boxShadow = '';
            cardEl.style.opacity = '';
            setTimeout(() => {
                cardEl.classList.remove('is-dragging');
                cardEl.style.zIndex = '';
                cardEl.style.transition = '';
            }, 250);
        }
    };

    cardEl.addEventListener('pointerdown', onPointerDown);
}


// ===== 打牌逻辑 =====
function playCard(handIdx) {
    const cardId = game.battle.hand[handIdx];
    const card = getCardData(cardId);
    if (!card || !canPlayCard(card)) return;

    // 立即扣费视觉反馈：先计算费用并扣除，让玩家立刻看到精力变化
    let cost = card.cost;
    if (card.type === 'social' && game.statuses.socialFreeCount > 0) cost = 0;
    if (game.battle.cardsPlayedThisTurn === 0 && game.battle.hand.includes('c1')) cost++;
    // 临时显示精力数（不真扣，executePlayCard 才真扣）
    const energyEl = document.getElementById('battle-energy');
    if (energyEl && cost > 0) {
        const currentMaxText = `/${game.battle.maxEnergy}`;
        const newEnergy = Math.max(0, game.battle.energy - Math.max(0, cost));
        energyEl.textContent = `${newEnergy}${currentMaxText}`;
        // 飞起精力消耗数字
        const panel = document.querySelector('.player-battle-panel');
        if (panel && cost > 0) showFloatNumber(panel, `-${cost}⚡`, 'shield');
    }

    // 播放出牌动画（向上飞）
    const handArea = document.getElementById('hand-area');
    const cardEl = handArea.children[handIdx];
    if (cardEl) {
        cardEl.classList.add('card-playing');
    }

    // 延迟执行实际逻辑让动画播放
    setTimeout(() => { executePlayCard(handIdx, cardId, card); }, 350);}

function executePlayCard(handIdx, cardId, card) {

    // 扣精力
    let cost = card.cost;
    // 社交牌免费
    if (card.type === 'social' && game.statuses.socialFreeCount > 0) {
        cost = 0;
        game.statuses.socialFreeCount--;
    }
    // 过敏性鼻炎：第一张牌+1
    if (game.battle.cardsPlayedThisTurn === 0 && game.battle.hand.includes('c1')) {
        cost++;
    }
    if (cost > game.battle.energy && card.id !== 'c4') return;
    game.battle.energy -= Math.max(0, cost);

    // 隐藏属性：noGpaThisBattle (代签)
    if (card.hidden === 'noGpaThisBattle') {
        game.statuses.noGpaThisBattle = true;
    }

    // 扣生活费
    if (card.moneyCost) {
        game.player.money -= card.moneyCost;
    }

    // 从手牌移除
    game.battle.hand.splice(handIdx, 1);
    game.battle.cardsPlayedThisTurn++;
    game.statuses.cardsPlayed++;

    // 计算伤害
    let damage = card.damage || 0;
    if (damage > 0 && game.statuses.noDamage) damage = 0;
    if (damage > 0 && (card.type === 'study' || card.type === 'initial')) {
        damage += game.statuses.studyDmgBonus;
        damage += game.statuses.strength;
        // 草稿纸：下张学业牌伤害翻倍
        if (game.statuses.nextStudyDoubled) {
            damage *= 2;
            game.statuses.nextStudyDoubled = false;
        }
        // 遗物：四色荧光笔
        if (game.relicsOwned.includes('highlighter') && !game.statuses.highlighterUsed) {
            damage = Math.floor(damage * 1.5);
            game.statuses.highlighterUsed = true;
        }
        // 遗物：嚼过的菜根
        if (game.relicsOwned.includes('caigen') && game.player.hp < game.player.maxHp * 0.5) {
            damage += 3;
        }
    }
    damage += game.statuses.allDmgBonus;

    // 计算防御
    let defense = card.defense || 0;
    if (game.statuses._defenseHalfActive) {
        defense = Math.floor(defense / 2);
    }

    // 应用伤害
    if (damage > 0) {
        const isAoe = card.effect && card.effect.includes('aoe');
        if (isAoe) {
            game.battle.enemies.forEach(e => { if (e.hp > 0) dealDamageToEnemy(e, damage); });
        } else {
            const target = game.battle.enemies.find(e => e.hp > 0);
            if (target) dealDamageToEnemy(target, damage);
        }
    }

    // 应用防御
    if (defense > 0) {
        game.player.defense += defense;
    }

    // 学分变化（每10学分→0.1 GPA，结算在每周末）
    if (card.gpa && !game.statuses.noGpaThisBattle) {
        game.player.credits += card.gpa;
    }

    // 处理特殊效果
    applyCardEffect(card);

    // 焦虑：消耗
    if (card.id === 'c4') {
        // 不加入弃牌堆（消耗）
    } else {
        game.battle.discardPile.push(cardId);
    }

    // 遗物：哲学碎片
    if (game.relicsOwned.includes('philosophy') && game.statuses.cardsPlayed % 3 === 0) {
        const playableInHand = game.battle.hand.filter(id => {
            const c = getCardData(id);
            return c && c.cost > 0;
        });
        if (playableInHand.length > 0) {
            // 简化：下张牌免费（通过给精力）
            game.battle.energy++;
        }
    }

    // 检查战斗结束
    if (checkBattleEnd()) return;
    renderBattle();
}

function dealDamageToEnemy(enemy, damage) {
    let actualDmg = damage;
    if (enemy.defense > 0) {
        if (enemy.defense >= actualDmg) {
            enemy.defense -= actualDmg;
            actualDmg = 0;
        } else {
            actualDmg -= enemy.defense;
            enemy.defense = 0;
        }
    }
    enemy.hp -= actualDmg;
    // 命中动画
    const idx = game.battle.enemies.indexOf(enemy);
    const enemyEls = document.querySelectorAll('.enemy-card');
    if (enemyEls[idx]) {
        enemyEls[idx].classList.add('hit');
        setTimeout(() => enemyEls[idx].classList.remove('hit'), 400);
        showFloatNumber(enemyEls[idx], `-${damage}`, 'damage');
    }
    if (enemy.hp <= 0) {
        enemy.hp = 0;
    }
}

function applyCardEffect(card) {
    if (!card.effect) return;
    const effects = card.effect.split(',');
    effects.forEach(eff => {
        eff = eff.trim();
        switch(eff) {
            case 'drawStudyCard1':
                const studyInDraw = game.battle.drawPile.filter(id => { const c = getCardData(id); return c && c.type === 'study'; });
                if (studyInDraw.length > 0) {
                    const pick = studyInDraw[Math.floor(Math.random() * studyInDraw.length)];
                    game.battle.drawPile = game.battle.drawPile.filter(id => id !== pick);
                    addCardToHand(pick);
                }
                break;
            case 'nextTurnEnergy-1':
                game.statuses.nextTurnEnergyMod--;
                break;
            case 'studyDamage+2':
                game.statuses.strength += 2;
                break;
            case 'selfDamage3':
                game.player.hp -= 3;
                break;
            case 'selfDamage5':
                game.player.hp -= 5;
                break;
            case 'reduceEnemyDamage3':
                // 简化：给敌人标记
                game.battle.enemies.forEach(e => { if (e.hp > 0) e._reduceDmg = 3; });
                break;
            case 'discoverOtherType':
                const types = ['study', 'fun', 'social'].filter(t => t !== 'study');
                const rType = types[Math.floor(Math.random() * types.length)];
                const pool = allCards.filter(c => c.type === rType);
                if (pool.length > 0) {
                    const pick = pool[Math.floor(Math.random() * pool.length)];
                    addCardToHand(pick.id);
                }
                break;
            case 'copyLastStudyHalf':
                if (game.battle.lastStudyCard) {
                    const dmg = Math.floor((game.battle.lastStudyCard.damage || 0) / 2);
                    if (dmg > 0) {
                        const target = game.battle.enemies.find(e => e.hp > 0);
                        if (target) dealDamageToEnemy(target, dmg);
                    }
                }
                break;
            case 'gainEnergy1':
                game.battle.energy++;
                break;
            case 'aoe':
                // 已在伤害计算中处理
                break;
            case 'healOnKill5':
                const dead = game.battle.enemies.filter(e => e.hp <= 0);
                if (dead.length > 0) game.player.hp = Math.min(game.player.maxHp, game.player.hp + 5);
                break;
            case 'noDamageThisTurn':
                game.statuses.noDamage = true;
                break;
            case 'heal12':
                game.player.hp = Math.min(game.player.maxHp, game.player.hp + 12);
                break;
            case 'allDamage+2':
                game.statuses.allDmgBonus += 2;
                break;
            case 'discardAllRedrawEqual,heal2':
            case 'discardAllRedrawEqual':
                const count = game.battle.hand.length;
                game.battle.discardPile.push(...game.battle.hand);
                game.battle.hand = [];
                drawCards(count, true);
                break;
            case 'heal2':
                game.player.hp = Math.min(game.player.maxHp, game.player.hp + 2);
                break;
            case 'drawSocial':
                const socialInDraw = game.battle.drawPile.filter(id => { const c = getCardData(id); return c && c.type === 'social'; });
                if (socialInDraw.length > 0) {
                    const pick = socialInDraw[Math.floor(Math.random() * socialInDraw.length)];
                    game.battle.drawPile = game.battle.drawPile.filter(id => id !== pick);
                    addCardToHand(pick);
                }
                break;
            case 'randomTempItem':
                // 简化：直接给一个临时效果
                game.battle.energy++;
                break;
            case 'weakEnemy':
                game.battle.enemies.forEach(e => { if (e.hp > 0) e.weak = Math.max(e.weak, 1); });
                break;
            case 'draw2':
                drawCards(2, true);
                break;
            case 'socialCost-1':
                game.statuses.socialFreeCount++;
                break;
            case 'addAnxiety':
                game.deck.push('c4');
                game.battle.drawPile.push('c4');
                break;
            case 'loseDefense5NextTurn':
                game.statuses.loseDefenseNext = 5;
                break;
            case 'endBattle':
                game.player.hp = game.player.maxHp;
                endBattle(true);
                return;
            case 'fullHeal':
                game.player.hp = game.player.maxHp;
                break;
            case 'surviveLethalWith1hp':
                game.statuses.surviveLethal = true;
                break;
            case 'discardFun':
                const funIdx = game.battle.hand.findIndex(id => { const c = getCardData(id); return c && c.type === 'fun'; });
                if (funIdx >= 0) {
                    game.battle.discardPile.push(game.battle.hand[funIdx]);
                    game.battle.hand.splice(funIdx, 1);
                }
                break;
            case 'drawStudy':
                const studyCards = game.battle.drawPile.filter(id => { const c = getCardData(id); return c && c.type === 'study'; });
                if (studyCards.length > 0) {
                    const pick = studyCards[Math.floor(Math.random() * studyCards.length)];
                    game.battle.drawPile = game.battle.drawPile.filter(id => id !== pick);
                    addCardToHand(pick);
                }
                break;
            case 'draw1':
                drawCards(1, true);
                break;
            case 'next2SocialFree':
                game.statuses.socialFreeCount += 2;
                break;
            case 'addStudyCard0Cost':
                const studyPool = allCards.filter(c => c.type === 'study');
                if (studyPool.length > 0) {
                    const pick = studyPool[Math.floor(Math.random() * studyPool.length)];
                    addCardToHand(pick.id);
                    // 0 cost 简化：给1精力
                    game.battle.energy++;
                }
                break;
            case 'allCards+3permanent':
                // 本战斗所有手牌+3
                game.statuses.allDmgBonus += 3;
                game.player.defense += 3;
                break;
            case 'exhaust':
                // 已处理（不加入弃牌堆）
                break;
        }
    });

    // 记录最后一张学业牌
    if (card.type === 'study') {
        game.battle.lastStudyCard = card;
    }
}


// ===== 回合结束 =====
function endTurn() {
    // 弃牌动画
    const handArea = document.getElementById('hand-area');
    const cards = handArea.querySelectorAll('.card');
    const retained = [];
    const toDiscard = [];

    game.battle.hand.forEach((cardId, idx) => {
        const card = getCardData(cardId);
        if (card && card.effect && card.effect.includes('retain')) {
            retained.push(cardId);
        } else {
            toDiscard.push(cardId);
            // 给对应DOM加弃牌动画
            if (cards[idx]) {
                cards[idx].classList.add('card-discarding');
                cards[idx].style.animationDelay = (idx * 0.06) + 's';
            }
        }
    });

    // 弃牌堆接收动画
    const discardPileEl = document.getElementById('discard-pile-visual');
    if (discardPileEl && toDiscard.length > 0) {
        setTimeout(() => {
            discardPileEl.classList.add('receiving');
            setTimeout(() => discardPileEl.classList.remove('receiving'), 400);
        }, toDiscard.length * 60 + 200);
    }

    // 等动画播完再执行逻辑
    const animDuration = toDiscard.length * 60 + 400;
    setTimeout(() => {
        game.battle.discardPile.push(...toDiscard);
        game.battle.hand = retained;
        enemyTurn();
    }, animDuration);
}

function enemyTurn() {
    let totalDamageToPlayer = 0;

    game.battle.enemies.forEach(enemy => {
        if (enemy.hp <= 0) return;
        // 敌人效率（护盾）回合开始清零
        enemy.defense = 0;
        enemy.turn++;
        const action = getCurrentEnemyAction(enemy);
        if (!action) return;

        // 敌人获得防御
        if (action.defense) {
            enemy.defense += action.defense;
        }

        // 敌人造成伤害
        let dmg = action.damage || 0;
        if (dmg > 0) {
            // 虚弱减伤
            if (enemy.weak > 0 && !(action.effect && action.effect.includes('ignoreWeak'))) {
                dmg = Math.floor(dmg * 0.5);
            }
            // 提问减伤
            if (enemy._reduceDmg) {
                dmg = Math.max(0, dmg - enemy._reduceDmg);
                enemy._reduceDmg = 0;
            }
            totalDamageToPlayer += dmg;
        }

        // 敌人特殊效果
        if (action.effect) {
            applyEnemyEffect(action.effect, enemy);
        }

        // 虚弱回合递减
        if (enemy.weak > 0) enemy.weak--;

        // 循环处理
        if (action.effect && action.effect.includes('loop')) {
            enemy.turn = 0;
        }
        if (action.effect && action.effect.includes('gotoPhase1Turn2')) {
            enemy.turn = 1; // 回到turn2（因为下次会+1变成2）
        }
        // 自毁
        if (action.effect && action.effect.includes('selfDestruct')) {
            enemy.hp = 0;
        }
    });

    // 应用伤害到玩家
    if (totalDamageToPlayer > 0) {
        dealDamageToPlayer(totalDamageToPlayer);
    }

    // 检查玩家死亡
    if (game.player.hp <= 0) {
        if (game.statuses.surviveLethal) {
            game.player.hp = 1;
            game.statuses.surviveLethal = false;
        } else {
            showEnding();
            return;
        }
    }

    // 检查战斗结束
    if (checkBattleEnd()) return;

    // 下一回合
    startPlayerTurn();
}

function dealDamageToPlayer(damage) {
    let remaining = damage;
    if (game.player.defense > 0) {
        if (game.player.defense >= remaining) {
            game.player.defense -= remaining;
            remaining = 0;
        } else {
            remaining -= game.player.defense;
            game.player.defense = 0;
        }
    }
    game.player.hp -= remaining;
    // 受击动画
    const panel = document.querySelector('.player-battle-panel');
    if (panel) {
        panel.classList.add('hit');
        setTimeout(() => panel.classList.remove('hit'), 400);
        showFloatNumber(panel, `-${damage}`, 'damage');
    }
}

function applyEnemyEffect(effectStr, enemy) {
    const effects = effectStr.split(',');
    effects.forEach(eff => {
        eff = eff.trim();
        switch(eff) {
            case 'addAnxietyToDraw1':
                game.battle.drawPile.push('c4');
                break;
            case 'addAnxietyToDiscard2':
                game.battle.discardPile.push('c4', 'c4');
                break;
            case 'addAnxietyToHand1':
                if (game.battle.hand.length < 8) game.battle.hand.push('c4');
                break;
            case 'gpa-1.5':
                game.player.gpa -= 1.5;
                break;
            case 'gpa-1.0':
                game.player.gpa -= 1.0;
                break;
            case 'gpa-0.5':
                game.player.gpa -= 0.5;
                break;
            case 'loop':
                // 已在上面处理
                break;
            case 'banFunNextTurn':
                game.statuses.banFun = true;
                break;
            case 'banSocialNextTurn':
                game.statuses.banSocial = true;
                break;
            case 'banFunAndSocialNextTurn':
                game.statuses.banFun = true;
                game.statuses.banSocial = true;
                break;
            case 'playerEnergy+1NextTurn':
                game.statuses.nextTurnEnergyMod++;
                break;
            case 'maxCards2ThisTurn':
                game.statuses.maxCardsThisTurn = 2;
                break;
            case 'defenseHalfNextTurn':
                game.statuses.defenseHalf = true;
                break;
            case 'discardRandomFunOrSocial':
                const targets = game.battle.hand.filter(id => {
                    const c = getCardData(id);
                    return c && (c.type === 'fun' || c.type === 'social');
                });
                if (targets.length > 0) {
                    const pick = targets[Math.floor(Math.random() * targets.length)];
                    const idx = game.battle.hand.indexOf(pick);
                    if (idx >= 0) {
                        game.battle.discardPile.push(game.battle.hand[idx]);
                        game.battle.hand.splice(idx, 1);
                    }
                }
                break;
            case 'gotoPhase1Turn2':
                // 已处理
                break;
            case 'ignoreWeak':
                // 已在伤害计算中处理
                break;
            case 'repeat':
                // 阶段2持续攻击，不需要额外处理
                break;
            case 'summonMiniDDL2':
                // 召唤2只小DDL
                for (let i = 0; i < 2; i++) {
                    game.battle.enemies.push(createEnemy(enemies.miniDDL));
                }
                break;
            case 'addAnxiety2':
                game.battle.drawPile.push('c4', 'c4');
                break;
            case 'playerMaxEnergy-1NextTurn':
                game.statuses.nextTurnEnergyMod--;
                break;
            case 'doubleDefense':
                enemy.defense *= 2;
                break;
            case 'selfDestruct':
                // 已处理
                break;
        }
    });
}

function checkBattleEnd() {
    const allDead = game.battle.enemies.every(e => e.hp <= 0);
    if (allDead) {
        endBattle(true);
        return true;
    }
    return false;
}

function endBattle(victory) {
    if (!victory) {
        showEnding();
        return;
    }
    // 清除战斗状态
    game.statuses.banFun = false;
    game.statuses.banSocial = false;
    game.statuses.surviveLethal = false;

    // 发放奖励
    const enemyData = enemies[game.battle.enemyKey];
    if (enemyData.reward) {
        if (enemyData.reward.money) game.player.money += enemyData.reward.money;
        if (enemyData.reward.gpa) game.player.gpa = Math.min(5.0, game.player.gpa + enemyData.reward.gpa);
        if (enemyData.reward.relic) addRandomRelic();
    }

    // 卡牌奖励
    if (enemyData.reward && enemyData.reward.cardChoice) {
        game.pendingAction = { type: 'battleReward', choices: enemyData.reward.cardChoice };
        showBattleReward();
    } else {
        game.battle = null;
        showScreen('map-screen');
        advanceWeek();
    }
}

function showBattleReward() {
    showScreen('card-choice-screen');
    document.getElementById('card-choice-title').textContent = '战斗胜利！选择一张卡牌';
    const area = document.getElementById('card-choice-area');
    area.innerHTML = '';
    const pool = allCards.filter(c => c.type !== 'curse' && c.type !== 'initial');
    shuffle(pool);
    const choices = pool.slice(0, 3);
    choices.forEach(card => {
        const el = createCardElement(card, true);
        el.onclick = () => {
            game.deck.push(card.id);
            // 多次选择
            if (game.pendingAction && game.pendingAction.choices > 1) {
                game.pendingAction.choices--;
                showBattleReward();
            } else {
                game.pendingAction = null;
                game.battle = null;
                showScreen('map-screen');
                advanceWeek();
            }
        };
        area.appendChild(el);
    });
    document.getElementById('btn-skip-card').onclick = () => {
        game.pendingAction = null;
        game.battle = null;
        showScreen('map-screen');
        advanceWeek();
    };
}


// ===== 结局系统 =====
function showEnding() {
    let ending;
    const p = game.player;
    // 最终结算剩余学分
    settleCredits();
    // GPA 上下限钳制
    p.gpa = Math.min(5.0, Math.max(0, p.gpa));
    if (p.hp <= 0) ending = endings.mentalBreak;
    else if (p.gpa < 2.0) ending = endings.expelled;
    else if (p.gpa >= 4.8) ending = endings.S;
    else if (p.gpa >= 4.5) ending = endings.A;
    else if (p.gpa >= 3.5) ending = endings.B;
    else ending = endings.C;

    const screen = document.getElementById('ending-screen');
    screen.className = `screen active rank-${ending.rank}`;
    document.getElementById('ending-rank').textContent = ending.rank;
    document.getElementById('ending-title').textContent = ending.title;
    document.getElementById('ending-desc').textContent = ending.desc;
    document.getElementById('ending-gpa').textContent = `最终GPA：${p.gpa.toFixed(2)}`;
    document.getElementById('ending-money').textContent = `剩余生活费：${p.money}`;
    showScreen('ending-screen');
    screen.classList.add('active');
}

// ===== 查看牌组/遗物 =====
function showDeckView() {
    showScreen('deck-view-screen');
    const area = document.getElementById('deck-view-area');
    area.innerHTML = '';
    game.deck.forEach(cardId => {
        const card = getCardData(cardId);
        if (!card) return;
        const el = createCardElement(card, true);
        el.style.cursor = 'default';
        area.appendChild(el);
    });
}

function showRelicView() {
    showScreen('relic-view-screen');
    const area = document.getElementById('relic-view-area');
    area.innerHTML = '';
    if (game.relicsOwned.length === 0 && game.itemsOwned.length === 0) {
        area.innerHTML = '<p style="color:#888">暂无遗物或道具</p>';
        return;
    }
    // 遗物
    game.relicsOwned.forEach(key => {
        const relic = relics[key];
        if (!relic) return;
        const div = document.createElement('div');
        div.className = `relic-item ${relic.type === 'legendary' ? 'legendary' : ''}`;
        div.innerHTML = `
            <div class="relic-name">${relic.type === 'legendary' ? '⭐ ' : '🔹 '}${relic.name}</div>
            <div class="relic-effect">${relic.effect}</div>
            <div class="relic-flavor">${relic.flavor || ''}</div>
        `;
        area.appendChild(div);
    });
    // 道具
    game.itemsOwned.forEach(key => {
        const item = items[key];
        if (!item) return;
        const div = document.createElement('div');
        div.className = 'relic-item';
        div.style.borderColor = 'rgba(46, 204, 113, 0.4)';
        div.innerHTML = `
            <div class="relic-name" style="color:#2ecc71">🧪 ${item.name}</div>
            <div class="relic-effect">${item.effect}</div>
            <div class="relic-flavor">${item.flavor || ''}</div>
        `;
        area.appendChild(div);
    });
}

// ===== 事件绑定 =====
document.getElementById('btn-enroll').onclick = initGame;
document.getElementById('btn-load').onclick = loadGame;
document.getElementById('btn-credits').onclick = () => showScreen('credits-screen');
document.getElementById('btn-credits-back').onclick = () => showScreen('start-screen');
document.getElementById('btn-quit').onclick = () => {
    if (confirm('确定要退学（关闭游戏）吗？')) {
        window.close();
        document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;color:#888;font-size:18px;">退学成功。请关闭此页面。</div>';
    }
};
document.getElementById('btn-restart').onclick = initGame;
document.getElementById('btn-end-turn').onclick = endTurn;
document.getElementById('btn-view-deck').onclick = showDeckView;
document.getElementById('btn-view-relics').onclick = showRelicView;
document.getElementById('btn-close-deck').onclick = () => showScreen('map-screen');
document.getElementById('btn-close-relics').onclick = () => showScreen('map-screen');
document.getElementById('btn-use-item').onclick = showItemModal;
document.getElementById('btn-item-modal-close').onclick = () => document.getElementById('item-modal').classList.add('hidden');
document.getElementById('btn-pile-modal-close').onclick = () => document.getElementById('pile-modal').classList.add('hidden');
document.getElementById('draw-pile-visual').onclick = () => showPileModal('draw');
document.getElementById('discard-pile-visual').onclick = () => showPileModal('discard');

// ===== 战斗中道具与牌堆查看 =====
function showItemModal() {
    if (!game.battle) return;
    if (game.itemsOwned.length === 0) {
        alert('没有道具可使用。');
        return;
    }
    const modal = document.getElementById('item-modal');
    const list = document.getElementById('item-modal-list');
    list.innerHTML = '';
    game.itemsOwned.forEach((key, idx) => {
        const item = items[key];
        if (!item) return;
        const div = document.createElement('div');
        div.className = 'item-card';
        div.innerHTML = `<div class="item-name">${item.name}</div><div class="item-effect">${item.effect}</div><div class="item-flavor">${item.flavor || ''}</div>`;
        div.onclick = () => useItem(idx);
        list.appendChild(div);
    });
    modal.classList.remove('hidden');
}

function useItem(idx) {
    const key = game.itemsOwned[idx];
    if (!key) return;
    if (key === 'coffee') {
        game.battle.energy++;
    } else if (key === 'paper') {
        game.statuses.nextStudyDoubled = true;
    } else if (key === 'cola') {
        game.player.hp = Math.min(game.player.maxHp, game.player.hp + 15);
    }
    game.itemsOwned.splice(idx, 1);
    document.getElementById('item-modal').classList.add('hidden');
    renderBattle();
}

function showPileModal(which) {
    if (!game.battle) return;
    const pile = which === 'draw' ? game.battle.drawPile : game.battle.discardPile;
    const title = which === 'draw' ? `抽牌堆 (${pile.length}张)` : `弃牌堆 (${pile.length}张)`;
    document.getElementById('pile-modal-title').textContent = title;
    const list = document.getElementById('pile-modal-list');
    list.innerHTML = '';
    if (pile.length === 0) {
        list.innerHTML = '<p style="color:#888">空</p>';
    } else {
        // 抽牌堆乱序展示，弃牌堆按顺序
        const cards = which === 'draw' ? [...pile].sort(() => Math.random() - 0.5) : pile;
        cards.forEach(cardId => {
            const card = getCardData(cardId);
            if (!card) return;
            const el = createCardElement(card, true);
            el.style.cursor = 'default';
            list.appendChild(el);
        });
    }
    document.getElementById('pile-modal').classList.remove('hidden');
}
function saveGame() {
    try {
        const saveData = {
            player: game.player,
            deck: game.deck,
            currentWeekIndex: game.currentWeekIndex,
            randomEventPool: game.randomEventPool,
            relicsOwned: game.relicsOwned,
            itemsOwned: game.itemsOwned,
            gpaWarningTriggered: game.gpaWarningTriggered,
            gpaHistory: game.gpaHistory,
            statuses: game.statuses,
            savedAt: new Date().toISOString()
        };
        localStorage.setItem('nju_suffering_save', JSON.stringify(saveData));
        return true;
    } catch (e) {
        console.error('存档失败', e);
        return false;
    }
}

function loadGame() {
    const raw = localStorage.getItem('nju_suffering_save');
    if (!raw) {
        alert('没有找到返校档案。\n请先「入学」开始一段新的旅程。');
        return;
    }
    try {
        const saveData = JSON.parse(raw);
        game.player = saveData.player;
        game.deck = saveData.deck;
        game.currentWeekIndex = saveData.currentWeekIndex;
        game.randomEventPool = saveData.randomEventPool;
        game.relicsOwned = saveData.relicsOwned || [];
        game.itemsOwned = saveData.itemsOwned || [];
        game.gpaWarningTriggered = saveData.gpaWarningTriggered || { level1:false, level2:false, expelled:false };
        game.gpaHistory = saveData.gpaHistory || [3.5];
        game.statuses = saveData.statuses;
        game.battle = null;
        game.pendingAction = null;
        updateAllStats();
        showScreen('map-screen');
        showCurrentWeek();
    } catch (e) {
        alert('返校档案损坏，无法读取。');
        console.error(e);
    }
}
