fetch("scores.json")
  .then(r => r.json())
  .then(json => {
    const Table = document.getDocumentById("table-tbody");

    json.players.forEach(player => {
      const val = document.createElement("tr");
      val.innerHTML = `
        <td>${player.name}</td>
        <td>${player.id}</td>
      `;

      Table.appendChild(val);
    }
  }
