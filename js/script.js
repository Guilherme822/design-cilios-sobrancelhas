/* Navegação entre páginas e player de vídeo. */

let botoesNavegacao = document.querySelectorAll("button.nav-button");
let marcaNavegacao = document.querySelector(".brand");
let paginas = document.querySelectorAll(".pagina");

let formularioAgendamento = document.getElementById("form-agendamento");
let mensagemAgendamento = document.getElementById("mensagem-agendamento");

let playersVideo = document.querySelectorAll(".player-video");


/* Alterna as seções sem recarregar o documento. */
function mostrarPagina(nomePagina) {
    paginas.forEach(function (pagina) {
        pagina.classList.remove("ativa");
    });

    let paginaSelecionada = document.getElementById("pagina-" + nomePagina);
    if (paginaSelecionada) {
        paginaSelecionada.classList.add("ativa");
    }

    botoesNavegacao.forEach(function (botao) {
        let estaAtiva = botao.dataset.page === nomePagina;
        botao.classList.toggle("ativo", estaAtiva);
        botao.setAttribute("aria-current", estaAtiva ? "page" : "false");
    });

    if (nomePagina !== "videos") {
        playersVideo.forEach(function (playerVideo) {
            let video = playerVideo.querySelector("video");
            if (video && !video.paused) {
                video.pause();
            }
        });
    }
}

botoesNavegacao.forEach(function (botao) {
    botao.addEventListener("click", function () {
        mostrarPagina(botao.dataset.page);
    });
});

if (marcaNavegacao) {
    marcaNavegacao.addEventListener("click", function (evento) {
        evento.preventDefault();
        mostrarPagina(marcaNavegacao.dataset.page);
    });
}

/* Formato de tempo usado pelo player. */
function formatarTempo(segundos) {
    if (!Number.isFinite(segundos)) {
        return "00:00";
    }

    let minutos = Math.floor(segundos / 60);
    let restoSegundos = Math.floor(segundos % 60);
    return String(minutos).padStart(2, "0") + ":" + String(restoSegundos).padStart(2, "0");
}

/* Converte a data do input (AAAA-MM-DD) para o formato brasileiro (DD/MM/AAAA). */
function formatarDataBrasileira(dataISO) {
    if (!dataISO) {
        return "";
    }

    let partes = dataISO.split("-");
    return partes[2] + "/" + partes[1] + "/" + partes[0];
}

/* Controles nativos compartilhados por todos os vídeos da página. */
playersVideo.forEach(function (playerVideo) {
    let video = playerVideo.querySelector("video");
    if (!video) {
        return;
    }

    let botaoPlay = playerVideo.querySelector('[data-video-action="play"]');
    let botaoPausar = playerVideo.querySelector('[data-video-action="pause"]');
    let botaoReiniciar = playerVideo.querySelector('[data-video-action="reset"]');
    let barraProgresso = playerVideo.querySelector("[data-video-progress]");
    let tempo = playerVideo.querySelector("[data-video-time]");

    function atualizarInformacoesVideo() {
        if (!barraProgresso || !tempo) {
            return;
        }

        let duracao = video.duration;
        let progresso = duracao > 0 ? (video.currentTime / duracao) * 100 : 0;
        barraProgresso.value = progresso;
        tempo.textContent = formatarTempo(video.currentTime) + " / " + formatarTempo(duracao);
    }

    if (botaoPlay) {
        botaoPlay.addEventListener("click", function () {
            playersVideo.forEach(function (outroPlayer) {
                let outroVideo = outroPlayer.querySelector("video");
                if (outroVideo && outroVideo !== video && !outroVideo.paused) {
                    outroVideo.pause();
                }
            });

            video.play().catch(function () {
                if (tempo) {
                    tempo.textContent = "Vídeo indisponível";
                }
            });
        });

        video.addEventListener("play", function () {
            botaoPlay.textContent = "Reproduzindo";
        });

        video.addEventListener("pause", function () {
            botaoPlay.textContent = "Reproduzir";
        });

        video.addEventListener("ended", function () {
            botaoPlay.textContent = "Assistir novamente";
            if (barraProgresso) {
                barraProgresso.value = 100;
            }
        });
    }

    if (botaoPausar) {
        botaoPausar.addEventListener("click", function () {
            if (!video.paused) {
                video.pause();
            }
        });
    }

    if (botaoReiniciar) {
        botaoReiniciar.addEventListener("click", function () {
            video.currentTime = 0;
            atualizarInformacoesVideo();
        });
    }

    if (barraProgresso) {
        barraProgresso.addEventListener("input", function () {
            if (video.duration) {
                video.currentTime = (barraProgresso.value / 100) * video.duration;
                atualizarInformacoesVideo();
            }
        });
    }

    video.addEventListener("timeupdate", atualizarInformacoesVideo);
    video.addEventListener("loadedmetadata", atualizarInformacoesVideo);
});

/* Confirmação local do formulário, sem enviar dados para o servidor. */
if (formularioAgendamento && mensagemAgendamento) {
    formularioAgendamento.addEventListener("submit", function (evento) {
        evento.preventDefault();

        let nomeCliente = document.getElementById("nome-cliente").value.trim();
        let servicoAgendamento = document.getElementById("servico-agendamento").value;
        let dataAgendamento = document.getElementById("data-agendamento").value;
        let horaAgendamento = document.getElementById("hora-agendamento").value;

        mensagemAgendamento.textContent =
            "Obrigado, " + nomeCliente + "! Sua solicitação de " +
            servicoAgendamento + " para " + formatarDataBrasileira(dataAgendamento) +
            " às " + horaAgendamento + " foi registrada.";
    });
}