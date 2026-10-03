// ==========================================
// CONFIGURACIÓN GENERAL
// ==========================================
const API = 'https://pokeapi.co/api/v2';
const URL_API = `${API}/pokemon?limit=24&offset=0`;
let nextUrl = '';
let previousUrl = '';
 
// Estado de la aplicación
let userTeam = [];            // Máximo 6 Pokémon, sin repetir
let currentPokemonDetail = null;
let currentEvolutions = [];
 
// Torre (progreso)
const tower = { floor: 1, best: 0 };
 
// Estado de batalla
const battleState = {
    playerTeam: [],
    activeIndex: 0,
    rivalTeam: [],
    rivalIndex: 0,
    busy: false,
    over: false,
    open: false,
    session: 0
};
 
const $ = id => document.getElementById(id);
 
// ==========================================
// DATOS ESTÁTICOS
// ==========================================
const RARITY = {
    common:    { label: 'Común',       ball: 'pokeball',   dmg: 1.00, exp: 1.0 },
    uncommon:  { label: 'Poco común',  ball: 'greatball',  dmg: 1.08, exp: 1.25 },
    rare:      { label: 'Raro',        ball: 'ultraball',  dmg: 1.18, exp: 1.6 },
    legendary: { label: 'Legendario',  ball: 'masterball', dmg: 1.30, exp: 2.2 }
};
 
const APPEAR_FX = {
    common:    { colors: ['#ffffff'], count: 8, dist: 60, wait: 700 },
    uncommon:  { colors: ['#4fc3f7', '#ffffff'], count: 14, dist: 90, wait: 900 },
    rare:      { colors: ['#ffd54f', '#fff59d', '#ffffff'], count: 22, dist: 120, wait: 1100 },
    legendary: { colors: ['#ff1744', '#ffea00', '#00e676', '#2979ff', '#d500f9', '#ffffff'], count: 36, dist: 170, wait: 1500 }
};
 
const TYPE_COLORS = {
    fire: '#ef4444', water: '#2563eb', grass: '#22c55e', electric: '#facc15', psychic: '#ec4899',
    ice: '#67e8f9', dragon: '#6366f1', dark: '#374151', fairy: '#f472b6', fighting: '#dc2626',
    poison: '#a855f7', ground: '#d4a373', rock: '#78716c', bug: '#a3b81a', ghost: '#7c3aed',
    steel: '#94a3b8', normal: '#9ca3af', flying: '#8aa7ff'
};
 
const TYPE_CHART = {
    normal:   { rock: .5, steel: .5, ghost: 0 },
    fire:     { fire: .5, water: .5, grass: 2, ice: 2, bug: 2, rock: .5, dragon: .5, steel: 2 },
    water:    { fire: 2, water: .5, grass: .5, ground: 2, rock: 2, dragon: .5 },
    electric: { water: 2, electric: .5, grass: .5, ground: 0, flying: 2, dragon: .5 },
    grass:    { fire: .5, water: 2, grass: .5, poison: .5, ground: 2, flying: .5, bug: .5, rock: 2, dragon: .5, steel: .5 },
    ice:      { fire: .5, water: .5, grass: 2, ice: .5, ground: 2, flying: 2, dragon: 2, steel: .5 },
    fighting: { normal: 2, ice: 2, poison: .5, flying: .5, psychic: .5, bug: .5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: .5 },
    poison:   { grass: 2, poison: .5, ground: .5, rock: .5, ghost: .5, steel: 0, fairy: 2 },
    ground:   { fire: 2, electric: 2, grass: .5, poison: 2, flying: 0, bug: .5, rock: 2, steel: 2 },
    flying:   { electric: .5, grass: 2, fighting: 2, bug: 2, rock: .5, steel: .5 },
    psychic:  { fighting: 2, poison: 2, psychic: .5, dark: 0, steel: .5 },
    bug:      { fire: .5, grass: 2, fighting: .5, poison: .5, flying: .5, psychic: 2, ghost: .5, dark: 2, steel: .5, fairy: .5 },
    rock:     { fire: 2, ice: 2, fighting: .5, ground: .5, flying: 2, bug: 2, steel: .5 },
    ghost:    { normal: 0, psychic: 2, ghost: 2, dark: .5 },
    dragon:   { dragon: 2, steel: .5, fairy: 0 },
    dark:     { fighting: .5, psychic: 2, ghost: 2, dark: .5, fairy: .5 },
    steel:    { fire: .5, water: .5, electric: .5, ice: 2, rock: 2, steel: .5, fairy: 2 },
    fairy:    { fire: .5, fighting: 2, poison: .5, dragon: 2, dark: 2, steel: .5 }
};
 
const TYPE_MOVE = {
    normal: 'Golpe Cuerpo', fire: 'Lanzallamas', water: 'Hidrobomba', grass: 'Hoja Afilada', electric: 'Rayo',
    psychic: 'Psíquico', ice: 'Rayo Hielo', dragon: 'Garra Dragón', dark: 'Triturar', fairy: 'Brillo Mágico',
    fighting: 'A Bocajarro', poison: 'Bomba Lodo', ground: 'Terremoto', rock: 'Avalancha', bug: 'Zumbido',
    ghost: 'Bola Sombra', steel: 'Cabeza de Hierro', flying: 'Ataque Aéreo'
};
const SPECIAL_TYPES = ['fire', 'water', 'grass', 'electric', 'psychic', 'ice', 'dragon', 'dark', 'fairy', 'ghost'];
 
const BAD_MOVES = ['self-destruct', 'explosion', 'hyper-beam', 'giga-impact', 'blast-burn', 'hydro-cannon',
    'frenzy-plant', 'roar-of-time', 'rock-wrecker', 'focus-punch', 'dream-eater', 'last-resort', 'fake-out',
    'first-impression', 'sky-attack', 'solar-beam', 'razor-wind', 'skull-bash', 'misty-explosion', 'steel-beam',
    'mind-blown', 'belch', 'future-sight', 'doom-desire', 'sucker-punch', 'spit-up'];
 
const THEMES = ['meadow', 'dusk', 'night', 'cave', 'lava', 'summit'];
const BOSS_IDS = [144, 145, 146, 150, 243, 244, 245, 249, 250, 377, 378, 379, 380, 381, 382, 383, 384, 483, 484, 487, 643, 644, 646, 716, 717, 718];
 
class BattleAbort extends Error {}
 
// ==========================================
// UTILIDADES
// ==========================================
const jsonCache = {};
async function getJSON(url) {
    if (jsonCache[url]) return jsonCache[url];
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    jsonCache[url] = data;
    return data;
}
const getPokemon = id => getJSON(`${API}/pokemon/${id}`);
 
