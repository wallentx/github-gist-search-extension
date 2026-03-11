import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const sourceDir = path.join(repoRoot, 'src', 'extension');
const outputDir = path.join(repoRoot, 'dist', 'extension');

async function main() {
  await fs.rm(outputDir, { recursive: true, force: true });
  await fs.mkdir(outputDir, { recursive: true });

  const entries = await fs.readdir(sourceDir, { withFileTypes: true });
  await Promise.all(
    entries.map(async (entry) => {
      const sourcePath = path.join(sourceDir, entry.name);
      const outputPath = path.join(outputDir, entry.name);

      if (entry.isDirectory()) {
        await fs.cp(sourcePath, outputPath, { recursive: true });
        return;
      }

      await fs.copyFile(sourcePath, outputPath);
    }),
  );

  process.stdout.write(`Built extension bundle at ${outputDir}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
