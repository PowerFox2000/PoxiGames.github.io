const cx = canvas.width / 2;
const cy = canvas.height / 2;

const season = 0;
const values = Object.values(player.minigames).map(v => v[season]);

const angle = (i / count) * 2 * Math.PI;
const x = cx + Math.cos(angle) * radius;
const y = cy + Math.sin(angle) * radius;
