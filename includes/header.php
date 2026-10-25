<?php
/**
 * Shared page head. Include at the top of every page:
 *
 *   $pageTitle   = 'Search Rooms';        // optional
 *   $pageId      = 'search-rooms';        // selects the page module in assets/js
 *   $pageScripts = ['booking.js'];        // optional, files in assets/js/
 *   $pageRole    = 'admin';               // optional, audience hint for the demo
 *   require __DIR__ . '/../includes/header.php';
 *
 * assets/css/global.css is the ONLY stylesheet loaded by the site. Page-level
 * styles live in global.css, scoped under a page class.
 *
 * BACKEND INTEGRATION: start the PHP session and resolve the signed-in user
 * here (e.g. require includes/auth.php), then expose the role to navbar.php
 * instead of the demo session handled in assets/js/main.js.
 */

// Relative path from the requesting page to the project root, so assets
// resolve both for root pages (index.php) and subfolder pages (admin/*.php).
$projectRoot = realpath(__DIR__ . '/..');
$scriptDir   = realpath(dirname($_SERVER['SCRIPT_FILENAME']));
$relative    = trim(substr($scriptDir, strlen($projectRoot)), DIRECTORY_SEPARATOR);
$depth       = $relative === '' ? 0 : substr_count($relative, DIRECTORY_SEPARATOR) + 1;
$baseUrl     = str_repeat('../', $depth);

$pageTitle   = isset($pageTitle) ? $pageTitle . ' | Aurelia Grand Hotel' : 'Aurelia Grand Hotel';
$pageId      = $pageId ?? '';
$pageScripts = $pageScripts ?? [];
$pageRole    = $pageRole ?? '';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Aurelia Grand Hotel room reservation system (frontend prototype).">
    <title><?= htmlspecialchars($pageTitle) ?></title>
    <link rel="icon" type="image/svg+xml" href="<?= $baseUrl ?>assets/favicon.svg">
    <link rel="stylesheet" href="<?= $baseUrl ?>assets/css/global.css">
</head>
<body data-page="<?= htmlspecialchars($pageId) ?>" data-role="<?= htmlspecialchars($pageRole) ?>" data-base-url="<?= $baseUrl ?>">
    <a class="skip-link" href="#main">Skip to content</a>
<?php require __DIR__ . '/navbar.php'; ?>
