import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { version } = require('../package.json');

export const VERSION = version;
export const DEFAULT_USER_AGENT = `ForteZar-CyberEye/${VERSION} (+https://github.com/MalsorEQ/fortezar-cybereye)`;
