<?php
// Incluir archivo de conexión
include('connection.php');

// Establecer el conjunto de caracteres
$conn->set_charset("utf8");

// Cabeceras para permitir CORS y especificar tipo de contenido JSON
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Función para obtener todos los candidatos con su información completa
function getAllCandidates($conn) {
    $result = array();
    
    $query = "SELECT c.*, cg.nombre AS cargo, ca.nombre AS candidatura, ca.color
              FROM candidatos c
              LEFT JOIN cargos cg ON c.id_cargo = cg.id_cargo
              LEFT JOIN candidaturas ca ON c.id_candidatura = ca.id_candidatura
              ORDER BY c.numero_lista ASC";
    
    $stmt = $conn->prepare($query);
    
    if ($stmt) {
        $stmt->execute();
        $candidates_result = $stmt->get_result();
        
        while ($candidate = $candidates_result->fetch_assoc()) {
            $docs_query = "SELECT * FROM documentos_candidato WHERE id_candidato = ?";
            $docs_stmt = $conn->prepare($docs_query);
            $docs_stmt->bind_param("i", $candidate['id_candidato']);
            $docs_stmt->execute();
            $docs_result = $docs_stmt->get_result();
            $documents = array();
            while ($doc = $docs_result->fetch_assoc()) {
                $documents[] = $doc;
            }
            $candidate['documentos'] = $documents;
            if (!empty($candidate['foto_url'])) {
                if (strpos($candidate['foto_url'], 'http') !== 0) {
                    $candidate['foto_url'] = $candidate['foto_url'];
                }
            } else {
                $candidate['foto_url'] = 'resources/default_profile.png';
            }
            $result[] = $candidate;
        }
        $stmt->close();
    } else {
        $result = ["error" => $conn->error];
    }
    return $result;
}

function getCandidatesByType($conn, $tipo_candidatura) {
    $result = array();
    
    $query = "SELECT c.*, cg.nombre AS cargo, ca.nombre AS candidatura, ca.color
              FROM candidatos c
              LEFT JOIN cargos cg ON c.id_cargo = cg.id_cargo
              LEFT JOIN candidaturas ca ON c.id_candidatura = ca.id_candidatura
              WHERE c.id_candidatura = ?
              ORDER BY c.numero_lista, c.nombre";
              
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $tipo_candidatura);
    
    if ($stmt) {
        $stmt->execute();
        $candidates_result = $stmt->get_result();
        
        while ($candidate = $candidates_result->fetch_assoc()) {
            $docs_query = "SELECT * FROM documentos_candidato WHERE id_candidato = ?";
            $docs_stmt = $conn->prepare($docs_query);
            $docs_stmt->bind_param("i", $candidate['id_candidato']);
            $docs_stmt->execute();
            $docs_result = $docs_stmt->get_result();
            $documents = array();
            while ($doc = $docs_result->fetch_assoc()) {
                $documents[] = $doc;
            }
            $candidate['documentos'] = $documents;
            if (!empty($candidate['foto_url'])) {
                if (strpos($candidate['foto_url'], 'http') !== 0) {
                    $candidate['foto_url'] = $candidate['foto_url'];
                }
            } else {
                $candidate['foto_url'] = 'resources/default_profile.png';
            }
            $result[] = $candidate;
        }
        $stmt->close();
    } else {
        $result = ["error" => $conn->error];
    }
    return $result;
}

function getCandidatesByCargo($conn, $id_cargo) {
    $result = array();
    
    $query = "SELECT c.*, cg.nombre AS cargo, ca.nombre AS candidatura, ca.color
              FROM candidatos c
              LEFT JOIN cargos cg ON c.id_cargo = cg.id_cargo
              LEFT JOIN candidaturas ca ON c.id_candidatura = ca.id_candidatura
              WHERE c.id_cargo = ?
              ORDER BY c.numero_lista, c.nombre";
              
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $id_cargo);
    
    if ($stmt) {
        $stmt->execute();
        $candidates_result = $stmt->get_result();
        
        while ($candidate = $candidates_result->fetch_assoc()) {
            $docs_query = "SELECT * FROM documentos_candidato WHERE id_candidato = ?";
            $docs_stmt = $conn->prepare($docs_query);
            $docs_stmt->bind_param("i", $candidate['id_candidato']);
            $docs_stmt->execute();
            $docs_result = $docs_stmt->get_result();
            $documents = array();
            while ($doc = $docs_result->fetch_assoc()) {
                $documents[] = $doc;
            }
            $candidate['documentos'] = $documents;
            if (!empty($candidate['foto_url'])) {
                if (strpos($candidate['foto_url'], 'http') !== 0) {
                    $candidate['foto_url'] = $candidate['foto_url'];
                }
            } else {
                $candidate['foto_url'] = 'resources/default_profile.png';
            }
            $result[] = $candidate;
        }
        $stmt->close();
    } else {
        $result = ["error" => $conn->error];
    }
    return $result;
}

// Procesar la solicitud según los parámetros recibidos
$response = array();

if (isset($_GET['id_candidatura'])) {
    $id_candidatura = $conn->real_escape_string($_GET['id_candidatura']);
    $response = getCandidatesByType($conn, $id_candidatura);
} elseif (isset($_GET['id_cargo'])) {
    $id_cargo = $conn->real_escape_string($_GET['id_cargo']);
    $response = getCandidatesByCargo($conn, $id_cargo);
} elseif (isset($_GET['id_candidato'])) {
    $id_candidato = $conn->real_escape_string($_GET['id_candidato']);

    $query = "SELECT c.*, cg.nombre AS cargo, ca.nombre AS candidatura, ca.color
              FROM candidatos c
              LEFT JOIN cargos cg ON c.id_cargo = cg.id_cargo
              LEFT JOIN candidaturas ca ON c.id_candidatura = ca.id_candidatura
              WHERE c.id_candidato = ?";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $id_candidato);
    if ($stmt) {
        $stmt->execute();
        $candidate_result = $stmt->get_result();
        if ($candidate = $candidate_result->fetch_assoc()) {
            $docs_query = "SELECT * FROM documentos_candidato WHERE id_candidato = ?";
            $docs_stmt = $conn->prepare($docs_query);
            $docs_stmt->bind_param("i", $candidate['id_candidato']);
            $docs_stmt->execute();
            $docs_result = $docs_stmt->get_result();
            $documents = array();
            while ($doc = $docs_result->fetch_assoc()) {
                $documents[] = $doc;
            }
            $candidate['documentos'] = $documents;
            if (!empty($candidate['foto_url'])) {
                if (strpos($candidate['foto_url'], 'http') !== 0) {
                    $candidate['foto_url'] = $candidate['foto_url'];
                }
            } else {
                $candidate['foto_url'] = 'resources/default_profile.png';
            }
            $response = $candidate;
        } else {
            $response = ["error" => "Candidato no encontrado"];
        }
        $stmt->close();
    } else {
        $response = ["error" => $conn->error];
    }
} else {
    $response = getAllCandidates($conn);
}

// Devolver respuesta en formato JSON
echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
?>
