const Alexa = require('ask-sdk-core')
const _ = require('lodash')
const teams = require('./teams')
const addTeamsAPLDirective = require('./apl/addTeamsAPLDirective')

const LaunchRequestHandler = {
  canHandle (handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest'
  },
  handle (handlerInput) {
    const speakOutput = 'Ciao! Benvenuto nella skill di Flowing, puoi chiedermi la composizione dei team.'
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse()
  }
}

function callDirectiveService (handlerInput, team) {
  const requestEnvelope = handlerInput.requestEnvelope
  const directiveServiceClient = handlerInput.serviceClientFactory.getDirectiveServiceClient()

  const requestId = requestEnvelope.request.requestId
  const endpoint = requestEnvelope.context.System.apiEndpoint
  const token = requestEnvelope.context.System.apiAccessToken

  const directive = {
    header: {
      requestId
    },
    directive: {
      type: 'VoicePlayer.Speak',
      speech: `Sto caricando i dati per il team ${team}...`
    }
  }

  return directiveServiceClient.enqueue(directive, endpoint, token)
}

const getSlotId = slot => _.get(slot, 'resolutions.resolutionsPerAuthority.0.values.0.value.name', '')

const RICHIESTA_TEAM_INTENTS = [
  'AMAZON.YesIntent',
  'RichiestaTeamIntent'
]

const RichiestaTeamIntentHandler = {
  canHandle (handlerInput) {
    if (Alexa.getRequestType(handlerInput.requestEnvelope) !== 'IntentRequest') {
      return false
    }

    const intent = Alexa.getIntentName(handlerInput.requestEnvelope)

    return RICHIESTA_TEAM_INTENTS.includes(intent)
  },
  async handle (handlerInput) {
    const teamSlot = Alexa.getSlot(handlerInput.requestEnvelope, 'Team')

    const teamName = getSlotId(teamSlot)

    if (!teamName) {
      const { value } = teamSlot
      return handlerInput.responseBuilder
        .speak(`Il team ${value} non esiste. vuoi conoscere la composizione di qualche altro team?`)
        .reprompt('vuoi conoscere la composizione di qualche altro team?')
        .getResponse()
    }

    callDirectiveService(handlerInput, teamName)

    const people = await teams.getPeople(teamName)
    const speakOutput = `Il team ${teamName} è composto da ${people.map(p => p.name).join(', ')}. Vuoi conoscere la composizione di qualche altro team?`

    const response = handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt('vuoi conoscere la composizione di qualche altro team?')

    return addTeamsAPLDirective(handlerInput, response, teamName, people).getResponse()
  }
}
const HelpIntentHandler = {
  canHandle (handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
            Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent'
  },
  handle (handlerInput) {
    const speakOutput = 'Puoi chidermi la composizione dei team.'

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse()
  }
}

const CANCEL_INTENT = [
  'AMAZON.NoIntent',
  'AMAZON.CancelIntent',
  'AMAZON.StopIntent'
]

const CancelAndStopIntentHandler = {
  canHandle (handlerInput) {
    if (Alexa.getRequestType(handlerInput.requestEnvelope) !== 'IntentRequest') {
      return false
    }

    const intent = Alexa.getIntentName(handlerInput.requestEnvelope)

    return CANCEL_INTENT.includes(intent)
  },
  handle (handlerInput) {
    const speakOutput = 'A Presto!'
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse()
  }
}
const SessionEndedRequestHandler = {
  canHandle (handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest'
  },
  handle (handlerInput) {
    return handlerInput.responseBuilder.getResponse()
  }
}

const IntentReflectorHandler = {
  canHandle (handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
  },
  handle (handlerInput) {
    const intentName = Alexa.getIntentName(handlerInput.requestEnvelope)
    const speakOutput = `Hai appena invocato ${intentName}`

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse()
  }
}

const ErrorHandler = {
  canHandle () {
    return true
  },
  handle (handlerInput, error) {
    console.log(`~~~~ Error handled: ${error.stack}`)
    const speakOutput = 'Scusa, ma ho avuto un problema ad evadere la tua richiesta, riprova.'

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse()
  }
}

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    RichiestaTeamIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
    IntentReflectorHandler
  )
  .addErrorHandlers(
    ErrorHandler
  )
  .withApiClient(new Alexa.DefaultApiClient())
  .lambda()
