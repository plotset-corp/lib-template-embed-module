/*
 * Copyright (C) PlotSet, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * PlotSet, Inc <info@plotset.com>
 */

const {JSDOM} = require('jsdom');
const Papa = require('papaparse');
const validator = require('validator');
const jsesc = require('jsesc');

/**
 *
 * @param {*} document
 */
function fixScriptSrc(document) {
  const scripts = document.querySelectorAll('script');
  for (const script of scripts) {
    if (script.src && !validator.isURL(script.src)) {
      script.src = new URL(script.src, config.externalUrl).href;
    }
  }
}

/**
 *
 * @param {*} csv
 * @return {Promise}
 */
function convertCsv(csv) {
  return new Promise((resolve, reject) => {
    // todo
    let resultData = [];
    Papa.parse(csv, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete(result) {
        resultData = result.data;
        resultData['columns'] = result.meta.fields;
        resolve(resultData);
      },
      error(err) {
        reject(err);
      },
    });
  });
};

/**
 * convert object to 1 level deep object
 * @param {string | object} settings
 * @return {string}
 */
function flattenSettings(settings) {
  if (typeof settings === 'string') settings = JSON.parse(settings);
  const flatSettings = {};
  for (const section of settings) {
    for (const row of section.rows) {
      for (const component of row.components) {
        if (component.default !== undefined) {
          flatSettings[component.field] = component.default;
        }
      }
    }
  }
  return flatSettings;
}

/**
 *
 * @param {*} component
 * @return {string}
 */
function generateComment(component) {
  let comment = '// ';
  const type = component.type;
  if (type === 'input-number') {
    comment +='number';
  } else if (type === 'radio-button') {
    const options = component.options.map((o) => o.value);
    comment += options.join('|');
  } else if (type === 'switch') {
    comment += 'boolean';
  } else if (type === 'color-picker') {
    comment += 'rgb color';
  } else if (type === 'input-text') {
    comment += 'string';
  } else if (type === 'select') {
    const options = component.options.map((o) => o.value);
    comment += options.join('|');
  } else if (type === 'input-slider') {
    comment += `number - min: ${component.min}, `;
    comment += `max: ${component.max}, step: ${component.step}`;
  } else if (type === 'select-color-palette') {
    comment += 'color palette';
  }
  return comment;
}

/**
 * convert object to 1 level deep object
 * @param {string | object} settings
 * @return {string}
 */
function flattenSettingsWithComment(settings) {
  if (typeof settings === 'string') settings = JSON.parse(settings);
  let flatSettings = '{\n';
  for (const section of settings) {
    for (const row of section.rows) {
      for (const component of row.components) {
        if (component.default !== undefined) {
          let defaultValue = component.default;
          if (defaultValue === null) defaultValue = 'null';
          if (typeof defaultValue === 'number') {
            // do nothing for now
          } else if (typeof defaultValue === 'boolean') {
            // do nothing for now
          } else {
            defaultValue = `"${defaultValue}"`;
          }
          flatSettings += `  "${component.field}": ${defaultValue}, `;
          flatSettings += generateComment(component);
          flatSettings += `\n`;
        }
      }
    }
  }
  flatSettings += '}';
  return flatSettings;
}


/**
 *
 * @param {String} html
 * @param {String} data
 * @param {String | Object} config
 * @param {String | Object} binding
 * @param {String | Object} formats
 * @param {Boolean} showWatermark
 * @return {Promise<String>}
 */
function generateEmbed(
    html,
    data,
    config,
    binding,
    formats,
    showWatermark=true,
) {
  return new Promise(async (resolve, reject) => {
    try {
      if (typeof config === 'string') config = JSON.parse(config);
      if (typeof binding === 'string') binding = JSON.parse(binding);
      if (typeof formats === 'string') formats = JSON.parse(formats);
      const formattedData = await convertCsv(data);
      const {document} = new JSDOM(html).window;
      fixScriptSrc(document);
      const dataScript = document.createElement('script');
      dataScript.type = 'text/javascript';
      dataScript.text = `
      function main() {
        const _PLOTSET_DATA=${jsesc(formattedData)};
        // columns is removed when stringify
        _PLOTSET_DATA["columns"]=${jsesc(formattedData.columns)};
        const _PLOTSET_CONFIG=${jsesc(config)};
        const _PLOTSET_COL_REL=${jsesc(binding)};
        const _PLOTSET_FORMATS=${jsesc(formats)};
        base_first_time({
          _data: _PLOTSET_DATA,
          _config: _PLOTSET_CONFIG,
          _col_rel: _PLOTSET_COL_REL,
          _columnsType: _PLOTSET_FORMATS,
          watermark: ${showWatermark},
        });
      }
      window.onload = main;
      `;
      document.body.appendChild(dataScript);
      resolve(document.documentElement.outerHTML);
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  generateEmbed,
  flattenSettings,
  flattenSettingsWithComment,
};

