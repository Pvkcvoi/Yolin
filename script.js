let zoom = 1, panX = 0, panY = 0;
let svg, isPanning = false, startX, startY;
let data = [];

document.addEventListener("DOMContentLoaded", async () => {
  svg = document.getElementById("mapSvg");
  data = await fetch("data.json").then(r => r.json());

  renderPolygons(data);

  // Filtro dinámico
  document.getElementById("filtro").addEventListener("change", e => {
    const filtro = e.target.value;
    if (filtro === "todas") renderPolygons(data);
    else renderPolygons(data.filter(d => d.categoria === filtro));
  });

  // Eventos de zoom y pan
  svg.addEventListener("wheel", zoomMap);
  svg.addEventListener("mousedown", startPan);
  svg.addEventListener("mousemove", movePan);
  svg.addEventListener("mouseup", endPan);
});

function renderPolygons(dataset) {
  svg.innerHTML = "";

  dataset.forEach(item => {
    const points = item.coordenadas.map(c => c.join(",")).join(" ");
    const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polygon.setAttribute("points", points);
    polygon.setAttribute("id", item.id);
    polygon.style.fill = item.categoria === "industrial" ? "#a3c4f3" : "#a8e6a1";

    polygon.addEventListener("click", () => showInfo(item));
    svg.appendChild(polygon);
  });

  updateTransform();
}

function showInfo(item) {
  const panel = document.getElementById("infoPanel");
  document.getElementById("nombre").textContent = item.nombre;
  document.getElementById("detalle").textContent = 
    `Categoría: ${item.categoria}\nPoblación: ${item.poblacion}`;
  panel.classList.remove("hidden");

  document.getElementById("cerrar").onclick = () => panel.classList.add("hidden");
}

// Zoom
function zoomMap(e) {
  e.preventDefault();
  const delta = e.deltaY < 0 ? 1.1 : 0.9;
  zoom *= delta;
  updateTransform();
}

// Pan
function startPan(e) {
  isPanning = true;
  startX = e.clientX - panX;
  startY = e.clientY - panY;
}

function movePan(e) {
  if (!isPanning) return;
  panX = e.clientX - startX;
  panY = e.clientY - startY;
  updateTransform();
}

function endPan() {
  isPanning = false;
}

function updateTransform() {
  svg.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
}
