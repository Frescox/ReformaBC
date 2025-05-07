<?php
// Parámetros de conexión a la base de datos
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "eleccion_judicial_2025";

// Crear conexión
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar conexión
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}

// Establece el juego de caracteres a UTF-8
$conn->set_charset("utf8");
?>