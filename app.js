const state = {
  screen: 'ventilation',
  data: {
    ventilation: [
      { id: 'pv1', name: 'ПВ1', supply: 15.0, return: 17.2, setpoint: 14.0, status: 'running', speed: 85, season: 'Лето' },
      { id: 'v5', name: 'В5', supply: 22.1, return: 22.4, setpoint: 22.0, status: 'running', speed: 60, season: 'Лето' },
      { id: 'p2', name: 'П2', supply: 28.4, return: 26.1, setpoint: 14.0, status: 'alarm', speed: 0, season: 'Зима' },
      { id: 'v6', name: 'В6', supply: 21.8, return: 22.0, setpoint: 22.0, status: 'running', speed: 70, season: 'Лето' },
      { id: 'p3', name: 'П3', supply: 14.6, return: 16.8, setpoint: 14.0, status: 'running', speed: 80, season: 'Зима' },
      { id: 'v7', name: 'В7', supply: 23.0, return: 23.2, setpoint: 23.0, status: 'running', speed: 50, season: 'Лето' },
      { id: 'p4', name: 'П4', supply: 18.2, return: 19.0, setpoint: 16.0, status: 'stopped', speed: 0, season: 'Зима' },
      { id: 'v8', name: 'В8', supply: 21.5, return: 21.9, setpoint: 22.0, status: 'running', speed: 65, season: 'Лето' },
      { id: 'p5', name: 'П5', supply: 13.9, return: 15.5, setpoint: 14.0, status: 'running', speed: 90, season: 'Зима' },
      { id: 'v9', name: 'В9', supply: 22.4, return: 22.7, setpoint: 22.0, status: 'running', speed: 55, season: 'Лето' },
      { id: 'v2', name: 'В2', supply: 20.8, return: 21.1, setpoint: 21.0, status: 'running', speed: 75, season: 'Лето' },
      { id: 'v10', name: 'В10', supply: 22.0, return: 22.3, setpoint: 22.0, status: 'running', speed: 60, season: 'Лето' },
      { id: 'v3', name: 'В3', supply: 31.2, return: 29.5, setpoint: 22.0, status: 'alarm', speed: 0, season: 'Лето' },
      { id: 'v11', name: 'В11', supply: 21.0, return: 21.4, setpoint: 21.0, status: 'running', speed: 50, season: 'Лето' },
      { id: 'v4', name: 'В4', supply: 22.6, return: 22.9, setpoint: 22.0, status: 'stopped', speed: 0, season: 'Зима' }
    ],
    itp: {
      t_supply: 65.2,
      t_return: 48.1,
      pressure: 3.2,
      power: 0.85,
      energy: 145.2
    },
    water: {
      flow: 2.4,
      total: 145.2,
      leaks: [
        { name: 'Серверная', status: 'ok' },
        { name: 'Венткамера', status: 'ok' },
        { name: 'ИТП', status: 'ok' }
      ]
    },
    electric: {
      feeds: [
        { name: 'ВВОД 1', status: true, phases: { l1: true, l2: true, l3: true } },
        { name: 'ВВОД 2', status: true, phases: { l1: true, l2: true, l3: true } }
      ],
      l1: { u: 223, i: 45, p: 12.5, ok: true },
      l2: { u: 228, i: 42, p: 11.2, ok: true },
      l3: { u: 220, i: 48, p: 13.5, ok: true },
      total: 45.2,
      breakers: [
        { name: 'ВВОД 1', status: true },
        { name: 'ВВОД 2', status: true },
        { name: 'Серверная', status: true },
        { name: 'Винт-камера', status: true },
        { name: 'Освещение', status: false },
        { name: 'Розетки', status: true }
      ]
    },
    // cmd — последняя ИК-команда (подтверждения нет), intakeTemp/blowTemp — датчики на вдуве и выдуве.
    // Работа блока определяется по ΔT = вдув − выдув.
    ac: Array.from({ length: 24 }, (_, i) => {
      const cmd = i % 6 !== 5;
      const faulty = i === 6;
      const intakeTemp = 22 + Math.random() * 5;
      const cooling = cmd && !faulty;
      return {
        id: i + 1,
        name: 'К-' + String(i + 1).padStart(2, '0'),
        set: 22,
        cmd,
        intakeTemp,
        blowTemp: cooling ? intakeTemp - 9 - Math.random() * 3 : intakeTemp - Math.random()
      };
    }),
    alarms: [
      { id: 1, time: '14:32:15', text: 'Авария вентиляции П2: отказ двигателя', level: 'critical', ack: false },
      { id: 2, time: '14:28:40', text: 'Авария вентиляции В3: датчик перегрева', level: 'critical', ack: false },
      { id: 3, time: '14:15:00', text: 'Критический уровень расхода ИТП: < 10 м³/ч', level: 'warning', ack: false },
      { id: 4, time: '09:20:10', text: 'Перебой питания ВВОД 2 (длительность 5с)', level: 'warning', ack: true },
      { id: 5, time: '08:00:00', text: 'Система запущена', level: 'info', ack: true }
    ],
    settings: {
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
  switchScreen(state.screen);
  document.getElementById('bottom-nav').addEventListener('click', e => {
    const btn = e.target.closest('.nav-btn');
    if (!btn) return;
    switchScreen(btn.dataset.screen);
  });
  document.getElementById('main-content').addEventListener('click', handleMainClick);
}

function updateClock() {
  const now = new Date();
  document.getElementById('clock').textContent = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  document.getElementById('date').textContent = now.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
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
  const renderers = {
    dashboard: renderDashboard,
    ventilation: renderVentilation,
    itp: renderITP,
    water: renderWater,
    electric: renderElectric,
    climate: renderClimate,
    alarms: renderAlarms,
    settings: renderSettings
  };
  main.appendChild((renderers[screen] || renderDashboard)());
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
  children.forEach(c => {
    if (typeof c === 'string') body.insertAdjacentHTML('beforeend', c);
    else if (c) body.appendChild(c);
  });
  el.appendChild(body);
  return el;
}

function itpDelta() {
  return state.data.itp.t_supply - state.data.itp.t_return;
}

function ventAlarmCount() {
  return state.data.ventilation.filter(v => v.status === 'alarm').length;
}

function getAlarmDashSummary(alarms) {
  const critical = alarms.filter(a => !a.ack && a.level === 'critical');

  const shorten = text => text
    .replace(/^Авария вентиляции /, '')
    .replace(/^Критический уровень расхода /, 'ИТП: ');

  const sortedByTime = [...critical].sort((a, b) => b.time.localeCompare(a.time));
  const latest = sortedByTime[0];

  return {
    count: critical.length,
    barClass: critical.length ? 'alarm' : 'ok',
    borderClass: critical.length ? 'alarm-border' : '',
    barText: latest ? shorten(latest.text) : 'Аварий нет'
  };
}

function renderDashboard() {
  const grid = document.createElement('div');
  grid.className = 'grid dashboard-grid';
  const d = state.data;
  const onV = d.ventilation.filter(v => v.status === 'running').length;
  const vAlarms = ventAlarmCount();
  const delta = itpDelta();
  const alarmSum = getAlarmDashSummary(d.alarms);

  const ventAlarmClass = vAlarms > 0 ? 'alarm' : 'ok';
  const ventAlarmText = vAlarms > 0
    ? vAlarms + ' авар. · ' + d.ventilation.filter(v => v.status === 'alarm').map(v => v.name).join(', ')
    : 'Аварий нет';

  grid.appendChild(card('Вентиляция', '', `
    <div class="big-value">${onV}<span class="unit">/ ${d.ventilation.length}</span></div>
    <div class="sub-value">работают</div>
    <div class="vent-alarm-bar ${ventAlarmClass}">${ventAlarmText}</div>
  `));

  grid.appendChild(card('ИТП', '', `
    <div class="itp-dash-list">
      <div class="itp-dash-row">
        <span class="dash-metric-label">Т подачи</span>
        <span class="dash-metric-value">${d.itp.t_supply.toFixed(1)}<span class="unit-sm">°C</span></span>
      </div>
      <div class="itp-dash-row">
        <span class="dash-metric-label">Т обратки</span>
        <span class="dash-metric-value">${d.itp.t_return.toFixed(1)}<span class="unit-sm">°C</span></span>
      </div>
      <div class="itp-dash-row">
        <span class="dash-metric-label">ΔT</span>
        <span class="dash-metric-value">${delta.toFixed(1)}<span class="unit-sm">°C</span></span>
      </div>
    </div>
  `));

  const leakAlarm = d.water.leaks.some(l => l.status !== 'ok');
  const leakRows = d.water.leaks.map(l => `
    <div class="itp-dash-row">
      <span class="dash-metric-label">${l.name}</span>
      <div class="dot-lg ${l.status !== 'ok' ? 'alarm' : ''}"></div>
    </div>
  `).join('');

  grid.appendChild(card('Водоснабжение', 'card-body water-dash-body', `
    <div class="itp-dash-list water-dash-list">
      <div class="water-metrics">
        <div class="itp-dash-row">
          <span class="dash-metric-label">Расход</span>
          <span class="dash-metric-value">${d.water.flow.toFixed(1)}<span class="unit-sm">м³/ч</span></span>
        </div>
        <div class="itp-dash-row">
          <span class="dash-metric-label">Всего</span>
          <span class="dash-metric-value">${d.water.total.toFixed(1)}<span class="unit-sm">м³</span></span>
        </div>
      </div>
      <div class="leak-section">
        <div class="dash-metric-label leak-section-label">Протечки</div>
        <div class="leak-group ${leakAlarm ? 'alarm' : 'ok'}">
          <div class="leak-group-inner">
            <div class="leak-group-stripe"></div>
            <div class="leak-group-rows">${leakRows}</div>
          </div>
        </div>
      </div>
    </div>
  `));

  const feedHtml = d.electric.feeds.map(f => {
    const phaseHtml = ['l1', 'l2', 'l3'].map(key => `
      <div class="phase-dot-item">
        <div class="dot-lg ${f.phases[key] ? '' : 'off'}"></div>
        <span class="phase-name">${key.toUpperCase()}</span>
      </div>
    `).join('');
    return `
      <div class="power-feed">
        <span class="power-feed-name">${f.name}</span>
        <div class="power-feed-body">
          <span class="status-pill ${f.status ? 'on' : 'off'}">${f.status ? 'Подключено' : 'Нет'}</span>
          <div class="phase-dots">${phaseHtml}</div>
        </div>
      </div>
    `;
  }).join('');

  grid.appendChild(card('Электроснабжение', '', `
    <div class="power-feeds">${feedHtml}</div>
  `));

  const AC_DT_ON = 5;
  const acIsCooling = a => a.intakeTemp - a.blowTemp > AC_DT_ON;
  const acWorking = d.ac.filter(acIsCooling).length;
  const zoneMin = Math.min(...d.ac.map(a => a.intakeTemp));
  const zoneMax = Math.max(...d.ac.map(a => a.intakeTemp));
  const acNoCool = d.ac.filter(a => a.cmd && !acIsCooling(a)).map(a => a.name);
  const acNoOff = d.ac.filter(a => !a.cmd && acIsCooling(a)).map(a => a.name);
  const acProblems = [];
  if (acNoCool.length) acProblems.push('не охлаждает: ' + acNoCool.join(', '));
  if (acNoOff.length) acProblems.push('не отключился: ' + acNoOff.join(', '));
  const acAlarmClass = acProblems.length ? 'alarm' : 'ok';
  const acAlarmText = acProblems.length ? acProblems.join(' · ') : 'Команды подтверждены';

  grid.appendChild(card('Кондиционеры', '', `
    <div class="big-value">${acWorking}<span class="unit">/ ${d.ac.length}</span></div>
    <div class="ac-dash-meta">
      <div class="sub-value">работают</div>
      <div class="ac-dash-zones">зоны ${zoneMin.toFixed(1)}…${zoneMax.toFixed(1)} °C</div>
    </div>
    <div class="dash-tile-alarm-slot">
      <div class="vent-alarm-bar ${acAlarmClass}">${acAlarmText}</div>
    </div>
  `));

  const alarmCard = card('Аварии', '', `
    <div class="big-value">${alarmSum.count}</div>
    <div class="alarm-dash-meta">
      <div class="sub-value">критических</div>
      ${alarmSum.count
        ? '<span class="status-pill alarm-dash-ack-pill">не квитировано</span>'
        : '<span class="status-pill on">квитировано</span>'}
    </div>
    <div class="dash-tile-alarm-slot">
      ${alarmSum.count ? '<span class="alarm-dash-bar-label">Последняя</span>' : ''}
      <div class="vent-alarm-bar alarm-dash-bar ${alarmSum.barClass}">${alarmSum.barText}</div>
    </div>
  `);
  if (alarmSum.borderClass) alarmCard.classList.add(alarmSum.borderClass);
  grid.appendChild(alarmCard);

  return grid;
}

function renderVentilation() {
  const wrap = document.createElement('div');
  wrap.className = 'vent-table';

  const header = document.createElement('div');
  header.className = 'vent-row vent-row-header';
  header.innerHTML = `
    <span class="vent-col vent-col-name">Установка</span>
    <span class="vent-col vent-col-temp">Т притока</span>
    <span class="vent-col vent-col-temp">Т возвр.</span>
    <span class="vent-col vent-col-temp">Т уставки</span>
    <span class="vent-col vent-col-speed">Скорость</span>
    <span class="vent-col vent-col-season">Сезон</span>
    <span class="vent-col vent-col-status">Статус</span>
  `;
  wrap.appendChild(header);

  const statusLabel = {
    running: 'В работе',
    stopped: 'Стоп',
    alarm: 'Авария'
  };

  state.data.ventilation.forEach(v => {
    const el = document.createElement('div');
    el.className = 'vent-row status-' + v.status;
    el.dataset.id = v.id;
    el.innerHTML = `
      <span class="vent-col vent-col-name">${v.name}</span>
      <span class="vent-col vent-col-temp">${v.supply.toFixed(1)}<span class="vent-unit">°C</span></span>
      <span class="vent-col vent-col-temp">${v.return.toFixed(1)}<span class="vent-unit">°C</span></span>
      <span class="vent-col vent-col-temp">${v.setpoint.toFixed(1)}<span class="vent-unit">°C</span></span>
      <span class="vent-col vent-col-speed">${v.speed}<span class="vent-unit">%</span></span>
      <span class="vent-col vent-col-season">${v.season}</span>
      <span class="vent-col vent-col-status"><span class="vent-status-pill">${statusLabel[v.status] || v.status}</span></span>
    `;
    wrap.appendChild(el);
  });
  return wrap;
}

function renderITP() {
  const wrap = document.createElement('div');
  const d = state.data.itp;
  const delta = itpDelta();

  const title = document.createElement('div');
  title.className = 'itp-section-title';
  title.textContent = 'Тепловычислитель · контроллер отопления';
  wrap.appendChild(title);

  const row = document.createElement('div');
  row.className = 'grid gauge-row';

  const items = [
    { label: 'Давление', val: d.pressure.toFixed(2), unit: 'бар' },
    { label: 'Т подачи', val: d.t_supply.toFixed(1), unit: '°C' },
    { label: 'Т обратки', val: d.t_return.toFixed(1), unit: '°C' },
    { label: 'ΔT (съём)', val: delta.toFixed(1), unit: '°C' },
    { label: 'Мощность', val: d.power.toFixed(2), unit: 'Гкал/ч' },
    { label: 'Расход тепла', val: d.energy.toFixed(1), unit: 'Гкал' }
  ];

  items.forEach(item => {
    const c = document.createElement('div');
    c.className = 'card gauge-card';
    c.innerHTML = `
      <div class="gauge-label">${item.label}</div>
      <div class="gauge-value">${item.val}</div>
      <div class="gauge-unit">${item.unit}</div>
    `;
    row.appendChild(c);
  });

  wrap.appendChild(row);
  return wrap;
}

function renderWater() {
  const grid = document.createElement('div');
  grid.className = 'grid grid-3';
  const d = state.data.water;

  const flowCard = card('Счётчик воды', 'card-body water-flow-card', `
    <div class="big-value">${d.flow.toFixed(2)}<span class="unit">м³/ч</span></div>
    <div class="sub-value">Текущий расход</div>
    <div class="sub-value" style="margin-top:8px">Накопленный объём: ${d.total.toFixed(1)} м³</div>
  `);
  grid.appendChild(flowCard);

  d.leaks.forEach(l => {
    const tile = document.createElement('div');
    tile.className = 'card leak-tile';
    tile.innerHTML = `
      <div class="icon ${l.status !== 'ok' ? 'alarm' : ''}">
        <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
        </svg>
      </div>
      <div class="loc">${l.name}</div>
      <div class="state">${l.status === 'ok' ? 'НОРМА' : 'ПРОТЕЧКА'}</div>
    `;
    grid.appendChild(tile);
  });

  return grid;
}

function renderElectric() {
  const wrap = document.createElement('div');
  const d = state.data.electric;

  const feeds = document.createElement('div');
  feeds.className = 'grid grid-2';
  feeds.style.marginBottom = '14px';
  d.feeds.forEach(f => {
    const c = document.createElement('div');
    c.className = 'card';
    const phaseHtml = ['l1', 'l2', 'l3'].map(key => `
      <div class="phase-dot-item">
        <div class="dot-lg ${f.phases[key] ? '' : 'off'}"></div>
        <span class="phase-name">${key.toUpperCase()}</span>
      </div>
    `).join('');
    c.innerHTML = `
      <div class="power-feed-name" style="font-size:18px;margin-bottom:8px">${f.name}</div>
      <div class="power-feed-body">
        <span class="status-pill ${f.status ? 'on' : 'off'}">${f.status ? 'Подключено' : 'Нет'}</span>
        <div class="phase-dots">${phaseHtml}</div>
      </div>
    `;
    feeds.appendChild(c);
  });
  wrap.appendChild(feeds);

  const phases = document.createElement('div');
  phases.className = 'grid grid-3';
  ['l1', 'l2', 'l3'].forEach(key => {
    const p = d[key];
    const c = document.createElement('div');
    c.className = 'card phase-card';
    c.innerHTML = `
      <div class="phase-label">${key.toUpperCase()}</div>
      <div class="phase-volts">${p.u} <span style="font-size:22px;color:var(--text-muted)">V</span></div>
      <div class="phase-amps">${p.i} A · ${p.p} кВт</div>
      <span class="status-pill ${p.ok ? 'on' : 'off'}">${p.ok ? 'Норма' : 'Нет напряжения'}</span>
    `;
    phases.appendChild(c);
  });
  wrap.appendChild(phases);

  const total = document.createElement('div');
  total.style.marginTop = '14px';
  total.innerHTML = `
    <div class="card" style="flex-direction:row;align-items:center;justify-content:space-between;">
      <div style="font-size:17px;font-weight:700">Общая мощность</div>
      <div class="big-value">${d.total.toFixed(1)}<span class="unit">кВт</span></div>
    </div>
  `;
  wrap.appendChild(total);

  const breakers = document.createElement('div');
  breakers.className = 'breaker-grid';
  d.breakers.forEach((b, idx) => {
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
  acList.forEach((ac, idx) => {
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
  console.log('IR', { acId, command, setpoint });
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
      ${!a.ack
        ? `<button class="alarm-ack" data-action="ack-alarm" data-id="${a.id}">Квитировать</button>`
        : '<div style="display:flex;align-items:center;padding:0 20px;color:var(--text-muted);font-size:13px;font-weight:700">Квит.</div>'}
    `;
    list.appendChild(el);
  });
  return list;
}

function renderSettings() {
  const wrap = document.createElement('div');
  const s = state.data.settings;

  wrap.appendChild(Object.assign(document.createElement('div'), {
    className: 'settings-row',
    innerHTML: `
      <label>Звук уведомлений</label>
      <button class="ac-power ${s.sound ? '' : 'off'}" data-action="toggle-sound" style="width:80px">${s.sound ? 'ON' : 'OFF'}</button>
    `
  }));

  wrap.appendChild(Object.assign(document.createElement('div'), {
    className: 'settings-row',
    innerHTML: `
      <label>IP-адрес панели</label>
      <div style="font-size:18px;font-weight:700;color:var(--primary)">${s.ip}</div>
    `
  }));

  const grid = document.createElement('div');
  grid.className = 'grid settings-grid';
  [
    { label: 'Дата и время', icon: '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' },
    { label: 'Сеть', icon: '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/></svg>' },
    { label: 'О системе', icon: '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>' }
  ].forEach(b => {
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

  if (action === 'toggle-breaker') {
    state.data.electric.breakers[parseInt(btn.dataset.idx)].status =
      !state.data.electric.breakers[parseInt(btn.dataset.idx)].status;
    render('electric');
    return;
  }
  if (action === 'ac-on' || action === 'ac-off') {
    const ac = state.data.ac[parseInt(btn.dataset.idx)];
    sendIrCommand(ac.id, action === 'ac-on' ? 'on' : 'off', ac.set);
    btn.classList.add('sent');
    setTimeout(() => btn.classList.remove('sent'), 500);
    return;
  }
  if (action === 'ac-all-on' || action === 'ac-all-off') {
    sendIrAllCommand(action === 'ac-all-on' ? 'on' : 'off');
    btn.classList.add('sent');
    setTimeout(() => btn.classList.remove('sent'), 600);
    return;
  }
  if (action === 'ac-up' || action === 'ac-down') {
    const idx = parseInt(btn.dataset.idx);
    const ac = state.data.ac[idx];
    if (action === 'ac-up' && ac.set < 30) ac.set++;
    if (action === 'ac-down' && ac.set > 16) ac.set--;
    sendIrCommand(ac.id, 'setpoint', ac.set);
    render('climate');
    return;
  }
  if (action === 'ack-alarm') {
    const a = state.data.alarms.find(x => x.id === parseInt(btn.dataset.id));
    if (a) a.ack = true;
    render('alarms');
    updateNavBadge();
    return;
  }
  if (action === 'toggle-sound') {
    state.data.settings.sound = !state.data.settings.sound;
    render('settings');
  }
}

function updateNavBadge() {
  const active = state.data.alarms.filter(a => !a.ack && a.level !== 'info').length;
  const badge = document.getElementById('nav-alarm-badge');
  badge.textContent = active;
  badge.style.display = active > 0 ? 'flex' : 'none';
}

setInterval(() => {
  const itp = state.data.itp;
  itp.t_supply += (Math.random() - 0.5) * 0.2;
  itp.t_return += (Math.random() - 0.5) * 0.2;
  itp.power += (Math.random() - 0.5) * 0.02;
  state.data.water.flow += (Math.random() - 0.5) * 0.05;
  state.data.electric.total += (Math.random() - 0.5) * 0.3;
  ['l1', 'l2', 'l3'].forEach(key => {
    state.data.electric[key].u = Math.round(218 + Math.random() * 12);
  });
  state.data.ac.forEach(a => {
    a.intakeTemp += (Math.random() - 0.5) * 0.3;
    a.intakeTemp = Math.max(20, Math.min(29, a.intakeTemp));
    const cooling = a.intakeTemp - a.blowTemp > 5;
    const dt = cooling ? 9 + Math.random() * 3 : Math.random() * 1.2;
    a.blowTemp = a.intakeTemp - dt;
  });
  if (['dashboard', 'itp', 'water', 'electric', 'climate'].includes(state.screen)) {
    render(state.screen);
  }
}, 3000);

init();
