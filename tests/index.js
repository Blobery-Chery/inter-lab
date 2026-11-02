// Точка входа для `node --test tests/` (Node 22 принимает каталог как модуль и запускает index.js):
// подключает все файлы *.test.js этого каталога, в том числе добавленные другими сессиями.
import { readdirSync } from 'node:fs';

const dir = new URL('./', import.meta.url);
for (const f of readdirSync(dir).filter((x) => x.endsWith('.test.js')).sort()) await import(new URL(f, dir).href);
