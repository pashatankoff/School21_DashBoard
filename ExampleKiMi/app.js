const state = {
  screen: 'dashboard',
  data: {
    ventilation: [
      {id:'pv1', name:'ПВ1', type:'Приток', status:true, speed:85},
      {id:'v5', name:'В5', type:'Вытяжка', status:true, speed:60},
      {id:'p2', name:'П2', type:'Приток', status:false, speed:0},
      {id:'v6', name:'В6', type:'Вытяжка', status:true, speed:70},
      {id:'p3', name:'П3', type:'Приток', status:true, speed:80},
      {id:'v7', name:'В7', type:'Вытяжка', status:true, speed:50},
      {id:'p4', name:'П4', type:'Приток', status:false, speed:0},
      {id:'v8', name:'В8', type:'Вытяжка', status:true, speed:65},
      {id:'p5', name:'П5', type:'Приток', status:true, speed:90},
      {id:'v9', name:'В9', type:'Вытяжка', status:true, speed:55},
      {id:'v2', name:'В2', type:'Вытяжка', status:true, speed:75},
      {id:'v10', name:'В10', type:'Вытяжка', status:true, speed:60},
      {id:'v3', name:'В3', type:'Вытяжка', status:false, speed:0},
      {id:'v11', name:'В11', type:'Вытяжка', status:true, speed:50},
      {id:'v4', name:'В4', type:'Вытяжка', status:true, speed:70}
    ],
    itp: {
      t_supply: 65.2,
      t_return: 48.1,
      p_supply: 3.2,
      p_return: 2.8,
      flow: 12.4,
      energy: 145.2,
      pump: true
    },
    water: {
      cold: 145.2,
      hot: 89.1,
      leaks: [
        {name:'Серверная', status:'ok'},
        {name:'Винт-камера', status:'ok'}
      ]
    },
    electric: {
      l1: {u:223, i:45, p:12.5},
      l2: {u:228, i:42, p:11.2},
      l3: {u:220, i:48, p:13.5},
      total: 45.2,
      breakers: [
        {name:'ВВОД 1', status:true},
        {name:'ВВОД 2', status:true},
        {name:'Серверная', status:true},
        {name:'Винт-камера', status:true},
        {name:'Освещение', status:false},
        {name:'Розетки', status:true}
      ]
    },
    ac: Array.from({length: 24}, (_, i) => ({
      id: i + 1,
      name: 'К-' + String(i + 1).padStart(2, '0'),
      set: 22,
      blowTemp: 14 + Math.random() * 6
    })),
    alarms: [
      {id:1, time:'14:32:15', text:'Повышенная температура в Серверной: 28.5°C', level:'warning', ack:false},
      {id:2, time:'14:15:00', text:'Критический уровень расхода ИТП: < 10 м³/ч', level:'critical', ack:false},
      {id:3, time:'09:20:10', text:'Перебой питания ВВОД 2 (длительность 5с)', level:'warning', ack:true},
      {id:4, time:'08:00:00', text:'Система запущена', level:'info', ack:true}
    ],
    settings: {
      brightness: 80,
      sound: true,
      ip: '192.168.1.100'
    }
  }
};

const titles = {
  dashboard: 'Главная',
  ventilation: 'Вентиляция',
  itp: 'ИТП и Отопление',
  water: 'Водоснабжение',
  electric: 'Электроснабжение',
  climate: 'Кондиционеры',
  alarms: 'Журнал аварий',
  settings: 'Настройки'
};

function init() {
  updateClock();
  setInterval(updateClock, 1000);
  render(state.screen);
  document.getElementById('bottom-nav').addEventListener('click', e => {
    const btn = e.target.closest('.nav-btn');
    if (!btn) return;
    const screen = btn.dataset.screen;
    switchScreen(screen);
  });
  document.getElementById('main-content').addEventListener('click', handleMainClick);
}

function updateClock() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('ru-RU', {hour:'2-digit', minute:'2-digit'});
  const dateStr = now.toLocaleDateString('ru-RU', {day:'2-digit', month:'2-digit', year:'numeric'});
  document.getElementById('clock').textContent = timeStr;
  document.getElementById('date').textContent = dateStr;
}

