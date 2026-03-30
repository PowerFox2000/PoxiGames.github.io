fetch("../data.json")
  .then(r => r.json())
  .then(json => {
    const player = getPlayerFromURL(json);
    if (!player) return;

    renderPlayer(player);
    setupCanvas(player, json);
    setupButtons();
  })
  .catch(console.error);


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
      <p class="bodyText">${firstSeasonIndicator}
      <br />

      <div class="stats">
        <canvas id="statsCanvas"></canvas>
      </div>
      <br />

      ${rolesIndicator}</p><br /><br/>

      <div class="grid grid-cols-1 sm:grid-cols-4 gap-0">
        <select class="button-left bodyText" id="button2">
          <option style="background: #393245" value="default" selected hidden>Poxi Games 2</option>
          <option style="background: #393245" value="2">PG2S1</option>
          <option style="background: #393245" value="3">PG2S2</option>
          <option style="background: #393245" value="4">PG2S3</option>
          <option style="background: #393245" value="5">PG2S4</option>
          <option style="background: #393245" value="6">PG2S5</option>
        </select>
        <select class="button-middle bodyText" id="button3">
          <option style="background: #393245" value="default" selected hidden>Poxi Games 3</option>
          <option style="background: #393245" value="2">PG3S1</option>
          <option style="background: #393245" value="3">PG3S2</option>
          <option style="background: #393245" value="4">PG3S3</option>
          <option style="background: #393245" value="5">PG3S4</option>
          <option style="background: #393245" value="6">PG3S5</option>
        </select>
        <button class="button-right bodyText" id="button4">Poxi Games 4</button>
      </div>
      <p class="minigame text" id="total"></p>
      <p class="minigame text" id="minigame1"></p>
      <p class="minigame text" id="minigame2"></p>
      <p class="minigame text" id="minigame3"></p>
      <p class="minigame text" id="minigame4"></p>
      <p class="minigame text" id="minigame5"></p>
      <p class="minigame text" id="minigame6"></p>
      <p class="minigame text" id="minigame7"></p>
      <p class="minigame text" id="minigame8"></p>
    </div>
  `;

  document.querySelector(".infos").appendChild(val);
}


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

  drawPolygon(ctx, cx, cy, maxRadius, normalized.length, "rgba(255,255,255,0.25)", "white");
  drawData(ctx, cx, cy, normalized, "rgba(255,0,0,0.25)", "red");

  ctx.textAlign = "center";
  ctx.fillText("Battle", cx, cy - maxRadius - 10);
}


function drawPolygon(ctx, cx, cy, radius, sides, fill, stroke) {
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.stroke();
}

function drawData(ctx, cx, cy, values, fill, stroke) {
  ctx.beginPath();
  values.forEach((value, i) => {
    const angle = (i / values.length) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(angle) * value;
    const y = cy + Math.sin(angle) * value;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.stroke();
}


function averageValid(values) {
  const valid = values.filter(v => v > 1);
  if (!valid.length) return 0;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

function getHighestAverage(json) {
  return Math.max(
    ...json.players.flatMap(p =>
      Object.values(p.minigames).map(averageValid)
    ).filter(Number.isFinite)
  );
}

function getFirstSeasonText(firstSeason) {
  if (firstSeason === -1) return "Never played";
  if (firstSeason < 5) return `Joined Poxi Games 2 season ${firstSeason + 1}`;
  return `Joined Poxi Games 3 season ${firstSeason - 4}`;
}

function formatRoles(roles) {
  if (!roles.length) return "";
  return roles.join(", ").replace(/,([^,]*)$/, " and$1");
}


function setupButtons() {
  let PGVERS = 2;

  const btn2 = document.getElementById("button2");
  const btn3 = document.getElementById("button3");
  const btn4 = document.getElementById("button4");

  const activeStyle = "rgba(255,255,255,0.05";

  function updateButtons() {
    [btn2, btn3, btn4].forEach(btn => (btn.style.background = ""));
    if (PGVERS === 2) btn2.style.background = activeStyle;
    if (PGVERS === 3) btn3.style.background = activeStyle;
  }

  btn2.addEventListener("click", () => {
    PGVERS = 2;
    updateButtons();
  });

  btn3.addEventListener("click", () => {
    PGVERS = 3;
    updateButtons();
  });

  document.getElementById("total").innerHTML = "Total Points";
  document.getElementById("minigame1").innerHTML = "Hunt";
  document.getElementById("minigame2").innerHTML = "you're kinda";
  document.getElementById("minigame3").innerHTML = "worthless";
  document.getElementById("minigame4").innerHTML = "fuck you4";
  document.getElementById("minigame5").innerHTML = "fuck you5";
  document.getElementById("minigame6").innerHTML = "fuck you6";
  document.getElementById("minigame7").innerHTML = "fuck you7";
  document.getElementById("minigame8").innerHTML = "fuck you8";

  const select1 = document.getElementById("button2");
  const select2 = document.getElementById("button3");
  const select3 = document.getElementById("button4");

  select1.addEventListener('change', () => {
    select2.value = "default";
  });
  select2.addEventListener('change', () => {
    select1.value = "default";
  });
  
  updateButtons();
}
