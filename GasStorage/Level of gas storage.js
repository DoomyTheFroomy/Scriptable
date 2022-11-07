// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: database;
/* global ListWidget, Color, config,  Data, Image, Request, Script, Font, FileManager, importModule, Size */

// AGSI (Storage Inventory): https://agsi.gie.eu/api
// ALSI (LNG Inventory) : https://alsi.gie.eu/api

const apiKey = '0a85529e722d26ac23c0f7923796788b'
const apiBase = 'https://agsi.gie.eu/api' // AGSI
const countryName = 'Germany'
const country = 'de'

const GasStorageData = await getService(
  'GasStorageData',
  'https://raw.githubusercontent.com/DoomyTheFroomy/Scriptable/main/utils/GasStorageData.js',
  false
)

/// /////////////////////////////////////////////////

const widget = await createWidget()

if (!config.runsInWidget) {
  await widget.presentMedium()
}

Script.setWidget(widget)
Script.complete()

// -----------
// Function
// -----------

async function createWidget () {
  const widget = new ListWidget()

  if (config.widgetFamily === 'accessoryCircular') {
    await createAccessoryCircularWidget(widget)
  }

  if (config.widgetFamily === 'small') {
    await createSmallWidget(widget)
  }

  if (config.widgetFamily === 'accessoryRectangular') {
    await createAccessoryRectangularWidget(widget)
  }

  if (!config.widgetFamily || config.widgetFamily === 'medium') {
    await createMediumWidget(widget)
  }

  // if (config.widgetFamily !== 'accessoryRectangular') {
  //   widget.setPadding(10, 10, 10, 10)
  // }

  // if (config.widgetFamily === 'small' ||
  //   config.widgetFamily === 'accessoryCircular') {
  //   widget = await createSmallWidget(widget)
  // }

  // if (!config.widgetFamily ||
  //   config.widgetFamily === 'medium' ||
  //   config.widgetFamily === 'accessoryRectangular') {
  //   widget = await createMediumWidget(widget)
  // }

  // if (config.widgetFamily === 'large') {
  //   widget = await createMediumWidget(widget)
  // }

  // if (config.widgetFamily !== 'accessoryCircular' || config.widgetFamily === 'small') {

  // }

  return widget
}

async function createAccessoryCircularWidget (widget) {
  const gasStorageData = new GasStorageData(apiBase, country, {
    apiKey,
    countryName,
    loadCompanyList: false
  })

  await gasStorageData.loadData()

  // const currentPercent = gasStorageData.countryGasStorageLevel.full
  await createCountryCircle(widget, gasStorageData.countryGasStorageLevel)

//   widget.addAccessoryWidgetBackground()
}

async function createSmallWidget (widget) {
  const gasStorageData = new GasStorageData(apiBase, country, {
    apiKey,
    countryName,
    loadCompanyList: false
  })

  await gasStorageData.loadData()

  // const currentPercent = gasStorageData.countryGasStorageLevel.full
  await createCountryCircle(widget, gasStorageData.countryGasStorageLevel)
  createReportedStack(widget, new Date(gasStorageData.countryGasStorageLevel.gasDayStart))
}

async function createAccessoryRectangularWidget (widget) {
  const gasStorageData = new GasStorageData(apiBase, country, {
    apiKey,
    countryName,
    loadCompanyList: false
  })

  await gasStorageData.loadData()
  widget.addText(gasStorageData.countryGasStorageLevel.name)

  widget.addText('💿: ' + gasStorageData.countryGasStorageLevel.full + '%')
  widget.addText('🔥: ' + gasStorageData.countryGasStorageLevel.consumptionFull + '%')
  //widget.addAccessoryWidgetBackground()
}

