const winningMeta = document.getElementById("winningMeta");
const winningSearch = document.getElementById("winningSearch");
const pageSizeSelect = document.getElementById("pageSize");
const winningTableBody = document.getElementById("winningTableBody");
const paginationEl = document.getElementById("pagination");

const allDraws = [...LOTTO_WINNING_DATA].sort((a, b) => b.d - a.d);
let filteredDraws = allDraws;
let currentPage = 1;

function getBallColorClass(num) {
  if (num <= 10) return "yellow";
  if (num <= 20) return "blue";
  if (num <= 30) return "red";
  if (num <= 40) return "gray";
  return "green";
}

function createMiniBall(num, isBonus = false) {
  const ball = document.createElement("span");
  ball.className = `mini-ball ${getBallColorClass(num)}${isBonus ? " bonus-mini" : ""}`;
  ball.textContent = num;
  return ball;
}

function formatDate(dateStr) {
  const [year, month, day] = dateStr.split("-");
  return `${year}.${month}.${day}`;
}

function updateMeta() {
  const latest = allDraws[0];
  const oldest = allDraws[allDraws.length - 1];
  winningMeta.textContent = `${oldest.d}회(${formatDate(oldest.dt)}) ~ ${latest.d}회(${formatDate(latest.dt)}) · 총 ${allDraws.length}회`;
}

function getPageSize() {
  return Number(pageSizeSelect.value);
}

function getTotalPages() {
  return Math.max(1, Math.ceil(filteredDraws.length / getPageSize()));
}

function renderTable() {
  const pageSize = getPageSize();
  const totalPages = getTotalPages();
  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * pageSize;
  const pageDraws = filteredDraws.slice(start, start + pageSize);

  winningTableBody.innerHTML = "";

  if (pageDraws.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 4;
    cell.className = "empty-row";
    cell.textContent = "검색 결과가 없습니다.";
    row.appendChild(cell);
    winningTableBody.appendChild(row);
    return;
  }

  pageDraws.forEach((draw) => {
    const row = document.createElement("tr");

    const roundCell = document.createElement("td");
    roundCell.className = "col-round";
    roundCell.textContent = `${draw.d}회`;
    row.appendChild(roundCell);

    const dateCell = document.createElement("td");
    dateCell.className = "col-date";
    dateCell.textContent = formatDate(draw.dt);
    row.appendChild(dateCell);

    const numbersCell = document.createElement("td");
    numbersCell.className = "col-numbers";
    const numbersWrap = document.createElement("div");
    numbersWrap.className = "table-balls";
    draw.n.forEach((num) => numbersWrap.appendChild(createMiniBall(num)));
    numbersCell.appendChild(numbersWrap);
    row.appendChild(numbersCell);

    const bonusCell = document.createElement("td");
    bonusCell.className = "col-bonus";
    bonusCell.appendChild(createMiniBall(draw.b, true));
    row.appendChild(bonusCell);

    winningTableBody.appendChild(row);
  });
}

function renderPagination() {
  const totalPages = getTotalPages();
  paginationEl.innerHTML = "";

  const prevBtn = document.createElement("button");
  prevBtn.type = "button";
  prevBtn.className = "page-btn";
  prevBtn.textContent = "이전";
  prevBtn.disabled = currentPage <= 1;
  prevBtn.addEventListener("click", () => {
    currentPage -= 1;
    render();
  });
  paginationEl.appendChild(prevBtn);

  const info = document.createElement("span");
  info.className = "page-info";
  info.textContent = `${currentPage} / ${totalPages} 페이지 (총 ${filteredDraws.length}건)`;
  paginationEl.appendChild(info);

  const nextBtn = document.createElement("button");
  nextBtn.type = "button";
  nextBtn.className = "page-btn";
  nextBtn.textContent = "다음";
  nextBtn.disabled = currentPage >= totalPages;
  nextBtn.addEventListener("click", () => {
    currentPage += 1;
    render();
  });
  paginationEl.appendChild(nextBtn);
}

function render() {
  renderTable();
  renderPagination();
}

function applySearch() {
  const query = winningSearch.value.trim();
  if (!query) {
    filteredDraws = allDraws;
  } else {
    filteredDraws = allDraws.filter((draw) => String(draw.d).includes(query));
  }
  currentPage = 1;
  render();
}

winningSearch.addEventListener("input", applySearch);
pageSizeSelect.addEventListener("change", () => {
  currentPage = 1;
  render();
});

updateMeta();
render();
