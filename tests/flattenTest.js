const {flattenSettingsWithComment} = require('../src');
const {readFileSync} = require('fs');
const {join} = require('path');


/**
 *
 */
async function test() {
  try {
    const templatePath = join(process.cwd(), 'tests', 'template');
    const settingsPath = join(templatePath, 'settings.json');
    const settings = readFileSync(settingsPath, 'utf8') ?? '[]';
    const config = flattenSettingsWithComment(settings);
    console.log(config);
    // console.log(inspect(config, false, 2));
  } catch (error) {
    console.error(error);
  }
}

test();

