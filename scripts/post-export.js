const fs = require('fs')
const path = require('path')

const dist = path.join(__dirname, '..', 'dist')
const version = 'v' + Date.now()

// ── 1. Patch index.html ───────────────────────────────────────
let html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')

// Fix asset paths for /workout/ subdirectory
html = html.replace(/src="\/_expo\//g, 'src="/workout/_expo/')
html = html.replace(/href="\/favicon\.ico"/g, 'href="/workout/favicon.ico"')

// iOS PWA icon
html = html.replace(
  '</head>',
  `<link rel="apple-touch-icon" href="/workout/apple-touch-icon.png">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff">
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#000000">
<style>
  html, body { background-color: #ffffff; }
  @media (prefers-color-scheme: dark) { html, body { background-color: #000000; } }
</style>
</head>`
)

// Landscape blocker overlay + service worker registration
html = html.replace(
  '</body>',
  `<style>
    @media (orientation: landscape) {
      #landscape-block { display: flex !important; }
    }
  </style>
  <div id="landscape-block" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:#000;color:#fff;z-index:9999;align-items:center;justify-content:center;flex-direction:column;font-family:-apple-system,BlinkMacSystemFont,sans-serif;text-align:center;padding:40px;box-sizing:border-box;">
    <div style="font-size:52px;margin-bottom:20px;">&#8635;</div>
    <div style="font-size:20px;font-weight:700;margin-bottom:8px;">Please rotate your phone</div>
    <div style="font-size:14px;color:#888;">This app is portrait only</div>
  </div>
  <script>
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/workout/sw.js')
        .then(() => console.log('SW registered'))
        .catch((e) => console.warn('SW error', e))
    }
  </script>\n</body>`
)

fs.writeFileSync(path.join(dist, 'index.html'), html)
console.log('✓ index.html patched')

// ── 2. Copy iOS icon ─────────────────────────────────────────
fs.copyFileSync(
  path.join(__dirname, '..', 'assets', 'iOSIcon.png'),
  path.join(dist, 'apple-touch-icon.png')
)
console.log('✓ apple-touch-icon.png copied')

// ── 3. Generate sw.js with current version ───────────────────
const swTemplate = fs.readFileSync(path.join(__dirname, '..', 'sw-template.js'), 'utf8')
const sw = swTemplate.replace('__VERSION__', version)
fs.writeFileSync(path.join(dist, 'sw.js'), sw)
console.log(`✓ sw.js generated (${version})`)

// ── 4. Patch asset paths in JS bundle ────────────────────────
// Expo puts images at /assets/... in the bundle, but the app lives at /workout/
// so we rewrite every "/assets/ reference to "/workout/assets/
const jsDir = path.join(dist, '_expo', 'static', 'js', 'web')
const jsFiles = fs.readdirSync(jsDir).filter((f) => f.endsWith('.js'))
for (const jsFile of jsFiles) {
  const jsPath = path.join(jsDir, jsFile)
  let js = fs.readFileSync(jsPath, 'utf8')
  js = js.replace(/["']\/assets\//g, '"/workout/assets/')
  fs.writeFileSync(jsPath, js)
}
console.log(`✓ JS bundle asset paths patched (${jsFiles.length} file(s))`)

// ── 5. .nojekyll ─────────────────────────────────────────────
fs.writeFileSync(path.join(dist, '.nojekyll'), '')
console.log('✓ .nojekyll created')
