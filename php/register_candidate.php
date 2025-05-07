<?php

include('connection.php');

// Establecer el conjunto de caracteres
$conn->set_charset("utf8");

// Comprobar si se ha enviado el formulario
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Iniciar transacción
    $conn->begin_transaction();
    
    try {
        // Sanitizar y validar datos básicos del candidato
        $nombre = $conn->real_escape_string($_POST['nombre']);
        $apellidos = $conn->real_escape_string($_POST['apellidos']);
        $id_candidatura = $conn->real_escape_string($_POST['candidatura']);
        $id_cargo = $conn->real_escape_string($_POST['cargo']);
        $numero_lista = !empty($_POST['numero_lista']) ? $conn->real_escape_string($_POST['numero_lista']) : NULL;
        $popularidad = '50';
        
        // Verificar si ya existe un candidato con el mismo número de lista para el mismo cargo
        if ($numero_lista !== NULL) {
            $sql_verificar = "SELECT id_candidato FROM candidatos WHERE id_cargo = ? AND numero_lista = ? AND id_candidatura = ?";
            $stmt_verificar = $conn->prepare($sql_verificar);
            $stmt_verificar->bind_param("ids", $id_cargo, $numero_lista, $id_candidatura);
            $stmt_verificar->execute();
            $resultado = $stmt_verificar->get_result();
            
            if ($resultado->num_rows > 0) {
                throw new Exception('Ya existe un candidato con el número de lista ' . $numero_lista . ' para este cargo en esta candidatura.');
            }
            
            $stmt_verificar->close();
        }
        
        // Carpetas para almacenar archivos
        $directorio_fotos = '../uploads/fotos/';
        $directorio_documentos = '../uploads/documentos/';
        
        // Crear los directorios si no existen
        if (!file_exists($directorio_fotos)) {
            mkdir($directorio_fotos, 0777, true);
        }
        
        if (!file_exists($directorio_documentos)) {
            mkdir($directorio_documentos, 0777, true);
        }
        
        // Procesar la foto
        $foto_url = NULL;
        if (isset($_FILES['foto']) && $_FILES['foto']['error'] == 0) {
            $foto_nombre = time() . '_' . basename($_FILES['foto']['name']);
            $foto_destino = $directorio_fotos . $foto_nombre;
            
            // Verificar que sea una imagen
            $check = getimagesize($_FILES['foto']['tmp_name']);
            if ($check === false) {
                throw new Exception('El archivo no es una imagen válida.');
            }
            
            // Mover la imagen al directorio
            if (move_uploaded_file($_FILES['foto']['tmp_name'], $foto_destino)) {
                $foto_url = 'uploads/fotos/' . $foto_nombre;
            } else {
                throw new Exception('Error al subir la fotografía.');
            }
        }
        
        // Insertar datos del candidato
        $sql_candidato = "INSERT INTO candidatos (nombre, apellidos, id_candidatura, id_cargo, numero_lista, popularidad, foto_url) 
                          VALUES (?, ?, ?, ?, ?, ?, ?)";
        
        $stmt_candidato = $conn->prepare($sql_candidato);
        $stmt_candidato->bind_param("ssiidss", $nombre, $apellidos, $id_candidatura, $id_cargo, $numero_lista, $popularidad, $foto_url);
        
        if (!$stmt_candidato->execute()) {
            throw new Exception('Error al guardar los datos del candidato: ' . $stmt_candidato->error);
        }
        
        $id_candidato = $conn->insert_id;
        $stmt_candidato->close();
        
        // Procesar el documento si se ha subido
        if (isset($_FILES['documento']) && $_FILES['documento']['error'] == 0) {
            $doc_nombre = time() . '_' . basename($_FILES['documento']['name']);
            $doc_destino = $directorio_documentos . $doc_nombre;

            // Verificar que sea un PDF, PNG o JPG
            $finfo = new finfo(FILEINFO_MIME_TYPE);
            $mime_type = $finfo->file($_FILES['documento']['tmp_name']);

            $tipos_validos = ['application/pdf', 'image/png', 'image/jpeg'];
            if (!in_array($mime_type, $tipos_validos)) {
                throw new Exception('El archivo debe ser un PDF, PNG o JPG válido.');
            }

            // Mover el archivo al directorio
            if (move_uploaded_file($_FILES['documento']['tmp_name'], $doc_destino)) {
                $doc_url = 'uploads/documentos/' . $doc_nombre;

                // Determinar tipo de documento según MIME
                switch ($mime_type) {
                    case 'application/pdf':
                        $tipo_documento = 'CV';
                        break;
                    case 'image/png':
                    case 'image/jpeg':
                        $tipo_documento = 'Imagen';
                        break;
                }

                // Insertar referencia del documento en la base de datos
                $sql_documento = "INSERT INTO documentos_candidato (id_candidato, titulo, archivo_url, tipo_documento) 
                                VALUES (?, ?, ?, ?)";
                
                $titulo_doc = "$tipo_documento - " . $nombre . " " . $apellidos;

                $stmt_documento = $conn->prepare($sql_documento);
                $stmt_documento->bind_param("isss", $id_candidato, $titulo_doc, $doc_url, $tipo_documento);

                if (!$stmt_documento->execute()) {
                    throw new Exception('Error al guardar el documento: ' . $stmt_documento->error);
                }

                $stmt_documento->close();
            } else {
                throw new Exception('Error al subir el archivo.');
            }
        }
        
        // Confirmar transacción
        $conn->commit();
        
        // Responder con éxito
        header('Content-Type: application/json');
        echo json_encode(['success' => true, 'message' => 'Candidato registrado correctamente']);
        
    } catch (Exception $e) {
        // Revertir transacción en caso de error
        $conn->rollback();
        
        // Responder con error
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    
    // Cerrar conexión
    $conn->close();
} else {
    // Si no es una solicitud POST
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Método de solicitud no válido']);
}
?>