import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

const distDir = path.join(process.cwd(), 'dist', 'assets');
const files = fs.readdirSync(distDir);
const jsFile = files.find(f => f.endsWith('.js'));

if (!jsFile) {
  console.error("No JS file found");
  process.exit(1);
}

const code = fs.readFileSync(path.join(distDir, jsFile), 'utf-8');

const dom = new JSDOM(`<!DOCTYPE html><div id="root"></div>`, {
  url: "http://localhost/",
  runScripts: "dangerously"
});

// Polyfill minimal browser APIs that might be needed before react mounts
dom.window.matchMedia = () => ({ matches: false, addListener: () => {}, removeListener: () => {} });
dom.window.requestAnimationFrame = (cb) => setTimeout(cb, 0);

try {
  dom.window.eval(code);
  console.log("Evaluation successful!");
} catch (e) {
  console.error("RUNTIME ERROR:", e);
}
