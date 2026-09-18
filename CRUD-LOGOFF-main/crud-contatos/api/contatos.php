<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

require_once 'config.php'; 

$metodo = $_SERVER['REQUEST_METHOD'];
$corpo = json_decode(file_get_contents('php://input'), true);

switch ($metodo) {
    case 'GET':
        listarContatos(); 
        break;
    case 'POST':
        criarContato($corpo);
        break;
    case 'PUT':
        atualizarContato($corpo); 
        break;
    case 'DELETE': 
        deletarContato(); 
        break;
    default:
        http_response_code(405);
        echo json_encode(['sucesso' => false, 'mensagem' => 'Método inválido']);
}

function listarContatos() {
    global $pdo;
    try {
        if (isset($_GET['id'])) {
            $stmt = $pdo->prepare("SELECT * FROM contatos WHERE id = :id");
            $stmt->execute(['id' => $_GET['id']]);
            $resultado = $stmt->fetch(PDO::FETCH_ASSOC);
        } else {
            $stmt = $pdo->query("SELECT * FROM contatos");
            $resultado = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        echo json_encode(['sucesso' => true, 'dados' => $resultado]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['sucesso' => false, 'mensagem' => 'Erro ao buscar contatos: ' . $e->getMessage()]);
    }
}

function criarContato($dados) {
    global $pdo;
    
    if (!isset($dados['nome']) || !isset($dados['email'])) {
        http_response_code(400);
        echo json_encode(['sucesso' => false, 'mensagem' => 'Nome e email são obrigatórios']);
        return;
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO contatos (nome, email, telefone) VALUES (:nome, :email, :telefone)");
        $stmt->execute([
            'nome' => $dados['nome'],
            'email' => $dados['email'],
            'telefone' => $dados['telefone'] ?? ''
        ]);
        
        http_response_code(201);
        echo json_encode(['sucesso' => true, 'mensagem' => 'Contato criado com sucesso']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['sucesso' => false, 'mensagem' => 'Erro ao criar contato: ' . $e->getMessage()]);
    }
}

function atualizarContato($dados) {
    global $pdo;
    
    if (!isset($_GET['id']) || !isset($dados['nome']) || !isset($dados['email'])) {
        http_response_code(400);
        echo json_encode(['sucesso' => false, 'mensagem' => 'ID, nome e email são obrigatórios']);
        return;
    }

    try {
        $stmt = $pdo->prepare("UPDATE contatos SET nome = :nome, email = :email, telefone = :telefone WHERE id = :id");
        $stmt->execute([
            'id' => $_GET['id'],
            'nome' => $dados['nome'],
            'email' => $dados['email'],
            'telefone' => $dados['telefone'] ?? ''
        ]);
        
        echo json_encode(['sucesso' => true, 'mensagem' => 'Contato atualizado com sucesso']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['sucesso' => false, 'mensagem' => 'Erro ao atualizar contato: ' . $e->getMessage()]);
    }
}

function deletarContato() {
    global $pdo;
    
    if (!isset($_GET['id'])) {
        http_response_code(400);
        echo json_encode(['sucesso' => false, 'mensagem' => 'ID é obrigatório para exclusão']);
        return;
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM contatos WHERE id = :id");
        $stmt->execute(['id' => $_GET['id']]);
        
        echo json_encode(['sucesso' => true, 'mensagem' => 'Contato deletado com sucesso']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['sucesso' => false, 'mensagem' => 'Erro ao deletar contato: ' . $e->getMessage()]);
    }
}