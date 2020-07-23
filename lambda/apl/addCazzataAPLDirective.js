const { get } = require('lodash')
const document = require('./cazzata.json')

const supportsAPL = (handlerInput) => {
  const supportedInterfaces = get(
    handlerInput,
    'requestEnvelope.context.System.device.supportedInterfaces',
    {}
  )
  const aplInterface = supportedInterfaces['Alexa.Presentation.APL']
  return aplInterface != null && aplInterface !== undefined
}

const getData = (text) => {
  const datasource = {
    bodyTemplate1Data: {
      type: 'object',
      objectId: 'bt1Sample',
      backgroundImage: {
        contentDescription: null,
        smallSourceUrl: null,
        largeSourceUrl: null,
        sources: [
          {
            url: 'https://files-k2okajo6v.vercel.app',
            size: 'small',
            widthPixels: 0,
            heightPixels: 0
          },
          {
            url: 'https://files-k2okajo6v.vercel.app',
            size: 'large',
            widthPixels: 0,
            heightPixels: 0
          }
        ]
      },
      title: 'cazzatetxt',
      textContent: {
        primaryText: {
          type: 'PlainText',
          text
        }
      },
      logoUrl: 'https://flowing-logos.vercel.app/images/it-IT_smallIconUri.png'
    }
  }

  return datasource
}

const addCazzataAPLDirective = (handlerInput, response, text) => {
  if (supportsAPL(handlerInput)) {
    return response.addDirective({
      type: 'Alexa.Presentation.APL.RenderDocument',
      token: 'teams',
      version: '1.4',
      document,
      datasources: getData(text)
    })
  }
  return response
}

module.exports = addCazzataAPLDirective
