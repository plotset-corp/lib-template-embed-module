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
 * @param {String} html
 * @param {String} data
 * @param {String | Object} config
 * @param {String | Object} binding
 * @return {Promise<String>}
 */
function generateEmbed(html, data, config, binding) {
  return new Promise(async (resolve, reject) => {
    try {
      if (typeof config === 'string') config = JSON.parse(config);
      if (typeof binding === 'string') binding = JSON.parse(binding);
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
        base_first_time({
          _data: _PLOTSET_DATA,
          _config: _PLOTSET_CONFIG,
          _col_rel: _PLOTSET_COL_REL,
        });

        toggleFloatingWatermark(true);
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
};