function switchScreen(screen) {
  state.screen = screen;
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.screen === screen));
  document.getElementById('screen-title').textContent = titles[screen] || screen;
  render(screen);
}

function render(screen) {
  const main = document.getElementById('main-content');
  main.innerHTML = '';
  switch(screen) {
    case 'dashboard': main.appendChild(renderDashboard()); break;
    case 'ventilation': main.appendChild(renderVentilation()); break;
    case 'itp': main.appendChild(renderITP()); break;
    case 'water': main.appendChild(renderWater()); break;
    case 'electric': main.appendChild(renderElectric()); break;
    case 'climate': main.appendChild(renderClimate()); break;
    case 'alarms': main.appendChild(renderAlarms()); break;
    case 'settings': main.appendChild(renderSettings()); break;
  }
  updateNavBadge();
}

function card(title, bodyClass, ...children) {
  const el = document.createElement('div');
  el.className = 'card';
  const header = document.createElement('div');
  header.className = 'card-header';
  header.textContent = title;
  el.appendChild(header);
  const body = document.createElement('div');
  body.className = bodyClass || 'card-body';
  children.forEach(c => body.appendChild(c));
  el.appendChild(body);
  return el;
}

function bigValue(val, unit, sub) {
  const wrap = document.createElement('div');
  const v = document.createElement('div');
  v.className = 'big-value';
  v.innerHTML = val + '<span class="unit">' + unit + '</span>';
  wrap.appendChild(v);
  if (sub) {
    const s = document.createElement('div');
    s.className = 'sub-value';
    s.textContent = sub;
    wrap.appendChild(s);
  }
  return wrap;
}

function renderDashboard() {
  const grid = document.createElement('div');
  grid.className = 'grid grid-3';
  const d = state.data;
  const onV = d.ventilation.filter(v => v.status).length;
  const avgBlow = d.ac.reduce((s, a) => s + a.blowTemp, 0) / d.ac.length;
  const activeAlarms = d.alarms.filter(a => !a.ack && a.level !== 'info').length;
  const leakAlarm = d.water.leaks.some(l => l.status !== 'ok');

  grid.appendChild(card('Вентиляция', '', bigValue(onV + ' / ' + d.ventilation.length, 'работают', 'Скорость средняя: 68%')));
  grid.appendChild(card('ИТП', '', bigValue(d.itp.t_supply.toFixed(1), '°C', 'Т подачи / обратка ' + d.itp.t_return.toFixed(1) + '°C')));
  grid.appendChild(card('Водоснабжение', '', bigValue(d.water.cold, 'м³', 'ГВС: ' + d.water.hot + ' м³')));
  grid.appendChild(card('Электроснабжение', '', bigValue(d.electric.total.toFixed(1), 'кВт', 'L1: ' + d.electric.l1.u + 'V · L2: ' + d.electric.l2.u + 'V · L3: ' + d.electric.l3.u + 'V')));
  grid.appendChild(card('Кондиционеры', '', bigValue(d.ac.length, 'установок', 'Средняя t выдува: ' + avgBlow.toFixed(1) + '°C')));
  
  const alarmCard = card('Аварии', '', bigValue(activeAlarms, 'активных', leakAlarm ? 'Обнаружена протечка!' : 'Все системы норм'));
  if (activeAlarms > 0) alarmCard.style.borderColor = 'var(--danger)';
  grid.appendChild(alarmCard);
  return grid;
}

function renderVentilation() {
  const grid = document.createElement('div');
  grid.className = 'grid grid-5';
  state.data.ventilation.forEach(v => {
    const el = document.createElement('div');
    el.className = 'card vent-card';
    el.dataset.id = v.id;
    el.innerHTML = `
      <div class="name">${v.name}</div>
      <div class="type">${v.type}</div>
      <div class="vent-meta">
        <div class="vent-speed">${v.status ? v.speed + '%' : '—'}</div>
        <button class="vent-btn ${v.status ? 'on' : ''}" data-action="toggle-vent" data-id="${v.id}">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5">
            ${v.status ? '<path d="M18 6L6 18M6 6l12 12"/>' : '<path d="M5 12h14M12 5v14"/>'}
          </svg>
        </button>
      </div>
    `;
    grid.appendChild(el);
  });
  return grid;
}