async function createMediumWidget (widget) {
  const gasStorageData = new GasStorageData(apiBase, country, {
    apiKey,
    countryName,
    loadCompanyList: true
  })

  await gasStorageData.loadData()

  const companiesOrdered = gasStorageData.orderedCompanyList
  console.log(companiesOrdered)

  const main = widget.addStack()
  main.layoutHorizontally()

  const left = main.addStack()
  left.layoutVertically()
  await createCountryCircle(left, gasStorageData.countryGasStorageLevel)
  console.log(gasStorageData.countryGasStorageLevel)
  //   console.log(gasStorageData.countryGasStorageLevel.trend)
  createReportedStack(left, new Date(gasStorageData.countryGasStorageLevel.gasDayStart))
  main.addSpacer()
  if (!companiesOrdered) return
  const right = main.addStack()
  right.layoutVertically()

  right.addText('Lowest Gas Storages').font = Font.semiboldRoundedSystemFont(10)
  right.addSpacer()
  const size = (companiesOrdered.length > 2 ? 3 : companiesOrdered.length)

  for (let index = 0; index < size; index++) {
    if (index > 0) right.addSpacer()
    const company = companiesOrdered[index]
    createCompanyInformation(right, company)
  }

  main.addSpacer(10)
}

/**
 *
 * @param {ListWidget | WidgetStack} widget
 * @param {Object} company
 * @returns
 */
async function createCountryCircle (widget, company = {}) {
  const currentPercent = company.full || 0
  const Circle = await getService(
    'Circle',
    'https://raw.githubusercontent.com/DoomyTheFroomy/Scriptable/main/utils/Circle.js',
    true
  )
  console.log(currentPercent)
  const stackSize = (config.widgetFamily && config.widgetFamily.indexOf('accessory') > -1) ? new Size(60, 60) : new Size(140, 140)
  const circle = new Circle(currentPercent, {
    fillColor: new Color('#005EB8', 1)
  })

  const circleStack = circle.draw(widget, {
    size: stackSize,
    padding: 0
  })

  const text = circleStack.addText(currentPercent + '%')
  text.textColor = getTextColorByTrend(company)
  if (config.widgetFamily && config.widgetFamily.indexOf('accessory') > -1) {
    text.font = Font.mediumRoundedSystemFont(10)
  }
  return circleStack
}

/**
 *
 * @param {ListWidget | WidgetStack} widget
 * @param {Date} date
 * @returns {WidgetStack}
 */
function createReportedStack (widget, date) {
  const reportedStack = widget.addStack()
  reportedStack.layoutHorizontally()
  reportedStack.addSpacer()
  const labelTxt = reportedStack.addText('Reported:')
  labelTxt.font = Font.ultraLightSystemFont(8)
  // labelTxt.rightAlignText()
  const srcText = reportedStack.addDate(date)
  srcText.font = Font.ultraLightSystemFont(8)
  // srcText.rightAlignText()

  return reportedStack
}

function createCompanyInformation (widget, company) {
  let image
  console.log(company)
  if (company.image) {
    const data = Data.fromBase64String(company.image)
    image = Image.fromData(data)
  }
  const companyStack = widget.addStack()
  companyStack.layoutVertically()

  const nameStack = companyStack.addStack()
  nameStack.layoutHorizontally()
  if (image) {
    nameStack.addImage(image)
    nameStack.addSpacer(2)
  }
  const nameTxt = nameStack.addText(company.name)
  setTextOptions(nameTxt, company)
  nameTxt.font = Font.semiboldRoundedSystemFont(10)
  nameTxt.leftAlignText()

  const valueStack = companyStack.addStack()
  valueStack.layoutHorizontally()
  const fullTxt = valueStack.addText(company.full + '%')
  setTextOptions(fullTxt, company)
  const trendTxt = valueStack.addText(' (' + getTrendLabel(company) + ')')
  setTextOptions(trendTxt, company)
}

function getTextColorByTrend (company) {
  const trend = Number.parseFloat(company.trend)
  if (trend === 0) {
    return Color.orange()
  }
  if (trend > 0) {
    return Color.green()
  }
  if (trend < 0) {
    return Color.red()
  }
}

function getTrendLabel (company) {
  const trend = Number.parseFloat(company.trend)
  if (trend === 0) {
    return '↔︎'
  }
  if (trend > 0) {
    return '↑'
  }
  if (trend < 0) {
    return '↓'
  }
  return '❓'
}

function setTextOptions (text, company) {
  //   text.minimumScaleFactor = 0.5
  text.font = Font.mediumRoundedSystemFont(10) // Font.thinSystemFont(10)
  text.textColor = getTextColorByTrend(company)
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
