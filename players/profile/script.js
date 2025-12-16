fetch("../scores.json")
  .then(r => r.json())
  .then(json => {

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const player = json.players.find(p => p.minecraft === id);
    if (!player) return;

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const values = Object.values(player.minigames).map(seasons => {
      const valid = seasons.filter(v => v > 0);
      return valid.reduce((a, b) => a + b, 0) / valid.length;
    });

    const maxValue = Math.max(...values);
    const maxRadius = 140;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();

    values.forEach((value, i) => {
      const r = (value / maxValue) * maxRadius;
      const a = (i / values.length) * Math.PI * 2 - Math.PI / 2;

      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.closePath();
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();
  })
  .catch(console.error);
