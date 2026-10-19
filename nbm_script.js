const playerNBMListMpo = new Map();
const playerNBMListFpo = new Map();

const tournamentUrls = [
  // MPO
  "https://www.pdga.com/apps/tournament/live-api/live_results_fetch_round?TournID=61835&Division=MPO",
  "https://www.pdga.com/apps/tournament/live-api/live_results_fetch_round?TournID=39561&Division=MA1",
  "https://www.pdga.com/apps/tournament/live-api/live_results_fetch_round?TournID=39561&Division=MPO",
  "https://www.pdga.com/apps/tournament/live-api/live_results_fetch_round?TournID=85115&Division=MA1",
  "https://www.pdga.com/apps/tournament/live-api/live_results_fetch_round?TournID=107613&Division=MPO",

  // FPO
  "https://www.pdga.com/apps/tournament/live-api/live_results_fetch_round?TournID=61835&Division=FPO",
  "https://www.pdga.com/apps/tournament/live-api/live_results_fetch_round?TournID=39561&Division=FPO",
  "https://www.pdga.com/apps/tournament/live-api/live_results_fetch_round?TournID=85115&Division=FA1",
  "https://www.pdga.com/apps/tournament/live-api/live_results_fetch_round?TournID=107613&Division=FPO"
];


window.addEventListener("load", async () => {
  await Promise.all(
    tournamentUrls.map(fetchTournamentPlayers)
  );

  renderPlayerList();
});


async function fetchTournamentPlayers(url) {
  try {
    const resp = await fetch(url, {
      headers: {
        Accept: "application/json"
      }
    });

    if (!resp.ok) {
      throw new Error(`Felaktig statuskod: ${resp.status}`);
    }

    const data = await resp.json();
    const scores = data?.data?.scores;

    if (!Array.isArray(scores) || !scores.length) {
      return;
    }

    const divisionMatch = url.match(/Division=([A-Za-z0-9]+)/);
    const division = divisionMatch
      ? divisionMatch[1].toUpperCase()
      : "";

    const isFDivision = division.startsWith("F");

    for (const player of scores) {
      const name = player.Name ?? "—";
      const pdgaNum = String(player.PDGANum ?? "");
      const rating = player.Rating ?? null;

      if (
        rating === null ||
        rating === "" ||
        isNaN(rating)
      ) {
        continue;
      }

      const playerData = {
        name,
        pdgaNum,
        rating
      };

      if (isFDivision) {
        if (!playerNBMListFpo.has(pdgaNum)) {
          playerNBMListFpo.set(pdgaNum, playerData);
        }
      } else {
        if (!playerNBMListMpo.has(pdgaNum)) {
          playerNBMListMpo.set(pdgaNum, playerData);
        }
      }
    }

  } catch (err) {
    console.error(
      "Fel vid hämtning av spelare:",
      url,
      err
    );
  }
}


function renderPlayerList() {
  const listDiv = document.getElementById("playerList");
  const listDivFpo = document.getElementById("playerListFpo");

  const mpoPlayers = Array.from(playerNBMListMpo.values())
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

  const fpoPlayers = Array.from(playerNBMListFpo.values())
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));


  if (!mpoPlayers.length) {
    listDiv.innerHTML = `
      <p style="font-weight:bold;">
        ⚠️ Inga spelardata hittades.⚠️
      </p>
    `;
  } else {
    listDiv.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>#MPO</th>
            <th>Name</th>
            <th>PDGA</th>
            <th>Rating</th>
          </tr>
        </thead>
        <tbody>
          ${createRows(mpoPlayers)}
        </tbody>
      </table>
    `;
  }

  if (!fpoPlayers.length) {
    listDivFpo.innerHTML = `
      <p style="font-weight:bold;">
        ⚠️ Inga F-divisionsspelare hittades.⚠️
      </p>
    `;
  } else {
    listDivFpo.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>#FPO</th>
            <th>Name</th>
            <th>PDGA</th>
            <th>Rating</th>
          </tr>
        </thead>
        <tbody>
          ${createRows(fpoPlayers)}
        </tbody>
      </table>
    `;
  }
}


function createRows(players) {
  return players.map((player, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>
        <a
          href="https://www.pdga.com/player/${player.pdgaNum}"
          target="_blank"
          rel="noopener noreferrer"
        >
          ${escapeHtml(player.name)}
        </a>
      </td>
      <td>${player.pdgaNum || "—"}</td>
      <td>${player.rating ?? "—"}</td>
    </tr>
  `).join("");
}


function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

