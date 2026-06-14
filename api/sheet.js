const SHEET_ID = "14GHe8BDXpJPoIiTo6oMYdHXYlBKRPPZR4MoRG5w9pig";
const SHEET_GID = "1100286737";

function clean(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function money(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? Math.round(number) : 0;
}

function rankNumber(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? Math.round(number) : null;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (quoted) {
      if (char === '"' && next === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (char !== "\r") {
      cell += char;
    }
  }

  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}

function buildState(rows) {
  const players = rows
    .slice(1)
    .filter((row) => clean(row[0]) && clean(row[1]) && clean(row[2]))
    .map((row) => ({
      rank: rankNumber(row[0]),
      player: clean(row[1]),
      amount: money(row[2]),
      specialty: clean(row[3]),
      age: clean(row[4]),
      team: clean(row[5]),
    }));

  const teamsFromSheet = rows
    .slice(1)
    .filter((row) => clean(row[8]) && clean(row[9]))
    .map((row) => ({
      rank: rankNumber(row[7]),
      team: clean(row[8]),
      amount: money(row[9]),
    }));

  const computedTeams = Object.values(
    players.reduce((acc, player) => {
      if (!player.team) return acc;
      if (!acc[player.team]) acc[player.team] = { team: player.team, amount: 0, sales: 0 };
      acc[player.team].amount += player.amount;
      acc[player.team].sales += 1;
      return acc;
    }, {})
  ).sort((a, b) => b.amount - a.amount);

  const teams = teamsFromSheet.length ? teamsFromSheet : computedTeams.map((team, index) => ({ ...team, rank: index + 1 }));
  const total = players.reduce((sum, player) => sum + player.amount, 0);
  const average = players.length ? Math.round(total / players.length) : 0;

  return {
    players,
    teams,
    computedTeams,
    specialities: Array.from(new Set(players.map((player) => player.specialty).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    teamNames: Array.from(new Set(players.map((player) => player.team).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    stats: {
      total,
      count: players.length,
      average,
      topSale: players[0] || null,
      lastUpdated: new Date().toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" }),
    },
  };
}

module.exports = async function handler(req, res) {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`;
    const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!response.ok) {
      res.status(response.status).json({ error: "No se pudo leer la hoja" });
      return;
    }

    const csv = await response.text();
    const data = buildState(parseCsv(csv));
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Error leyendo la hoja" });
  }
};
