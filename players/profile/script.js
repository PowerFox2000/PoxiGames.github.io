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

    const averages = json.players.map(player => {
      return Object.values(player.minigames).map(seasons => {
        const valid = seasons.filter(v => v > 1);
        return valid.reduce((a, b) => a + b, 0) / valid.length;
      });
    });
    const highestAverage = Math.max(...averages.flat());
    const values = Object.values(player.minigames).map(seasons => {
      const valid = seasons.filter(v => v > 1);
      return valid.reduce((a, b) => a + b, 0) / valid.length;
    });
    const maxRadius = 140;
    const normalizedValues = values.map(value => (value / highestAverage) * maxRadius);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.beginPath();
    for(let i = 0; i <= 8; i++)
    {
      const angle = (i / normalizedValues.length) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(angle) * maxRadius;
      const y = cy + Math.sin(angle) * maxRadius;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.fill();
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();

    normalizedValues.forEach((value, i) => {
      const angle = (i / normalizedValues.length) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(angle) * value;
      const y = cy + Math.sin(angle) * value;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.closePath();
    ctx.fillStyle = "rgba(255,0,0,0.25)";
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();

  })
  .catch(console.error);
