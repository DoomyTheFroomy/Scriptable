// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: tree;
// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: briefcase-medical;


/* global Location args config Script ListWidget Font Color Request */

const pollenUrl = 'https://opendata.dwd.de/climate_environment/health/alerts/s31fg.json'

const regions = {
  10: 'Schleswig-Holstein und Hamburg',
  11: 'Inseln und Marschen',
  12: 'Geest, Schleswig-Holstein und Hamburg',
  20: 'Mecklenburg-Vorpommern',
  30: 'Niedersachsen und Bremen',
  31: 'Westl.Niedersachsen / Bremen',
  32: 'Östl.Niedersachsen',
  40: 'Nordrhein-Westfalen',
  41: 'Rhein.- Westfäl.Tiefland',
  42: 'Ostwestfalen',
  43: 'Mittelgebirge NRW',
  50: 'Brandenburg und Berlin',
  60: 'Sachsen-Anhalt',
  61: 'Tiefland Sachsen-Anhalt ',
  62: 'Harz',
  70: 'Thüringen',
  71: 'Tiefland Thüringen',
  72: 'Mittelgebirge Thüringen',
  80: 'Sachsen',
  81: 'Tiefland Sachsen',
  82: 'Mittelgebirge Sachsen',
  90: 'Hessen',
  91: 'Nordhessen und hess.Mittelgebirge',
  92: 'Rhein-Main',
  100: 'Rheinland-Pfalz und Saarland',
  101: 'Rhein, Pfalz, Nahe und Mosel ',
  102: 'Mittelgebirgsbereich Rheinland - Pfalz',
  103: 'Saarland',
  110: 'Baden-Württemberg',
  111: 'Oberrhein und unteres Neckartal ',
  112: 'Hohenlohe / mittlerer Neckar / Oberschwaben ',
  113: 'Mittelgebirge Baden - Württemberg',
  120: 'Bayern',
  121: 'Allgäu / Oberbayern / Bay.Wald',
  122: 'Donauniederungen',
  123: 'Bayern nördl.der Donau, o.Bayr.Wald, o.Mainfranken ',
  124: 'Mainfranken'
}

const intensityColors = {
  3: '#e70003',
  '2-3': '#ff8181',
  2: '#ffac00',
  '1-2': '#ffd680',
  1: '#feff00',
  '0-1': '#d8ff9c',
  0: '#35bc23',
  '-1': '#fffff'
}

const intensityLabel = {
  3: 'hohe Belastung',
  '2-3': 'mittlere bis hohe Belastung',
  2: 'mittlere Belastung',
  '1-2': 'geringe bis mittlere Belastung',
  1: 'geringe Belastung',
  '0-1': 'keine bis geringe Belastung',
  0: 'keine Belastung',
  '-1': 'keine Daten'
}

let regionId = 50
let pollenType

if (args.widgetParameter) {
  if (args.widgetParameter.indexOf(',') > -1) {
    const params = args.widgetParameter.split(',')
    regionId = parseInt(params[0])
    pollenType = params[1]
  } else {
    regionId = parseInt(args.widgetParameter)
  }
}

const isPartRegionId = getPartRegionId(regionId)

const date = new Date()
const today = date.toISOString().split('T')[0]

const pollenInfo = await getPollenInfo()

const regionInfo = getRegionPollenInfo()

const widget = await createWidget()
widget.url = 'https://www.dwd.de/DE/leistungen/gefahrenindizespollen/gefahrenindexpollen.html'
if (!config.runsInWidget) {
  await widget.presentSmall()
}

Script.setWidget(widget)
Script.complete()

async function createWidget() {
  let widget = new ListWidget()

  if (config.widgetFamily === 'small') {
    widget = createSmallWidget(widget)
  }

  if (!config.widgetFamily || config.widgetFamily === 'medium') {
    widget = createMediumWidget(widget)
  }

  if (config.widgetFamily === 'large') {
    widget = createMediumWidget(widget)
  }
  
  return widget
}

