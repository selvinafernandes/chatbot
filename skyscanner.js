const unirest = require("unirest");
const { RAPIDAPI_HOST, RAPIDAPI_KEY } = process.env;
let searchData = {};

const getAirports = city => {

  return new Promise((resolve, reject) => {
  unirest("GET", "https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/autosuggest/v1.0/UK/GBP/en-GB/")
  .query({
    "query": `${city}`
  })
  .headers({
    "x-rapidapi-host": RAPIDAPI_HOST,
    "x-rapidapi-key": RAPIDAPI_KEY
  })
  .end(function (res) {
    if (res.error) { return reject(res.error)}
    return resolve(res.body)
  });
});
}

const getData = (data) => {
  searchData = {...searchData, ...data}
}

const getQuotes = () => {
  return new Promise((resolve, reject) => {
    unirest("GET", `https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browsequotes/v1.0/NL/EUR/en-GB/${searchData.originplace}/${searchData.destinationplace}/${searchData.outboundpartialdate}`)
    .headers({
      "x-rapidapi-host": RAPIDAPI_HOST,
      "x-rapidapi-key": RAPIDAPI_KEY
    })
    .end(function (res) {
      if (res.error) { console.log(res.error)}
      return resolve(res.body)
    });
  });
}

const getLiveData = () => {
  return new Promise((resolve, reject) => {
    unirest("POST", "https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/pricing/v1.0")
    .headers({
      "x-rapidapi-host": RAPIDAPI_HOST,
	    "x-rapidapi-key": RAPIDAPI_KEY,
	    "content-type": "application/x-www-form-urlencoded"
    })
    .form({
      "inboundDate": {},
      "cabinClass": {},
      "children": {},
      "infants": {},
      "country": {},
      "currency": {},
      "locale": {},
      "originPlace": {},
      "destinationPlace": {},
      "outboundDate": {},
      "adults": {}
    })
    .end(res => {
      if (res.error) { console.log(res.error)}
      return resolve(res.body)
    })
  });
}

module.exports = { getData, getAirports, getQuotes};