fetch("../data.json")
  .then(r => r.json())
  .then(json => {
    const player = getPlayerFromURL(json);
    if (!player) return;

    renderPlayer(player);
    setupCanvas(player, json);
    setupButtons(player);
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
      <img src="https://mc-heads.net/head/${player.minecraft}" />
      <p class="title">${player.minecraft} ⎯⎯ Tier ${player.tier}</p>
      <p class="subTitle">${player.name} ⎯ Discord : ${player.discord} - ${player.discord_id}</p>
      <br />
      <p class="bodyText">${firstSeasonIndicator}</p>
      <br />

      <div class="stats">
        <canvas id="statsCanvas"></canvas>
      </div>
      <br />

      <p class="bodyText">${rolesIndicator}</p><br /><br/>

      <div class="grid grid-cols-1 sm:grid-cols-6 gap-0">
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
          <option value="3" disabled>Poxi Games 3 Season 3</option>
          <option value="4" disabled>Poxi Games 3 Season 4</option>
          <option value="5" disabled>Poxi Games 3 Season 5</option>
        </select>

        <button class="button-middle bodyText" disabled>Poxi Games 4</button>
        <button class="button-right bodyText" disabled>Poxi Games 5</button>
      </div>

      <p id="total"></p>
      ${Array.from({ length: 8 }, (_, i) => `<p id="minigame${i+1}"></p>`).join("")}
    </div>
  `;

  document.querySelector(".infos").appendChild(val);
}


// ------------------ CANVAS ------------------

function setupCanvas(player, json) {
  const canvas = document.getElementById("statsCanvas");
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

  ctx.textAlign = "center";
  ctx.fillText("Battle", cx, cy - maxRadius - 10);
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
  
  ctx.fillStyle = "rgba(0, 0, 0, 0)";
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

  ctx.fillStyle = "rgba(255, 100, 0, 0.2)";
  ctx.strokeStyle = "rgba(255, 100, 0, 1)";
  ctx.lineWidth = 2;

  ctx.fill();
  ctx.stroke();
}


// ------------------ SCORES ------------------

function changeScores(player, version, season) {
  season = Number(season) - 1;
  if (version === 3) season += 5;

  const total = player.points[season];

  const mgs = [
    { name: "Battle", score: player.minigames.battle[season] },
    { name: "Don't fall", score: player.minigames.dont_fall[season] },
    { name: "Heist", score: player.minigames.heist[season] },
    { name: "Hunt", score: player.minigames.hunt[season] },
    { name: "LavaRun", score: player.minigames.lavarun[season] },
    { name: "Extraction", score: player.minigames.extraction[season] },
    { name: "Pirates", score: player.minigames.pirates[season] },
    { name: "Race", score: player.minigames.race[season] },
    { name: "Spleef", score: player.minigames.spleef[season] }
  ];

  return { total, mgs };
}

function updateScores({ total, mgs }) {
  mgs.sort((a, b) => b.score - a.score);

  document.getElementById("total").textContent = `Total: ${total}`;

  mgs.forEach((mg, i) => {
    const el = document.getElementById(`minigame${i + 1}`);
    if (el) {
      el.textContent = `${mg.name}: ${mg.score}`;
    }
  });
}


// ------------------ BUTTONS ------------------

function setupButtons(player) {
  const btn2 = document.getElementById("button2");
  const btn3 = document.getElementById("button3");

  btn2.addEventListener("change", () => {
    if (btn2.value === "default") return;

    const result = changeScores(player, 2, btn2.value);
    result.mgs.splice(4, 1);
    updateScores(result);

    btn3.value = "default"; // reset other select
  });

  btn3.addEventListener("change", () => {
    if (btn3.value === "default") return;

    const result = changeScores(player, 3, btn3.value);
    result.mgs.splice(4, 1);
    updateScores(result);

    btn2.value = "default"; // reset other select
  });
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
