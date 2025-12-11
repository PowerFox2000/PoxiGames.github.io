fetch("./scores.json")
  .then(r => r.json())
  .then(json => {
    const players = document.getElementById("players");

    json.players.forEach(player => {
      const val = document.createElement("div");
      val.innerHTML = `
      <div class= "player" id= "${player.minecraft}">
        <img src="${player.head}"></img> <h1><strong>${player.name}</strong></h1>
      </div>`;

      players.appendChild(val);
    });
  })
  .catch(err => console.error(err));
