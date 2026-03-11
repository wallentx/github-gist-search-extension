import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const extensionDir = path.join(repoRoot, 'dist', 'extension');
const zipPath = path.join(repoRoot, 'dist', 'github-gist-search-extension.zip');

async function main() {
  await fs.rm(zipPath, { force: true });

  const zipResult = spawnSync('zip', ['-r', '-q', zipPath, '.'], {
    cwd: extensionDir,
    stdio: 'inherit',
  });

  if (zipResult.error) {
    if (zipResult.error.code === 'ENOENT') {
      throw new Error(
        'Failed to package extension: the "zip" command was not found in PATH.\n' +
          'Install a zip utility or run packaging in an environment where "zip" is available.',
      );
    }

    throw zipResult.error;
  }

  if (zipResult.status !== 0) {
    throw new Error(`zip exited with status ${zipResult.status}`);
  }

  process.stdout.write(`Packaged extension zip at ${zipPath}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