function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function shuffle(a) { return [...a].sort(() => Math.random() - 0.5); }
function cap(s) { return s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); }
 
// Sprites animados (Gen V de PokéAPI) cuando existen; si no, sprite estático
function animSprites(d) {
    return d.sprites?.versions?.['generation-v']?.['black-white']?.animated || {};
}
function spriteFront(d) {
    const s = d.sprites || {};
    return animSprites(d).front_default || s.front_default || s.other?.showdown?.front_default || s.other?.['official-artwork']?.front_default || '';
}
function spriteBack(d) {
    const s = d.sprites || {};
    return animSprites(d).back_default || s.back_default || s.other?.showdown?.back_default || spriteFront(d);
}
function preload(src) {
    return new Promise(res => {
        if (!src) return res();
        const i = new Image();
        i.onload = i.onerror = () => res();
        i.src = src;
        setTimeout(res, 1500);
    });
}
 
function getRarity(species) {
    if (species.is_legendary || species.is_mythical) return 'legendary';
    const c = species.capture_rate;
    if (c <= 45) return 'rare';
    if (c <= 120) return 'uncommon';
    return 'common';
}
 
function readBase(d) {
    const s = {};
    d.stats.forEach(x => { s[x.stat.name] = x.base_stat; });
    return { hp: s.hp, atk: s.attack, def: s.defense, spa: s['special-attack'], spd: s['special-defense'], spe: s.speed };
}
 
function typeEffect(moveType, defTypes) {
    return defTypes.reduce((m, t) => m * (TYPE_CHART[moveType]?.[t] ?? 1), 1);
}
 
// ==========================================
// ESTADÍSTICAS, NIVELES Y EXPERIENCIA
// ==========================================
const calcStat = (base, lvl) => Math.floor((base * 2 * lvl) / 100) + 5;
const calcHp = (base, lvl) => Math.floor((base * 2 * lvl) / 100) + lvl + 10;
const expNeeded = L => Math.floor(L * L * 0.9) + 40;
 
// Las estadísticas parten EXACTAMENTE de los valores base de PokéAPI (nivel 5, piso 1).
// Solo crecen con los niveles ganados y con el multiplicador de dificultad de los pisos.
// PS = stat base de PS x2 (para que los combates no terminen en un golpe).
const levelScale = L => 1 + Math.max(0, L - 5) * 0.03;
function applyStats(pk) {
    const m = (pk.mult || 1) * levelScale(pk.level), b = pk.base;
    const oldMax = pk.maxHp || 0;
    pk.maxHp = Math.floor(b.hp * 2 * m);
    pk.attack = Math.floor(b.atk * m);
    pk.defense = Math.floor(b.def * m);
    pk.spAtk = Math.floor(b.spa * m);
    pk.spDef = Math.floor(b.spd * m);
    pk.speed = Math.floor(b.spe * m);
    if (oldMax) pk.hp = Math.min(pk.maxHp, Math.max(0, pk.hp + (pk.maxHp - oldMax)));
    else pk.hp = pk.maxHp;
}
 
function addExp(pk, amt) {
    if (pk.level >= 100) return 0;
    pk.exp += amt;
    let ups = 0;
    while (pk.level < 100 && pk.exp >= expNeeded(pk.level)) {
        pk.exp -= expNeeded(pk.level);
        pk.level++;
        ups++;
        applyStats(pk);
    }
    if (pk.level >= 100) pk.exp = 0;
    return ups;
}
 
function dispName(pk) {
    const n = cap(pk.name);
    return pk.isMega ? `Mega ${n}${pk.megaSuffix ? ' ' + pk.megaSuffix : ''}` : n;
}
 
// ==========================================
// CONSTRUCCIÓN DE COMBATIENTES
// ==========================================
function parseMove(m) {
    const es = m.names?.find(n => n.language.name === 'es');
    return {
        name: es ? es.name : cap(m.name),
        type: m.type.name,
        power: m.power,
        accuracy: m.accuracy ?? 100,
        cls: m.damage_class.name
    };
}
 
async function pickMoves(data, types, sample) {
    const pool = shuffle(data.moves.map(m => m.move)).filter(m => !BAD_MOVES.includes(m.name));
    const results = await Promise.all(pool.slice(0, sample).map(m => getJSON(m.url).catch(() => null)));
    const good = results
        .filter(m => m && m.power && m.damage_class && m.damage_class.name !== 'status')
        .map(parseMove);
 
    const chosen = [];
    const stab = good.find(m => types.includes(m.type));
    if (stab) chosen.push(stab);
    for (const m of good) {
        if (chosen.length >= 4) break;
        if (!chosen.some(c => c.name === m.name)) chosen.push(m);
    }
    // Relleno según tipos
    for (const t of types) {
        const f = {
            name: TYPE_MOVE[t] || 'Placaje', type: t, power: 70, accuracy: 100,
            cls: SPECIAL_TYPES.includes(t) ? 'special' : 'physical'
        };
        if (chosen.length < 4 && !chosen.some(c => c.name === f.name)) chosen.push(f);
    }
    const generic = [
        { name: 'Placaje', type: 'normal', power: 40, accuracy: 100, cls: 'physical' },
        { name: 'Golpe Cuerpo', type: 'normal', power: 85, accuracy: 100, cls: 'physical' },
        { name: 'Derribo', type: 'normal', power: 90, accuracy: 85, cls: 'physical' },
        { name: 'Ataque Rápido', type: 'normal', power: 40, accuracy: 100, cls: 'physical' }
    ];
    for (const g of generic) {
        if (chosen.length < 4 && !chosen.some(c => c.name === g.name)) chosen.push(g);
    }
    return chosen.slice(0, 4);
}
 
async function buildFighter(id, level, mult, isPlayer) {
    const data = await getPokemon(id);
    const species = await getJSON(data.species.url);
    const types = data.types.map(t => t.type.name);
    const rarity = getRarity(species);
 
    const megas = [];
    (species.varieties || []).forEach(v => {
        const m = v.pokemon.name.match(/-mega(?:-([a-z]+))?$/);
        if (m) megas.push({ name: v.pokemon.name, url: v.pokemon.url, suffix: m[1] ? m[1].toUpperCase() : '' });
    });
 
    const moves = await pickMoves(data, types, isPlayer ? 12 : 8);
 
    const pk = {
        id: data.id,
        speciesId: species.id,
        name: data.name,
        sprite: spriteFront(data),
        back: spriteBack(data),
        types,
        base: readBase(data),
        level,
        mult,
        exp: 0,
        rarity,
        baseExp: data.base_experience || 60,
        megas: isPlayer ? megas : [],
        isMega: false,
        megaSuffix: '',
        megaUsed: false,
        original: null,
        moves,
        hp: 0, maxHp: 0
    };
    applyStats(pk);
    return pk;
}
 
