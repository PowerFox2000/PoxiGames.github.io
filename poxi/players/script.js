function pointsEver(player) {
  return player.points.reduce((sum, p) => sum + p, 0);
}

fetch("./data.json")
  .then(r => r.json())
  .then(json => {

    const players = document.getElementById("players");

    const playersSorted = json.players.sort(
      (a, b) => pointsEver(b) - pointsEver(a)
    );

    playersSorted.forEach(player => {
      const val = document.createElement("a");

      val.innerHTML = `
        <a class="btn-card" id="${player.name}" onclick="go('${player.minecraft}')">
          <img src="https://mc-heads.net/head/${player.minecraft}">
          <h1><strong>${player.minecraft}</strong></h1>eeeee
        </a>
      `;

      players.appendChild(val);
    });

  })
  .catch(err => console.error(err));

function go(id) {
  window.location.href = `profile/?id=${encodeURIComponent(id)}`;
}
