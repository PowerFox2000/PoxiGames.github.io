fetch("../data.json")
  .then(r => r.json())
  .then(json => {
    const player = getPlayerFromURL(json);
    if (!player) return;

    renderPlayer(player);
    setupCanvas("statsCanvas", player, json);
    setupButtons(json, player);
  })
  .catch(console.error);

// ------------------ PLAYER ------------------

function getPlayerFromURL(json) {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  return json.players?.find(p => p.minecraft === id);
}

function renderPlayer(player) {
  const val = document.createElement("div");

  const firstSeason = player.points.findIndex(p => p !== 0);
  const firstSeasonIndicator = getFirstSeasonText(firstSeason);

  const rolesText = formatRoles(player.roles);
  const rolesIndicator = rolesText
    ? `${player.pronoun} is a ${rolesText}`
    : "";

  val.innerHTML = `
    <div class="space-y-2">
      <img src="https://mc-heads.net/head/${player.minecraft}" />
      <p class="title">${player.minecraft} ⎯⎯ Tier ${player.tier}</p>
      <p class="subTitle">${player.name} ⎯ Discord : ${player.discord} - ${player.discord_id}</p>
      <br />
      <p class="bodyText">${firstSeasonIndicator}</p>

      <div class="stats">
        <canvas id="statsCanvas"></canvas>
      </div>

      <p class="bodyText">${rolesIndicator}</p><br /><br/>

      <div class="grid grid-cols-1 sm:grid-cols-4 gap-0">
        <select class="button-left enabled bodyText" id="button2">
          <option hidden selected value="default">Poxi Games 2</option>
          <option value="2">Season 2</option>
          <option value="3">Season 3</option>
          <option value="4">Season 4</option>
          <option value="5">Season 5</option>
        </select>

        <select class="button-middle enabled bodyText" id="button3">
          <option hidden selected value="default">Poxi Games 3</option>
          <option value="1">Season 1</option>
          <option value="2">Season 2</option>
          <option value="3">Season 3</option>
        </select>

        <button class="button-middle bodyText" disabled>Poxi Games 4</button>
        <button class="button-right bodyText" disabled>Poxi Games 5</button>
      </div>

      <p class="subTitle" id="seasonTeamIndic"></p>
      <p class="subTitle" id="ptsIndic"></p>
      <p class="bodyText" id="total"></p>
      <canvas id="seasonCanvas"></canvas>
      ${Array.from({ length: 8 }, (_, i) => `<p class="bodyText" id="minigame${i+1}"></p>`).join("")}
    </div>
  `;

  document.querySelector(".infos").appendChild(val);
}

// ------------------ CANVAS ------------------

function setupCanvas(canvasId, player, json) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext("2d");

  const size = 300;
  const dpr = window.devicePixelRatio || 1;

  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = size + "px";
  canvas.style.height = size + "px";

  ctx.scale(dpr, dpr);

  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = 140;

  const values = Object.values(player.minigames).map(averageValid);
  const highestAverage = getHighestAverage(json);

  const normalized = values.map(v =>
    highestAverage > 0 ? (v / highestAverage) * maxRadius : 0
  );

  drawPolygon(ctx, cx, cy, maxRadius, normalized.length);
  drawPlayerData(ctx, cx, cy, normalized);
  drawAverageData(ctx, cx, cy, json, maxRadius, highestAverage);
}

function setupSeasonCanvas(canvasId, mgs, json, seasonIndex) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext("2d");

  const size = 300;
  const dpr = window.devicePixelRatio || 1;

  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = size + "px";
  canvas.style.height = size + "px";

  ctx.scale(dpr, dpr);

  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = 140;

  const values = mgs.map(mg => mg.score);
  const averages = getSeasonAverages(json, seasonIndex);

  const maxValue = Math.max(...values, ...averages, 1);

  const normalizedPlayer = values.map(v => (v / maxValue) * maxRadius);
  const normalizedAvg = averages.map(v => (v / maxValue) * maxRadius);

  drawPolygon(ctx, cx, cy, maxRadius, values.length);
  drawPlayerData(ctx, cx, cy, normalizedPlayer);

  drawPlayerData(ctx, cx, cy, normalizedAvg); // reuse for avg (same shape)
}

