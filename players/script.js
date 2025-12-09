fetch("./scores.json")
  .then(r => r.json())
  .then(json => {
    const players = document.getElementById("players");

    json.players.forEach(player => {
      const val = document.createElement("tr");
      val.innerHTML = `<div>${player.name}</div>`;

      players.appendChild(val);
    });
  })
  .catch(err => console.error(err));
