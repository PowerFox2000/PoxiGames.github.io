                      void pointsEver(const player) {
  let pts = 0;
  player.points.forEach(p => {
    pts += p;
  });
  return pts;
}

fetch("./data.json")
  .then(r => r.json())
  .then(json => {
    const players = document.getElementById("players");

    const playersSorted = json.players.sort((a, b) => pointsEver(a) - pointsEver(b));

    playersSorted.forEach(player => {
      const val = document.createElement("div");
      val.innerHTML = `
      <div class= "player" id= "${player.name}" onclick="go('${player.minecraft}')" style="fontsize: 2.5rem">
        <img src="https://mc-heads.net/head/${player.minecraft}"></img> <h1><strong>${player.minecraft}</strong></h1>
      </div>`;,

      players.appendChild(val);
    });
  })
  .catch(err => console.error(err));

function go(id)
{
  window.location.href = `profile/?id=${encodeURIComponent(id)}`;
}
