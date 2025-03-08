document.getElementById("btn-colocar").addEventListener("click", colocarPunto);
document.getElementById("btn-eliminar").addEventListener("click", eliminarUltimoPunto);
document.getElementById("btn-guardar").addEventListener("click", guardarMapaPDF);

const latMin = 19.6, latMax = 19.0;
const lonMin = -99.4, lonMax = -98.9;
const imgWidth = 800, imgHeight = 1129;
const latCenter = 19.3;
const lonCenter = -99.15;
let puntos = [];

function normalizarCoordenada(valor) {
    if (isNaN(valor)) return NaN;
    return parseFloat(valor.toFixed(8));
}

function corregirEscala(lon, lat) {
    let distanciaLat = Math.abs(lat - latCenter);
    let distanciaLon = Math.abs(lon - lonCenter);

    let factorLat = 1 + 0.3 * distanciaLat;
    let factorLon = lon < lonCenter ? 1 - 0.43 * distanciaLon : 1 + 0.93 * (distanciaLon / 2);

    return { factorLat, factorLon };
}

function colocarPunto() {
    let lat = normalizarCoordenada(parseFloat(document.getElementById("latitud").value));
    let lon = normalizarCoordenada(parseFloat(document.getElementById("longitud").value));
    let color = document.getElementById("color").value;

    if (isNaN(lat) || isNaN(lon)) {
        alert("Ingresa valores válidos de latitud y longitud");
        return;
    }

    let { factorLat, factorLon } = corregirEscala(lon, lat);

    let x = ((lon - lonMin) / (lonMax - lonMin)) * imgWidth * factorLon;
    let y = ((lat - latMin) / (latMax - latMin)) * imgHeight * factorLat;

    x = Math.min(Math.max(x, 0), imgWidth);
    y = Math.min(Math.max(y, 0), imgHeight);

    let punto = document.createElement("div");
    punto.className = "punto";
    punto.style.backgroundColor = color;
    punto.style.left = `${x}px`;
    punto.style.top = `${y}px`;

    document.getElementById("mapa-container").appendChild(punto);
    puntos.push(punto);
}

function eliminarUltimoPunto() {
    if (puntos.length > 0) {
        let ultimoPunto = puntos.pop();
        ultimoPunto.remove();
    } else {
        alert("No hay puntos para eliminar.");
    }
}

function guardarMapaPDF() {
    let mapaContainer = document.getElementById("mapa-container");

    html2canvas(mapaContainer).then(canvas => {
        let imgData = canvas.toDataURL("image/png");
        let { jsPDF } = window.jspdf;
        let pdf = new jsPDF("p", "mm", "a4");

        let imgWidth = 210;
        let imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
        pdf.save("mapa_incidentes.pdf");
    });
}
