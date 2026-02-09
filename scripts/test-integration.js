import { spawnSync } from 'child_process';

function requiredEnv(name) {
  const v = (process.env[name] || '').trim();
  if (!v) throw new Error(`${name} is required for integration tests`);
  return v;
}

function main() {
  requiredEnv('ANTHROPIC_API_KEY');
  requiredEnv('EVM_RPC_URL');

  const env = {
    ...process.env,
    RUN_INTEGRATION_TESTS: '1',
    NODE_NO_WARNINGS: '1'
  };

  const result = spawnSync(
    process.execPath,
    ['--experimental-vm-modules', './node_modules/jest/bin/jest.js', '--runInBand', 'tests/integration'],
    { stdio: 'inherit', env }
  );

  process.exit(result.status || 0);
}

main();
