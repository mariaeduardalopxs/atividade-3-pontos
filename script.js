
const conversa = document.getElementById("conversa");
const campo = document.getElementById("pergunta");
const botao = document.getElementById("enviar");
const status = document.getElementById("status");
const limpar = document.getElementById("limpar");

const API_URL = "https://openrouter.ai/api/v1/chat/completions";

// A chave não deve ser colocada neste arquivo.
// Este site precisa de um backend seguro para acessar a OpenRouter.
let historico = [
    {
        role: "system",
        content: `
        Você é um Mentor de Carreiras com Inteligência Artificial.
        Ajude estudantes a descobrir seus interesses e habilidades.
        Sugira profissões, cursos e planos de desenvolvimento.
        Explique as possibilidades profissionais com clareza.
        Responda sempre em português brasileiro.
        Não prometa emprego ou sucesso garantido.
        `
    }
];

function adicionarMensagem(texto, tipo) {
    const mensagem = document.createElement("div");

    mensagem.classList.add("mensagem", tipo);
    mensagem.textContent = texto;

    conversa.appendChild(mensagem);
    conversa.scrollTop = conversa.scrollHeight;
}

async function enviarPergunta() {
    const pergunta = campo.value.trim();

    if (!pergunta) {
        status.textContent = "Digite uma pergunta primeiro.";
        return;
    }

    adicionarMensagem(pergunta, "usuario");
    campo.value = "";
    botao.disabled = true;
    status.textContent = "O mentor está pensando...";

    historico.push({
        role: "user",
        content: pergunta
    });

    try {
        const resposta = await fetch("/api/mentor", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages: historico.slice(1)
            })
        });

        if (!resposta.ok) {
            throw new Error("Não foi possível conectar ao mentor.");
        }

        const dados = await resposta.json();

        if (!dados.resposta) {
            throw new Error("Resposta inválida do servidor.");
        }

        historico.push({
            role: "assistant",
            content: dados.resposta
        });

        adicionarMensagem(dados.resposta, "bot");
        status.textContent = "Resposta recebida!";

    } catch (erro) {
        historico.pop();
        status.textContent =
            erro.message + " Verifique se o servidor Python está ativo.";
    } finally {
        botao.disabled = false;
        campo.focus();
    }
}

botao.addEventListener("click", enviarPergunta);

campo.addEventListener("keydown", function(evento) {
    if (evento.key === "Enter") {
        enviarPergunta();
    }
});

limpar.addEventListener("click", function() {
    historico = historico.slice(0, 1);

    conversa.innerHTML = "";

    adicionarMensagem(
        "Olá! Vamos começar uma nova conversa sobre sua carreira?",
        "bot"
    );

    status.textContent = "Nova conversa iniciada!";
});
