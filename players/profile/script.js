const param = new URLSearchParams(window.location.search);
const id = param.get("id");
const player = json.players.find(p => p.minecraft === id);
const cx = canvas.width / 2;
const cy = canvas.height / 2;
const season = 0;
const count = 8;
const values = Object.values(player.minigames).map(v => v[season]);
const maxValue = 500;
const out = 100;
const radius = values[i] / maxValue * out;

for(let l = 0; l < 2; l++)
{
  ctx.beginPath();
  ctx.moveTo(x, y);
  for(let i = 0; i < count; i++)
  {
    const angle = (i / count) * 2 * Math.PI;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    ctx.lineTo(x, y);
  }
  
  ctx.strokeStyle = "white";
  ctx.lineWidth = 3;
  ctx.stroke();
}
