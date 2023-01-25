// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: tint;
/* global ListWidget, Color, config, Location, args, Request, Script, Font, FileManager, importModule, Size */

let url = 'https://www.pegelonline.wsv.de/webservices/rest-api/v2/stations.json?radius=30&includeCurrentMeasurement=true&includeTimeseries=true&includeCharacteristicValues=true'

let testId// = '570620'

if (args.widgetParameter || testId) {
  const ids = args.widgetParameter || testId
  console.log(args.widgetParameter)
  url += '&ids=' + ids
} else {
  const currentLocation = await Location.current()
  console.log(currentLocation)
  url += '&latitude=' + currentLocation.latitude + '&longitude=' + currentLocation.longitude
}

if (config.widgetFamily === 'small' || config.widgetFamily === 'accessoryRectangular' || config.widgetFamily === 'accessoryCircular') {
  url += '&limit=1&offset=0'
} else if (config.widgetFamily === 'large') {
  url += '&limit=10&offset=0'
} else {
  url += '&limit=4&offset=0'
}

const trend = {
  '-1': '↓',
  0: '↔︎',
  1: '↑',
  '-999': '❓'
}

console.log(url)

const reqStations = new Request(url)
const res = await reqStations.loadJSON()

// console.log(res)

const closestStation = res[0]

if (!closestStation) {
  const widget = new ListWidget()
  widget.addText('Keine Station gefunden!').font = Font.headline()
  widget.addText('Eventuell wurde eine falsche Stations-ID angegeben, oder in Ihrer Nähe befindet sich keine Station').font = Font.body()
  Script.setWidget(widget)
  Script.complete()
  return
}

const csTimeseries = closestStation.timeseries[0]
const csCurrentMeasurement = csTimeseries.currentMeasurement
const csCharacteristicValues = csTimeseries.characteristicValues
const currentLevel = csCurrentMeasurement.value

let low = 0
let lowLabel
let high = 600
let highLabel
let middle = 250

for (let index = 0; index < csCharacteristicValues.length; index++) {
  const characteristicValue = csCharacteristicValues[index]
  if (characteristicValue.shortname === 'NNW') {
    low = characteristicValue.value
    lowLabel = characteristicValue.shortname
  }
  if (characteristicValue.shortname === 'HHW') {
    high = characteristicValue.value
    highLabel = characteristicValue.shortname
  }
  if (characteristicValue.shortname === 'MW') {
    middle = characteristicValue.value
  }
  if (!low && characteristicValue.shortname === 'MNW') {
    low = characteristicValue.value
    lowLabel = characteristicValue.shortname
  }
  if (!high && characteristicValue.shortname === 'MHW') {
    high = characteristicValue.value
    highLabel = characteristicValue.shortname
  }
}

console.log(low)
console.log(middle)
console.log(high)
console.log(currentLevel)

let max
const lowPercent = {}
const highPercent = {}

if (currentLevel < middle) { // Level low
  max = Math.floor(middle + (middle * 10 / 100))
  lowPercent.percent = Math.floor(low * 100 / max)
  lowPercent.label = lowLabel
  lowPercent.color = Color.orange()

  highPercent.percent = Math.floor(middle * 100 / max)
  highPercent.label = 'MW'
  highPercent.color = Color.green()
} else if (currentLevel > high) {
  max = Math.floor(currentLevel + (currentLevel * 10 / 100))
  lowPercent.percent = Math.floor(middle * 100 / max)
  lowPercent.label = 'MW'
  lowPercent.color = Color.green()

  highPercent.percent = Math.floor(high * 100 / max)
  highPercent.label = highLabel
  highPercent.color = Color.red()
} else {
  max = Math.floor(high + (high * 10 / 100))
  lowPercent.percent = Math.floor(middle * 100 / max)
  lowPercent.label = 'MW'
  lowPercent.color = Color.green()

  highPercent.percent = Math.floor(high * 100 / max)
  highPercent.label = highLabel
  highPercent.color = Color.red()
}

const currentPercent = Math.floor(currentLevel * 100 / max)

console.log(currentPercent)

const widget = await createWidget()
if (config.runsInAccessoryWidget && !config.runsInWidget) {
//   widget.addAccessoryWidgetBackground()
}
widget.url = 'www.pegelonline.wsv.de'

if (!config.runsInWidget) {
  await widget.presentMedium()
}

Script.setWidget(widget)
Script.complete()

async function createWidget () {
  let widget = new ListWidget()
  if (config.widgetFamily !== 'accessoryRectangular') {
    widget.setPadding(10, 10, 10, 10)
  }

  if ( config.widgetFamily === 'small') {
    widget = await createSmallWidget(widget)
  }
    
    
    if (config.widgetFamily === 'accessoryCircular') {
    widget = await createCircularWidget(widget)
  }

  if (!config.widgetFamily || config.widgetFamily === 'medium' ||
    config.widgetFamily === 'accessoryRectangular') {
    widget = await createMediumWidget(widget)
  }

  if (config.widgetFamily === 'large') {
    widget = await createMediumWidget(widget)
  }

  if (config.widgetFamily !== 'accessoryCircular') {
    const srcText = widget.addText('Quelle: www.pegelonline.wsv.de')
    srcText.font = Font.ultraLightSystemFont(8)
    srcText.rightAlignText()
  }

  return widget
}

