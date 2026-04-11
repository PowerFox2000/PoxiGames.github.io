function pointsEver(player) {
  return (player.points || []).reduce((sum, p) => sum + p, 0);
}

fetch("./data.json")
  .then(r => r.json())
  .then(json => {

    const players = document.getElementById("players");

    const playersSorted = [...json.players].sort(
      (a, b) => pointsEver(b) - pointsEver(a)
    );

    playersSorted.forEach(player => {

      const card = document.createElement("a");
      card.className = "btn-card";
      card.id = player.name;
      card.href = `profile/?id=${encodeURIComponent(player.minecraft)}`;

      card.innerHTML = `
        <img src="https://mc-heads.net/head/${player.minecraft}">
        <h1><strong>${player.minecraft}</strong></h1>
      `;

      players.appendChild(card);

    });

  })
  .catch(err => console.error(err));function pointsEver(player) {
  return player.points.reduce((sum, p) => sum + p, 0);
}