function renderITP() {
  const wrap = document.createElement('div');
  const row = document.createElement('div');
  row.className = 'grid gauge-row';
  const d = state.data.itp;
  const items = [
    {label:'Т подачи', val:d.t_supply.toFixed(1), unit:'°C'},
    {label:'Т обратки', val:d.t_return.toFixed(1), unit:'°C'},
    {label:'Давление под.', val:d.p_supply.toFixed(1), unit:'бар'},
    {label:'Давление обр.', val:d.p_return.toFixed(1), unit:'бар'},
    {label:'Расход', val:d.flow.toFixed(1), unit:'м³/ч'},
    {label:'Энергия', val:d.energy.toFixed(1), unit:'Гкал'},
    {label:'Насос', val:d.pump ? 'ON' : 'OFF', unit:'', cls: d.pump ? 'on' : 'off'},
    {label:'Контроллер', val:'OK', unit:'', cls:'on'}
  ];
  items.forEach(item => {
    const c = document.createElement('div');
    c.className = 'card gauge-card';
    c.innerHTML = `
      <div class="gauge-label">${item.label}</div>
      <div class="gauge-value ${item.cls || ''}">${item.val}</div>
      ${item.unit ? `<div class="gauge-unit">${item.unit}</div>` : ''}
    `;
    row.appendChild(c);
  });
  wrap.appendChild(row);
  return wrap;
}

function renderWater() {
  const grid = document.createElement('div');
  grid.className = 'grid grid-2';
  const d = state.data.water;

  const cold = card('ХВС', '', bigValue(d.cold.toFixed(1), 'м³', 'Счетчик холодной воды'));
  const hot = card('ГВС', '', bigValue(d.hot.toFixed(1), 'м³', 'Счетчик горячей воды'));
  grid.appendChild(cold);
  grid.appendChild(hot);

  d.leaks.forEach(l => {
    const tile = document.createElement('div');
    tile.className = 'card leak-tile';
    tile.innerHTML = `
      <div class="icon ${l.status !== 'ok' ? 'alarm' : ''}">
        <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/><path d="M12 18h.01"/></svg>
      </div>
      <div class="loc">${l.name}</div>
      <div class="state">${l.status === 'ok' ? 'НОРМА' : 'ТРЕВОГА'}</div>
    `;
    grid.appendChild(tile);
  });
  return grid;
}

function renderElectric() {
  const wrap = document.createElement('div');
  const phases = document.createElement('div');
  phases.className = 'grid grid-3';
  ['l1','l2','l3'].forEach(key => {
    const p = state.data.electric[key];
    const c = document.createElement('div');
    c.className = 'card phase-card';
    c.innerHTML = `
      <div class="phase-label">${key.toUpperCase()}</div>
      <div class="phase-volts">${p.u} <span style="font-size:24px;color:var(--text-muted)">V</span></div>
      <div class="phase-amps">${p.i} A · ${p.p} кВт</div>
    `;
    phases.appendChild(c);
  });
  wrap.appendChild(phases);

  const total = document.createElement('div');
  total.style.marginTop = '16px';
  total.innerHTML = `
    <div class="card" style="flex-direction:row;align-items:center;justify-content:space-between;">
      <div style="font-size:18px;font-weight:700;">Общая мощность</div>
      <div class="big-value">${state.data.electric.total.toFixed(1)}<span class="unit">кВт</span></div>
    </div>
  `;
  wrap.appendChild(total);

  const breakers = document.createElement('div');
  breakers.className = 'breaker-grid';
  state.data.electric.breakers.forEach((b, idx) => {
    const el = document.createElement('div');
    el.className = 'card breaker-card';
    el.dataset.action = 'toggle-breaker';
    el.dataset.idx = idx;
    el.innerHTML = `
      <div class="breaker-name">${b.name}</div>
      <div class="breaker-indicator ${b.status ? '' : 'off'}"></div>
    `;
    breakers.appendChild(el);
  });
  wrap.appendChild(breakers);
  return wrap;
}

const AC_BLOW_ICON = '<svg class="ac-blow-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="3" width="14" height="7" rx="1.5"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="8.5" x2="16" y2="8.5"/><path d="M8 14c1.5 2 1.5 4 0 6"/><path d="M12 13v8"/><path d="M16 14c-1.5 2-1.5 4 0 6"/></svg>';

