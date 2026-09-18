const API_URL = 'http://localhost/crud-contatos/api/contatos.php';
let todosContatos = [];

async function carregarContatos() {
    try {
        const resposta = await fetch(API_URL);
        const dados = await resposta.json();
        if (dados.sucesso) {
            todosContatos = dados.dados;
            exibirContatos(todosContatos);
        }
    } catch (erro) {
        console.error('Erro ao carregar contatos:', erro);
        document.getElementById('lista-contatos').innerHTML =
            '<p class="sem-contatos">Erro ao conectar com o servidor.</p>';
    }
}

function exibirContatos(contatos) {
    const container = document.getElementById('lista-contatos');
    if (contatos.length === 0) {
        container.innerHTML = '<p class="sem-contatos">Nenhum contato encontrado.</p>';
        return;
    }

    container.innerHTML = contatos.map(c => `
        <div class="contato-card" id="card-${c.id}">
            <div class="contato-info">
                <h3>${c.nome}</h3>
                <p>${c.email} ${c.telefone ? '| ' + c.telefone : ''}</p>
            </div>
            <div class="contato-acoes">
                <button class="btn-editar" onclick="preencherFormulario(${c.id})">Editar</button>
                <button class="btn-deletar" onclick="deletarContato(${c.id}, '${c.nome}')">Deletar</button>
            </div>
        </div>
    `).join('');
}

function filtrarContatos() {
    const busca = document.getElementById('busca').value.toLowerCase();
    const filtrados = todosContatos.filter(c =>
        c.nome.toLowerCase().includes(busca) ||
        (c.email && c.email.toLowerCase().includes(busca))
    );
    exibirContatos(filtrados);
}

async function salvarContato() {
    const id = document.getElementById('contato-id').value;
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefone = document.getElementById('telefone').value.trim();

    if (!nome || !email) {
        alert('Por favor, preencha nome e email!');
        return;
    }

    const contato = { nome, email, telefone };

    try {
        const url = id ? `${API_URL}?id=${id}` : API_URL;
        const resposta = await fetch(url, {
            method: id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(contato)
        });
        const dados = await resposta.json();

        if (dados.sucesso) {
            alert(dados.mensagem);
            limparFormulario();
            carregarContatos();
        } else {
            alert('Erro: ' + dados.mensagem);
        }
    } catch (erro) {
        alert('Erro de comunicação com o servidor.');
        console.error(erro);
    }
}

function preencherFormulario(id) {
    const contato = todosContatos.find(c => c.id == id);
    if (!contato) return;

    document.getElementById('contato-id').value = contato.id;
    document.getElementById('nome').value = contato.nome;
    document.getElementById('email').value = contato.email || '';
    document.getElementById('telefone').value = contato.telefone || '';

    document.getElementById('titulo-form').textContent = 'Editar Contato';
    document.querySelector('.formulario').scrollIntoView({ behavior: 'smooth' });
}

async function deletarContato(id, nome) {
    if (!confirm(`Tem certeza que deseja remover '${nome}'?`)) return;
    try {
        const resposta = await fetch(`${API_URL}?id=${id}`, {
            method: 'DELETE'
        });

        const dados = await resposta.json();
        if (dados.sucesso) {
            alert(dados.mensagem);
            carregarContatos();
        } else {
            alert('Erro: ' + dados.mensagem);
        }
    } catch (erro) {
        alert('Erro de comunicação com o servidor.');
    }
}

function limparFormulario() {
    document.getElementById('contato-id').value = '';
    document.getElementById('nome').value = '';
    document.getElementById('email').value = '';
    document.getElementById('telefone').value = '';
    document.getElementById('titulo-form').textContent = 'Novo Contato';
}

async function fazerLogoff() {
    try {
        await fetch('http://localhost/crud-contatos/api/logout.php');
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = 'login.html';
    } catch (erro) {
        console.error('Erro ao sair:', erro);
        window.location.href = 'login.html';
    }
}

document.addEventListener('DOMContentLoaded', carregarContatos);