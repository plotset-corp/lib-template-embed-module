/*
 * Copyright (C) PlotSet, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * PlotSet, Inc <info@plotset.com>
 */

  /**
 *
 * @param {String} html
 * @param {String} data
 * @param {String | Object} config
 * @param {String | Object} binding
 * @param {String | Object} formats
 * @param {Boolean} showWatermark
 * @param {Boolean} handleWatermark
 * @return {Promise<String>}
 */
export declare function generateEmbed(
  html: string,
  data: string,
  config: string | object,
  binding: string | object,
  formats: string | object,
  showWatermark?: boolean,
  handleWatermark?: boolean
): Promise<string>;

/**
 *
 * @param {string} settings
 * @return {string}
 */
 export declare function flattenSettings(settings: string) : string

 /**
 *
 * @param {string | object} settings
 * @return {string}
 */
 export declare function flattenSettingsWithComment(settings: string | object) : string
