fetch("./scores.json")
  .then(r => r.json())
  .then(json => {
    const players = document.getElementById("players");

    json.players.forEach(player => {
      const val = document.createElement("div");
      val.innerHTML = `
      <div class= "player" id= "${player.name}" onclick="go('${player.minecraft}')">
        <img src="https://mc-heads.net/head/${player.minecraft}"></img> <h1><strong>${player.minecraft}</strong></h1>
      </div>`;

      players.appendChild(val);
    });
  })
  .catch(err => console.error(err));

function go(id)
{
  window.location.href = `profile/?id=${encodeURIComponent(id)}`;
}