async function createMediumWidget (widget) {
  const stack = widget.addStack()
  stack.layoutHorizontally()

  if (config.widgetFamily !== 'accessoryRectangular') {
    const circleStack = stack.addStack()
    circleStack.layoutVertically()
    await createSmallWidget(circleStack)
  }

  // stack.addSpacer()

  const valueStack = stack.addStack()
  valueStack.layoutVertically()
  valueStack.setPadding(10, 10, 10, 10)
  for (let index = 0; index < res.length; index++) {
    if (index !== 0) valueStack.addSpacer()
    const station = res[index]
    const name = station.longname
    const timeseries = station.timeseries[0]
    const measurement = timeseries.currentMeasurement
    const unit = timeseries.unit
    const level = measurement.value

    const text = valueStack.addText(name)
    setTextOptions(text, measurement)
    log(measurement)
    const trendIco = trend[measurement.trend] || trend['-999']
    const value = valueStack.addText(level + unit + ' (' + trendIco + ')')
    setTextOptions(value, measurement)
  }
  valueStack.centerAlignContent()

  return widget
}

async function createSmallWidget (widget) {
//   widget.layoutVertically()
  const Circle = await getService(
    'Circle',
    'https://raw.githubusercontent.com/DoomyTheFroomy/Scriptable/main/utils/Circle.js',
    true
  )
  const name = widget.addText(closestStation.longname)
  name.font = Font.mediumRoundedSystemFont(8)
  name.centerAlignText()
  const stackSize =  new Size(135, 135)
  const circle = new Circle(currentPercent, {
    fillColor: new Color('#005EB8', 1),
    strokeColor: new Color('#333333', 0.4),
    characteristics: [
      lowPercent,
      highPercent
    ]
  })
  const circleStack = circle.draw(widget, {
    size: stackSize,
    padding: 0
  })
  
  const text = circleStack.addText(currentLevel + csTimeseries.unit)
  text.textColor = getTextColorByState(csCurrentMeasurement)


  return widget
}

async function createCircularWidget (widget) {
//   widget.layoutVertically()
  const Circle = await getService(
    'Circle',
    'https://raw.githubusercontent.com/DoomyTheFroomy/Scriptable/main/utils/Circle.js',
    true
  )
  
  const stackSize = new Size(60, 60)
  const circle = new Circle(currentPercent, {
    fillColor: new Color('#333333', 1),
    strokeColor: new Color('#333333', 0.4),
    characteristics: [
      lowPercent,
      highPercent
    ]
  })
  const circleStack = circle.draw(widget, {
    size: stackSize,
    padding: 0
  })
  // const stack = widget.addStack();
  // stack.size = new Size(65, 65);
  // stack.addText(currentLevel + '')
  // // stack.backgroundImage = canvas.getImage();
  // const padding = 0;
  // stack.setPadding(padding, padding, padding, padding);
  // stack.centerAlignContent();
  const text = circleStack.addText(currentLevel + csTimeseries.unit)
  text.textColor = getTextColorByState(csCurrentMeasurement)

  text.font = Font.lightRoundedSystemFont(10)
  return widget
}

function getTextColorByState (measurement) {
  const state = measurement.stateMnwMhw !== 'unknown' ? measurement.stateMnwMhw : measurement.stateNswHsw
  if (state === 'low') {
    return Color.orange()
  }
  if (state === 'normal') {
    return Color.green()
  }
  if (state === 'high') {
    return Color.red()
  }
  if (state === 'unknown' || state === 'commented' || state === 'out-dated') {
    return Color.yellow()
  }
}

function setTextOptions (text, measurement) {
//   text.minimumScaleFactor = 0.5
  text.font = Font.mediumRoundedSystemFont(10) // Font.thinSystemFont(10)
  text.textColor = getTextColorByState(measurement)
  text.textOpacity = 1
}

// get library from local filestore or download it once
// taken from https://gist.github.com/Sillium
async function getService (name, url, forceDownload = false) {
  const fm = FileManager.local()
  const scriptDir = module.filename.replace(fm.fileName(module.filename, true), '')
  const serviceDir = fm.joinPath(scriptDir, 'lib/service/' + name)

  if (!fm.fileExists(serviceDir)) {
    fm.createDirectory(serviceDir, true)
  }

  const libFile = fm.joinPath(scriptDir, 'lib/service/' + name + '/index.js')

  if (fm.fileExists(libFile) && !forceDownload) {
    fm.downloadFileFromiCloud(libFile)
  } else {
    // download once
    const indexjs = await loadText(url)
    fm.write(libFile, indexjs)
  }

  const service = importModule('lib/service/' + name)

  return service
}

// helper function to download a text file from a given url
async function loadText (textUrl) {
  const req = new Request(textUrl)
  return await req.load()
}
