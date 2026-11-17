
<?php
require_once __DIR__ . '/config/database.php';

try {
    $result = $pdo->query("SELECT DATABASE()")->fetchColumn();

    echo "Database Connected Successfully!";
    echo "<br>Connected Database: " . htmlspecialchars($result);
} catch (PDOException $e) {
    echo "Connection Test Failed: " . htmlspecialchars($e->getMessage());
}
