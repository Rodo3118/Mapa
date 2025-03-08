document.getElementById("btn-colocar").addEventListener("click", colocarPunto);
document.getElementById("btn-eliminar").addEventListener("click", eliminarUltimoPunto);
document.getElementById("btn-guardar").addEventListener("click", guardarMapaPDF);
const mapa = document.getElementById("mapa");

const latMin = 19.6, latMax = 19.0;
const lonMin = -99.4, lonMax = -98.9;
const latCenter = 19.3;
const lonCenter = -99.15;
let puntos = []; // Guardaremos los puntos con sus coordenadas originales

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

    let punto = document.createElement("div");
    punto.className = "punto";
    punto.style.backgroundColor = color;

    document.getElementById("mapa-container").appendChild(punto);

    // Guardamos los datos originales del punto
    puntos.push({ elemento: punto, lat, lon, color });

    actualizarPosiciones(); // Colocamos el punto en la posición correcta
}

function actualizarPosiciones() {
    const rect = mapa.getBoundingClientRect(); // Tamaño actual de la imagen
    const imgWidth = rect.width;
    const imgHeight = rect.height;

    puntos.forEach(p => {
        let { factorLat, factorLon } = corregirEscala(p.lon, p.lat);

        let x = ((p.lon - lonMin) / (lonMax - lonMin)) * imgWidth * factorLon;
        let y = ((p.lat - latMin) / (latMax - latMin)) * imgHeight * factorLat;

        x = Math.min(Math.max(x, 0), imgWidth);
        y = Math.min(Math.max(y, 0), imgHeight);

        p.elemento.style.left = `${x}px`;
        p.elemento.style.top = `${y}px`;
    });
}

function eliminarUltimoPunto() {
    if (puntos.length > 0) {
        let ultimoPunto = puntos.pop();
        ultimoPunto.elemento.remove();
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

// Evento para redibujar puntos cuando cambie el tamaño de la ventana
window.addEventListener("resize", actualizarPosiciones);

