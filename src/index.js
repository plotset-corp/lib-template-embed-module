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
const EXTERNAL_URL = process.env.EXTERNAL_URL ?? 'https://plotset.com';

/**
 *
 * @param {*} document
 */
function fixScriptSrc(document) {
  const scripts = document.querySelectorAll('script');
  for (const script of scripts) {
    if (script.src && !validator.isURL(script.src)) {
      script.src = new URL(script.src, EXTERNAL_URL).href;
    }
  }
}

/**
 * Normalizes the header data by replacing null or empty
 * values with "col-X" format.
 * @param {any[]} header - The header data array.
 * @return {any[]} - The normalized header data array.
 */
function normalizeDataHeader(header) {
  let indicateNullData = 0;
  return header.map((_data) => {
    if (_data === null || _data === '') {
      indicateNullData += 1;
      return `col-${indicateNullData}`;
    } else {
      return _data;
    }
  });
};

/**
 * Separates the header of a CSV string.
 * @param {string} csvData - The CSV data string.
 * @return {Promise<any[]>} - An array containing the separated header.
 */
function separateHeardOfCsv(csvData) {
  const lastCharacterOfHeaderIndex = csvData.indexOf('\n');
  const header = csvData.slice(0, lastCharacterOfHeaderIndex);
  return new Promise((resolve, reject) => {
    Papa.parse(header, {
      complete(result) {
        result?.data?.[0] ?
          resolve(normalizeDataHeader(result?.data?.[0])) :
          [];
      },
      error(err) {
        reject(err);
      },
    });
  });
};

/**
 * Converts a CSV string to an array of objects and returns a Promise.
 * @param {any | string} dataString - The input data string.
 * @return {Promise<any[]>} - A Promise resolving to an array of objects.
 */
async function csvToArrayObject(dataString) {
  if (dataString.charCodeAt(0) === 0xFEFF) {
    dataString = dataString.slice(1);
  }
  const header = await separateHeardOfCsv(dataString);
  return new Promise((resolve, reject) => {
    const resultData = [];
    let index = 0;
    Papa.parse(dataString, {
      skipEmptyLines: false,
      dynamicTyping: false,
      header: false,
      step(p, c) {
        if (index !== 0) {
          const row = header?.reduce(
              (previousValue, currentValue, index) => {
                return {...previousValue, [currentValue]: p.data[index] || ''};
              },
              {},
          );
          resultData.push(row);
        }
        index = index + 1;
      },
      complete() {
        resultData['columns'] = header;
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
      const formattedData = await csvToArrayObject(data);
      const {document} = new JSDOM(html).window;
      fixScriptSrc(document);
      const dataScript = document.createElement('script');
      dataScript.type = 'text/javascript';
      dataScript.text = `
      function main() {
        const _PLOTSET_DATA=${jsesc(formattedData, {json: true})};
        // columns is removed when stringify
        _PLOTSET_DATA["columns"]=${jsesc(formattedData.columns, {json: true})};
        const _PLOTSET_CONFIG=${jsesc(config, {json: true})};
        const _PLOTSET_COL_REL=${jsesc(binding, {json: true})};
        const _PLOTSET_FORMATS=${jsesc(formats, {json: true})};
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

