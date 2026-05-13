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
    command: 'python3 -m http.server 8765 --bind 127.0.0.1',
    cwd: '../..',
    url: 'http://127.0.0.1:8765/index.html',
    reuseExistingServer: true,
    timeout: 10000,
  },
};
