<?php
// Archivo para obtener un candidato específico por ID

// Incluir archivo de conexión
include('connection.php');

header('Content-Type: application/json');

// Verificar que se haya proporcionado un ID
if (!isset($_GET['id']) || empty($_GET['id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'ID de candidato no proporcionado'
    ]);
    exit;
}

$candidateId = $_GET['id'];

try {
    // Consulta para obtener los datos del candidato
    $sql = "SELECT c.*, cg.nombre as cargo_nombre
            FROM candidatos c 
            LEFT JOIN cargos cg ON c.id_cargo = cg.id_cargo
            WHERE c.id_candidato = :id";
    
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':id', $candidateId, PDO::PARAM_INT);
    $stmt->execute();
    
    $candidate = $stmt->fetch();
    
    if (!$candidate) {
        echo json_encode([
            'success' => false,
            'message' => 'Candidato no encontrado'
        ]);
        exit;
    }
    
    // Obtener documentos del candidato si existen
    $sqlDocs = "SELECT * FROM documentos WHERE id_candidato = :id";
    $stmtDocs = $pdo->prepare($sqlDocs);
    $stmtDocs->bindParam(':id', $candidateId, PDO::PARAM_INT);
    $stmtDocs->execute();
    
    $documents = $stmtDocs->fetchAll();
    
    // Agregar la URL de la foto si existe
    if (!empty($candidate['foto']) && $candidate['foto'] !== 'null') {
        $candidate['foto_url'] = '../uploads/fotos/' . $candidate['foto'];
    } else {
        $candidate['foto_url'] = null;
    }
    
    // Agregar los documentos al resultado
    $candidate['documentos'] = $documents;
    
    // Convertir el resultado a JSON y enviarlo
    echo json_encode($candidate);
    
} catch (PDOException $e) {
    // En caso de error, devolver mensaje de error
    echo json_encode([
        'success' => false,
        'message' => 'Error al obtener datos del candidato: ' . $e->getMessage()
    ]);
}