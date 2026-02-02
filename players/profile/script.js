fetch("../data.json")
  .then(r => r.json())
  .then(json => {
    
    const val = document.createElement("div");
    val.innerHTML = `
    <div>
      <p><img src="https://mc-heads.net/head/${player.minecraft}"></img> <h1><strong>${player.minecraft} ${player.discord} ${player.tier}</strong></h1><p>
      <strong> ${player.name} ⎯ ${player.discord_id}</strong><br />
      Joined Season ... <br />
    </div>
    `;

    players.appendChild(val);

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    const player = json.players.find(p => p.minecraft === id);
    if (!player) return;

    const canvas = document.getElementById("minigames");
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

    function averageValid(values) {
      const valid = values.filter(v => v > 1);
      if (valid.length === 0) return 0;
      return valid.reduce((a, b) => a + b, 0) / valid.length;
    }

    const allAverages = json.players.flatMap(p =>
      Object.values(p.minigames).map(averageValid)
    );

    const highestAverage = Math.max(
      ...allAverages.filter(v => Number.isFinite(v))
    );

    const values = Object.values(player.minigames).map(averageValid);

    const normalizedValues = values.map(v =>
      highestAverage > 0 ? (v / highestAverage) * maxRadius : 0
    );

    ctx.clearRect(0, 0, size, size);

    ctx.beginPath();
    for (let i = 0; i < normalizedValues.length; i++) {
      const angle =
        (i / normalizedValues.length) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(angle) * maxRadius;
      const y = cy + Math.sin(angle) * maxRadius;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    for (let i = 0; i < normalizedValues.length; i++) {
      const value = normalizedValues[i];
      const angle =
        (i / normalizedValues.length) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(angle) * value;
      const y = cy + Math.sin(angle) * value;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = "rgba(255,0,0,0.25)";
    ctx.fill();
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.stroke();
  })
  .catch(console.error);
