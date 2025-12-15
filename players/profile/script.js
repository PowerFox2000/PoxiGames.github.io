const param = new URLSearchParams(window.location.search);
const id = param.get("id");
const player = json.players.find(p => p.minecraft === id);
const cx = canvas.width / 2;
const cy = canvas.height / 2;
const season = 0;
const count = 8;
const values = Object.values(player.minigames).map(v => v[season]);
const out = 100;

for(let i = 0; i < 2; i++)
{
  ctx.beginPath();
  
  for(let i = 0; i < count; i++)
  {
    const angle = (i / count) * 2 * Math.PI;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    ctx.moveTo(x, y);
  }
  
  ctx.strokeStyle = "white";
  ctx.lineWidth = 3;
  ctx.stroke();
}
