import { palabras } from "./palabras.js";

/* ===============================
   VARIABLES
=================================*/

const palabraSecreta = palabras[Math.floor(Math.random() * palabras.length)].toLowerCase();
const tablero = document.getElementById("tablero-juego");
const botonesTeclado = document.querySelectorAll(".boton-teclado");

let borrando = false;
let juegoTerminado = false;
let filaActual = null;
let palabraActual = [];
let letrasHistoricas = {}; // Letras usadas en palabras anteriores
let intentos = 0;
const MAX_INTENTOS = 6;


function animarBoton(boton) {

    // Resetear animaciones previas
    boton.classList.remove("animate__fadeOut", "animate__fadeIn");
    void boton.offsetWidth; // 🔥 reinicio de animación

    boton.classList.add("animate__animated");
    boton.style.animationDuration = "0.5s";

    // FASE 1 → fadeOut
    boton.classList.add("animate__fadeOut");

    boton.addEventListener("animationend", function handler() {

        boton.classList.remove("animate__fadeOut");

        // FASE 2 → fadeIn
        boton.classList.add("animate__fadeIn");

        boton.addEventListener("animationend", () => {
            boton.classList.remove("animate__animated", "animate__fadeIn");
            boton.style.animationDuration = "";
        }, { once: true });

    }, { once: true });
}


/* ===============================
   CREAR TABLERO
=================================*/

function crearTablero() {
    tablero.innerHTML = "";

    const filaOculta = document.createElement("div");
    filaOculta.classList.add("fila-oculta");

    for (let i = 0; i < palabraSecreta.length; i++) {
        const caja = document.createElement("div");
        caja.classList.add("poppins-regular", "caja-letra", "animate__animated", "animate__fadeIn");
        filaOculta.appendChild(caja);
    }

    tablero.appendChild(filaOculta);
    crearNuevaFila();
}

function crearNuevaFila() {
    if (intentos >= MAX_INTENTOS) return;

    palabraActual = [];

    filaActual = document.createElement("div");
    filaActual.classList.add("fila-letras", "fila-intento");

    tablero.appendChild(filaActual);
}

crearTablero();

/* ===============================
   INSERTAR LETRA
=================================*/

function insertarLetra(letra) {
    if (juegoTerminado) return;

    letra = letra.toLowerCase();
    palabraActual.push(letra);

    const caja = document.createElement("div");
    caja.classList.add("poppins-regular", "caja-letra", "animate__animated", "animate__fadeInRight");
    caja.textContent = letra;

    filaActual.appendChild(caja);
}

/* ===============================
   BORRAR LETRA
=================================*/

function borrarLetra() {
    if (borrando) return; // 🔥 evita spam
    if (palabraActual.length === 0) return;

    const ultimaCaja = filaActual.lastChild;
    if (!ultimaCaja) return;

    borrando = true; // 🔒 bloquear

    // Quitar del array
    palabraActual.pop();

    ultimaCaja.classList.remove("animate__fadeInRight");
    void ultimaCaja.offsetWidth;

    ultimaCaja.classList.add("animate__animated", "animate__fadeOutRight");
    ultimaCaja.style.animationDuration = "0.3s";

    ultimaCaja.addEventListener("animationend", () => {
        ultimaCaja.remove();
        borrando = false; // 🔓 desbloquear
    }, { once: true });
}

/* ===============================
   VALIDAR PALABRA (ENTER)
=================================*/

function finalizarIntento() {
    if (juegoTerminado) return;
    if (palabraActual.length === 0) return;

    // Copia del historial ANTES de modificarlo
    const historialPrevio = { ...letrasHistoricas };

    // Letras únicas de esta palabra
    const letrasUnicas = [...new Set(palabraActual)];

    palabraActual.forEach((letra, index) => {

        const caja = filaActual.children[index];

        // Solo validar si ya existía en palabras anteriores
        if (historialPrevio[letra]) {

            if (palabraSecreta.includes(letra)) {
                caja.classList.add("correcta");
                revelarLetra(letra);
                marcarTecla(letra, "correcta");
            } else {
                caja.classList.add("incorrecta");
                marcarTecla(letra, "incorrecta");
            }
        }
    });

    // Ahora sí actualizamos historial con letras únicas
    letrasUnicas.forEach(letra => {
        letrasHistoricas[letra] = true;
    });

    verificarVictoria();

    intentos++;

    if (intentos >= MAX_INTENTOS && !juegoTerminado) {
        setTimeout(() => {
            alert("❌ Perdiste. La palabra era: " + palabraSecreta);
        }, 200);
        juegoTerminado = true;
        return;
    }

    if (!juegoTerminado) {
        crearNuevaFila();
    }
}

/* ===============================
   REVELAR LETRAS ARRIBA
=================================*/

function revelarLetra(letra) {
    const filaOculta = document.querySelector(".fila-oculta");

    palabraSecreta.split("").forEach((l, i) => {
        if (l === letra) {

            const caja = filaOculta.children[i];

            // Colocar letra
            caja.textContent = letra;

            // Resetear animaciones previas
            caja.classList.remove("animate__animated", "animate__fadeIn");
            void caja.offsetWidth; // 🔥 reinicia animación

            // Aplicar animación
            caja.classList.add("animate__animated", "animate__fadeIn");

            // Opcional: duración personalizada
            caja.style.animationDuration = "1s";
        }
    });
}

/* ===============================
   MARCAR TECLA
=================================*/

function marcarTecla(letra, estado) {
    botonesTeclado.forEach(boton => {
        if (boton.textContent.toLowerCase() === letra) {

            if (!boton.classList.contains("correcta")) {
                boton.classList.remove("incorrecta");
                boton.classList.add(estado);
            }
        }
    });
}

/* ===============================
   VERIFICAR VICTORIA
=================================*/

function verificarVictoria() {
    const filaOculta = document.querySelector(".fila-oculta");

    const completado = Array.from(filaOculta.children)
        .every(caja => caja.textContent !== "");

    if (completado) {
        juegoTerminado = true;
        setTimeout(() => {
            alert("🎉 ¡Ganaste!");
        }, 200);
    }
}

/* ===============================
   EVENTOS
=================================*/

document.addEventListener("keydown", (e) => {

    const tecla = e.key.toLowerCase();

    // Buscar botón correspondiente
    botonesTeclado.forEach(boton => {
        if (boton.textContent.toLowerCase() === tecla ||
            (tecla === "backspace" && boton.textContent === "Del") ||
            (tecla === "enter" && boton.textContent === "Enter")) {

            animarBoton(boton);
        }
    });

    if (/^[a-záéíóúñ]$/i.test(tecla)) {
        insertarLetra(tecla);
    }

    if (tecla === "backspace") {
        borrarLetra();
    }

    if (tecla === "enter") {
        finalizarIntento();
    }
});

botonesTeclado.forEach(boton => {
    boton.addEventListener("click", () => {

        animarBoton(boton); // 👈 animación aquí

        const valor = boton.textContent;

        if (valor === "Del") {
            borrarLetra();
            return;
        }

        if (valor === "Enter") {
            finalizarIntento();
            return;
        }

        insertarLetra(valor);
    });
});