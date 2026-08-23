<?php
/* ══════════════════════════════════════════════════════════════════════════
   MyBazzar — mahsulot rasmini yuklash

   Nega PHP: serverda php8.1-fpm allaqachon ishlab turibdi (bekbags loyihasi
   uchun). Faqat rasm yuklash uchun yangi xizmat ko'tarish ortiqcha bo'lardi.

   Rasm brauzerda kichraytirilib yuboriladi (canvas orqali, ~1200px JPEG),
   shuning uchun bu yerda GD kerak emas — serverda u o'rnatilmagan ham.

   Xavfsizlik:
   · JWT imzosi tekshiriladi — ilovadan kelmagan so'rov rad etiladi
   · MIME tur fayl mazmunidan aniqlanadi, kengaytmaga ishonilmaydi
   · Faqat jpeg/png/webp qabul qilinadi
   · Fayl nomi tasodifiy — foydalanuvchi bergan nom ishlatilmaydi
   · Papka nginx tomonidan faqat statik sifatida beriladi (PHP bajarilmaydi)
   ══════════════════════════════════════════════════════════════════════ */

declare(strict_types=1);

const UPLOAD_DIR   = '/var/www/mybazzar-uploads';
const MAX_BYTES    = 2 * 1024 * 1024;          // 2 MB — php.ini bilan bir xil
const ALLOWED      = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];

header('Content-Type: application/json; charset=utf-8');

function fail(int $code, string $msg): never {
    http_response_code($code);
    echo json_encode(['error' => $msg], JSON_UNESCAPED_UNICODE);
    exit;
}

/* ── JWT (HS256) imzosini tekshirish ─────────────────────────────────── */
function b64url_decode(string $s): string {
    return base64_decode(strtr($s, '-_', '+/') . str_repeat('=', (4 - strlen($s) % 4) % 4));
}

function verify_jwt(string $token, string $secret): bool {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return false;
    [$h, $p, $sig] = $parts;

    $expected = hash_hmac('sha256', "$h.$p", $secret, true);
    if (!hash_equals($expected, b64url_decode($sig))) return false;

    $payload = json_decode(b64url_decode($p), true);
    if (!is_array($payload)) return false;
    if (isset($payload['exp']) && time() >= (int)$payload['exp']) return false;
    return true;
}

/* ── Kirish tekshiruvi ───────────────────────────────────────────────── */
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    fail(405, 'Faqat POST');
}

/* Maxfiy kalit yonidagi faylda: 640 root:www-data — faqat PHP o'qiy oladi */
$secretFile = __DIR__ . '/secret.php';
$secret = is_readable($secretFile) ? (string)(require $secretFile) : '';
if ($secret === '') fail(500, 'Server sozlanmagan');

$auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
if (!preg_match('/^Bearer\s+(\S+)$/i', $auth, $mm) || !verify_jwt($mm[1], $secret)) {
    fail(401, 'Ruxsat yo\'q');
}

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    $code = $_FILES['file']['error'] ?? -1;
    fail(400, $code === UPLOAD_ERR_INI_SIZE || $code === UPLOAD_ERR_FORM_SIZE
        ? 'Rasm juda katta (maks 2 MB)'
        : 'Fayl yuborilmadi');
}

$tmp = $_FILES['file']['tmp_name'];
if (filesize($tmp) > MAX_BYTES) fail(400, 'Rasm juda katta (maks 2 MB)');

/* Turni fayl mazmunidan aniqlaymiz — kengaytmaga ishonmaymiz */
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime  = $finfo->file($tmp) ?: '';
if (!isset(ALLOWED[$mime])) fail(415, 'Faqat JPEG, PNG yoki WEBP');

/* Haqiqatan rasmligini tasdiqlaymiz */
if (@getimagesize($tmp) === false) fail(415, 'Fayl rasm emas');

if (!is_dir(UPLOAD_DIR) && !mkdir(UPLOAD_DIR, 0755, true)) {
    fail(500, 'Papka yaratilmadi');
}

$name = bin2hex(random_bytes(16)) . '.' . ALLOWED[$mime];
if (!move_uploaded_file($tmp, UPLOAD_DIR . '/' . $name)) {
    fail(500, 'Saqlanmadi');
}
chmod(UPLOAD_DIR . '/' . $name, 0644);

echo json_encode(['url' => '/uploads/' . $name], JSON_UNESCAPED_UNICODE);
