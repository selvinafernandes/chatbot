const Dialogflow = require('dialogflow');
const Pusher = require('pusher');
const skyscanner = require('./skyscanner');
const date = require('./date');

// You can find your project ID in your Dialogflow agent settings
const projectId = 'skyscanner-bot-xmjakf'; //https://dialogflow.com/docs/agents#settings
const sessionId = '123456';
const languageCode = 'en-US';

const config = {
  credentials: {
    private_key: process.env.DIALOGFLOW_PRIVATE_KEY,
    client_email: process.env.DIALOGFLOW_CLIENT_EMAIL,
  },
};

const pusher = new Pusher ({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  encrypted: true
})

const sessionClient = new Dialogflow.SessionsClient(config);

const sessionPath = sessionClient.sessionPath(projectId, sessionId);

const processMessage = async(message) => {
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: message,
        languageCode,
      },
    }
  }

  const responses = await sessionClient.detectIntent(request);
  const result = responses[0].queryResult;

  if (result.intent.displayName == 'flight-details-source' ||
      result.intent.displayName == 'flight-details-dest' ) {
    if (result.parameters.fields.hasOwnProperty('originplace') ||
        result.parameters.fields.hasOwnProperty('destinationplace')) {

      const fields = result.parameters.fields;
      const prop = Object.keys(fields);
      const city = fields[prop].stringValue;

      skyscanner.getAirports(city)
      .then(details => {
        let data = {
          [prop]: details.Places[0].PlaceId
        }
        skyscanner.getData(data);
      })
    }
  } else if (result.intent.displayName == 'flight-details-outbounddt') {
    const inboundDate = result.parameters.fields['outboundpartialdate'].stringValue;
    let dateString = date.dateString(inboundDate);

    let newDate = {
      'outboundpartialdate': dateString
    };

    skyscanner.getData(newDate);
    skyscanner.getQuotes().then(data => {
      if(data.Quotes.length >= 1) {
        data.Quotes.map(quote => {
          let dt = quote.OutboundLeg.DepartureDate;
          let dtFormat = date.dateString(dt);
          return pusher.trigger('bot', 'bot-response', {
            message: `The mininum quote is ${quote.MinPrice}${data.Currencies[0].Symbol} for the date ${dtFormat}`
          })
        })
      } else {
        return pusher.trigger('bot', 'bot-response', {
          message: `We are unable to find you the desired results for the above date. Please try another date`
        })
      }
    })
  }

  return pusher.trigger('bot', 'bot-response', {
    message: result.fulfillmentText
  });
}

module.exports = processMessage;
