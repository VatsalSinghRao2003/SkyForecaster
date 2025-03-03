import {
  input,
  form,
  namePar,
  positionDetailsPar,
  weatherMainPar,
  tempPar,
  sunrisePar,
  sunsetPar,
  windSpeedPar,
  windDegPar,
  weatherMainImg,
  maxTempPar,
  minTempPar,
  scaleSelect,
  perceivedTempPar,
  windBftIcon,
  primaryDiv,
  gustBftIcon,
  gustSpeedPar,
  gustSpeedDiv,
  humidityPar,
  pressurePar,
  visibilityPar,
  secondaryDiv,
  tertiaryDiv,
  currentLocationBtn,
  airDiv,
  airAqiPar,
  dayOneWeatherImg,
  dayOneLhTempsPar,
  dayTwoNamePar,
  dayTwoWeatherImg,
  dayTwoLhTempsPar,
  dayThreeNamePar,
  dayThreeWeatherImg,
  dayThreeLhTempsPar,
  dayFourNamePar,
  dayFourWeatherImg,
  dayFourLhTempsPar,
  dayFiveNamePar,
  dayFiveWeatherImg,
  dayFiveLhTempsPar,
  fiveDayForecastDiv,
  dayOneDatePar,
  dayTwoDatePar,
  dayThreeDatePar,
  dayFourDatePar,
  dayFiveDatePar,
  currentDatePar,
  errorPar,
  errorDiv,
} from './elements.js';
import {
  kelvinToScale,
  unixTStoHour,
  changeScale,
  msToKmh,
  meteoDegToDirection,
  getCustomIcon,
  getBftIcon,
  hideElement,
  showElement,
  formatInputValue,
  getCurrentLocation,
  dtToDate,
  displayFcDayElements,
  getLhTemps,
  getCurrentDate,
  displayCurrentDate,
} from './utils.js';
import { getCurrentWeather, getFiveDayForecast } from './api/weather.js';
import { getGeocoding } from './api/location.js';
import { getAirPollution } from './api/pollution.js';
import { fetchData } from './api/api.js';

const clearInput = () => {
  input.value = '';
};

