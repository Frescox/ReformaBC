<?php
// Archivo para eliminar un candidato

// Incluir archivo de conexión
include('connection.php');

header('Content-Type: application/json');

// Verificar que se haya proporcionado un ID
if (!isset($_POST['id_candidato']) || empty($_POST['id_candidato'])) {
    echo json_encode([
        'success' => false,
        'message' => 'ID de candidato no proporcionado'
    ]);
    exit;
}

$candidateId = $_POST['id_candidato'];

// Iniciar transacción
$pdo->beginTransaction();

try {
    // Primero, obtener los datos del candidato para eliminar los archivos físicos
    $sqlCandidato = "SELECT foto FROM candidatos WHERE id_candidato = :id";
    $stmtCandidato = $pdo->prepare($sqlCandidato);
    $stmtCandidato->bindParam(':id', $candidateId, PDO::PARAM_INT);
    $stmtCandidato->execute();
    
    $candidato = $stmtCandidato->fetch();
    
    // Obtener documentos del candidato
    $sqlDocs = "SELECT ruta FROM documentos WHERE id_candidato = :id";
    $stmtDocs = $pdo->prepare($sqlDocs);
    $stmtDocs->bindParam(':id', $candidateId, PDO::PARAM_INT);
    $stmtDocs->execute();
    
    $documentos = $stmtDocs->fetchAll();
    
    // Eliminar los documentos de la base de datos
    $sqlDeleteDocs = "DELETE FROM documentos WHERE id_candidato = :id";
    $stmtDeleteDocs = $pdo->prepare($sqlDeleteDocs);
    $stmtDeleteDocs->bindParam(':id', $candidateId, PDO::PARAM_INT);
    $stmtDeleteDocs->execute();
    
    // Eliminar el candidato
    $sqlDeleteCandidato = "DELETE FROM candidatos WHERE id_candidato = :id";
    $stmtDeleteCandidato = $pdo->prepare($sqlDeleteCandidato);
    $stmtDeleteCandidato->bindParam(':id', $candidateId, PDO::PARAM_INT);
    $stmtDeleteCandidato->execute();
    
    // Confirmar transacción
    $pdo->commit();
    
    // Eliminar archivos físicos después de confirmar la transacción
    // Eliminar la foto si existe
    if (!empty($candidato['foto']) && $candidato['foto'] !== 'null') {
        $rutaFoto = '../uploads/fotos/' . $candidato['foto'];
        if (file_exists($rutaFoto)) {
            unlink($rutaFoto);
        }
    }
    
    // Eliminar los documentos físicos
    foreach ($documentos as $doc) {
        $rutaDoc = '../uploads/documentos/' . $doc['ruta'];
        if (file_exists($rutaDoc)) {
            unlink($rutaDoc);
        }
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Candidato eliminado correctamente'
    ]);
    
} catch (Exception $e) {
    // Revertir cambios en caso de error
    $pdo->rollBack();
    
    echo json_encode([
        'success' => false,
        'message' => 'Error al eliminar candidato: ' . $e->getMessage()
    ]);
}