import { palabras } from "./palabras.js";

/* ===============================
    VARIABLES GLOBALES
=================================*/

const tablero = document.getElementById("tablero-juego");
const botonesTeclado = document.querySelectorAll(".boton-teclado");
const botonTema = document.querySelector(".btn-tema");
const botonReiniciar = document.querySelector(".btn-reiniciar");
const iconMoon = document.querySelector(".bi-moon");
const iconSun = document.querySelector(".bi-sun");
const esMobile = window.matchMedia("(max-width: 768px)").matches;

let palabraSecreta = "";
let borrando = false;
let juegoTerminado = false;
let filaActual = null;
let palabraActual = [];
let letrasHistoricas = {};
let intentos = 0;
const MAX_INTENTOS = 6;


/* ===============================
    TEMA (DARK MODE)
=================================*/

function aplicarTema(tema) {
     if (tema === "oscuro") {
          document.body.classList.add("dark-mode");
          iconMoon.classList.add("hidden");
          iconSun.classList.remove("hidden");
          localStorage.setItem("tema", "oscuro");
     } else {
          document.body.classList.remove("dark-mode");
          iconSun.classList.add("hidden");
          iconMoon.classList.remove("hidden");
          localStorage.setItem("tema", "claro");
     }
}

const temaGuardado = localStorage.getItem("tema") || "claro";
aplicarTema(temaGuardado);

botonTema.addEventListener("click", () => {
     const esOscuro = document.body.classList.contains("dark-mode");
     aplicarTema(esOscuro ? "claro" : "oscuro");
});

function normalizarLetra(letra) {
     return letra
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, ""); // elimina tildes
}

/* ===============================
    LÓGICA DEL JUEGO
=================================*/

function seleccionarNuevaPalabra() {
     palabraSecreta = palabras[
          Math.floor(Math.random() * palabras.length)
     ].toLowerCase();
}

function reiniciarJuego() {
     seleccionarNuevaPalabra();
     intentos = 0;
     juegoTerminado = false;
     palabraActual = [];
     letrasHistoricas = {};
     borrando = false;

     botonesTeclado.forEach(boton => {
          boton.classList.remove("correcta", "incorrecta");
     });

     crearTablero();
}

botonReiniciar.addEventListener("click", () => {
     reiniciarJuego();
});


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

seleccionarNuevaPalabra();
crearTablero();


/* ===============================
    INSERTAR Y BORRAR LETRAS
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

function borrarLetra() {
     if (borrando) return;
     if (palabraActual.length === 0) return;

     const ultimaCaja = filaActual.lastChild;
     if (!ultimaCaja) return;

     borrando = true;
     palabraActual.pop();

     ultimaCaja.classList.remove("animate__fadeInRight");
     void ultimaCaja.offsetWidth;

     ultimaCaja.classList.add("animate__animated", "animate__fadeOutRight");
     ultimaCaja.style.animationDuration = "0.3s";

     ultimaCaja.addEventListener("animationend", () => {
          ultimaCaja.remove();
          borrando = false;
     }, { once: true });
}


/* ===============================
    VALIDAR PALABRA
=================================*/

function finalizarIntento() {
     if (juegoTerminado) return;
     if (palabraActual.length === 0) return;

     const palabraIngresada = palabraActual.join("").toLowerCase();

     const palabraNormalizada = normalizarLetra(palabraSecreta);
     const ingresadaNormalizada = normalizarLetra(palabraIngresada);

     /* ===============================
        🏆 VICTORIA INSTANTÁNEA
     =============================== */

     if (ingresadaNormalizada === palabraNormalizada) {

          // Revelar toda la palabra respetando tildes
          const filaOculta = document.querySelector(".fila-oculta");

          palabraSecreta.split("").forEach((letraOriginal, i) => {
               filaOculta.children[i].textContent = letraOriginal;
          });

          juegoTerminado = true;

          setTimeout(() => {
               mostrarVictoria();
          }, 300);

          return;
     }

     /* ===============================
        🔍 LÓGICA NORMAL DEL JUEGO
     =============================== */

     const historialPrevio = { ...letrasHistoricas };
     const letrasUnicas = [...new Set(palabraActual)];

     palabraActual.forEach((letra, index) => {

          const caja = filaActual.children[index];
          const letraNormalizada = normalizarLetra(letra);

          if (historialPrevio[letraNormalizada]) {

               if (palabraNormalizada.includes(letraNormalizada)) {

                    caja.classList.add("correcta");
                    revelarLetra(letraNormalizada);
                    marcarTecla(letraNormalizada, "correcta");

               } else {

                    caja.classList.add("incorrecta");
                    marcarTecla(letraNormalizada, "incorrecta");
               }
          }
     });

     letrasUnicas.forEach(letra => {
          letrasHistoricas[normalizarLetra(letra)] = true;
     });

     verificarVictoria();

     if (juegoTerminado) return;

     intentos++;

     if (intentos >= MAX_INTENTOS) {
          juegoTerminado = true;

          setTimeout(() => {
               mostrarDerrota();
          }, 300);

          return;
     }

     crearNuevaFila();
}

function verificarVictoria() {
     const filaOculta = document.querySelector(".fila-oculta");

     const completado = Array.from(filaOculta.children)
          .every(caja => caja.textContent !== "");

     if (completado) {
          juegoTerminado = true;

          setTimeout(() => {
                mostrarVictoria();
          }, 300);
     }
}


/* ===============================
    REVELAR Y MARCAR LETRAS
=================================*/

