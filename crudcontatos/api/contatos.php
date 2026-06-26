<?php
// Permite que o frontend (HTML/JS) se comunique com este arquivo
// CORS = Cross-Origin Resource Sharing (compartilhamento entre origens)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');
// Diz para o navegador que a resposta sera em formato JSON
header('Content-Type: application/json; charset=utf-8');
// Inclui o arquivo de configuracao do banco
require_once 'config.php';
// Descobre qual metodo HTTP foi usado na requisicao
// GET = buscar dados | POST = criar | PUT = atualizar | DELETE = apagar
$metodo = $_SERVER['REQUEST_METHOD'];
// Captura o corpo da requisicao (usado em POST e PUT)
$corpo = json_decode(file_get_contents('php://input'), true);
// Decide o que fazer com base no metodo HTTP recebido
switch ($metodo) {
 case 'GET': listarContatos(); break;
 case 'POST': criarContato(); break;
 case 'PUT': atualizarContato(); break;
 case 'DELETE': deletarContato(); break;
 default:
 echo json_encode(['sucesso' => false, 'mensagem' => 'Metodo invalido']);
}
// OPERACAO: READ - Busca todos os contatos no banco
function listarContatos() {
 global $conexao; // usa a variavel $conexao do escopo global
 // Monta a query SQL para buscar todos os contatos
 // ORDER BY nome ASC = ordena por nome em ordem crescente (A-Z)
 $sql = 'SELECT id, nome, email, telefone, criado_em
 FROM contatos
 ORDER BY nome ASC';
 // Executa a query no banco de dados
 $resultado = $conexao->query($sql);
 // Cria um array vazio para guardar os contatos
 $contatos = [];
 // Percorre cada linha do resultado e adiciona no array
 // fetch_assoc() retorna cada linha como um array associativo
 while ($linha = $resultado->fetch_assoc()) {
    $contatos[] = $linha;
 }
 // Converte o array PHP para JSON e envia para o frontend
 echo json_encode(['sucesso' => true, 'dados' => $contatos]);
}
// OPERACAO: CREATE - Insere um novo contato no banco
function criarContato() {
 global $conexao, $corpo;
 // Valida se os campos obrigatorios foram enviados
 if (empty($corpo['nome']) || empty($corpo['email'])) {
 echo json_encode(['sucesso' => false,
 'mensagem' => 'Nome e email sao obrigatorios']);
 return; // para a execucao aqui
 }
 // Prepared Statement: protege contra SQL Injection
 // O '?' e um marcador que sera substituido pelo valor real
 $stmt = $conexao->prepare(
 'INSERT INTO contatos (nome, email, telefone)
 VALUES (?, ?, ?)'
 );
 // Liga os parametros: 's' = string
 // Ordem: stmt, tipos, variavel1, variavel2, variavel3
 $stmt->bind_param('sss',
 $corpo['nome'],
 $corpo['email'],
 $corpo['telefone']
 ); 
 // Executa a operacao no banco
 if ($stmt->execute()) {
 echo json_encode([
 'sucesso' => true,
 'mensagem' => 'Contato criado com sucesso!',
 'id' => $conexao->insert_id // retorna o id do novo registro
 ]);
 } else {
 echo json_encode(['sucesso' => false,
 'mensagem' => 'Erro ao criar contato']);
 }
}
// OPERACAO: UPDATE - Atualiza os dados de um contato existente
function atualizarContato() {
 global $conexao, $corpo;
 // Valida se o ID foi informado no corpo da requisicao
 if (empty($corpo['id'])) {
 echo json_encode([
 'mensagem' => 'ID nao informado']);
 return;
 }
 $stmt = $conexao->prepare(
 'UPDATE contatos
 SET nome = ?, email = ?, telefone = ?
 WHERE id = ?'
 );
 // 'sssi' = tres strings (s) e um inteiro (i)
 $stmt->bind_param('sssi',
 $corpo['nome'],
 $corpo['email'],
 $corpo['telefone'],
 $corpo['id']
 );
 if ($stmt->execute()) {
 echo json_encode([
 'sucesso' => true,
 'mensagem' => 'Contato atualizado com sucesso!'
 ]);
 } else {
 echo json_encode(['sucesso' => false,
 'mensagem' => 'Erro ao atualizar contato']);
 }
}
// Parte 6 - Funcao Deletar (DELETE)
// OPERACAO: DELETE - Remove um contato do banco
function deletarContato() {
 global $conexao;
 // O ID vem na URL: ?id=5
 $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
 // (int) converte para inteiro, evitando injecao de dados maliciosos
 if ($id <= 0) {
 echo json_encode(['sucesso' => false,
 'mensagem' => 'ID invalido']);
 return;
 }
 $stmt = $conexao->prepare('DELETE FROM contatos WHERE id = ?');
 $stmt->bind_param('i', $id); // 'i' = inteiro
 if ($stmt->execute()) {
 echo json_encode([
 'sucesso' => true,
 'mensagem' => 'Contato removido com sucesso!'
 ]);
 } else {
 echo json_encode(['sucesso' => false,
 'mensagem' => 'Erro ao remover contato']);
 }
}
?>