fetch("./scores.json")
  .then(r => r.json())
  .then(json => {
    const tableBody = document.getElementById("table-body");

    json.players.forEach(player => {
      const val = document.createElement("tr");
      val.innerHTML = `
        <td>${player.name}</td>
        <td>${player.id}</td>
      `;

      tableBody.appendChild(val);
    });
  })
  .catch(err => console.error(err));