function revelarLetra(letraNormalizada) {

     const filaOculta = document.querySelector(".fila-oculta");

     palabraSecreta.split("").forEach((letraOriginal, i) => {

          if (normalizarLetra(letraOriginal) === letraNormalizada) {

               const caja = filaOculta.children[i];
               caja.textContent = letraOriginal; // 🔥 muestra con tilde si la tiene

               caja.classList.remove("animate__animated", "animate__fadeIn");
               void caja.offsetWidth;

               caja.classList.add("animate__animated", "animate__fadeIn");
               caja.style.animationDuration = "1s";
          }
     });
}

function marcarTecla(letraNormalizada, estado) {

     botonesTeclado.forEach(boton => {

          const texto = boton.textContent.toLowerCase();

          if (normalizarLetra(texto) === letraNormalizada) {

               if (!boton.classList.contains("correcta")) {
                    boton.classList.remove("incorrecta");
                    boton.classList.add(estado);
               }
          }
     });
}

/* ===============================
    ANIMACIONES
=================================*/

function animarBoton(boton) {
     boton.classList.remove("animate__fadeOut", "animate__fadeIn");
     void boton.offsetWidth;

     boton.classList.add("animate__animated");
     boton.style.animationDuration = "0.5s";

     boton.classList.add("animate__fadeOut");

     boton.addEventListener("animationend", function handler() {
          boton.classList.remove("animate__fadeOut");
          boton.classList.add("animate__fadeIn");

          boton.addEventListener("animationend", () => {
                boton.classList.remove("animate__animated", "animate__fadeIn");
                boton.style.animationDuration = "";
          }, { once: true });

     }, { once: true });
}


/* ===============================
    EVENTOS DEL TECLADO
=================================*/

document.addEventListener("keydown", (e) => {
     const tecla = e.key.toLowerCase();

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
          animarBoton(boton);

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


/* ===============================
    MODALES (SWAL)
=================================*/

function mostrarVictoria() {
     const frasesVictoria = [
          "Felicitaciones, pero ¿Serás capáz de adivinar la próxima palabra?",
          "Sabía que podías hacerlo, pero ¿Eres capáz de repetir la hazaña con una palabra más difícil?",
          "En promedio la mayoría de los jugadores logran adivinar la primera palabra secreta, pero no la segunda ¿Perteneces a ese grupo?",
          "Admito que elegí una palabra fácil para empezar, la próxima es un reto de verdad",
          "Veo que te levantantes con la palabra correcta, dudo que esa suerte te acompañe en la próxima ronda..."
     ];

     const fraseAleatoria = frasesVictoria[
          Math.floor(Math.random() * frasesVictoria.length)
     ];

     Swal.fire({
          title: `${fraseAleatoria}`,
          icon: "success",
          confirmButtonText: "Aceptar el desafío",
          customClass: {
                popup: "swal-popup",
                title: "swal-title",
                confirmButton: "swal-confirm"
          },
          buttonsStyling: false
     }).then(() => {
          reiniciarJuego();
     });
}

function mostrarDerrota() {
     const frasesDesafiantes = [
          "Te reto a que lo intentes de nuevo, aunque no creo que puedas cambiar el resultado...",
          "Deberías abandonar porque no sé si podrás adivinar la próxima palabra...",
          "Este no es un juego para cualquiera",
          "Inténtalo de nuevo y sé de los pocos que descubren su palabra encriptada",
          "Los verdaderos jugadores no se rinden... ¿eres uno de ellos?",
          "Si tan solo hubieses arrancado con electroencefalo-\ngrafista y seguido con valbulario"
     ];

     const fraseAleatoria = frasesDesafiantes[
          Math.floor(Math.random() * frasesDesafiantes.length)
     ];

     Swal.fire({
          title: `${fraseAleatoria}`,
          icon: "error",
          confirmButtonText: "Demostrar que puedo ganar",
          customClass: {
                popup: "swal-popup",
                title: "swal-title",
                confirmButton: "swal-confirm"
          },
          buttonsStyling: false
     }).then(() => {
          reiniciarJuego();
     });
}

function mostrarOnboarding() {
     Swal.fire({
          title: "¿Cómo jugar?",
          html: `
               <div class="onboarding-content">
                    <h3 class="onboarding-subtitle">Reglas del Desafío</h3>
                    
                    <p>
                         Tienes <strong>${MAX_INTENTOS} intentos</strong> para descifrar la palabra secreta.
                    </p>

                    <h3 class="onboarding-subtitle">Dinámica</h3>
                    <p>
                         En cada intento debes escribir una palabra buscando repetir letras que ya hayas usado en anteriores intentos. Si la <strong>letra repetida</strong> existe en la palabra secreta, se revelará su posición. Si no, se marcará como incorrecta.
                    </p>

                    <h3 class="onboarding-subtitle">Estrategia</h3>
                    <p style="margin-top:10px;">
                         Escribe palabras que contengan muchas letras distintas y luego verifícalas.
                    </p>
               </div>
          `,
          showConfirmButton: true,
          confirmButtonText: "Aceptar el reto",
          customClass: {
               popup: "swal-popup",
               title: "swal-title",
               confirmButton: "swal-confirm",
               denyButton: "swal-deny"
          },
          buttonsStyling: false,
          backdrop: true
     }).then((result) => {
          if (result.isDenied) {
               localStorage.setItem("onboardingOculto", "true");
          }
     });
}


/* ===============================
    INICIALIZACIÓN
=================================*/

document.addEventListener("DOMContentLoaded", function () {
     if (!localStorage.getItem("onboardingOculto")) {
          setTimeout(() => {
                mostrarOnboarding();
          }, 600);
     }

     const botonInfo = document.querySelector(".btn-info");
     if (botonInfo) {
          botonInfo.addEventListener("click", mostrarOnboarding);
     }
});
