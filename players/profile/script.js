fetch("../scores.json")
  .then(r => r.json())
  .then(json => {
    const param = new URLSearchParams(window.location.search);
    const id = param.get("id");
    const player = json.players.find(p => p.minecraft === id);

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    let season = 0;
    const count = 8;
    const values = Object.values(player.minigames).map(v => v[season]);
    const maxValue = Math.max(...values);
    const out = 100;

    ctx.beginPath();
    for(let i = 0; i < count; i++){
      const radius = values[i] / maxValue * out;
      const angle = (i / count) * 2 * Math.PI - Math.PI/2;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;

      if(i === 0) ctx.moveTo(x,y);
      else ctx.lineTo(x,y);
    }
    ctx.closePath();
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    ctx.stroke();
  })
  .catch(err => console.error(err));
