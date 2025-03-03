import { get, dataUrl, API_KEY } from './api.js';

/**
 * Generate the url to obtain the air pollution data of a city
 *
 * @param {string} lat - The city latitude (req)
 * @param {string} lon - The city longitude (req)
 * @param {string} APIkey - The API key (req)
 * @returns {string} - The URL for the API request
 */

export const getAirPollution = (lat, lon, APIkey = API_KEY) =>
  get(dataUrl, `/air_pollution?lat=${lat}&lon=${lon}&appid=${APIkey}`);
