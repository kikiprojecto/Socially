import fs from 'fs';
import path from 'path';

function requireFile(p) {
  if (!fs.existsSync(p)) {
    throw new Error(`Missing required file: ${p}`);
  }
}

function main() {
  const root = process.cwd();

  requireFile(path.join(root, 'package.json'));
  requireFile(path.join(root, 'src', 'index.js'));
  requireFile(path.join(root, '.env.example'));

  const out = {
    ok: true,
    message: 'Repository is ready for deployment packaging.',
    checks: {
      hasDockerCompose: fs.existsSync(path.join(root, 'docker-compose.yml')),
      hasDeploymentDoc: fs.existsSync(path.join(root, 'DEPLOYMENT.md')),
      hasBountyClaim: fs.existsSync(path.join(root, 'BOUNTY_CLAIM.md'))
    }
  };

  process.stdout.write(JSON.stringify(out, null, 2));
  process.stdout.write('\n');
}

main();