// ==========================================
// INICIO
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    fetchPokemons(URL_API);
    updateTeamHeaderUI();
    updateTowerLabel();
 
    $('searchButton').addEventListener('click', searchPokemon);
    $('searchInput').addEventListener('keypress', e => { if (e.key === 'Enter') searchPokemon(); });
    $('nextBtn').addEventListener('click', () => { if (nextUrl) fetchPokemons(nextUrl); });
    $('previousBtn').addEventListener('click', () => { if (previousUrl) fetchPokemons(previousUrl); });
 
    $('startBattleBtn').addEventListener('click', startBattle);
    $('closeBattleBtn').addEventListener('click', closeBattleModal);
    $('switchCancelBtn').addEventListener('click', closeSwitchModal);
    $('megaCancelBtn').addEventListener('click', () => $('megaModal').classList.add('hidden'));
});
 
// ==========================================
// 1. LISTA DE POKÉMON Y TARJETAS
// ==========================================
async function fetchPokemons(url) {
    showLoading(true);
    try {
        const data = await getJSON(url);
        nextUrl = data.next;
        previousUrl = data.previous;
        const details = await Promise.all(data.results.map(p => getJSON(p.url)));
        $('pokemonContainer').innerHTML = '';
        details.forEach(createPokemonCard);
        updateCounter(data.count);
        refreshTeamButtons();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        showError('Error al cargar los Pokémon');
    } finally {
        showLoading(false);
    }
}
 
function createPokemonCard(pokemon) {
    const container = $('pokemonContainer');
    const card = document.createElement('div');
    card.classList.add('card');
 
    const typesHTML = pokemon.types.map(t => `<span class="tipo ${t.type.name}">${t.type.name}</span>`).join('');
 
    card.innerHTML = `
        <img class="pixel" src="${spriteFront(pokemon)}" alt="${pokemon.name}" onclick="loadPokemonDetail(${pokemon.id})">
        <div class="card-body">
            <span class="id">#${pokemon.id.toString().padStart(3, '0')}</span>
            <h3>${cap(pokemon.name)}</h3>
            <div class="tipos">${typesHTML}</div>
            <button onclick="loadPokemonDetail(${pokemon.id})">Ver información</button>
            <button class="add-team-btn" data-id="${pokemon.id}" onclick="addToTeam(${pokemon.id}, event)">➕ Añadir al Equipo</button>
        </div>
    `;
    container.appendChild(card);
}
 
// ==========================================
// 2. DETALLES Y EVOLUCIONES
// ==========================================
async function loadPokemonDetail(idOrName, fromEvo = false) {
    showLoading(true);
    try {
        const data = await getPokemon(idOrName);
        currentPokemonDetail = data;
 
        const speciesData = await getJSON(data.species.url);
        const evolutionData = await getJSON(speciesData.evolution_chain.url);
 
        currentEvolutions = [];
        await parseEvolutionChain(evolutionData.chain);
        await checkMegaFormOrVarieties(speciesData);
 
        renderDetailPanel(data, getRarity(speciesData), fromEvo);
    } catch (error) {
        showError('No se pudieron cargar los detalles.');
    } finally {
        showLoading(false);
    }
}
 
async function parseEvolutionChain(chain) {
    try {
        const sid = chain.species.url.match(/\/(\d+)\/?$/)[1];
        const data = await getPokemon(sid);
        currentEvolutions.push({ id: data.id, name: data.name, sprite: spriteFront(data) });
    } catch (e) {}
 
    if (chain.evolves_to && chain.evolves_to.length > 0) {
        for (const evo of chain.evolves_to) await parseEvolutionChain(evo);
    }
}
 
async function checkMegaFormOrVarieties(speciesData) {
    for (const varObj of speciesData.varieties) {
        if (/-mega(-[a-z]+)?$/.test(varObj.pokemon.name)) {
            try {
                const data = await getJSON(varObj.pokemon.url);
                if (!currentEvolutions.some(e => e.id === data.id)) {
                    currentEvolutions.push({ id: data.id, name: data.name.replace(/-/g, ' '), sprite: spriteFront(data) });
                }
            } catch (e) {}
        }
    }
}
 
const STAT_NAMES = {
    hp: 'PS', attack: 'ATAQUE', defense: 'DEFENSA',
    'special-attack': 'AT. ESP.', 'special-defense': 'DEF. ESP.', speed: 'VELOCIDAD'
};
 
function renderDetailPanel(pokemon, rarity, fromEvo) {
    const detailContainer = $('detailContainer');
    const typesHTML = pokemon.types.map(t => `<span class="tipo ${t.type.name}">${t.type.name}</span>`).join(' ');
 
    let statsHTML = '';
    pokemon.stats.forEach(st => {
        const percentage = Math.min(Math.round((st.base_stat / 255) * 100), 100);
        statsHTML += `
            <div class="stat">
                <div class="stat-header"><span>${STAT_NAMES[st.stat.name] || st.stat.name.toUpperCase()}</span><span>${st.base_stat}</span></div>
                <div class="progress"><span style="width:${percentage}%;"></span></div>
            </div>`;
    });
 
    let evolutionsHTML = '';
    if (currentEvolutions.length > 0) {
        evolutionsHTML = `<div class="evolution-container"><h4>Evoluciones / Mega formas</h4><div class="evolution-chain-grid">`;
        currentEvolutions.forEach(evo => {
            evolutionsHTML += `
                <div class="evo-card" onclick="loadPokemonDetail(${evo.id}, true)">
                    <img class="pixel" src="${evo.sprite}" alt="${evo.name}">
                    <span>${evo.name}</span>
                </div>`;
        });
        evolutionsHTML += `</div></div>`;
    }
 
    detailContainer.innerHTML = `
        <img class="pixel detail-sprite ${fromEvo ? 'evo-preview' : 'float'}" src="${spriteFront(pokemon)}" alt="${pokemon.name}"
             onanimationend="this.classList.remove('evo-preview'); this.classList.add('float')">
        <h2>${cap(pokemon.name)}</h2>
        <div>${typesHTML} <span class="rarity-tag r-${rarity}">${RARITY[rarity].label}</span></div>
        <button class="add-team-btn card-like-btn" data-id="${pokemon.id}" style="border:none; padding:10px; border-radius:6px; cursor:pointer; width:100%; font-weight:600; font-family:inherit;" onclick="addToTeam(${pokemon.id}, event)">➕ Añadir al Equipo</button>
        <div class="stats">${statsHTML}</div>
        ${evolutionsHTML}
    `;
    refreshTeamButtons();
}
 
