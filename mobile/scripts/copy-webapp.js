/**
 * Copies web/'s built micro-app (index.html + dist/bundle.js) into the
 * Android assets folder as local static files, preserving the
 * dist/bundle.js relative path so index.html's <script src="dist/bundle.js">
 * resolves. Plain Node (fs), not a shell `cp` — this needs to work
 * identically on Windows and Unix.
 */
const fs = require('fs');
const path = require('path');

const webDir = path.join(__dirname, '..', '..', 'web');
const targetDir = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'assets', 'webapp');

const bundlePath = path.join(webDir, 'dist', 'bundle.js');
if (!fs.existsSync(bundlePath)) {
  console.error(
    `copy-webapp: ${bundlePath} does not exist. Run "npm run build" in web/ first.`,
  );
  process.exit(1);
}

fs.mkdirSync(path.join(targetDir, 'dist'), { recursive: true });
fs.copyFileSync(path.join(webDir, 'index.html'), path.join(targetDir, 'index.html'));
fs.copyFileSync(bundlePath, path.join(targetDir, 'dist', 'bundle.js'));

console.log(`copy-webapp: copied index.html + dist/bundle.js to ${targetDir}`);
