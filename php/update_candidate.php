<?php
// Archivo para actualizar un candidato existente

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

// Obtener datos del formulario
$candidateId = $_POST['id_candidato'];
$nombre = $_POST['nombre'];
$apellidos = $_POST['apellidos'];
$candidatura = $_POST['candidatura'];
$cargo = $_POST['cargo'];
$numero_lista = $_POST['numero_lista'] ?: null;

// Verificar mantener foto actual
$mantenerFoto = isset($_POST['mantener_foto']) && $_POST['mantener_foto'] === '1';
$fotoActual = null;

// Verificar mantener documento actual
$mantenerDocumento = isset($_POST['mantener_documento']) && $_POST['mantener_documento'] === '1';

// Iniciar transacción
$pdo->beginTransaction();

try {
    // Primero, obtener la foto actual si se necesita mantener
    if ($mantenerFoto) {
        $sqlFoto = "SELECT foto FROM candidatos WHERE id_candidato = :id";
        $stmtFoto = $pdo->prepare($sqlFoto);
        $stmtFoto->bindParam(':id', $candidateId, PDO::PARAM_INT);
        $stmtFoto->execute();
        $result = $stmtFoto->fetch();
        $fotoActual = $result['foto'];
    }

    // Manejar la carga de la nueva foto si hay una
    $fotoNombre = $fotoActual;
    if (isset($_FILES['foto']) && $_FILES['foto']['error'] === UPLOAD_ERR_OK && !$mantenerFoto) {
        $fotoTmp = $_FILES['foto']['tmp_name'];
        $fotoNombre = time() . '_' . $_FILES['foto']['name'];
        $fotoDestino = '../uploads/fotos/' . $fotoNombre;
        
        // Crear directorio si no existe
        if (!is_dir('../uploads/fotos/')) {
            mkdir('../uploads/fotos/', 0777, true);
        }
        
        // Mover archivo subido al destino
        if (move_uploaded_file($fotoTmp, $fotoDestino)) {
            // Si hay una foto anterior y no se mantiene, eliminarla
            if ($fotoActual && !$mantenerFoto) {
                $rutaFotoAnterior = '../uploads/fotos/' . $fotoActual;
                if (file_exists($rutaFotoAnterior)) {
                    unlink($rutaFotoAnterior);
                }
            }
        } else {
            throw new Exception('Error al guardar la foto');
        }
    }

    // Actualizar datos del candidato
    $sql = "UPDATE candidatos SET 
                nombre = :nombre, 
                apellidos = :apellidos, 
                id_candidatura = :candidatura, 
                id_cargo = :cargo, 
                numero_lista = :numero_lista";
    
    // Agregar foto a la consulta solo si hay una nueva o se mantiene la actual
    if ($fotoNombre !== null) {
        $sql .= ", foto = :foto";
    }
    
    $sql .= " WHERE id_candidato = :id";
    
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':nombre', $nombre);
    $stmt->bindParam(':apellidos', $apellidos);
    $stmt->bindParam(':candidatura', $candidatura);
    $stmt->bindParam(':cargo', $cargo);
    $stmt->bindParam(':numero_lista', $numero_lista);
    $stmt->bindParam(':id', $candidateId, PDO::PARAM_INT);
    
    if ($fotoNombre !== null) {
        $stmt->bindParam(':foto', $fotoNombre);
    }
    
    $stmt->execute();

    // Manejar la carga del nuevo documento si hay uno
    if (isset($_FILES['documento']) && $_FILES['documento']['error'] === UPLOAD_ERR_OK && !$mantenerDocumento) {
        $docTmp = $_FILES['documento']['tmp_name'];
        $docNombre = time() . '_' . $_FILES['documento']['name'];
        $docDestino = '../uploads/documentos/' . $docNombre;
        
        // Crear directorio si no existe
        if (!is_dir('../uploads/documentos/')) {
            mkdir('../uploads/documentos/', 0777, true);
        }
        
        // Mover archivo subido al destino
        if (move_uploaded_file($docTmp, $docDestino)) {
            // Si no se mantiene el documento actual, eliminar los documentos anteriores
            if (!$mantenerDocumento) {
                // Obtener documentos actuales
                $sqlDocsActuales = "SELECT ruta FROM documentos WHERE id_candidato = :id";
                $stmtDocsActuales = $pdo->prepare($sqlDocsActuales);
                $stmtDocsActuales->bindParam(':id', $candidateId, PDO::PARAM_INT);
                $stmtDocsActuales->execute();
                $docsActuales = $stmtDocsActuales->fetchAll();
                
                // Eliminar archivos físicos
                foreach ($docsActuales as $doc) {
                    $rutaDocAnterior = '../uploads/documentos/' . $doc['ruta'];
                    if (file_exists($rutaDocAnterior)) {
                        unlink($rutaDocAnterior);
                    }
                }
                
                // Eliminar registros de la base de datos
                $sqlDeleteDocs = "DELETE FROM documentos WHERE id_candidato = :id";
                $stmtDeleteDocs = $pdo->prepare($sqlDeleteDocs);
                $stmtDeleteDocs->bindParam(':id', $candidateId, PDO::PARAM_INT);
                $stmtDeleteDocs->execute();
            }
            
            // Insertar nuevo documento
            $sqlInsertDoc = "INSERT INTO documentos (id_candidato, titulo, ruta, tipo) 
                             VALUES (:id, :titulo, :ruta, :tipo)";
            $stmtInsertDoc = $pdo->prepare($sqlInsertDoc);
            $stmtInsertDoc->bindParam(':id', $candidateId, PDO::PARAM_INT);
            $stmtInsertDoc->bindParam(':titulo', $_FILES['documento']['name']);
            $stmtInsertDoc->bindParam(':ruta', $docNombre);
            $stmtInsertDoc->bindParam(':tipo', $_FILES['documento']['type']);
            $stmtInsertDoc->execute();
        } else {
            throw new Exception('Error al guardar el documento');
        }
    }

    // Confirmar transacción
    $pdo->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Candidato actualizado correctamente'
    ]);
    
} catch (Exception $e) {
    // Revertir cambios en caso de error
    $pdo->rollBack();
    
    echo json_encode([
        'success' => false,
        'message' => 'Error al actualizar candidato: ' . $e->getMessage()
    ]);
}