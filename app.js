const rosterSlots = [
  "QB",
  "RB",
  "RB",
  "WR",
  "WR",
  "TE",
  "FLEX",
  "K",
  "DST",
  "BENCH",
  "BENCH",
  "BENCH",
  "BENCH",
  "BENCH",
  "BENCH",
  "BENCH",
];

const minimumRosterPositions = ["QB", "RB", "WR", "TE", "K", "DST"];
const balancedAutoDraftTargets = {
  QB: 2,
  RB: 4,
  WR: 5,
  TE: 2,
  K: 1,
  DST: 1,
};

const draftPickDurationMs = 3 * 60 * 1000;
const playerDataVersion = "2026-expanded-10-team-ppr-v1";
const stateStorageKey = document.body.dataset.storageKey || "gridiron-draft-lab";
const adminUsername = "Treemander";
const adminPassword = "gubbard";
const liveDraftClientId = crypto.randomUUID();

let liveDraftEnabled = false;
let liveDraftRevision = null;
let liveDraftSaveTimer = null;
let isApplyingLiveState = false;

const legacyPlayers = [
  { id: 1, name: "Christian McCaffrey", pos: "RB", nfl: "SF", rank: 1, points: 21.8 },
  { id: 2, name: "CeeDee Lamb", pos: "WR", nfl: "DAL", rank: 2, points: 20.9 },
  { id: 3, name: "Tyreek Hill", pos: "WR", nfl: "MIA", rank: 3, points: 20.5 },
  { id: 4, name: "Justin Jefferson", pos: "WR", nfl: "MIN", rank: 4, points: 19.8 },
  { id: 5, name: "Ja'Marr Chase", pos: "WR", nfl: "CIN", rank: 5, points: 19.4 },
  { id: 6, name: "Bijan Robinson", pos: "RB", nfl: "ATL", rank: 6, points: 18.7 },
  { id: 7, name: "Breece Hall", pos: "RB", nfl: "NYJ", rank: 7, points: 18.2 },
  { id: 8, name: "Amon-Ra St. Brown", pos: "WR", nfl: "DET", rank: 8, points: 18.1 },
  { id: 9, name: "A.J. Brown", pos: "WR", nfl: "PHI", rank: 9, points: 17.7 },
  { id: 10, name: "Saquon Barkley", pos: "RB", nfl: "PHI", rank: 10, points: 17.3 },
  { id: 11, name: "Josh Allen", pos: "QB", nfl: "BUF", rank: 11, points: 24.6 },
  { id: 12, name: "Jalen Hurts", pos: "QB", nfl: "PHI", rank: 12, points: 23.8 },
  { id: 13, name: "Lamar Jackson", pos: "QB", nfl: "BAL", rank: 13, points: 23.4 },
  { id: 14, name: "Patrick Mahomes", pos: "QB", nfl: "KC", rank: 14, points: 22.8 },
  { id: 15, name: "Jonathan Taylor", pos: "RB", nfl: "IND", rank: 15, points: 16.8 },
  { id: 16, name: "Jahmyr Gibbs", pos: "RB", nfl: "DET", rank: 16, points: 16.6 },
  { id: 17, name: "Puka Nacua", pos: "WR", nfl: "LAR", rank: 17, points: 16.3 },
  { id: 18, name: "Garrett Wilson", pos: "WR", nfl: "NYJ", rank: 18, points: 15.9 },
  { id: 19, name: "Travis Kelce", pos: "TE", nfl: "KC", rank: 19, points: 14.8 },
  { id: 20, name: "Sam LaPorta", pos: "TE", nfl: "DET", rank: 20, points: 14.2 },
  { id: 21, name: "Mark Andrews", pos: "TE", nfl: "BAL", rank: 21, points: 13.7 },
  { id: 22, name: "De'Von Achane", pos: "RB", nfl: "MIA", rank: 22, points: 15.6 },
  { id: 23, name: "Nico Collins", pos: "WR", nfl: "HOU", rank: 23, points: 15.2 },
  { id: 24, name: "Mike Evans", pos: "WR", nfl: "TB", rank: 24, points: 14.9 },
  { id: 25, name: "Brandon Aiyuk", pos: "WR", nfl: "SF", rank: 25, points: 14.6 },
  { id: 26, name: "Isiah Pacheco", pos: "RB", nfl: "KC", rank: 26, points: 14.5 },
  { id: 27, name: "James Cook", pos: "RB", nfl: "BUF", rank: 27, points: 14.1 },
  { id: 28, name: "DK Metcalf", pos: "WR", nfl: "SEA", rank: 28, points: 13.8 },
  { id: 29, name: "DJ Moore", pos: "WR", nfl: "CHI", rank: 29, points: 13.5 },
  { id: 30, name: "George Kittle", pos: "TE", nfl: "SF", rank: 30, points: 12.9 },
  { id: 31, name: "C.J. Stroud", pos: "QB", nfl: "HOU", rank: 31, points: 20.7 },
  { id: 32, name: "Anthony Richardson", pos: "QB", nfl: "IND", rank: 32, points: 20.1 },
  { id: 33, name: "Justin Tucker", pos: "K", nfl: "BAL", rank: 33, points: 9.4 },
  { id: 34, name: "Harrison Butker", pos: "K", nfl: "KC", rank: 34, points: 9.1 },
  { id: 35, name: "Jake Elliott", pos: "K", nfl: "PHI", rank: 35, points: 8.9 },
  { id: 36, name: "Dallas Cowboys", pos: "DST", nfl: "DAL", rank: 36, points: 9.8 },
  { id: 37, name: "San Francisco 49ers", pos: "DST", nfl: "SF", rank: 37, points: 9.6 },
  { id: 38, name: "Baltimore Ravens", pos: "DST", nfl: "BAL", rank: 38, points: 9.3 },
  { id: 39, name: "Kyren Williams", pos: "RB", nfl: "LAR", rank: 39, points: 13.1 },
  { id: 40, name: "Drake London", pos: "WR", nfl: "ATL", rank: 40, points: 12.8 },
  { id: 41, name: "Tee Higgins", pos: "WR", nfl: "CIN", rank: 41, points: 12.6 },
  { id: 42, name: "Jaylen Waddle", pos: "WR", nfl: "MIA", rank: 42, points: 12.4 },
  { id: 43, name: "Rachaad White", pos: "RB", nfl: "TB", rank: 43, points: 12.2 },
  { id: 44, name: "Kenneth Walker III", pos: "RB", nfl: "SEA", rank: 44, points: 12.0 },
  { id: 45, name: "Trey McBride", pos: "TE", nfl: "ARI", rank: 45, points: 11.8 },
  { id: 46, name: "Caleb Williams", pos: "QB", nfl: "CHI", rank: 46, points: 19.2 },
  { id: 47, name: "Jordan Love", pos: "QB", nfl: "GB", rank: 47, points: 19.0 },
  { id: 48, name: "DeVonta Smith", pos: "WR", nfl: "PHI", rank: 48, points: 11.7 },
  { id: 49, name: "Amari Cooper", pos: "WR", nfl: "BUF", rank: 49, points: 11.4 },
  { id: 50, name: "Najee Harris", pos: "RB", nfl: "PIT", rank: 50, points: 11.2 },
  { id: 51, name: "Aaron Jones", pos: "RB", nfl: "MIN", rank: 51, points: 11.0 },
  { id: 52, name: "Dalton Kincaid", pos: "TE", nfl: "BUF", rank: 52, points: 10.8 },
  { id: 53, name: "David Njoku", pos: "TE", nfl: "CLE", rank: 53, points: 10.4 },
  { id: 54, name: "Ka'imi Fairbairn", pos: "K", nfl: "HOU", rank: 54, points: 8.7 },
  { id: 55, name: "Brandon Aubrey", pos: "K", nfl: "DAL", rank: 55, points: 8.6 },
  { id: 56, name: "Cleveland Browns", pos: "DST", nfl: "CLE", rank: 56, points: 8.8 },
  { id: 57, name: "New York Jets", pos: "DST", nfl: "NYJ", rank: 57, points: 8.6 },
  { id: 58, name: "Miami Dolphins", pos: "DST", nfl: "MIA", rank: 58, points: 8.4 },
  { id: 59, name: "Terry McLaurin", pos: "WR", nfl: "WAS", rank: 59, points: 10.2 },
  { id: 60, name: "Chris Godwin", pos: "WR", nfl: "TB", rank: 60, points: 10.1 },
  { id: 61, name: "Zay Flowers", pos: "WR", nfl: "BAL", rank: 61, points: 10.0 },
  { id: 62, name: "Tony Pollard", pos: "RB", nfl: "TEN", rank: 62, points: 9.9 },
  { id: 63, name: "Brian Robinson Jr.", pos: "RB", nfl: "WAS", rank: 63, points: 9.8 },
  { id: 64, name: "Jayden Daniels", pos: "QB", nfl: "WAS", rank: 64, points: 18.7 },
  { id: 65, name: "Brock Purdy", pos: "QB", nfl: "SF", rank: 65, points: 18.4 },
  { id: 66, name: "Evan Engram", pos: "TE", nfl: "JAX", rank: 66, points: 9.6 },
  { id: 67, name: "Jake Ferguson", pos: "TE", nfl: "DAL", rank: 67, points: 9.4 },
  { id: 68, name: "Buffalo Bills", pos: "DST", nfl: "BUF", rank: 68, points: 8.2 },
  { id: 69, name: "Kansas City Chiefs", pos: "DST", nfl: "KC", rank: 69, points: 8.0 },
  { id: 70, name: "Cameron Dicker", pos: "K", nfl: "LAC", rank: 70, points: 8.3 },
  { id: 71, name: "Younghoe Koo", pos: "K", nfl: "ATL", rank: 71, points: 8.1 },
  { id: 72, name: "Tank Dell", pos: "WR", nfl: "HOU", rank: 72, points: 9.2 },
  { id: 73, name: "Joe Burrow", pos: "QB", nfl: "CIN", rank: 73, points: 22.1 },
  { id: 74, name: "Dak Prescott", pos: "QB", nfl: "DAL", rank: 74, points: 21.4 },
  { id: 75, name: "Tua Tagovailoa", pos: "QB", nfl: "MIA", rank: 75, points: 18.1 },
  { id: 76, name: "Jared Goff", pos: "QB", nfl: "DET", rank: 76, points: 17.8 },
  { id: 77, name: "Trevor Lawrence", pos: "QB", nfl: "JAX", rank: 77, points: 17.2 },
  { id: 78, name: "Baker Mayfield", pos: "QB", nfl: "TB", rank: 78, points: 16.9 },
  { id: 79, name: "Derrick Henry", pos: "RB", nfl: "BAL", rank: 79, points: 15.8 },
  { id: 80, name: "Josh Jacobs", pos: "RB", nfl: "GB", rank: 80, points: 14.7 },
  { id: 81, name: "Joe Mixon", pos: "RB", nfl: "HOU", rank: 81, points: 13.9 },
  { id: 82, name: "D'Andre Swift", pos: "RB", nfl: "CHI", rank: 82, points: 11.6 },
  { id: 83, name: "Alvin Kamara", pos: "RB", nfl: "NO", rank: 83, points: 11.5 },
  { id: 84, name: "James Conner", pos: "RB", nfl: "ARI", rank: 84, points: 11.3 },
  { id: 85, name: "Chuba Hubbard", pos: "RB", nfl: "CAR", rank: 85, points: 10.9 },
  { id: 86, name: "Javonte Williams", pos: "RB", nfl: "DEN", rank: 86, points: 9.5 },
  { id: 87, name: "Davante Adams", pos: "WR", nfl: "LV", rank: 87, points: 13.4 },
  { id: 88, name: "Stefon Diggs", pos: "WR", nfl: "HOU", rank: 88, points: 13.0 },
  { id: 89, name: "Cooper Kupp", pos: "WR", nfl: "LAR", rank: 89, points: 12.7 },
  { id: 90, name: "Deebo Samuel", pos: "WR", nfl: "SF", rank: 90, points: 12.3 },
  { id: 91, name: "Malik Nabers", pos: "WR", nfl: "NYG", rank: 91, points: 12.1 },
  { id: 92, name: "Marvin Harrison Jr.", pos: "WR", nfl: "ARI", rank: 92, points: 11.9 },
  { id: 93, name: "Courtland Sutton", pos: "WR", nfl: "DEN", rank: 93, points: 9.8 },
  { id: 94, name: "Christian Kirk", pos: "WR", nfl: "JAX", rank: 94, points: 9.5 },
  { id: 95, name: "Ladd McConkey", pos: "WR", nfl: "LAC", rank: 95, points: 9.3 },
  { id: 96, name: "Brian Thomas Jr.", pos: "WR", nfl: "JAX", rank: 96, points: 9.1 },
  { id: 97, name: "Brock Bowers", pos: "TE", nfl: "LV", rank: 97, points: 11.1 },
  { id: 98, name: "Kyle Pitts", pos: "TE", nfl: "ATL", rank: 98, points: 9.1 },
  { id: 99, name: "Dallas Goedert", pos: "TE", nfl: "PHI", rank: 99, points: 8.8 },
  { id: 100, name: "T.J. Hockenson", pos: "TE", nfl: "MIN", rank: 100, points: 8.5 },
  { id: 101, name: "Cole Kmet", pos: "TE", nfl: "CHI", rank: 101, points: 8.2 },
  { id: 102, name: "Pat Freiermuth", pos: "TE", nfl: "PIT", rank: 102, points: 7.9 },
  { id: 103, name: "Evan McPherson", pos: "K", nfl: "CIN", rank: 103, points: 8.0 },
  { id: 104, name: "Jason Sanders", pos: "K", nfl: "MIA", rank: 104, points: 7.9 },
  { id: 105, name: "Tyler Bass", pos: "K", nfl: "BUF", rank: 105, points: 7.8 },
  { id: 106, name: "Jake Moody", pos: "K", nfl: "SF", rank: 106, points: 7.7 },
  { id: 107, name: "Philadelphia Eagles", pos: "DST", nfl: "PHI", rank: 107, points: 7.9 },
  { id: 108, name: "Pittsburgh Steelers", pos: "DST", nfl: "PIT", rank: 108, points: 7.8 },
  { id: 109, name: "Detroit Lions", pos: "DST", nfl: "DET", rank: 109, points: 7.6 },
  { id: 110, name: "Houston Texans", pos: "DST", nfl: "HOU", rank: 110, points: 7.5 },
  { id: 111, name: "Green Bay Packers", pos: "DST", nfl: "GB", rank: 111, points: 7.4 },
  { id: 112, name: "Minnesota Vikings", pos: "DST", nfl: "MIN", rank: 112, points: 7.3 },
];

const players = [
  { id: 3, name: "Bijan Robinson", pos: "RB", nfl: "ATL", rank: 1, points: 373.3 },
  { id: 13, name: "Ja'Marr Chase", pos: "WR", nfl: "CIN", rank: 2, points: 339.0 },
  { id: 4, name: "Jahmyr Gibbs", pos: "RB", nfl: "DET", rank: 3, points: 372.9 },
  { id: 1, name: "Christian McCaffrey", pos: "RB", nfl: "SF", rank: 4, points: 324.9 },
  { id: 2, name: "Puka Nacua", pos: "WR", nfl: "LAR", rank: 5, points: 365.2 },
  { id: 14, name: "Amon-Ra St. Brown", pos: "WR", nfl: "DET", rank: 6, points: 321.1 },
  { id: 6, name: "Jonathan Taylor", pos: "RB", nfl: "IND", rank: 7, points: 323.2 },
  { id: 7, name: "Jaxon Smith-Njigba", pos: "WR", nfl: "SEA", rank: 8, points: 352.4 },
  { id: 21, name: "James Cook III", pos: "RB", nfl: "BUF", rank: 9, points: 270.2 },
  { id: 73, name: "Justin Jefferson", pos: "WR", nfl: "MIN", rank: 10, points: 271.7 },
  { id: 42, name: "Ashton Jeanty", pos: "RB", nfl: "LV", rank: 11, points: 281.1 },
  { id: 43, name: "CeeDee Lamb", pos: "WR", nfl: "DAL", rank: 12, points: 284.2 },
  { id: 11, name: "De'Von Achane", pos: "RB", nfl: "MIA", rank: 13, points: 306.7 },
  { id: 41, name: "Saquon Barkley", pos: "RB", nfl: "PHI", rank: 14, points: 268.3 },
  { id: 17, name: "Trey McBride", pos: "TE", nfl: "ARI", rank: 15, points: 261.0 },
  { id: 229, name: "Drake London", pos: "WR", nfl: "ATL", rank: 16, points: 299.0 },
  { id: 168, name: "Omarion Hampton", pos: "RB", nfl: "LAC", rank: 17, points: 262.3 },
  { id: 121, name: "Jeremiyah Love", pos: "RB", nfl: "ARI", rank: 18, points: 255.6, rookie: true },
  { id: 83, name: "Kenneth Walker III", pos: "RB", nfl: "KC", rank: 19, points: 248.2 },
  { id: 27, name: "Chase Brown", pos: "RB", nfl: "CIN", rank: 20, points: 286.3 },
  { id: 309, name: "Brock Bowers", pos: "TE", nfl: "LV", rank: 21, points: 238.8 },
  { id: 233, name: "Malik Nabers", pos: "WR", nfl: "NYG", rank: 22, points: 220.9 },
  { id: 29, name: "Derrick Henry", pos: "RB", nfl: "BAL", rank: 23, points: 281.3 },
  { id: 33, name: "Josh Jacobs", pos: "RB", nfl: "GB", rank: 24, points: 264.5 },
  { id: 5, name: "Josh Allen", pos: "QB", nfl: "BUF", rank: 25, points: 374.8 },
  { id: 25, name: "George Pickens", pos: "WR", nfl: "DAL", rank: 26, points: 265.9 },
  { id: 37, name: "Nico Collins", pos: "WR", nfl: "HOU", rank: 27, points: 254.1 },
  { id: 26, name: "Chris Olave", pos: "WR", nfl: "NO", rank: 28, points: 262.8 },
  { id: 40, name: "A.J. Brown", pos: "WR", nfl: "NE", rank: 29, points: 264.5 },
  { id: 35, name: "Kyren Williams", pos: "RB", nfl: "LAR", rank: 30, points: 242.2 },
  { id: 230, name: "Rashee Rice", pos: "WR", nfl: "KC", rank: 31, points: 284.8 },
  { id: 53, name: "Breece Hall", pos: "RB", nfl: "NYJ", rank: 32, points: 258.9 },
  { id: 170, name: "Bucky Irving", pos: "RB", nfl: "TB", rank: 33, points: 229.6 },
  { id: 36, name: "Javonte Williams", pos: "RB", nfl: "DAL", rank: 34, points: 239.0 },
  { id: 60, name: "Tetairoa McMillan", pos: "WR", nfl: "CAR", rank: 35, points: 228.5 },
  { id: 38, name: "Travis Etienne Jr.", pos: "RB", nfl: "NO", rank: 36, points: 240.2 },
  { id: 231, name: "Garrett Wilson", pos: "WR", nfl: "NYJ", rank: 37, points: 246.0 },
  { id: 310, name: "Colston Loveland", pos: "TE", nfl: "CHI", rank: 38, points: 217.0 },
  { id: 47, name: "Tee Higgins", pos: "WR", nfl: "CIN", rank: 39, points: 230.4 },
  { id: 68, name: "TreVeyon Henderson", pos: "RB", nfl: "NE", rank: 40, points: 198.8 },
  { id: 169, name: "Cam Skattebo", pos: "RB", nfl: "NYG", rank: 41, points: 244.4 },
  { id: 78, name: "Emeka Egbuka", pos: "WR", nfl: "TB", rank: 42, points: 225.6 },
  { id: 44, name: "Zay Flowers", pos: "WR", nfl: "BAL", rank: 43, points: 250.5 },
  { id: 28, name: "Lamar Jackson", pos: "QB", nfl: "BAL", rank: 44, points: 327.7 },
  { id: 82, name: "Ladd McConkey", pos: "WR", nfl: "LAC", rank: 45, points: 215.2 },
  { id: 71, name: "DeVonta Smith", pos: "WR", nfl: "PHI", rank: 46, points: 239.4 },
  { id: 235, name: "DJ Moore", pos: "WR", nfl: "BUF", rank: 47, points: 208.7 },
  { id: 69, name: "Quinshon Judkins", pos: "RB", nfl: "CLE", rank: 48, points: 217.1 },
  { id: 67, name: "Jaylen Waddle", pos: "WR", nfl: "DEN", rank: 49, points: 211.6 },
  { id: 173, name: "David Montgomery", pos: "RB", nfl: "HOU", rank: 50, points: 186.7 },
  { id: 86, name: "Tyler Warren", pos: "TE", nfl: "IND", rank: 51, points: 207.1 },
  { id: 55, name: "Jameson Williams", pos: "WR", nfl: "DET", rank: 52, points: 215.5 },
  { id: 32, name: "Davante Adams", pos: "WR", nfl: "LAR", rank: 53, points: 222.7 },
  { id: 232, name: "Terry McLaurin", pos: "WR", nfl: "WAS", rank: 54, points: 221.6 },
  { id: 45, name: "D'Andre Swift", pos: "RB", nfl: "CHI", rank: 55, points: 223.2 },
  { id: 8, name: "Drake Maye", pos: "QB", nfl: "NE", rank: 56, points: 328.9 },
  { id: 153, name: "Joe Burrow", pos: "QB", nfl: "CIN", rank: 57, points: 314.1 },
  { id: 75, name: "Harold Fannin Jr.", pos: "TE", nfl: "CLE", rank: 58, points: 193.2 },
  { id: 238, name: "Mike Evans", pos: "WR", nfl: "SF", rank: 59, points: 193.2 },
  { id: 66, name: "RJ Harvey", pos: "RB", nfl: "DEN", rank: 60, points: 184.7 },
  { id: 234, name: "Rome Odunze", pos: "WR", nfl: "CHI", rank: 61, points: 214.3 },
  { id: 122, name: "Carnell Tate", pos: "WR", nfl: "TEN", rank: 62, points: 179.2, rookie: true },
  { id: 152, name: "Jayden Daniels", pos: "QB", nfl: "WAS", rank: 63, points: 329.6 },
  { id: 240, name: "Brian Thomas Jr.", pos: "WR", nfl: "JAX", rank: 64, points: 179.4 },
  { id: 239, name: "Christian Watson", pos: "WR", nfl: "GB", rank: 65, points: 184.0 },
  { id: 236, name: "Luther Burden III", pos: "WR", nfl: "CHI", rank: 66, points: 208.6 },
  { id: 54, name: "Michael Wilson", pos: "WR", nfl: "ARI", rank: 67, points: 174.4 },
  { id: 172, name: "Chuba Hubbard", pos: "RB", nfl: "CAR", rank: 68, points: 196.1 },
  { id: 51, name: "Jaylen Warren", pos: "RB", nfl: "PIT", rank: 69, points: 196.1 },
  { id: 237, name: "Marvin Harrison Jr.", pos: "WR", nfl: "ARI", rank: 70, points: 199.5 },
  { id: 16, name: "Jalen Hurts", pos: "QB", nfl: "PHI", rank: 71, points: 324.3 },
  { id: 57, name: "Rhamondre Stevenson", pos: "RB", nfl: "NE", rank: 72, points: 192.9 },
  { id: 123, name: "Jordyn Tyson", pos: "WR", nfl: "NO", rank: 73, points: 178.3, rookie: true },
  { id: 61, name: "Kyle Pitts Sr.", pos: "TE", nfl: "ATL", rank: 74, points: 201.1 },
  { id: 176, name: "Kyle Monangai", pos: "RB", nfl: "CHI", rank: 75, points: 165.7 },
  { id: 59, name: "DK Metcalf", pos: "WR", nfl: "PIT", rank: 76, points: 194.4 },
  { id: 313, name: "Tucker Kraft", pos: "TE", nfl: "GB", rank: 77, points: 178.2 },
  { id: 56, name: "Courtland Sutton", pos: "WR", nfl: "DEN", rank: 78, points: 212.1 },
  { id: 90, name: "Tony Pollard", pos: "RB", nfl: "TEN", rank: 79, points: 187.6 },
  { id: 171, name: "Bhayshul Tuten", pos: "RB", nfl: "JAX", rank: 80, points: 201.7 },
  { id: 311, name: "Sam LaPorta", pos: "TE", nfl: "DET", rank: 81, points: 193.5 },
  { id: 124, name: "Jadarian Price", pos: "RB", nfl: "SEA", rank: 82, points: 191.6, rookie: true },
  { id: 125, name: "Makai Lemon", pos: "WR", nfl: "PHI", rank: 83, points: 166.8, rookie: true },
  { id: 241, name: "Chris Godwin Jr.", pos: "WR", nfl: "TB", rank: 84, points: 176.0 },
  { id: 175, name: "J.K. Dobbins", pos: "RB", nfl: "DEN", rank: 85, points: 173.3 },
  { id: 58, name: "Rico Dowdle", pos: "RB", nfl: "PIT", rank: 86, points: 200.3 },
  { id: 18, name: "Dak Prescott", pos: "QB", nfl: "DAL", rank: 87, points: 309.1 },
  { id: 91, name: "Parker Washington", pos: "WR", nfl: "JAX", rank: 88, points: 189.0 },
  { id: 65, name: "Alec Pierce", pos: "WR", nfl: "IND", rank: 89, points: 212.3 },
  { id: 181, name: "Blake Corum", pos: "RB", nfl: "LAR", rank: 90, points: 137.5 },
  { id: 88, name: "Jakobi Meyers", pos: "WR", nfl: "JAX", rank: 91, points: 190.7 },
  { id: 50, name: "Wan'Dale Robinson", pos: "WR", nfl: "TEN", rank: 92, points: 185.5 },
  { id: 20, name: "Justin Herbert", pos: "QB", nfl: "LAC", rank: 93, points: 302.1 },
  { id: 24, name: "Jaxson Dart", pos: "QB", nfl: "NYG", rank: 94, points: 314.9 },
  { id: 15, name: "Caleb Williams", pos: "QB", nfl: "CHI", rank: 95, points: 296.6 },
  { id: 246, name: "Ricky Pearsall", pos: "WR", nfl: "SF", rank: 96, points: 166.8 },
  { id: 70, name: "Michael Pittman Jr.", pos: "WR", nfl: "PIT", rank: 97, points: 188.8 },
  { id: 314, name: "Isaiah Likely", pos: "TE", nfl: "NYG", rank: 98, points: 176.6 },
  { id: 244, name: "Jordan Addison", pos: "WR", nfl: "MIN", rank: 99, points: 171.4 },
  { id: 12, name: "Trevor Lawrence", pos: "QB", nfl: "JAX", rank: 100, points: 308.7 },
  { id: 52, name: "Kenneth Gainwell", pos: "RB", nfl: "TB", rank: 101, points: 184.4 },
  { id: 174, name: "Aaron Jones Sr.", pos: "RB", nfl: "MIN", rank: 102, points: 176.5 },
  { id: 177, name: "Rachaad White", pos: "RB", nfl: "WAS", rank: 103, points: 164.0 },
  { id: 178, name: "Jacory Croskey-Merritt", pos: "RB", nfl: "WAS", rank: 104, points: 148.9 },
  { id: 179, name: "Tyjae Spears", pos: "RB", nfl: "TEN", rank: 105, points: 143.1 },
  { id: 180, name: "Jordan Mason", pos: "RB", nfl: "MIN", rank: 106, points: 142.9 },
  { id: 81, name: "Zach Charbonnet", pos: "RB", nfl: "SEA", rank: 107, points: 129.9 },
  { id: 182, name: "Woody Marks", pos: "RB", nfl: "HOU", rank: 108, points: 127.9 },
  { id: 183, name: "Isiah Pacheco", pos: "RB", nfl: "DET", rank: 109, points: 127.1 },
  { id: 184, name: "Jonathon Brooks", pos: "RB", nfl: "CAR", rank: 110, points: 126.0 },
  { id: 185, name: "Alvin Kamara", pos: "RB", nfl: "NO", rank: 111, points: 124.0 },
  { id: 186, name: "Justice Hill", pos: "RB", nfl: "BAL", rank: 112, points: 116.0 },
  { id: 93, name: "Tyrone Tracy Jr.", pos: "RB", nfl: "NYG", rank: 113, points: 113.1 },
  { id: 187, name: "Dylan Sampson", pos: "RB", nfl: "CLE", rank: 114, points: 105.8 },
  { id: 188, name: "Samaje Perine", pos: "RB", nfl: "CIN", rank: 115, points: 96.2 },
  { id: 189, name: "Tyler Allgeier", pos: "RB", nfl: "ARI", rank: 116, points: 95.5 },
  { id: 190, name: "Ty Johnson", pos: "RB", nfl: "BUF", rank: 117, points: 94.1 },
  { id: 192, name: "AJ Dillon", pos: "RB", nfl: "CAR", rank: 118, points: 93.3 },
  { id: 191, name: "Jordan James", pos: "RB", nfl: "SF", rank: 119, points: 93.3 },
  { id: 193, name: "Brian Robinson Jr.", pos: "RB", nfl: "ATL", rank: 120, points: 93.0 },
  { id: 194, name: "Braelon Allen", pos: "RB", nfl: "NYJ", rank: 121, points: 91.3 },
  { id: 195, name: "Chris Rodriguez Jr.", pos: "RB", nfl: "JAX", rank: 122, points: 91.2 },
  { id: 196, name: "Kimani Vidal", pos: "RB", nfl: "LAC", rank: 123, points: 78.6 },
  { id: 136, name: "Mike Washington Jr.", pos: "RB", nfl: "LV", rank: 124, points: 77.7, rookie: true },
  { id: 137, name: "Kaelon Black", pos: "RB", nfl: "SF", rank: 125, points: 75.6, rookie: true },
  { id: 197, name: "Malik Davis", pos: "RB", nfl: "DAL", rank: 126, points: 71.1 },
  { id: 198, name: "Tank Bigsby", pos: "RB", nfl: "PHI", rank: 127, points: 67.3 },
  { id: 199, name: "Chris Brooks", pos: "RB", nfl: "GB", rank: 128, points: 66.9 },
  { id: 138, name: "Adam Randall", pos: "RB", nfl: "BAL", rank: 129, points: 66.0, rookie: true },
  { id: 200, name: "Emanuel Wilson", pos: "RB", nfl: "SEA", rank: 130, points: 65.7 },
  { id: 201, name: "James Conner", pos: "RB", nfl: "ARI", rank: 131, points: 61.6 },
  { id: 202, name: "Brashard Smith", pos: "RB", nfl: "KC", rank: 132, points: 59.2 },
  { id: 203, name: "Kyle Juszczyk", pos: "RB", nfl: "SF", rank: 133, points: 55.2 },
  { id: 204, name: "Keaton Mitchell", pos: "RB", nfl: "LAC", rank: 134, points: 52.2 },
  { id: 205, name: "Emari Demercado", pos: "RB", nfl: "KC", rank: 135, points: 51.0 },
  { id: 206, name: "Jawhar Jordan", pos: "RB", nfl: "HOU", rank: 136, points: 50.8 },
  { id: 207, name: "Jaylen Wright", pos: "RB", nfl: "MIA", rank: 137, points: 49.3 },
  { id: 208, name: "LeQuint Allen Jr.", pos: "RB", nfl: "JAX", rank: 138, points: 45.8 },
  { id: 209, name: "MarShawn Lloyd", pos: "RB", nfl: "GB", rank: 139, points: 43.2 },
  { id: 210, name: "Kendre Miller", pos: "RB", nfl: "NO", rank: 140, points: 40.6 },
  { id: 143, name: "Emmett Johnson", pos: "RB", nfl: "KC", rank: 141, points: 40.5, rookie: true },
  { id: 211, name: "Ty Chandler", pos: "RB", nfl: "NO", rank: 142, points: 38.1 },
  { id: 212, name: "Isaiah Davis", pos: "RB", nfl: "NYJ", rank: 143, points: 37.6 },
  { id: 213, name: "DJ Giddens", pos: "RB", nfl: "IND", rank: 144, points: 35.9 },
  { id: 214, name: "Ray Davis", pos: "RB", nfl: "BUF", rank: 145, points: 35.8 },
  { id: 215, name: "Jaydon Blue", pos: "RB", nfl: "DAL", rank: 146, points: 35.2 },
  { id: 216, name: "Frank Gore Jr.", pos: "RB", nfl: "BUF", rank: 147, points: 35.0 },
  { id: 217, name: "Roschon Johnson", pos: "RB", nfl: "CHI", rank: 148, points: 34.3 },
  { id: 218, name: "Phil Mafah", pos: "RB", nfl: "DAL", rank: 149, points: 33.6 },
  { id: 219, name: "Ollie Gordon II", pos: "RB", nfl: "MIA", rank: 150, points: 31.9 },
  { id: 220, name: "Tyler Badie", pos: "RB", nfl: "DEN", rank: 151, points: 31.7 },
  { id: 221, name: "Sean Tucker", pos: "RB", nfl: "TB", rank: 152, points: 30.1 },
  { id: 222, name: "Will Shipley", pos: "RB", nfl: "PHI", rank: 153, points: 27.5 },
  { id: 223, name: "Devin Singletary", pos: "RB", nfl: "NYG", rank: 154, points: 27.3 },
  { id: 224, name: "Jeremy McNichols", pos: "RB", nfl: "WAS", rank: 155, points: 27.2 },
  { id: 225, name: "Elijah Mitchell", pos: "RB", nfl: "PHI", rank: 156, points: 26.1 },
  { id: 226, name: "Jam Miller", pos: "RB", nfl: "NE", rank: 157, points: 26.1 },
  { id: 227, name: "Hunter Luepke", pos: "RB", nfl: "DAL", rank: 158, points: 25.0 },
  { id: 228, name: "Audric Estime", pos: "RB", nfl: "NO", rank: 159, points: 23.6 },
  { id: 147, name: "Demond Claiborne", pos: "RB", nfl: "MIN", rank: 160, points: 23.6, rookie: true },
  { id: 149, name: "Seth McGowan", pos: "RB", nfl: "IND", rank: 161, points: 23.2, rookie: true },
  { id: 150, name: "Jonah Coleman", pos: "RB", nfl: "DEN", rank: 162, points: 22.8, rookie: true },
  { id: 151, name: "Kaytron Allen", pos: "RB", nfl: "WAS", rank: 163, points: 21.5, rookie: true },
  { id: 62, name: "Stefon Diggs", pos: "WR", nfl: "NE", rank: 164, points: 180.0 },
  { id: 64, name: "Quentin Johnston", pos: "WR", nfl: "LAC", rank: 165, points: 176.8 },
  { id: 74, name: "Deebo Samuel Sr.", pos: "WR", nfl: "WAS", rank: 166, points: 176.0 },
  { id: 242, name: "Josh Downs", pos: "WR", nfl: "IND", rank: 167, points: 173.7 },
  { id: 243, name: "Jayden Reed", pos: "WR", nfl: "GB", rank: 168, points: 172.5 },
  { id: 99, name: "Khalil Shakir", pos: "WR", nfl: "BUF", rank: 169, points: 172.2 },
  { id: 245, name: "Romeo Doubs", pos: "WR", nfl: "NE", rank: 170, points: 167.7 },
  { id: 247, name: "Xavier Worthy", pos: "WR", nfl: "KC", rank: 171, points: 166.5 },
  { id: 92, name: "Keenan Allen", pos: "WR", nfl: "LAC", rank: 172, points: 166.0 },
  { id: 248, name: "Matthew Golden", pos: "WR", nfl: "GB", rank: 173, points: 157.1 },
  { id: 249, name: "John Metchie III", pos: "WR", nfl: "CAR", rank: 174, points: 153.9 },
  { id: 250, name: "Calvin Ridley", pos: "WR", nfl: "TEN", rank: 175, points: 150.5 },
  { id: 251, name: "Jalen Coker", pos: "WR", nfl: "CAR", rank: 176, points: 148.2 },
  { id: 128, name: "KC Concepcion", pos: "WR", nfl: "CLE", rank: 177, points: 145.4, rookie: true },
  { id: 253, name: "Jerry Jeudy", pos: "WR", nfl: "CLE", rank: 178, points: 145.2 },
  { id: 252, name: "Theo Wease Jr.", pos: "WR", nfl: "MIA", rank: 179, points: 145.2 },
  { id: 254, name: "Rashid Shaheed", pos: "WR", nfl: "SEA", rank: 180, points: 144.0 },
  { id: 255, name: "Tre Tucker", pos: "WR", nfl: "LV", rank: 181, points: 141.9 },
  { id: 256, name: "Tank Dell", pos: "WR", nfl: "HOU", rank: 182, points: 141.5 },
  { id: 129, name: "Omar Cooper Jr.", pos: "WR", nfl: "NYJ", rank: 183, points: 139.6, rookie: true },
  { id: 257, name: "Jayden Higgins", pos: "WR", nfl: "HOU", rank: 184, points: 138.1 },
  { id: 258, name: "Jalen McMillan", pos: "WR", nfl: "TB", rank: 185, points: 136.9 },
  { id: 77, name: "Jauan Jennings", pos: "WR", nfl: "MIN", rank: 186, points: 133.9 },
  { id: 259, name: "Rashod Bateman", pos: "WR", nfl: "BAL", rank: 187, points: 133.4 },
  { id: 130, name: "Denzel Boston", pos: "WR", nfl: "CLE", rank: 188, points: 130.5, rookie: true },
  { id: 131, name: "Antonio Williams", pos: "WR", nfl: "WAS", rank: 189, points: 126.1, rookie: true },
  { id: 260, name: "Jalen Nailor", pos: "WR", nfl: "LV", rank: 190, points: 125.7 },
  { id: 261, name: "Cooper Kupp", pos: "WR", nfl: "SEA", rank: 191, points: 125.0 },
  { id: 132, name: "Germie Bernard", pos: "WR", nfl: "PIT", rank: 192, points: 118.4, rookie: true },
  { id: 133, name: "Chris Bell", pos: "WR", nfl: "MIA", rank: 193, points: 113.9, rookie: true },
  { id: 262, name: "Travis Hunter", pos: "WR", nfl: "JAX", rank: 194, points: 111.7 },
  { id: 263, name: "Darnell Mooney", pos: "WR", nfl: "NYG", rank: 195, points: 107.1 },
  { id: 264, name: "Christian Kirk", pos: "WR", nfl: "SF", rank: 196, points: 107.0 },
  { id: 265, name: "Bub Means", pos: "WR", nfl: "NO", rank: 197, points: 106.4 },
  { id: 266, name: "Caleb Douglas", pos: "WR", nfl: "MIA", rank: 198, points: 104.6 },
  { id: 267, name: "Malik Washington", pos: "WR", nfl: "MIA", rank: 199, points: 103.2 },
  { id: 268, name: "Kayshon Boutte", pos: "WR", nfl: "NE", rank: 200, points: 100.5 },
  { id: 98, name: "Troy Franklin", pos: "WR", nfl: "DEN", rank: 201, points: 99.6 },
  { id: 269, name: "Jack Bech", pos: "WR", nfl: "LV", rank: 202, points: 99.5 },
  { id: 270, name: "Darius Slayton", pos: "WR", nfl: "NYG", rank: 203, points: 99.3 },
  { id: 134, name: "Ja'Kobi Lane", pos: "WR", nfl: "BAL", rank: 204, points: 96.5, rookie: true },
  { id: 271, name: "Nick Westbrook-Ikhine", pos: "WR", nfl: "IND", rank: 205, points: 95.1 },
  { id: 272, name: "Tory Horton", pos: "WR", nfl: "SEA", rank: 206, points: 94.3 },
  { id: 273, name: "Devaughn Vele", pos: "WR", nfl: "NO", rank: 207, points: 94.1 },
  { id: 135, name: "De'Zhaun Stribling", pos: "WR", nfl: "SF", rank: 208, points: 92.6, rookie: true },
  { id: 274, name: "Tyquan Thornton", pos: "WR", nfl: "KC", rank: 209, points: 92.3 },
  { id: 276, name: "Hollywood Brown", pos: "WR", nfl: "PHI", rank: 210, points: 89.5 },
  { id: 275, name: "Ryan Flournoy", pos: "WR", nfl: "DAL", rank: 211, points: 89.5 },
  { id: 277, name: "Tre' Harris", pos: "WR", nfl: "LAC", rank: 212, points: 89.3 },
  { id: 278, name: "Andrei Iosivas", pos: "WR", nfl: "CIN", rank: 213, points: 89.0 },
  { id: 279, name: "Olamide Zaccheaus", pos: "WR", nfl: "ATL", rank: 214, points: 86.0 },
  { id: 280, name: "Isaac TeSlaa", pos: "WR", nfl: "DET", rank: 215, points: 85.1 },
  { id: 281, name: "Dyami Brown", pos: "WR", nfl: "WAS", rank: 216, points: 84.9 },
  { id: 282, name: "Jahan Dotson", pos: "WR", nfl: "ATL", rank: 217, points: 84.1 },
  { id: 283, name: "Ted Hurst III", pos: "WR", nfl: "TB", rank: 218, points: 82.7 },
  { id: 284, name: "Adonai Mitchell", pos: "WR", nfl: "NYJ", rank: 219, points: 79.5 },
  { id: 285, name: "Dontayvion Wicks", pos: "WR", nfl: "PHI", rank: 220, points: 76.7 },
  { id: 286, name: "Van Jefferson", pos: "WR", nfl: "WAS", rank: 221, points: 74.9 },
  { id: 287, name: "Jalen Tolbert", pos: "WR", nfl: "MIA", rank: 222, points: 74.5 },
  { id: 288, name: "Ashton Dulin", pos: "WR", nfl: "IND", rank: 223, points: 74.1 },
  { id: 289, name: "Xavier Hutchinson", pos: "WR", nfl: "HOU", rank: 224, points: 72.8 },
  { id: 290, name: "Chimere Dike", pos: "WR", nfl: "TEN", rank: 225, points: 72.6 },
  { id: 291, name: "Pat Bryant", pos: "WR", nfl: "DEN", rank: 226, points: 72.5 },
  { id: 292, name: "Xavier Legette", pos: "WR", nfl: "CAR", rank: 227, points: 70.7 },
  { id: 293, name: "Joshua Palmer", pos: "WR", nfl: "BUF", rank: 228, points: 69.3 },
  { id: 294, name: "Savion Williams", pos: "WR", nfl: "GB", rank: 229, points: 69.0 },
  { id: 295, name: "Keon Coleman", pos: "WR", nfl: "BUF", rank: 230, points: 68.5 },
  { id: 296, name: "Marvin Mims Jr.", pos: "WR", nfl: "DEN", rank: 231, points: 66.8 },
  { id: 297, name: "Elic Ayomanor", pos: "WR", nfl: "TEN", rank: 232, points: 65.8 },
  { id: 298, name: "Kalif Raymond", pos: "WR", nfl: "CHI", rank: 233, points: 63.8 },
  { id: 299, name: "KaVontae Turpin", pos: "WR", nfl: "DAL", rank: 234, points: 63.7 },
  { id: 300, name: "Cedric Tillman", pos: "WR", nfl: "CLE", rank: 235, points: 61.9 },
  { id: 302, name: "Calvin Austin III", pos: "WR", nfl: "NYG", rank: 236, points: 61.3 },
  { id: 301, name: "DeMario Douglas", pos: "WR", nfl: "NE", rank: 237, points: 61.3 },
  { id: 303, name: "Jaylin Lane", pos: "WR", nfl: "WAS", rank: 238, points: 61.2 },
  { id: 139, name: "Chris Brazzell II", pos: "WR", nfl: "CAR", rank: 239, points: 60.8, rookie: true },
  { id: 304, name: "Jahdae Walker", pos: "WR", nfl: "CHI", rank: 240, points: 60.3 },
  { id: 140, name: "Elijah Sarratt", pos: "WR", nfl: "BAL", rank: 241, points: 59.2, rookie: true },
  { id: 305, name: "Jaylin Noel", pos: "WR", nfl: "HOU", rank: 242, points: 56.3 },
  { id: 306, name: "Tutu Atwell", pos: "WR", nfl: "MIA", rank: 243, points: 53.6 },
  { id: 142, name: "Zachariah Branch", pos: "WR", nfl: "ATL", rank: 244, points: 53.4, rookie: true },
  { id: 307, name: "Demarcus Robinson", pos: "WR", nfl: "SF", rank: 245, points: 53.0 },
  { id: 308, name: "Kendrick Bourne", pos: "WR", nfl: "ARI", rank: 246, points: 50.3 },
  { id: 144, name: "Malachi Fields", pos: "WR", nfl: "NYG", rank: 247, points: 34.1, rookie: true },
  { id: 145, name: "Skyler Bell", pos: "WR", nfl: "BUF", rank: 248, points: 33.9, rookie: true },
  { id: 146, name: "Brenen Thompson", pos: "WR", nfl: "LAC", rank: 249, points: 27.3, rookie: true },
  { id: 63, name: "Dallas Goedert", pos: "TE", nfl: "PHI", rank: 250, points: 190.7 },
  { id: 80, name: "Travis Kelce", pos: "TE", nfl: "KC", rank: 251, points: 185.4 },
  { id: 312, name: "George Kittle", pos: "TE", nfl: "SF", rank: 252, points: 180.9 },
  { id: 87, name: "Jake Ferguson", pos: "TE", nfl: "DAL", rank: 253, points: 172.7 },
  { id: 315, name: "Dalton Kincaid", pos: "TE", nfl: "BUF", rank: 254, points: 166.0 },
  { id: 316, name: "Mark Andrews", pos: "TE", nfl: "BAL", rank: 255, points: 163.7 },
  { id: 317, name: "Brenton Strange", pos: "TE", nfl: "JAX", rank: 256, points: 161.2 },
  { id: 94, name: "Juwan Johnson", pos: "TE", nfl: "NO", rank: 257, points: 159.5 },
  { id: 95, name: "Hunter Henry", pos: "TE", nfl: "NE", rank: 258, points: 156.8 },
  { id: 96, name: "Dalton Schultz", pos: "TE", nfl: "HOU", rank: 259, points: 149.0 },
  { id: 127, name: "Kenyon Sadiq", pos: "TE", nfl: "NYJ", rank: 260, points: 147.4, rookie: true },
  { id: 318, name: "T.J. Hockenson", pos: "TE", nfl: "MIN", rank: 261, points: 143.6 },
  { id: 319, name: "Cade Otton", pos: "TE", nfl: "TB", rank: 262, points: 136.0 },
  { id: 320, name: "Pat Freiermuth", pos: "TE", nfl: "PIT", rank: 263, points: 131.7 },
  { id: 321, name: "Greg Dulcich", pos: "TE", nfl: "MIA", rank: 264, points: 128.4 },
  { id: 322, name: "Chig Okonkwo", pos: "TE", nfl: "WAS", rank: 265, points: 125.3 },
  { id: 323, name: "Oronde Gadsden II", pos: "TE", nfl: "LAC", rank: 266, points: 124.8 },
  { id: 324, name: "AJ Barner", pos: "TE", nfl: "SEA", rank: 267, points: 122.5 },
  { id: 325, name: "Mike Gesicki", pos: "TE", nfl: "CIN", rank: 268, points: 113.8 },
  { id: 326, name: "Evan Engram", pos: "TE", nfl: "DEN", rank: 269, points: 113.6 },
  { id: 327, name: "Terrance Ferguson", pos: "TE", nfl: "LAR", rank: 270, points: 111.7 },
  { id: 328, name: "Gunnar Helm", pos: "TE", nfl: "TEN", rank: 271, points: 110.9 },
  { id: 329, name: "David Njoku", pos: "TE", nfl: "LAC", rank: 272, points: 101.5 },
  { id: 330, name: "Colby Parkinson", pos: "TE", nfl: "LAR", rank: 273, points: 95.9 },
  { id: 331, name: "Mason Taylor", pos: "TE", nfl: "NYJ", rank: 274, points: 91.6 },
  { id: 332, name: "Michael Mayer", pos: "TE", nfl: "LV", rank: 275, points: 83.7 },
  { id: 333, name: "Theo Johnson", pos: "TE", nfl: "NYG", rank: 276, points: 82.6 },
  { id: 334, name: "Dawson Knox", pos: "TE", nfl: "BUF", rank: 277, points: 80.0 },
  { id: 335, name: "Darnell Washington", pos: "TE", nfl: "PIT", rank: 278, points: 77.9 },
  { id: 336, name: "Tyler Higbee", pos: "TE", nfl: "LAR", rank: 279, points: 76.0 },
  { id: 337, name: "Ja'Tavion Sanders", pos: "TE", nfl: "CAR", rank: 280, points: 71.1 },
  { id: 338, name: "Noah Fant", pos: "TE", nfl: "NO", rank: 281, points: 68.0 },
  { id: 339, name: "Tommy Tremble", pos: "TE", nfl: "CAR", rank: 282, points: 64.4 },
  { id: 340, name: "Will Kacmarek", pos: "TE", nfl: "MIA", rank: 283, points: 61.9 },
  { id: 341, name: "Elijah Arroyo", pos: "TE", nfl: "SEA", rank: 284, points: 60.4 },
  { id: 342, name: "Erick All Jr.", pos: "TE", nfl: "CIN", rank: 285, points: 58.5 },
  { id: 343, name: "Austin Hooper", pos: "TE", nfl: "ATL", rank: 286, points: 54.4 },
  { id: 344, name: "Cole Kmet", pos: "TE", nfl: "CHI", rank: 287, points: 54.2 },
  { id: 345, name: "Josh Oliver", pos: "TE", nfl: "MIN", rank: 288, points: 54.2 },
  { id: 141, name: "Eli Stowers", pos: "TE", nfl: "PHI", rank: 289, points: 53.8, rookie: true },
  { id: 346, name: "Brock Wright", pos: "TE", nfl: "DET", rank: 290, points: 50.7 },
  { id: 347, name: "Daniel Bellinger", pos: "TE", nfl: "TEN", rank: 291, points: 50.5 },
  { id: 348, name: "Charlie Kolar", pos: "TE", nfl: "LAC", rank: 292, points: 50.1 },
  { id: 349, name: "Ben Sims", pos: "TE", nfl: "MIA", rank: 293, points: 48.8 },
  { id: 350, name: "Luke Musgrave", pos: "TE", nfl: "GB", rank: 294, points: 48.5 },
  { id: 351, name: "Adam Trautman", pos: "TE", nfl: "DEN", rank: 295, points: 47.6 },
  { id: 154, name: "Brock Purdy", pos: "QB", nfl: "SF", rank: 296, points: 311.7 },
  { id: 10, name: "Patrick Mahomes", pos: "QB", nfl: "KC", rank: 297, points: 307.4 },
  { id: 9, name: "Matthew Stafford", pos: "QB", nfl: "LAR", rank: 298, points: 296.2 },
  { id: 19, name: "Bo Nix", pos: "QB", nfl: "DEN", rank: 299, points: 293.6 },
  { id: 31, name: "Baker Mayfield", pos: "QB", nfl: "TB", rank: 300, points: 290.7 },
  { id: 23, name: "Daniel Jones", pos: "QB", nfl: "IND", rank: 301, points: 290.0 },
  { id: 22, name: "Jared Goff", pos: "QB", nfl: "DET", rank: 302, points: 284.0 },
  { id: 155, name: "Tyler Shough", pos: "QB", nfl: "NO", rank: 303, points: 281.7, rookie: true },
  { id: 156, name: "Malik Willis", pos: "QB", nfl: "MIA", rank: 304, points: 274.2, rookie: true },
  { id: 157, name: "Kyler Murray", pos: "QB", nfl: "MIN", rank: 305, points: 272.9 },
  { id: 39, name: "C.J. Stroud", pos: "QB", nfl: "HOU", rank: 306, points: 268.5 },
  { id: 34, name: "Jordan Love", pos: "QB", nfl: "GB", rank: 307, points: 267.9 },
  { id: 48, name: "Sam Darnold", pos: "QB", nfl: "SEA", rank: 308, points: 267.4 },
  { id: 49, name: "Bryce Young", pos: "QB", nfl: "CAR", rank: 309, points: 241.8 },
  { id: 30, name: "Jacoby Brissett", pos: "QB", nfl: "ARI", rank: 310, points: 235.7 },
  { id: 76, name: "Geno Smith", pos: "QB", nfl: "NYJ", rank: 311, points: 233.9 },
  { id: 89, name: "Cam Ward", pos: "QB", nfl: "TEN", rank: 312, points: 227.5 },
  { id: 46, name: "Aaron Rodgers", pos: "QB", nfl: "PIT", rank: 313, points: 221.1 },
  { id: 126, name: "Fernando Mendoza", pos: "QB", nfl: "LV", rank: 314, points: 193.3, rookie: true },
  { id: 158, name: "Deshaun Watson", pos: "QB", nfl: "CLE", rank: 315, points: 184.9 },
  { id: 79, name: "Tua Tagovailoa", pos: "QB", nfl: "ATL", rank: 316, points: 173.3 },
  { id: 159, name: "Michael Penix Jr.", pos: "QB", nfl: "ATL", rank: 317, points: 78.8 },
  { id: 160, name: "Shedeur Sanders", pos: "QB", nfl: "CLE", rank: 318, points: 55.5 },
  { id: 161, name: "Kirk Cousins", pos: "QB", nfl: "LV", rank: 319, points: 45.1 },
  { id: 162, name: "J.J. McCarthy", pos: "QB", nfl: "MIN", rank: 320, points: 26.0 },
  { id: 148, name: "Ty Simpson", pos: "QB", nfl: "LAR", rank: 321, points: 23.4, rookie: true },
  { id: 163, name: "Carson Beck", pos: "QB", nfl: "ARI", rank: 322, points: 19.7 },
  { id: 164, name: "Marcus Mariota", pos: "QB", nfl: "WAS", rank: 323, points: 18.1 },
  { id: 165, name: "Joe Milton III", pos: "QB", nfl: "DAL", rank: 324, points: 12.2 },
  { id: 166, name: "Shane Buechele", pos: "QB", nfl: "BUF", rank: 325, points: 12.0 },
  { id: 167, name: "Jarrett Stidham", pos: "QB", nfl: "DEN", rank: 326, points: 11.2 },
  { id: 84, name: "Joe Flacco", pos: "QB", nfl: "CIN", rank: 327, points: 10.3 },
  { id: 85, name: "Jason Myers", pos: "K", nfl: "SEA", rank: 328, points: 154.4 },
  { id: 97, name: "Brandon Aubrey", pos: "K", nfl: "DAL", rank: 329, points: 153.2 },
  { id: 72, name: "Ka'imi Fairbairn", pos: "K", nfl: "HOU", rank: 330, points: 147.9 },
  { id: 102, name: "Cameron Dicker", pos: "K", nfl: "LAC", rank: 331, points: 143.6 },
  { id: 352, name: "Harrison Mevis", pos: "K", nfl: "LAR", rank: 332, points: 143.3 },
  { id: 353, name: "Jake Bates", pos: "K", nfl: "DET", rank: 333, points: 139.3 },
  { id: 354, name: "Nick Folk", pos: "K", nfl: "ATL", rank: 334, points: 138.0 },
  { id: 355, name: "Cairo Santos", pos: "K", nfl: "CHI", rank: 335, points: 135.8 },
  { id: 104, name: "Eddy Pineiro", pos: "K", nfl: "SF", rank: 336, points: 134.2 },
  { id: 356, name: "Chase McLaughlin", pos: "K", nfl: "TB", rank: 337, points: 134.1 },
  { id: 105, name: "Tyler Loop", pos: "K", nfl: "BAL", rank: 338, points: 134.1 },
  { id: 357, name: "Harrison Butker", pos: "K", nfl: "KC", rank: 339, points: 133.7 },
  { id: 358, name: "Will Reichard", pos: "K", nfl: "MIN", rank: 340, points: 133.5 },
  { id: 359, name: "Evan McPherson", pos: "K", nfl: "CIN", rank: 341, points: 132.7 },
  { id: 360, name: "Cam Little", pos: "K", nfl: "JAX", rank: 342, points: 131.1 },
  { id: 361, name: "Wil Lutz", pos: "K", nfl: "DEN", rank: 343, points: 128.3 },
  { id: 362, name: "Trey Smack", pos: "K", nfl: "GB", rank: 344, points: 126.3 },
  { id: 363, name: "Charlie Smyth", pos: "K", nfl: "NO", rank: 345, points: 125.1 },
  { id: 364, name: "Tyler Bass", pos: "K", nfl: "BUF", rank: 346, points: 124.4 },
  { id: 365, name: "Jake Moody", pos: "K", nfl: "WAS", rank: 347, points: 122.3 },
  { id: 106, name: "Andy Borregales", pos: "K", nfl: "NE", rank: 348, points: 121.5 },
  { id: 103, name: "Chris Boswell", pos: "K", nfl: "PIT", rank: 349, points: 120.4 },
  { id: 101, name: "Houston Texans", pos: "DST", nfl: "HOU", rank: 350, points: 120.8 },
  { id: 107, name: "Denver Broncos", pos: "DST", nfl: "DEN", rank: 351, points: 119.2 },
  { id: 112, name: "Minnesota Vikings", pos: "DST", nfl: "MIN", rank: 352, points: 113.8 },
  { id: 115, name: "Pittsburgh Steelers", pos: "DST", nfl: "PIT", rank: 353, points: 113.0 },
  { id: 119, name: "Detroit Lions", pos: "DST", nfl: "DET", rank: 354, points: 112.6 },
  { id: 100, name: "Seattle Seahawks", pos: "DST", nfl: "SEA", rank: 355, points: 112.5 },
  { id: 366, name: "Atlanta Falcons", pos: "DST", nfl: "FA", rank: 356, points: 110.8 },
  { id: 367, name: "Los Angeles Chargers", pos: "DST", nfl: "FA", rank: 357, points: 110.7 },
  { id: 110, name: "Los Angeles Rams", pos: "DST", nfl: "LAR", rank: 358, points: 110.4 },
  { id: 109, name: "Chicago Bears", pos: "DST", nfl: "CHI", rank: 359, points: 108.7 },
  { id: 114, name: "Baltimore Ravens", pos: "DST", nfl: "BAL", rank: 360, points: 106.4 },
  { id: 113, name: "Buffalo Bills", pos: "DST", nfl: "BUF", rank: 361, points: 105.6 },
  { id: 111, name: "Philadelphia Eagles", pos: "DST", nfl: "PHI", rank: 362, points: 104.8 },
  { id: 368, name: "New Orleans Saints", pos: "DST", nfl: "FA", rank: 363, points: 104.5 },
  { id: 369, name: "Tennessee Titans", pos: "DST", nfl: "FA", rank: 364, points: 103.5 },
  { id: 120, name: "Cleveland Browns", pos: "DST", nfl: "CLE", rank: 365, points: 103.2 },
  { id: 108, name: "New England Patriots", pos: "DST", nfl: "NE", rank: 366, points: 103.2 },
  { id: 370, name: "Cincinnati Bengals", pos: "DST", nfl: "FA", rank: 367, points: 102.3 },
  { id: 371, name: "Washington Commanders", pos: "DST", nfl: "FA", rank: 368, points: 101.2 },
  { id: 372, name: "Miami Dolphins", pos: "DST", nfl: "FA", rank: 369, points: 100.2 },
  { id: 373, name: "Jacksonville Jaguars", pos: "DST", nfl: "FA", rank: 370, points: 99.2 },
  { id: 374, name: "Tampa Bay Buccaneers", pos: "DST", nfl: "FA", rank: 371, points: 98.9 },
  { id: 117, name: "Green Bay Packers", pos: "DST", nfl: "GB", rank: 372, points: 98.4 },
  { id: 375, name: "Las Vegas Raiders", pos: "DST", nfl: "FA", rank: 373, points: 97.9 },
  { id: 118, name: "Kansas City Chiefs", pos: "DST", nfl: "KC", rank: 374, points: 97.5 },
  { id: 116, name: "San Francisco 49ers", pos: "DST", nfl: "SF", rank: 375, points: 92.7 }
];

const teamSchedule2026 = {
  "ARI": [
    {
      "week": 1,
      "date": "2026-09-13",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "@",
      "opponent": "LAC"
    },
    {
      "week": 2,
      "date": "2026-09-20",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "vs",
      "opponent": "SEA"
    },
    {
      "week": 3,
      "date": "2026-09-27",
      "weekday": "Sunday",
      "time": "16:05",
      "site": "@",
      "opponent": "SF"
    },
    {
      "week": 4,
      "date": "2026-10-04",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "NYG"
    },
    {
      "week": 5,
      "date": "2026-10-11",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "vs",
      "opponent": "DET"
    },
    {
      "week": 6,
      "date": "2026-10-18",
      "weekday": "Sunday",
      "time": "16:05",
      "site": "@",
      "opponent": "LAR"
    },
    {
      "week": 7,
      "date": "2026-10-25",
      "weekday": "Sunday",
      "time": "16:05",
      "site": "vs",
      "opponent": "DEN"
    },
    {
      "week": 8,
      "date": "2026-11-01",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "DAL"
    },
    {
      "week": 9,
      "date": "2026-11-08",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "@",
      "opponent": "SEA"
    },
    {
      "week": 10,
      "date": "2026-11-15",
      "weekday": "Sunday",
      "time": "16:05",
      "site": "vs",
      "opponent": "LAR"
    },
    {
      "week": 11,
      "date": "2026-11-22",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "KC"
    },
    {
      "week": 12,
      "date": "2026-11-29",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "vs",
      "opponent": "WAS"
    },
    {
      "week": 13,
      "date": "2026-12-06",
      "weekday": "Sunday",
      "time": "16:05",
      "site": "vs",
      "opponent": "PHI"
    },
    {
      "week": 14,
      "bye": true
    },
    {
      "week": 15,
      "date": "2026-12-20",
      "weekday": "Sunday",
      "time": "16:05",
      "site": "vs",
      "opponent": "NYJ"
    },
    {
      "week": 16,
      "date": "2026-12-27",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "NO"
    },
    {
      "week": 17,
      "date": "2027-01-03",
      "weekday": "Sunday",
      "time": "16:05",
      "site": "vs",
      "opponent": "LV"
    },
    {
      "week": 18,
      "date": "2027-01-10",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "SF"
    }
  ],
  "ATL": [
    {
      "week": 1,
      "date": "2026-09-13",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "PIT"
    },
    {
      "week": 2,
      "date": "2026-09-20",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "CAR"
    },
    {
      "week": 3,
      "date": "2026-09-24",
      "weekday": "Thursday",
      "time": "20:15",
      "site": "@",
      "opponent": "GB"
    },
    {
      "week": 4,
      "date": "2026-10-05",
      "weekday": "Monday",
      "time": "20:15",
      "site": "@",
      "opponent": "NO"
    },
    {
      "week": 5,
      "date": "2026-10-11",
      "weekday": "Sunday",
      "time": "20:20",
      "site": "vs",
      "opponent": "BAL"
    },
    {
      "week": 6,
      "date": "2026-10-18",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "CHI"
    },
    {
      "week": 7,
      "date": "2026-10-25",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "SF"
    },
    {
      "week": 8,
      "date": "2026-11-01",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "TB"
    },
    {
      "week": 9,
      "date": "2026-11-08",
      "weekday": "Sunday",
      "time": "09:30",
      "site": "vs",
      "opponent": "CIN"
    },
    {
      "week": 10,
      "date": "2026-11-15",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "KC"
    },
    {
      "week": 11,
      "bye": true
    },
    {
      "week": 12,
      "date": "2026-11-29",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "MIN"
    },
    {
      "week": 13,
      "date": "2026-12-06",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "DET"
    },
    {
      "week": 14,
      "date": "2026-12-13",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "CLE"
    },
    {
      "week": 15,
      "date": "2026-12-20",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "WAS"
    },
    {
      "week": 16,
      "date": "2026-12-27",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "TB"
    },
    {
      "week": 17,
      "date": "2027-01-03",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "NO"
    },
    {
      "week": 18,
      "date": "2027-01-10",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "CAR"
    }
  ],
  "BAL": [
    {
      "week": 1,
      "date": "2026-09-13",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "IND"
    },
    {
      "week": 2,
      "date": "2026-09-20",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "NO"
    },
    {
      "week": 3,
      "date": "2026-09-27",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "@",
      "opponent": "DAL"
    },
    {
      "week": 4,
      "date": "2026-10-04",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "TEN"
    },
    {
      "week": 5,
      "date": "2026-10-11",
      "weekday": "Sunday",
      "time": "20:20",
      "site": "@",
      "opponent": "ATL"
    },
    {
      "week": 6,
      "date": "2026-10-18",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "CLE"
    },
    {
      "week": 7,
      "date": "2026-10-25",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "CIN"
    },
    {
      "week": 8,
      "date": "2026-11-01",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "BUF"
    },
    {
      "week": 9,
      "date": "2026-11-05",
      "weekday": "Thursday",
      "time": "20:15",
      "site": "vs",
      "opponent": "JAX"
    },
    {
      "week": 10,
      "date": "2026-11-16",
      "weekday": "Monday",
      "time": "20:15",
      "site": "vs",
      "opponent": "LAC"
    },
    {
      "week": 11,
      "date": "2026-11-22",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "CAR"
    },
    {
      "week": 12,
      "date": "2026-11-29",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "HOU"
    },
    {
      "week": 13,
      "bye": true
    },
    {
      "week": 14,
      "date": "2026-12-13",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "TB"
    },
    {
      "week": 15,
      "date": "2026-12-20",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "PIT"
    },
    {
      "week": 16,
      "date": "2026-12-27",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "CLE"
    },
    {
      "week": 17,
      "date": "2026-12-31",
      "weekday": "Thursday",
      "time": "20:15",
      "site": "@",
      "opponent": "CIN"
    },
    {
      "week": 18,
      "date": "2027-01-10",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "PIT"
    }
  ],
  "BUF": [
    {
      "week": 1,
      "date": "2026-09-13",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "HOU"
    },
    {
      "week": 2,
      "date": "2026-09-17",
      "weekday": "Thursday",
      "time": "20:15",
      "site": "vs",
      "opponent": "DET"
    },
    {
      "week": 3,
      "date": "2026-09-27",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "LAC"
    },
    {
      "week": 4,
      "date": "2026-10-04",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "NE"
    },
    {
      "week": 5,
      "date": "2026-10-12",
      "weekday": "Monday",
      "time": "20:15",
      "site": "@",
      "opponent": "LAR"
    },
    {
      "week": 6,
      "date": "2026-10-18",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "@",
      "opponent": "LV"
    },
    {
      "week": 7,
      "bye": true
    },
    {
      "week": 8,
      "date": "2026-11-01",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "BAL"
    },
    {
      "week": 9,
      "date": "2026-11-09",
      "weekday": "Monday",
      "time": "20:15",
      "site": "@",
      "opponent": "MIN"
    },
    {
      "week": 10,
      "date": "2026-11-15",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "NYJ"
    },
    {
      "week": 11,
      "date": "2026-11-22",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "MIA"
    },
    {
      "week": 12,
      "date": "2026-11-26",
      "weekday": "Thursday",
      "time": "20:20",
      "site": "vs",
      "opponent": "KC"
    },
    {
      "week": 13,
      "date": "2026-12-06",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "@",
      "opponent": "NE"
    },
    {
      "week": 14,
      "date": "2026-12-13",
      "weekday": "Sunday",
      "time": "20:20",
      "site": "@",
      "opponent": "GB"
    },
    {
      "week": 15,
      "date": "2026-12-19",
      "weekday": "Saturday",
      "time": "20:20",
      "site": "vs",
      "opponent": "CHI"
    },
    {
      "week": 16,
      "date": "2026-12-25",
      "weekday": "Friday",
      "time": "16:30",
      "site": "@",
      "opponent": "DEN"
    },
    {
      "week": 17,
      "date": "2027-01-03",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "MIA"
    },
    {
      "week": 18,
      "date": "2027-01-10",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "NYJ"
    }
  ],
  "CAR": [
    {
      "week": 1,
      "date": "2026-09-13",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "CHI"
    },
    {
      "week": 2,
      "date": "2026-09-20",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "ATL"
    },
    {
      "week": 3,
      "date": "2026-09-27",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "CLE"
    },
    {
      "week": 4,
      "date": "2026-10-04",
      "weekday": "Sunday",
      "time": "20:20",
      "site": "vs",
      "opponent": "DET"
    },
    {
      "week": 5,
      "bye": true
    },
    {
      "week": 6,
      "date": "2026-10-18",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "PHI"
    },
    {
      "week": 7,
      "date": "2026-10-25",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "TB"
    },
    {
      "week": 8,
      "date": "2026-10-29",
      "weekday": "Thursday",
      "time": "20:15",
      "site": "@",
      "opponent": "GB"
    },
    {
      "week": 9,
      "date": "2026-11-08",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "DEN"
    },
    {
      "week": 10,
      "date": "2026-11-15",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "NO"
    },
    {
      "week": 11,
      "date": "2026-11-22",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "BAL"
    },
    {
      "week": 12,
      "date": "2026-11-30",
      "weekday": "Monday",
      "time": "20:15",
      "site": "@",
      "opponent": "TB"
    },
    {
      "week": 13,
      "date": "2026-12-06",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "@",
      "opponent": "MIN"
    },
    {
      "week": 14,
      "date": "2026-12-13",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "NO"
    },
    {
      "week": 15,
      "date": "2026-12-20",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "CIN"
    },
    {
      "week": 16,
      "date": "2026-12-27",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "PIT"
    },
    {
      "week": 17,
      "date": "2027-01-03",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "SEA"
    },
    {
      "week": 18,
      "date": "2027-01-10",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "ATL"
    }
  ],
  "CHI": [
    {
      "week": 1,
      "date": "2026-09-13",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "CAR"
    },
    {
      "week": 2,
      "date": "2026-09-20",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "MIN"
    },
    {
      "week": 3,
      "date": "2026-09-28",
      "weekday": "Monday",
      "time": "20:15",
      "site": "vs",
      "opponent": "PHI"
    },
    {
      "week": 4,
      "date": "2026-10-04",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "NYJ"
    },
    {
      "week": 5,
      "date": "2026-10-11",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "@",
      "opponent": "GB"
    },
    {
      "week": 6,
      "date": "2026-10-18",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "ATL"
    },
    {
      "week": 7,
      "date": "2026-10-22",
      "weekday": "Thursday",
      "time": "20:15",
      "site": "vs",
      "opponent": "NE"
    },
    {
      "week": 8,
      "date": "2026-11-02",
      "weekday": "Monday",
      "time": "20:15",
      "site": "@",
      "opponent": "SEA"
    },
    {
      "week": 9,
      "date": "2026-11-08",
      "weekday": "Sunday",
      "time": "20:20",
      "site": "vs",
      "opponent": "TB"
    },
    {
      "week": 10,
      "bye": true
    },
    {
      "week": 11,
      "date": "2026-11-22",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "NO"
    },
    {
      "week": 12,
      "date": "2026-11-26",
      "weekday": "Thursday",
      "time": "13:00",
      "site": "@",
      "opponent": "DET"
    },
    {
      "week": 13,
      "date": "2026-12-06",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "JAX"
    },
    {
      "week": 14,
      "date": "2026-12-13",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "MIA"
    },
    {
      "week": 15,
      "date": "2026-12-19",
      "weekday": "Saturday",
      "time": "20:20",
      "site": "@",
      "opponent": "BUF"
    },
    {
      "week": 16,
      "date": "2026-12-25",
      "weekday": "Friday",
      "time": "13:00",
      "site": "vs",
      "opponent": "GB"
    },
    {
      "week": 17,
      "date": "2027-01-03",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "vs",
      "opponent": "DET"
    },
    {
      "week": 18,
      "date": "2027-01-10",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "MIN"
    }
  ],
  "CIN": [
    {
      "week": 1,
      "date": "2026-09-13",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "TB"
    },
    {
      "week": 2,
      "date": "2026-09-20",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "HOU"
    },
    {
      "week": 3,
      "date": "2026-09-27",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "PIT"
    },
    {
      "week": 4,
      "date": "2026-10-04",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "JAX"
    },
    {
      "week": 5,
      "date": "2026-10-11",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "MIA"
    },
    {
      "week": 6,
      "bye": true
    },
    {
      "week": 7,
      "date": "2026-10-25",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "BAL"
    },
    {
      "week": 8,
      "date": "2026-11-01",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "TEN"
    },
    {
      "week": 9,
      "date": "2026-11-08",
      "weekday": "Sunday",
      "time": "09:30",
      "site": "@",
      "opponent": "ATL"
    },
    {
      "week": 10,
      "date": "2026-11-15",
      "weekday": "Sunday",
      "time": "20:20",
      "site": "vs",
      "opponent": "PIT"
    },
    {
      "week": 11,
      "date": "2026-11-23",
      "weekday": "Monday",
      "time": "20:15",
      "site": "@",
      "opponent": "WAS"
    },
    {
      "week": 12,
      "date": "2026-11-29",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "NO"
    },
    {
      "week": 13,
      "date": "2026-12-06",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "CLE"
    },
    {
      "week": 14,
      "date": "2026-12-13",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "vs",
      "opponent": "KC"
    },
    {
      "week": 15,
      "date": "2026-12-20",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "CAR"
    },
    {
      "week": 16,
      "date": "2026-12-27",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "IND"
    },
    {
      "week": 17,
      "date": "2026-12-31",
      "weekday": "Thursday",
      "time": "20:15",
      "site": "vs",
      "opponent": "BAL"
    },
    {
      "week": 18,
      "date": "2027-01-10",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "CLE"
    }
  ],
  "CLE": [
    {
      "week": 1,
      "date": "2026-09-13",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "JAX"
    },
    {
      "week": 2,
      "date": "2026-09-20",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "TB"
    },
    {
      "week": 3,
      "date": "2026-09-27",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "CAR"
    },
    {
      "week": 4,
      "date": "2026-10-01",
      "weekday": "Thursday",
      "time": "20:15",
      "site": "vs",
      "opponent": "PIT"
    },
    {
      "week": 5,
      "date": "2026-10-11",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "NYJ"
    },
    {
      "week": 6,
      "date": "2026-10-18",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "BAL"
    },
    {
      "week": 7,
      "date": "2026-10-25",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "TEN"
    },
    {
      "week": 8,
      "date": "2026-11-01",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "PIT"
    },
    {
      "week": 9,
      "date": "2026-11-08",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "NO"
    },
    {
      "week": 10,
      "date": "2026-11-15",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "HOU"
    },
    {
      "week": 11,
      "bye": true
    },
    {
      "week": 12,
      "date": "2026-11-29",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "LV"
    },
    {
      "week": 13,
      "date": "2026-12-06",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "CIN"
    },
    {
      "week": 14,
      "date": "2026-12-13",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "ATL"
    },
    {
      "week": 15,
      "date": "2026-12-20",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "NYG"
    },
    {
      "week": 16,
      "date": "2026-12-27",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "BAL"
    },
    {
      "week": 17,
      "date": "2027-01-03",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "IND"
    },
    {
      "week": 18,
      "date": "2027-01-10",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "CIN"
    }
  ],
  "DAL": [
    {
      "week": 1,
      "date": "2026-09-13",
      "weekday": "Sunday",
      "time": "20:20",
      "site": "@",
      "opponent": "NYG"
    },
    {
      "week": 2,
      "date": "2026-09-20",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "vs",
      "opponent": "WAS"
    },
    {
      "week": 3,
      "date": "2026-09-27",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "vs",
      "opponent": "BAL"
    },
    {
      "week": 4,
      "date": "2026-10-04",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "HOU"
    },
    {
      "week": 5,
      "date": "2026-10-08",
      "weekday": "Thursday",
      "time": "20:15",
      "site": "vs",
      "opponent": "TB"
    },
    {
      "week": 6,
      "date": "2026-10-18",
      "weekday": "Sunday",
      "time": "20:20",
      "site": "@",
      "opponent": "GB"
    },
    {
      "week": 7,
      "date": "2026-10-26",
      "weekday": "Monday",
      "time": "20:15",
      "site": "@",
      "opponent": "PHI"
    },
    {
      "week": 8,
      "date": "2026-11-01",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "ARI"
    },
    {
      "week": 9,
      "date": "2026-11-08",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "IND"
    },
    {
      "week": 10,
      "date": "2026-11-15",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "vs",
      "opponent": "SF"
    },
    {
      "week": 11,
      "date": "2026-11-22",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "TEN"
    },
    {
      "week": 12,
      "date": "2026-11-26",
      "weekday": "Thursday",
      "time": "16:30",
      "site": "vs",
      "opponent": "PHI"
    },
    {
      "week": 13,
      "date": "2026-12-07",
      "weekday": "Monday",
      "time": "20:15",
      "site": "@",
      "opponent": "SEA"
    },
    {
      "week": 14,
      "bye": true
    },
    {
      "week": 15,
      "date": "2026-12-20",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "@",
      "opponent": "LAR"
    },
    {
      "week": 16,
      "date": "2026-12-27",
      "weekday": "Sunday",
      "time": "20:20",
      "site": "vs",
      "opponent": "JAX"
    },
    {
      "week": 17,
      "date": "2027-01-03",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "NYG"
    },
    {
      "week": 18,
      "date": "2027-01-10",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "WAS"
    }
  ],
  "DEN": [
    {
      "week": 1,
      "date": "2026-09-14",
      "weekday": "Monday",
      "time": "20:15",
      "site": "@",
      "opponent": "KC"
    },
    {
      "week": 2,
      "date": "2026-09-20",
      "weekday": "Sunday",
      "time": "16:05",
      "site": "vs",
      "opponent": "JAX"
    },
    {
      "week": 3,
      "date": "2026-09-27",
      "weekday": "Sunday",
      "time": "20:20",
      "site": "vs",
      "opponent": "LAR"
    },
    {
      "week": 4,
      "date": "2026-10-04",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "@",
      "opponent": "SF"
    },
    {
      "week": 5,
      "date": "2026-10-11",
      "weekday": "Sunday",
      "time": "16:05",
      "site": "@",
      "opponent": "LAC"
    },
    {
      "week": 6,
      "date": "2026-10-15",
      "weekday": "Thursday",
      "time": "20:15",
      "site": "vs",
      "opponent": "SEA"
    },
    {
      "week": 7,
      "date": "2026-10-25",
      "weekday": "Sunday",
      "time": "16:05",
      "site": "@",
      "opponent": "ARI"
    },
    {
      "week": 8,
      "date": "2026-11-01",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "vs",
      "opponent": "KC"
    },
    {
      "week": 9,
      "date": "2026-11-08",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "CAR"
    },
    {
      "week": 10,
      "bye": true
    },
    {
      "week": 11,
      "date": "2026-11-22",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "vs",
      "opponent": "LV"
    },
    {
      "week": 12,
      "date": "2026-11-27",
      "weekday": "Friday",
      "time": "15:00",
      "site": "@",
      "opponent": "PIT"
    },
    {
      "week": 13,
      "date": "2026-12-06",
      "weekday": "Sunday",
      "time": "16:05",
      "site": "vs",
      "opponent": "MIA"
    },
    {
      "week": 14,
      "date": "2026-12-13",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "NYJ"
    },
    {
      "week": 15,
      "date": "2026-12-20",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "@",
      "opponent": "LV"
    },
    {
      "week": 16,
      "date": "2026-12-25",
      "weekday": "Friday",
      "time": "16:30",
      "site": "vs",
      "opponent": "BUF"
    },
    {
      "week": 17,
      "date": "2027-01-03",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "NE"
    },
    {
      "week": 18,
      "date": "2027-01-10",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "LAC"
    }
  ],
  "DET": [
    {
      "week": 1,
      "date": "2026-09-13",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "NO"
    },
    {
      "week": 2,
      "date": "2026-09-17",
      "weekday": "Thursday",
      "time": "20:15",
      "site": "@",
      "opponent": "BUF"
    },
    {
      "week": 3,
      "date": "2026-09-27",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "NYJ"
    },
    {
      "week": 4,
      "date": "2026-10-04",
      "weekday": "Sunday",
      "time": "20:20",
      "site": "@",
      "opponent": "CAR"
    },
    {
      "week": 5,
      "date": "2026-10-11",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "@",
      "opponent": "ARI"
    },
    {
      "week": 6,
      "bye": true
    },
    {
      "week": 7,
      "date": "2026-10-25",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "vs",
      "opponent": "GB"
    },
    {
      "week": 8,
      "date": "2026-11-01",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "MIN"
    },
    {
      "week": 9,
      "date": "2026-11-08",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "MIA"
    },
    {
      "week": 10,
      "date": "2026-11-15",
      "weekday": "Sunday",
      "time": "09:30",
      "site": "vs",
      "opponent": "NE"
    },
    {
      "week": 11,
      "date": "2026-11-22",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "TB"
    },
    {
      "week": 12,
      "date": "2026-11-26",
      "weekday": "Thursday",
      "time": "13:00",
      "site": "vs",
      "opponent": "CHI"
    },
    {
      "week": 13,
      "date": "2026-12-06",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "ATL"
    },
    {
      "week": 14,
      "date": "2026-12-13",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "TEN"
    },
    {
      "week": 15,
      "date": "2026-12-20",
      "weekday": "Sunday",
      "time": "20:20",
      "site": "@",
      "opponent": "MIN"
    },
    {
      "week": 16,
      "date": "2026-12-28",
      "weekday": "Monday",
      "time": "20:15",
      "site": "vs",
      "opponent": "NYG"
    },
    {
      "week": 17,
      "date": "2027-01-03",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "@",
      "opponent": "CHI"
    },
    {
      "week": 18,
      "date": "2027-01-10",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "GB"
    }
  ],
  "GB": [
    {
      "week": 1,
      "date": "2026-09-13",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "@",
      "opponent": "MIN"
    },
    {
      "week": 2,
      "date": "2026-09-20",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "NYJ"
    },
    {
      "week": 3,
      "date": "2026-09-24",
      "weekday": "Thursday",
      "time": "20:15",
      "site": "vs",
      "opponent": "ATL"
    },
    {
      "week": 4,
      "date": "2026-10-04",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "TB"
    },
    {
      "week": 5,
      "date": "2026-10-11",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "vs",
      "opponent": "CHI"
    },
    {
      "week": 6,
      "date": "2026-10-18",
      "weekday": "Sunday",
      "time": "20:20",
      "site": "vs",
      "opponent": "DAL"
    },
    {
      "week": 7,
      "date": "2026-10-25",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "@",
      "opponent": "DET"
    },
    {
      "week": 8,
      "date": "2026-10-29",
      "weekday": "Thursday",
      "time": "20:15",
      "site": "vs",
      "opponent": "CAR"
    },
    {
      "week": 9,
      "date": "2026-11-08",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "@",
      "opponent": "NE"
    },
    {
      "week": 10,
      "date": "2026-11-15",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "MIN"
    },
    {
      "week": 11,
      "bye": true
    },
    {
      "week": 12,
      "date": "2026-11-25",
      "weekday": "Wednesday",
      "time": "20:00",
      "site": "@",
      "opponent": "LAR"
    },
    {
      "week": 13,
      "date": "2026-12-06",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "NO"
    },
    {
      "week": 14,
      "date": "2026-12-13",
      "weekday": "Sunday",
      "time": "20:20",
      "site": "vs",
      "opponent": "BUF"
    },
    {
      "week": 15,
      "date": "2026-12-20",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "MIA"
    },
    {
      "week": 16,
      "date": "2026-12-25",
      "weekday": "Friday",
      "time": "13:00",
      "site": "@",
      "opponent": "CHI"
    },
    {
      "week": 17,
      "date": "2027-01-04",
      "weekday": "Monday",
      "time": "20:15",
      "site": "vs",
      "opponent": "HOU"
    },
    {
      "week": 18,
      "date": "2027-01-10",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "DET"
    }
  ],
  "HOU": [
    {
      "week": 1,
      "date": "2026-09-13",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "BUF"
    },
    {
      "week": 2,
      "date": "2026-09-20",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "CIN"
    },
    {
      "week": 3,
      "date": "2026-09-27",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "IND"
    },
    {
      "week": 4,
      "date": "2026-10-04",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "DAL"
    },
    {
      "week": 5,
      "date": "2026-10-11",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "TEN"
    },
    {
      "week": 6,
      "date": "2026-10-18",
      "weekday": "Sunday",
      "time": "09:30",
      "site": "@",
      "opponent": "JAX"
    },
    {
      "week": 7,
      "date": "2026-10-25",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "NYG"
    },
    {
      "week": 8,
      "bye": true
    },
    {
      "week": 9,
      "date": "2026-11-08",
      "weekday": "Sunday",
      "time": "16:05",
      "site": "@",
      "opponent": "LAC"
    },
    {
      "week": 10,
      "date": "2026-11-15",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "CLE"
    },
    {
      "week": 11,
      "date": "2026-11-19",
      "weekday": "Thursday",
      "time": "20:15",
      "site": "vs",
      "opponent": "IND"
    },
    {
      "week": 12,
      "date": "2026-11-29",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "BAL"
    },
    {
      "week": 13,
      "date": "2026-12-06",
      "weekday": "Sunday",
      "time": "20:20",
      "site": "@",
      "opponent": "PIT"
    },
    {
      "week": 14,
      "date": "2026-12-13",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "WAS"
    },
    {
      "week": 15,
      "date": "2026-12-20",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "JAX"
    },
    {
      "week": 16,
      "date": "2026-12-24",
      "weekday": "Thursday",
      "time": "20:15",
      "site": "@",
      "opponent": "PHI"
    },
    {
      "week": 17,
      "date": "2027-01-04",
      "weekday": "Monday",
      "time": "20:15",
      "site": "@",
      "opponent": "GB"
    },
    {
      "week": 18,
      "date": "2027-01-10",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "TEN"
    }
  ],
  "IND": [
    {
      "week": 1,
      "date": "2026-09-13",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "BAL"
    },
    {
      "week": 2,
      "date": "2026-09-20",
      "weekday": "Sunday",
      "time": "20:20",
      "site": "@",
      "opponent": "KC"
    },
    {
      "week": 3,
      "date": "2026-09-27",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "HOU"
    },
    {
      "week": 4,
      "date": "2026-10-04",
      "weekday": "Sunday",
      "time": "09:30",
      "site": "@",
      "opponent": "WAS"
    },
    {
      "week": 5,
      "date": "2026-10-11",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "PIT"
    },
    {
      "week": 6,
      "date": "2026-10-18",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "TEN"
    },
    {
      "week": 7,
      "date": "2026-10-25",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "MIN"
    },
    {
      "week": 8,
      "date": "2026-11-01",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "JAX"
    },
    {
      "week": 9,
      "date": "2026-11-08",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "DAL"
    },
    {
      "week": 10,
      "date": "2026-11-15",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "MIA"
    },
    {
      "week": 11,
      "date": "2026-11-19",
      "weekday": "Thursday",
      "time": "20:15",
      "site": "@",
      "opponent": "HOU"
    },
    {
      "week": 12,
      "date": "2026-11-29",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "NYG"
    },
    {
      "week": 13,
      "bye": true
    },
    {
      "week": 14,
      "date": "2026-12-13",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "PHI"
    },
    {
      "week": 15,
      "date": "2026-12-20",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "TEN"
    },
    {
      "week": 16,
      "date": "2026-12-27",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "CIN"
    },
    {
      "week": 17,
      "date": "2027-01-03",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "CLE"
    },
    {
      "week": 18,
      "date": "2027-01-10",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "JAX"
    }
  ],
  "JAX": [
    {
      "week": 1,
      "date": "2026-09-13",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "CLE"
    },
    {
      "week": 2,
      "date": "2026-09-20",
      "weekday": "Sunday",
      "time": "16:05",
      "site": "@",
      "opponent": "DEN"
    },
    {
      "week": 3,
      "date": "2026-09-27",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "NE"
    },
    {
      "week": 4,
      "date": "2026-10-04",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "CIN"
    },
    {
      "week": 5,
      "date": "2026-10-11",
      "weekday": "Sunday",
      "time": "09:30",
      "site": "vs",
      "opponent": "PHI"
    },
    {
      "week": 6,
      "date": "2026-10-18",
      "weekday": "Sunday",
      "time": "09:30",
      "site": "vs",
      "opponent": "HOU"
    },
    {
      "week": 7,
      "bye": true
    },
    {
      "week": 8,
      "date": "2026-11-01",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "IND"
    },
    {
      "week": 9,
      "date": "2026-11-05",
      "weekday": "Thursday",
      "time": "20:15",
      "site": "@",
      "opponent": "BAL"
    },
    {
      "week": 10,
      "date": "2026-11-15",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "TEN"
    },
    {
      "week": 11,
      "date": "2026-11-22",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "NYG"
    },
    {
      "week": 12,
      "date": "2026-11-29",
      "weekday": "Sunday",
      "time": "16:05",
      "site": "vs",
      "opponent": "TEN"
    },
    {
      "week": 13,
      "date": "2026-12-06",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "CHI"
    },
    {
      "week": 14,
      "date": "2026-12-14",
      "weekday": "Monday",
      "time": "20:15",
      "site": "vs",
      "opponent": "PIT"
    },
    {
      "week": 15,
      "date": "2026-12-20",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "HOU"
    },
    {
      "week": 16,
      "date": "2026-12-27",
      "weekday": "Sunday",
      "time": "20:20",
      "site": "@",
      "opponent": "DAL"
    },
    {
      "week": 17,
      "date": "2027-01-03",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "WAS"
    },
    {
      "week": 18,
      "date": "2027-01-10",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "IND"
    }
  ],
  "KC": [
    {
      "week": 1,
      "date": "2026-09-14",
      "weekday": "Monday",
      "time": "20:15",
      "site": "vs",
      "opponent": "DEN"
    },
    {
      "week": 2,
      "date": "2026-09-20",
      "weekday": "Sunday",
      "time": "20:20",
      "site": "vs",
      "opponent": "IND"
    },
    {
      "week": 3,
      "date": "2026-09-27",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "MIA"
    },
    {
      "week": 4,
      "date": "2026-10-04",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "@",
      "opponent": "LV"
    },
    {
      "week": 5,
      "bye": true
    },
    {
      "week": 6,
      "date": "2026-10-18",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "vs",
      "opponent": "LAC"
    },
    {
      "week": 7,
      "date": "2026-10-25",
      "weekday": "Sunday",
      "time": "20:20",
      "site": "@",
      "opponent": "SEA"
    },
    {
      "week": 8,
      "date": "2026-11-01",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "@",
      "opponent": "DEN"
    },
    {
      "week": 9,
      "date": "2026-11-08",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "NYJ"
    },
    {
      "week": 10,
      "date": "2026-11-15",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "ATL"
    },
    {
      "week": 11,
      "date": "2026-11-22",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "ARI"
    },
    {
      "week": 12,
      "date": "2026-11-26",
      "weekday": "Thursday",
      "time": "20:20",
      "site": "@",
      "opponent": "BUF"
    },
    {
      "week": 13,
      "date": "2026-12-03",
      "weekday": "Thursday",
      "time": "20:15",
      "site": "@",
      "opponent": "LAR"
    },
    {
      "week": 14,
      "date": "2026-12-13",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "@",
      "opponent": "CIN"
    },
    {
      "week": 15,
      "date": "2026-12-21",
      "weekday": "Monday",
      "time": "20:15",
      "site": "vs",
      "opponent": "NE"
    },
    {
      "week": 16,
      "date": "2026-12-27",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "vs",
      "opponent": "SF"
    },
    {
      "week": 17,
      "date": "2027-01-03",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "LAC"
    },
    {
      "week": 18,
      "date": "2027-01-10",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "LV"
    }
  ],
  "LAC": [
    {
      "week": 1,
      "date": "2026-09-13",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "vs",
      "opponent": "ARI"
    },
    {
      "week": 2,
      "date": "2026-09-20",
      "weekday": "Sunday",
      "time": "16:05",
      "site": "vs",
      "opponent": "LV"
    },
    {
      "week": 3,
      "date": "2026-09-27",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "BUF"
    },
    {
      "week": 4,
      "date": "2026-10-04",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "@",
      "opponent": "SEA"
    },
    {
      "week": 5,
      "date": "2026-10-11",
      "weekday": "Sunday",
      "time": "16:05",
      "site": "vs",
      "opponent": "DEN"
    },
    {
      "week": 6,
      "date": "2026-10-18",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "@",
      "opponent": "KC"
    },
    {
      "week": 7,
      "bye": true
    },
    {
      "week": 8,
      "date": "2026-11-01",
      "weekday": "Sunday",
      "time": "16:05",
      "site": "@",
      "opponent": "LAR"
    },
    {
      "week": 9,
      "date": "2026-11-08",
      "weekday": "Sunday",
      "time": "16:05",
      "site": "vs",
      "opponent": "HOU"
    },
    {
      "week": 10,
      "date": "2026-11-16",
      "weekday": "Monday",
      "time": "20:15",
      "site": "@",
      "opponent": "BAL"
    },
    {
      "week": 11,
      "date": "2026-11-22",
      "weekday": "Sunday",
      "time": "16:05",
      "site": "vs",
      "opponent": "NYJ"
    },
    {
      "week": 12,
      "date": "2026-11-29",
      "weekday": "Sunday",
      "time": "20:20",
      "site": "vs",
      "opponent": "NE"
    },
    {
      "week": 13,
      "date": "2026-12-06",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "TB"
    },
    {
      "week": 14,
      "date": "2026-12-13",
      "weekday": "Sunday",
      "time": "16:05",
      "site": "@",
      "opponent": "LV"
    },
    {
      "week": 15,
      "date": "2026-12-17",
      "weekday": "Thursday",
      "time": "20:15",
      "site": "vs",
      "opponent": "SF"
    },
    {
      "week": 16,
      "date": "2026-12-27",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "MIA"
    },
    {
      "week": 17,
      "date": "2027-01-03",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "KC"
    },
    {
      "week": 18,
      "date": "2027-01-10",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "DEN"
    }
  ],
  "LAR": [
    {
      "week": 1,
      "date": "2026-09-10",
      "weekday": "Thursday",
      "time": "20:35",
      "site": "vs",
      "opponent": "SF"
    },
    {
      "week": 2,
      "date": "2026-09-21",
      "weekday": "Monday",
      "time": "20:15",
      "site": "vs",
      "opponent": "NYG"
    },
    {
      "week": 3,
      "date": "2026-09-27",
      "weekday": "Sunday",
      "time": "20:20",
      "site": "@",
      "opponent": "DEN"
    },
    {
      "week": 4,
      "date": "2026-10-04",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "PHI"
    },
    {
      "week": 5,
      "date": "2026-10-12",
      "weekday": "Monday",
      "time": "20:15",
      "site": "vs",
      "opponent": "BUF"
    },
    {
      "week": 6,
      "date": "2026-10-18",
      "weekday": "Sunday",
      "time": "16:05",
      "site": "vs",
      "opponent": "ARI"
    },
    {
      "week": 7,
      "date": "2026-10-25",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "@",
      "opponent": "LV"
    },
    {
      "week": 8,
      "date": "2026-11-01",
      "weekday": "Sunday",
      "time": "16:05",
      "site": "vs",
      "opponent": "LAC"
    },
    {
      "week": 9,
      "date": "2026-11-08",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "WAS"
    },
    {
      "week": 10,
      "date": "2026-11-15",
      "weekday": "Sunday",
      "time": "16:05",
      "site": "@",
      "opponent": "ARI"
    },
    {
      "week": 11,
      "bye": true
    },
    {
      "week": 12,
      "date": "2026-11-25",
      "weekday": "Wednesday",
      "time": "20:00",
      "site": "vs",
      "opponent": "GB"
    },
    {
      "week": 13,
      "date": "2026-12-03",
      "weekday": "Thursday",
      "time": "20:15",
      "site": "vs",
      "opponent": "KC"
    },
    {
      "week": 14,
      "date": "2026-12-13",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "@",
      "opponent": "SF"
    },
    {
      "week": 15,
      "date": "2026-12-20",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "vs",
      "opponent": "DAL"
    },
    {
      "week": 16,
      "date": "2026-12-25",
      "weekday": "Friday",
      "time": "20:15",
      "site": "@",
      "opponent": "SEA"
    },
    {
      "week": 17,
      "date": "2027-01-03",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "TB"
    },
    {
      "week": 18,
      "date": "2027-01-10",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "SEA"
    }
  ],
  "LV": [
    {
      "week": 1,
      "date": "2026-09-13",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "vs",
      "opponent": "MIA"
    },
    {
      "week": 2,
      "date": "2026-09-20",
      "weekday": "Sunday",
      "time": "16:05",
      "site": "@",
      "opponent": "LAC"
    },
    {
      "week": 3,
      "date": "2026-09-27",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "@",
      "opponent": "NO"
    },
    {
      "week": 4,
      "date": "2026-10-04",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "vs",
      "opponent": "KC"
    },
    {
      "week": 5,
      "date": "2026-10-11",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "NE"
    },
    {
      "week": 6,
      "date": "2026-10-18",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "vs",
      "opponent": "BUF"
    },
    {
      "week": 7,
      "date": "2026-10-25",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "vs",
      "opponent": "LAR"
    },
    {
      "week": 8,
      "date": "2026-11-01",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "NYJ"
    },
    {
      "week": 9,
      "date": "2026-11-08",
      "weekday": "Sunday",
      "time": "16:05",
      "site": "@",
      "opponent": "SF"
    },
    {
      "week": 10,
      "date": "2026-11-15",
      "weekday": "Sunday",
      "time": "16:05",
      "site": "vs",
      "opponent": "SEA"
    },
    {
      "week": 11,
      "date": "2026-11-22",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "@",
      "opponent": "DEN"
    },
    {
      "week": 12,
      "date": "2026-11-29",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "CLE"
    },
    {
      "week": 13,
      "bye": true
    },
    {
      "week": 14,
      "date": "2026-12-13",
      "weekday": "Sunday",
      "time": "16:05",
      "site": "vs",
      "opponent": "LAC"
    },
    {
      "week": 15,
      "date": "2026-12-20",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "vs",
      "opponent": "DEN"
    },
    {
      "week": 16,
      "date": "2026-12-27",
      "weekday": "Sunday",
      "time": "16:05",
      "site": "vs",
      "opponent": "TEN"
    },
    {
      "week": 17,
      "date": "2027-01-03",
      "weekday": "Sunday",
      "time": "16:05",
      "site": "@",
      "opponent": "ARI"
    },
    {
      "week": 18,
      "date": "2027-01-10",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "KC"
    }
  ],
  "MIA": [
    {
      "week": 1,
      "date": "2026-09-13",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "@",
      "opponent": "LV"
    },
    {
      "week": 2,
      "date": "2026-09-20",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "@",
      "opponent": "SF"
    },
    {
      "week": 3,
      "date": "2026-09-27",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "KC"
    },
    {
      "week": 4,
      "date": "2026-10-04",
      "weekday": "Sunday",
      "time": "16:05",
      "site": "@",
      "opponent": "MIN"
    },
    {
      "week": 5,
      "date": "2026-10-11",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "CIN"
    },
    {
      "week": 6,
      "bye": true
    },
    {
      "week": 7,
      "date": "2026-10-25",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "NYJ"
    },
    {
      "week": 8,
      "date": "2026-11-01",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "vs",
      "opponent": "NE"
    },
    {
      "week": 9,
      "date": "2026-11-08",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "DET"
    },
    {
      "week": 10,
      "date": "2026-11-15",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "IND"
    },
    {
      "week": 11,
      "date": "2026-11-22",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "BUF"
    },
    {
      "week": 12,
      "date": "2026-11-29",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "NYJ"
    },
    {
      "week": 13,
      "date": "2026-12-06",
      "weekday": "Sunday",
      "time": "16:05",
      "site": "@",
      "opponent": "DEN"
    },
    {
      "week": 14,
      "date": "2026-12-13",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "CHI"
    },
    {
      "week": 15,
      "date": "2026-12-20",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "GB"
    },
    {
      "week": 16,
      "date": "2026-12-27",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "LAC"
    },
    {
      "week": 17,
      "date": "2027-01-03",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "BUF"
    },
    {
      "week": 18,
      "date": "2027-01-10",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "NE"
    }
  ],
  "MIN": [
    {
      "week": 1,
      "date": "2026-09-13",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "vs",
      "opponent": "GB"
    },
    {
      "week": 2,
      "date": "2026-09-20",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "CHI"
    },
    {
      "week": 3,
      "date": "2026-09-27",
      "weekday": "Sunday",
      "time": "16:05",
      "site": "@",
      "opponent": "TB"
    },
    {
      "week": 4,
      "date": "2026-10-04",
      "weekday": "Sunday",
      "time": "16:05",
      "site": "vs",
      "opponent": "MIA"
    },
    {
      "week": 5,
      "date": "2026-10-11",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "NO"
    },
    {
      "week": 6,
      "bye": true
    },
    {
      "week": 7,
      "date": "2026-10-25",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "IND"
    },
    {
      "week": 8,
      "date": "2026-11-01",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "DET"
    },
    {
      "week": 9,
      "date": "2026-11-09",
      "weekday": "Monday",
      "time": "20:15",
      "site": "vs",
      "opponent": "BUF"
    },
    {
      "week": 10,
      "date": "2026-11-15",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "GB"
    },
    {
      "week": 11,
      "date": "2026-11-22",
      "weekday": "Sunday",
      "time": "20:20",
      "site": "@",
      "opponent": "SF"
    },
    {
      "week": 12,
      "date": "2026-11-29",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "ATL"
    },
    {
      "week": 13,
      "date": "2026-12-06",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "vs",
      "opponent": "CAR"
    },
    {
      "week": 14,
      "date": "2026-12-10",
      "weekday": "Thursday",
      "time": "20:15",
      "site": "@",
      "opponent": "NE"
    },
    {
      "week": 15,
      "date": "2026-12-20",
      "weekday": "Sunday",
      "time": "20:20",
      "site": "vs",
      "opponent": "DET"
    },
    {
      "week": 16,
      "date": "2026-12-27",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "WAS"
    },
    {
      "week": 17,
      "date": "2027-01-03",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "NYJ"
    },
    {
      "week": 18,
      "date": "2027-01-10",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "CHI"
    }
  ],
  "NE": [
    {
      "week": 1,
      "date": "2026-09-09",
      "weekday": "Wednesday",
      "time": "20:20",
      "site": "@",
      "opponent": "SEA"
    },
    {
      "week": 2,
      "date": "2026-09-20",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "PIT"
    },
    {
      "week": 3,
      "date": "2026-09-27",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "JAX"
    },
    {
      "week": 4,
      "date": "2026-10-04",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "BUF"
    },
    {
      "week": 5,
      "date": "2026-10-11",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "LV"
    },
    {
      "week": 6,
      "date": "2026-10-18",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "NYJ"
    },
    {
      "week": 7,
      "date": "2026-10-22",
      "weekday": "Thursday",
      "time": "20:15",
      "site": "@",
      "opponent": "CHI"
    },
    {
      "week": 8,
      "date": "2026-11-01",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "@",
      "opponent": "MIA"
    },
    {
      "week": 9,
      "date": "2026-11-08",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "vs",
      "opponent": "GB"
    },
    {
      "week": 10,
      "date": "2026-11-15",
      "weekday": "Sunday",
      "time": "09:30",
      "site": "@",
      "opponent": "DET"
    },
    {
      "week": 11,
      "bye": true
    },
    {
      "week": 12,
      "date": "2026-11-29",
      "weekday": "Sunday",
      "time": "20:20",
      "site": "@",
      "opponent": "LAC"
    },
    {
      "week": 13,
      "date": "2026-12-06",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "vs",
      "opponent": "BUF"
    },
    {
      "week": 14,
      "date": "2026-12-10",
      "weekday": "Thursday",
      "time": "20:15",
      "site": "vs",
      "opponent": "MIN"
    },
    {
      "week": 15,
      "date": "2026-12-21",
      "weekday": "Monday",
      "time": "20:15",
      "site": "@",
      "opponent": "KC"
    },
    {
      "week": 16,
      "date": "2026-12-27",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "NYJ"
    },
    {
      "week": 17,
      "date": "2027-01-03",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "DEN"
    },
    {
      "week": 18,
      "date": "2027-01-10",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "MIA"
    }
  ],
  "NO": [
    {
      "week": 1,
      "date": "2026-09-13",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "DET"
    },
    {
      "week": 2,
      "date": "2026-09-20",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "BAL"
    },
    {
      "week": 3,
      "date": "2026-09-27",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "vs",
      "opponent": "LV"
    },
    {
      "week": 4,
      "date": "2026-10-05",
      "weekday": "Monday",
      "time": "20:15",
      "site": "vs",
      "opponent": "ATL"
    },
    {
      "week": 5,
      "date": "2026-10-11",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "MIN"
    },
    {
      "week": 6,
      "date": "2026-10-18",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "NYG"
    },
    {
      "week": 7,
      "date": "2026-10-25",
      "weekday": "Sunday",
      "time": "09:30",
      "site": "vs",
      "opponent": "PIT"
    },
    {
      "week": 8,
      "bye": true
    },
    {
      "week": 9,
      "date": "2026-11-08",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "CLE"
    },
    {
      "week": 10,
      "date": "2026-11-15",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "CAR"
    },
    {
      "week": 11,
      "date": "2026-11-22",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "CHI"
    },
    {
      "week": 12,
      "date": "2026-11-29",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "CIN"
    },
    {
      "week": 13,
      "date": "2026-12-06",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "GB"
    },
    {
      "week": 14,
      "date": "2026-12-13",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "CAR"
    },
    {
      "week": 15,
      "date": "2026-12-20",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "TB"
    },
    {
      "week": 16,
      "date": "2026-12-27",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "ARI"
    },
    {
      "week": 17,
      "date": "2027-01-03",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "ATL"
    },
    {
      "week": 18,
      "date": "2027-01-10",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "TB"
    }
  ],
  "NYG": [
    {
      "week": 1,
      "date": "2026-09-13",
      "weekday": "Sunday",
      "time": "20:20",
      "site": "vs",
      "opponent": "DAL"
    },
    {
      "week": 2,
      "date": "2026-09-21",
      "weekday": "Monday",
      "time": "20:15",
      "site": "@",
      "opponent": "LAR"
    },
    {
      "week": 3,
      "date": "2026-09-27",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "TEN"
    },
    {
      "week": 4,
      "date": "2026-10-04",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "ARI"
    },
    {
      "week": 5,
      "date": "2026-10-11",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "WAS"
    },
    {
      "week": 6,
      "date": "2026-10-18",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "NO"
    },
    {
      "week": 7,
      "date": "2026-10-25",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "HOU"
    },
    {
      "week": 8,
      "bye": true
    },
    {
      "week": 9,
      "date": "2026-11-08",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "PHI"
    },
    {
      "week": 10,
      "date": "2026-11-12",
      "weekday": "Thursday",
      "time": "20:15",
      "site": "vs",
      "opponent": "WAS"
    },
    {
      "week": 11,
      "date": "2026-11-22",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "JAX"
    },
    {
      "week": 12,
      "date": "2026-11-29",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "IND"
    },
    {
      "week": 13,
      "date": "2026-12-06",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "SF"
    },
    {
      "week": 14,
      "date": "2026-12-13",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "@",
      "opponent": "SEA"
    },
    {
      "week": 15,
      "date": "2026-12-20",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "CLE"
    },
    {
      "week": 16,
      "date": "2026-12-28",
      "weekday": "Monday",
      "time": "20:15",
      "site": "@",
      "opponent": "DET"
    },
    {
      "week": 17,
      "date": "2027-01-03",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "DAL"
    },
    {
      "week": 18,
      "date": "2027-01-10",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "PHI"
    }
  ],
  "NYJ": [
    {
      "week": 1,
      "date": "2026-09-13",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "TEN"
    },
    {
      "week": 2,
      "date": "2026-09-20",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "GB"
    },
    {
      "week": 3,
      "date": "2026-09-27",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "DET"
    },
    {
      "week": 4,
      "date": "2026-10-04",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "CHI"
    },
    {
      "week": 5,
      "date": "2026-10-11",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "CLE"
    },
    {
      "week": 6,
      "date": "2026-10-18",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "NE"
    },
    {
      "week": 7,
      "date": "2026-10-25",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "MIA"
    },
    {
      "week": 8,
      "date": "2026-11-01",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "LV"
    },
    {
      "week": 9,
      "date": "2026-11-08",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "KC"
    },
    {
      "week": 10,
      "date": "2026-11-15",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "BUF"
    },
    {
      "week": 11,
      "date": "2026-11-22",
      "weekday": "Sunday",
      "time": "16:05",
      "site": "@",
      "opponent": "LAC"
    },
    {
      "week": 12,
      "date": "2026-11-29",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "MIA"
    },
    {
      "week": 13,
      "bye": true
    },
    {
      "week": 14,
      "date": "2026-12-13",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "DEN"
    },
    {
      "week": 15,
      "date": "2026-12-20",
      "weekday": "Sunday",
      "time": "16:05",
      "site": "@",
      "opponent": "ARI"
    },
    {
      "week": 16,
      "date": "2026-12-27",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "NE"
    },
    {
      "week": 17,
      "date": "2027-01-03",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "MIN"
    },
    {
      "week": 18,
      "date": "2027-01-10",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "BUF"
    }
  ],
  "PHI": [
    {
      "week": 1,
      "date": "2026-09-13",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "vs",
      "opponent": "WAS"
    },
    {
      "week": 2,
      "date": "2026-09-20",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "TEN"
    },
    {
      "week": 3,
      "date": "2026-09-28",
      "weekday": "Monday",
      "time": "20:15",
      "site": "@",
      "opponent": "CHI"
    },
    {
      "week": 4,
      "date": "2026-10-04",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "LAR"
    },
    {
      "week": 5,
      "date": "2026-10-11",
      "weekday": "Sunday",
      "time": "09:30",
      "site": "@",
      "opponent": "JAX"
    },
    {
      "week": 6,
      "date": "2026-10-18",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "CAR"
    },
    {
      "week": 7,
      "date": "2026-10-26",
      "weekday": "Monday",
      "time": "20:15",
      "site": "vs",
      "opponent": "DAL"
    },
    {
      "week": 8,
      "date": "2026-11-01",
      "weekday": "Sunday",
      "time": "20:20",
      "site": "@",
      "opponent": "WAS"
    },
    {
      "week": 9,
      "date": "2026-11-08",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "NYG"
    },
    {
      "week": 10,
      "bye": true
    },
    {
      "week": 11,
      "date": "2026-11-22",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "vs",
      "opponent": "PIT"
    },
    {
      "week": 12,
      "date": "2026-11-26",
      "weekday": "Thursday",
      "time": "16:30",
      "site": "@",
      "opponent": "DAL"
    },
    {
      "week": 13,
      "date": "2026-12-06",
      "weekday": "Sunday",
      "time": "16:05",
      "site": "@",
      "opponent": "ARI"
    },
    {
      "week": 14,
      "date": "2026-12-13",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "IND"
    },
    {
      "week": 15,
      "date": "2026-12-19",
      "weekday": "Saturday",
      "time": "17:00",
      "site": "vs",
      "opponent": "SEA"
    },
    {
      "week": 16,
      "date": "2026-12-24",
      "weekday": "Thursday",
      "time": "20:15",
      "site": "vs",
      "opponent": "HOU"
    },
    {
      "week": 17,
      "date": "2027-01-03",
      "weekday": "Sunday",
      "time": "20:20",
      "site": "@",
      "opponent": "SF"
    },
    {
      "week": 18,
      "date": "2027-01-10",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "NYG"
    }
  ],
  "PIT": [
    {
      "week": 1,
      "date": "2026-09-13",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "ATL"
    },
    {
      "week": 2,
      "date": "2026-09-20",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "NE"
    },
    {
      "week": 3,
      "date": "2026-09-27",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "CIN"
    },
    {
      "week": 4,
      "date": "2026-10-01",
      "weekday": "Thursday",
      "time": "20:15",
      "site": "@",
      "opponent": "CLE"
    },
    {
      "week": 5,
      "date": "2026-10-11",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "IND"
    },
    {
      "week": 6,
      "date": "2026-10-18",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "TB"
    },
    {
      "week": 7,
      "date": "2026-10-25",
      "weekday": "Sunday",
      "time": "09:30",
      "site": "@",
      "opponent": "NO"
    },
    {
      "week": 8,
      "date": "2026-11-01",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "CLE"
    },
    {
      "week": 9,
      "bye": true
    },
    {
      "week": 10,
      "date": "2026-11-15",
      "weekday": "Sunday",
      "time": "20:20",
      "site": "@",
      "opponent": "CIN"
    },
    {
      "week": 11,
      "date": "2026-11-22",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "@",
      "opponent": "PHI"
    },
    {
      "week": 12,
      "date": "2026-11-27",
      "weekday": "Friday",
      "time": "15:00",
      "site": "vs",
      "opponent": "DEN"
    },
    {
      "week": 13,
      "date": "2026-12-06",
      "weekday": "Sunday",
      "time": "20:20",
      "site": "vs",
      "opponent": "HOU"
    },
    {
      "week": 14,
      "date": "2026-12-14",
      "weekday": "Monday",
      "time": "20:15",
      "site": "@",
      "opponent": "JAX"
    },
    {
      "week": 15,
      "date": "2026-12-20",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "BAL"
    },
    {
      "week": 16,
      "date": "2026-12-27",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "CAR"
    },
    {
      "week": 17,
      "date": "2027-01-03",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "TEN"
    },
    {
      "week": 18,
      "date": "2027-01-10",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "BAL"
    }
  ],
  "SEA": [
    {
      "week": 1,
      "date": "2026-09-09",
      "weekday": "Wednesday",
      "time": "20:20",
      "site": "vs",
      "opponent": "NE"
    },
    {
      "week": 2,
      "date": "2026-09-20",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "@",
      "opponent": "ARI"
    },
    {
      "week": 3,
      "date": "2026-09-27",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "WAS"
    },
    {
      "week": 4,
      "date": "2026-10-04",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "vs",
      "opponent": "LAC"
    },
    {
      "week": 5,
      "date": "2026-10-11",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "vs",
      "opponent": "SF"
    },
    {
      "week": 6,
      "date": "2026-10-15",
      "weekday": "Thursday",
      "time": "20:15",
      "site": "@",
      "opponent": "DEN"
    },
    {
      "week": 7,
      "date": "2026-10-25",
      "weekday": "Sunday",
      "time": "20:20",
      "site": "vs",
      "opponent": "KC"
    },
    {
      "week": 8,
      "date": "2026-11-02",
      "weekday": "Monday",
      "time": "20:15",
      "site": "vs",
      "opponent": "CHI"
    },
    {
      "week": 9,
      "date": "2026-11-08",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "vs",
      "opponent": "ARI"
    },
    {
      "week": 10,
      "date": "2026-11-15",
      "weekday": "Sunday",
      "time": "16:05",
      "site": "@",
      "opponent": "LV"
    },
    {
      "week": 11,
      "bye": true
    },
    {
      "week": 12,
      "date": "2026-11-29",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "@",
      "opponent": "SF"
    },
    {
      "week": 13,
      "date": "2026-12-07",
      "weekday": "Monday",
      "time": "20:15",
      "site": "vs",
      "opponent": "DAL"
    },
    {
      "week": 14,
      "date": "2026-12-13",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "vs",
      "opponent": "NYG"
    },
    {
      "week": 15,
      "date": "2026-12-19",
      "weekday": "Saturday",
      "time": "17:00",
      "site": "@",
      "opponent": "PHI"
    },
    {
      "week": 16,
      "date": "2026-12-25",
      "weekday": "Friday",
      "time": "20:15",
      "site": "vs",
      "opponent": "LAR"
    },
    {
      "week": 17,
      "date": "2027-01-03",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "CAR"
    },
    {
      "week": 18,
      "date": "2027-01-10",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "LAR"
    }
  ],
  "SF": [
    {
      "week": 1,
      "date": "2026-09-10",
      "weekday": "Thursday",
      "time": "20:35",
      "site": "@",
      "opponent": "LAR"
    },
    {
      "week": 2,
      "date": "2026-09-20",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "vs",
      "opponent": "MIA"
    },
    {
      "week": 3,
      "date": "2026-09-27",
      "weekday": "Sunday",
      "time": "16:05",
      "site": "vs",
      "opponent": "ARI"
    },
    {
      "week": 4,
      "date": "2026-10-04",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "vs",
      "opponent": "DEN"
    },
    {
      "week": 5,
      "date": "2026-10-11",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "@",
      "opponent": "SEA"
    },
    {
      "week": 6,
      "date": "2026-10-19",
      "weekday": "Monday",
      "time": "20:15",
      "site": "vs",
      "opponent": "WAS"
    },
    {
      "week": 7,
      "date": "2026-10-25",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "ATL"
    },
    {
      "week": 8,
      "bye": true
    },
    {
      "week": 9,
      "date": "2026-11-08",
      "weekday": "Sunday",
      "time": "16:05",
      "site": "vs",
      "opponent": "LV"
    },
    {
      "week": 10,
      "date": "2026-11-15",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "@",
      "opponent": "DAL"
    },
    {
      "week": 11,
      "date": "2026-11-22",
      "weekday": "Sunday",
      "time": "20:20",
      "site": "vs",
      "opponent": "MIN"
    },
    {
      "week": 12,
      "date": "2026-11-29",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "vs",
      "opponent": "SEA"
    },
    {
      "week": 13,
      "date": "2026-12-06",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "NYG"
    },
    {
      "week": 14,
      "date": "2026-12-13",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "vs",
      "opponent": "LAR"
    },
    {
      "week": 15,
      "date": "2026-12-17",
      "weekday": "Thursday",
      "time": "20:15",
      "site": "@",
      "opponent": "LAC"
    },
    {
      "week": 16,
      "date": "2026-12-27",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "@",
      "opponent": "KC"
    },
    {
      "week": 17,
      "date": "2027-01-03",
      "weekday": "Sunday",
      "time": "20:20",
      "site": "vs",
      "opponent": "PHI"
    },
    {
      "week": 18,
      "date": "2027-01-10",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "ARI"
    }
  ],
  "TB": [
    {
      "week": 1,
      "date": "2026-09-13",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "CIN"
    },
    {
      "week": 2,
      "date": "2026-09-20",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "CLE"
    },
    {
      "week": 3,
      "date": "2026-09-27",
      "weekday": "Sunday",
      "time": "16:05",
      "site": "vs",
      "opponent": "MIN"
    },
    {
      "week": 4,
      "date": "2026-10-04",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "GB"
    },
    {
      "week": 5,
      "date": "2026-10-08",
      "weekday": "Thursday",
      "time": "20:15",
      "site": "@",
      "opponent": "DAL"
    },
    {
      "week": 6,
      "date": "2026-10-18",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "PIT"
    },
    {
      "week": 7,
      "date": "2026-10-25",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "CAR"
    },
    {
      "week": 8,
      "date": "2026-11-01",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "ATL"
    },
    {
      "week": 9,
      "date": "2026-11-08",
      "weekday": "Sunday",
      "time": "20:20",
      "site": "@",
      "opponent": "CHI"
    },
    {
      "week": 10,
      "bye": true
    },
    {
      "week": 11,
      "date": "2026-11-22",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "DET"
    },
    {
      "week": 12,
      "date": "2026-11-30",
      "weekday": "Monday",
      "time": "20:15",
      "site": "vs",
      "opponent": "CAR"
    },
    {
      "week": 13,
      "date": "2026-12-06",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "LAC"
    },
    {
      "week": 14,
      "date": "2026-12-13",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "BAL"
    },
    {
      "week": 15,
      "date": "2026-12-20",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "NO"
    },
    {
      "week": 16,
      "date": "2026-12-27",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "ATL"
    },
    {
      "week": 17,
      "date": "2027-01-03",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "LAR"
    },
    {
      "week": 18,
      "date": "2027-01-10",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "NO"
    }
  ],
  "TEN": [
    {
      "week": 1,
      "date": "2026-09-13",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "NYJ"
    },
    {
      "week": 2,
      "date": "2026-09-20",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "PHI"
    },
    {
      "week": 3,
      "date": "2026-09-27",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "NYG"
    },
    {
      "week": 4,
      "date": "2026-10-04",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "BAL"
    },
    {
      "week": 5,
      "date": "2026-10-11",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "HOU"
    },
    {
      "week": 6,
      "date": "2026-10-18",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "IND"
    },
    {
      "week": 7,
      "date": "2026-10-25",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "CLE"
    },
    {
      "week": 8,
      "date": "2026-11-01",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "CIN"
    },
    {
      "week": 9,
      "bye": true
    },
    {
      "week": 10,
      "date": "2026-11-15",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "JAX"
    },
    {
      "week": 11,
      "date": "2026-11-22",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "DAL"
    },
    {
      "week": 12,
      "date": "2026-11-29",
      "weekday": "Sunday",
      "time": "16:05",
      "site": "@",
      "opponent": "JAX"
    },
    {
      "week": 13,
      "date": "2026-12-06",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "WAS"
    },
    {
      "week": 14,
      "date": "2026-12-13",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "DET"
    },
    {
      "week": 15,
      "date": "2026-12-20",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "IND"
    },
    {
      "week": 16,
      "date": "2026-12-27",
      "weekday": "Sunday",
      "time": "16:05",
      "site": "@",
      "opponent": "LV"
    },
    {
      "week": 17,
      "date": "2027-01-03",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "PIT"
    },
    {
      "week": 18,
      "date": "2027-01-10",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "HOU"
    }
  ],
  "WAS": [
    {
      "week": 1,
      "date": "2026-09-13",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "@",
      "opponent": "PHI"
    },
    {
      "week": 2,
      "date": "2026-09-20",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "@",
      "opponent": "DAL"
    },
    {
      "week": 3,
      "date": "2026-09-27",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "SEA"
    },
    {
      "week": 4,
      "date": "2026-10-04",
      "weekday": "Sunday",
      "time": "09:30",
      "site": "vs",
      "opponent": "IND"
    },
    {
      "week": 5,
      "date": "2026-10-11",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "NYG"
    },
    {
      "week": 6,
      "date": "2026-10-19",
      "weekday": "Monday",
      "time": "20:15",
      "site": "@",
      "opponent": "SF"
    },
    {
      "week": 7,
      "bye": true
    },
    {
      "week": 8,
      "date": "2026-11-01",
      "weekday": "Sunday",
      "time": "20:20",
      "site": "vs",
      "opponent": "PHI"
    },
    {
      "week": 9,
      "date": "2026-11-08",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "LAR"
    },
    {
      "week": 10,
      "date": "2026-11-12",
      "weekday": "Thursday",
      "time": "20:15",
      "site": "@",
      "opponent": "NYG"
    },
    {
      "week": 11,
      "date": "2026-11-23",
      "weekday": "Monday",
      "time": "20:15",
      "site": "vs",
      "opponent": "CIN"
    },
    {
      "week": 12,
      "date": "2026-11-29",
      "weekday": "Sunday",
      "time": "16:25",
      "site": "@",
      "opponent": "ARI"
    },
    {
      "week": 13,
      "date": "2026-12-06",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "TEN"
    },
    {
      "week": 14,
      "date": "2026-12-13",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "HOU"
    },
    {
      "week": 15,
      "date": "2026-12-20",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "ATL"
    },
    {
      "week": 16,
      "date": "2026-12-27",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "MIN"
    },
    {
      "week": 17,
      "date": "2027-01-03",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "@",
      "opponent": "JAX"
    },
    {
      "week": 18,
      "date": "2027-01-10",
      "weekday": "Sunday",
      "time": "13:00",
      "site": "vs",
      "opponent": "DAL"
    }
  ]
};

const playerGameLogs2025 = {
  "1": [
    {
      "week": 13,
      "team": "SF",
      "opponent": "CLE",
      "points": 17.4,
      "line": "20 rush att, 53 rush yd; 4 rec targets, 4 rec, 21 rec yd; 74 total yd"
    },
    {
      "week": 15,
      "team": "SF",
      "opponent": "TEN",
      "points": 15.7,
      "line": "22 rush att, 73 rush yd; 1 rec target, 1 rec, 14 rec yd; 87 total yd"
    },
    {
      "week": 16,
      "team": "SF",
      "opponent": "IND",
      "points": 32.6,
      "line": "21 rush att, 117 rush yd; 8 rec targets, 6 rec, 29 rec yd; 146 total yd"
    },
    {
      "week": 17,
      "team": "SF",
      "opponent": "CHI",
      "points": 28.1,
      "line": "23 rush att, 140 rush yd; 6 rec targets, 4 rec, 41 rec yd; 181 total yd"
    },
    {
      "week": 18,
      "team": "SF",
      "opponent": "SEA",
      "points": 11.7,
      "line": "8 rush att, 23 rush yd; 7 rec targets, 6 rec, 34 rec yd; 57 total yd"
    }
  ],
  "2": [
    {
      "week": 14,
      "team": "LA",
      "opponent": "ARI",
      "points": 35.7,
      "line": "0 rush att, 0 rush yd; 11 rec targets, 7 rec, 167 rec yd; 167 total yd"
    },
    {
      "week": 15,
      "team": "LA",
      "opponent": "DET",
      "points": 27.9,
      "line": "2 rush att, 8 rush yd; 11 rec targets, 9 rec, 181 rec yd; 189 total yd"
    },
    {
      "week": 16,
      "team": "LA",
      "opponent": "SEA",
      "points": 46.5,
      "line": "0 rush att, 0 rush yd; 16 rec targets, 12 rec, 225 rec yd; 225 total yd"
    },
    {
      "week": 17,
      "team": "LA",
      "opponent": "ATL",
      "points": 15.7,
      "line": "0 rush att, 0 rush yd; 10 rec targets, 5 rec, 47 rec yd; 47 total yd"
    },
    {
      "week": 18,
      "team": "LA",
      "opponent": "ARI",
      "points": 26,
      "line": "2 rush att, 24 rush yd; 11 rec targets, 10 rec, 76 rec yd; 100 total yd"
    }
  ],
  "3": [
    {
      "week": 14,
      "team": "ATL",
      "opponent": "SEA",
      "points": 9.4,
      "line": "20 rush att, 86 rush yd; 2 rec targets, 2 rec, 8 rec yd; 94 total yd"
    },
    {
      "week": 15,
      "team": "ATL",
      "opponent": "TB",
      "points": 29.5,
      "line": "19 rush att, 93 rush yd; 11 rec targets, 8 rec, 82 rec yd; 175 total yd"
    },
    {
      "week": 16,
      "team": "ATL",
      "opponent": "ARI",
      "points": 29.8,
      "line": "16 rush att, 76 rush yd; 11 rec targets, 7 rec, 92 rec yd; 168 total yd"
    },
    {
      "week": 17,
      "team": "ATL",
      "opponent": "LA",
      "points": 39.9,
      "line": "22 rush att, 195 rush yd; 8 rec targets, 5 rec, 34 rec yd; 229 total yd"
    },
    {
      "week": 18,
      "team": "ATL",
      "opponent": "NO",
      "points": 7.3,
      "line": "15 rush att, 33 rush yd; 3 rec targets, 3 rec, 10 rec yd; 43 total yd"
    }
  ],
  "4": [
    {
      "week": 14,
      "team": "DET",
      "opponent": "DAL",
      "points": 37,
      "line": "12 rush att, 43 rush yd; 7 rec targets, 7 rec, 77 rec yd; 120 total yd"
    },
    {
      "week": 15,
      "team": "DET",
      "opponent": "LA",
      "points": 9.8,
      "line": "13 rush att, 38 rush yd; 7 rec targets, 4 rec, 20 rec yd; 58 total yd"
    },
    {
      "week": 16,
      "team": "DET",
      "opponent": "PIT",
      "points": 22.8,
      "line": "7 rush att, 2 rush yd; 13 rec targets, 10 rec, 66 rec yd; 68 total yd"
    },
    {
      "week": 17,
      "team": "DET",
      "opponent": "MIN",
      "points": 6.4,
      "line": "17 rush att, 41 rush yd; 3 rec targets, 2 rec, 23 rec yd; 64 total yd"
    },
    {
      "week": 18,
      "team": "DET",
      "opponent": "CHI",
      "points": 20.3,
      "line": "19 rush att, 80 rush yd; 5 rec targets, 3 rec, 33 rec yd; 113 total yd"
    }
  ],
  "5": [
    {
      "week": 13,
      "team": "BUF",
      "opponent": "PIT",
      "points": 16.7,
      "line": "23 pass att, 123 pass yd, 1 pass TD, 1 INT; 8 rush att, 38 rush yd"
    },
    {
      "week": 14,
      "team": "BUF",
      "opponent": "CIN",
      "points": 37.8,
      "line": "28 pass att, 251 pass yd, 3 pass TD, 0 INT; 9 rush att, 78 rush yd"
    },
    {
      "week": 15,
      "team": "BUF",
      "opponent": "NE",
      "points": 24.5,
      "line": "28 pass att, 193 pass yd, 3 pass TD, 0 INT; 11 rush att, 48 rush yd"
    },
    {
      "week": 16,
      "team": "BUF",
      "opponent": "CLE",
      "points": 6.9,
      "line": "19 pass att, 130 pass yd, 0 pass TD, 0 INT; 7 rush att, 17 rush yd"
    },
    {
      "week": 17,
      "team": "BUF",
      "opponent": "PHI",
      "points": 23.2,
      "line": "35 pass att, 262 pass yd, 0 pass TD, 0 INT; 7 rush att, 27 rush yd"
    }
  ],
  "6": [
    {
      "week": 14,
      "team": "IND",
      "opponent": "JAX",
      "points": 11.4,
      "line": "21 rush att, 74 rush yd; 0 rec targets, 0 rec, 0 rec yd; 74 total yd"
    },
    {
      "week": 15,
      "team": "IND",
      "opponent": "SEA",
      "points": 13.1,
      "line": "25 rush att, 87 rush yd; 4 rec targets, 3 rec, 14 rec yd; 101 total yd"
    },
    {
      "week": 16,
      "team": "IND",
      "opponent": "SF",
      "points": 16.9,
      "line": "16 rush att, 46 rush yd; 3 rec targets, 3 rec, 33 rec yd; 79 total yd"
    },
    {
      "week": 17,
      "team": "IND",
      "opponent": "JAX",
      "points": 17.4,
      "line": "21 rush att, 70 rush yd; 6 rec targets, 3 rec, 14 rec yd; 84 total yd"
    },
    {
      "week": 18,
      "team": "IND",
      "opponent": "HOU",
      "points": 5.9,
      "line": "14 rush att, 26 rush yd; 2 rec targets, 2 rec, 13 rec yd; 39 total yd"
    }
  ],
  "7": [
    {
      "week": 14,
      "team": "SEA",
      "opponent": "ATL",
      "points": 28.1,
      "line": "1 rush att, -1 rush yd; 10 rec targets, 7 rec, 92 rec yd; 91 total yd"
    },
    {
      "week": 15,
      "team": "SEA",
      "opponent": "IND",
      "points": 18.3,
      "line": "0 rush att, 0 rush yd; 9 rec targets, 7 rec, 113 rec yd; 113 total yd"
    },
    {
      "week": 16,
      "team": "SEA",
      "opponent": "LA",
      "points": 23.6,
      "line": "0 rush att, 0 rush yd; 13 rec targets, 8 rec, 96 rec yd; 96 total yd"
    },
    {
      "week": 17,
      "team": "SEA",
      "opponent": "CAR",
      "points": 16.2,
      "line": "0 rush att, 0 rush yd; 12 rec targets, 9 rec, 72 rec yd; 72 total yd"
    },
    {
      "week": 18,
      "team": "SEA",
      "opponent": "SF",
      "points": 14.4,
      "line": "0 rush att, 0 rush yd; 8 rec targets, 6 rec, 84 rec yd; 84 total yd"
    }
  ],
  "8": [
    {
      "week": 13,
      "team": "NE",
      "opponent": "NYG",
      "points": 20.5,
      "line": "31 pass att, 282 pass yd, 2 pass TD, 0 INT; 6 rush att, 12 rush yd"
    },
    {
      "week": 15,
      "team": "NE",
      "opponent": "BUF",
      "points": 20.5,
      "line": "23 pass att, 155 pass yd, 0 pass TD, 1 INT; 4 rush att, 43 rush yd"
    },
    {
      "week": 16,
      "team": "NE",
      "opponent": "BAL",
      "points": 23.7,
      "line": "44 pass att, 380 pass yd, 2 pass TD, 1 INT; 10 rush att, 25 rush yd"
    },
    {
      "week": 17,
      "team": "NE",
      "opponent": "NYJ",
      "points": 32.4,
      "line": "21 pass att, 256 pass yd, 5 pass TD, 0 INT; 3 rush att, 22 rush yd"
    },
    {
      "week": 18,
      "team": "NE",
      "opponent": "MIA",
      "points": 15.7,
      "line": "18 pass att, 191 pass yd, 1 pass TD, 0 INT; 5 rush att, 41 rush yd"
    }
  ],
  "9": [
    {
      "week": 14,
      "team": "LA",
      "opponent": "ARI",
      "points": 23.2,
      "line": "31 pass att, 281 pass yd, 3 pass TD, 0 INT; 0 rush att, 0 rush yd"
    },
    {
      "week": 15,
      "team": "LA",
      "opponent": "DET",
      "points": 20.9,
      "line": "38 pass att, 368 pass yd, 2 pass TD, 1 INT; 1 rush att, 2 rush yd"
    },
    {
      "week": 16,
      "team": "LA",
      "opponent": "SEA",
      "points": 30.9,
      "line": "49 pass att, 457 pass yd, 3 pass TD, 0 INT; 2 rush att, 6 rush yd"
    },
    {
      "week": 17,
      "team": "LA",
      "opponent": "ATL",
      "points": 12.8,
      "line": "38 pass att, 269 pass yd, 2 pass TD, 3 INT; 0 rush att, 0 rush yd"
    },
    {
      "week": 18,
      "team": "LA",
      "opponent": "ARI",
      "points": 26.7,
      "line": "40 pass att, 259 pass yd, 4 pass TD, 0 INT; 1 rush att, 3 rush yd"
    }
  ],
  "10": [
    {
      "week": 11,
      "team": "KC",
      "opponent": "DEN",
      "points": 13.3,
      "line": "45 pass att, 276 pass yd, 1 pass TD, 1 INT; 1 rush att, 3 rush yd"
    },
    {
      "week": 12,
      "team": "KC",
      "opponent": "IND",
      "points": 17.1,
      "line": "46 pass att, 352 pass yd, 0 pass TD, 1 INT; 4 rush att, 30 rush yd"
    },
    {
      "week": 13,
      "team": "KC",
      "opponent": "DAL",
      "points": 29.4,
      "line": "34 pass att, 261 pass yd, 4 pass TD, 0 INT; 3 rush att, 30 rush yd"
    },
    {
      "week": 14,
      "team": "KC",
      "opponent": "HOU",
      "points": 6.3,
      "line": "33 pass att, 160 pass yd, 0 pass TD, 3 INT; 7 rush att, 59 rush yd"
    },
    {
      "week": 15,
      "team": "KC",
      "opponent": "LAC",
      "points": 13.1,
      "line": "28 pass att, 189 pass yd, 0 pass TD, 1 INT; 2 rush att, 15 rush yd"
    }
  ],
  "11": [
    {
      "week": 13,
      "team": "MIA",
      "opponent": "NO",
      "points": 19.4,
      "line": "22 rush att, 134 rush yd; 1 rec target, 0 rec, 0 rec yd; 134 total yd"
    },
    {
      "week": 14,
      "team": "MIA",
      "opponent": "NYJ",
      "points": 17.5,
      "line": "7 rush att, 92 rush yd; 1 rec target, 1 rec, 13 rec yd; 105 total yd"
    },
    {
      "week": 15,
      "team": "MIA",
      "opponent": "PIT",
      "points": 18.7,
      "line": "12 rush att, 60 rush yd; 6 rec targets, 6 rec, 67 rec yd; 127 total yd"
    },
    {
      "week": 16,
      "team": "MIA",
      "opponent": "CIN",
      "points": 18,
      "line": "15 rush att, 81 rush yd; 3 rec targets, 3 rec, 9 rec yd; 90 total yd"
    },
    {
      "week": 17,
      "team": "MIA",
      "opponent": "TB",
      "points": 14.2,
      "line": "18 rush att, 83 rush yd; 3 rec targets, 3 rec, 29 rec yd; 112 total yd"
    }
  ],
  "12": [
    {
      "week": 14,
      "team": "JAX",
      "opponent": "IND",
      "points": 19.4,
      "line": "30 pass att, 244 pass yd, 2 pass TD, 0 INT; 4 rush att, 16 rush yd"
    },
    {
      "week": 15,
      "team": "JAX",
      "opponent": "NYJ",
      "points": 44.3,
      "line": "32 pass att, 330 pass yd, 5 pass TD, 0 INT; 5 rush att, 51 rush yd"
    },
    {
      "week": 16,
      "team": "JAX",
      "opponent": "DEN",
      "points": 31.2,
      "line": "36 pass att, 279 pass yd, 3 pass TD, 0 INT; 6 rush att, 20 rush yd"
    },
    {
      "week": 17,
      "team": "JAX",
      "opponent": "IND",
      "points": 23.1,
      "line": "37 pass att, 263 pass yd, 0 pass TD, 1 INT; 8 rush att, 26 rush yd"
    },
    {
      "week": 18,
      "team": "JAX",
      "opponent": "TEN",
      "points": 23.3,
      "line": "30 pass att, 255 pass yd, 3 pass TD, 0 INT; 2 rush att, 11 rush yd"
    }
  ],
  "13": [
    {
      "week": 14,
      "team": "CIN",
      "opponent": "BUF",
      "points": 10.2,
      "line": "1 rush att, 8 rush yd; 8 rec targets, 5 rec, 44 rec yd; 52 total yd"
    },
    {
      "week": 15,
      "team": "CIN",
      "opponent": "BAL",
      "points": 23.2,
      "line": "0 rush att, 0 rush yd; 16 rec targets, 10 rec, 132 rec yd; 132 total yd"
    },
    {
      "week": 16,
      "team": "CIN",
      "opponent": "MIA",
      "points": 19.9,
      "line": "0 rush att, 0 rush yd; 11 rec targets, 9 rec, 109 rec yd; 109 total yd"
    },
    {
      "week": 17,
      "team": "CIN",
      "opponent": "ARI",
      "points": 25,
      "line": "0 rush att, 0 rush yd; 9 rec targets, 7 rec, 60 rec yd; 60 total yd"
    },
    {
      "week": 18,
      "team": "CIN",
      "opponent": "CLE",
      "points": 23.6,
      "line": "0 rush att, 0 rush yd; 10 rec targets, 8 rec, 96 rec yd; 96 total yd"
    }
  ],
  "14": [
    {
      "week": 14,
      "team": "DET",
      "opponent": "DAL",
      "points": 15.2,
      "line": "0 rush att, 0 rush yd; 9 rec targets, 6 rec, 92 rec yd; 92 total yd"
    },
    {
      "week": 15,
      "team": "DET",
      "opponent": "LA",
      "points": 41.4,
      "line": "0 rush att, 0 rush yd; 18 rec targets, 13 rec, 164 rec yd; 164 total yd"
    },
    {
      "week": 16,
      "team": "DET",
      "opponent": "PIT",
      "points": 9.4,
      "line": "0 rush att, 0 rush yd; 9 rec targets, 4 rec, 54 rec yd; 54 total yd"
    },
    {
      "week": 17,
      "team": "DET",
      "opponent": "MIN",
      "points": 14.8,
      "line": "0 rush att, 0 rush yd; 13 rec targets, 8 rec, 68 rec yd; 68 total yd"
    },
    {
      "week": 18,
      "team": "DET",
      "opponent": "CHI",
      "points": 24.9,
      "line": "0 rush att, 0 rush yd; 15 rec targets, 11 rec, 139 rec yd; 139 total yd"
    }
  ],
  "15": [
    {
      "week": 14,
      "team": "CHI",
      "opponent": "GB",
      "points": 14.9,
      "line": "35 pass att, 186 pass yd, 2 pass TD, 1 INT; 4 rush att, 15 rush yd"
    },
    {
      "week": 15,
      "team": "CHI",
      "opponent": "CLE",
      "points": 19,
      "line": "28 pass att, 242 pass yd, 2 pass TD, 0 INT; 3 rush att, 13 rush yd"
    },
    {
      "week": 16,
      "team": "CHI",
      "opponent": "GB",
      "points": 21,
      "line": "34 pass att, 250 pass yd, 2 pass TD, 0 INT; 3 rush att, 30 rush yd"
    },
    {
      "week": 17,
      "team": "CHI",
      "opponent": "SF",
      "points": 23,
      "line": "42 pass att, 330 pass yd, 2 pass TD, 0 INT; 5 rush att, 18 rush yd"
    },
    {
      "week": 18,
      "team": "CHI",
      "opponent": "DET",
      "points": 16.6,
      "line": "33 pass att, 212 pass yd, 2 pass TD, 1 INT; 1 rush att, 1 rush yd"
    }
  ],
  "16": [
    {
      "week": 13,
      "team": "PHI",
      "opponent": "CHI",
      "points": 16.3,
      "line": "34 pass att, 230 pass yd, 2 pass TD, 1 INT; 4 rush att, 31 rush yd"
    },
    {
      "week": 14,
      "team": "PHI",
      "opponent": "LAC",
      "points": 2.4,
      "line": "40 pass att, 240 pass yd, 0 pass TD, 4 INT; 4 rush att, 8 rush yd"
    },
    {
      "week": 15,
      "team": "PHI",
      "opponent": "LV",
      "points": 22.9,
      "line": "15 pass att, 175 pass yd, 3 pass TD, 0 INT; 7 rush att, 39 rush yd"
    },
    {
      "week": 16,
      "team": "PHI",
      "opponent": "WAS",
      "points": 19.4,
      "line": "30 pass att, 185 pass yd, 2 pass TD, 0 INT; 7 rush att, 40 rush yd"
    },
    {
      "week": 17,
      "team": "PHI",
      "opponent": "BUF",
      "points": 8.9,
      "line": "27 pass att, 110 pass yd, 1 pass TD, 0 INT; 3 rush att, 5 rush yd"
    }
  ],
  "17": [
    {
      "week": 14,
      "team": "ARI",
      "opponent": "LA",
      "points": 10.8,
      "line": "0 rush att, 0 rush yd; 9 rec targets, 5 rec, 58 rec yd; 58 total yd"
    },
    {
      "week": 15,
      "team": "ARI",
      "opponent": "HOU",
      "points": 37.4,
      "line": "0 rush att, 0 rush yd; 13 rec targets, 12 rec, 134 rec yd; 134 total yd"
    },
    {
      "week": 16,
      "team": "ARI",
      "opponent": "ATL",
      "points": 6.7,
      "line": "0 rush att, 0 rush yd; 8 rec targets, 4 rec, 27 rec yd; 27 total yd"
    },
    {
      "week": 17,
      "team": "ARI",
      "opponent": "CIN",
      "points": 23.6,
      "line": "0 rush att, 0 rush yd; 13 rec targets, 10 rec, 76 rec yd; 76 total yd"
    },
    {
      "week": 18,
      "team": "ARI",
      "opponent": "LA",
      "points": 13.5,
      "line": "0 rush att, 0 rush yd; 8 rec targets, 7 rec, 65 rec yd; 65 total yd"
    }
  ],
  "18": [
    {
      "week": 14,
      "team": "DAL",
      "opponent": "DET",
      "points": 18.4,
      "line": "47 pass att, 376 pass yd, 1 pass TD, 2 INT; 3 rush att, 14 rush yd"
    },
    {
      "week": 15,
      "team": "DAL",
      "opponent": "MIN",
      "points": 12,
      "line": "38 pass att, 294 pass yd, 0 pass TD, 0 INT; 1 rush att, 2 rush yd"
    },
    {
      "week": 16,
      "team": "DAL",
      "opponent": "LAC",
      "points": 19.2,
      "line": "30 pass att, 244 pass yd, 2 pass TD, 0 INT; 2 rush att, 14 rush yd"
    },
    {
      "week": 17,
      "team": "DAL",
      "opponent": "WAS",
      "points": 22.7,
      "line": "37 pass att, 307 pass yd, 2 pass TD, 0 INT; 4 rush att, 24 rush yd"
    },
    {
      "week": 18,
      "team": "DAL",
      "opponent": "NYG",
      "points": 0.7,
      "line": "11 pass att, 70 pass yd, 0 pass TD, 0 INT; 2 rush att, -1 rush yd"
    }
  ],
  "19": [
    {
      "week": 14,
      "team": "DEN",
      "opponent": "LV",
      "points": 16,
      "line": "38 pass att, 212 pass yd, 0 pass TD, 0 INT; 3 rush att, 15 rush yd"
    },
    {
      "week": 15,
      "team": "DEN",
      "opponent": "GB",
      "points": 29.1,
      "line": "34 pass att, 302 pass yd, 4 pass TD, 0 INT; 7 rush att, 10 rush yd"
    },
    {
      "week": 16,
      "team": "DEN",
      "opponent": "JAX",
      "points": 15.2,
      "line": "47 pass att, 352 pass yd, 1 pass TD, 1 INT; 4 rush att, 11 rush yd"
    },
    {
      "week": 17,
      "team": "DEN",
      "opponent": "KC",
      "points": 19.5,
      "line": "38 pass att, 182 pass yd, 1 pass TD, 1 INT; 9 rush att, 42 rush yd"
    },
    {
      "week": 18,
      "team": "DEN",
      "opponent": "LAC",
      "points": 10.5,
      "line": "23 pass att, 141 pass yd, 0 pass TD, 0 INT; 8 rush att, 49 rush yd"
    }
  ],
  "20": [
    {
      "week": 13,
      "team": "LAC",
      "opponent": "LV",
      "points": 12.8,
      "line": "20 pass att, 151 pass yd, 2 pass TD, 1 INT; 3 rush att, 8 rush yd"
    },
    {
      "week": 14,
      "team": "LAC",
      "opponent": "PHI",
      "points": 12.2,
      "line": "26 pass att, 139 pass yd, 1 pass TD, 1 INT; 10 rush att, 66 rush yd"
    },
    {
      "week": 15,
      "team": "LAC",
      "opponent": "KC",
      "points": 10.4,
      "line": "29 pass att, 210 pass yd, 1 pass TD, 1 INT; 2 rush att, 0 rush yd"
    },
    {
      "week": 16,
      "team": "LAC",
      "opponent": "DAL",
      "points": 30.2,
      "line": "29 pass att, 300 pass yd, 2 pass TD, 0 INT; 8 rush att, 42 rush yd"
    },
    {
      "week": 17,
      "team": "LAC",
      "opponent": "HOU",
      "points": 15.1,
      "line": "32 pass att, 236 pass yd, 1 pass TD, 1 INT; 6 rush att, 37 rush yd"
    }
  ],
  "21": [
    {
      "week": 14,
      "team": "BUF",
      "opponent": "CIN",
      "points": 11.1,
      "line": "18 rush att, 80 rush yd; 2 rec targets, 2 rec, 31 rec yd; 111 total yd"
    },
    {
      "week": 15,
      "team": "BUF",
      "opponent": "NE",
      "points": 31.1,
      "line": "22 rush att, 107 rush yd; 3 rec targets, 2 rec, 4 rec yd; 111 total yd"
    },
    {
      "week": 16,
      "team": "BUF",
      "opponent": "CLE",
      "points": 26.4,
      "line": "16 rush att, 117 rush yd; 2 rec targets, 1 rec, 17 rec yd; 134 total yd"
    },
    {
      "week": 17,
      "team": "BUF",
      "opponent": "PHI",
      "points": 8.7,
      "line": "20 rush att, 74 rush yd; 4 rec targets, 1 rec, 3 rec yd; 77 total yd"
    },
    {
      "week": 18,
      "team": "BUF",
      "opponent": "NYJ",
      "points": 1.5,
      "line": "2 rush att, 15 rush yd; 0 rec targets, 0 rec, 0 rec yd; 15 total yd"
    }
  ],
  "22": [
    {
      "week": 14,
      "team": "DET",
      "opponent": "DAL",
      "points": 16.2,
      "line": "34 pass att, 309 pass yd, 1 pass TD, 0 INT; 2 rush att, -2 rush yd"
    },
    {
      "week": 15,
      "team": "DET",
      "opponent": "LA",
      "points": 25.5,
      "line": "41 pass att, 338 pass yd, 3 pass TD, 0 INT; 0 rush att, 0 rush yd"
    },
    {
      "week": 16,
      "team": "DET",
      "opponent": "PIT",
      "points": 26.5,
      "line": "54 pass att, 364 pass yd, 3 pass TD, 0 INT; 1 rush att, -1 rush yd"
    },
    {
      "week": 17,
      "team": "DET",
      "opponent": "MIN",
      "points": 2.1,
      "line": "29 pass att, 197 pass yd, 1 pass TD, 2 INT; 3 rush att, 2 rush yd"
    },
    {
      "week": 18,
      "team": "DET",
      "opponent": "CHI",
      "points": 15.2,
      "line": "42 pass att, 331 pass yd, 1 pass TD, 1 INT; 0 rush att, 0 rush yd"
    }
  ],
  "23": [
    {
      "week": 9,
      "team": "IND",
      "opponent": "PIT",
      "points": 14.1,
      "line": "50 pass att, 342 pass yd, 1 pass TD, 3 INT; 3 rush att, 4 rush yd"
    },
    {
      "week": 10,
      "team": "IND",
      "opponent": "ATL",
      "points": 15.5,
      "line": "26 pass att, 255 pass yd, 1 pass TD, 1 INT; 7 rush att, 53 rush yd"
    },
    {
      "week": 12,
      "team": "IND",
      "opponent": "KC",
      "points": 16.8,
      "line": "31 pass att, 181 pass yd, 2 pass TD, 0 INT; 3 rush att, 16 rush yd"
    },
    {
      "week": 13,
      "team": "IND",
      "opponent": "HOU",
      "points": 16.1,
      "line": "27 pass att, 201 pass yd, 2 pass TD, 0 INT; 1 rush att, 1 rush yd"
    },
    {
      "week": 14,
      "team": "IND",
      "opponent": "JAX",
      "points": 0.8,
      "line": "7 pass att, 60 pass yd, 0 pass TD, 1 INT; 1 rush att, 4 rush yd"
    }
  ],
  "24": [
    {
      "week": 13,
      "team": "NYG",
      "opponent": "NE",
      "points": 13.6,
      "line": "24 pass att, 139 pass yd, 1 pass TD, 0 INT; 4 rush att, 20 rush yd"
    },
    {
      "week": 15,
      "team": "NYG",
      "opponent": "WAS",
      "points": 22.1,
      "line": "36 pass att, 246 pass yd, 2 pass TD, 1 INT; 9 rush att, 63 rush yd"
    },
    {
      "week": 16,
      "team": "NYG",
      "opponent": "MIN",
      "points": 0,
      "line": "13 pass att, 33 pass yd, 0 pass TD, 1 INT; 2 rush att, 7 rush yd"
    },
    {
      "week": 17,
      "team": "NYG",
      "opponent": "LV",
      "points": 25.1,
      "line": "30 pass att, 207 pass yd, 0 pass TD, 0 INT; 9 rush att, 48 rush yd"
    },
    {
      "week": 18,
      "team": "NYG",
      "opponent": "DAL",
      "points": 20.4,
      "line": "32 pass att, 230 pass yd, 2 pass TD, 0 INT; 5 rush att, 32 rush yd"
    }
  ],
  "25": [
    {
      "week": 14,
      "team": "DAL",
      "opponent": "DET",
      "points": 8.7,
      "line": "0 rush att, 0 rush yd; 9 rec targets, 5 rec, 37 rec yd; 37 total yd"
    },
    {
      "week": 15,
      "team": "DAL",
      "opponent": "MIN",
      "points": 6.3,
      "line": "0 rush att, 0 rush yd; 6 rec targets, 3 rec, 33 rec yd; 33 total yd"
    },
    {
      "week": 16,
      "team": "DAL",
      "opponent": "LAC",
      "points": 26,
      "line": "0 rush att, 0 rush yd; 9 rec targets, 7 rec, 130 rec yd; 130 total yd"
    },
    {
      "week": 17,
      "team": "DAL",
      "opponent": "WAS",
      "points": 11.8,
      "line": "0 rush att, 0 rush yd; 5 rec targets, 4 rec, 78 rec yd; 78 total yd"
    },
    {
      "week": 18,
      "team": "DAL",
      "opponent": "NYG",
      "points": 1.9,
      "line": "0 rush att, 0 rush yd; 3 rec targets, 1 rec, 9 rec yd; 9 total yd"
    }
  ],
  "26": [
    {
      "week": 13,
      "team": "NO",
      "opponent": "MIA",
      "points": 14.7,
      "line": "0 rush att, 0 rush yd; 7 rec targets, 4 rec, 47 rec yd; 47 total yd"
    },
    {
      "week": 14,
      "team": "NO",
      "opponent": "TB",
      "points": 6,
      "line": "0 rush att, 0 rush yd; 5 rec targets, 3 rec, 30 rec yd; 30 total yd"
    },
    {
      "week": 15,
      "team": "NO",
      "opponent": "CAR",
      "points": 20.5,
      "line": "0 rush att, 0 rush yd; 9 rec targets, 6 rec, 85 rec yd; 85 total yd"
    },
    {
      "week": 16,
      "team": "NO",
      "opponent": "NYJ",
      "points": 36.8,
      "line": "0 rush att, 0 rush yd; 16 rec targets, 10 rec, 148 rec yd; 148 total yd"
    },
    {
      "week": 17,
      "team": "NO",
      "opponent": "TEN",
      "points": 25.9,
      "line": "0 rush att, 0 rush yd; 11 rec targets, 8 rec, 119 rec yd; 119 total yd"
    }
  ],
  "27": [
    {
      "week": 14,
      "team": "CIN",
      "opponent": "BUF",
      "points": 18.5,
      "line": "12 rush att, 23 rush yd; 4 rec targets, 3 rec, 12 rec yd; 35 total yd"
    },
    {
      "week": 15,
      "team": "CIN",
      "opponent": "BAL",
      "points": 16,
      "line": "13 rush att, 53 rush yd; 7 rec targets, 7 rec, 37 rec yd; 90 total yd"
    },
    {
      "week": 16,
      "team": "CIN",
      "opponent": "MIA",
      "points": 32.9,
      "line": "12 rush att, 66 rush yd; 4 rec targets, 4 rec, 43 rec yd; 109 total yd"
    },
    {
      "week": 17,
      "team": "CIN",
      "opponent": "ARI",
      "points": 29.1,
      "line": "22 rush att, 101 rush yd; 3 rec targets, 3 rec, 40 rec yd; 141 total yd"
    },
    {
      "week": 18,
      "team": "CIN",
      "opponent": "CLE",
      "points": 19,
      "line": "13 rush att, 72 rush yd; 6 rec targets, 4 rec, 18 rec yd; 90 total yd"
    }
  ],
  "28": [
    {
      "week": 13,
      "team": "BAL",
      "opponent": "CIN",
      "points": 6.5,
      "line": "32 pass att, 246 pass yd, 0 pass TD, 1 INT; 6 rush att, 27 rush yd"
    },
    {
      "week": 14,
      "team": "BAL",
      "opponent": "PIT",
      "points": 21.1,
      "line": "35 pass att, 219 pass yd, 1 pass TD, 1 INT; 7 rush att, 43 rush yd"
    },
    {
      "week": 15,
      "team": "BAL",
      "opponent": "CIN",
      "points": 14.6,
      "line": "12 pass att, 150 pass yd, 2 pass TD, 1 INT; 2 rush att, 26 rush yd"
    },
    {
      "week": 16,
      "team": "BAL",
      "opponent": "NE",
      "points": 4.7,
      "line": "10 pass att, 101 pass yd, 0 pass TD, 0 INT; 2 rush att, 7 rush yd"
    },
    {
      "week": 18,
      "team": "BAL",
      "opponent": "PIT",
      "points": 20.4,
      "line": "18 pass att, 238 pass yd, 3 pass TD, 1 INT; 4 rush att, 9 rush yd"
    }
  ],
  "29": [
    {
      "week": 14,
      "team": "BAL",
      "opponent": "PIT",
      "points": 11.2,
      "line": "25 rush att, 94 rush yd; 2 rec targets, 1 rec, 8 rec yd; 102 total yd"
    },
    {
      "week": 15,
      "team": "BAL",
      "opponent": "CIN",
      "points": 10,
      "line": "11 rush att, 100 rush yd; 0 rec targets, 0 rec, 0 rec yd; 100 total yd"
    },
    {
      "week": 16,
      "team": "BAL",
      "opponent": "NE",
      "points": 22.8,
      "line": "18 rush att, 128 rush yd; 0 rec targets, 0 rec, 0 rec yd; 128 total yd"
    },
    {
      "week": 17,
      "team": "BAL",
      "opponent": "GB",
      "points": 45.6,
      "line": "36 rush att, 216 rush yd; 0 rec targets, 0 rec, 0 rec yd; 216 total yd"
    },
    {
      "week": 18,
      "team": "BAL",
      "opponent": "PIT",
      "points": 12.6,
      "line": "20 rush att, 126 rush yd; 1 rec target, 0 rec, 0 rec yd; 126 total yd"
    }
  ],
  "30": [
    {
      "week": 14,
      "team": "ARI",
      "opponent": "LA",
      "points": 19,
      "line": "44 pass att, 271 pass yd, 2 pass TD, 1 INT; 4 rush att, 22 rush yd"
    },
    {
      "week": 15,
      "team": "ARI",
      "opponent": "HOU",
      "points": 20.6,
      "line": "40 pass att, 249 pass yd, 3 pass TD, 1 INT; 3 rush att, 6 rush yd"
    },
    {
      "week": 16,
      "team": "ARI",
      "opponent": "ATL",
      "points": 10.6,
      "line": "31 pass att, 203 pass yd, 1 pass TD, 1 INT; 1 rush att, 5 rush yd"
    },
    {
      "week": 17,
      "team": "ARI",
      "opponent": "CIN",
      "points": 16.5,
      "line": "37 pass att, 212 pass yd, 2 pass TD, 0 INT; 0 rush att, 0 rush yd"
    },
    {
      "week": 18,
      "team": "ARI",
      "opponent": "LA",
      "points": 15.6,
      "line": "31 pass att, 243 pass yd, 2 pass TD, 1 INT; 3 rush att, 19 rush yd"
    }
  ],
  "31": [
    {
      "week": 14,
      "team": "TB",
      "opponent": "NO",
      "points": 11.1,
      "line": "30 pass att, 122 pass yd, 1 pass TD, 1 INT; 6 rush att, 42 rush yd"
    },
    {
      "week": 15,
      "team": "TB",
      "opponent": "ATL",
      "points": 19.2,
      "line": "34 pass att, 277 pass yd, 2 pass TD, 1 INT; 1 rush att, 1 rush yd"
    },
    {
      "week": 16,
      "team": "TB",
      "opponent": "CAR",
      "points": 12.7,
      "line": "26 pass att, 145 pass yd, 1 pass TD, 1 INT; 4 rush att, 49 rush yd"
    },
    {
      "week": 17,
      "team": "TB",
      "opponent": "MIA",
      "points": 17.4,
      "line": "44 pass att, 346 pass yd, 2 pass TD, 2 INT; 3 rush att, 16 rush yd"
    },
    {
      "week": 18,
      "team": "TB",
      "opponent": "CAR",
      "points": 13.2,
      "line": "22 pass att, 203 pass yd, 1 pass TD, 1 INT; 4 rush att, 31 rush yd"
    }
  ],
  "32": [
    {
      "week": 11,
      "team": "LA",
      "opponent": "SEA",
      "points": 7.1,
      "line": "0 rush att, 0 rush yd; 8 rec targets, 1 rec, 1 rec yd; 1 total yd"
    },
    {
      "week": 12,
      "team": "LA",
      "opponent": "TB",
      "points": 23.2,
      "line": "0 rush att, 0 rush yd; 8 rec targets, 5 rec, 62 rec yd; 62 total yd"
    },
    {
      "week": 13,
      "team": "LA",
      "opponent": "CAR",
      "points": 21.8,
      "line": "0 rush att, 0 rush yd; 5 rec targets, 4 rec, 58 rec yd; 58 total yd"
    },
    {
      "week": 14,
      "team": "LA",
      "opponent": "ARI",
      "points": 6.9,
      "line": "0 rush att, 0 rush yd; 6 rec targets, 4 rec, 29 rec yd; 29 total yd"
    },
    {
      "week": 15,
      "team": "LA",
      "opponent": "DET",
      "points": 11.1,
      "line": "0 rush att, 0 rush yd; 9 rec targets, 4 rec, 71 rec yd; 71 total yd"
    }
  ],
  "33": [
    {
      "week": 13,
      "team": "GB",
      "opponent": "DET",
      "points": 10.1,
      "line": "17 rush att, 83 rush yd; 1 rec target, 1 rec, 8 rec yd; 91 total yd"
    },
    {
      "week": 14,
      "team": "GB",
      "opponent": "CHI",
      "points": 17.2,
      "line": "20 rush att, 86 rush yd; 2 rec targets, 2 rec, 6 rec yd; 92 total yd"
    },
    {
      "week": 15,
      "team": "GB",
      "opponent": "DEN",
      "points": 23.2,
      "line": "12 rush att, 73 rush yd; 3 rec targets, 2 rec, 19 rec yd; 92 total yd"
    },
    {
      "week": 16,
      "team": "GB",
      "opponent": "CHI",
      "points": 4.8,
      "line": "12 rush att, 36 rush yd; 2 rec targets, 2 rec, 12 rec yd; 48 total yd"
    },
    {
      "week": 17,
      "team": "GB",
      "opponent": "BAL",
      "points": 1.3,
      "line": "4 rush att, 3 rush yd; 1 rec target, 1 rec, 0 rec yd; 3 total yd"
    }
  ],
  "34": [
    {
      "week": 12,
      "team": "GB",
      "opponent": "MIN",
      "points": 7.1,
      "line": "21 pass att, 139 pass yd, 0 pass TD, 0 INT; 3 rush att, 15 rush yd"
    },
    {
      "week": 13,
      "team": "GB",
      "opponent": "DET",
      "points": 25.8,
      "line": "30 pass att, 234 pass yd, 4 pass TD, 0 INT; 5 rush att, 4 rush yd"
    },
    {
      "week": 14,
      "team": "GB",
      "opponent": "CHI",
      "points": 19.3,
      "line": "25 pass att, 234 pass yd, 3 pass TD, 1 INT; 1 rush att, -1 rush yd"
    },
    {
      "week": 15,
      "team": "GB",
      "opponent": "DEN",
      "points": 13.9,
      "line": "40 pass att, 276 pass yd, 1 pass TD, 2 INT; 3 rush att, 29 rush yd"
    },
    {
      "week": 16,
      "team": "GB",
      "opponent": "CHI",
      "points": 3.8,
      "line": "13 pass att, 77 pass yd, 0 pass TD, 0 INT; 2 rush att, 7 rush yd"
    }
  ],
  "35": [
    {
      "week": 14,
      "team": "LA",
      "opponent": "ARI",
      "points": 17.7,
      "line": "13 rush att, 84 rush yd; 2 rec targets, 2 rec, 13 rec yd; 97 total yd"
    },
    {
      "week": 15,
      "team": "LA",
      "opponent": "DET",
      "points": 21.8,
      "line": "15 rush att, 78 rush yd; 1 rec target, 1 rec, 10 rec yd; 88 total yd"
    },
    {
      "week": 16,
      "team": "LA",
      "opponent": "SEA",
      "points": 11.5,
      "line": "23 rush att, 70 rush yd; 6 rec targets, 3 rec, 15 rec yd; 85 total yd"
    },
    {
      "week": 17,
      "team": "LA",
      "opponent": "ATL",
      "points": 16,
      "line": "13 rush att, 92 rush yd; 3 rec targets, 3 rec, 38 rec yd; 130 total yd"
    },
    {
      "week": 18,
      "team": "LA",
      "opponent": "ARI",
      "points": 11.1,
      "line": "12 rush att, 60 rush yd; 5 rec targets, 3 rec, 21 rec yd; 81 total yd"
    }
  ],
  "36": [
    {
      "week": 13,
      "team": "DAL",
      "opponent": "KC",
      "points": 17,
      "line": "17 rush att, 59 rush yd; 3 rec targets, 3 rec, 21 rec yd; 80 total yd"
    },
    {
      "week": 14,
      "team": "DAL",
      "opponent": "DET",
      "points": 14.7,
      "line": "17 rush att, 67 rush yd; 4 rec targets, 2 rec, 0 rec yd; 67 total yd"
    },
    {
      "week": 15,
      "team": "DAL",
      "opponent": "MIN",
      "points": 15.1,
      "line": "15 rush att, 91 rush yd; 0 rec targets, 0 rec, 0 rec yd; 91 total yd"
    },
    {
      "week": 16,
      "team": "DAL",
      "opponent": "LAC",
      "points": 6.3,
      "line": "9 rush att, 34 rush yd; 3 rec targets, 2 rec, 9 rec yd; 43 total yd"
    },
    {
      "week": 17,
      "team": "DAL",
      "opponent": "WAS",
      "points": 11.4,
      "line": "13 rush att, 54 rush yd; 2 rec targets, 0 rec, 0 rec yd; 54 total yd"
    }
  ],
  "37": [
    {
      "week": 13,
      "team": "HOU",
      "opponent": "IND",
      "points": 21.5,
      "line": "1 rush att, 7 rush yd; 10 rec targets, 5 rec, 98 rec yd; 105 total yd"
    },
    {
      "week": 14,
      "team": "HOU",
      "opponent": "KC",
      "points": 16.1,
      "line": "0 rush att, 0 rush yd; 8 rec targets, 4 rec, 121 rec yd; 121 total yd"
    },
    {
      "week": 15,
      "team": "HOU",
      "opponent": "ARI",
      "points": 23.5,
      "line": "0 rush att, 0 rush yd; 4 rec targets, 3 rec, 85 rec yd; 85 total yd"
    },
    {
      "week": 16,
      "team": "HOU",
      "opponent": "LV",
      "points": 9.9,
      "line": "0 rush att, 0 rush yd; 9 rec targets, 4 rec, 59 rec yd; 59 total yd"
    },
    {
      "week": 17,
      "team": "HOU",
      "opponent": "LAC",
      "points": 8.7,
      "line": "0 rush att, 0 rush yd; 4 rec targets, 3 rec, 57 rec yd; 57 total yd"
    }
  ],
  "39": [
    {
      "week": 14,
      "team": "HOU",
      "opponent": "KC",
      "points": 12.6,
      "line": "31 pass att, 203 pass yd, 1 pass TD, 0 INT; 2 rush att, 5 rush yd"
    },
    {
      "week": 15,
      "team": "HOU",
      "opponent": "ARI",
      "points": 23.4,
      "line": "29 pass att, 260 pass yd, 3 pass TD, 0 INT; 6 rush att, 10 rush yd"
    },
    {
      "week": 16,
      "team": "HOU",
      "opponent": "LV",
      "points": 11.5,
      "line": "35 pass att, 187 pass yd, 1 pass TD, 0 INT; 4 rush att, 0 rush yd"
    },
    {
      "week": 17,
      "team": "HOU",
      "opponent": "LAC",
      "points": 13.8,
      "line": "28 pass att, 244 pass yd, 2 pass TD, 2 INT; 4 rush att, 0 rush yd"
    },
    {
      "week": 18,
      "team": "HOU",
      "opponent": "IND",
      "points": 17.3,
      "line": "23 pass att, 169 pass yd, 1 pass TD, 0 INT; 2 rush att, 5 rush yd"
    }
  ],
  "40": [
    {
      "week": 13,
      "team": "PHI",
      "opponent": "CHI",
      "points": 35.2,
      "line": "0 rush att, 0 rush yd; 12 rec targets, 10 rec, 132 rec yd; 132 total yd"
    },
    {
      "week": 14,
      "team": "PHI",
      "opponent": "LAC",
      "points": 16,
      "line": "0 rush att, 0 rush yd; 13 rec targets, 6 rec, 100 rec yd; 100 total yd"
    },
    {
      "week": 15,
      "team": "PHI",
      "opponent": "LV",
      "points": 12.1,
      "line": "0 rush att, 0 rush yd; 2 rec targets, 2 rec, 41 rec yd; 41 total yd"
    },
    {
      "week": 16,
      "team": "PHI",
      "opponent": "WAS",
      "points": 18.5,
      "line": "0 rush att, 0 rush yd; 12 rec targets, 9 rec, 95 rec yd; 95 total yd"
    },
    {
      "week": 17,
      "team": "PHI",
      "opponent": "BUF",
      "points": 11.8,
      "line": "0 rush att, 0 rush yd; 7 rec targets, 5 rec, 68 rec yd; 68 total yd"
    }
  ],
  "41": [
    {
      "week": 13,
      "team": "PHI",
      "opponent": "CHI",
      "points": 5.6,
      "line": "13 rush att, 56 rush yd; 2 rec targets, 0 rec, 0 rec yd; 56 total yd"
    },
    {
      "week": 14,
      "team": "PHI",
      "opponent": "LAC",
      "points": 18.2,
      "line": "20 rush att, 122 rush yd; 2 rec targets, 0 rec, 0 rec yd; 122 total yd"
    },
    {
      "week": 15,
      "team": "PHI",
      "opponent": "LV",
      "points": 17.2,
      "line": "22 rush att, 78 rush yd; 3 rec targets, 2 rec, 14 rec yd; 92 total yd"
    },
    {
      "week": 16,
      "team": "PHI",
      "opponent": "WAS",
      "points": 21.2,
      "line": "21 rush att, 132 rush yd; 2 rec targets, 0 rec, 0 rec yd; 132 total yd"
    },
    {
      "week": 17,
      "team": "PHI",
      "opponent": "BUF",
      "points": 6.8,
      "line": "19 rush att, 68 rush yd; 0 rec targets, 0 rec, 0 rec yd; 68 total yd"
    }
  ],
  "42": [
    {
      "week": 14,
      "team": "LV",
      "opponent": "DEN",
      "points": 5.8,
      "line": "10 rush att, 30 rush yd; 4 rec targets, 2 rec, 8 rec yd; 38 total yd"
    },
    {
      "week": 15,
      "team": "LV",
      "opponent": "PHI",
      "points": 8.2,
      "line": "9 rush att, 35 rush yd; 6 rec targets, 4 rec, 7 rec yd; 42 total yd"
    },
    {
      "week": 16,
      "team": "LV",
      "opponent": "HOU",
      "points": 31.8,
      "line": "24 rush att, 128 rush yd; 2 rec targets, 1 rec, 60 rec yd; 188 total yd"
    },
    {
      "week": 17,
      "team": "LV",
      "opponent": "NYG",
      "points": 9.3,
      "line": "16 rush att, 60 rush yd; 2 rec targets, 2 rec, 13 rec yd; 73 total yd"
    },
    {
      "week": 18,
      "team": "LV",
      "opponent": "KC",
      "points": 12.4,
      "line": "26 rush att, 87 rush yd; 5 rec targets, 3 rec, 7 rec yd; 94 total yd"
    }
  ],
  "43": [
    {
      "week": 14,
      "team": "DAL",
      "opponent": "DET",
      "points": 18.1,
      "line": "0 rush att, 0 rush yd; 8 rec targets, 6 rec, 121 rec yd; 121 total yd"
    },
    {
      "week": 15,
      "team": "DAL",
      "opponent": "MIN",
      "points": 17.1,
      "line": "0 rush att, 0 rush yd; 10 rec targets, 6 rec, 111 rec yd; 111 total yd"
    },
    {
      "week": 16,
      "team": "DAL",
      "opponent": "LAC",
      "points": 11.1,
      "line": "0 rush att, 0 rush yd; 7 rec targets, 6 rec, 51 rec yd; 51 total yd"
    },
    {
      "week": 17,
      "team": "DAL",
      "opponent": "WAS",
      "points": 9.6,
      "line": "0 rush att, 0 rush yd; 10 rec targets, 5 rec, 46 rec yd; 46 total yd"
    },
    {
      "week": 18,
      "team": "DAL",
      "opponent": "NYG",
      "points": 1.4,
      "line": "0 rush att, 0 rush yd; 1 rec target, 1 rec, 4 rec yd; 4 total yd"
    }
  ],
  "44": [
    {
      "week": 14,
      "team": "BAL",
      "opponent": "PIT",
      "points": 20.6,
      "line": "1 rush att, 2 rush yd; 11 rec targets, 8 rec, 124 rec yd; 126 total yd"
    },
    {
      "week": 15,
      "team": "BAL",
      "opponent": "CIN",
      "points": 15.8,
      "line": "0 rush att, 0 rush yd; 5 rec targets, 3 rec, 68 rec yd; 68 total yd"
    },
    {
      "week": 16,
      "team": "BAL",
      "opponent": "NE",
      "points": 21.2,
      "line": "1 rush att, 18 rush yd; 7 rec targets, 7 rec, 84 rec yd; 102 total yd"
    },
    {
      "week": 17,
      "team": "BAL",
      "opponent": "GB",
      "points": 13,
      "line": "0 rush att, 0 rush yd; 5 rec targets, 4 rec, 30 rec yd; 30 total yd"
    },
    {
      "week": 18,
      "team": "BAL",
      "opponent": "PIT",
      "points": 29.8,
      "line": "0 rush att, 0 rush yd; 6 rec targets, 4 rec, 138 rec yd; 138 total yd"
    }
  ],
  "45": [
    {
      "week": 14,
      "team": "CHI",
      "opponent": "GB",
      "points": 11.2,
      "line": "13 rush att, 63 rush yd; 4 rec targets, 3 rec, 19 rec yd; 82 total yd"
    },
    {
      "week": 15,
      "team": "CHI",
      "opponent": "CLE",
      "points": 22.6,
      "line": "18 rush att, 98 rush yd; 1 rec target, 1 rec, -2 rec yd; 96 total yd"
    },
    {
      "week": 16,
      "team": "CHI",
      "opponent": "GB",
      "points": 9,
      "line": "13 rush att, 58 rush yd; 2 rec targets, 2 rec, 12 rec yd; 70 total yd"
    },
    {
      "week": 17,
      "team": "CHI",
      "opponent": "SF",
      "points": 21.9,
      "line": "9 rush att, 54 rush yd; 3 rec targets, 2 rec, 25 rec yd; 79 total yd"
    },
    {
      "week": 18,
      "team": "CHI",
      "opponent": "DET",
      "points": 5.8,
      "line": "10 rush att, 40 rush yd; 2 rec targets, 1 rec, 8 rec yd; 48 total yd"
    }
  ],
  "46": [
    {
      "week": 14,
      "team": "PIT",
      "opponent": "BAL",
      "points": 21.5,
      "line": "34 pass att, 284 pass yd, 1 pass TD, 0 INT; 2 rush att, 0 rush yd"
    },
    {
      "week": 15,
      "team": "PIT",
      "opponent": "MIA",
      "points": 17,
      "line": "27 pass att, 224 pass yd, 2 pass TD, 0 INT; 0 rush att, 0 rush yd"
    },
    {
      "week": 16,
      "team": "PIT",
      "opponent": "DET",
      "points": 15.5,
      "line": "41 pass att, 266 pass yd, 1 pass TD, 0 INT; 2 rush att, 9 rush yd"
    },
    {
      "week": 17,
      "team": "PIT",
      "opponent": "CLE",
      "points": 7.3,
      "line": "39 pass att, 168 pass yd, 0 pass TD, 0 INT; 1 rush att, 6 rush yd"
    },
    {
      "week": 18,
      "team": "PIT",
      "opponent": "BAL",
      "points": 17.8,
      "line": "47 pass att, 294 pass yd, 1 pass TD, 0 INT; 1 rush att, 20 rush yd"
    }
  ],
  "47": [
    {
      "week": 12,
      "team": "CIN",
      "opponent": "NE",
      "points": 8.1,
      "line": "0 rush att, 0 rush yd; 6 rec targets, 5 rec, 31 rec yd; 31 total yd"
    },
    {
      "week": 14,
      "team": "CIN",
      "opponent": "BUF",
      "points": 27.2,
      "line": "0 rush att, 0 rush yd; 11 rec targets, 6 rec, 92 rec yd; 92 total yd"
    },
    {
      "week": 16,
      "team": "CIN",
      "opponent": "MIA",
      "points": 14.3,
      "line": "0 rush att, 0 rush yd; 3 rec targets, 3 rec, 53 rec yd; 53 total yd"
    },
    {
      "week": 17,
      "team": "CIN",
      "opponent": "ARI",
      "points": 9.9,
      "line": "0 rush att, 0 rush yd; 5 rec targets, 4 rec, 59 rec yd; 59 total yd"
    },
    {
      "week": 18,
      "team": "CIN",
      "opponent": "CLE",
      "points": 18.7,
      "line": "0 rush att, 0 rush yd; 9 rec targets, 6 rec, 67 rec yd; 67 total yd"
    }
  ],
  "48": [
    {
      "week": 14,
      "team": "SEA",
      "opponent": "ATL",
      "points": 22.3,
      "line": "30 pass att, 249 pass yd, 3 pass TD, 1 INT; 3 rush att, 23 rush yd"
    },
    {
      "week": 15,
      "team": "SEA",
      "opponent": "IND",
      "points": 11.3,
      "line": "36 pass att, 271 pass yd, 0 pass TD, 0 INT; 4 rush att, 5 rush yd"
    },
    {
      "week": 16,
      "team": "SEA",
      "opponent": "LA",
      "points": 19.5,
      "line": "34 pass att, 270 pass yd, 2 pass TD, 2 INT; 3 rush att, 7 rush yd"
    },
    {
      "week": 17,
      "team": "SEA",
      "opponent": "CAR",
      "points": 6.1,
      "line": "27 pass att, 147 pass yd, 1 pass TD, 1 INT; 3 rush att, 2 rush yd"
    },
    {
      "week": 18,
      "team": "SEA",
      "opponent": "SF",
      "points": 8.8,
      "line": "26 pass att, 198 pass yd, 0 pass TD, 0 INT; 6 rush att, 9 rush yd"
    }
  ],
  "49": [
    {
      "week": 13,
      "team": "CAR",
      "opponent": "LA",
      "points": 22.5,
      "line": "20 pass att, 206 pass yd, 3 pass TD, 0 INT; 5 rush att, 23 rush yd"
    },
    {
      "week": 15,
      "team": "CAR",
      "opponent": "NO",
      "points": 15.4,
      "line": "24 pass att, 163 pass yd, 1 pass TD, 0 INT; 7 rush att, 49 rush yd"
    },
    {
      "week": 16,
      "team": "CAR",
      "opponent": "TB",
      "points": 17.6,
      "line": "32 pass att, 191 pass yd, 2 pass TD, 0 INT; 4 rush att, 20 rush yd"
    },
    {
      "week": 17,
      "team": "CAR",
      "opponent": "SEA",
      "points": 8.9,
      "line": "24 pass att, 54 pass yd, 0 pass TD, 1 INT; 9 rush att, 27 rush yd"
    },
    {
      "week": 18,
      "team": "CAR",
      "opponent": "TB",
      "points": 16.5,
      "line": "35 pass att, 266 pass yd, 2 pass TD, 1 INT; 2 rush att, -1 rush yd"
    }
  ],
  "50": [
    {
      "week": 12,
      "team": "NYG",
      "opponent": "DET",
      "points": 30.6,
      "line": "1 rush att, 0 rush yd; 14 rec targets, 9 rec, 156 rec yd; 156 total yd"
    },
    {
      "week": 13,
      "team": "NYG",
      "opponent": "NE",
      "points": 10.4,
      "line": "0 rush att, 0 rush yd; 8 rec targets, 7 rec, 34 rec yd; 34 total yd"
    },
    {
      "week": 15,
      "team": "NYG",
      "opponent": "WAS",
      "points": 16.4,
      "line": "0 rush att, 0 rush yd; 10 rec targets, 5 rec, 54 rec yd; 54 total yd"
    },
    {
      "week": 16,
      "team": "NYG",
      "opponent": "MIN",
      "points": 5.2,
      "line": "1 rush att, 3 rush yd; 6 rec targets, 3 rec, 19 rec yd; 22 total yd"
    },
    {
      "week": 17,
      "team": "NYG",
      "opponent": "LV",
      "points": 22.3,
      "line": "0 rush att, 0 rush yd; 14 rec targets, 11 rec, 113 rec yd; 113 total yd"
    }
  ],
  "51": [
    {
      "week": 14,
      "team": "PIT",
      "opponent": "BAL",
      "points": 15.2,
      "line": "8 rush att, 13 rush yd; 3 rec targets, 3 rec, 49 rec yd; 62 total yd"
    },
    {
      "week": 15,
      "team": "PIT",
      "opponent": "MIA",
      "points": 7.8,
      "line": "12 rush att, 33 rush yd; 3 rec targets, 3 rec, 15 rec yd; 48 total yd"
    },
    {
      "week": 16,
      "team": "PIT",
      "opponent": "DET",
      "points": 29.1,
      "line": "14 rush att, 143 rush yd; 2 rec targets, 2 rec, 8 rec yd; 151 total yd"
    },
    {
      "week": 17,
      "team": "PIT",
      "opponent": "CLE",
      "points": 6.4,
      "line": "12 rush att, 64 rush yd; 0 rec targets, 0 rec, 0 rec yd; 64 total yd"
    },
    {
      "week": 18,
      "team": "PIT",
      "opponent": "BAL",
      "points": 14.9,
      "line": "14 rush att, 66 rush yd; 5 rec targets, 5 rec, 33 rec yd; 99 total yd"
    }
  ],
  "52": [
    {
      "week": 14,
      "team": "PIT",
      "opponent": "BAL",
      "points": 16.2,
      "line": "4 rush att, 15 rush yd; 7 rec targets, 6 rec, 27 rec yd; 42 total yd"
    },
    {
      "week": 15,
      "team": "PIT",
      "opponent": "MIA",
      "points": 19.6,
      "line": "13 rush att, 80 rush yd; 7 rec targets, 7 rec, 46 rec yd; 126 total yd"
    },
    {
      "week": 16,
      "team": "PIT",
      "opponent": "DET",
      "points": 23.8,
      "line": "9 rush att, 50 rush yd; 7 rec targets, 5 rec, 78 rec yd; 128 total yd"
    },
    {
      "week": 17,
      "team": "PIT",
      "opponent": "CLE",
      "points": 6.8,
      "line": "7 rush att, 26 rush yd; 4 rec targets, 3 rec, 12 rec yd; 38 total yd"
    },
    {
      "week": 18,
      "team": "PIT",
      "opponent": "BAL",
      "points": 21.4,
      "line": "5 rush att, 10 rush yd; 9 rec targets, 8 rec, 64 rec yd; 74 total yd"
    }
  ],
  "53": [
    {
      "week": 13,
      "team": "NYJ",
      "opponent": "ATL",
      "points": 15.6,
      "line": "19 rush att, 68 rush yd; 2 rec targets, 2 rec, 8 rec yd; 76 total yd"
    },
    {
      "week": 14,
      "team": "NYJ",
      "opponent": "MIA",
      "points": 4.3,
      "line": "14 rush att, 43 rush yd; 1 rec target, 0 rec, 0 rec yd; 43 total yd"
    },
    {
      "week": 15,
      "team": "NYJ",
      "opponent": "JAX",
      "points": 5.7,
      "line": "12 rush att, 23 rush yd; 2 rec targets, 2 rec, 14 rec yd; 37 total yd"
    },
    {
      "week": 16,
      "team": "NYJ",
      "opponent": "NO",
      "points": 8.3,
      "line": "16 rush att, 54 rush yd; 3 rec targets, 2 rec, 9 rec yd; 63 total yd"
    },
    {
      "week": 17,
      "team": "NYJ",
      "opponent": "NE",
      "points": 20.9,
      "line": "14 rush att, 111 rush yd; 3 rec targets, 2 rec, 18 rec yd; 129 total yd"
    }
  ],
  "54": [
    {
      "week": 14,
      "team": "ARI",
      "opponent": "LA",
      "points": 37.2,
      "line": "0 rush att, 0 rush yd; 16 rec targets, 11 rec, 142 rec yd; 142 total yd"
    },
    {
      "week": 15,
      "team": "ARI",
      "opponent": "HOU",
      "points": 16.4,
      "line": "0 rush att, 0 rush yd; 11 rec targets, 5 rec, 54 rec yd; 54 total yd"
    },
    {
      "week": 16,
      "team": "ARI",
      "opponent": "ATL",
      "points": 13.2,
      "line": "0 rush att, 0 rush yd; 3 rec targets, 2 rec, 52 rec yd; 52 total yd"
    },
    {
      "week": 17,
      "team": "ARI",
      "opponent": "CIN",
      "points": 19.9,
      "line": "0 rush att, 0 rush yd; 10 rec targets, 5 rec, 89 rec yd; 89 total yd"
    },
    {
      "week": 18,
      "team": "ARI",
      "opponent": "LA",
      "points": 20.9,
      "line": "0 rush att, 0 rush yd; 8 rec targets, 5 rec, 99 rec yd; 99 total yd"
    }
  ],
  "55": [
    {
      "week": 14,
      "team": "DET",
      "opponent": "DAL",
      "points": 17.3,
      "line": "1 rush att, 7 rush yd; 9 rec targets, 7 rec, 96 rec yd; 103 total yd"
    },
    {
      "week": 15,
      "team": "DET",
      "opponent": "LA",
      "points": 26.4,
      "line": "0 rush att, 0 rush yd; 10 rec targets, 7 rec, 134 rec yd; 134 total yd"
    },
    {
      "week": 16,
      "team": "DET",
      "opponent": "PIT",
      "points": 12,
      "line": "0 rush att, 0 rush yd; 9 rec targets, 5 rec, 70 rec yd; 70 total yd"
    },
    {
      "week": 17,
      "team": "DET",
      "opponent": "MIN",
      "points": 5.7,
      "line": "0 rush att, 0 rush yd; 3 rec targets, 2 rec, 37 rec yd; 37 total yd"
    },
    {
      "week": 18,
      "team": "DET",
      "opponent": "CHI",
      "points": 13.4,
      "line": "0 rush att, 0 rush yd; 8 rec targets, 6 rec, 74 rec yd; 74 total yd"
    }
  ],
  "56": [
    {
      "week": 14,
      "team": "DEN",
      "opponent": "LV",
      "points": 12.2,
      "line": "0 rush att, 0 rush yd; 10 rec targets, 6 rec, 62 rec yd; 62 total yd"
    },
    {
      "week": 15,
      "team": "DEN",
      "opponent": "GB",
      "points": 24.3,
      "line": "0 rush att, 0 rush yd; 10 rec targets, 7 rec, 113 rec yd; 113 total yd"
    },
    {
      "week": 16,
      "team": "DEN",
      "opponent": "JAX",
      "points": 20.6,
      "line": "0 rush att, 0 rush yd; 12 rec targets, 6 rec, 86 rec yd; 86 total yd"
    },
    {
      "week": 17,
      "team": "DEN",
      "opponent": "KC",
      "points": 8,
      "line": "0 rush att, 0 rush yd; 10 rec targets, 4 rec, 40 rec yd; 40 total yd"
    },
    {
      "week": 18,
      "team": "DEN",
      "opponent": "LAC",
      "points": 1.5,
      "line": "0 rush att, 0 rush yd; 2 rec targets, 1 rec, 5 rec yd; 5 total yd"
    }
  ],
  "57": [
    {
      "week": 13,
      "team": "NE",
      "opponent": "NYG",
      "points": 11,
      "line": "12 rush att, 40 rush yd; 3 rec targets, 3 rec, 40 rec yd; 80 total yd"
    },
    {
      "week": 15,
      "team": "NE",
      "opponent": "BUF",
      "points": 10.7,
      "line": "6 rush att, 50 rush yd; 3 rec targets, 3 rec, 27 rec yd; 77 total yd"
    },
    {
      "week": 16,
      "team": "NE",
      "opponent": "BAL",
      "points": 17.8,
      "line": "8 rush att, 51 rush yd; 3 rec targets, 2 rec, 27 rec yd; 78 total yd"
    },
    {
      "week": 17,
      "team": "NE",
      "opponent": "NYJ",
      "points": 27.2,
      "line": "8 rush att, 47 rush yd; 5 rec targets, 5 rec, 55 rec yd; 102 total yd"
    },
    {
      "week": 18,
      "team": "NE",
      "opponent": "MIA",
      "points": 35.3,
      "line": "7 rush att, 131 rush yd; 2 rec targets, 2 rec, 22 rec yd; 153 total yd"
    }
  ],
  "58": [
    {
      "week": 13,
      "team": "CAR",
      "opponent": "LA",
      "points": 9.9,
      "line": "18 rush att, 58 rush yd; 2 rec targets, 2 rec, 21 rec yd; 79 total yd"
    },
    {
      "week": 15,
      "team": "CAR",
      "opponent": "NO",
      "points": 12.4,
      "line": "16 rush att, 49 rush yd; 1 rec target, 1 rec, 5 rec yd; 54 total yd"
    },
    {
      "week": 16,
      "team": "CAR",
      "opponent": "TB",
      "points": 8.3,
      "line": "9 rush att, 29 rush yd; 6 rec targets, 4 rec, 14 rec yd; 43 total yd"
    },
    {
      "week": 17,
      "team": "CAR",
      "opponent": "SEA",
      "points": 9.3,
      "line": "12 rush att, 59 rush yd; 5 rec targets, 3 rec, 4 rec yd; 63 total yd"
    },
    {
      "week": 18,
      "team": "CAR",
      "opponent": "TB",
      "points": 3,
      "line": "7 rush att, 10 rush yd; 2 rec targets, 2 rec, 20 rec yd; 30 total yd"
    }
  ],
  "59": [
    {
      "week": 12,
      "team": "PIT",
      "opponent": "CHI",
      "points": 14.4,
      "line": "2 rush att, 12 rush yd; 8 rec targets, 5 rec, 22 rec yd; 34 total yd"
    },
    {
      "week": 13,
      "team": "PIT",
      "opponent": "BUF",
      "points": 6.2,
      "line": "0 rush att, 0 rush yd; 5 rec targets, 3 rec, 32 rec yd; 32 total yd"
    },
    {
      "week": 14,
      "team": "PIT",
      "opponent": "BAL",
      "points": 21.8,
      "line": "0 rush att, 0 rush yd; 12 rec targets, 7 rec, 148 rec yd; 148 total yd"
    },
    {
      "week": 15,
      "team": "PIT",
      "opponent": "MIA",
      "points": 14.5,
      "line": "0 rush att, 0 rush yd; 3 rec targets, 3 rec, 55 rec yd; 55 total yd"
    },
    {
      "week": 16,
      "team": "PIT",
      "opponent": "DET",
      "points": 8.2,
      "line": "0 rush att, 0 rush yd; 9 rec targets, 4 rec, 42 rec yd; 42 total yd"
    }
  ],
  "60": [
    {
      "week": 13,
      "team": "CAR",
      "opponent": "LA",
      "points": 11.3,
      "line": "0 rush att, 0 rush yd; 2 rec targets, 1 rec, 43 rec yd; 43 total yd"
    },
    {
      "week": 15,
      "team": "CAR",
      "opponent": "NO",
      "points": 4.5,
      "line": "0 rush att, 0 rush yd; 4 rec targets, 2 rec, 25 rec yd; 25 total yd"
    },
    {
      "week": 16,
      "team": "CAR",
      "opponent": "TB",
      "points": 19.3,
      "line": "0 rush att, 0 rush yd; 10 rec targets, 6 rec, 73 rec yd; 73 total yd"
    },
    {
      "week": 17,
      "team": "CAR",
      "opponent": "SEA",
      "points": 1.5,
      "line": "0 rush att, 0 rush yd; 4 rec targets, 1 rec, 5 rec yd; 5 total yd"
    },
    {
      "week": 18,
      "team": "CAR",
      "opponent": "TB",
      "points": 12.5,
      "line": "0 rush att, 0 rush yd; 6 rec targets, 4 rec, 85 rec yd; 85 total yd"
    }
  ],
  "62": [
    {
      "week": 13,
      "team": "NE",
      "opponent": "NYG",
      "points": 5.6,
      "line": "0 rush att, 0 rush yd; 4 rec targets, 3 rec, 26 rec yd; 26 total yd"
    },
    {
      "week": 15,
      "team": "NE",
      "opponent": "BUF",
      "points": 5.6,
      "line": "0 rush att, 0 rush yd; 4 rec targets, 3 rec, 26 rec yd; 26 total yd"
    },
    {
      "week": 16,
      "team": "NE",
      "opponent": "BAL",
      "points": 22.8,
      "line": "0 rush att, 0 rush yd; 10 rec targets, 9 rec, 138 rec yd; 138 total yd"
    },
    {
      "week": 17,
      "team": "NE",
      "opponent": "NYJ",
      "points": 22.1,
      "line": "0 rush att, 0 rush yd; 6 rec targets, 6 rec, 101 rec yd; 101 total yd"
    },
    {
      "week": 18,
      "team": "NE",
      "opponent": "MIA",
      "points": 7.3,
      "line": "0 rush att, 0 rush yd; 3 rec targets, 3 rec, 43 rec yd; 43 total yd"
    }
  ],
  "63": [
    {
      "week": 13,
      "team": "PHI",
      "opponent": "CHI",
      "points": 4.7,
      "line": "0 rush att, 0 rush yd; 4 rec targets, 2 rec, 27 rec yd; 27 total yd"
    },
    {
      "week": 14,
      "team": "PHI",
      "opponent": "LAC",
      "points": 15.8,
      "line": "0 rush att, 0 rush yd; 10 rec targets, 8 rec, 78 rec yd; 78 total yd"
    },
    {
      "week": 15,
      "team": "PHI",
      "opponent": "LV",
      "points": 25,
      "line": "0 rush att, 0 rush yd; 7 rec targets, 6 rec, 70 rec yd; 70 total yd"
    },
    {
      "week": 16,
      "team": "PHI",
      "opponent": "WAS",
      "points": 12.2,
      "line": "0 rush att, 0 rush yd; 3 rec targets, 3 rec, 32 rec yd; 32 total yd"
    },
    {
      "week": 17,
      "team": "PHI",
      "opponent": "BUF",
      "points": 9.8,
      "line": "0 rush att, 0 rush yd; 6 rec targets, 3 rec, 8 rec yd; 8 total yd"
    }
  ],
  "64": [
    {
      "week": 11,
      "team": "LAC",
      "opponent": "JAX",
      "points": 0,
      "line": "0 rush att, 0 rush yd; 3 rec targets, 0 rec, 0 rec yd; 0 total yd"
    },
    {
      "week": 13,
      "team": "LAC",
      "opponent": "LV",
      "points": 11.3,
      "line": "0 rush att, 0 rush yd; 3 rec targets, 3 rec, 23 rec yd; 23 total yd"
    },
    {
      "week": 14,
      "team": "LAC",
      "opponent": "PHI",
      "points": 2.8,
      "line": "0 rush att, 0 rush yd; 3 rec targets, 2 rec, 8 rec yd; 8 total yd"
    },
    {
      "week": 16,
      "team": "LAC",
      "opponent": "DAL",
      "points": 20.4,
      "line": "0 rush att, 0 rush yd; 5 rec targets, 4 rec, 104 rec yd; 104 total yd"
    },
    {
      "week": 17,
      "team": "LAC",
      "opponent": "HOU",
      "points": 14.8,
      "line": "0 rush att, 0 rush yd; 8 rec targets, 5 rec, 98 rec yd; 98 total yd"
    }
  ],
  "65": [
    {
      "week": 14,
      "team": "IND",
      "opponent": "JAX",
      "points": 13,
      "line": "0 rush att, 0 rush yd; 8 rec targets, 5 rec, 80 rec yd; 80 total yd"
    },
    {
      "week": 15,
      "team": "IND",
      "opponent": "SEA",
      "points": 2.6,
      "line": "0 rush att, 0 rush yd; 1 rec target, 1 rec, 16 rec yd; 16 total yd"
    },
    {
      "week": 16,
      "team": "IND",
      "opponent": "SF",
      "points": 24.6,
      "line": "0 rush att, 0 rush yd; 4 rec targets, 4 rec, 86 rec yd; 86 total yd"
    },
    {
      "week": 17,
      "team": "IND",
      "opponent": "JAX",
      "points": 0,
      "line": "0 rush att, 0 rush yd; 5 rec targets, 0 rec, 0 rec yd; 0 total yd"
    },
    {
      "week": 18,
      "team": "IND",
      "opponent": "HOU",
      "points": 29.2,
      "line": "0 rush att, 0 rush yd; 7 rec targets, 4 rec, 132 rec yd; 132 total yd"
    }
  ],
  "66": [
    {
      "week": 14,
      "team": "DEN",
      "opponent": "LV",
      "points": 22,
      "line": "17 rush att, 75 rush yd; 6 rec targets, 6 rec, 25 rec yd; 100 total yd"
    },
    {
      "week": 15,
      "team": "DEN",
      "opponent": "GB",
      "points": 10.5,
      "line": "19 rush att, 65 rush yd; 1 rec target, 0 rec, 0 rec yd; 65 total yd"
    },
    {
      "week": 16,
      "team": "DEN",
      "opponent": "JAX",
      "points": 22.1,
      "line": "7 rush att, 50 rush yd; 5 rec targets, 4 rec, 71 rec yd; 121 total yd"
    },
    {
      "week": 17,
      "team": "DEN",
      "opponent": "KC",
      "points": 18.6,
      "line": "14 rush att, 43 rush yd; 6 rec targets, 5 rec, 33 rec yd; 76 total yd"
    },
    {
      "week": 18,
      "team": "DEN",
      "opponent": "LAC",
      "points": 4.3,
      "line": "15 rush att, 28 rush yd; 4 rec targets, 1 rec, 5 rec yd; 33 total yd"
    }
  ],
  "67": [
    {
      "week": 13,
      "team": "MIA",
      "opponent": "NO",
      "points": 7,
      "line": "0 rush att, 0 rush yd; 6 rec targets, 3 rec, 40 rec yd; 40 total yd"
    },
    {
      "week": 14,
      "team": "MIA",
      "opponent": "NYJ",
      "points": 18.1,
      "line": "1 rush att, 21 rush yd; 7 rec targets, 5 rec, 50 rec yd; 71 total yd"
    },
    {
      "week": 15,
      "team": "MIA",
      "opponent": "PIT",
      "points": 4.6,
      "line": "0 rush att, 0 rush yd; 4 rec targets, 2 rec, 26 rec yd; 26 total yd"
    },
    {
      "week": 16,
      "team": "MIA",
      "opponent": "CIN",
      "points": 12.2,
      "line": "0 rush att, 0 rush yd; 9 rec targets, 5 rec, 72 rec yd; 72 total yd"
    },
    {
      "week": 17,
      "team": "MIA",
      "opponent": "TB",
      "points": 0.7,
      "line": "1 rush att, 7 rush yd; 1 rec target, 0 rec, 0 rec yd; 7 total yd"
    }
  ],
  "68": [
    {
      "week": 13,
      "team": "NE",
      "opponent": "NYG",
      "points": 11.6,
      "line": "11 rush att, 67 rush yd; 4 rec targets, 3 rec, 19 rec yd; 86 total yd"
    },
    {
      "week": 15,
      "team": "NE",
      "opponent": "BUF",
      "points": 30.1,
      "line": "14 rush att, 148 rush yd; 3 rec targets, 2 rec, 13 rec yd; 161 total yd"
    },
    {
      "week": 16,
      "team": "NE",
      "opponent": "BAL",
      "points": 2.2,
      "line": "5 rush att, 3 rush yd; 1 rec target, 1 rec, 9 rec yd; 12 total yd"
    },
    {
      "week": 17,
      "team": "NE",
      "opponent": "NYJ",
      "points": 8.2,
      "line": "19 rush att, 82 rush yd; 0 rec targets, 0 rec, 0 rec yd; 82 total yd"
    },
    {
      "week": 18,
      "team": "NE",
      "opponent": "MIA",
      "points": 17.3,
      "line": "13 rush att, 53 rush yd; 0 rec targets, 0 rec, 0 rec yd; 53 total yd"
    }
  ],
  "69": [
    {
      "week": 12,
      "team": "CLE",
      "opponent": "LV",
      "points": 16.7,
      "line": "16 rush att, 47 rush yd; 0 rec targets, 0 rec, 0 rec yd; 47 total yd"
    },
    {
      "week": 13,
      "team": "CLE",
      "opponent": "SF",
      "points": 15.9,
      "line": "23 rush att, 91 rush yd; 3 rec targets, 3 rec, 18 rec yd; 109 total yd"
    },
    {
      "week": 14,
      "team": "CLE",
      "opponent": "TEN",
      "points": 9.4,
      "line": "14 rush att, 26 rush yd; 3 rec targets, 1 rec, 58 rec yd; 84 total yd"
    },
    {
      "week": 15,
      "team": "CLE",
      "opponent": "CHI",
      "points": 4.7,
      "line": "12 rush att, 21 rush yd; 4 rec targets, 3 rec, -4 rec yd; 17 total yd"
    },
    {
      "week": 16,
      "team": "CLE",
      "opponent": "BUF",
      "points": 10.1,
      "line": "8 rush att, 22 rush yd; 6 rec targets, 5 rec, 29 rec yd; 51 total yd"
    }
  ],
  "71": [
    {
      "week": 14,
      "team": "PHI",
      "opponent": "LAC",
      "points": 7.7,
      "line": "0 rush att, 0 rush yd; 8 rec targets, 4 rec, 37 rec yd; 37 total yd"
    },
    {
      "week": 15,
      "team": "PHI",
      "opponent": "LV",
      "points": 7,
      "line": "0 rush att, 0 rush yd; 2 rec targets, 2 rec, 50 rec yd; 50 total yd"
    },
    {
      "week": 16,
      "team": "PHI",
      "opponent": "WAS",
      "points": 16.2,
      "line": "0 rush att, 0 rush yd; 8 rec targets, 6 rec, 42 rec yd; 42 total yd"
    },
    {
      "week": 17,
      "team": "PHI",
      "opponent": "BUF",
      "points": 4.5,
      "line": "0 rush att, 0 rush yd; 5 rec targets, 2 rec, 25 rec yd; 25 total yd"
    },
    {
      "week": 18,
      "team": "PHI",
      "opponent": "WAS",
      "points": 8.2,
      "line": "0 rush att, 0 rush yd; 4 rec targets, 3 rec, 52 rec yd; 52 total yd"
    }
  ],
  "72": [
    {
      "week": 14,
      "team": "HOU",
      "opponent": "KC",
      "points": 0,
      "line": "2/2 FG, 2/2 XP, long 35"
    },
    {
      "week": 15,
      "team": "HOU",
      "opponent": "ARI",
      "points": 0,
      "line": "4/5 FG, 4/4 XP, long 55"
    },
    {
      "week": 16,
      "team": "HOU",
      "opponent": "LV",
      "points": 0,
      "line": "3/3 FG, 2/2 XP, long 55"
    },
    {
      "week": 17,
      "team": "HOU",
      "opponent": "LAC",
      "points": 0,
      "line": "2/2 FG, 2/2 XP, long 44"
    },
    {
      "week": 18,
      "team": "HOU",
      "opponent": "IND",
      "points": 0,
      "line": "6/6 FG, 2/2 XP, long 51"
    }
  ],
  "73": [
    {
      "week": 14,
      "team": "MIN",
      "opponent": "WAS",
      "points": 3.1,
      "line": "0 rush att, 0 rush yd; 4 rec targets, 2 rec, 11 rec yd; 11 total yd"
    },
    {
      "week": 15,
      "team": "MIN",
      "opponent": "DAL",
      "points": 4.2,
      "line": "0 rush att, 0 rush yd; 8 rec targets, 2 rec, 22 rec yd; 22 total yd"
    },
    {
      "week": 16,
      "team": "MIN",
      "opponent": "NYG",
      "points": 14.5,
      "line": "0 rush att, 0 rush yd; 8 rec targets, 6 rec, 85 rec yd; 85 total yd"
    },
    {
      "week": 17,
      "team": "MIN",
      "opponent": "DET",
      "points": 7,
      "line": "0 rush att, 0 rush yd; 5 rec targets, 4 rec, 30 rec yd; 30 total yd"
    },
    {
      "week": 18,
      "team": "MIN",
      "opponent": "GB",
      "points": 18.4,
      "line": "1 rush att, 3 rush yd; 11 rec targets, 8 rec, 101 rec yd; 104 total yd"
    }
  ],
  "74": [
    {
      "week": 14,
      "team": "WAS",
      "opponent": "MIN",
      "points": 6.7,
      "line": "0 rush att, 0 rush yd; 6 rec targets, 4 rec, 27 rec yd; 27 total yd"
    },
    {
      "week": 15,
      "team": "WAS",
      "opponent": "NYG",
      "points": 7.3,
      "line": "0 rush att, 0 rush yd; 5 rec targets, 3 rec, 43 rec yd; 43 total yd"
    },
    {
      "week": 16,
      "team": "WAS",
      "opponent": "PHI",
      "points": 6.5,
      "line": "0 rush att, 0 rush yd; 4 rec targets, 3 rec, 35 rec yd; 35 total yd"
    },
    {
      "week": 17,
      "team": "WAS",
      "opponent": "DAL",
      "points": 11.3,
      "line": "2 rush att, 25 rush yd; 4 rec targets, 2 rec, 68 rec yd; 93 total yd"
    },
    {
      "week": 18,
      "team": "WAS",
      "opponent": "PHI",
      "points": 4.1,
      "line": "2 rush att, 1 rush yd; 5 rec targets, 2 rec, 20 rec yd; 21 total yd"
    }
  ],
  "75": [
    {
      "week": 13,
      "team": "CLE",
      "opponent": "SF",
      "points": 11.3,
      "line": "1 rush att, 0 rush yd; 5 rec targets, 3 rec, 43 rec yd; 43 total yd"
    },
    {
      "week": 14,
      "team": "CLE",
      "opponent": "TEN",
      "points": 25.4,
      "line": "0 rush att, 0 rush yd; 11 rec targets, 8 rec, 114 rec yd; 114 total yd"
    },
    {
      "week": 15,
      "team": "CLE",
      "opponent": "CHI",
      "points": 12,
      "line": "1 rush att, 2 rush yd; 14 rec targets, 7 rec, 48 rec yd; 50 total yd"
    },
    {
      "week": 16,
      "team": "CLE",
      "opponent": "BUF",
      "points": 19.5,
      "line": "1 rush att, 1 rush yd; 6 rec targets, 4 rec, 34 rec yd; 35 total yd"
    },
    {
      "week": 17,
      "team": "CLE",
      "opponent": "PIT",
      "points": 11,
      "line": "0 rush att, 0 rush yd; 2 rec targets, 2 rec, 30 rec yd; 30 total yd"
    }
  ],
  "76": [
    {
      "week": 12,
      "team": "LV",
      "opponent": "CLE",
      "points": 14.2,
      "line": "44 pass att, 285 pass yd, 1 pass TD, 0 INT; 3 rush att, 8 rush yd"
    },
    {
      "week": 13,
      "team": "LV",
      "opponent": "LAC",
      "points": 12,
      "line": "23 pass att, 165 pass yd, 2 pass TD, 1 INT; 2 rush att, -6 rush yd"
    },
    {
      "week": 14,
      "team": "LV",
      "opponent": "DEN",
      "points": 9,
      "line": "21 pass att, 116 pass yd, 1 pass TD, 0 INT; 1 rush att, 4 rush yd"
    },
    {
      "week": 16,
      "team": "LV",
      "opponent": "HOU",
      "points": 14,
      "line": "23 pass att, 201 pass yd, 2 pass TD, 1 INT; 0 rush att, 0 rush yd"
    },
    {
      "week": 17,
      "team": "LV",
      "opponent": "NYG",
      "points": 7.1,
      "line": "28 pass att, 176 pass yd, 1 pass TD, 2 INT; 1 rush att, 1 rush yd"
    }
  ],
  "77": [
    {
      "week": 13,
      "team": "SF",
      "opponent": "CLE",
      "points": 13.9,
      "line": "0 rush att, 0 rush yd; 6 rec targets, 4 rec, 39 rec yd; 39 total yd"
    },
    {
      "week": 15,
      "team": "SF",
      "opponent": "TEN",
      "points": 18.7,
      "line": "0 rush att, 0 rush yd; 5 rec targets, 3 rec, 37 rec yd; 37 total yd"
    },
    {
      "week": 16,
      "team": "SF",
      "opponent": "IND",
      "points": 18.1,
      "line": "0 rush att, 0 rush yd; 6 rec targets, 5 rec, 71 rec yd; 71 total yd"
    },
    {
      "week": 17,
      "team": "SF",
      "opponent": "CHI",
      "points": 12.2,
      "line": "0 rush att, 0 rush yd; 4 rec targets, 2 rec, 42 rec yd; 42 total yd"
    },
    {
      "week": 18,
      "team": "SF",
      "opponent": "SEA",
      "points": 7.5,
      "line": "0 rush att, 0 rush yd; 6 rec targets, 4 rec, 35 rec yd; 35 total yd"
    }
  ],
  "78": [
    {
      "week": 14,
      "team": "TB",
      "opponent": "NO",
      "points": 3.5,
      "line": "0 rush att, 0 rush yd; 9 rec targets, 2 rec, 15 rec yd; 15 total yd"
    },
    {
      "week": 15,
      "team": "TB",
      "opponent": "ATL",
      "points": 10.4,
      "line": "0 rush att, 0 rush yd; 7 rec targets, 4 rec, 64 rec yd; 64 total yd"
    },
    {
      "week": 16,
      "team": "TB",
      "opponent": "CAR",
      "points": 5,
      "line": "0 rush att, 0 rush yd; 2 rec targets, 1 rec, 40 rec yd; 40 total yd"
    },
    {
      "week": 17,
      "team": "TB",
      "opponent": "MIA",
      "points": 5,
      "line": "0 rush att, 0 rush yd; 5 rec targets, 3 rec, 20 rec yd; 20 total yd"
    },
    {
      "week": 18,
      "team": "TB",
      "opponent": "CAR",
      "points": 1.8,
      "line": "0 rush att, 0 rush yd; 3 rec targets, 1 rec, 8 rec yd; 8 total yd"
    }
  ],
  "79": [
    {
      "week": 10,
      "team": "MIA",
      "opponent": "BUF",
      "points": 10.8,
      "line": "21 pass att, 173 pass yd, 2 pass TD, 2 INT; 2 rush att, -1 rush yd"
    },
    {
      "week": 11,
      "team": "MIA",
      "opponent": "WAS",
      "points": 6.8,
      "line": "20 pass att, 171 pass yd, 0 pass TD, 0 INT; 0 rush att, 0 rush yd"
    },
    {
      "week": 13,
      "team": "MIA",
      "opponent": "NO",
      "points": 4.7,
      "line": "23 pass att, 157 pass yd, 0 pass TD, 1 INT; 4 rush att, 4 rush yd"
    },
    {
      "week": 14,
      "team": "MIA",
      "opponent": "NYJ",
      "points": 9.1,
      "line": "21 pass att, 127 pass yd, 1 pass TD, 0 INT; 1 rush att, 0 rush yd"
    },
    {
      "week": 15,
      "team": "MIA",
      "opponent": "PIT",
      "points": 16.2,
      "line": "28 pass att, 253 pass yd, 2 pass TD, 1 INT; 1 rush att, 1 rush yd"
    }
  ],
  "80": [
    {
      "week": 14,
      "team": "KC",
      "opponent": "HOU",
      "points": 1.8,
      "line": "0 rush att, 0 rush yd; 5 rec targets, 1 rec, 8 rec yd; 8 total yd"
    },
    {
      "week": 15,
      "team": "KC",
      "opponent": "LAC",
      "points": 14,
      "line": "0 rush att, 0 rush yd; 9 rec targets, 7 rec, 70 rec yd; 70 total yd"
    },
    {
      "week": 16,
      "team": "KC",
      "opponent": "TEN",
      "points": 1.6,
      "line": "0 rush att, 0 rush yd; 4 rec targets, 1 rec, 6 rec yd; 6 total yd"
    },
    {
      "week": 17,
      "team": "KC",
      "opponent": "DEN",
      "points": 8.6,
      "line": "0 rush att, 0 rush yd; 6 rec targets, 5 rec, 36 rec yd; 36 total yd"
    },
    {
      "week": 18,
      "team": "KC",
      "opponent": "LV",
      "points": 4.2,
      "line": "0 rush att, 0 rush yd; 6 rec targets, 3 rec, 12 rec yd; 12 total yd"
    }
  ],
  "81": [
    {
      "week": 14,
      "team": "SEA",
      "opponent": "ATL",
      "points": 8.6,
      "line": "7 rush att, 46 rush yd; 3 rec targets, 2 rec, 20 rec yd; 66 total yd"
    },
    {
      "week": 15,
      "team": "SEA",
      "opponent": "IND",
      "points": 3.1,
      "line": "8 rush att, 31 rush yd; 1 rec target, 0 rec, 0 rec yd; 31 total yd"
    },
    {
      "week": 16,
      "team": "SEA",
      "opponent": "LA",
      "points": 17.4,
      "line": "9 rush att, 32 rush yd; 4 rec targets, 4 rec, 22 rec yd; 54 total yd"
    },
    {
      "week": 17,
      "team": "SEA",
      "opponent": "CAR",
      "points": 26.2,
      "line": "18 rush att, 110 rush yd; 2 rec targets, 2 rec, 12 rec yd; 122 total yd"
    },
    {
      "week": 18,
      "team": "SEA",
      "opponent": "SF",
      "points": 18.7,
      "line": "17 rush att, 74 rush yd; 4 rec targets, 3 rec, 23 rec yd; 97 total yd"
    }
  ],
  "82": [
    {
      "week": 13,
      "team": "LAC",
      "opponent": "LV",
      "points": 13.9,
      "line": "0 rush att, 0 rush yd; 6 rec targets, 4 rec, 39 rec yd; 39 total yd"
    },
    {
      "week": 14,
      "team": "LAC",
      "opponent": "PHI",
      "points": 2.2,
      "line": "0 rush att, 0 rush yd; 5 rec targets, 1 rec, 12 rec yd; 12 total yd"
    },
    {
      "week": 15,
      "team": "LAC",
      "opponent": "KC",
      "points": 4,
      "line": "0 rush att, 0 rush yd; 3 rec targets, 2 rec, 20 rec yd; 20 total yd"
    },
    {
      "week": 16,
      "team": "LAC",
      "opponent": "DAL",
      "points": 14.3,
      "line": "0 rush att, 0 rush yd; 6 rec targets, 4 rec, 43 rec yd; 43 total yd"
    },
    {
      "week": 17,
      "team": "LAC",
      "opponent": "HOU",
      "points": 4.1,
      "line": "0 rush att, 0 rush yd; 2 rec targets, 1 rec, 31 rec yd; 31 total yd"
    }
  ],
  "83": [
    {
      "week": 14,
      "team": "SEA",
      "opponent": "ATL",
      "points": 3.8,
      "line": "10 rush att, 29 rush yd; 3 rec targets, 1 rec, -1 rec yd; 28 total yd"
    },
    {
      "week": 15,
      "team": "SEA",
      "opponent": "IND",
      "points": 2.9,
      "line": "9 rush att, 17 rush yd; 1 rec target, 1 rec, 2 rec yd; 19 total yd"
    },
    {
      "week": 16,
      "team": "SEA",
      "opponent": "LA",
      "points": 25.4,
      "line": "11 rush att, 100 rush yd; 3 rec targets, 3 rec, 64 rec yd; 164 total yd"
    },
    {
      "week": 17,
      "team": "SEA",
      "opponent": "CAR",
      "points": 7.7,
      "line": "15 rush att, 51 rush yd; 2 rec targets, 2 rec, 6 rec yd; 57 total yd"
    },
    {
      "week": 18,
      "team": "SEA",
      "opponent": "SF",
      "points": 17.3,
      "line": "16 rush att, 97 rush yd; 4 rec targets, 4 rec, 36 rec yd; 133 total yd"
    }
  ],
  "84": [
    {
      "week": 11,
      "team": "CIN",
      "opponent": "PIT",
      "points": 9.9,
      "line": "40 pass att, 199 pass yd, 1 pass TD, 1 INT; 1 rush att, -1 rush yd"
    },
    {
      "week": 12,
      "team": "CIN",
      "opponent": "NE",
      "points": 9.6,
      "line": "37 pass att, 183 pass yd, 1 pass TD, 1 INT; 1 rush att, 3 rush yd"
    },
    {
      "week": 16,
      "team": "CIN",
      "opponent": "MIA",
      "points": 0.2,
      "line": "1 pass att, 4 pass yd, 0 pass TD, 0 INT; 0 rush att, 0 rush yd"
    },
    {
      "week": 17,
      "team": "CIN",
      "opponent": "ARI",
      "points": 1.2,
      "line": "5 pass att, 24 pass yd, 0 pass TD, 0 INT; 4 rush att, 2 rush yd"
    },
    {
      "week": 18,
      "team": "CIN",
      "opponent": "CLE",
      "points": 0.2,
      "line": "0 pass att, 0 pass yd, 0 pass TD, 0 INT; 1 rush att, 2 rush yd"
    }
  ],
  "85": [
    {
      "week": 14,
      "team": "SEA",
      "opponent": "ATL",
      "points": 0,
      "line": "3/3 FG, 4/4 XP, long 48"
    },
    {
      "week": 15,
      "team": "SEA",
      "opponent": "IND",
      "points": 0,
      "line": "6/6 FG, 0/0 XP, long 56"
    },
    {
      "week": 16,
      "team": "SEA",
      "opponent": "LA",
      "points": 0,
      "line": "0/0 FG, 2/2 XP, long -"
    },
    {
      "week": 17,
      "team": "SEA",
      "opponent": "CAR",
      "points": 0,
      "line": "2/2 FG, 3/3 XP, long 48"
    },
    {
      "week": 18,
      "team": "SEA",
      "opponent": "SF",
      "points": 0,
      "line": "2/4 FG, 1/1 XP, long 45"
    }
  ],
  "86": [
    {
      "week": 14,
      "team": "IND",
      "opponent": "JAX",
      "points": 3.7,
      "line": "1 rush att, 2 rush yd; 6 rec targets, 2 rec, 15 rec yd; 17 total yd"
    },
    {
      "week": 15,
      "team": "IND",
      "opponent": "SEA",
      "points": 4.9,
      "line": "0 rush att, 0 rush yd; 6 rec targets, 3 rec, 19 rec yd; 19 total yd"
    },
    {
      "week": 16,
      "team": "IND",
      "opponent": "SF",
      "points": 6,
      "line": "0 rush att, 0 rush yd; 9 rec targets, 3 rec, 30 rec yd; 30 total yd"
    },
    {
      "week": 17,
      "team": "IND",
      "opponent": "JAX",
      "points": 9.3,
      "line": "0 rush att, 0 rush yd; 5 rec targets, 5 rec, 43 rec yd; 43 total yd"
    },
    {
      "week": 18,
      "team": "IND",
      "opponent": "HOU",
      "points": 7.6,
      "line": "0 rush att, 0 rush yd; 8 rec targets, 5 rec, 26 rec yd; 26 total yd"
    }
  ],
  "87": [
    {
      "week": 14,
      "team": "DAL",
      "opponent": "DET",
      "points": 10.8,
      "line": "0 rush att, 0 rush yd; 7 rec targets, 5 rec, 58 rec yd; 58 total yd"
    },
    {
      "week": 15,
      "team": "DAL",
      "opponent": "MIN",
      "points": 3.6,
      "line": "0 rush att, 0 rush yd; 4 rec targets, 2 rec, 16 rec yd; 16 total yd"
    },
    {
      "week": 16,
      "team": "DAL",
      "opponent": "LAC",
      "points": 4.9,
      "line": "0 rush att, 0 rush yd; 4 rec targets, 3 rec, 19 rec yd; 19 total yd"
    },
    {
      "week": 17,
      "team": "DAL",
      "opponent": "WAS",
      "points": 7.6,
      "line": "0 rush att, 0 rush yd; 2 rec targets, 1 rec, 6 rec yd; 6 total yd"
    },
    {
      "week": 18,
      "team": "DAL",
      "opponent": "NYG",
      "points": 1.5,
      "line": "0 rush att, 0 rush yd; 2 rec targets, 1 rec, 5 rec yd; 5 total yd"
    }
  ],
  "88": [
    {
      "week": 14,
      "team": "JAX",
      "opponent": "IND",
      "points": 14.8,
      "line": "3 rush att, 9 rush yd; 10 rec targets, 4 rec, 39 rec yd; 48 total yd"
    },
    {
      "week": 15,
      "team": "JAX",
      "opponent": "NYJ",
      "points": 12.1,
      "line": "0 rush att, 0 rush yd; 7 rec targets, 5 rec, 71 rec yd; 71 total yd"
    },
    {
      "week": 16,
      "team": "JAX",
      "opponent": "DEN",
      "points": 8.6,
      "line": "1 rush att, 1 rush yd; 8 rec targets, 4 rec, 45 rec yd; 46 total yd"
    },
    {
      "week": 17,
      "team": "JAX",
      "opponent": "IND",
      "points": 7.9,
      "line": "0 rush att, 0 rush yd; 9 rec targets, 6 rec, 39 rec yd; 39 total yd"
    },
    {
      "week": 18,
      "team": "JAX",
      "opponent": "TEN",
      "points": 9.4,
      "line": "0 rush att, 0 rush yd; 6 rec targets, 5 rec, 44 rec yd; 44 total yd"
    }
  ],
  "89": [
    {
      "week": 14,
      "team": "TEN",
      "opponent": "CLE",
      "points": 11.1,
      "line": "28 pass att, 117 pass yd, 2 pass TD, 1 INT; 2 rush att, 4 rush yd"
    },
    {
      "week": 15,
      "team": "TEN",
      "opponent": "SF",
      "points": 15,
      "line": "29 pass att, 170 pass yd, 2 pass TD, 0 INT; 1 rush att, 2 rush yd"
    },
    {
      "week": 16,
      "team": "TEN",
      "opponent": "KC",
      "points": 18,
      "line": "28 pass att, 228 pass yd, 2 pass TD, 0 INT; 4 rush att, 9 rush yd"
    },
    {
      "week": 17,
      "team": "TEN",
      "opponent": "NO",
      "points": 17,
      "line": "40 pass att, 251 pass yd, 2 pass TD, 0 INT; 2 rush att, 10 rush yd"
    },
    {
      "week": 18,
      "team": "TEN",
      "opponent": "JAX",
      "points": 9.2,
      "line": "3 pass att, 52 pass yd, 0 pass TD, 0 INT; 2 rush att, 11 rush yd"
    }
  ],
  "90": [
    {
      "week": 14,
      "team": "TEN",
      "opponent": "CLE",
      "points": 28.1,
      "line": "25 rush att, 161 rush yd; 0 rec targets, 0 rec, 0 rec yd; 161 total yd"
    },
    {
      "week": 15,
      "team": "TEN",
      "opponent": "SF",
      "points": 18.2,
      "line": "14 rush att, 104 rush yd; 2 rec targets, 1 rec, 8 rec yd; 112 total yd"
    },
    {
      "week": 16,
      "team": "TEN",
      "opponent": "KC",
      "points": 10.2,
      "line": "21 rush att, 102 rush yd; 0 rec targets, 0 rec, 0 rec yd; 102 total yd"
    },
    {
      "week": 17,
      "team": "TEN",
      "opponent": "NO",
      "points": 11.5,
      "line": "18 rush att, 85 rush yd; 2 rec targets, 2 rec, 10 rec yd; 95 total yd"
    },
    {
      "week": 18,
      "team": "TEN",
      "opponent": "JAX",
      "points": 9.5,
      "line": "14 rush att, 48 rush yd; 3 rec targets, 3 rec, 17 rec yd; 65 total yd"
    }
  ],
  "91": [
    {
      "week": 13,
      "team": "JAX",
      "opponent": "TEN",
      "points": 3.6,
      "line": "0 rush att, 0 rush yd; 3 rec targets, 1 rec, 26 rec yd; 26 total yd"
    },
    {
      "week": 15,
      "team": "JAX",
      "opponent": "NYJ",
      "points": 8.3,
      "line": "0 rush att, 0 rush yd; 3 rec targets, 3 rec, 53 rec yd; 53 total yd"
    },
    {
      "week": 16,
      "team": "JAX",
      "opponent": "DEN",
      "points": 26.5,
      "line": "0 rush att, 0 rush yd; 10 rec targets, 6 rec, 145 rec yd; 145 total yd"
    },
    {
      "week": 17,
      "team": "JAX",
      "opponent": "IND",
      "points": 19,
      "line": "1 rush att, -5 rush yd; 10 rec targets, 8 rec, 115 rec yd; 110 total yd"
    },
    {
      "week": 18,
      "team": "JAX",
      "opponent": "TEN",
      "points": 19.7,
      "line": "0 rush att, 0 rush yd; 9 rec targets, 5 rec, 87 rec yd; 87 total yd"
    }
  ],
  "92": [
    {
      "week": 14,
      "team": "LAC",
      "opponent": "PHI",
      "points": 5.2,
      "line": "0 rush att, 0 rush yd; 3 rec targets, 3 rec, 22 rec yd; 22 total yd"
    },
    {
      "week": 15,
      "team": "LAC",
      "opponent": "KC",
      "points": 8.6,
      "line": "0 rush att, 0 rush yd; 7 rec targets, 5 rec, 36 rec yd; 36 total yd"
    },
    {
      "week": 16,
      "team": "LAC",
      "opponent": "DAL",
      "points": 9.4,
      "line": "0 rush att, 0 rush yd; 5 rec targets, 5 rec, 44 rec yd; 44 total yd"
    },
    {
      "week": 17,
      "team": "LAC",
      "opponent": "HOU",
      "points": 2.7,
      "line": "0 rush att, 0 rush yd; 3 rec targets, 1 rec, 17 rec yd; 17 total yd"
    },
    {
      "week": 18,
      "team": "LAC",
      "opponent": "DEN",
      "points": 10.6,
      "line": "0 rush att, 0 rush yd; 13 rec targets, 7 rec, 36 rec yd; 36 total yd"
    }
  ],
  "93": [
    {
      "week": 13,
      "team": "NYG",
      "opponent": "NE",
      "points": 4.3,
      "line": "10 rush att, 36 rush yd; 1 rec target, 1 rec, -3 rec yd; 33 total yd"
    },
    {
      "week": 15,
      "team": "NYG",
      "opponent": "WAS",
      "points": 24.7,
      "line": "15 rush att, 70 rush yd; 4 rec targets, 3 rec, 27 rec yd; 97 total yd"
    },
    {
      "week": 16,
      "team": "NYG",
      "opponent": "MIN",
      "points": 9.8,
      "line": "16 rush att, 71 rush yd; 2 rec targets, 2 rec, 7 rec yd; 78 total yd"
    },
    {
      "week": 17,
      "team": "NYG",
      "opponent": "LV",
      "points": 6.7,
      "line": "14 rush att, 62 rush yd; 2 rec targets, 1 rec, -5 rec yd; 57 total yd"
    },
    {
      "week": 18,
      "team": "NYG",
      "opponent": "DAL",
      "points": 27.9,
      "line": "18 rush att, 103 rush yd; 9 rec targets, 8 rec, 56 rec yd; 159 total yd"
    }
  ],
  "94": [
    {
      "week": 14,
      "team": "NO",
      "opponent": "TB",
      "points": 7.8,
      "line": "0 rush att, 0 rush yd; 4 rec targets, 4 rec, 38 rec yd; 38 total yd"
    },
    {
      "week": 15,
      "team": "NO",
      "opponent": "CAR",
      "points": 7,
      "line": "0 rush att, 0 rush yd; 4 rec targets, 4 rec, 30 rec yd; 30 total yd"
    },
    {
      "week": 16,
      "team": "NO",
      "opponent": "NYJ",
      "points": 16.9,
      "line": "0 rush att, 0 rush yd; 9 rec targets, 8 rec, 89 rec yd; 89 total yd"
    },
    {
      "week": 17,
      "team": "NO",
      "opponent": "TEN",
      "points": 13.5,
      "line": "0 rush att, 0 rush yd; 4 rec targets, 4 rec, 95 rec yd; 95 total yd"
    },
    {
      "week": 18,
      "team": "NO",
      "opponent": "ATL",
      "points": 7.1,
      "line": "0 rush att, 0 rush yd; 5 rec targets, 3 rec, 61 rec yd; 61 total yd"
    }
  ],
  "95": [
    {
      "week": 13,
      "team": "NE",
      "opponent": "NYG",
      "points": 11.3,
      "line": "0 rush att, 0 rush yd; 6 rec targets, 4 rec, 73 rec yd; 73 total yd"
    },
    {
      "week": 15,
      "team": "NE",
      "opponent": "BUF",
      "points": 2.8,
      "line": "0 rush att, 0 rush yd; 3 rec targets, 1 rec, 18 rec yd; 18 total yd"
    },
    {
      "week": 16,
      "team": "NE",
      "opponent": "BAL",
      "points": 15.5,
      "line": "0 rush att, 0 rush yd; 7 rec targets, 6 rec, 35 rec yd; 35 total yd"
    },
    {
      "week": 17,
      "team": "NE",
      "opponent": "NYJ",
      "points": 13.9,
      "line": "0 rush att, 0 rush yd; 3 rec targets, 3 rec, 49 rec yd; 49 total yd"
    },
    {
      "week": 18,
      "team": "NE",
      "opponent": "MIA",
      "points": 10.6,
      "line": "0 rush att, 0 rush yd; 5 rec targets, 5 rec, 56 rec yd; 56 total yd"
    }
  ],
  "96": [
    {
      "week": 14,
      "team": "HOU",
      "opponent": "KC",
      "points": 5.2,
      "line": "0 rush att, 0 rush yd; 4 rec targets, 3 rec, 22 rec yd; 22 total yd"
    },
    {
      "week": 15,
      "team": "HOU",
      "opponent": "ARI",
      "points": 21.6,
      "line": "0 rush att, 0 rush yd; 9 rec targets, 8 rec, 76 rec yd; 76 total yd"
    },
    {
      "week": 16,
      "team": "HOU",
      "opponent": "LV",
      "points": 14.5,
      "line": "0 rush att, 0 rush yd; 5 rec targets, 5 rec, 35 rec yd; 35 total yd"
    },
    {
      "week": 17,
      "team": "HOU",
      "opponent": "LAC",
      "points": 4.9,
      "line": "0 rush att, 0 rush yd; 4 rec targets, 3 rec, 19 rec yd; 19 total yd"
    },
    {
      "week": 18,
      "team": "HOU",
      "opponent": "IND",
      "points": 11.3,
      "line": "0 rush att, 0 rush yd; 4 rec targets, 4 rec, 73 rec yd; 73 total yd"
    }
  ],
  "97": [
    {
      "week": 14,
      "team": "DAL",
      "opponent": "DET",
      "points": 0,
      "line": "5/5 FG, 1/1 XP, long 63"
    },
    {
      "week": 15,
      "team": "DAL",
      "opponent": "MIN",
      "points": 0.6,
      "line": "4/6 FG, 2/2 XP, long 41"
    },
    {
      "week": 16,
      "team": "DAL",
      "opponent": "LAC",
      "points": 0,
      "line": "1/1 FG, 2/2 XP, long 33"
    },
    {
      "week": 17,
      "team": "DAL",
      "opponent": "WAS",
      "points": 0,
      "line": "3/4 FG, 3/3 XP, long 52"
    },
    {
      "week": 18,
      "team": "DAL",
      "opponent": "NYG",
      "points": 0,
      "line": "1/2 FG, 2/2 XP, long 22"
    }
  ],
  "98": [
    {
      "week": 14,
      "team": "DEN",
      "opponent": "LV",
      "points": 4.1,
      "line": "0 rush att, 0 rush yd; 4 rec targets, 3 rec, 11 rec yd; 11 total yd"
    },
    {
      "week": 15,
      "team": "DEN",
      "opponent": "GB",
      "points": 20.8,
      "line": "1 rush att, 3 rush yd; 6 rec targets, 6 rec, 85 rec yd; 88 total yd"
    },
    {
      "week": 16,
      "team": "DEN",
      "opponent": "JAX",
      "points": 10.6,
      "line": "0 rush att, 0 rush yd; 5 rec targets, 4 rec, 66 rec yd; 66 total yd"
    },
    {
      "week": 17,
      "team": "DEN",
      "opponent": "KC",
      "points": 5.7,
      "line": "0 rush att, 0 rush yd; 4 rec targets, 4 rec, 17 rec yd; 17 total yd"
    },
    {
      "week": 18,
      "team": "DEN",
      "opponent": "LAC",
      "points": 0,
      "line": "0 rush att, 0 rush yd; 1 rec target, 0 rec, 0 rec yd; 0 total yd"
    }
  ],
  "99": [
    {
      "week": 13,
      "team": "BUF",
      "opponent": "PIT",
      "points": 1.5,
      "line": "0 rush att, 0 rush yd; 4 rec targets, 1 rec, 5 rec yd; 5 total yd"
    },
    {
      "week": 14,
      "team": "BUF",
      "opponent": "CIN",
      "points": 9.6,
      "line": "0 rush att, 0 rush yd; 3 rec targets, 2 rec, 16 rec yd; 16 total yd"
    },
    {
      "week": 15,
      "team": "BUF",
      "opponent": "NE",
      "points": 11.5,
      "line": "0 rush att, 0 rush yd; 5 rec targets, 5 rec, 65 rec yd; 65 total yd"
    },
    {
      "week": 16,
      "team": "BUF",
      "opponent": "CLE",
      "points": 7.4,
      "line": "0 rush att, 0 rush yd; 5 rec targets, 4 rec, 34 rec yd; 34 total yd"
    },
    {
      "week": 17,
      "team": "BUF",
      "opponent": "PHI",
      "points": 9.5,
      "line": "0 rush att, 0 rush yd; 7 rec targets, 6 rec, 35 rec yd; 35 total yd"
    }
  ],
  "102": [
    {
      "week": 14,
      "team": "LAC",
      "opponent": "PHI",
      "points": 0,
      "line": "5/5 FG, 1/1 XP, long 54"
    },
    {
      "week": 15,
      "team": "LAC",
      "opponent": "KC",
      "points": 0,
      "line": "3/3 FG, 1/1 XP, long 49"
    },
    {
      "week": 16,
      "team": "LAC",
      "opponent": "DAL",
      "points": 0,
      "line": "2/2 FG, 4/4 XP, long 37"
    },
    {
      "week": 17,
      "team": "LAC",
      "opponent": "HOU",
      "points": 0,
      "line": "1/2 FG, 1/2 XP, long 27"
    },
    {
      "week": 18,
      "team": "LAC",
      "opponent": "DEN",
      "points": 0,
      "line": "1/1 FG, 0/0 XP, long 30"
    }
  ],
  "103": [
    {
      "week": 14,
      "team": "PIT",
      "opponent": "BAL",
      "points": 0,
      "line": "2/2 FG, 3/3 XP, long 28"
    },
    {
      "week": 15,
      "team": "PIT",
      "opponent": "MIA",
      "points": 0,
      "line": "0/0 FG, 4/4 XP, long -"
    },
    {
      "week": 16,
      "team": "PIT",
      "opponent": "DET",
      "points": 0,
      "line": "2/3 FG, 3/3 XP, long 59"
    },
    {
      "week": 17,
      "team": "PIT",
      "opponent": "CLE",
      "points": 0,
      "line": "2/3 FG, 0/0 XP, long 44"
    },
    {
      "week": 18,
      "team": "PIT",
      "opponent": "BAL",
      "points": 0,
      "line": "2/2 FG, 2/3 XP, long 57"
    }
  ],
  "104": [
    {
      "week": 11,
      "team": "SF",
      "opponent": "ARI",
      "points": 0,
      "line": "3/3 FG, 2/4 XP, long 48"
    },
    {
      "week": 15,
      "team": "SF",
      "opponent": "TEN",
      "points": 0,
      "line": "3/3 FG, 4/4 XP, long 40"
    },
    {
      "week": 16,
      "team": "SF",
      "opponent": "IND",
      "points": 0,
      "line": "2/3 FG, 6/6 XP, long 38"
    },
    {
      "week": 17,
      "team": "SF",
      "opponent": "CHI",
      "points": 0,
      "line": "0/0 FG, 6/6 XP, long -"
    },
    {
      "week": 18,
      "team": "SF",
      "opponent": "SEA",
      "points": 0,
      "line": "1/1 FG, 0/0 XP, long 48"
    }
  ],
  "105": [
    {
      "week": 14,
      "team": "BAL",
      "opponent": "PIT",
      "points": 0,
      "line": "3/3 FG, 1/2 XP, long 36"
    },
    {
      "week": 15,
      "team": "BAL",
      "opponent": "CIN",
      "points": 0,
      "line": "1/1 FG, 3/3 XP, long 27"
    },
    {
      "week": 16,
      "team": "BAL",
      "opponent": "NE",
      "points": 0,
      "line": "1/2 FG, 3/3 XP, long 36"
    },
    {
      "week": 17,
      "team": "BAL",
      "opponent": "GB",
      "points": 0,
      "line": "2/2 FG, 5/5 XP, long 34"
    },
    {
      "week": 18,
      "team": "BAL",
      "opponent": "PIT",
      "points": 0,
      "line": "1/2 FG, 3/3 XP, long 40"
    }
  ],
  "106": [
    {
      "week": 13,
      "team": "NE",
      "opponent": "NYG",
      "points": 0,
      "line": "4/5 FG, 3/3 XP, long 30"
    },
    {
      "week": 15,
      "team": "NE",
      "opponent": "BUF",
      "points": 0,
      "line": "1/1 FG, 4/4 XP, long 36"
    },
    {
      "week": 16,
      "team": "NE",
      "opponent": "BAL",
      "points": 0,
      "line": "2/2 FG, 2/2 XP, long 45"
    },
    {
      "week": 17,
      "team": "NE",
      "opponent": "NYJ",
      "points": 0,
      "line": "0/1 FG, 6/6 XP, long -"
    },
    {
      "week": 18,
      "team": "NE",
      "opponent": "MIA",
      "points": 0,
      "line": "1/2 FG, 5/5 XP, long 59"
    }
  ]
};

const state = loadState() ?? {
  playerDataVersion,
  teams: [],
  activeTeamId: null,
  signedInTeamId: null,
  draftOrder: null,
  currentView: "draft",
  pendingAddPlayerId: null,
  selectedFreeAgentId: null,
  selectedSwapPlayerId: null,
  selectedTradeTarget: null,
  showTradeInbox: false,
  tradeOffers: [],
  draftHistory: [],
  matchupOpponentId: null,
  matchupWeek: 1,
  pick: 1,
  draftStarted: false,
  draftPickStartedAt: Date.now(),
};

let bestLineupHighlightIds = new Set();
let bestLineupHighlightTimer = null;
let isRenamingTeamName = false;
let autoPickInProgressForPick = null;

function playerPointsLabel(player) {
  return `${player.points.toFixed(1)} 2026 proj pts`;
}

function projectedGameAverage(player) {
  return player.points / 17;
}

function weeklyProjectionLabel(player) {
  return `${projectedGameAverage(player).toFixed(1)} weekly proj pts`;
}

function formatScheduleDate(dateValue) {
  if (!dateValue) return "Bye";
  const [year, month, day] = dateValue.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function formatScheduleTime(timeValue) {
  if (!timeValue || timeValue === "TBD") return "TBD";
  const [hourText, minuteText] = timeValue.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minute).padStart(2, "0")} ${suffix} ET`;
}

function matchupWinChance(teamTotal, opponentTotal) {
  if (teamTotal <= 0 && opponentTotal <= 0) return 50;
  const spread = teamTotal - opponentTotal;
  return Math.round(100 / (1 + Math.exp(-spread / 18)));
}

if (state.playerDataVersion !== playerDataVersion) {
  state.playerDataVersion = playerDataVersion;
  state.teams.forEach((team) => {
    team.picks = [];
    team.lineup = [];
  });
  state.pick = 1;
  state.pendingAddPlayerId = null;
  state.selectedFreeAgentId = null;
  state.selectedSwapPlayerId = null;
  state.selectedTradeTarget = null;
  state.showTradeInbox = false;
  state.tradeOffers = [];
  state.draftHistory = [];
  state.draftStarted = false;
  state.draftPickStartedAt = Date.now();
}

ensureDraftOrder();
state.currentView = ["draft", "team", "matchup", "freeAgency", "league"].includes(state.currentView) ? state.currentView : "draft";
state.tradeOffers = Array.isArray(state.tradeOffers) ? state.tradeOffers : [];
state.draftHistory = Array.isArray(state.draftHistory) ? state.draftHistory : [];
repairDraftHistoryFromRosters();
state.draftStarted = Boolean(
  state.draftStarted ||
  state.pick > 1 ||
  state.teams.some((team) => Array.isArray(team.picks) && team.picks.length > 0),
);
state.draftPickStartedAt = Number.isFinite(Number(state.draftPickStartedAt)) ? Number(state.draftPickStartedAt) : Date.now();
state.selectedTradeTarget = state.selectedTradeTarget ?? null;
state.showTradeInbox = Boolean(state.showTradeInbox);
state.matchupOpponentId = state.matchupOpponentId ?? null;
state.matchupWeek = Number.isInteger(Number(state.matchupWeek))
  ? Math.min(Math.max(Number(state.matchupWeek), 1), 18)
  : 1;

if (state.signedInTeamId && !state.teams.some((team) => team.id === state.signedInTeamId)) {
  state.signedInTeamId = null;
}

if (state.signedInTeamId) {
  state.activeTeamId = state.signedInTeamId;
} else {
  state.activeTeamId = null;
}

const els = {
  signinPanel: document.querySelector("#signinPanel"),
  signinForm: document.querySelector("#signinForm"),
  signinTeamSelect: document.querySelector("#signinTeamSelect"),
  signinUsername: document.querySelector("#signinUsername"),
  signinPassword: document.querySelector("#signinPassword"),
  signinMessage: document.querySelector("#signinMessage"),
  signinCreateTeamForm: document.querySelector("#signinCreateTeamForm"),
  signinNewTeamName: document.querySelector("#signinNewTeamName"),
  signinNewUsername: document.querySelector("#signinNewUsername"),
  signinNewPassword: document.querySelector("#signinNewPassword"),
  sessionBar: document.querySelector("#sessionBar"),
  signedInTeamName: document.querySelector("#signedInTeamName"),
  draftRoomBtn: document.querySelector("#draftRoomBtn"),
  myTeamBtn: document.querySelector("#myTeamBtn"),
  matchupBtn: document.querySelector("#matchupBtn"),
  leagueBtn: document.querySelector("#leagueBtn"),
  freeAgencyBtn: document.querySelector("#freeAgencyBtn"),
  signOutBtn: document.querySelector("#signOutBtn"),
  workspace: document.querySelector(".workspace"),
  teamPage: document.querySelector("#teamPage"),
  matchupPage: document.querySelector("#matchupPage"),
  freeAgencyPage: document.querySelector("#freeAgencyPage"),
  leaguePage: document.querySelector("#leaguePage"),
  teamForm: document.querySelector("#teamForm"),
  teamName: document.querySelector("#teamName"),
  teamList: document.querySelector("#teamList"),
  teamCount: document.querySelector("#teamCount"),
  activeTeamName: document.querySelector("#activeTeamName"),
  rosterGrid: document.querySelector("#rosterGrid"),
  teamStats: document.querySelector("#teamStats"),
  teamViewTitle: document.querySelector("#teamViewTitle"),
  renameTeamBtn: document.querySelector("#renameTeamBtn"),
  teamRosterCount: document.querySelector("#teamRosterCount"),
  teamView: document.querySelector("#teamView"),
  playerBoard: document.querySelector("#playerBoard"),
  recentPicks: document.querySelector("#recentPicks"),
  playerSearch: document.querySelector("#playerSearch"),
  positionFilter: document.querySelector("#positionFilter"),
  freeAgentBoard: document.querySelector("#freeAgentBoard"),
  freeAgentConfirm: document.querySelector("#freeAgentConfirm"),
  freeAgentSearch: document.querySelector("#freeAgentSearch"),
  freeAgentPosition: document.querySelector("#freeAgentPosition"),
  matchupView: document.querySelector("#matchupView"),
  leagueView: document.querySelector("#leagueView"),
  tradeInbox: document.querySelector("#tradeInbox"),
  tradeInboxBtn: document.querySelector("#tradeInboxBtn"),
  tradeInboxCount: document.querySelector("#tradeInboxCount"),
  quickDraftBtn: document.querySelector("#quickDraftBtn"),
  startDraftBtn: document.querySelector("#startDraftBtn"),
  autoCompleteDraftBtn: document.querySelector("#autoCompleteDraftBtn"),
  randomizeOrderBtn: document.querySelector("#randomizeOrderBtn"),
  resetDraftBtn: document.querySelector("#resetDraftBtn"),
  autoFillBtn: document.querySelector("#autoFillBtn"),
  roundNumber: document.querySelector("#roundNumber"),
  pickNumber: document.querySelector("#pickNumber"),
  draftTimer: document.querySelector("#draftTimer"),
  draftTimerCard: document.querySelector("#draftTimerCard"),
  onClockTeam: document.querySelector("#onClockTeam"),
  adminSigninBtn: document.querySelector("#adminSigninBtn"),
  adminTeamSigninBtn: document.querySelector("#adminTeamSigninBtn"),
  adminSigninPage: document.querySelector("#adminSigninPage"),
  adminSigninForm: document.querySelector("#adminSigninForm"),
  adminSigninCloseBtn: document.querySelector("#adminSigninCloseBtn"),
  adminUsername: document.querySelector("#adminUsername"),
  adminPassword: document.querySelector("#adminPassword"),
  adminSigninNote: document.querySelector("#adminSigninNote"),
  playerProfileModal: document.querySelector("#playerProfileModal"),
  playerProfileContent: document.querySelector("#playerProfileContent"),
  playerProfileCloseBtn: document.querySelector("#playerProfileCloseBtn"),
};

function isAdminSignedIn() {
  return sessionStorage.getItem("fantasy-admin-signed-in") === "true";
}

function isAdminSite() {
  return stateStorageKey === "gridiron-draft-lab-admin";
}

function renderAdminSignIn() {
  if (!els.adminSigninBtn) return;
  els.adminSigninBtn.textContent = stateStorageKey === "gridiron-draft-lab-admin" ? "Admin signed in" : "Admin sign in";
}

function openAdminSignIn() {
  if (!els.adminSigninPage) return;
  if (isAdminSignedIn() && stateStorageKey !== "gridiron-draft-lab-admin") {
    window.location.href = "admin.html";
    return;
  }
  els.adminSigninPage.hidden = false;
  els.adminUsername?.focus();
}

function closeAdminSignIn() {
  if (!els.adminSigninPage) return;
  els.adminSigninPage.hidden = true;
  els.adminSigninForm?.reset();
}

function signInAdmin() {
  const username = els.adminUsername?.value.trim() ?? "";
  const password = els.adminPassword?.value ?? "";
  if (username !== adminUsername || password !== adminPassword) {
    if (els.adminSigninNote) {
      els.adminSigninNote.textContent = "Username or password is incorrect.";
      els.adminSigninNote.classList.remove("success");
    }
    return;
  }

  sessionStorage.setItem("fantasy-admin-signed-in", "true");
  if (els.adminSigninNote) {
    els.adminSigninNote.textContent = "Signed in for this admin browser session.";
    els.adminSigninNote.classList.add("success");
  }
  renderAdminSignIn();
  window.setTimeout(() => {
    if (stateStorageKey === "gridiron-draft-lab-admin") {
      closeAdminSignIn();
      return;
    }
    window.location.href = "admin.html";
  }, 650);
}

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(stateStorageKey));
  } catch {
    return null;
  }
}

function saveState() {
  localStorage.setItem(stateStorageKey, JSON.stringify(state));
  queueLiveDraftSave();
}

function sharedDraftState() {
  return {
    playerDataVersion: state.playerDataVersion,
    teams: state.teams,
    draftOrder: state.draftOrder,
    pick: state.pick,
    draftStarted: state.draftStarted,
    draftPickStartedAt: state.draftPickStartedAt,
    tradeOffers: state.tradeOffers,
    draftHistory: state.draftHistory,
  };
}

function applySharedDraftState(nextSharedState) {
  if (!nextSharedState) return;
  isApplyingLiveState = true;
  state.playerDataVersion = nextSharedState.playerDataVersion ?? state.playerDataVersion;
  state.teams = Array.isArray(nextSharedState.teams) ? nextSharedState.teams : state.teams;
  state.draftOrder = Array.isArray(nextSharedState.draftOrder) ? nextSharedState.draftOrder : state.draftOrder;
  state.pick = Number.isInteger(Number(nextSharedState.pick)) ? Number(nextSharedState.pick) : state.pick;
  state.draftStarted = Boolean(
    nextSharedState.draftStarted ||
    state.pick > 1 ||
    state.teams.some((team) => Array.isArray(team.picks) && team.picks.length > 0),
  );
  state.draftPickStartedAt = Number.isFinite(Number(nextSharedState.draftPickStartedAt))
    ? Number(nextSharedState.draftPickStartedAt)
    : state.draftPickStartedAt;
  state.tradeOffers = Array.isArray(nextSharedState.tradeOffers) ? nextSharedState.tradeOffers : [];
  state.draftHistory = Array.isArray(nextSharedState.draftHistory) ? nextSharedState.draftHistory : [];
  repairDraftHistoryFromRosters();
  ensureDraftOrder();

  if (state.signedInTeamId && !state.teams.some((team) => team.id === state.signedInTeamId)) {
    state.signedInTeamId = null;
    state.activeTeamId = null;
  } else if (state.signedInTeamId) {
    state.activeTeamId = state.signedInTeamId;
  }

  localStorage.setItem(stateStorageKey, JSON.stringify(state));
  render();
  isApplyingLiveState = false;
  updateDraftTimerDisplay();
}

function setLiveDraftStatus(status, text) {
  let badge = document.querySelector("#liveDraftStatus");
  if (!badge) {
    badge = document.createElement("div");
    badge.id = "liveDraftStatus";
    badge.className = "live-draft-status";
    document.body.append(badge);
  }
  badge.dataset.status = status;
  badge.textContent = text;
}

function queueLiveDraftSave() {
  if (!liveDraftEnabled || isApplyingLiveState) return;
  clearTimeout(liveDraftSaveTimer);
  liveDraftSaveTimer = setTimeout(() => {
    pushLiveDraftState();
  }, 120);
}

async function pushLiveDraftState() {
  if (!liveDraftEnabled) return;
  try {
    const response = await fetch("/api/live-state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: liveDraftClientId,
        baseRevision: liveDraftRevision,
        state: sharedDraftState(),
      }),
    });
    const payload = await response.json();
    if (response.status === 409) {
      liveDraftRevision = payload.revision;
      applySharedDraftState(payload.state);
      setLiveDraftStatus("warning", "Live draft refreshed");
      return;
    }
    if (!response.ok) throw new Error(payload.error || "Live draft save failed");
    liveDraftRevision = payload.revision;
    setLiveDraftStatus("connected", "Live draft connected");
  } catch {
    setLiveDraftStatus("offline", "Live draft offline");
  }
}

async function connectLiveDraft() {
  try {
    const response = await fetch("/api/live-state", { cache: "no-store" });
    if (!response.ok) return;
    const payload = await response.json();
    liveDraftEnabled = true;
    liveDraftRevision = payload.revision;
    setLiveDraftStatus("connected", "Live draft connected");

    if (payload.state) {
      applySharedDraftState(payload.state);
    } else {
      await pushLiveDraftState();
    }

    const events = new EventSource(`/api/live-events?clientId=${encodeURIComponent(liveDraftClientId)}`);
    events.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      if (payload.type !== "state") return;
      liveDraftRevision = payload.revision;
      applySharedDraftState(payload.state);
      setLiveDraftStatus("connected", "Live draft connected");
    };
    events.onerror = () => {
      setLiveDraftStatus("offline", "Live draft reconnecting");
    };
  } catch {
    liveDraftEnabled = false;
  }
}

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizedPlayerName(name) {
  return name
    .replace(/\b(Jr\.|Sr\.|III|II|IV)\b/g, "")
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase();
}

const playerNicknameAliases = {
  "A.J. Brown": ["AJB"],
  "Amon-Ra St. Brown": ["ARSB", "Sun God"],
  "Bijan Robinson": ["Bijan Mustardson"],
  "Breece Hall": ["Breece Lightning"],
  "Brian Robinson Jr.": ["B Rob", "BRob"],
  "Brian Thomas Jr.": ["BTJ"],
  "Cam Skattebo": ["Skatt"],
  "CeeDee Lamb": ["CD", "CD Lamb"],
  "Christian McCaffrey": ["CMC"],
  "D'Andre Swift": ["Swift"],
  "DK Metcalf": ["DK"],
  "Derrick Henry": ["King Henry"],
  "Deebo Samuel Sr.": ["Deebo"],
  "De'Von Achane": ["Achane"],
  "DJ Moore": ["DJ"],
  "D.J. Giddens": ["DJ"],
  "Evan Engram": ["Engram"],
  "George Kittle": ["Kittle"],
  "J.K. Dobbins": ["JK"],
  "Ja'Marr Chase": ["Jamarr", "Uno"],
  "Jahmyr Gibbs": ["Gibbs"],
  "James Cook III": ["James Cook"],
  "Jaxon Smith-Njigba": ["JSN"],
  "Jayden Daniels": ["JD5", "JD"],
  "Jaylen Waddle": ["Waddle"],
  "Justin Jefferson": ["JJ", "JJettas", "Jets"],
  "Kenneth Walker III": ["KW3", "K9"],
  "Ladd McConkey": ["Ladd"],
  "Lamar Jackson": ["LJ", "Action Jackson"],
  "Malik Nabers": ["Nabers"],
  "Marvin Harrison Jr.": ["MHJ"],
  "Michael Penix Jr.": ["Penix"],
  "Puka Nacua": ["Puka"],
  "Rachaad White": ["Chaad"],
  "Rashee Rice": ["Rice"],
  "Saquon Barkley": ["Quads", "Saquads"],
  "Tee Higgins": ["Tee"],
  "Terry McLaurin": ["Scary Terry"],
  "Tetairoa McMillan": ["TMac", "T-Mac"],
  "T.J. Hockenson": ["Hock", "Hockenson"],
  "TJ Hockenson": ["Hock", "Hockenson"],
  "Travis Etienne Jr.": ["ETN"],
  "TreVeyon Henderson": ["TreVeyon"],
  "Tua Tagovailoa": ["Tua"],
  "Wan'Dale Robinson": ["WanDale"],
};

function playerSearchAliases(player) {
  const aliases = playerNicknameAliases[player.name] ?? [];
  const initials = player.name
    .replace(/\b(Jr\.|Sr\.|III|II|IV)\b/g, "")
    .split(/[\s.'-]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("");
  return [...aliases, initials].filter(Boolean);
}

function previousTeamForPlayer(player) {
  const normalizedName = normalizedPlayerName(player.name);
  return legacyPlayers.find((candidate) => normalizedPlayerName(candidate.name) === normalizedName)?.nfl ?? null;
}

function playerNameProfileButton(player) {
  return `<button class="player-name-link" type="button" data-player-profile-id="${player.id}">${escapeHTML(player.name)}</button>`;
}

function profileRoleText(player) {
  const roleByPosition = {
    QB: "primary passer and weekly offensive engine",
    RB: "backfield touch earner with rushing and receiving paths to points",
    WR: "route-running target earner in the passing game",
    TE: "middle-of-field target and red-zone matchup piece",
    K: "kicking option tied to drive quality and scoring chances",
    DST: "team defense and special teams unit built on sacks, turnovers, and points allowed",
  };
  if (player.rookie) {
    return `${player.name} enters the 2026-2027 fantasy season as an incoming rookie ${roleByPosition[player.pos]} for ${player.nfl}. His early value depends on how quickly he earns snaps, trust, and scoring chances in his first NFL offense.`;
  }
  const oldTeam = previousTeamForPlayer(player);
  const teamContext = oldTeam && oldTeam !== player.nfl
    ? ` After moving from ${oldTeam} to ${player.nfl}, his 2026-2027 fantasy value depends on how quickly that role translates in a new system.`
    : "";
  const verb = player.pos === "DST" ? "enter" : "enters";
  return `${player.name} ${verb} the 2026-2027 fantasy season as a ${roleByPosition[player.pos]} for ${player.nfl}.${teamContext}`;
}

function profileGameLogs(player) {
  return playerGameLogs2025[player.id] ?? [];
}

function profileSchedule(player) {
  return teamSchedule2026[player.nfl] ?? [];
}

function scheduleForWeek(player, week) {
  return profileSchedule(player).find((game) => game.week === week) ?? null;
}

function playerWeeklyMatchupLabel(player, week) {
  const game = scheduleForWeek(player, week);
  if (!game) return `Week ${week}: schedule unavailable`;
  if (game.bye) return `Week ${week}: Bye`;
  return `Week ${week}: ${game.site} ${game.opponent}, ${formatScheduleTime(game.time)}`;
}

function openPlayerProfile(playerId) {
  const player = playerById(Number(playerId));
  if (!player || !els.playerProfileModal || !els.playerProfileContent) return;

  const logs = profileGameLogs(player);
  const schedule = profileSchedule(player);
  const hasGameLogs = logs.length > 0;
  const average = hasGameLogs ? logs.reduce((sum, log) => sum + log.points, 0) / logs.length : 0;
  const high = hasGameLogs ? Math.max(...logs.map((log) => log.points)) : 0;
  const low = hasGameLogs ? Math.min(...logs.map((log) => log.points)) : 0;
  const projectedAverage = projectedGameAverage(player);
  const aboveAverage = logs.filter((log) => log.points >= projectedAverage).length;
  const gameLogRows = hasGameLogs
    ? logs.map((log) => `
      <tr>
        <td>${log.week}</td>
        <td>${log.team} vs ${log.opponent}</td>
        <td>${log.points.toFixed(1)}</td>
        <td>${escapeHTML(log.line)}</td>
      </tr>
    `).join("")
    : `
      <tr>
        <td colspan="4">No 2025 regular-season player game logs are available from nflverse for this profile.</td>
      </tr>
    `;
  const scheduleRows = schedule.length
    ? schedule.map((game) => `
      <tr>
        <td>${game.week}</td>
        <td>${game.bye ? "Bye" : `${game.site} ${game.opponent}`}</td>
        <td>${game.bye ? "-" : formatScheduleDate(game.date)}</td>
        <td>${game.bye ? "-" : `${game.weekday}, ${formatScheduleTime(game.time)}`}</td>
      </tr>
    `).join("")
    : `
      <tr>
        <td colspan="4">No 2026 regular-season schedule is available for ${escapeHTML(player.nfl)}.</td>
      </tr>
    `;
  els.playerProfileContent.innerHTML = `
    <header class="profile-header">
      <p class="section-kicker">Player profile</p>
      <h2>${escapeHTML(player.name)}</h2>
      <div class="profile-tags">
        <span class="profile-tag">${player.pos}</span>
        <span class="profile-tag">${player.nfl}</span>
        ${player.rookie ? '<span class="profile-tag">Rookie</span>' : ""}
        <span class="profile-tag">Rank ${player.rank}</span>
        <span class="profile-tag">${playerPointsLabel(player)}</span>
      </div>
    </header>
    <div class="profile-body">
      <p class="profile-description">${escapeHTML(profileRoleText(player))}</p>
      <div class="profile-stat-grid">
        <div class="profile-stat">2026 proj pts<strong>${player.points.toFixed(1)}</strong></div>
        <div class="profile-stat">2025 log avg<strong>${hasGameLogs ? average.toFixed(1) : "-"}</strong></div>
        <div class="profile-stat">2025 log high<strong>${hasGameLogs ? high.toFixed(1) : "-"}</strong></div>
        <div class="profile-stat">Games at proj/gm<strong>${hasGameLogs ? `${aboveAverage}/${logs.length}` : "-"}</strong></div>
      </div>
      <h3 class="profile-section-title">2026 regular-season schedule</h3>
      <table class="game-log-table profile-schedule-table">
        <thead>
          <tr>
            <th>Week</th>
            <th>Matchup</th>
            <th>Date</th>
            <th>Kickoff</th>
          </tr>
        </thead>
        <tbody>
          ${scheduleRows}
        </tbody>
      </table>
      <h3 class="profile-section-title">Last 5 2025 regular-season game logs</h3>
      <table class="game-log-table">
        <thead>
          <tr>
            <th>Week</th>
            <th>Game</th>
            <th>PPR</th>
            <th>Usage line</th>
          </tr>
        </thead>
        <tbody>
          ${gameLogRows}
        </tbody>
      </table>
      <div class="profile-stat-grid">
        <div class="profile-stat">2025 log low<strong>${hasGameLogs ? low.toFixed(1) : "-"}</strong></div>
        <div class="profile-stat">Position<strong>${player.pos}</strong></div>
        <div class="profile-stat">Team<strong>${player.nfl}</strong></div>
        <div class="profile-stat">Draft rank<strong>${player.rank}</strong></div>
      </div>
    </div>
  `;
  els.playerProfileModal.hidden = false;
}

function closePlayerProfile() {
  if (!els.playerProfileModal) return;
  els.playerProfileModal.hidden = true;
  if (els.playerProfileContent) {
    els.playerProfileContent.innerHTML = "";
  }
}

function activeTeam() {
  return state.teams.find((team) => team.id === state.activeTeamId) ?? null;
}

function teamById(teamId) {
  return state.teams.find((team) => team.id === teamId) ?? null;
}

function signedInTeam() {
  return state.teams.find((team) => team.id === state.signedInTeamId) ?? null;
}

function isSignedIn() {
  return Boolean(signedInTeam());
}

function teamHasCredentials(team) {
  return Boolean(team?.username && team?.password);
}

function setSignInMessage(text = "", type = "") {
  if (!els.signinMessage) return;
  els.signinMessage.textContent = text;
  els.signinMessage.classList.toggle("error", type === "error");
  els.signinMessage.classList.toggle("success", type === "success");
}

function normalizeUsername(username) {
  return username.trim().slice(0, 28);
}

function normalizePassword(password) {
  return password.slice(0, 40);
}

function ensureDraftOrder() {
  const currentIds = new Set(state.teams.map((team) => team.id));
  const existingOrder = Array.isArray(state.draftOrder) ? state.draftOrder : [];
  const normalizedOrder = existingOrder.filter((teamId) => currentIds.has(teamId));

  state.teams.forEach((team) => {
    if (!normalizedOrder.includes(team.id)) {
      normalizedOrder.push(team.id);
    }
  });

  state.draftOrder = normalizedOrder;
}

function draftOrderTeams() {
  ensureDraftOrder();
  return state.draftOrder.map((teamId) => teamById(teamId)).filter(Boolean);
}

function draftSlotForTeam(teamId) {
  ensureDraftOrder();
  const index = state.draftOrder.indexOf(teamId);
  return index >= 0 ? index + 1 : null;
}

function currentDraftIndex() {
  const teamCount = state.draftOrder.length;
  if (!teamCount) return -1;

  const pickIndex = Math.max(state.pick - 1, 0);
  const roundIndex = Math.floor(pickIndex / teamCount);
  const slotIndex = pickIndex % teamCount;
  return roundIndex % 2 === 0 ? slotIndex : teamCount - 1 - slotIndex;
}

function currentDraftTeam() {
  const teamId = state.draftOrder[currentDraftIndex()];
  return teamById(teamId);
}

function isSignedInTeamOnClock() {
  const team = currentDraftTeam();
  return Boolean(state.draftStarted && team && team.id === state.signedInTeamId);
}

function isDraftComplete() {
  return state.teams.length > 0 && state.teams.every((team) => team.picks.length >= rosterSlots.length);
}

function isFreeAgencyOpen() {
  return isDraftComplete();
}

function draftedIds() {
  return new Set(state.teams.flatMap((team) => team.picks));
}

function pendingAddPlayer() {
  const player = players.find((candidate) => candidate.id === state.pendingAddPlayerId);
  if (!player || draftedIds().has(player.id)) {
    state.pendingAddPlayerId = null;
    return null;
  }
  return player;
}

function canFillSlot(slot, player) {
  return (
    slot === player.pos ||
    slot === "BENCH" ||
    (slot === "FLEX" && ["RB", "WR", "TE"].includes(player.pos))
  );
}

function assignedRoster(team) {
  const picks = team.picks.map((id) => players.find((player) => player.id === id)).filter(Boolean);
  const used = new Set();
  const roster = rosterSlots.map((slot, index) => ({ slot, index, player: null }));
  const lineup = Array.isArray(team.lineup) ? team.lineup : [];

  roster.forEach((item, index) => {
    const playerId = lineup[index];
    const player = picks.find((candidate) => candidate.id === playerId);
    if (player && !used.has(player.id) && canFillSlot(item.slot, player)) {
      used.add(player.id);
      item.player = player;
    }
  });

  roster.forEach((item) => {
    if (item.player) return;
    const player = picks.find((candidate) => !used.has(candidate.id) && canFillSlot(item.slot, candidate));
    if (player) {
      used.add(player.id);
      item.player = player;
    }
  });

  roster.forEach((item) => {
    if (item.player) return;
    const player = picks.find((candidate) => !used.has(candidate.id));
    if (player) {
      used.add(player.id);
      item.slot = "BENCH";
      item.player = player;
    }
  });

  return roster;
}

function syncLineupFromRoster(team) {
  team.lineup = assignedRoster({ ...team, lineup: team.lineup }).map((item) => item.player?.id ?? null);
}

function bestStarterLineup(rosterPlayers) {
  const starterSlots = rosterSlots.slice(0, 9);
  let bestScore = -Infinity;
  let bestLineup = Array(starterSlots.length).fill(null);

  function placePlayer(slotIndex, remainingPlayers, lineup, score) {
    if (slotIndex >= starterSlots.length) {
      if (score > bestScore) {
        bestScore = score;
        bestLineup = [...lineup];
      }
      return;
    }

    const slot = starterSlots[slotIndex];
    const candidates = remainingPlayers.filter((player) => canFillSlot(slot, player));
    if (!candidates.length) {
      lineup[slotIndex] = null;
      placePlayer(slotIndex + 1, remainingPlayers, lineup, score);
      return;
    }

    candidates.forEach((player) => {
      lineup[slotIndex] = player.id;
      placePlayer(
        slotIndex + 1,
        remainingPlayers.filter((candidate) => candidate.id !== player.id),
        lineup,
        score + player.points,
      );
    });
  }

  placePlayer(0, rosterPlayers, Array(starterSlots.length).fill(null), 0);
  return bestLineup;
}

function setBestLineup(team) {
  const rosterPlayers = picksForTeam(team);
  const starterLineup = bestStarterLineup(rosterPlayers);
  const starterIds = new Set(starterLineup.filter(Boolean));
  const benchLineup = rosterPlayers
    .filter((player) => !starterIds.has(player.id))
    .sort((a, b) => b.points - a.points)
    .map((player) => player.id);

  team.lineup = [...starterLineup, ...benchLineup];
}

function picksForTeam(team) {
  return team.picks.map((id) => players.find((player) => player.id === id)).filter(Boolean);
}

function playerById(playerId) {
  return players.find((player) => player.id === playerId) ?? null;
}

function repairDraftHistoryFromRosters() {
  if (!Array.isArray(state.teams) || !state.teams.length) return false;
  const draftedCount = state.teams.reduce((total, team) => total + (Array.isArray(team.picks) ? team.picks.length : 0), 0);
  const historyCount = Array.isArray(state.draftHistory) ? state.draftHistory.length : 0;
  if (!draftedCount || historyCount >= draftedCount) return false;

  ensureDraftOrder();
  const pickQueues = new Map(
    state.teams.map((team) => [team.id, Array.isArray(team.picks) ? [...team.picks] : []]),
  );
  const existingHistoryByPick = new Map(state.draftHistory.map((pick) => [pick.pick, pick]));
  const repairedHistory = [];
  const previousPick = state.pick;
  const totalPicksToRepair = Math.max(previousPick - 1, draftedCount);

  for (let pickNumber = 1; pickNumber <= totalPicksToRepair; pickNumber += 1) {
    state.pick = pickNumber;
    const team = currentDraftTeam();
    const playerId = team ? pickQueues.get(team.id)?.shift() : null;
    if (!team || !playerById(playerId)) continue;
    const existingPick = existingHistoryByPick.get(pickNumber);
    repairedHistory.push({
      pick: pickNumber,
      teamId: team.id,
      playerId,
      selectedAt: existingPick?.selectedAt ?? Date.now(),
    });
  }

  state.pick = previousPick;
  if (repairedHistory.length <= historyCount) return false;
  state.draftHistory = repairedHistory;
  return true;
}

function recordDraftPick(team, playerId, pickNumber) {
  if (!team || !playerById(playerId)) return;
  state.draftHistory = Array.isArray(state.draftHistory) ? state.draftHistory : [];
  state.draftHistory = state.draftHistory.filter((pick) => pick.pick !== pickNumber);
  state.draftHistory.push({
    pick: pickNumber,
    teamId: team.id,
    playerId,
    selectedAt: Date.now(),
  });
}

function resetDraftTimer() {
  state.draftPickStartedAt = Date.now();
}

function remainingDraftPickMs() {
  if (!state.draftStarted || isDraftComplete()) return 0;
  const startedAt = Number.isFinite(Number(state.draftPickStartedAt)) ? Number(state.draftPickStartedAt) : Date.now();
  return Math.max(draftPickDurationMs - (Date.now() - startedAt), 0);
}

function formatDraftTimer(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function updateDraftTimerDisplay() {
  if (!els.draftTimer) return;
  if (!state.draftStarted && !isDraftComplete()) {
    autoPickInProgressForPick = null;
    els.draftTimer.textContent = "Ready";
    els.draftTimerCard?.setAttribute("data-status", "ready");
    return;
  }

  if (isDraftComplete()) {
    autoPickInProgressForPick = null;
    els.draftTimer.textContent = "Done";
    els.draftTimerCard?.setAttribute("data-status", "complete");
    return;
  }

  const remainingMs = remainingDraftPickMs();
  els.draftTimer.textContent = formatDraftTimer(remainingMs);
  const status = remainingMs <= 0 ? "expired" : remainingMs <= 30_000 ? "warning" : "active";
  els.draftTimerCard?.setAttribute("data-status", status);
  if (remainingMs <= 0 && !isApplyingLiveState) {
    autoDraftExpiredPick();
  }
}

function incomingTradeOffers() {
  return state.tradeOffers.filter((offer) => offer.status === "pending" && offer.toTeamId === state.signedInTeamId);
}

function mailboxTradeMessages() {
  return state.tradeOffers.filter((offer) => (
    (offer.status === "pending" && offer.toTeamId === state.signedInTeamId) ||
    (offer.status === "accepted" && [offer.fromTeamId, offer.toTeamId].includes(state.signedInTeamId))
  ));
}

function canCompleteTrade(offer) {
  const fromTeam = teamById(offer.fromTeamId);
  const toTeam = teamById(offer.toTeamId);
  if (!fromTeam || !toTeam) return false;
  if (!fromTeam.picks.includes(offer.offeredPlayerId) || !toTeam.picks.includes(offer.requestedPlayerId)) {
    return false;
  }

  const fromNextPicks = [
    ...fromTeam.picks.filter((id) => id !== offer.offeredPlayerId),
    offer.requestedPlayerId,
  ];
  const toNextPicks = [
    ...toTeam.picks.filter((id) => id !== offer.requestedPlayerId),
    offer.offeredPlayerId,
  ];

  return meetsMinimums(fromNextPicks) && meetsMinimums(toNextPicks);
}

function missingMinimumPositions(picks) {
  const positions = new Set(picks.map((player) => player.pos));
  return minimumRosterPositions.filter((position) => !positions.has(position));
}

function canStillMeetMinimums(pickIds) {
  const picks = pickIds.map((id) => players.find((player) => player.id === id)).filter(Boolean);
  const openSlots = rosterSlots.length - picks.length;
  return missingMinimumPositions(picks).length <= openSlots;
}

function meetsMinimums(pickIds) {
  const picks = pickIds.map((id) => players.find((player) => player.id === id)).filter(Boolean);
  return missingMinimumPositions(picks).length === 0;
}

function canAddPlayer(team, player) {
  if (!team || team.picks.length >= rosterSlots.length || draftedIds().has(player.id)) {
    return false;
  }

  const nextPicks = [...team.picks, player.id];
  if (!canStillMeetMinimums(nextPicks)) {
    return false;
  }

  const nextRoster = assignedRoster({ ...team, picks: nextPicks });
  return nextRoster.some((item) => item.player?.id === player.id);
}

function canReplacePlayer(team, droppedPlayerId, addedPlayer) {
  if (!team || !addedPlayer || draftedIds().has(addedPlayer.id)) {
    return false;
  }

  const nextPicks = [...team.picks.filter((id) => id !== droppedPlayerId), addedPlayer.id];
  return team.picks.includes(droppedPlayerId) && meetsMinimums(nextPicks);
}

function canDropPlayer(team, droppedPlayerId) {
  if (!team || !team.picks.includes(droppedPlayerId)) {
    return false;
  }

  return meetsMinimums(team.picks.filter((id) => id !== droppedPlayerId));
}

function canSwapLineupPlayers(team, firstPlayerId, secondPlayerId) {
  if (!team || firstPlayerId === secondPlayerId) return false;

  const roster = assignedRoster(team);
  const firstEntry = roster.find((item) => item.player?.id === firstPlayerId);
  const secondEntry = roster.find((item) => item.player?.id === secondPlayerId);
  if (!firstEntry || !secondEntry) return false;

  return canFillSlot(firstEntry.slot, secondEntry.player) && canFillSlot(secondEntry.slot, firstEntry.player);
}

function swapLineupPlayers(firstPlayerId, secondPlayerId) {
  const team = activeTeam();
  if (!isSignedIn() || !team || !canSwapLineupPlayers(team, firstPlayerId, secondPlayerId)) return;

  syncLineupFromRoster(team);
  const firstIndex = team.lineup.indexOf(firstPlayerId);
  const secondIndex = team.lineup.indexOf(secondPlayerId);
  if (firstIndex < 0 || secondIndex < 0) return;

  [team.lineup[firstIndex], team.lineup[secondIndex]] = [team.lineup[secondIndex], team.lineup[firstIndex]];
  state.selectedSwapPlayerId = null;
  persistAndRender();
}

function availablePlayers() {
  const used = draftedIds();
  return players.filter((player) => !used.has(player.id)).sort((a, b) => a.rank - b.rank);
}

function renderTeams() {
  els.teamList.innerHTML = "";
  els.teamCount.textContent = state.teams.length;

  if (!state.teams.length) {
    els.teamList.innerHTML = '<p class="empty-state">Create your first fantasy team to start drafting.</p>';
    return;
  }

  state.teams.forEach((team) => {
    const button = document.querySelector("#teamTemplate").content.firstElementChild.cloneNode(true);
    button.classList.toggle("active", team.id === state.activeTeamId);
    button.disabled = team.id !== state.signedInTeamId;
    button.querySelector(".team-card-name").textContent = team.name;
    const draftSlot = draftSlotForTeam(team.id);
    button.querySelector(".team-card-meta").textContent =
      team.id === state.signedInTeamId
        ? `Draft slot ${draftSlot} - ${team.picks.length}/${rosterSlots.length} players drafted`
        : `Draft slot ${draftSlot} - Locked`;
    button.addEventListener("click", () => {
      if (team.id === state.signedInTeamId) {
        state.activeTeamId = team.id;
        persistAndRender();
      }
    });
    button.addEventListener("contextmenu", (event) => {
      if (team.id !== state.signedInTeamId) return;
      event.preventDefault();
      renameSignedInTeam();
    });
    els.teamList.append(button);
  });
}

function renderSignIn() {
  const team = signedInTeam();
  els.signinTeamSelect.innerHTML = "";

  if (!state.teams.length) {
    const option = document.createElement("option");
    option.textContent = "Create a team first";
    option.value = "";
    els.signinTeamSelect.append(option);
  } else {
    draftOrderTeams().forEach((item) => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = `${draftSlotForTeam(item.id)}. ${item.name}`;
      option.selected = item.id === state.signedInTeamId;
      els.signinTeamSelect.append(option);
    });
  }

  els.signinPanel.hidden = Boolean(team);
  els.sessionBar.hidden = !team;
  els.workspace.hidden = !team || state.currentView !== "draft";
  els.teamPage.hidden = !team || state.currentView !== "team";
  els.matchupPage.hidden = !team || state.currentView !== "matchup";
  els.freeAgencyPage.hidden = !team || state.currentView !== "freeAgency";
  els.leaguePage.hidden = !team || state.currentView !== "league";
  els.signedInTeamName.textContent = team?.name ?? "No team selected";
  els.signinTeamSelect.disabled = !state.teams.length;
  els.signinUsername.disabled = !state.teams.length;
  els.signinPassword.disabled = !state.teams.length;
  els.signinForm.querySelector("button").disabled = !state.teams.length;
  els.quickDraftBtn.disabled = !team || !state.draftStarted || !isSignedInTeamOnClock();
  els.freeAgentSearch.disabled = !isFreeAgencyOpen();
  els.freeAgentPosition.disabled = !isFreeAgencyOpen();
  if (els.startDraftBtn) {
    els.startDraftBtn.hidden = !isAdminSite();
    els.startDraftBtn.disabled = !isAdminSite() || state.teams.length < 1 || state.draftStarted || isDraftComplete();
  }
  if (els.autoCompleteDraftBtn) {
    els.autoCompleteDraftBtn.disabled = !state.teams.length || isDraftComplete();
  }
  if (els.randomizeOrderBtn) {
    els.randomizeOrderBtn.hidden = !isAdminSite();
    els.randomizeOrderBtn.disabled = !isAdminSite() || state.teams.length < 2 || isDraftComplete();
  }
  if (els.resetDraftBtn) {
    els.resetDraftBtn.disabled = !team;
  }
  els.draftRoomBtn.classList.toggle("active", state.currentView === "draft");
  els.myTeamBtn.classList.toggle("active", state.currentView === "team");
  els.matchupBtn.classList.toggle("active", state.currentView === "matchup");
  els.leagueBtn.classList.toggle("active", state.currentView === "league");
  els.freeAgencyBtn.classList.toggle("active", state.currentView === "freeAgency");
  const incomingCount = incomingTradeOffers().length;
  els.tradeInboxCount.textContent = incomingCount;
  els.tradeInboxBtn.classList.toggle("has-mail", incomingCount > 0);
  els.leagueBtn.classList.toggle("has-notification", incomingCount > 0);
}

function renderRoster() {
  const team = activeTeam();
  els.rosterGrid.innerHTML = "";
  els.teamStats.innerHTML = "";
  els.activeTeamName.textContent = team ? team.name : "Create a team";
  if (els.autoFillBtn) {
    els.autoFillBtn.disabled = !team || !state.draftStarted || !isSignedInTeamOnClock() || team.picks.length >= rosterSlots.length;
  }

  if (!team) {
    els.rosterGrid.innerHTML = '<p class="empty-state">Your drafted players will appear here by roster slot.</p>';
    return;
  }

  const roster = assignedRoster(team);
  roster.forEach(({ slot, index, player }) => {
    const card = document.createElement("article");
    card.className = `slot ${player ? "filled" : ""}`;
    card.innerHTML = `
      <div class="slot-label"><span>${slot}</span><span>${index + 1}</span></div>
      <div class="slot-name">${player ? playerNameProfileButton(player) : "Open slot"}</div>
      <div class="slot-meta">${player ? `${player.pos} - ${player.nfl} - ${weeklyProjectionLabel(player)}` : "Draft a matching player"}</div>
    `;
    els.rosterGrid.append(card);
  });

  const total = teamWeeklyProjectedScore(team);
  const filledSlots = roster.filter((item) => item.player).length;
  const needs = roster.filter((item) => !item.player).map((item) => item.slot);

  [
    ["Weekly projected", total.toFixed(1)],
    ["Filled", `${filledSlots}/${rosterSlots.length}`],
    ["Needs", needs.length ? [...new Set(needs)].join(", ") : "Set"],
  ].forEach(([label, value]) => {
    const stat = document.createElement("div");
    stat.className = "stat";
    stat.innerHTML = `${label}<strong>${value}</strong>`;
    els.teamStats.append(stat);
  });
}

function playerMatchesFilters(player, query, position) {
  const matchesPosition = position === "ALL" || player.pos === position;
  const aliases = playerSearchAliases(player);
  const haystack = `${player.name} ${player.nfl} ${player.pos} ${aliases.join(" ")}`.toLowerCase();
  const normalizedHaystack = normalizedPlayerName(haystack);
  const normalizedQuery = normalizedPlayerName(query);
  return matchesPosition && (haystack.includes(query) || normalizedHaystack.includes(normalizedQuery));
}

function renderPlayerList(container, visiblePlayers, actionLabel, emptyMessage, onAddPlayer, requiresTurn = false, allowFullRosterQueue = false) {
  const team = activeTeam();
  container.innerHTML = "";

  if (!visiblePlayers.length) {
    container.innerHTML = `<p class="empty-state">${emptyMessage}</p>`;
    return;
  }

  visiblePlayers.forEach((player) => {
    const card = document.querySelector("#playerTemplate").content.firstElementChild.cloneNode(true);
    card.querySelector(".rank-badge").textContent = player.rank;
    card.querySelector("h3").innerHTML = playerNameProfileButton(player);
    card.querySelector("p").textContent = `${player.pos} - ${player.nfl}`;
    card.querySelector(".player-score").textContent = playerPointsLabel(player);
    const addButton = card.querySelector(".player-action-btn");
    const canAdd = canAddPlayer(team, player);
    const isAllowedTurn = !requiresTurn || (state.draftStarted && isSignedInTeamOnClock());
    const isRosterFull = Boolean(team && team.picks.length >= rosterSlots.length);
    const canQueueFullRosterAdd = allowFullRosterQueue && isRosterFull && !draftedIds().has(player.id);
    addButton.textContent = canAdd && isAllowedTurn ? actionLabel : requiresTurn && !isAllowedTurn ? "Wait turn" : canQueueFullRosterAdd ? actionLabel : "Wrong pos";
    addButton.disabled = (!canAdd && !canQueueFullRosterAdd) || !isAllowedTurn;
    addButton.addEventListener("click", () => onAddPlayer(player.id));
    container.append(card);
  });
}

function renderBoard() {
  const query = els.playerSearch.value.trim().toLowerCase();
  const position = els.positionFilter.value;
  const visiblePlayers = availablePlayers().filter((player) => playerMatchesFilters(player, query, position));
  renderPlayerList(els.playerBoard, visiblePlayers, "Draft", "No available players match those filters.", draftPlayer, true);
  renderRecentPicks();
}

function renderRecentPicks() {
  if (!els.recentPicks) return;
  const recent = [...state.draftHistory]
    .filter((pick) => teamById(pick.teamId) && playerById(pick.playerId))
    .sort((a, b) => b.pick - a.pick)
    .slice(0, 8);

  if (!recent.length) {
    els.recentPicks.innerHTML = `
      <div class="recent-picks-header">
        <h3>Recent picks</h3>
        <span>None yet</span>
      </div>
      <p class="empty-state">Drafted players will appear here as picks are made.</p>
    `;
    return;
  }

  const items = recent.map((pick) => {
    const team = teamById(pick.teamId);
    const player = playerById(pick.playerId);
    return `
      <article class="recent-pick">
        <span class="recent-pick-number">Pick ${pick.pick}</span>
        <strong class="recent-pick-player">
          <span class="recent-pick-position">${escapeHTML(player.pos)}</span>
          ${playerNameProfileButton(player)}
        </strong>
        <span>Selected by ${escapeHTML(team.name)}</span>
      </article>
    `;
  }).join("");

  els.recentPicks.innerHTML = `
    <div class="recent-picks-header">
      <h3>Recent picks</h3>
      <span>${recent.length} shown</span>
    </div>
    <div class="recent-picks-list">${items}</div>
  `;
}

function renderFreeAgents() {
  if (!isFreeAgencyOpen()) {
    state.selectedFreeAgentId = null;
    state.pendingAddPlayerId = null;
    els.freeAgentConfirm.hidden = true;
    els.freeAgentConfirm.innerHTML = "";
    els.freeAgentBoard.innerHTML = '<p class="empty-state">Free agency opens after the draft is complete.</p>';
    return;
  }

  const query = els.freeAgentSearch.value.trim().toLowerCase();
  const position = els.freeAgentPosition.value;
  const visiblePlayers = availablePlayers().filter((player) => playerMatchesFilters(player, query, position));
  renderFreeAgentConfirm();
  renderPlayerList(els.freeAgentBoard, visiblePlayers, "Add", "No free agents match those filters.", selectFreeAgentForConfirm, false, true);
}

function renderFreeAgentConfirm() {
  const player = players.find((candidate) => candidate.id === state.selectedFreeAgentId);
  const team = activeTeam();
  if (!player || draftedIds().has(player.id)) {
    state.selectedFreeAgentId = null;
    els.freeAgentConfirm.hidden = true;
    els.freeAgentConfirm.innerHTML = "";
    return;
  }

  const canAddNow = canAddPlayer(team, player);
  const rosterFull = Boolean(team && team.picks.length >= rosterSlots.length);
  els.freeAgentConfirm.hidden = false;
  els.freeAgentConfirm.innerHTML = `
    <div>
      <span>Selected free agent</span>
      <strong>${playerNameProfileButton(player)}</strong>
      <p>${player.pos} - ${player.nfl} - ${playerPointsLabel(player)}</p>
    </div>
    <div class="confirm-actions">
      <button class="secondary-action confirm-add-btn" type="button">Confirm add</button>
      <button class="secondary-action cancel-add-btn" type="button">Cancel</button>
    </div>
  `;
  const confirmButton = els.freeAgentConfirm.querySelector(".confirm-add-btn");
  confirmButton.disabled = !canAddNow && !rosterFull;
  confirmButton.textContent = rosterFull && !canAddNow ? "Confirm add & choose drop" : "Confirm add";
  els.freeAgentConfirm.querySelector(".cancel-add-btn").addEventListener("click", () => {
    state.selectedFreeAgentId = null;
    persistAndRender();
  });
  confirmButton.addEventListener("click", () => confirmFreeAgentAdd());
}

function renderTeamView() {
  const team = activeTeam();
  document.querySelector("#renameTeamForm")?.remove();
  els.teamView.innerHTML = "";
  els.teamViewTitle.textContent = team ? team.name : "Select a team";
  els.renameTeamBtn.disabled = !team;
  els.renameTeamBtn.textContent = isRenamingTeamName ? "Cancel" : "Change team name";
  els.teamRosterCount.textContent = team ? `${team.picks.length}/${rosterSlots.length}` : `0/${rosterSlots.length}`;

  if (!team) {
    isRenamingTeamName = false;
    els.teamView.innerHTML = '<p class="empty-state">Choose a team from the War Room to view that team after the draft.</p>';
    return;
  }

  if (isRenamingTeamName) {
    const renameForm = document.createElement("form");
    renameForm.className = "rename-team-form";
    renameForm.id = "renameTeamForm";
    const renameInput = document.createElement("input");
    renameInput.id = "renameTeamInput";
    renameInput.type = "text";
    renameInput.maxLength = 28;
    renameInput.value = team.name;
    renameInput.setAttribute("aria-label", "New team name");
    renameInput.required = true;
    const saveButton = document.createElement("button");
    saveButton.className = "primary-action";
    saveButton.type = "submit";
    saveButton.textContent = "Save";
    renameForm.append(renameInput, saveButton);
    renameForm.addEventListener("submit", (event) => {
      event.preventDefault();
      renameSignedInTeam(renameInput.value);
    });
    els.teamViewTitle.after(renameForm);
    renameInput.focus();
    renameInput.select();
  }

  const roster = assignedRoster(team);
  const starters = roster.slice(0, 9);
  const bench = roster.slice(9);
  const starterTotal = teamWeeklyProjectedScore(team);
  const rosterTotal = roster.reduce((sum, item) => sum + (item.player ? projectedGameAverage(item.player) : 0), 0);
  const benchTotal = bench.reduce((sum, item) => sum + (item.player ? projectedGameAverage(item.player) : 0), 0);
  if (!isFreeAgencyOpen() && state.pendingAddPlayerId) {
    state.pendingAddPlayerId = null;
  }
  const queuedPlayer = pendingAddPlayer();
  const selectedSwapPlayer = players.find((player) => player.id === state.selectedSwapPlayerId);
  if (selectedSwapPlayer && !team.picks.includes(selectedSwapPlayer.id)) {
    state.selectedSwapPlayerId = null;
  }

  const projectionSummary = document.createElement("section");
  projectionSummary.className = "team-projection-summary";
  projectionSummary.innerHTML = `
    <div>
      <span>Starting lineup</span>
      <strong>${starterTotal.toFixed(1)}</strong>
      <p>weekly projected points</p>
    </div>
    <div>
      <span>Full roster</span>
      <strong>${rosterTotal.toFixed(1)}</strong>
      <p>weekly projected points</p>
    </div>
    <div>
      <span>Bench</span>
      <strong>${benchTotal.toFixed(1)}</strong>
      <p>weekly projected points</p>
    </div>
  `;
  els.teamView.append(projectionSummary);

  const controls = document.createElement("div");
  controls.className = "team-view-controls";
  const bestLineupButton = document.createElement("button");
  bestLineupButton.className = "best-lineup-btn";
  bestLineupButton.type = "button";
  bestLineupButton.textContent = "Best lineup";
  bestLineupButton.disabled = !team.picks.length || Boolean(queuedPlayer);
  bestLineupButton.addEventListener("click", () => applyBestLineup());
  controls.append(bestLineupButton);
  els.teamView.append(controls);

  if (queuedPlayer) {
    const notice = document.createElement("div");
    notice.className = "pending-add-banner";
    notice.innerHTML = `
      <div>
        <span>Adding free agent</span>
        <strong>${playerNameProfileButton(queuedPlayer)}</strong>
      </div>
      <button type="button">Cancel</button>
    `;
    notice.querySelector("button").addEventListener("click", () => {
      state.pendingAddPlayerId = null;
      persistAndRender();
    });
    els.teamView.append(notice);
  }

  if (state.selectedSwapPlayerId && !queuedPlayer) {
    const notice = document.createElement("div");
    notice.className = "pending-add-banner";
    notice.innerHTML = `
      <div>
        <span>Swapping lineup spot</span>
        <strong>${selectedSwapPlayer ? playerNameProfileButton(selectedSwapPlayer) : "Selected player"}</strong>
      </div>
      <button type="button">Cancel</button>
    `;
    notice.querySelector("button").addEventListener("click", () => {
      state.selectedSwapPlayerId = null;
      persistAndRender();
    });
    els.teamView.append(notice);
  }

  const groups = [
    ["Starters", starters],
    ["Bench", bench],
  ];
  const selectedSwapRosterIndex = state.selectedSwapPlayerId
    ? roster.findIndex((item) => item.player?.id === state.selectedSwapPlayerId)
    : -1;
  const selectedSwapGroup = selectedSwapRosterIndex >= 0 && selectedSwapRosterIndex < 9 ? "Starters" : "Bench";
  const visibleGroups = state.selectedSwapPlayerId && !queuedPlayer
    ? groups.filter(([label]) => label !== selectedSwapGroup)
    : groups;

  visibleGroups.forEach(([label, slots]) => {
    const group = document.createElement("section");
    group.className = "team-view-group";
    const filled = slots.filter((item) => item.player).length;
    group.innerHTML = `<h3>${label}<span>${filled}/${slots.length}</span></h3>`;

    const list = document.createElement("div");
    list.className = "team-player-list";
    slots.forEach(({ slot, player }) => {
      const row = document.createElement("div");
      row.className = "team-player-row";
      if (label === "Starters" && player && bestLineupHighlightIds.has(player.id)) {
        row.classList.add("lineup-promoted");
      }
      row.innerHTML = `
        <span class="team-player-slot">${slot}</span>
        <span class="team-player-name">${player ? playerNameProfileButton(player) : "Open slot"}</span>
        <span class="team-player-meta">${player ? `${player.pos} - ${player.nfl} - ${weeklyProjectionLabel(player)}` : "Free agency eligible"}</span>
      `;
      if (player) {
        const actionGroup = document.createElement("div");
        actionGroup.className = "team-row-actions";
        const dropButton = document.createElement("button");
        dropButton.className = "drop-player-btn";
        dropButton.type = "button";
        const canDrop = queuedPlayer ? canReplacePlayer(team, player.id, queuedPlayer) : canDropPlayer(team, player.id);
        dropButton.textContent = !isFreeAgencyOpen() ? "After draft" : queuedPlayer ? (canDrop ? "Drop & add" : "Min pos") : canDrop ? "Drop" : "Min pos";
        dropButton.disabled = !isFreeAgencyOpen() || !canDrop;
        dropButton.addEventListener("click", () => dropPlayerFromTeam(player.id));
        actionGroup.append(dropButton);

        if (!queuedPlayer) {
          const swapButton = document.createElement("button");
          swapButton.className = "swap-player-btn";
          swapButton.type = "button";
          if (!state.selectedSwapPlayerId) {
            swapButton.textContent = "Swap";
            swapButton.addEventListener("click", () => selectLineupSwapPlayer(player.id));
          } else if (state.selectedSwapPlayerId === player.id) {
            swapButton.textContent = "Selected";
            swapButton.disabled = true;
          } else {
            const canSwap = canSwapLineupPlayers(team, state.selectedSwapPlayerId, player.id);
            swapButton.textContent = canSwap ? "Swap here" : "No swap";
            swapButton.disabled = !canSwap;
            swapButton.addEventListener("click", () => swapLineupPlayers(state.selectedSwapPlayerId, player.id));
          }
          actionGroup.append(swapButton);
        }

        row.append(actionGroup);
      }
      list.append(row);
    });
    group.append(list);
    els.teamView.append(group);
  });
}

function renderTradeInbox() {
  const messages = mailboxTradeMessages();
  els.tradeInbox.hidden = !state.showTradeInbox;
  els.tradeInbox.innerHTML = "";

  if (!state.showTradeInbox) return;

  if (!messages.length) {
    els.tradeInbox.innerHTML = '<p class="empty-state">No mailbox messages.</p>';
    return;
  }

  messages.forEach((offer) => {
    const fromTeam = teamById(offer.fromTeamId);
    const offeredPlayer = playerById(offer.offeredPlayerId);
    const requestedPlayer = playerById(offer.requestedPlayerId);
    const item = document.createElement("article");
    item.className = "trade-offer-card";

    if (offer.status === "accepted") {
      const isSender = offer.fromTeamId === state.signedInTeamId;
      const receivedPlayer = isSender ? requestedPlayer : offeredPlayer;
      const sentPlayer = isSender ? offeredPlayer : requestedPlayer;
      const otherTeam = isSender ? teamById(offer.toTeamId) : fromTeam;
      item.classList.add("completed");
      item.innerHTML = `
        <div>
          <span>Trade completed</span>
          <strong>${receivedPlayer ? playerNameProfileButton(receivedPlayer) : "Player received"}</strong>
          <p>Sent ${sentPlayer ? playerNameProfileButton(sentPlayer) : "your player"} to ${otherTeam?.name ?? "the other team"}</p>
        </div>
      `;
      els.tradeInbox.append(item);
      return;
    }

    const canAccept = canCompleteTrade(offer);
    item.innerHTML = `
      <div>
        <span>${fromTeam?.name ?? "Unknown team"} offered</span>
        <strong>${offeredPlayer ? playerNameProfileButton(offeredPlayer) : "Unknown player"}</strong>
        <p>For ${requestedPlayer ? playerNameProfileButton(requestedPlayer) : "your player"}</p>
      </div>
      <div class="trade-offer-actions">
        <button class="secondary-action accept-trade-btn" type="button">Accept</button>
        <button class="secondary-action decline-trade-btn" type="button">Decline</button>
      </div>
    `;
    const acceptButton = item.querySelector(".accept-trade-btn");
    acceptButton.disabled = !canAccept;
    acceptButton.textContent = canAccept ? "Accept" : "Unavailable";
    acceptButton.addEventListener("click", () => acceptTradeOffer(offer.id));
    item.querySelector(".decline-trade-btn").addEventListener("click", () => declineTradeOffer(offer.id));
    els.tradeInbox.append(item);
  });
}

function renderTradeComposer(targetTeam, targetPlayer) {
  const team = activeTeam();
  if (!team || !targetTeam || !targetPlayer) return;

  const panel = document.createElement("section");
  panel.className = "trade-composer";
  panel.innerHTML = `
    <div class="trade-composer-header">
      <div>
        <span>Propose trade</span>
        <strong>${playerNameProfileButton(targetPlayer)}</strong>
        <p>${targetTeam.name} - ${targetPlayer.pos} - ${playerPointsLabel(targetPlayer)}</p>
      </div>
      <button type="button">Cancel</button>
    </div>
  `;
  panel.querySelector("button").addEventListener("click", () => {
    state.selectedTradeTarget = null;
    persistAndRender();
  });

  const list = document.createElement("div");
  list.className = "trade-player-list";
  picksForTeam(team)
    .sort((a, b) => b.points - a.points)
    .forEach((player) => {
      const row = document.createElement("div");
      row.className = "league-player-row";
      row.innerHTML = `
        <span class="team-player-slot">${player.pos}</span>
        <span class="team-player-name">${playerNameProfileButton(player)}</span>
        <span class="team-player-meta">${player.nfl} - ${playerPointsLabel(player)}</span>
        <button class="trade-btn" type="button">Offer</button>
      `;
      row.querySelector("button").addEventListener("click", () => proposeTrade(targetTeam.id, targetPlayer.id, player.id));
      list.append(row);
    });
  panel.append(list);
  els.leagueView.append(panel);
}

function teamWeeklyProjectedScore(team) {
  return assignedRoster(team)
    .slice(0, 9)
    .reduce((sum, item) => sum + (item.player ? projectedGameAverage(item.player) : 0), 0);
}

function renderLeagueView() {
  const team = activeTeam();
  els.leagueView.innerHTML = "";
  renderTradeInbox();

  if (!team) {
    els.leagueView.innerHTML = '<p class="empty-state">Sign in as a team to view the league.</p>';
    return;
  }

  const selectedTarget = state.selectedTradeTarget;
  const selectedTargetTeam = selectedTarget ? teamById(selectedTarget.teamId) : null;
  const selectedTargetPlayer = selectedTargetTeam?.picks.includes(selectedTarget?.playerId)
    ? playerById(selectedTarget.playerId)
    : null;

  if (selectedTarget && (!selectedTargetTeam || !selectedTargetPlayer)) {
    state.selectedTradeTarget = null;
  } else if (selectedTargetTeam && selectedTargetPlayer) {
    renderTradeComposer(selectedTargetTeam, selectedTargetPlayer);
  }

  if (state.teams.length < 2) {
    els.leagueView.innerHTML += '<p class="empty-state">Add more teams to see league rosters.</p>';
    return;
  }

  const grid = document.createElement("div");
  grid.className = "league-team-grid";
  draftOrderTeams().forEach((opponent) => {
    const isActiveTeam = opponent.id === team.id;
    const card = document.createElement("section");
    card.className = "league-team-card";
    const projected = teamWeeklyProjectedScore(opponent);
    card.innerHTML = `
      <div class="league-team-heading">
        <div>
          <span>${isActiveTeam ? "Your roster" : "Opponent roster"}</span>
          <h3>${opponent.name}</h3>
        </div>
        <div class="league-weekly-score">
          <strong>${projected.toFixed(1)}</strong>
          <span>weekly projected points</span>
        </div>
      </div>
    `;
    const list = document.createElement("div");
    list.className = "team-player-list";
    assignedRoster(opponent).forEach(({ slot, player }) => {
      if (!player) return;
      const row = document.createElement("div");
      row.className = "league-player-row";
      row.innerHTML = `
        <span class="team-player-slot">${slot}</span>
        <span class="team-player-name">${playerNameProfileButton(player)}</span>
        <span class="team-player-meta">${player.pos} - ${player.nfl} - ${playerPointsLabel(player)}</span>
        ${isActiveTeam ? "" : '<button class="trade-btn" type="button">Trade</button>'}
      `;
      row.querySelector("button")?.addEventListener("click", () => {
        state.selectedTradeTarget = { teamId: opponent.id, playerId: player.id };
        state.showTradeInbox = false;
        persistAndRender();
      });
      list.append(row);
    });
    card.append(list);
    grid.append(card);
  });
  els.leagueView.append(grid);
}

function renderMatchupTeam(team, total, chance) {
  const column = document.createElement("section");
  column.className = "matchup-team-card";
  column.innerHTML = `
    <div class="matchup-team-header">
      <div>
        <span>Projected lineup</span>
        <h3>${team.name}</h3>
      </div>
      <div class="matchup-total">
        <span>${chance}% win</span>
        <strong>${total.toFixed(1)}</strong>
      </div>
    </div>
  `;

  const list = document.createElement("div");
  list.className = "team-player-list";
  assignedRoster(team).forEach(({ slot, player }) => {
    const row = document.createElement("div");
    row.className = "matchup-player-row";
    row.innerHTML = `
      <span class="team-player-slot">${slot}</span>
      <span class="team-player-name">${player ? playerNameProfileButton(player) : "Open slot"}</span>
      <span class="team-player-meta">${player ? `${player.pos} - ${player.nfl}` : "No player assigned"}</span>
      <span class="matchup-player-score">${player ? `${projectedGameAverage(player).toFixed(1)}<small>projected points</small>` : ""}</span>
      <span class="matchup-player-opponent">${player ? playerWeeklyMatchupLabel(player, state.matchupWeek) : ""}</span>
    `;
    list.append(row);
  });
  column.append(list);
  return column;
}

function renderByeMatchup(team) {
  const bye = document.createElement("section");
  bye.className = "matchup-bye";
  bye.innerHTML = `
    <div>
      <span>Bye week</span>
      <strong>${team.name}</strong>
      <p>No opponent this week.</p>
    </div>
  `;
  return bye;
}

function renderMatchupCard(firstTeam, secondTeam) {
  const firstTotal = assignedRoster(firstTeam).slice(0, 9).reduce((sum, item) => sum + (item.player ? projectedGameAverage(item.player) : 0), 0);
  const secondTotal = assignedRoster(secondTeam).slice(0, 9).reduce((sum, item) => sum + (item.player ? projectedGameAverage(item.player) : 0), 0);
  const firstChance = matchupWinChance(firstTotal, secondTotal);
  const secondChance = 100 - firstChance;

  const matchup = document.createElement("section");
  matchup.className = "matchup-card";

  const summary = document.createElement("section");
  summary.className = "matchup-summary";
  summary.innerHTML = `
    <div>
      <span>${firstTeam.name}</span>
      <strong>${firstChance}%</strong>
      <p>${firstTotal.toFixed(1)} weekly projected points</p>
    </div>
    <div class="matchup-versus">VS</div>
    <div>
      <span>${secondTeam.name}</span>
      <strong>${secondChance}%</strong>
      <p>${secondTotal.toFixed(1)} weekly projected points</p>
    </div>
  `;

  const grid = document.createElement("div");
  grid.className = "matchup-grid";
  grid.append(
    renderMatchupTeam(firstTeam, firstTotal, firstChance),
    renderMatchupTeam(secondTeam, secondTotal, secondChance),
  );

  matchup.append(summary, grid);
  return matchup;
}

function weeklyFantasyMatchups(teams, week) {
  const scheduleTeams = teams.length % 2 === 0 ? [...teams] : [...teams, null];
  const roundCount = scheduleTeams.length - 1;
  const round = (week - 1) % roundCount;
  const rotatingTeams = scheduleTeams.slice(1);

  for (let turn = 0; turn < round; turn += 1) {
    rotatingTeams.unshift(rotatingTeams.pop());
  }

  const weeklyTeams = [scheduleTeams[0], ...rotatingTeams];
  const matchups = [];
  let byeTeam = null;

  for (let index = 0; index < weeklyTeams.length / 2; index += 1) {
    const firstTeam = weeklyTeams[index];
    const secondTeam = weeklyTeams[weeklyTeams.length - 1 - index];

    if (!firstTeam || !secondTeam) {
      byeTeam = firstTeam ?? secondTeam;
      continue;
    }

    matchups.push(round % 2 === 0 ? [firstTeam, secondTeam] : [secondTeam, firstTeam]);
  }

  return { matchups, byeTeam };
}

function renderMatchupView() {
  const team = activeTeam();
  els.matchupView.innerHTML = "";

  if (!team) {
    els.matchupView.innerHTML = '<p class="empty-state">Sign in as a team to view matchups.</p>';
    return;
  }

  const teams = draftOrderTeams();
  if (teams.length < 2) {
    els.matchupView.innerHTML = '<p class="empty-state">Add another team to create league matchups.</p>';
    return;
  }

  const weekControl = document.createElement("section");
  weekControl.className = "matchup-week-control";
  weekControl.innerHTML = `
    <label for="matchupWeekSelect">NFL week</label>
    <select id="matchupWeekSelect">
      ${Array.from({ length: 18 }, (_, index) => {
        const week = index + 1;
        return `<option value="${week}" ${week === state.matchupWeek ? "selected" : ""}>Week ${week}</option>`;
      }).join("")}
    </select>
  `;
  weekControl.querySelector("#matchupWeekSelect").addEventListener("change", (event) => {
    state.matchupWeek = Number(event.target.value);
    persistAndRender();
  });
  els.matchupView.append(weekControl);

  const { matchups, byeTeam } = weeklyFantasyMatchups(teams, state.matchupWeek);

  const ownerMatchup = matchups.find(([firstTeam, secondTeam]) => [firstTeam.id, secondTeam.id].includes(team.id));
  const otherMatchups = matchups.filter(([firstTeam, secondTeam]) => ![firstTeam.id, secondTeam.id].includes(team.id));

  const otherGames = document.createElement("details");
  otherGames.className = "other-matchups";
  otherGames.innerHTML = "<summary>View other matchups</summary>";
  const otherGamesList = document.createElement("div");
  otherGamesList.className = "other-matchups-list";

  otherMatchups.forEach(([firstTeam, secondTeam]) => {
    otherGamesList.append(renderMatchupCard(firstTeam, secondTeam));
  });

  if (byeTeam && byeTeam.id !== team.id) {
    otherGamesList.append(renderByeMatchup(byeTeam));
  }

  if (!otherGamesList.children.length) {
    otherGamesList.innerHTML = '<p class="empty-state">No other matchups this week.</p>';
  }

  if (ownerMatchup) {
    els.matchupView.append(renderMatchupCard(ownerMatchup[0], ownerMatchup[1]));
  } else if (byeTeam?.id === team.id) {
    els.matchupView.append(renderByeMatchup(byeTeam));
  }

  otherGames.append(otherGamesList);
  els.matchupView.append(otherGames);
}

function renderClock() {
  const teamCount = Math.max(state.teams.length, 1);
  els.pickNumber.textContent = state.pick;
  els.roundNumber.textContent = Math.ceil(state.pick / teamCount);
  els.onClockTeam.textContent = state.draftStarted ? currentDraftTeam()?.name ?? "No teams" : "Waiting for admin";
  updateDraftTimerDisplay();
}

function render() {
  renderSignIn();
  renderClock();
  renderTeams();
  renderRoster();
  renderBoard();
  renderFreeAgents();
  renderTeamView();
  renderMatchupView();
  renderLeagueView();
}

function persistAndRender() {
  saveState();
  render();
}

function addPlayerToTeam(playerId, shouldAdvancePick = false) {
  const team = activeTeam();
  const player = players.find((candidate) => candidate.id === playerId);
  if (!isSignedIn() || !player || !canAddPlayer(team, player)) {
    return;
  }
  if (shouldAdvancePick && !isSignedInTeamOnClock()) {
    return;
  }
  team.picks.push(playerId);
  state.pendingAddPlayerId = null;
  state.selectedSwapPlayerId = null;
  syncLineupFromRoster(team);
  if (shouldAdvancePick) {
    recordDraftPick(team, playerId, state.pick);
    state.pick += 1;
    resetDraftTimer();
  }
  persistAndRender();
}

function draftPlayer(playerId) {
  addPlayerToTeam(playerId, true);
}

function selectLineupSwapPlayer(playerId) {
  const team = activeTeam();
  if (!isSignedIn() || !team || !team.picks.includes(playerId)) return;
  syncLineupFromRoster(team);
  state.selectedSwapPlayerId = playerId;
  persistAndRender();
}

function applyBestLineup() {
  const team = activeTeam();
  if (!isSignedIn() || !team || !team.picks.length) return;

  const currentStarterIds = new Set(
    assignedRoster(team)
      .slice(0, 9)
      .map((item) => item.player?.id)
      .filter(Boolean),
  );

  setBestLineup(team);
  bestLineupHighlightIds = new Set(
    assignedRoster(team)
      .slice(0, 9)
      .map((item) => item.player?.id)
      .filter((playerId) => playerId && !currentStarterIds.has(playerId)),
  );
  clearTimeout(bestLineupHighlightTimer);
  bestLineupHighlightTimer = setTimeout(() => {
    bestLineupHighlightIds = new Set();
    render();
  }, 2000);
  state.selectedSwapPlayerId = null;
  persistAndRender();
}

function proposeTrade(toTeamId, requestedPlayerId, offeredPlayerId) {
  const team = activeTeam();
  const toTeam = teamById(toTeamId);
  if (!isSignedIn() || !team || !toTeam || team.id === toTeam.id) return;
  if (!team.picks.includes(offeredPlayerId) || !toTeam.picks.includes(requestedPlayerId)) return;

  const duplicateOffer = state.tradeOffers.some((offer) => (
    offer.status === "pending" &&
    offer.fromTeamId === team.id &&
    offer.toTeamId === toTeam.id &&
    offer.offeredPlayerId === offeredPlayerId &&
    offer.requestedPlayerId === requestedPlayerId
  ));
  if (duplicateOffer) {
    state.selectedTradeTarget = null;
    persistAndRender();
    return;
  }

  state.tradeOffers.push({
    id: crypto.randomUUID(),
    fromTeamId: team.id,
    toTeamId,
    offeredPlayerId,
    requestedPlayerId,
    status: "pending",
    createdAt: Date.now(),
  });
  state.selectedTradeTarget = null;
  persistAndRender();
}

function acceptTradeOffer(offerId) {
  const offer = state.tradeOffers.find((candidate) => candidate.id === offerId);
  if (!offer || offer.toTeamId !== state.signedInTeamId || !canCompleteTrade(offer)) return;

  const fromTeam = teamById(offer.fromTeamId);
  const toTeam = teamById(offer.toTeamId);
  fromTeam.picks = fromTeam.picks.map((id) => id === offer.offeredPlayerId ? offer.requestedPlayerId : id);
  toTeam.picks = toTeam.picks.map((id) => id === offer.requestedPlayerId ? offer.offeredPlayerId : id);
  syncLineupFromRoster(fromTeam);
  syncLineupFromRoster(toTeam);
  offer.status = "accepted";
  state.selectedTradeTarget = null;
  persistAndRender();
}

function declineTradeOffer(offerId) {
  const offer = state.tradeOffers.find((candidate) => candidate.id === offerId);
  if (!offer || offer.toTeamId !== state.signedInTeamId) return;

  offer.status = "declined";
  persistAndRender();
}

function selectFreeAgentForConfirm(playerId) {
  const player = players.find((candidate) => candidate.id === playerId);
  if (!isFreeAgencyOpen() || !isSignedIn() || !player || draftedIds().has(player.id)) return;
  state.selectedFreeAgentId = playerId;
  persistAndRender();
}

function confirmFreeAgentAdd() {
  const playerId = state.selectedFreeAgentId;
  if (!playerId) return;
  requestFreeAgentAdd(playerId);
}

function requestFreeAgentAdd(playerId) {
  const team = activeTeam();
  const player = players.find((candidate) => candidate.id === playerId);
  if (!isFreeAgencyOpen() || !isSignedIn() || !team || !player || draftedIds().has(player.id)) return;

  if (canAddPlayer(team, player)) {
    state.selectedFreeAgentId = null;
    addPlayerToTeam(playerId);
    return;
  }

  if (team.picks.length >= rosterSlots.length) {
    state.selectedFreeAgentId = null;
    state.pendingAddPlayerId = playerId;
    state.currentView = "team";
    persistAndRender();
  }
}

function dropPlayerFromTeam(playerId) {
  const team = activeTeam();
  if (!isFreeAgencyOpen() || !isSignedIn() || !team) return;
  const queuedPlayer = pendingAddPlayer();
  if (queuedPlayer && !canReplacePlayer(team, playerId, queuedPlayer)) {
    return;
  }
  if (!queuedPlayer && !canDropPlayer(team, playerId)) {
    return;
  }

  team.picks = team.picks.filter((id) => id !== playerId);
  if (queuedPlayer && canAddPlayer(team, queuedPlayer)) {
    team.picks.push(queuedPlayer.id);
    state.pendingAddPlayerId = null;
  }
  state.selectedSwapPlayerId = null;
  syncLineupFromRoster(team);
  persistAndRender();
}

function selectNextTeam() {
  if (state.signedInTeamId) {
    state.activeTeamId = state.signedInTeamId;
  }
}

function returnToTeamSignIn() {
  state.signedInTeamId = null;
  state.activeTeamId = null;
  state.currentView = "draft";
  state.selectedTradeTarget = null;
  state.showTradeInbox = false;
  setSignInMessage("");
  persistAndRender();
  els.signinPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function createFantasyTeam(name, username = "", password = "") {
  const trimmedName = name.trim().slice(0, 28);
  const trimmedUsername = normalizeUsername(username);
  const trimmedPassword = normalizePassword(password);
  if (!trimmedName || !trimmedUsername || !trimmedPassword) return null;
  const team = {
    id: crypto.randomUUID(),
    name: trimmedName,
    username: trimmedUsername,
    password: trimmedPassword,
    picks: [],
  };
  state.teams.push(team);
  state.draftOrder = Array.isArray(state.draftOrder) ? state.draftOrder : [];
  if (!state.draftOrder.includes(team.id)) {
    state.draftOrder.push(team.id);
  }
  state.signedInTeamId = team.id;
  state.activeTeamId = team.id;
  state.currentView = "draft";
  return team;
}

function signInToTeam(teamId, username, password) {
  const team = teamById(teamId);
  const trimmedUsername = normalizeUsername(username);
  const trimmedPassword = normalizePassword(password);
  if (!team || !trimmedUsername || !trimmedPassword) {
    setSignInMessage("Enter a username and password for that team.", "error");
    return false;
  }

  if (!teamHasCredentials(team)) {
    team.username = trimmedUsername;
    team.password = trimmedPassword;
    setSignInMessage("Team login created.", "success");
  } else if (team.username !== trimmedUsername || team.password !== trimmedPassword) {
    setSignInMessage("Username or password does not match that team.", "error");
    return false;
  }

  state.signedInTeamId = team.id;
  state.activeTeamId = team.id;
  state.currentView = "draft";
  state.selectedTradeTarget = null;
  state.showTradeInbox = false;
  els.signinUsername.value = "";
  els.signinPassword.value = "";
  persistAndRender();
  return true;
}

function bestNeedFit(team) {
  const picks = picksForTeam(team);
  const counts = picks.reduce((totals, player) => {
    totals[player.pos] = (totals[player.pos] ?? 0) + 1;
    return totals;
  }, {});
  const remainingSlots = rosterSlots.length - picks.length;
  const neededPositions = Object.entries(balancedAutoDraftTargets)
    .filter(([position, target]) => (counts[position] ?? 0) < target)
    .map(([position]) => position);

  const balancedPlayers = availablePlayers()
    .filter((player) => neededPositions.includes(player.pos) && canAddPlayer(team, player))
    .filter((player) => {
      const nextCounts = { ...counts, [player.pos]: (counts[player.pos] ?? 0) + 1 };
      const neededAfterPick = Object.entries(balancedAutoDraftTargets).reduce(
        (total, [position, target]) => total + Math.max(target - (nextCounts[position] ?? 0), 0),
        0,
      );
      return neededAfterPick <= remainingSlots - 1;
    })
    .sort((a, b) => b.points - a.points || a.rank - b.rank);

  if (balancedPlayers.length) {
    return balancedPlayers[0];
  }

  const roster = assignedRoster(team);
  const openSlots = roster.filter((item) => !item.player).map((item) => item.slot);
  return availablePlayers().find((player) => openSlots.some((slot) => canFillSlot(slot, player)) && canAddPlayer(team, player));
}

function bestPlayerForSlot(team, slot) {
  return availablePlayers().find((player) => canFillSlot(slot, player) && canAddPlayer(team, player));
}

function autoDraftPick() {
  const team = activeTeam();
  if (!isSignedIn() || !team || !isSignedInTeamOnClock()) return;

  const player = bestNeedFit(team);
  if (player) draftPlayer(player.id);
}

function autoDraftExpiredPick() {
  const expiredPick = state.pick;
  if (!state.draftStarted || autoPickInProgressForPick === expiredPick || isDraftComplete()) return;
  autoPickInProgressForPick = expiredPick;

  const team = currentDraftTeam();
  if (!team) {
    state.pick += 1;
    resetDraftTimer();
    persistAndRender();
    autoPickInProgressForPick = null;
    return;
  }

  if (team.picks.length >= rosterSlots.length) {
    state.pick += 1;
    resetDraftTimer();
    persistAndRender();
    autoPickInProgressForPick = null;
    return;
  }

  const player = bestNeedFit(team);
  if (!player) {
    autoPickInProgressForPick = null;
    return;
  }

  recordDraftPick(team, player.id, state.pick);
  team.picks.push(player.id);
  syncLineupFromRoster(team);
  state.pick += 1;
  resetDraftTimer();
  persistAndRender();
  autoPickInProgressForPick = null;
}

function autoCompleteDraft() {
  if (!state.teams.length || isDraftComplete()) return;
  state.draftStarted = true;
  resetDraftTimer();

  let guard = players.length * Math.max(state.teams.length, 1);
  while (!isDraftComplete() && availablePlayers().length && guard > 0) {
    const team = currentDraftTeam();
    if (!team || team.picks.length >= rosterSlots.length) {
      state.pick += 1;
      resetDraftTimer();
      guard -= 1;
      continue;
    }

    const player = bestNeedFit(team);
    if (!player) break;

    recordDraftPick(team, player.id, state.pick);
    team.picks.push(player.id);
    state.pick += 1;
    resetDraftTimer();
    guard -= 1;
  }

  persistAndRender();
}

function shuffleTeamIds(teamIds) {
  const shuffled = [...teamIds];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function randomizeDraftOrder() {
  if (!isAdminSite()) return;
  if (state.teams.length < 2 || isDraftComplete()) return;

  const draftStarted = state.pick > 1 || state.teams.some((team) => team.picks.length > 0);
  if (draftStarted && !confirm("Randomizing the draft order will reset every roster and restart the draft at pick 1. Continue?")) {
    return;
  }

  state.draftOrder = shuffleTeamIds(state.teams.map((team) => team.id));
  if (draftStarted) {
    state.teams.forEach((team) => {
      team.picks = [];
      team.lineup = [];
    });
    state.tradeOffers = [];
    state.draftHistory = [];
    state.selectedTradeTarget = null;
    state.draftStarted = false;
    state.pick = 1;
    resetDraftTimer();
  }
  resetDraftTimer();
  persistAndRender();
}

function startDraft() {
  if (!isAdminSite() || state.teams.length < 1 || state.draftStarted || isDraftComplete()) return;
  state.draftStarted = true;
  if (!Number.isInteger(Number(state.pick)) || state.pick < 1) {
    state.pick = 1;
  }
  resetDraftTimer();
  persistAndRender();
}

function renameSignedInTeam(name) {
  const team = signedInTeam();
  if (!team) return;

  const nextName = name.trim();
  if (!nextName) return;

  team.name = nextName.slice(0, 28);
  isRenamingTeamName = false;
  persistAndRender();
}

if (els.teamForm) {
  els.teamForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const team = createFantasyTeam(els.teamName.value);
    if (!team) return;
    els.teamName.value = "";
    persistAndRender();
  });
}

els.renameTeamBtn.addEventListener("click", () => {
  if (!signedInTeam()) return;
  isRenamingTeamName = !isRenamingTeamName;
  renderTeamView();
});

if (els.signinCreateTeamForm) {
  els.signinCreateTeamForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const team = createFantasyTeam(
      els.signinNewTeamName.value,
      els.signinNewUsername.value,
      els.signinNewPassword.value,
    );
    if (!team) {
      setSignInMessage("Create a team name, username, and password.", "error");
      return;
    }
    els.signinCreateTeamForm.reset();
    setSignInMessage("");
    persistAndRender();
  });
}

els.signinForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const teamId = els.signinTeamSelect.value;
  if (!teamId) {
    setSignInMessage("Select a team first.", "error");
    return;
  }
  signInToTeam(teamId, els.signinUsername.value, els.signinPassword.value);
});

els.signinTeamSelect.addEventListener("change", () => {
  setSignInMessage("");
});

els.draftRoomBtn.addEventListener("click", () => {
  state.currentView = "draft";
  persistAndRender();
});

els.myTeamBtn.addEventListener("click", () => {
  state.currentView = "team";
  persistAndRender();
});

els.matchupBtn.addEventListener("click", () => {
  state.currentView = "matchup";
  persistAndRender();
});

els.leagueBtn.addEventListener("click", () => {
  state.currentView = "league";
  state.selectedTradeTarget = null;
  persistAndRender();
});

els.freeAgencyBtn.addEventListener("click", () => {
  state.currentView = "freeAgency";
  persistAndRender();
});

if (els.signOutBtn) {
  els.signOutBtn.addEventListener("click", () => {
    returnToTeamSignIn();
  });
}

if (els.adminTeamSigninBtn) {
  els.adminTeamSigninBtn.addEventListener("click", () => {
    returnToTeamSignIn();
  });
}

els.playerSearch.addEventListener("input", renderBoard);
els.positionFilter.addEventListener("change", renderBoard);
els.freeAgentSearch.addEventListener("input", renderFreeAgents);
els.freeAgentPosition.addEventListener("change", renderFreeAgents);

els.tradeInboxBtn.addEventListener("click", () => {
  state.showTradeInbox = !state.showTradeInbox;
  state.currentView = "league";
  state.selectedTradeTarget = null;
  persistAndRender();
});

els.quickDraftBtn.addEventListener("click", () => {
  autoDraftPick();
});

if (els.startDraftBtn) {
  els.startDraftBtn.addEventListener("click", () => {
    startDraft();
  });
}

if (els.autoCompleteDraftBtn) {
  els.autoCompleteDraftBtn.addEventListener("click", () => {
    autoCompleteDraft();
  });
}

if (els.randomizeOrderBtn) {
  els.randomizeOrderBtn.addEventListener("click", () => {
    randomizeDraftOrder();
  });
}

if (els.autoFillBtn) {
  els.autoFillBtn.addEventListener("click", () => {
    autoDraftPick();
  });
}

if (els.resetDraftBtn) {
  els.resetDraftBtn.addEventListener("click", () => {
    if (!confirm("Reset the entire draft and clear every roster?")) return;
    state.teams.forEach((team) => {
      team.picks = [];
      team.lineup = [];
    });
    state.tradeOffers = [];
    state.draftHistory = [];
    state.selectedTradeTarget = null;
    state.draftStarted = false;
    state.pick = 1;
    resetDraftTimer();
    persistAndRender();
  });
}

if (els.adminSigninBtn) {
  els.adminSigninBtn.addEventListener("click", openAdminSignIn);
  els.adminSigninCloseBtn.addEventListener("click", closeAdminSignIn);
  els.adminSigninForm.addEventListener("submit", (event) => {
    event.preventDefault();
    signInAdmin();
  });
  renderAdminSignIn();
}

document.addEventListener("click", (event) => {
  const profileLink = event.target.closest("[data-player-profile-id]");
  if (!profileLink) return;
  event.preventDefault();
  openPlayerProfile(profileLink.dataset.playerProfileId);
});

if (els.playerProfileCloseBtn) {
  els.playerProfileCloseBtn.addEventListener("click", closePlayerProfile);
}

if (els.playerProfileModal) {
  els.playerProfileModal.addEventListener("click", (event) => {
    if (event.target === els.playerProfileModal) {
      closePlayerProfile();
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closePlayerProfile();
    closeAdminSignIn();
  }
});

render();
setInterval(updateDraftTimerDisplay, 1000);
connectLiveDraft();
