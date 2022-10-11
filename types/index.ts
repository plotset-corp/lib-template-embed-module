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
 * @param {String} config
 * @param {String} binding
 * @return {Promise<String>}
 */
 export declare function generateEmbed(
    html: String,
    data: String,
    config: String,
    binding: String,
  ) : Promise<String>

/**
 *
 * @param {string} settings
 * @return {string}
 */
 export declare function flattenSettings(settings: string) : string
