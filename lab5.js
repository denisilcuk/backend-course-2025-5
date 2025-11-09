// index.js
const http = require('http');
const fs = require('fs');
const path = require('path');
const { program } = require('commander');

// === 1. Командні параметри ===
program
  .requiredOption('-h, --host <string>', 'Адреса сервера')
  .requiredOption('-p, --port <number>', 'Порт сервера')
  .requiredOption('-c, --cache <path>', 'Шлях до директорії кешу');

program.parse(process.argv);
const options = program.opts();

// === 2. Підготовка кеш-директорії ===
const cacheDir = path.resolve(options.cache);
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
  console.log(`✅ Створено директорію кешу: ${cacheDir}`);
}

// === 3. Основна логіка сервера ===
const server = http.createServer(async (req, res) => {
  const urlPath = req.url; // наприклад "/200"
  const method = req.method;

  // Ігноруємо запити, що не відповідають формату "/<код>"
  if (!/^\/\d+$/.test(urlPath)) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('❌ Некоректний шлях. Використовуйте формат /<HTTP-код>');
    return;
  }

  const code = urlPath.slice(1); // "200"
  const filePath = path.join(cacheDir, `${code}.jpg`);

  try {
    switch (method) {
      // ===== GET =====
      case 'GET': {
        try {
          const data = await fs.promises.readFile(filePath);
          res.writeHead(200, { 'Content-Type': 'image/jpeg' });
          res.end(data);
        } catch {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end(`❌ Файл для коду ${code} не знайдено`);
        }
        break;
      }

      // ===== PUT =====
      case 'PUT': {
        let body = [];
        req.on('data', chunk => body.push(chunk));
        req.on('end', async () => {
          const buffer = Buffer.concat(body);
          await fs.promises.writeFile(filePath, buffer);
          res.writeHead(201, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end(`✅ Файл для коду ${code} збережено`);
        });
        break;
      }

      // ===== DELETE =====
      case 'DELETE': {
        try {
          await fs.promises.unlink(filePath);
          res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end(`🗑️ Файл для коду ${code} видалено`);
        } catch {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end(`❌ Файл для коду ${code} не знайдено`);
        }
        break;
      }

      // ===== Інші методи =====
      default:
        res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('❌ Метод не дозволений');
    }
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`🚨 Внутрішня помилка сервера: ${err.message}`);
  }
});

// === 4. Запуск сервера ===
server.listen(options.port, options.host, () => {
  console.log(`🌐 Сервер працює: http://${options.host}:${options.port}`);
  console.log(`📂 Кеш директорія: ${cacheDir}`);
});
