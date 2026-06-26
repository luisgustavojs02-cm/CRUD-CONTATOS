<?php
// Configuracoes de conexao com o banco de dados
// Estas sao as informacoes que o PHP usa para 'entrar' no MySQL
$host = 'localhost'; // endereco do servidor MySQL
$usuario = 'root'; // usuario (padrao do XAMPP)
$senha = ''; // senha (padrao do XAMPP e vazia)
$banco = 'agenda'; // nome do banco que criamos

// Cria a conexao usando mysqli (MySQL Improved)
$conexao = new mysqli($host, $usuario, $senha, $banco);

// Verifica se houve erro na conexao
if ($conexao->connect_error) {
    // Se der erro, para tudo e mostra a mensagem
    die(json_encode([
        'sucesso' => false,
        'mensagem' => 'Erro de conexao: ' . $conexao->connect_error
    ]));
}

// Define que o PHP vai usar UTF-8 para acentos funcionarem
$conexao->set_charset('utf8mb4');
?>
