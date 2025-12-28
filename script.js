let playerList2 = [];
const playerPdgaId = ["75216", "77535", "77547", "85225", "85229", "92342", "98755", "99121", "106897", "107746", "107764", "183456", "200855","259085", "289988","292238"];

let playerList = [];

window.onload = async () => {
  await fetchTournamentPlayers("https://www.pdga.com/apps/tournament/live-api/live_results_fetch_round?TournID=91781&Division=MPO");
  await fetchTournamentPlayers("https://www.pdga.com/apps/tournament/live-api/live_results_fetch_round?TournID=91781&Division=MP40");
  await getPlayerFromTournment("https://www.pdga.com/apps/tournament/live-api/live_results_fetch_round?TournID=61835&Division=MPO","92342")
  await getPlayerFromTournment("https://www.pdga.com/apps/tournament/live-api/live_results_fetch_round?TournID=61835&Division=MPO","107764")
  await getPlayerFromTournment("https://www.pdga.com/apps/tournament/live-api/live_results_fetch_round?TournID=61835&Division=FPO","107746") 
  await getPlayerFromTournment("https://www.pdga.com/apps/tournament/live-api/live_results_fetch_round?TournID=51107&Division=MA2","98755")
  await getPlayerFromTournment("https://www.pdga.com/apps/tournament/live-api/live_results_fetch_round?TournID=85113&Division=MJ18","292238")
  await getPlayerFromTournment("https://www.pdga.com/apps/tournament/live-api/live_results_fetch_round?TournID=94759&Division=MA3","85225")
  renderPlayerList();
};

async function getPlayerFromTournment(url, pdgaNum) {
      try {
    const resp = await fetch(url, { headers: { Accept: "application/json" } });
    if (!resp.ok) throw new Error(`Fel vid hämtning: ${resp.status}`);

    const data = await resp.json();
    const scores = data?.data?.scores;

    if (!Array.isArray(scores)) {
      return null;
    }

    const player = scores.find(
      s => String(s.PDGANum) === String(pdgaNum)
    );

    if (!player) {
      return null;
    }

    const name = player.Name ?? player.name ?? "—";
    const rating = player.Rating ?? player.rating ?? null;
    const pdga = player.PDGANum ?? player.pdga_number ?? pdgaNum;

    const exists = playerList.some(p => String(p.pdgaNum) === String(pdga));

    const isPlayerOneOfList = playerPdgaId.includes(String(pdga));    

    if (!exists && isPlayerOneOfList && rating && !isNaN(rating)) {
      playerList.push({ name, pdgaNum, rating});
    } 

    return ;
  } catch (err) {
    return null;
  }
}

async function fetchTournamentPlayers(url) {
    try {
    const resp = await fetch(url, { headers: { Accept: "application/json" } });

    if (!resp.ok) throw new Error(`Felaktig statuskod: ${resp.status}`);
    const data = await resp.json();

    const scores = data?.data?.scores;
    if (!Array.isArray(scores) || !scores.length) {
      return;
    }

for (const s of scores) {
  const name = s.Name;
  const pdgaNum = s.PDGANum;
  const rating = s.Rating ?? null;

    const exists = playerList.some(p => String(p.pdgaNum) === String(pdgaNum));
    const isPlayerOneOfList = playerPdgaId.includes(String(pdgaNum));    

  if (!exists && isPlayerOneOfList && rating && !isNaN(rating)) {
    playerList.push({ name, pdgaNum, rating });  
      }
    }
  } catch (err) {
  }
}

function renderPlayerList() {
    playerList.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  const listDiv = document.getElementById("playerList");

  if (!playerList.length) {
    listDiv.innerHTML = `<p style="font-weight:bold;">⚠️ Inga spelardata hittades. Kolla konsolen (F12) för mer info.</p>`;
    return;
  }

  const rows = playerList.map((p, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${p.pdgaNum !== "—" ? `<a href="https://www.pdga.com/player/${p.pdgaNum}" target="_blank">${p.name}</a>` : p.name}</td>
      <td>${p.pdgaNum?? "—"}</td>
      <td>${p.rating ?? "—"}</td>
    </tr>
  `).join("");

  listDiv.innerHTML = `
    <table>
      <thead>
        <tr><th>#</th><th>Name</th><th>PDGA #</th><th>Rating</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}
