
const playerPdgaId = new Set([
  "75216", "75285", "77535", "77547", "85225", "85229",
  "92342", "98755", "99121", "106897", "107746", "107488",
  "107764", "114085", "183456", "200855", "220960",
  "231698", "247940", "250501", "253259", "259085",
  "261443", "289988", "292238", "324942"
]);

const playerList = new Map();

const requests = [
  {
    type: "tournament",
    url: "https://www.pdga.com/apps/tournament/live-api/live_results_fetch_round?TournID=91781&Division=MPO"
  },
  {
    type: "tournament",
    url: "https://www.pdga.com/apps/tournament/live-api/live_results_fetch_round?TournID=91781&Division=MP40"
  },

  {
    type: "player",
    url: "https://www.pdga.com/apps/tournament/live-api/live_results_fetch_round?TournID=61835&Division=MPO",
    pdgaNum: "92342"
  },
  {
    type: "player",
    url: "https://www.pdga.com/apps/tournament/live-api/live_results_fetch_round?TournID=61835&Division=MPO",
    pdgaNum: "107764"
  },
  {
    type: "player",
    url: "https://www.pdga.com/apps/tournament/live-api/live_results_fetch_round?TournID=61835&Division=FPO",
    pdgaNum: "107746"
  },
  {
    type: "player",
    url: "https://www.pdga.com/apps/tournament/live-api/live_results_fetch_round?TournID=51107&Division=MA2",
    pdgaNum: "98755"
  },
  {
    type: "player",
    url: "https://www.pdga.com/apps/tournament/live-api/live_results_fetch_round?TournID=85113&Division=MJ18",
    pdgaNum: "292238"
  },
  {
    type: "player",
    url: "https://www.pdga.com/apps/tournament/live-api/live_results_fetch_round?TournID=94759&Division=MA3",
    pdgaNum: "85225"
  },
  {
    type: "player",
    url: "https://www.pdga.com/apps/tournament/live-api/live_results_fetch_round?TournID=103092&Division=MA4",
    pdgaNum: "220960"
  },
  {
    type: "player",
    url: "https://www.pdga.com/apps/tournament/live-api/live_results_fetch_round?TournID=104367&Division=FA3",
    pdgaNum: "324942"
  },
  {
    type: "player",
    url: "https://www.pdga.com/apps/tournament/live-api/live_results_fetch_round?TournID=53584&Division=MA3",
    pdgaNum: "107488"
  },
  {
    type: "player",
    url: "https://www.pdga.com/apps/tournament/live-api/live_results_fetch_round?TournID=83155&Division=MA4",
    pdgaNum: "253259"
  },
  {
    type: "player",
    url: "https://www.pdga.com/apps/tournament/live-api/live_results_fetch_round?TournID=70970&Division=MA4",
    pdgaNum: "231698"
  },
  {
    type: "player",
    url: "https://www.pdga.com/apps/tournament/live-api/live_results_fetch_round?TournID=70970&Division=MA3",
    pdgaNum: "261443"
  },
  {
    type: "player",
    url: "https://www.pdga.com/apps/tournament/live-api/live_results_fetch_round?TournID=70970&Division=MA3",
    pdgaNum: "114085"
  }
];

window.addEventListener("load", async () => {
  await Promise.all(
    requests.map(request => fetchRequest(request))
  );

  renderPlayerList();
});


async function fetchRequest(request) {
  try {
    const response = await fetch(request.url, {
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const scores = data?.data?.scores;

    if (!Array.isArray(scores)) {
      return;
    }

    if (request.type === "player") {
      const player = scores.find(
        s => String(s.PDGANum) === String(request.pdgaNum)
      );

      if (player) {
        addPlayer(player);
      }

      return;
    }

    for (const player of scores) {
      addPlayer(player);
    }

  } catch (error) {
    console.error("Kunde inte hämta:", request.url, error);
  }
}


function addPlayer(player) {
  const pdgaNum = String(
    player.PDGANum ??
    player.pdga_number ??
    ""
  );

  const name =
    player.Name ??
    player.name ??
    "—";

  const rating =
    player.Rating ??
    player.rating ??
    null;

  if (!playerPdgaId.has(pdgaNum)) {
    return;
  }

  // Rating måste vara ett giltigt nummer
  if (rating === null || rating === "" || isNaN(rating)) {
    return;
  }

  if (playerList.has(pdgaNum)) {
    return;
  }

  playerList.set(pdgaNum, {
    name,
    pdgaNum,
    rating
  });
}


function renderPlayerList() {
  const listDiv = document.getElementById("playerList");

  if (!listDiv) {
    return;
  }

  const players = Array.from(playerList.values())
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

  if (!players.length) {
    listDiv.innerHTML = `
      <p style="font-weight:bold;">
        ⚠️ Inga spelardata hittades.
        Kolla konsolen (F12) för mer info.
      </p>
    `;
    return;
  }

  const rows = players.map((player, index) => {
    const pdgaLink = player.pdgaNum
      ? `<a href="https://www.pdga.com/player/${player.pdgaNum}"
           target="_blank"
           rel="noopener noreferrer">
           ${escapeHtml(player.name)}
         </a>`
      : escapeHtml(player.name);

    return `
      <tr>
        <td>${index + 1}</td>
        <td>${pdgaLink}</td>
        <td>${player.pdgaNum}</td>
        <td>${player.rating}</td>
      </tr>
    `;
  }).join("");

  listDiv.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Name</th>
          <th>PDGA #</th>
          <th>Rating</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}


function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

