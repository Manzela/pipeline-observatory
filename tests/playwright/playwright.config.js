module.exports = {
  testDir: '.',
  fullyParallel: true,
  retries: 0,
  workers: 1,
  reporter: 'list',
  timeout: 15000,
  use: {
    baseURL: 'http://127.0.0.1:8765',
    trace: 'off',
    headless: true,
  },
  webServer: {
    // http-server (not python3 -m http.server): the Python server returns its own
    // minimal 404 page for unknown paths, swallowing 404.html. http-server serves
    // 404.html as the fallback, which is what we test and what GitHub Pages does
    // in production. -c-1 disables caching during dev.
    command: 'npx --yes http-server . -p 8765 -a 127.0.0.1 --silent -c-1',
    cwd: '../..',
    url: 'http://127.0.0.1:8765/index.html',
    reuseExistingServer: true,
    timeout: 30000,
  },
};
