const { spawn } = require('child_process');
const path = require('path');

const API_PORT = 3000;
const SERVE_PORT = 5500;

console.clear();
console.log('\n========================================');
console.log('   🚀 VR CRUD Project - Servidor');
console.log('========================================\n');

// Inicia json-server
const api = spawn('npx', ['json-server', '--watch', 'data/db.json', '--port', API_PORT, '--quiet'], {
    cwd: path.join(__dirname, '..'),
    shell: true,
    stdio: 'pipe'
});

// Inicia serve
const serve = spawn('npx', ['serve', '-l', SERVE_PORT, '--no-clipboard'], {
    cwd: path.join(__dirname, '..'),
    shell: true,
    stdio: 'pipe'
});

setTimeout(() => {
    console.log('    Servidor iniciado!\n');
    console.log('    Página Principal:');
    console.log(`      http://localhost:${SERVE_PORT}/pages\n`);
    console.log('     Banco de Dados (API):');
    console.log(`      http://localhost:${API_PORT}/items\n`);
    console.log('========================================');
    console.log('   Pressione Ctrl+C para parar');
    console.log('========================================\n');
}, 2000);

// Encerra processos ao fechar
process.on('SIGINT', () => {
    api.kill();
    serve.kill();
    process.exit();
});