function renderClimate() {
  const wrap = document.createElement('div');
  wrap.className = 'ac-page';
  const acList = state.data.ac;
  const avgBlow = acList.reduce((s, a) => s + a.blowTemp, 0) / acList.length;

  const toolbar = document.createElement('div');
  toolbar.className = 'ac-toolbar';
  toolbar.innerHTML = `
    <div class="ac-toolbar-info">
      <span class="ac-toolbar-title">${acList.length} кондиционера</span>
      <span class="ac-hint">ср. ${avgBlow.toFixed(1)}°C · ИК · без обратной связи</span>
    </div>
    <div class="ac-toolbar-actions">
      <button class="ac-ir-btn ac-ir-all ac-ir-on" data-action="ac-all-on">Все ВКЛ</button>
      <button class="ac-ir-btn ac-ir-all ac-ir-off" data-action="ac-all-off">Все ВЫКЛ</button>
    </div>
  `;
  wrap.appendChild(toolbar);

  const grid = document.createElement('div');
  grid.className = 'grid ac-grid';
  state.data.ac.forEach((ac, idx) => {
    const el = document.createElement('div');
    el.className = 'card ac-card';
    el.innerHTML = `
      <div class="ac-name-row">
        <span class="ac-name">${ac.name}</span>
        <div class="ac-blow-inline" title="Температура выдува">${AC_BLOW_ICON}<span class="ac-blow-value">${ac.blowTemp.toFixed(1)}°</span></div>
      </div>
      <div class="ac-set-row">
        <button class="ac-btn ac-btn-sm" data-action="ac-down" data-idx="${idx}">−</button>
        <span class="ac-setpoint">${ac.set}°</span>
        <button class="ac-btn ac-btn-sm" data-action="ac-up" data-idx="${idx}">+</button>
      </div>
      <div class="ac-power-row">
        <button class="ac-ir-btn ac-ir-on" data-action="ac-on" data-idx="${idx}">ВКЛ</button>
        <button class="ac-ir-btn ac-ir-off" data-action="ac-off" data-idx="${idx}">ВЫКЛ</button>
      </div>
    `;
    grid.appendChild(el);
  });
  wrap.appendChild(grid);
  return wrap;
}

function sendIrCommand(acId, command, setpoint) {
  // TODO: отправка команды на ИК-эмулятор (REST / WebSocket)
  console.log('IR', {acId, command, setpoint});
}

function sendIrAllCommand(command) {
  state.data.ac.forEach(ac => sendIrCommand(ac.id, command, ac.set));
}

function renderAlarms() {
  const list = document.createElement('div');
  list.className = 'alarm-list';
  state.data.alarms.forEach(a => {
    const el = document.createElement('div');
    el.className = 'alarm-item';
    el.innerHTML = `
      <div class="alarm-strip ${a.level}"></div>
      <div class="alarm-body">
        <div class="alarm-time">${a.time}</div>
        <div class="alarm-text">${a.text}</div>
      </div>
      ${!a.ack ? `<button class="alarm-ack" data-action="ack-alarm" data-id="${a.id}">Квитировать</button>` : '<div style="display:flex;align-items:center;padding:0 20px;color:var(--text-muted);font-size:13px;font-weight:700;">Квит.</div>'}
    `;
    list.appendChild(el);
  });
  return list;
}

function renderSettings() {
  const wrap = document.createElement('div');
  const s = state.data.settings;

  const row1 = document.createElement('div');
  row1.className = 'settings-row';
  row1.innerHTML = `
    <label>Яркость экрана</label>
    <input type="range" min="10" max="100" value="${s.brightness}" data-action="brightness" id="brightness-range">
  `;
  wrap.appendChild(row1);

  const row2 = document.createElement('div');
  row2.className = 'settings-row';
  row2.innerHTML = `
    <label>Звук уведомлений</label>
    <button class="ac-power ${s.sound ? '' : 'off'}" data-action="toggle-sound" style="width:80px;">${s.sound ? 'ON' : 'OFF'}</button>
  `;
  wrap.appendChild(row2);

  const row3 = document.createElement('div');
  row3.className = 'settings-row';
  row3.innerHTML = `
    <label>IP-адрес панели</label>
    <div style="font-size:18px;font-weight:700;color:var(--primary);">${s.ip}</div>
  `;
  wrap.appendChild(row3);

  const grid = document.createElement('div');
  grid.className = 'grid settings-grid';
  const buttons = [
    {label:'Дата и время', icon:'<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'},
    {label:'Сеть', icon:'<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/></svg>'},
    {label:'О системе', icon:'<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'},
    {label:'Перезагрузка', icon:'<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>'},
    {label:'Калибровка', icon:'<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'},
    {label:'Логи', icon:'<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>'}
  ];
  buttons.forEach(b => {
    const btn = document.createElement('button');
    btn.className = 'settings-btn';
    btn.innerHTML = `${b.icon}<span>${b.label}</span>`;
    grid.appendChild(btn);
  });
  wrap.appendChild(grid);
  return wrap;
}