// ==========================================
// 3. EQUIPO (BARRA LATERAL IZQUIERDA)
// ==========================================
async function addToTeam(id, event) {
    if (event) event.stopPropagation();
    id = Number(id);
    if (battleState.open) { alert('No puedes cambiar tu equipo durante una batalla.'); return; }
    if (userTeam.length >= 6) { alert('¡Tu equipo ya está lleno! Máximo 6 Pokémon.'); return; }
    if (userTeam.some(p => p.id === id || p.speciesId === id)) {
        alert('¡Ese Pokémon ya está en tu equipo! No se pueden repetir.');
        return;
    }
 
    showLoading(true);
    try {
        const pk = await buildFighter(id, 5, 1, true);
        if (userTeam.some(p => p.speciesId === pk.speciesId)) {
            alert('¡Ese Pokémon ya está en tu equipo! No se pueden repetir.');
            return;
        }
        userTeam.push(pk);
        updateTeamHeaderUI();
    } catch (e) {
        alert('Error al añadir al equipo.');
    } finally {
        showLoading(false);
    }
}
 
function removeFromTeam(index) {
    if (battleState.open) return;
    userTeam.splice(index, 1);
    updateTeamHeaderUI();
}
 
function updateTeamHeaderUI() {
    const slotsContainer = $('teamSlots');
    slotsContainer.innerHTML = '';
 
    for (let i = 0; i < 6; i++) {
        const pk = userTeam[i];
        const slot = document.createElement('div');
        if (pk) {
            slot.className = 'team-slot filled';
            slot.title = 'Click para quitar del equipo';
            slot.innerHTML = `
                <img class="pixel" src="${pk.sprite}" alt="${pk.name}">
                <div class="slot-info">
                    <b>${cap(pk.name)}<i class="mini-ball" style="background-image:${ballURL(RARITY[pk.rarity].ball)}"></i></b>
                    <small>Nv.${pk.level} · ${RARITY[pk.rarity].label}</small>
                    <small class="slot-stats">PS ${pk.maxHp} · ATQ ${pk.attack} · DEF ${pk.defense} · VEL ${pk.speed}</small>
                </div>
                <span class="slot-remove">✖</span>`;
            slot.onclick = () => removeFromTeam(i);
        } else {
            slot.className = 'team-slot';
            slot.innerHTML = `<div class="ball-icon"></div><span>Espacio libre</span>`;
        }
        slotsContainer.appendChild(slot);
    }
 
    $('teamCounter').innerText = `${userTeam.length}/6`;
    $('startBattleBtn').disabled = userTeam.length === 0;
    refreshTeamButtons();
}
 
function refreshTeamButtons() {
    document.querySelectorAll('.add-team-btn').forEach(btn => {
        const id = Number(btn.dataset.id);
        const inTeam = userTeam.some(p => p.id === id || p.speciesId === id);
        btn.textContent = inTeam ? '✔ En tu equipo' : '➕ Añadir al Equipo';
        btn.classList.toggle('in-team', inTeam);
    });
}
 
function updateTowerLabel() {
    $('towerLabel').innerText = `🗼 Piso ${tower.floor} · Récord: ${tower.best}`;
    $('towerBadge').innerText = `PISO ${tower.floor}`;
    $('startBattleBtn').innerText = tower.floor > 1 ? `Continuar Torre (Piso ${tower.floor})` : 'Iniciar Batalla';
}
 
function restoreTeamFull() {
    userTeam.forEach(pk => {
        if (pk.isMega && pk.original) {
            pk.base = pk.original.base;
            pk.types = pk.original.types;
            pk.sprite = pk.original.sprite;
            pk.back = pk.original.back;
            pk.isMega = false;
            pk.megaSuffix = '';
            pk.original = null;
        }
        pk.megaUsed = false;
        applyStats(pk);
        pk.hp = pk.maxHp;
    });
}
 
// ==========================================
// 4. TORRE: GENERACIÓN DE RIVALES
// ==========================================
function floorPool(f) {
    if (f <= 3) return 151;
    if (f <= 6) return 251;
    if (f <= 9) return 386;
    if (f <= 14) return 649;
    return 1025;
}
 
async function generateRivalTeam(floor) {
    const baseLevel = 2 + floor * 3;
    const mult = 1 + (floor - 1) * 0.07;
    const pool = floorPool(floor);
    const used = new Set(userTeam.map(p => p.speciesId));
    const boss = floor % 5 === 0;
    const ids = [];
 
    while (ids.length < (boss ? 5 : 6)) {
        const id = 1 + Math.floor(Math.random() * pool);
        if (!used.has(id) && !ids.includes(id)) ids.push(id);
    }
    if (boss) {
        const cands = BOSS_IDS.filter(id => !used.has(id) && !ids.includes(id));
        ids.push(cands[Math.floor(Math.random() * cands.length)]);
    }
 
    return Promise.all(ids.map((id, i) =>
        buildFighter(id, Math.min(100, baseLevel + Math.floor(i / 2) + (boss && i === 5 ? 3 : 0)), mult, false)
    ));
}
 
// ==========================================
// 5. BATALLA: UTILIDADES DE ANIMACIÓN
// ==========================================
async function bdelay(ms) {
    const s = battleState.session;
    await delay(ms);
    if (s !== battleState.session) throw new BattleAbort();
}
 
function wa(el, keyframes, options) {
    return new Promise(res => {
        if (!el.animate) { res(); return; }
        const a = el.animate(keyframes, options);
        a.onfinish = () => res();
        a.oncancel = () => res();
    });
}
 
let typeTimer = null;
function logBattle(text) {
    const box = $('battleLog');
    clearInterval(typeTimer);
    box.textContent = '';
    let i = 0;
    typeTimer = setInterval(() => {
        box.textContent = text.slice(0, ++i);
        if (i >= text.length) clearInterval(typeTimer);
    }, 16);
}
async function say(text, hold = 900) {
    logBattle(text);
    await bdelay(text.length * 16 + hold);
}
 
async function playClass(wrap, cls, ms) {
    const had = wrap.classList.contains('idle');
    wrap.classList.remove('idle');
    void wrap.offsetWidth;
    wrap.classList.add(cls);
    await bdelay(ms);
    wrap.classList.remove(cls);
    if (had) wrap.classList.add('idle');
}
 