// f that displays the data retrieved
export const displayWeatherData = async (location, event) => {
  // no automatic form submit
  if (event) {
    event.preventDefault();
  }

  // display current time values
  displayCurrentDate();
  // update the current time values
  setInterval(displayCurrentDate, 1000);

  //
  showElement(currentDatePar, 'm-5 text-center');

  let cityData,
    coordParams,
    fiveDayForecast,
    weatherData,
    pollutionData,
    convertionTemps;

  // no location inputted
  if (!location) {
    cityData = await fetchData(getGeocoding, ['abu road']);

    coordParams = [cityData.lat, cityData.lon];
  }

  if (location) {
    let locationParams;

    // location inputted manually
    if (typeof location === 'string') {
      locationParams = formatInputValue(location);

      const cityName = locationParams[0] || '';
      const countryCode = locationParams[1] || '';
      const limit = locationParams[2] || '';
      const stateCode = locationParams[3] || '';

      locationParams = [cityName, countryCode, limit, stateCode];
    } else {
      // location retrieved automatically
      const { name, sys } = await fetchData(getCurrentWeather, [
        location.lat,
        location.lon,
      ]);

      locationParams = [name, sys.country];
    }

    cityData = await fetchData(getGeocoding, locationParams);
    console.log(cityData);

    coordParams = [cityData.lat, cityData.lon];

    if (!cityData.lat || !cityData.lon) {
      // error: no cityData
      // stop fetch
      cityData = null;

      hideElement(primaryDiv);
      hideElement(tertiaryDiv);

      errorPar.innerHTML = `"${input.value}"`;
      errorDiv.removeAttribute('class');
    }

    clearInput();
  }

  // div unhided after its population
  if (cityData) {
    hideElement(errorDiv);

    // api calls
    weatherData = await fetchData(getCurrentWeather, coordParams);
    fiveDayForecast = await fetchData(getFiveDayForecast, coordParams);
    pollutionData = await fetchData(getAirPollution, coordParams);

    const { name, state, country } = cityData;

    namePar.innerHTML = name;

    positionDetailsPar.innerHTML = `${state ? state : ''}${
      state && country ? ', ' : ''
    }${country ? `(${country})` : ''}`;

    // show data unhiding elements
    primaryDiv.removeAttribute('class');
    secondaryDiv.removeAttribute('class');
  }

  if (weatherData) {
    const { main, sys, visibility, weather, wind } = weatherData;

    weatherMainPar.innerHTML = weather[0].main;

    tempPar.innerHTML = kelvinToScale(main.temp, 'celsius');

    perceivedTempPar.innerHTML = `Feels like: ${kelvinToScale(
      main.feels_like,
      'celsius'
    )}`;

    minTempPar.innerHTML = `Min: ${kelvinToScale(main.temp_min, 'celsius')}`;

    maxTempPar.innerHTML = `Max: ${kelvinToScale(main.temp_max, 'celsius')}`;

    convertionTemps = { main: main };

    weatherMainImg.setAttribute('src', getCustomIcon(weather[0].main));

    windBftIcon.setAttribute('src', getBftIcon(msToKmh(wind.speed)));
    windSpeedPar.innerHTML = `Wind: ${msToKmh(wind.speed)} km/h`;

    if (wind.gust) {
      showElement(gustSpeedDiv, 'container y-center');

      gustBftIcon.setAttribute('src', getBftIcon(msToKmh(wind.gust)));
      gustSpeedPar.innerHTML = `Gust: ${msToKmh(wind.gust)} km/h`;
    } else {
      hideElement(gustSpeedDiv);
    }

    windDegPar.innerHTML = `Direction: ${meteoDegToDirection(wind.deg)}`;

    sunrisePar.innerHTML = `Sunrise: ${unixTStoHour(sys.sunrise)}`;
    sunsetPar.innerHTML = `Sunset: ${unixTStoHour(sys.sunset)}`;

    humidityPar.innerHTML = `${main.humidity}%`;
    pressurePar.innerHTML = `${main.pressure} hPa`;
    visibilityPar.innerHTML = `${(visibility / 1000).toFixed(0)} km`;

    tertiaryDiv.removeAttribute('class');
  } else {
    hideElement(secondaryDiv);
  }

  if (fiveDayForecast) {
    const { list } = fiveDayForecast;

    const { currentDate: currentDate } = getCurrentDate();

    const dayOneFc = list.filter(
      el => dtToDate(el.dt).getDate() === currentDate + 1
    );

    const dayTwoFc = list.filter(
      el => dtToDate(el.dt).getDate() === currentDate + 2
    );

    const dayThreeFc = list.filter(
      el => dtToDate(el.dt).getDate() === currentDate + 3
    );

    const dayFourFc = list.filter(
      el => dtToDate(el.dt).getDate() === currentDate + 4
    );

    const dayFiveFc = list.filter(
      el => dtToDate(el.dt).getDate() === currentDate + 5
    );

    convertionTemps = {
      ...convertionTemps,
      dayOneLh: getLhTemps(dayOneFc),
      dayTwoLh: getLhTemps(dayTwoFc),
      dayThreeLh: getLhTemps(dayThreeFc),
      dayFourLh: getLhTemps(dayFourFc),
      dayFiveLh: getLhTemps(dayFiveFc),
    };

    displayFcDayElements(
      dayOneFc,
      null,
      dayOneDatePar,
      dayOneWeatherImg,
      dayOneLhTempsPar
    );

    displayFcDayElements(
      dayTwoFc,
      dayTwoNamePar,
      dayTwoDatePar,
      dayTwoWeatherImg,
      dayTwoLhTempsPar
    );

    displayFcDayElements(
      dayThreeFc,
      dayThreeNamePar,
      dayThreeDatePar,
      dayThreeWeatherImg,
      dayThreeLhTempsPar
    );

    displayFcDayElements(
      dayFourFc,
      dayFourNamePar,
      dayFourDatePar,
      dayFourWeatherImg,
      dayFourLhTempsPar
    );

    displayFcDayElements(
      dayFiveFc,
      dayFiveNamePar,
      dayFiveDatePar,
      dayFiveWeatherImg,
      dayFiveLhTempsPar
    );

    // show data unhiding elements
    showElement(fiveDayForecastDiv, 'b-1 br-15 bc-transparent bg-transparent');
  }

  scaleSelect.addEventListener('change', e => {
    changeScale(convertionTemps, e.target.value);
  });

  if (pollutionData) {
    const { list } = pollutionData;

    airAqiPar.innerHTML = `AQI: ${list[0].main.aqi}`;

    // show data unhiding elements
    showElement(
      airDiv,
      'container col-direction b-1 br-15 bc-transparent box-small bg-transparent'
    );
  }
};

displayWeatherData();

form.addEventListener('submit', e => {
  displayWeatherData(input.value, e);
  currentLocationBtn.setAttribute('class', 'b-0 br-10 inactive');
});

currentLocationBtn.addEventListener('click', () => {
  getCurrentLocation();
  currentLocationBtn.setAttribute('class', 'b-0 br-10 active');
});

// TODO: improve API results conditional display
// TODO: clear code

// in future
// TODO: hour forecast
// TODO: modals containing scales info (beaufort, air pollution params...)