function createSmallWidget(widget) {
  let intensity
  if (!pollenInfo || !pollenInfo.content) {
    intensity = -1
  } else {
    intensity = getRegionMaxIntensity(pollenType)
  }
  const headline = widget.addText(regions[regionId])
  widget.addSpacer()
  createIntensityLabel(widget, intensity)
  if (pollenType) {
    widget.addSpacer()
    const pollenTypeText = widget.addText(pollenType)
    pollenTypeText.textColor = Color.gray()
    pollenTypeText.font = Font.mediumSystemFont(12)

  }
  return widget
}

function createMediumWidget(widget) {
  const headline = widget.addText('🌳' + regions[regionId] + '🌼')
  widget.addSpacer()
  if (!regionInfo) {
    widget.addText('Keine Daten verfügbar')
    return widget
  }
  const pollenInfoDayLabel = getPollenInfoDayLabel()
  const regionPollenInfo = regionInfo['Pollen']
  const pollenTypes = Object.keys(regionPollenInfo)
  const pollenInfoStack = widget.addStack()
  pollenInfoStack.layoutVertically()
  let pollenInfoStackRow
  for (let index = 0; index < pollenTypes.length; index++) {
    const pollenType = pollenTypes[index];
    if (index % 2 === 0) {
      pollenInfoStackRow = pollenInfoStack.addStack()
    }
    const pollenInfoStackColumn = pollenInfoStackRow.addStack()
    pollenInfoStackColumn.layoutVertically()
    const pollenTypeText = pollenInfoStackColumn.addText(pollenType)
    pollenTypeText.textColor = Color.gray()
    pollenTypeText.font = Font.mediumSystemFont(12)

    const intensity = regionPollenInfo[pollenType][pollenInfoDayLabel]
    createIntensityLabel(pollenInfoStackColumn, intensity)

    if (index % 2 === 0) pollenInfoStackRow.addSpacer()
  }
  return widget
}

function createLargeWidget(widget) {

}

function createIntensityLabel (w, intensity) {
  const intensityText = w.addText(intensityLabel[intensity])
  intensityText.textColor = new Color(intensityColors[intensity])
  intensityText.font = Font.mediumSystemFont(12)
}

function getRegionMaxIntensity(type) {
  if (!regionInfo) return -1
  const pollenInfoDayLabel = getPollenInfoDayLabel()
  let highestIntensity = -1
  const regionPollenInfo = regionInfo['Pollen']
  if (type) {
    return regionPollenInfo[type][pollenInfoDayLabel]
  }
  for (const pollenTyp in regionPollenInfo) {
    if (regionPollenInfo.hasOwnProperty(pollenTyp)) {
      const pollenTypInfo = regionPollenInfo[pollenTyp];
      if (pollenTypInfo[pollenInfoDayLabel] > highestIntensity) highestIntensity = pollenTypInfo[pollenInfoDayLabel]
    }
  }
  return highestIntensity
}

function getPartRegionId (regionId) {
  return ((regionId % 10) !== 0)
}

async function getPollenInfo () {
  
  log(pollenUrl)
  const data = await new Request(pollenUrl).loadJSON()
log(data)
  return data
}

function getRegionPollenInfo() {

  if (!pollenInfo || !pollenInfo.content) return 

  const searchField = (isPartRegionId ? 'partregion_id' : 'region_id')

  for (let index = 0; index < pollenInfo.content.length; index++) {
    const regionPollenInfo = pollenInfo.content[index];
    if (regionPollenInfo[searchField] === regionId) return regionPollenInfo
  }
}

function getPollenInfoDayLabel () {
  const lastUpdated = pollenInfo['last_update']
  const lastUpdatedDate = lastUpdated.substring(0, 10)
  if (today === lastUpdatedDate) return 'today'
  
  return 'tomorrow'
}
