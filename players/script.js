fetch("./scores.json")
  .then(r => r.json())
  .then(json => {
    const players = document.getElementById("players");

    json.players.forEach(player => {
      const val = document.createElement("div");
      val.innerHTML = `
      <div class= "player" id= "${player.id}">
        <img src="${player.head}"></img> <h2><strong>${player.name}</strong></h2>
      </div>`;

      players.appendChild(val);
    });
  })
  .catch(err => console.error(err));
