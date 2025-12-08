// Script for Poxi Games site (dark mode)
// Handles: loading player list, displaying profiles, season switching, radar chart


// Global variables
let players = [];
let selectedPlayer = null;
let selectedSeason = null;


// Fetch scores.json
document.addEventListener("DOMContentLoaded", () => {
fetch("scores.json")
.then(res => res.json())
.then(data => {
players = data.players;


const page = document.body.getAttribute("data-page");


if (page === "players") loadPlayerList();
if (page === "player") loadPlayerProfile();
})
.catch(err => console.error("Failed to load scores.json", err));
});


// ------------------------
// PLAYER LIST
// ------------------------


function loadPlayerList() {
const container = document.getElementById("player-list");
if (!container) return;


players.forEach(p => {
const card = document.createElement("div");
card.className = "player-button";


card.innerHTML = `
<img src="${p.head}" class="player-head" />
<div class="player-name">${p.name}</div>
`;


card.onclick = () => {
window.location.href = `player.html?name=${encodeURIComponent(p.name)}`;
};


container.appendChild(card);
});
}


// ------------------------
// PLAYER PROFILE
// ------------------------


function loadPlayerProfile() {
const url = new URLSearchParams(window.location.search);
const playerName = url.get("name");


selectedPlayer = players.find(p => p.name === playerName);
if (!selectedPlayer) {
document.getElementById("profile").innerHTML = "Player not found.";
return;
}


// Fill identity fields
document.getElementById("pname").textContent = selectedPlayer.name;
document.getElementById("pdiscord").textContent = selectedPlayer.discord;
document.getElementById("phead").src = selectedPlayer.head;
document.getElementById("ptier").textContent = selectedPlayer.tier;


// Roles
const rolesBox = document.getElementById("proles");
rolesBox.innerHTML = "";
selectedPlayer.roles.forEach(role => {
const span = document.createElement("span");
span.className = "role-badge";
span.textContent = role;
rolesBox.appendChild(span);
});


// Warnings / banned
document.getElementById("pwarnings").textContent = selectedPlayer.warnings;
document.getElementById("pbanned").textContent = selectedPlayer.banned ? "Yes" : "No";


// Seasons dropdown
const seasonSelect = document.getElementById("season-select");
seasonSelect.innerHTML = `<option value="all">All Seasons</option>`;


for (let s in selectedPlayer.seasons) {
seasonSelect.innerHTML += `<option value="${s}">${s}</option>`;
}


}
