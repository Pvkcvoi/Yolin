let svgElement, zoomLevel = 1, panX = 0, panY = 0;
let isPanning = false, startX, startY;
let mapData = {};

async function loadMap() {
  const mapWrapper = document.getElementById("mapWrapper");
  const response = await fetch("map.svg");
  const svgText = await response.text();
  mapWrapper.innerHTML = svgText;

  svgElement = mapWrapper.querySelector("svg");

  // Agregar clase a todas las regiones del mapa
  svgElement.querySelectorAll("path, polygon, rect").forEach(el => {
    el.classList.add("alcaldia");
  });

  // Cargar datos JSON
  mapData = await fetch("data.json").then(res => res.json());

  // Eventos de interacción
  svgElement.querySelectorAll(".alcaldia").forEach(el => {
    el.addEventListener("click", e => showInfo(el.id));
  });

  // Zoom con la rueda
  svgElement.addEventListener("wheel", handleZoom);

  // Arrastrar (pan)
  mapWrapper.addEventListener("mousedown", startPan);
  mapWrapper.addEventListener("mousemove", panMove);
  mapWrapper.addEventListener("mouseup", endPan);

  // Botones de zoom
  document.getElementById("zoomIn").addEventListener("click", () => adjustZoom(1.2));
  document.getElementById("zoomOut").addEventListener("click", () => adjustZoom(0.8));
  document.getElementById("resetZoom").addEventListener("click", resetZoom);

  // Botón cerrar panel
  document.getElementById("closeInfo").addEventListener("click", () => {
    document.getElementById("infoPanel").classList.add("hidden");
  });
}

// Mostrar información
function showInfo(id) {
  const panel = document.getElementById("infoPanel");
  const region = mapData[id];

  if (region) {
    document.getElementById("regionName").textContent = region.nombre;
    document.getElementById("regionInfo").textContent = region.info;
    panel.classList.remove("hidden");
  } else {
    document.getElementById("regionName").textContent = "Desconocido";
    document.getElementById("regionInfo").textContent = "No hay datos disponibles.";
    panel.classList.remove("hidden");
  }
}

// Control de zoom
function handleZoom(e) {
  e.preventDefault();
  const delta = e.deltaY < 0 ? 1.1 : 0.9;
  adjustZoom(delta);
}

function adjustZoom(factor) {
  zoomLevel *= factor;
  updateTransform();
}

function resetZoom() {
  zoomLevel = 1;
  panX = 0;
  panY = 0;
  updateTransform();
}

// Control de arrastre
function startPan(e) {
  isPanning = true;
  startX = e.clientX - panX;
  startY = e.clientY - panY;
}

function panMove(e) {
  if (!isPanning) return;
  panX = e.clientX - startX;
  panY = e.clientY - startY;
  updateTransform();
}

function endPan() {
  isPanning = false;
}

function updateTransform() {
  svgElement.style.transform = `translate(${panX}px, ${panY}px) scale(${zoomLevel})`;
}

// Cargar mapa al iniciar
document.addEventListener("DOMContentLoaded", loadMap);
