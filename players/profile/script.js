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

for(let l = 0; l < 2; l++)
{
  ctx.beginPath();
  for(let i = 0; i < count; i++)
  {
    
    const radius = values[i] / maxValue * out;
    const angle = (i / count) * 2 * Math.PI;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    if(i = 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  
  ctx.strokeStyle = "white";
  ctx.lineWidth = 3;
  ctx.stroke();
}