function getSeasonAverages(json, seasonIndex) {
  const keys = Object.keys(json.players[0].minigames);

  return keys.map(key => {
    const values = json.players
      .map(p => p.minigames[key][seasonIndex])
      .filter(v => v > 1);

    if (!values.length) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  });
}

// ------------------ SCORES ------------------

function changeScores(player, version, season) {
  let index = Number(season) - 1;
  if (version === 3) index += 5;

  const total = player.points[index];

  const mgs = [
    { name: "Battle", score: player.minigames.battle[index] },
    { name: "Don't fall", score: player.minigames.dont_fall[index] },
    { name: "Heist", score: player.minigames.heist[index] },
    { name: "Hunt", score: player.minigames.hunt[index] },
    { name: "LavaRun", score: player.minigames.lavarun[index] },
    { name: "Extraction", score: player.minigames.extraction[index] },
    { name: "Pirates", score: player.minigames.pirates[index] },
    { name: "Race", score: player.minigames.race[index] },
    { name: "Spleef", score: player.minigames.spleef[index] }
  ];

  return { total, mgs, seasonIndex: index };
}

function updateScores(json, { total, mgs, seasonIndex }) {
  setupSeasonCanvas("seasonCanvas", mgs, json, seasonIndex);

  const sorted = [...mgs].sort((a, b) => b.score - a.score);

  document.getElementById("ptsIndic").textContent = `Points:`;
  document.getElementById("total").textContent = `Total: ${total}`;

  sorted.forEach((mg, i) => {
    const el = document.getElementById(`minigame${i + 1}`);
    if (el) el.textContent = `${mg.name}: ${mg.score}`;
  });
}

// ------------------ BUTTONS ------------------

function setupButtons(json, player) {
  const btn2 = document.getElementById("button2");
  const btn3 = document.getElementById("button3");

  btn2.addEventListener("change", () => {
    if (btn2.value === "default") return;

    const result = changeScores(player, 2, btn2.value);
    setTeams(player, 2, btn2.value, json);
    updateScores(json, result);

    btn2.classList.add("selected");
    btn3.value = "default";
    btn3.classList.remove("selected");
  });

  btn3.addEventListener("change", () => {
    if (btn3.value === "default") return;

    const result = changeScores(player, 3, btn3.value);
    setTeams(player, 3, btn3.value, json);
    updateScores(json, result);

    btn3.classList.add("selected");
    btn2.value = "default";
    btn2.classList.remove("selected");
  });
}

function setTeams(player, version, season, json) {
  let index = Number(season) - 1;
  if (version === 3) index += 5;

  const team = player.team[index];
  const seasonData = json.seasons[index];

  if (!seasonData) return;

  const placement = seasonData.team?.[4];
  const points = seasonData.team?.[3];

  document.getElementById("seasonTeamIndic").textContent =
    `Played in ${team} Team : ${points} pts — #${placement}`;
}

// ------------------ HELPERS ------------------

function averageValid(values) {
  const valid = values.filter(v => v > 1);
  if (!valid.length) return 0;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

function getHighestAverage(json) {
  return Math.max(
    ...json.players.flatMap(p =>
      Object.values(p.minigames).map(averageValid)
    )
  );
}

function getFirstSeasonText(firstSeason) {
  if (firstSeason === -1) return "Never played";
  if (firstSeason < 5) return `Joined in Poxi Games 2 Season ${firstSeason + 1}`;
  return `Joined in Poxi Games 3 Season ${firstSeason - 4}`;
}

function formatRoles(roles) {
  if (!roles.length) return "";
  return roles.join(", ").replace(/,([^,]*)$/, " and$1");
}
