<?php
/**
 * Shared page head. Include at the top of every page:
 *
 *   $pageTitle   = 'Search Rooms';        // optional
 *   $pageId      = 'search-rooms';        // selects the page module in assets/js
 *   $pageScripts = ['booking.js'];        // optional, files in assets/js/
 *   $pageRoles   = 'staff,admin';         // optional, roles allowed ('' = public)
 *   require __DIR__ . '/../includes/header.php';
 *
 * assets/css/global.css is the ONLY stylesheet loaded by the site. Page-level
 * styles live in global.css, scoped under a page class.
 *
 * BACKEND INTEGRATION: start the PHP session and resolve the signed-in user
 * here (e.g. require includes/auth.php). If the user's role is not in
 * $pageRoles, redirect (header('Location: ...')) BEFORE any output — the
 * demo guard in assets/js/main.js is not access control.
 */

// Relative path from the requesting page to the project root, so assets
// resolve both for root pages (index.php) and subfolder pages (admin/*.php).
$projectRoot = realpath(__DIR__ . '/..');
$scriptDir   = realpath(dirname($_SERVER['SCRIPT_FILENAME']));
$relative    = trim(substr($scriptDir, strlen($projectRoot)), DIRECTORY_SEPARATOR);
$depth       = $relative === '' ? 0 : substr_count($relative, DIRECTORY_SEPARATOR) + 1;
$baseUrl     = str_repeat('../', $depth);

$siteName    = 'The Developers Hotel';
$pageTitle   = isset($pageTitle) ? $pageTitle . ' | ' . $siteName : $siteName;
$pageId      = $pageId ?? '';
$pageScripts = $pageScripts ?? [];
$pageRoles   = $pageRoles ?? '';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="<?= htmlspecialchars($siteName) ?> — room reservation system (frontend prototype).">
    <meta name="application-name" content="<?= htmlspecialchars($siteName) ?>">
    <meta name="theme-color" content="#1f3a5f">
    <title><?= htmlspecialchars($pageTitle) ?></title>
    <link rel="icon" type="image/svg+xml" href="<?= $baseUrl ?>assets/favicon.svg">
    <link rel="icon" type="image/png" sizes="32x32" href="<?= $baseUrl ?>assets/images/brand/favicon-32.png">
    <link rel="apple-touch-icon" href="<?= $baseUrl ?>assets/images/brand/apple-touch-icon.png">
    <link rel="stylesheet" href="<?= $baseUrl ?>assets/css/global.css">
</head>
<body data-page="<?= htmlspecialchars($pageId) ?>" data-roles="<?= htmlspecialchars($pageRoles) ?>" data-base-url="<?= $baseUrl ?>">
    <a class="skip-link" href="#main">Skip to content</a>
<?php require __DIR__ . '/navbar.php'; ?>