function handleMainClick(e) {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const action = btn.dataset.action;
  switch(action) {
    case 'toggle-vent': {
      const id = btn.dataset.id;
      const v = state.data.ventilation.find(x => x.id === id);
      if (v) { v.status = !v.status; v.speed = v.status ? 60 : 0; }
      render('ventilation');
      break;
    }
    case 'toggle-breaker': {
      const idx = parseInt(btn.dataset.idx);
      state.data.electric.breakers[idx].status = !state.data.electric.breakers[idx].status;
      render('electric');
      break;
    }
    case 'ac-on':
    case 'ac-off': {
      const idx = parseInt(btn.dataset.idx);
      const ac = state.data.ac[idx];
      sendIrCommand(ac.id, action === 'ac-on' ? 'on' : 'off', ac.set);
      btn.classList.add('sent');
      setTimeout(() => btn.classList.remove('sent'), 500);
      break;
    }
    case 'ac-all-on':
    case 'ac-all-off': {
      const cmd = action === 'ac-all-on' ? 'on' : 'off';
      sendIrAllCommand(cmd);
      btn.classList.add('sent');
      setTimeout(() => btn.classList.remove('sent'), 600);
      break;
    }
    case 'ac-up': {
      const idx = parseInt(btn.dataset.idx);
      if (state.data.ac[idx].set < 30) {
        state.data.ac[idx].set++;
        sendIrCommand(state.data.ac[idx].id, 'setpoint', state.data.ac[idx].set);
      }
      render('climate');
      break;
    }
    case 'ac-down': {
      const idx = parseInt(btn.dataset.idx);
      if (state.data.ac[idx].set > 16) {
        state.data.ac[idx].set--;
        sendIrCommand(state.data.ac[idx].id, 'setpoint', state.data.ac[idx].set);
      }
      render('climate');
      break;
    }
    case 'ack-alarm': {
      const id = parseInt(btn.dataset.id);
      const a = state.data.alarms.find(x => x.id === id);
      if (a) a.ack = true;
      render('alarms');
      updateNavBadge();
      break;
    }
    case 'toggle-sound': {
      state.data.settings.sound = !state.data.settings.sound;
      render('settings');
      break;
    }
  }
}

function updateNavBadge() {
  const active = state.data.alarms.filter(a => !a.ack && a.level !== 'info').length;
  const badge = document.getElementById('nav-alarm-badge');
  badge.textContent = active;
  badge.style.display = active > 0 ? 'flex' : 'none';
}

// Simulate periodic updates
setInterval(() => {
  // Random tiny fluctuation for ITP
  state.data.itp.t_supply += (Math.random() - 0.5) * 0.2;
  state.data.itp.t_return += (Math.random() - 0.5) * 0.2;
  state.data.itp.flow += (Math.random() - 0.5) * 0.1;
  state.data.electric.total += (Math.random() - 0.5) * 0.3;
  state.data.electric.l1.u = Math.round(220 + Math.random() * 10);
  state.data.electric.l2.u = Math.round(220 + Math.random() * 10);
  state.data.electric.l3.u = Math.round(220 + Math.random() * 10);
  state.data.ac.forEach(a => {
    a.blowTemp += (Math.random() - 0.5) * 0.4;
    a.blowTemp = Math.max(10, Math.min(30, a.blowTemp));
  });
  if (state.screen === 'dashboard' || state.screen === 'itp' || state.screen === 'electric' || state.screen === 'climate') {
    render(state.screen);
  }
}, 3000);

init();
