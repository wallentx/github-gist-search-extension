import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function getAccessToken() {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: requireEnv('CWS_CLIENT_ID'),
      client_secret: requireEnv('CWS_CLIENT_SECRET'),
      refresh_token: requireEnv('CWS_REFRESH_TOKEN'),
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch OAuth token: ${response.status} ${await response.text()}`,
    );
  }

  const payload = await response.json();
  if (!payload.access_token) {
    throw new Error('OAuth token response did not include access_token.');
  }

  return payload.access_token;
}

async function uploadPackage(accessToken, zipBuffer) {
  const publisherId = requireEnv('CWS_PUBLISHER_ID');
  const extensionId = requireEnv('CWS_EXTENSION_ID');
  const name = `publishers/${publisherId}/items/${extensionId}`;
  const url = `https://chromewebstore.googleapis.com/upload/v2/${name}:upload`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/zip',
    },
    body: zipBuffer,
  });

  if (!response.ok) {
    throw new Error(
      `Failed to upload extension package: ${response.status} ${await response.text()}`,
    );
  }

  return response.json();
}

async function publishItem(accessToken) {
  const publisherId = requireEnv('CWS_PUBLISHER_ID');
  const extensionId = requireEnv('CWS_EXTENSION_ID');
  const name = `publishers/${publisherId}/items/${extensionId}`;
  const url = `https://chromewebstore.googleapis.com/v2/${name}:publish`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      publishType: process.env.CWS_PUBLISH_TYPE || 'DEFAULT_PUBLISH',
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to publish extension: ${response.status} ${await response.text()}`,
    );
  }

  return response.json();
}

async function main() {
  const zipArg = process.argv[2];
  const zipPath = path.resolve(
    zipArg || path.join(repoRoot, 'dist', 'github-gist-search-extension.zip'),
  );
  const skipPublish = process.argv.includes('--skip-publish');
  const zipBuffer = await fs.readFile(zipPath);
  const accessToken = await getAccessToken();

  const uploadResult = await uploadPackage(accessToken, zipBuffer);
  process.stdout.write(
    `Uploaded extension package: ${JSON.stringify(uploadResult)}\n`,
  );

  if (skipPublish) {
    process.stdout.write('Skipping publish step.\n');
    return;
  }

  const publishResult = await publishItem(accessToken);
  process.stdout.write(
    `Published extension: ${JSON.stringify(publishResult)}\n`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
