// Parte 1 - Configuracao e variaveis globais
// URL base da nossa API PHP
// Todos os pedidos serao enviados para este endereco
const API_URL = 'http://localhost/crud-contatos/api/contatos.php';
// Array que guarda todos os contatos carregados do banco
// Usado para filtrar sem precisar consultar o banco a cada busca
let todosContatos = [];

// Parte 2 - Carregar e exibir contatos (READ)
// async: indica que esta funcao realiza operacoes assincronas
async function carregarContatos() {
 try {
 // fetch faz uma requisicao HTTP GET para a API
 // await: espera a resposta antes de continuar
 const resposta = await fetch(API_URL);
 // .json(): converte o texto JSON em objeto JavaScript
 const dados = await resposta.json();
 if (dados.sucesso) {
 // Salva no array global
 todosContatos = dados.dados;
 // Exibe na pagina
 exibirContatos(todosContatos);
 }
 } catch (erro) {
 // catch: captura qualquer erro que aconteca no bloco try
 console.error('Erro ao carregar contatos:', erro);
 document.getElementById('lista-contatos').innerHTML =
 '<p class="sem-contatos">Erro ao conectar com o servidor.</p>';
 }
}

// Gera o HTML dos cards de contato e insere na pagina
function exibirContatos(contatos) {
 const container = document.getElementById('lista-contatos');
 // Se nao houver contatos, mostra mensagem
 if (contatos.length === 0) {
 container.innerHTML = '<p class="sem-contatos">Nenhum contato encontrado.</p>';
 return;
 }
 // map: transforma cada contato em um bloco de HTML
 // join: junta os blocks em uma unica string
 container.innerHTML = contatos.map(c => `
 <div class="contato-card" id="card-${c.id}">
 <div class="contato-info">
 <h3>${c.nome}</h3>
 <p>${c.email} ${c.telefone ? '| ' + c.telefone : ''}</p>
 </div>
 <div class="contato-acoes">
 <button class="btn-editar"
 onclick="preencherFormulario(${c.id})">
 Editar
 </button>
 <button class="btn-deletar"
 onclick="deletarContato(${c.id}, '${c.nome}')">
 Deletar
 </button>
 </div>
 </div>
 `).join('');
}

// Parte 3 - Filtro de busca
// Chamada a cada tecla digitada no campo de busca (oninput no HTML)
function filtrarContatos() {
 // .value: pega o texto do input | .toLowerCase(): converte para minusculas
 const busca = document.getElementById('busca').value.toLowerCase();
 // filter: cria um novo array com apenas os contatos que passam no teste
 const filtrados = todosContatos.filter(c =>
 c.nome.toLowerCase().includes(busca) ||
 c.email.toLowerCase().includes(busca)
 );
 exibirContatos(filtrados);
}

// Parte 4 - Salvar contato (CREATE e UPDATE)
// Salva o contato: cria novo se sem ID, atualiza se tiver ID
async function salvarContato() {
 // Captura os valores dos campos
 const id = document.getElementById('contato-id').value;
 const nome = document.getElementById('nome').value.trim();
 const email = document.getElementById('email').value.trim();
 const telefone = document.getElementById('telefone').value.trim();
 // Validacao no frontend (antes de enviar ao servidor)
 if (!nome || !email) {
 alert('Por favor, preencha nome e email!');
 return;
 }
 // Monta o objeto com os dados do contato
 const contato = { nome, email, telefone };
 // Se tiver ID, e uma edicao; se nao, e criacao
 if (id) contato.id = parseInt(id);
 try {
 const resposta = await fetch(API_URL, {
 method: id ? 'PUT' : 'POST', // PUT para atualizar, POST para criar
 headers: { 'Content-Type': 'application/json' },
 // JSON.stringify: converte o objeto JS para texto JSON
 body: JSON.stringify(contato)
 });
 const dados = await resposta.json();
 if (dados.sucesso) {
 alert(dados.mensagem);
 limparFormulario(); // limpa os campos
 carregarContatos(); // recarrega a lista
 } else {
 alert('Erro: ' + dados.mensagem);
 }
 } catch (erro) {
 alert('Erro de comunicacao com o servidor.');
 console.error(erro);
 }
}

// Parte 5 - Editar e Deletar
// Preenche o formulario com os dados do contato a editar
function preencherFormulario(id) {
 // find: encontra o primeiro contato com o ID correspondente
 const contato = todosContatos.find(c => c.id == id);
 if (!contato) return;
 // Preenche cada campo com os dados do contato
 document.getElementById('contato-id').value = contato.id;
 document.getElementById('nome').value = contato.nome;
 document.getElementById('email').value = contato.email;
 document.getElementById('telefone').value = contato.telefone || '';
 // Atualiza o titulo do formulario
 document.getElementById('titulo-form').textContent = 'Editar Contato';
 // Rola a pagina para o formulario (em celulares isso e util)
 document.querySelector('.formulario').scrollIntoView({ behavior: 'smooth' });
}

// Remove um contato apos confirmacao do usuario
async function deletarContato(id, nome) {
 // confirm: exibe uma caixa de confirmacao
 // Retorna true se o usuario clicou em 'OK'
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
 alert('Erro de comunicacao com o servidor.');
 }
}

// Limpa todos os campos e reseta o formulario
function limparFormulario() {
 document.getElementById('contato-id').value = '';
 document.getElementById('nome').value = '';
 document.getElementById('email').value = '';
 document.getElementById('telefone').value = '';
 document.getElementById('titulo-form').textContent = 'Novo Contato';
}

// Executa ao carregar a pagina (equivale ao 'onload' do HTML)
// DOMContentLoaded: dispara quando todo o HTML foi carregado
document.addEventListener('DOMContentLoaded', carregarContatos);