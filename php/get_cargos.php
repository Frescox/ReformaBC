<?php

include('connection.php');

// Establecer el conjunto de caracteres
$conn->set_charset("utf8");

// Verificar si se ha proporcionado un ID de candidatura
if(isset($_GET['candidatura_id']) && !empty($_GET['candidatura_id'])) {
    // Sanitizar entrada
    $candidatura_id = $conn->real_escape_string($_GET['candidatura_id']);
    
    // Consulta para obtener los cargos relacionados con la candidatura
    $sql = "SELECT id_cargo, nombre FROM cargos WHERE id_candidatura = ? ORDER BY nombre";
    
    // Preparar la consulta
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $candidatura_id);
    $stmt->execute();
    
    // Obtener resultados
    $resultado = $stmt->get_result();
    $cargos = [];
    
    while($fila = $resultado->fetch_assoc()) {
        $cargos[] = $fila;
    }
    
    // Cerrar la sentencia y la conexión
    $stmt->close();
    $conn->close();
    
    // Devolver resultados como JSON
    header('Content-Type: application/json');
    echo json_encode($cargos);
} else {
    // Si no se proporciona un ID de candidatura, devolver un error
    header('Content-Type: application/json');
    echo json_encode(['error' => 'No se proporcionó un ID de candidatura válido']);
}
?>