const {generateEmbed, flattenSettings} = require('../src');
const {readFileSync, writeFileSync} = require('fs');
const {join} = require('path');


/**
 *
 */
async function test() {
  try {
    const templatePath = join(process.cwd(), 'tests', 'template2');

    const htmlPath = join(templatePath, 'index.html');
    const html = readFileSync(htmlPath, 'utf8') ?? '';
    const dataPath = join(templatePath, 'data.csv');
    const data = readFileSync(dataPath, 'utf8') ?? '';
    const bindingPath = join(templatePath, 'bindings.json');
    const binding = readFileSync(bindingPath, 'utf8') ?? '[]';
    const settingsPath = join(templatePath, 'settings.json');
    const settings = readFileSync(settingsPath, 'utf8') ?? '[]';
    const config = flattenSettings(settings);
    const formats = '[]';
    const showWatermark = false;
    const uuid = '0b4e7ea7-0923-43d3-8390-c4699dc3d9a8';
    const oembedUrl = `http://localhost:3000/oembed?url=http://localhost:3000/embeds/${uuid}`;
    const embed = await generateEmbed(
        html,
        data,
        config,
        binding,
        formats,
        showWatermark,
        oembedUrl,
    );
    const outFile = join(process.cwd(), 'tests', 'output.html');
    writeFileSync(outFile, embed, 'utf-8');
  } catch (error) {
    console.error(error);
  }
}

test();

