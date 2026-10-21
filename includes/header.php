<?php
/**
 * Shared page head. Include at the top of every page:
 *
 *   $pageTitle  = 'Search Rooms';          // optional
 *   $pageStyles = ['booking.css'];         // optional, files in assets/css/
 *   require __DIR__ . '/../includes/header.php';
 *
 * global.css is always loaded first; page stylesheets load after it and
 * should only contain page-scoped exceptions.
 */

// Relative path from the requesting page to the project root, so assets
// resolve both for root pages (index.php) and subfolder pages (admin/*.php).
$projectRoot = realpath(__DIR__ . '/..');
$scriptDir   = realpath(dirname($_SERVER['SCRIPT_FILENAME']));
$relative    = trim(substr($scriptDir, strlen($projectRoot)), DIRECTORY_SEPARATOR);
$depth       = $relative === '' ? 0 : substr_count($relative, DIRECTORY_SEPARATOR) + 1;
$baseUrl     = str_repeat('../', $depth);

$pageTitle  = isset($pageTitle) ? $pageTitle . ' | Hotel Reservation' : 'Hotel Reservation';
$pageStyles = $pageStyles ?? [];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?= htmlspecialchars($pageTitle) ?></title>
    <link rel="stylesheet" href="<?= $baseUrl ?>assets/css/global.css">
<?php foreach ($pageStyles as $stylesheet): ?>
    <link rel="stylesheet" href="<?= $baseUrl ?>assets/css/<?= htmlspecialchars($stylesheet) ?>">
<?php endforeach; ?>
</head>
<body>
    <a class="skip-link" href="#main">Skip to content</a>
