const VERSION_MINIGAMES = {
  2: ["battle", "dont_fall", "heist", "hunt", "lavarun", "extraction", "pirates"],
  3: ["battle", "dont_fall", "heist", "hunt", "lavarun", "race", "spleef"]
};

function setupCanvas(canvasId, player, json, minigameKeys = null, seasonIndex = null) {
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

  const keys = minigameKeys || Object.keys(player.minigames);

  const values = keys.map(key => {
    if (seasonIndex === null) {
      return averageValid(player.minigames[key]);
    }
    return player.minigames[key][seasonIndex] || 0;
  });

  const highestValue = seasonIndex === null
    ? getHighestAverage(json)
    : Math.max(
        ...json.players.flatMap(p =>
          keys.map(key => p.minigames[key][seasonIndex] || 0)
        )
      );

  const normalized = values.map(v =>
    highestValue > 0 ? (v / highestValue) * maxRadius : 0
  );

  drawPolygon(ctx, cx, cy, maxRadius, keys.length);
  drawPlayerData(ctx, cx, cy, normalized);

  if (seasonIndex === null) {
    drawAverageData(ctx, cx, cy, json, maxRadius, highestValue, keys);
  }

  ctx.textAlign = "center";
  ctx.fillText("Battle", cx, cy - maxRadius - 10);
}

function drawAverageData(ctx, cx, cy, json, maxRadius, highestAverage, keys) {
  const averages = keys.map(key => {
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

function updateScores(json, { total, mgs }, version, seasonIndex) {
  mgs.sort((a, b) => b.score - a.score);

  document.getElementById("ptsIndic").textContent = `Points: `;
  document.getElementById("total").textContent = `Total: ${total}`;

  const player = getPlayerFromURL(json);

  setupCanvas(
    "seasonCanvas",
    player,
    json,
    VERSION_MINIGAMES[version],
    seasonIndex
  );

  mgs.forEach((mg, i) => {
    const el = document.getElementById(`minigame${i + 1}`);
    if (el) {
      el.textContent = `${mg.name}: ${mg.score}`;
    }
  });
}

function setupButtons(json, player) {
  const btn2 = document.getElementById("button2");
  const btn3 = document.getElementById("button3");

  btn2.addEventListener("change", () => {
    if (btn2.value === "default") return;

    const seasonIndex = Number(btn2.value) - 1;

    const result = changeScores(player, 2, btn2.value);
    result.mgs.splice(5, 1);

    updateScores(json, result, 2, seasonIndex);

    btn2.classList.add("selected");
    btn3.value = "default";
    btn3.classList.remove("selected");
  });

  btn3.addEventListener("change", () => {
    if (btn3.value === "default") return;

    const seasonIndex = Number(btn3.value) - 1 + 5;

    const result = changeScores(player, 3, btn3.value);
    result.mgs.splice(4, 1);

    updateScores(json, result, 3, seasonIndex);

    btn3.classList.add("selected");
    btn2.value = "default";
    btn2.classList.remove("selected");
  });
}
