/* Poffies live layer (demo)
   One shared channel carries every event: orders, game requests, game handed over, game back on shelf.
   Every screen (guest menus and the staff screen) replays the channel's history and listens for new events,
   so they all agree on which games are free. Staff can also get phone alerts through the free ntfy app.
   Channel: ntfy.sh (no account). History is kept for 12 hours, enough for one trading day of a demo. */
(function () {
  const HOST = 'https://ntfy.sh';
  const EVENTS = 'poffies-demo-k7q2xw9m-ev';     // machine events (JSON)
  const ALERTS = 'poffies-demo-k7q2xw9m-staff';  // human alerts for the staff phone app

  /* Demo board games. Replace with the real shelf once photographed. */
  const GAMES = [
    { id: 'jenga', n: 'Jenga', p: '1+ players', m: '15 min', c: '#d9a066', icon: 'tower' },
    { id: 'uno', n: 'UNO', p: '2 to 10 players', m: '20 min', c: '#d6455d', icon: 'cards' },
    { id: 'dobble', n: 'Dobble', p: '2 to 8 players', m: '10 min', c: '#e9a23b', icon: 'circle' },
    { id: 'connect4', n: 'Connect 4', p: '2 players', m: '10 min', c: '#3a6fc4', icon: 'grid' },
    { id: 'scrabble', n: 'Scrabble', p: '2 to 4 players', m: '60 min', c: '#2f7d5b', icon: 'tiles' },
    { id: 'monopolydeal', n: 'Monopoly Deal', p: '2 to 5 players', m: '15 min', c: '#c43b3b', icon: 'cards' },
    { id: 'kittens', n: 'Exploding Kittens', p: '2 to 5 players', m: '15 min', c: '#e5603b', icon: 'cards' },
    { id: 'tickettoride', n: 'Ticket to Ride', p: '2 to 5 players', m: '45 min', c: '#4d7aa8', icon: 'route' },
    { id: 'catan', n: 'Catan', p: '3 to 4 players', m: '60 min', c: '#c9822e', icon: 'hex' },
    { id: 'codenames', n: 'Codenames', p: '2 to 8 players', m: '15 min', c: '#4a4f9c', icon: 'tiles' },
    { id: 'dixit', n: 'Dixit', p: '3 to 6 players', m: '30 min', c: '#8e5aa8', icon: 'cards' },
    { id: 'azul', n: 'Azul', p: '2 to 4 players', m: '40 min', c: '#2a8fa3', icon: 'tiles' },
    { id: 'carcassonne', n: 'Carcassonne', p: '2 to 5 players', m: '35 min', c: '#6f8f3a', icon: 'hex' },
    { id: 'splendor', n: 'Splendor', p: '2 to 4 players', m: '30 min', c: '#7b4fa0', icon: 'gem' },
    { id: 'sushigo', n: 'Sushi Go', p: '2 to 5 players', m: '15 min', c: '#e07a8c', icon: 'cards' },
    { id: 'guesswho', n: 'Guess Who', p: '2 players', m: '20 min', c: '#d1503f', icon: 'face' },
    { id: 'chess', n: 'Chess', p: '2 players', m: '30 min', c: '#3d3340', icon: 'pawn' },
    { id: 'backgammon', n: 'Backgammon', p: '2 players', m: '30 min', c: '#8a4b2e', icon: 'dice' },
    { id: 'taboo', n: 'Taboo', p: '4+ players', m: '30 min', c: '#2e8c6a', icon: 'word' },
    { id: 'pictionary', n: 'Pictionary', p: '3+ players', m: '30 min', c: '#d4664a', icon: 'pencil' }
  ];
  const ICONS = {
    tower: '<rect x="18" y="40" width="28" height="6" rx="1.5"/><rect x="18" y="32" width="28" height="6" rx="1.5"/><rect x="18" y="24" width="28" height="6" rx="1.5"/><rect x="22" y="16" width="20" height="6" rx="1.5"/>',
    cards: '<rect x="14" y="16" width="22" height="32" rx="4" transform="rotate(-12 25 32)"/><rect x="28" y="16" width="22" height="32" rx="4" transform="rotate(10 39 32)"/>',
    circle: '<circle cx="32" cy="32" r="18"/><circle cx="26" cy="27" r="3" fill="#fff"/><circle cx="38" cy="30" r="3" fill="#fff"/><circle cx="30" cy="39" r="3" fill="#fff"/>',
    grid: '<rect x="14" y="16" width="36" height="32" rx="4"/><g fill="#fff"><circle cx="23" cy="25" r="3.5"/><circle cx="32" cy="25" r="3.5"/><circle cx="41" cy="25" r="3.5"/><circle cx="23" cy="34" r="3.5"/><circle cx="32" cy="34" r="3.5"/><circle cx="41" cy="34" r="3.5"/></g>',
    tiles: '<rect x="14" y="14" width="16" height="16" rx="3"/><rect x="34" y="14" width="16" height="16" rx="3"/><rect x="14" y="34" width="16" height="16" rx="3"/><rect x="34" y="34" width="16" height="16" rx="3"/>',
    route: '<path d="M14 44c8-16 14 2 20-10s12-8 16-18" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-dasharray="6 5"/><circle cx="14" cy="44" r="4"/><circle cx="50" cy="16" r="4"/>',
    hex: '<path d="M32 12l17 10v20L32 52 15 42V22z"/>',
    gem: '<path d="M20 22h24l6 8-18 22-18-22z"/>',
    face: '<circle cx="32" cy="30" r="14"/><rect x="18" y="42" width="28" height="10" rx="5"/>',
    pawn: '<circle cx="32" cy="20" r="7"/><path d="M26 30h12l3 16H23z"/><rect x="19" y="46" width="26" height="6" rx="2"/>',
    dice: '<rect x="14" y="14" width="36" height="36" rx="8"/><g fill="#fff"><circle cx="24" cy="24" r="3.5"/><circle cx="40" cy="40" r="3.5"/><circle cx="32" cy="32" r="3.5"/></g>',
    word: '<rect x="12" y="22" width="40" height="20" rx="5"/><g fill="#fff"><rect x="18" y="29" width="8" height="6" rx="1"/><rect x="28" y="29" width="8" height="6" rx="1"/><rect x="38" y="29" width="8" height="6" rx="1"/></g>',
    pencil: '<path d="M18 46l4-12 22-22 8 8-22 22z"/><path d="M18 46l12-4" stroke="#fff" stroke-width="2"/>'
  };
  const art = g => `<svg viewBox="0 0 64 64" aria-hidden="true" style="color:#fff"><g fill="#fff">${ICONS[g.icon] || ICONS.dice}</g></svg>`;

  /* ---------- State from events ---------- */
  function fresh() {
    const games = {};
    GAMES.forEach(g => games[g.id] = { status: 'shelf', table: null, since: 0 });
    return { games, orders: [], served: {}, lastId: null };
  }
  let state = fresh();
  const listeners = new Set();

  function apply(e, ts) {
    const G = state.games;
    switch (e.t) {
      case 'reset': state = fresh(); return;
      case 'order': state.orders.push(Object.assign({ ts }, e)); return;
      case 'served': state.served[e.id] = ts; return;
      case 'game_req': {
        const g = G[e.game]; if (!g || g.status !== 'shelf') return;           // first request wins
        if (Object.values(G).some(x => x.table === e.table)) return;             // one game per table
        Object.assign(g, { status: 'requested', table: e.table, since: ts, by: e.by }); return;
      }
      case 'game_given': { const g = G[e.game]; if (g && g.status === 'requested') Object.assign(g, { status: 'table', since: ts }); return; }
      case 'game_back': { const g = G[e.game]; if (g) Object.assign(g, { status: 'shelf', table: null, since: ts, by: null }); return; }
    }
  }
  function ingest(line) {
    let m; try { m = JSON.parse(line); } catch { return false; }
    if (m.event && m.event !== 'message') return false;
    let e; try { e = JSON.parse(m.message); } catch { return false; }
    apply(e, (m.time || Date.now() / 1000) * 1000);
    state.lastId = m.id || state.lastId;
    return true;
  }
  const emit = () => listeners.forEach(fn => { try { fn(state); } catch (err) { console.error(err); } });

  /* ---------- Connect: replay history, then stay live ---------- */
  let es = null, connected = false;
  let skew = 0; // this device's clock minus the server's, so 'x min ago' is right even on a wrong clock
  async function connect() {
    try {
      const txt = await fetch(`${HOST}/${EVENTS}/json?poll=1&since=12h`, { cache: 'no-store' }).then(r => r.text());
      state = fresh();
      txt.split('\n').filter(Boolean).forEach(ingest);
      connected = true; emit();
    } catch (err) { connected = false; emit(); }
    listen();
  }
  function listen() {
    if (es) es.close();
    const since = state.lastId ? `?since=${state.lastId}` : '';
    es = new EventSource(`${HOST}/${EVENTS}/sse${since}`);
    es.onmessage = ev => { if (ingest(ev.data)) emit(); };
    const sync = ev => { try { const m = JSON.parse(ev.data); if (m.time) { skew = Date.now() - m.time * 1000; emit(); } } catch (e) {} };
    es.addEventListener('open', sync); es.addEventListener('keepalive', sync);
    es.onopen = () => { connected = true; emit(); };
    es.onerror = () => { connected = false; emit(); };
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) connect(); });

  /* ---------- Publish ---------- */
  async function send(event, alert) {
    const post = body => fetch(HOST + '/', { method: 'POST', body: JSON.stringify(body) }).then(r => { if (!r.ok) throw new Error(r.status); });
    await post({ topic: EVENTS, message: JSON.stringify(event) });
    if (alert) post(Object.assign({ topic: ALERTS }, alert)).catch(() => {});
  }

  window.PoffiesLive = {
    GAMES, art, ALERTS,
    get state() { return state; }, get connected() { return connected; },
    now: () => Date.now() - skew,
    connect, on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    gameById: id => GAMES.find(g => g.id === id),
    tableGame(table) { const id = Object.keys(state.games).find(k => state.games[k].table === table); return id ? Object.assign({ id }, state.games[id]) : null; },
    requestGame: (game, table, by) => send({ t: 'game_req', game, table, by }, { title: `Table ${table} wants a game`, message: `Bring ${GAMES.find(g => g.id === game).n} to table ${table}.`, tags: ['game_die'], priority: 4 }),
    gameGiven: (game, table) => send({ t: 'game_given', game, table }),
    gameBack: game => send({ t: 'game_back', game }),
    order: o => send(Object.assign({ t: 'order' }, o), { title: o.table ? `New order, table ${o.table}` : `New pickup order for ${o.name}`, message: o.lines.map(l => `${l.qty} x ${l.n}`).join(', ') + ` · ${o.total} AED`, tags: ['coffee'], priority: 4 }),
    served: id => send({ t: 'served', id }),
    reset: () => send({ t: 'reset' })
  };
})();
