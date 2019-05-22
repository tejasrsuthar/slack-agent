const _ = require('lodash');
const queryString = require('query-string');
const { isDateValid, getDatesInRange, parseDate, parseTextToDate } = require('../services/dateService.js');

const FAILURE_MESSAGE = 'Sorry, I didn’t quite get that :disappointed: I’m easily confused. Perhaps if you put the ' +
  'words in a different order? :brain:\n\nHow to use this bot in examples:\n1. Check available locations\n' +
  '/agentlocations\n\n2. Book a place\n /agentbook 2030/01/30 Gotham → to book a random place\n/agentbook ' +
  'today Gotham 111 → to book a specific place\n\n3. Check your bookings:\n/agentmy\n\n' +
  '4. Unbook if not needed:\n/agentunbook tomorrow Gotham';

const isParamValid = (inputParam, paramValidators) =>
  _.every(_.values(paramValidators), (validate) => validate(inputParam));

const validateInputParams = (inputParams, inputFormat) =>
  _.reduce(
    inputParams,
    (isValid, userInputProperty, propertyKey) =>
      isParamValid(userInputProperty, inputFormat[propertyKey]) && isValid,
    true
  );

const parseDatesToArray = (dates) => {
  const [minDate, maxDate] = _.split(dates, '-');
  if (!maxDate) {
    return isDateValid(minDate) ? [parseDate(minDate)] : [];
  }
  return isDateValid(minDate) && isDateValid(maxDate) ? getDatesInRange(minDate, maxDate) : [];
};

exports.parseBodyToObject = (body, inputFormat) => {
  const parsedBody = queryString.parse(body);
  const inputParamsList = _.split(parsedBody.text, ' ');

  const inputParams = _.reduce(
    _.keys(inputFormat),
    (params, paramName, index) => ({ ...params, [paramName]: inputParamsList[index] }),
    {},
  );

  if (_.has(inputParams, 'dates')) {
    const dates = parseTextToDate(inputParams.dates);

    inputParams.dates = parseDatesToArray(dates);
  }

  if (_.has(inputFormat, 'userName')) {
    inputParams.userName = parsedBody.user_name;
  }

  const isValid = validateInputParams(inputParams, inputFormat);
  return {
    isValid,
    message: isValid ? inputParams : FAILURE_MESSAGE
  };
};
