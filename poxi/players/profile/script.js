fetch("../data.json")
  .then(r => r.json())
  .then(json => {
    const player = getPlayerFromURL(json);
    if (!player || !json) return;
    setupCanvas("statsCanvas", player, json);
    setupButtons(json, player);
  })
  .catch(console.error);

const VERSION_MINIGAMES = {
  2: ["battle", "dont_fall", "heist", "hunt", "lavarun", "extraction", "pirates"],
  3: ["battle", "dont_fall", "heist", "hunt", "lavarun", "race", "spleef"]
};

function setupCanvas(canvasId, player, json, minigameKeys = null, seasonIndex = null) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || !player || !json) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const size = 300;
  const dpr = window.devicePixelRatio || 1;

  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = size + "px";
  canvas.style.height = size + "px";

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = 140;

  const keys = minigameKeys || Object.keys(player.minigames || {});

  const values = keys.map(key => {
    const data = player.minigames?.[key];
    if (!data) return 0;
    if (seasonIndex === null) return averageValid(data);
    return data?.[seasonIndex] || 0;
  });

  const allValues = json.players?.length ? json.players : [];

  const highestValue = (() => {
    if (!allValues.length) return 1;
    if (seasonIndex === null) return getHighestAverage(json) || 1;
    const flat = allValues.flatMap(p =>
      keys.map(k => p?.minigames?.[k]?.[seasonIndex] || 0)
    );
    return Math.max(...flat, 1);
  })();

  const normalized = values.map(v => (highestValue ? (v / highestValue) * maxRadius : 0));

  drawPolygon(ctx, cx, cy, maxRadius, keys.length);
  drawPlayerData(ctx, cx, cy, normalized);

  if (seasonIndex === null) {
    drawAverageData(ctx, cx, cy, json, maxRadius, highestValue, keys);
  }

  ctx.textAlign = "center";
  ctx.fillText(keys?.[0] || "Stats", cx, cy - maxRadius - 10);
}

function drawAverageData(ctx, cx, cy, json, maxRadius, highestAverage, keys) {
  if (!json?.players?.length) return;

  const averages = keys.map(key => {
    const allValues = json.players.flatMap(p => p?.minigames?.[key] || []);
    return averageValid(allValues);
  });

  const normalized = averages.map(v => (highestAverage ? (v / highestAverage) * maxRadius : 0));

  ctx.beginPath();

  normalized.forEach((value, i) => {
    const angle = (i / normalized.length) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(angle) * value;
    const y = cy + Math.sin(angle) * value;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.closePath();

  ctx.fillStyle = "rgba(255, 100, 0, 0.2)";
  ctx.strokeStyle = "rgba(255, 100, 0, 1)";
  ctx.lineWidth = 2;

  ctx.fill();
  ctx.stroke();
}

function updateScores(json, { total, mgs }, version, seasonIndex) {
  if (!json) return;

  mgs = Array.isArray(mgs) ? [...mgs] : [];
  mgs.sort((a, b) => (b.score || 0) - (a.score || 0));

  const pts = document.getElementById("ptsIndic");
  const totalEl = document.getElementById("total");

  if (pts) pts.textContent = "Points: ";
  if (totalEl) totalEl.textContent = `Total: ${total || 0}`;

  const player = getPlayerFromURL(json);
  if (!player) return;

  setupCanvas(
    "seasonCanvas",
    player,
    json,
    VERSION_MINIGAMES?.[version],
    seasonIndex
  );

  mgs.forEach((mg, i) => {
    const el = document.getElementById(`minigame${i + 1}`);
    if (el) el.textContent = `${mg?.name || ""}: ${mg?.score || 0}`;
  });
}

function setupButtons(json, player) {
  const btn2 = document.getElementById("button2");
  const btn3 = document.getElementById("button3");

  if (!btn2 || !btn3) return;

  btn2.addEventListener("change", () => {
    if (btn2.value === "default") return;

    const seasonIndex = Number(btn2.value) - 1;

    const result = changeScores(player, 2, btn2.value);
    if (result?.mgs?.length > 5) result.mgs.splice(5, 1);

    updateScores(json, result, 2, seasonIndex);

    btn2.classList.add("selected");
    btn3.value = "default";
    btn3.classList.remove("selected");
  });

  btn3.addEventListener("change", () => {
    if (btn3.value === "default") return;

    const seasonIndex = Number(btn3.value) - 1 + 5;

    const result = changeScores(player, 3, btn3.value);
    if (result?.mgs?.length > 4) result.mgs.splice(4, 1);

    updateScores(json, result, 3, seasonIndex);

    btn3.classList.add("selected");
    btn2.value = "default";
    btn2.classList.remove("selected");
  });
}
