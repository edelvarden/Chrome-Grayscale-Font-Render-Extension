import { createRequire } from 'module';
import { zip } from 'zip-a-folder';

const require = createRequire(import.meta.url);
const packageJson = require('../package.json');
const manifestJson = require('../build/manifest.json');

const extName = packageJson.displayName.replaceAll(' ', '-');
const extVersion = manifestJson.version;

const sourcePath = 'build';
const archiveName = `${extName}-${extVersion}.zip`;

try {
  await zip(sourcePath, archiveName);
  console.log(`✔ Successfully zipped '${sourcePath}' to '${archiveName}'.`);
} catch (error) {
  console.error(`❌ Error occurred while zipping '${sourcePath}' to '${archiveName}':`, error);
}
