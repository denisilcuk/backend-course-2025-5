// index.js
const http = require('http');
const fs = require('fs');
const path = require('path');
const { program } = require('commander');

// --- Налаштування параметрів командного рядка ---
program
  .requiredOption('-h, --host <string>', 'Адреса сервера (обовʼязково)')
  .requiredOption('-p, --port <number>', 'Порт сервера (обовʼязково)')
  .requiredOption('-c, --cache <path>', 'Шлях до директорії для кешу (обовʼязково)');

program.parse(process.argv);

const options = program.opts();

// --- Перевірка існування директорії кешу ---
const cacheDir = path.resolve(options.cache);
if (!fs.existsSync(cacheDir)) {
  console.log(`📁 Директорії "${cacheDir}" не існує. Створюємо...`);
  fs.mkdirSync(cacheDir, { recursive: true });
  console.log('✅ Директорію створено.');
}

// --- Створення HTTP-сервера ---
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Сервер працює успішно 🚀');
});

// --- Запуск сервера ---
server.listen(options.port, options.host, () => {
  console.log(`🌐 Сервер запущено за адресою: http://${options.host}:${options.port}`);
  console.log(`📂 Кеш директорія: ${cacheDir}`);
});
