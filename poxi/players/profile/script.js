fetch("../data.json")
  .then(r => r.json())
  .then(json => {
    const player = getPlayerFromURL(json);
    if (!player) return;

    renderPlayer(player);
    setupCanvas("statsCanvas", player, json);
    setupButtons(json, player);
    
    updateSeasonOptions(player);
  })
  .catch(console.error);

// ------------------ PLAYER ------------------

function getPlayerFromURL(json) {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  return json.players.find(p => p.minecraft === id);
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
      <link rel="icon" type="image/x-icon" href="https://mc-heads.net/head/${player.minecraft}"/>
      <canvas id="statsCanvas"></canvas><div style="display:flex; align-items:center; gap:15px;">
        
        <img src="https://mc-heads.net/head/${player.minecraft}"/>
      
        <div style="display:flex; flex-direction:column;">
          <p class="title">${player.minecraft} ⎯⎯ Tier ${player.tier}</p>
          <p class="subTitle">${player.name}</p>
          <p class="subTitle">Discord : ${player.discord} - ${player.discord_id}</p>
        </div>
      
      </div>
      <br />
      <p class="bodyText">${firstSeasonIndicator}</p>


      <p class="bodyText">${rolesIndicator}</p><br /><br/>

      <div class="grid grid-cols-1 sm:grid-cols-4 gap-0">
        <select class="button-left enabled bodyText" id="button2">
          <option hidden selected value="default">Poxi Games 2</option>
          <option value="2">Poxi Games 2 Season 2</option>
          <option value="3">Poxi Games 2 Season 3</option>
          <option value="4">Poxi Games 2 Season 4</option>
          <option value="5">Poxi Games 2 Season 5</option>
        </select>

        <select class="button-middle enabled bodyText" id="button3">
          <option hidden selected value="default">Poxi Games 3</option>
          <option value="1">Poxi Games 3 Season 1</option>
          <option value="2">Poxi Games 3 Season 2</option>
          <option value="3">Poxi Games 3 Season 3</option>
          <option value="4" disabled>Poxi Games 3 Season 4</option>
          <option value="5" disabled>Poxi Games 3 Season 5</option>
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
  if (!canvas) return;

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

function getSeasonAverages(json, seasonIndex) {
  const minigameKeys = Object.keys(json.players[0].minigames);

  return minigameKeys.map(key => {
    const values = json.players
      .map(p => p.minigames[key][seasonIndex])
      .filter(v => v > 1); // same rule as averageValid

    if (!values.length) return 0;

    return values.reduce((a, b) => a + b, 0) / values.length;
  });
}

function setupSeasonCanvas(canvasId, mgs, json, seasonIndex, maxScore, version) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

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

  // ---------------- DATA ----------------

  const values = mgs.map(mg => mg.score);
  const averages = getSeasonAverages(json, seasonIndex);
  const versionAvg = getVersionAverages(json, version);

  // ---------------- NORMALIZATION ----------------
  
  const normalizedPlayer = values.map(v =>
    maxScore > 0 ? (v / maxScore) * maxRadius : 0
  );
  
  const normalizedAvg = averages.map(v =>
    maxScore > 0 ? (v / maxScore) * maxRadius : 0
  );
  
  const normalizedVersion = versionAvg.map(v =>
    maxScore > 0 ? (v / maxScore) * maxRadius : 0
  );
  
  // ---------------- DRAW ----------------

  drawPolygon(ctx, cx, cy, maxRadius, values.length);

  // Player (red)
  drawPlayerData(ctx, cx, cy, normalizedPlayer);

  // Season average (orange)
  ctx.beginPath();
  normalizedAvg.forEach((value, i) => {
    const angle = (i / normalizedAvg.length) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(angle) * value;
    const y = cy + Math.sin(angle) * value;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.closePath();

  ctx.fillStyle = "rgba(255, 100, 0, 0.1)";
  ctx.strokeStyle = "rgba(255, 100, 0, 0.5)";
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();

  // Version average (blue)
  ctx.beginPath();
  normalizedVersion.forEach((value, i) => {
    const angle = (i / normalizedVersion.length) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(angle) * value;
    const y = cy + Math.sin(angle) * value;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.closePath();

  ctx.fillStyle = "rgba(255, 200, 0, 0.01)";
  ctx.strokeStyle = "rgba(255, 200, 0, 0.3)";
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();
}

function getVersionAverages(json, version) {
  const keys = Object.keys(json.players[0].minigames);

  const start = version === 2 ? 0 : 5;
  const end = version === 2 ? 5 : 10;

  return keys.map(key => {
    const values = json.players.flatMap(p =>
      p.minigames[key].slice(start, end)
    ).filter(v => v > 1);

    if (!values.length) return 0;

    return values.reduce((a, b) => a + b, 0) / values.length;
  });
}

function drawPolygon(ctx, cx, cy, radius, sides) {
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();

  ctx.fillStyle = "rgba(200, 200, 200, 0.05)";
  ctx.strokeStyle = "rgba(200, 200, 200, 1)";
  ctx.lineWidth = 1;

  ctx.fill();
  ctx.stroke();
}

function drawPlayerData(ctx, cx, cy, values) {
  ctx.beginPath();
  values.forEach((value, i) => {
    const angle = (i / values.length) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(angle) * value;
    const y = cy + Math.sin(angle) * value;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.closePath();

  ctx.fillStyle = "rgba(255, 0, 0, 0.2)";
  ctx.strokeStyle = "rgba(255, 0, 0, 1)";
  ctx.lineWidth = 1;

  ctx.fill();
  ctx.stroke();
}

function drawAverageData(ctx, cx, cy, json, maxRadius, highestAverage) {
  const minigameKeys = Object.keys(json.players[0].minigames);

  const averages = minigameKeys.map(key => {
    const allValues = json.players.flatMap(p => p.minigames[key]);
    return averageValid(allValues);
  });

  const normalized = averages.map(v =>
    highestAverage > 0 ? (v / highestAverage) * maxRadius : 0
  );

  ctx.beginPath();

  normalized.forEach((value, i) => {
    const angle = (i / normalized.length) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(angle) * value;
    const y = cy + Math.sin(angle) * value;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });

  ctx.closePath();

  ctx.fillStyle = "rgba(255, 100, 0, 0.1)";
  ctx.strokeStyle = "rgba(255, 100, 0, 0.5)";
  ctx.lineWidth = 2;

  ctx.fill();
  ctx.stroke();
}


// ------------------ SCORES ------------------

function changeScores(player, version, season) {
  let seasonIndex = Number(season) - 1;
  if (version === 3) seasonIndex += 5;

  const total = player.points[seasonIndex];

  const mgs = [
    { name: "Battle", score: player.minigames.battle[seasonIndex] },
    { name: "Don't fall", score: player.minigames.dont_fall[seasonIndex] },
    { name: "Heist", score: player.minigames.heist[seasonIndex] },
    { name: "Hunt", score: player.minigames.hunt[seasonIndex] },
    { name: "LavaRun", score: player.minigames.lavarun[seasonIndex] },
    { name: "Extraction", score: player.minigames.extraction[seasonIndex] },
    { name: "Pirates", score: player.minigames.pirates[seasonIndex] },
    { name: "Race", score: player.minigames.race[seasonIndex] },
    { name: "Spleef", score: player.minigames.spleef[seasonIndex] }
  ];

  return { total, mgs, seasonIndex, version };
}

function updateScores(json, { total, mgs, seasonIndex, version }) {
  const highestAverage = getHighestAverage(json);

  const maxScore = getGlobalMaxScore(json);
  
  setupSeasonCanvas(
    "seasonCanvas",
    mgs,
    json,
    seasonIndex,
    maxScore,
    version
  );
  
  const sorted = [...mgs].sort((a, b) => b.score - a.score);

  document.getElementById("ptsIndic").textContent = `Points: `;
  document.getElementById("total").textContent = `Total: ${total}`;

  sorted.forEach((mg, i) => {
    const el = document.getElementById(`minigame${i + 1}`);
    if (el) {
      el.textContent = `${mg.name}: ${mg.score}`;
    }
  });
}


// ------------------ BUTTONS ------------------

function setupButtons(json, player) {
  const btn2 = document.getElementById("button2");
  const btn3 = document.getElementById("button3");

  btn2.addEventListener("change", () => {
    if (btn2.value === "default") return;

    const result = changeScores(player, 2, btn2.value);
    result.mgs.splice(5, 1);
    setTeams(player, 2, btn2.value);
    updateScores(json, result);

    btn2.classList.add("selected");
    btn3.value = "default";
    btn3.classList.remove("selected");
  });

  btn3.addEventListener("change", () => {
    if (btn3.value === "default") return;

    const result = changeScores(player, 3, btn3.value);
    result.mgs.splice(4, 1);
    setTeams(player, 3, btn3.value);
    updateScores(json, result);

    btn3.classList.add("selected");
    btn2.value = "default";
    btn2.classList.remove("selected");
  });
}

function setTeams(player, version, season) {
  fetch("../teams.json")
    .then(r => r.json())
    .then(json => {
      season = Number(season);
      if (version == 3) season += 5;

      const seasonData = json.seasons[season - 1];
      if (!seasonData) return;

      for (const [teamName, teamData] of Object.entries(seasonData)) {
        const players = teamData.slice(0, -2);

        if (players.includes(player.minecraft)) {
          const placement = teamData[teamData.length - 2];
          const points = teamData[teamData.length - 1];

          document.getElementById("seasonTeamIndic").textContent =
            `Played in ${teamName} Team : ${points} -- #${placement}`;
          return;
        }
      }
    })
    .catch(console.error);
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
function playedInSeason(teamsJson, playerId, seasonIndex) {
  const season = teamsJson.seasons[seasonIndex];
  if (!season) return false;

  return Object.values(season).some(team =>
    team.slice(0, -2).includes(playerId)
  );
}

function updateSeasonOptions(player) {
  fetch("../teams.json")
    .then(r => r.json())
    .then(json => {

      const btn2 = document.getElementById("button2");
      const btn3 = document.getElementById("button3");

      if (!btn2 || !btn3) return;

      // Poxi Games 2
      [...btn2.options].forEach(opt => {
        if (opt.value === "default") return;

        const seasonIndex = Number(opt.value) - 1;
        const allowed = playedInSeason(json, player.minecraft, seasonIndex);

        opt.disabled = !allowed;
      });

      // Poxi Games 3
      [...btn3.options].forEach(opt => {
        if (opt.value === "default") return;

        const seasonIndex = Number(opt.value) - 1 + 5;
        const allowed = playedInSeason(json, player.minecraft, seasonIndex);

        opt.disabled = !allowed;
      });

    })
    .catch(console.error);
}

function getGlobalMaxScore(json) {
  return Math.max(
    ...json.players.flatMap(p =>
      Object.values(p.minigames).flat()
    )
  );
}