function centerOf(elm) {
    const s = $('battleScreen').getBoundingClientRect();
    const r = elm.getBoundingClientRect();
    return { x: r.left - s.left + r.width / 2, y: r.top - s.top + r.height / 2 };
}
 
function burst(pos, colors, count, dist = 90, size = 8) {
    const layer = $('fxLayer');
    for (let i = 0; i < count; i++) {
        const d = document.createElement('div');
        d.className = 'particle';
        d.style.cssText = `left:${pos.x}px;top:${pos.y}px;width:${size}px;height:${size}px;background:${colors[i % colors.length]}`;
        layer.appendChild(d);
        const ang = (Math.PI * 2 * i) / count + Math.random() * 0.4;
        const dd = dist * (0.6 + Math.random() * 0.6);
        wa(d, [
            { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
            { transform: `translate(calc(-50% + ${Math.cos(ang) * dd}px), calc(-50% + ${Math.sin(ang) * dd}px)) scale(.4)`, opacity: 0 }
        ], { duration: 600 + Math.random() * 300, easing: 'steps(6)' }).then(() => d.remove());
    }
}
 
function screenFlash() {
    const f = $('flashLayer');
    f.classList.remove('flash'); void f.offsetWidth; f.classList.add('flash');
}
function screenShake() {
    const s = $('battleScreen');
    s.classList.remove('shake'); void s.offsetWidth; s.classList.add('shake');
}
 
// Sprites pixelados de pokebolas (12x12) generados como SVG; cambian según la rareza
const BALL_GRID = [
    '...KKKKKK...',
    '.KKhhttttKK.',
    'KhhttttttttK',
    'KhtttttttttK',
    'KtttKKKKtttK',
    'KKKKKccKKKKK',
    'KKKKKccKKKKK',
    'KwwwKKKKwwwK',
    'KwwwwwwwwwwK',
    'KwwwwwwwwssK',
    '.KKwwwwwwKK.',
    '...KKKKKK...'
];
const BALL_PAL = {
    pokeball:   { K: '#1a1a1a', t: '#e53935', h: '#ff8a80', w: '#f5f5f5', s: '#b8b8b8', c: '#ffffff', m: '#e53935' },
    greatball:  { K: '#1a1a1a', t: '#1e88e5', h: '#90caf9', w: '#f5f5f5', s: '#b8b8b8', c: '#ffffff', m: '#e53935' },
    ultraball:  { K: '#1a1a1a', t: '#37474f', h: '#90a4ae', w: '#f5f5f5', s: '#b8b8b8', c: '#ffeb3b', m: '#ffd600' },
    masterball: { K: '#1a1a1a', t: '#7b1fa2', h: '#ce93d8', w: '#ede7f6', s: '#b39ddb', c: '#f48fb1', m: '#f48fb1' }
};
const BALL_SIDES = [[3, 2], [3, 3], [4, 2], [4, 1], [3, 8], [3, 9], [4, 9], [4, 10]];
const BALL_MARKS = {
    pokeball: [],
    greatball: BALL_SIDES,
    ultraball: BALL_SIDES.concat([[1, 5], [1, 6], [2, 5], [2, 6]]),
    masterball: BALL_SIDES.concat([[1, 5], [1, 6], [2, 4], [2, 7]])
};
const ballCache = {};
function ballURL(kind) {
    if (ballCache[kind]) return ballCache[kind];
    const pal = BALL_PAL[kind] || BALL_PAL.pokeball;
    const grid = BALL_GRID.map(r => r.split(''));
    (BALL_MARKS[kind] || []).forEach(([r, c]) => { if (grid[r][c] === 't') grid[r][c] = 'm'; });
    let rects = '';
    grid.forEach((row, y) => row.forEach((ch, x) => {
        const col = pal[ch];
        if (col) rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${col}"/>`;
    }));
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" shape-rendering="crispEdges">${rects}</svg>`;
    ballCache[kind] = `url('data:image/svg+xml,${encodeURIComponent(svg)}')`;
    return ballCache[kind];
}
 
function createBall(kind) {
    const b = document.createElement('div');
    b.className = 'ball ' + kind;
    b.style.backgroundImage = ballURL(kind);
    return b;
}
 
// Salida del Pokémon desde su pokebola (según rareza)
async function sendOut(side, pk) {
    const wrap = $(side + 'SpriteWrap'), img = $(side + 'Sprite'), slot = $(side + 'BallSlot');
    const src = side === 'player' ? pk.back : pk.sprite;
    await preload(src);
    wrap.className = 'sprite-wrap hide';
    img.src = src;
    img.classList.remove('sil');
    setInfo(side, pk);
    $(side + 'Info').classList.remove('invisible');
 
    const ball = createBall(RARITY[pk.rarity].ball);
    slot.appendChild(ball);
    const from = side === 'player' ? { x: -210, y: 60 } : { x: 200, y: -200 };
    const mid = side === 'player' ? { x: -100, y: -120 } : { x: 100, y: -250 };
    await wa(ball, [
        { transform: `translate(${from.x}px,${from.y}px) rotate(0deg)` },
        { transform: `translate(${mid.x}px,${mid.y}px) rotate(360deg)`, offset: 0.5 },
        { transform: 'translate(0,0) rotate(720deg)' }
    ], { duration: 800, easing: 'steps(16)' });
    await bdelay(0);
 
    ball.classList.add('open');
    await bdelay(280);
    ball.remove();
 
    const fx = APPEAR_FX[pk.rarity];
    burst(centerOf(wrap), fx.colors, fx.count, fx.dist);
    if (pk.rarity !== 'common') screenFlash();
    if (pk.rarity === 'legendary') screenShake();
 
    wrap.className = `sprite-wrap appear-${pk.rarity}`;
    await bdelay(fx.wait);
    wrap.className = 'sprite-wrap idle' + (pk.isMega ? ' is-mega' : '');
}
 
// Retirada del Pokémon (cambio): vuelve a la pokebola
async function recall(side, pk) {
    const wrap = $(side + 'SpriteWrap'), slot = $(side + 'BallSlot');
    wrap.className = 'sprite-wrap recall';
    await bdelay(500);
    wrap.className = 'sprite-wrap hide';
    const ball = createBall(RARITY[pk.rarity].ball);
    ball.classList.add('pop');
    slot.appendChild(ball);
    await bdelay(450);
    ball.remove();
}
 
async function faintAnim(side) {
    const wrap = $(side + 'SpriteWrap');
    wrap.className = 'sprite-wrap faint';
    await bdelay(780);
    wrap.className = 'sprite-wrap hide';
}
 
async function projectile(fromEl, toEl, type) {
    const a = centerOf(fromEl), b = centerOf(toEl);
    const color = TYPE_COLORS[type] || '#fff';
    const ps = [0, 1, 2].map(i => {
        const p = document.createElement('div');
        p.className = 'proj';
        p.style.background = color;
        p.style.color = color;
        p.style.left = a.x + 'px';
        p.style.top = a.y + 'px';
        $('fxLayer').appendChild(p);
        return wa(p, [
            { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
            { transform: `translate(calc(-50% + ${b.x - a.x}px), calc(-50% + ${b.y - a.y}px)) scale(1.6)`, opacity: 1 }
        ], { duration: 420, delay: i * 70, easing: 'steps(8)', fill: 'backwards' }).then(() => p.remove());
    });
    await Promise.all(ps);
}
 
// Animación de Mega Evolución
async function megaAnim(newBack) {
    const wrap = $('playerSpriteWrap'), img = $('playerSprite'), slot = $('playerSlot');
    await preload(newBack);
    const oldSrc = img.src;
    const rays = document.createElement('div');
    rays.className = 'evo-rays';
    slot.prepend(rays);
    wrap.className = 'sprite-wrap charging';
    for (let i = 0; i < 12; i++) {
        img.src = i % 2 === 0 ? oldSrc : newBack;
        img.classList.add('sil');
        await bdelay(110);
        img.classList.remove('sil');
        await bdelay(60);
    }
    img.src = newBack;
    img.classList.remove('sil');
    screenFlash();
    screenShake();
    burst(centerOf(wrap), APPEAR_FX.legendary.colors, 40, 150, 10);
    rays.remove();
    wrap.className = 'sprite-wrap idle is-mega';
    await bdelay(500);
}
 
// ==========================================
// 6. BATALLA: UI
// ==========================================
const active = () => battleState.playerTeam[battleState.activeIndex];
const rival = () => battleState.rivalTeam[battleState.rivalIndex];
 
function setInfo(side, pk) {
    $(side + 'Name').innerText = dispName(pk);
    $(side + 'Level').innerText = 'Nv.' + pk.level;
    const pct = Math.max(0, (pk.hp / pk.maxHp) * 100);
    const bar = $(side + 'HpBar');
    bar.style.width = pct + '%';
    bar.className = pct > 50 ? 'hp-green' : pct > 20 ? 'hp-yellow' : 'hp-red';
    $(side + 'HpText').innerText = `${Math.max(0, pk.hp)}/${pk.maxHp}`;
    const rt = $(side + 'Rarity');
    rt.innerText = RARITY[pk.rarity].label;
    rt.className = 'rarity-tag r-' + pk.rarity;
    $(side + 'Types').innerHTML = pk.types.map(t => `<span class="mini-type" style="background:${TYPE_COLORS[t] || '#777'}">${t}</span>`).join('');
    if (side === 'player') {
        $('playerExpBar').style.width = (pk.level >= 100 ? 100 : (pk.exp / expNeeded(pk.level)) * 100) + '%';
    }
}
 
function updateBattleUI() {
    const p = active(), r = rival();
    if (p) setInfo('player', p);
    if (r) setInfo('rival', r);
}
 
function renderMenu(mode) {
    const m = $('battleMenu');
    m.innerHTML = '';
    const add = (cls, html, fn) => {
        const b = document.createElement('button');
        b.className = 'pix-btn ' + cls;
        b.innerHTML = html;
        b.onclick = fn;
        m.appendChild(b);
        return b;
    };
 
    if (mode === 'main') {
        const p = active();
        add('fight', '⚔ Luchar', () => renderMenu('moves'));
        if (p.megas.length && !p.isMega && !p.megaUsed) add('mega', '✦ Mega', openMegaModal);
        add('switch', '↔ Equipo', () => openSwitchModal(false));
        add('run', 'Huir', () => {
            if (confirm('¿Abandonar la batalla? Perderás el progreso del piso actual.')) closeBattleModal();
        });
    } else if (mode === 'moves') {
        const p = active();
        p.moves.forEach((mv, i) => {
            const mb = add('move-btn', `<span>${mv.name}</span><span class="mv-meta" style="background:${TYPE_COLORS[mv.type] || '#777'}">${mv.type}</span><small>POD ${mv.power} · ${mv.cls === 'special' ? 'ESP' : 'FIS'}</small>`, () => playTurn(i));
            mb.style.setProperty('--tc', TYPE_COLORS[mv.type] || '#777');
        });
        add('run', '« Volver', () => renderMenu('main'));
    } else if (mode === 'victory') {
        add('fight', `▶ Piso ${tower.floor}`, () => { renderMenu('none'); loadFloor(); });
        add('run', 'Salir', closeBattleModal);
    } else if (mode === 'defeat') {
        add('fight', '↻ Reintentar', () => { renderMenu('none'); loadFloor(); });
        add('run', 'Salir', closeBattleModal);
    }
}
 
function promptAction() {
    logBattle(`¿Qué hará ${dispName(active())}?`);
    renderMenu('main');
}
 
// ==========================================
// 7. BATALLA: FLUJO
// ==========================================
async function startBattle() {
    if (userTeam.length === 0) {
        alert('¡Debes añadir al menos 1 Pokémon a tu equipo antes de luchar!');
        return;
    }
    if (battleState.open) return;
    restoreTeamFull();
    battleState.playerTeam = userTeam;
    await loadFloor();
}
 
async function loadFloor() {
    const sid = ++battleState.session;
    battleState.busy = true;
    battleState.over = false;
    showLoading(true);
 
    let rivals;
    try {
        rivals = await generateRivalTeam(tower.floor);
    } catch (e) {
        showLoading(false);
        showError('Error al iniciar la batalla.');
        battleState.busy = false;
        return;
    }
    showLoading(false);
    if (sid !== battleState.session) return;
 
    battleState.playerTeam = userTeam;
    battleState.rivalTeam = rivals;
    battleState.rivalIndex = 0;
    battleState.activeIndex = Math.max(0, userTeam.findIndex(p => p.hp > 0));
 
    $('battleArena').dataset.theme = THEMES[(tower.floor - 1) % THEMES.length];
    ['player', 'rival'].forEach(s => {
        $(s + 'SpriteWrap').className = 'sprite-wrap hide';
        $(s + 'Info').classList.add('invisible');
    });
    updateTowerLabel();
    openBattleModal();
    renderMenu('none');
 
    try {
        await say(`🗼 Piso ${tower.floor}: ¡Un entrenador te desafía!`.replace('🗼 ', ''), 500);
        await say(`El rival envía a ${dispName(rival())}.`, 200);
        await sendOut('rival', rival());
        await say(`¡Adelante, ${dispName(active())}!`, 200);
        await sendOut('player', active());
        battleState.busy = false;
        promptAction();
    } catch (e) {
        if (!(e instanceof BattleAbort)) console.error(e);
    }
}
 
function openBattleModal() {
    battleState.open = true;
    $('battleModal').classList.remove('hidden');
}
 
function closeBattleModal() {
    battleState.session++;
    battleState.busy = false;
    battleState.open = false;
    $('switchModal').classList.add('hidden');
    $('megaModal').classList.add('hidden');
    $('battleModal').classList.add('hidden');
    restoreTeamFull();
    updateTeamHeaderUI();
    updateTowerLabel();
}
 
function calcDamage(atk, def, mv) {
    const special = mv.cls === 'special';
    const A = special ? atk.spAtk : atk.attack;
    const D = special ? def.spDef : def.defense;
    const eff = typeEffect(mv.type, def.types);
    const stab = atk.types.includes(mv.type) ? 1.5 : 1;
    const crit = Math.random() < 1 / 16;
    const rand = 0.85 + Math.random() * 0.15;
    const rar = RARITY[atk.rarity].dmg;
    let dmg = (((2 * (atk.level + 15) / 5 + 2) * mv.power * A / D) / 50 + 2) * stab * eff * rand * rar * (crit ? 1.5 : 1);
    dmg = eff === 0 ? 0 : Math.max(1, Math.floor(dmg));
    return { dmg, eff, crit };
}
 
function chooseRivalMove(r, p) {
    if (Math.random() < 0.25) return r.moves[Math.floor(Math.random() * r.moves.length)];
    const scored = r.moves.map(m => ({
        m, s: m.power * typeEffect(m.type, p.types) * (r.types.includes(m.type) ? 1.5 : 1) * (m.accuracy / 100)
    }));
    return scored.sort((a, b) => b.s - a.s)[0].m;
}
 
async function performAttack(side, atk, def, mv) {
    const other = side === 'player' ? 'rival' : 'player';
    const aWrap = $(side + 'SpriteWrap'), dWrap = $(other + 'SpriteWrap');
 
    await say(side === 'player'
        ? `¡${dispName(atk)} usó ${mv.name}!`
        : `¡${dispName(atk)} rival usó ${mv.name}!`, 300);
 
    if (Math.random() * 100 >= mv.accuracy) {
        await say('¡El ataque falló!', 700);
        return;
    }
 
    const lunge = playClass(aWrap, side === 'player' ? 'lunge-p' : 'lunge-r', 350);
    lunge.catch(() => {});
    await bdelay(200);
    if (mv.cls === 'special') await projectile(aWrap, dWrap, mv.type);
    burst(centerOf(dWrap), [TYPE_COLORS[mv.type] || '#fff', '#ffffff'], 12, 70);
    await playClass(dWrap, 'hit', 500);
    await lunge;
 
    const { dmg, eff, crit } = calcDamage(atk, def, mv);
    def.hp = Math.max(0, def.hp - dmg);
    updateBattleUI();
    await bdelay(800);
 
    if (eff === 0) await say(`No afecta a ${dispName(def)}...`, 600);
    else {
        if (crit) await say('¡Golpe crítico!', 500);
        if (eff > 1) await say('¡Es muy eficaz!', 500);
        else if (eff < 1) await say('No es muy eficaz...', 500);
    }
}
 
async function playTurn(idx) {
    if (battleState.busy || battleState.over) return;
    battleState.busy = true;
    renderMenu('none');
    try {
        const p = active(), r = rival();
        const pm = p.moves[idx], rm = chooseRivalMove(r, p);
        const pFirst = p.speed > r.speed || (p.speed === r.speed && Math.random() < 0.5);
        if (!pFirst) await say(`¡${dispName(r)} rival es más rápido!`, 300);
 
        const order = pFirst
            ? [['player', p, r, pm], ['rival', r, p, rm]]
            : [['rival', r, p, rm], ['player', p, r, pm]];
 
        for (const [side, atk, def, mv] of order) {
            await performAttack(side, atk, def, mv);
            if (def.hp <= 0) {
                if (side === 'player') await onRivalFainted();
                else await onPlayerFainted();
                return;
            }
        }
        battleState.busy = false;
        promptAction();
    } catch (e) {
        if (!(e instanceof BattleAbort)) { console.error(e); battleState.busy = false; }
    }
}
 
async function gainExp(foe) {
    const gain = Math.max(5, Math.floor(foe.baseExp * foe.level * RARITY[foe.rarity].exp * 1.5 / 7));
    const act = active();
    await say(`¡${dispName(act)} ganó ${gain} puntos de EXP!`, 500);
 
    const leveled = [];
    battleState.playerTeam.forEach(pk => {
        if (pk.hp <= 0) return;
        const ups = addExp(pk, pk === act ? gain : Math.floor(gain / 2));
        if (ups > 0) leveled.push(pk);
    });
    updateBattleUI();
    await bdelay(700);
 
    for (const pk of leveled) {
        await say(`¡${dispName(pk)} subió al nivel ${pk.level}!`, 600);
        if (pk === act) {
            burst(centerOf($('playerSpriteWrap')), ['#fde047', '#ffffff'], 16, 80);
            const box = $('playerInfo');
            box.classList.add('levelup');
            setTimeout(() => box.classList.remove('levelup'), 900);
            updateBattleUI();
        }
    }
}
 
async function onRivalFainted() {
    const r = rival();
    await faintAnim('rival');
    await say(`¡${dispName(r)} rival se debilitó!`, 600);
    await gainExp(r);
 
    battleState.rivalIndex++;
    if (battleState.rivalIndex >= battleState.rivalTeam.length) {
        await victory();
        return;
    }
    const next = rival();
    await say(`El rival envía a ${dispName(next)}.`, 200);
    await sendOut('rival', next);
    battleState.busy = false;
    promptAction();
}
 
async function onPlayerFainted() {
    const p = active();
    await faintAnim('player');
    await say(`¡${dispName(p)} se debilitó!`, 600);
    if (!battleState.playerTeam.some(x => x.hp > 0)) {
        await defeat();
        return;
    }
    await say('Elige tu siguiente Pokémon.', 200);
    openSwitchModal(true);
}
 
async function victory() {
    battleState.over = true;
    const done = tower.floor;
    tower.best = Math.max(tower.best, done);
    tower.floor++;
    await say(`🏆 ¡Piso ${done} superado!`.replace('🏆 ', ''), 800);
 
    restoreTeamFull();
    const wrap = $('playerSpriteWrap'), img = $('playerSprite');
    const pk = active();
    await preload(pk.back);
    img.src = pk.back;
    wrap.className = 'sprite-wrap idle';
    screenFlash();
    burst(centerOf(wrap), ['#22c55e', '#bbf7d0', '#ffffff'], 20, 90);
    updateBattleUI();
    updateTowerLabel();
    updateTeamHeaderUI();
    await say('¡Tu equipo recuperó toda su vida y las Mega Evoluciones se revirtieron!', 600);
    logBattle(`Piso ${tower.floor} te espera. Los rivales serán más fuertes.`);
    battleState.busy = false;
    renderMenu('victory');
}
 
async function defeat() {
    battleState.over = true;
    await say('¡Todo tu equipo ha caído en combate!', 800);
    tower.floor = 1;
    restoreTeamFull();
    updateTowerLabel();
    updateTeamHeaderUI();
    battleState.busy = false;
    logBattle(`Tu récord es el piso ${tower.best}. Conservas tus niveles. ¡Vuelve a intentarlo desde el piso 1!`);
    renderMenu('defeat');
}
 
// ==========================================
// 8. CAMBIO DE POKÉMON
// ==========================================
function openSwitchModal(forced = false) {
    if (!forced && battleState.busy) return;
    const grid = $('teamSwitchGrid');
    grid.innerHTML = '';
    $('switchTitle').innerText = forced ? 'Elige tu siguiente Pokémon' : 'Cambiar Pokémon';
    $('switchCancelBtn').style.display = forced ? 'none' : 'block';
 
    battleState.playerTeam.forEach((pk, idx) => {
        const isAlive = pk.hp > 0;
        const isCurrent = idx === battleState.activeIndex && !forced;
        const slot = document.createElement('div');
        slot.className = 'switch-slot';
        slot.style.opacity = (isAlive && !isCurrent) ? '1' : '0.45';
        slot.innerHTML = `
            <img class="pixel" src="${pk.sprite}" alt="${pk.name}">
            <div><span>${cap(pk.name)}</span><small>Nv.${pk.level} · PS ${pk.hp}/${pk.maxHp}</small></div>`;
        if (isAlive && !isCurrent) slot.onclick = () => doSwitch(idx, forced);
        grid.appendChild(slot);
    });
    $('switchModal').classList.remove('hidden');
}
window.openSwitchModal = openSwitchModal;
 
function closeSwitchModal() { $('switchModal').classList.add('hidden'); }
window.closeSwitchModal = closeSwitchModal;
 
async function doSwitch(idx, forced) {
    closeSwitchModal();
    battleState.busy = true;
    renderMenu('none');
    try {
        if (!forced) {
            const old = active();
            await say(`¡Regresa, ${dispName(old)}!`, 200);
            await recall('player', old);
        }
        battleState.activeIndex = idx;
        const pk = active();
        await say(`¡Adelante, ${dispName(pk)}!`, 200);
        await sendOut('player', pk);
 
        if (!forced) {
            const r = rival();
            await performAttack('rival', r, pk, chooseRivalMove(r, pk));
            if (pk.hp <= 0) { await onPlayerFainted(); return; }
        }
        battleState.busy = false;
        promptAction();
    } catch (e) {
        if (!(e instanceof BattleAbort)) { console.error(e); battleState.busy = false; }
    }
}
 
// ==========================================
// 9. MEGA EVOLUCIÓN CON ELECCIÓN
// ==========================================
async function openMegaModal() {
    if (battleState.busy) return;
    const pk = active();
    const grid = $('megaChoiceGrid');
    grid.innerHTML = '<p style="grid-column:1/-1">Cargando formas...</p>';
    $('megaModal').classList.remove('hidden');
 
    try {
        const datas = await Promise.all(pk.megas.map(m => getJSON(m.url)));
        grid.innerHTML = '';
        pk.megas.forEach((m, i) => {
            const bst = datas[i].stats.reduce((s, x) => s + x.base_stat, 0);
            const slot = document.createElement('div');
            slot.className = 'switch-slot';
            slot.innerHTML = `
                <img class="pixel" src="${spriteFront(datas[i])}" alt="${m.name}">
                <div><span>Mega ${cap(pk.name)}${m.suffix ? ' ' + m.suffix : ''}</span><small>${datas[i].types.map(t => t.type.name).join('/')} · Total ${bst}</small></div>`;
            slot.onclick = () => doMega(m, datas[i]);
            grid.appendChild(slot);
        });
    } catch (e) {
        $('megaModal').classList.add('hidden');
        showError('No se pudieron cargar las mega evoluciones.');
    }
}
 
async function doMega(info, data) {
    $('megaModal').classList.add('hidden');
    battleState.busy = true;
    renderMenu('none');
    try {
        const pk = active();
        await say(`¡La energía de ${dispName(pk)} responde a la Mega Piedra!`, 300);
        const newBack = spriteBack(data);
        pk.original = { base: pk.base, types: pk.types, sprite: pk.sprite, back: pk.back };
        await megaAnim(newBack);
 
        pk.base = readBase(data);
        pk.types = data.types.map(t => t.type.name);
        pk.sprite = spriteFront(data);
        pk.back = newBack;
        pk.isMega = true;
        pk.megaSuffix = info.suffix;
        pk.megaUsed = true;
        applyStats(pk);
        updateBattleUI();
 
        await say(`¡${dispName(pk)} mega-evolucionó! Sus estadísticas aumentaron.`, 800);
        battleState.busy = false;
        promptAction(); // no consume turno
    } catch (e) {
        if (!(e instanceof BattleAbort)) { console.error(e); battleState.busy = false; }
    }
}
 
// ==========================================
// 10. BUSCADOR Y UTILIDADES GENERALES
// ==========================================
async function searchPokemon() {
    const query = $('searchInput').value.trim().toLowerCase();
    if (!query) { fetchPokemons(URL_API); return; }
 
    showLoading(true);
    try {
        const data = await getPokemon(query);
        $('pokemonContainer').innerHTML = '';
        createPokemonCard(data);
        updateCounter(1);
        refreshTeamButtons();
        loadPokemonDetail(data.id);
    } catch (e) {
        showError('Pokémon no encontrado.');
    } finally {
        showLoading(false);
    }
}
 
function updateCounter(count) { $('pokemonCounter').innerText = `${count} Pokémon`; }
 
function showLoading(show) {
    const loader = $('loading');
    if (show) loader.classList.remove('hidden');
    else loader.classList.add('hidden');
}
 
function showError(msg) {
    const err = $('errorMessage');
    err.innerText = msg;
    err.classList.remove('hidden');
    setTimeout(() => err.classList.add('hidden'), 3000);
}