const fetch = require('node-fetch')

const randomCazzata = () => {
  return fetch('https://10bk1scq8k.execute-api.eu-central-1.amazonaws.com/latest', {
    method: 'GET'
  }).then(r => r.text())
}

module.exports = {
  randomCazzata
}
