const { get } = require('lodash')
const document = require('./teams.json')

const supportsAPL = (handlerInput) => {
  const supportedInterfaces = get(
    handlerInput,
    'requestEnvelope.context.System.device.supportedInterfaces',
    {}
  )
  const aplInterface = supportedInterfaces['Alexa.Presentation.APL']
  return aplInterface != null && aplInterface !== undefined
}

const getData = (teamName, people) => {
  const listItems = people.map(surfer => {
    return {
      listItemIdentifier: surfer.id,
      textContent: {
        primaryText: {
          type: 'PlainText',
          text: surfer.name
        }
      },
      image: {
        sources: [
          {
            url: surfer.image
          }
        ]
      },
      token: surfer.id
    }
  })

  const datasource = {
    listTemplate2Metadata: {
      type: 'object',
      objectId: 'lt1Metadata',
      backgroundImage: {
        sources: [
          {
            url: 'https://via.placeholder.com/960x480/000000/000000'
          }
        ]
      },
      teamName,
      logoUrl: 'https://flowing-logos.vercel.app/images/it-IT_smallIconUri.png'
    },
    listTemplate2ListData: {
      type: 'list',
      listId: 'lt2Sample',
      listPage: {
        listItems
      }
    }
  }

  return datasource
}

const addTeamsAPLDirective = (handlerInput, response, teamName, people) => {
  if (supportsAPL(handlerInput)) {
    return response.addDirective({
      type: 'Alexa.Presentation.APL.RenderDocument',
      token: 'teams',
      version: '1.4',
      document,
      datasources: getData(teamName, people)
    })
  }
  return response
}

module.exports = addTeamsAPLDirective
