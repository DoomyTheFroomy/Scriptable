// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: bell;

/* global ListWidget, Color, config, Request, Script, Font, args */

const regionKey = args.widgetParameter || '031510000000' //'110000000000'

const includeDWD = false
const includeLHP = true

const biwappUrl = 'https://warnung.bund.de/api31/biwapp/mapData.json'
const katwarnUrl = 'https://warnung.bund.de/api31/katwarn/mapData.json'
const mowasUrl = 'https://warnung.bund.de/api31/mowas/mapData.json'
const dwUrl = 'https://warnung.bund.de/api31/dwd/mapData.json'
const lhpUrl = 'https://warnung.bund.de/api31/lhp/mapData.json'

const localUrl = 'https://warnung.bund.de/api31/dashboard/' + regionKey + '.json'

const imgUrl = 'https://warnung.bund.de/assets/images/Apphinweis.png'

const imgReq = new Request(imgUrl)
const img = await imgReq.loadImage()

// const mowasImgUrl = 'https://warnung.bund.de/assets/icons/report_mowas.svg'
// const mowasImgReq = new Request(mowasImgUrl)
// const mowasImg = await mowasImgReq.loadImage()

const widget = await createWidget()

if (!config.runsInWidget) {
  await widget.presentMedium()
}

Script.setWidget(widget)
Script.complete()

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

  // if (config.widgetFamily === 'large') {
  //   widget = await createMediumWidget(widget)
  // }

  return widget
}

async function createAccessoryCircularWidget (widget) {}

async function createSmallWidget (widget) {
  const report = await getLocalReports()
  console.log(report)
//   widget.backgroundImage = img
//   createNinaImg(widget)
//   widget.addSpacer()
  const message = createMessage(report, widget)
  message.font = Font.mediumRoundedSystemFont(16)
  message.centerAlignText()
  
  message.url = createMessageUrl(report)
}

async function createAccessoryRectangularWidget (widget) {}

async function createMediumWidget (widget) {
  // Get Provider Warnings
  const reports = await getProviderReports()
  console.log(reports)

  createHeadline(widget)
  widget.addSpacer()
  for (let index = 0; index < reports.length && index < 4; index++) {
    const report = reports[index]

    createMessage(report, widget)
    if (index < 3) {
      widget.addSpacer()
    }
  }
}

function getReports (providerRes) {
  const alerts = []
  const other = []
  for (let index = 0; index < providerRes.length; index++) {
    const provider = providerRes[index]
    for (let i = 0; i < provider.length; i++) {
      const report = provider[i]
      if (report.type === 'Alert') {
        alerts.push(report)
      } else {
        other.push(report)
      }
    }
  }

  alerts.sort(function (a, b) {
    // Turn your strings into dates, and then subtract them
    // to get a value that is either negative, positive, or zero.
    return new Date(b.startDate) - new Date(a.startDate)
  })
  other.sort(function (a, b) {
    return new Date(b.startDate) - new Date(a.startDate)
  })
  return alerts.concat(other)
}

async function getProviderReports () {
  // Get Provider Warnings
  const biwappRes = await fetch(biwappUrl)
  console.log(biwappRes)
  const katwarnRes = await fetch(katwarnUrl)
  console.log(katwarnRes)
  const mowasRes = await fetch(mowasUrl)
  console.log(mowasRes)

  const dwdRes = (includeDWD ? await fetch(dwUrl) : [])
  console.log(dwdRes)
  const lhpRes = (includeLHP ? await fetch(lhpUrl) : [])
  console.log(lhpRes)

  const reports = getReports([biwappRes, katwarnRes, mowasRes, dwdRes, lhpRes])

  return reports
}

async function getLocalReports () {
  const res = await fetch(localUrl)
  console.log(res)
  
  if (res.length > 0) {
    return res[0]
//     const reports = getReports(res)
//     return reports[0]
  }
  
  return {"i18nTitle": {"de": "Keine Meldung vorhanden"},"type": "NoMessage"}
}

async function fetch (url) {
  const req = new Request(url)
  const res = await req.loadJSON()
  return res
}

function getReportColor (report) {
//   if (report.payload) report = report.payload
// console.log(report.payload.type)
  if (report.type === 'Alert' || (report.payload && report.payload.type === 'ALERT')) {
    return Color.red()
  }
  if (report.type === 'Update') {
    return Color.orange()
  }
  if (report.type === 'Cancel') {
    return Color.green()
  }
  if (report.type === 'NoMessage') {
    return Color.green()
  }
}

function getReportIcon (report) {
  console.log(report.type)
  if (report.type === 'Alert' || (report.payload && report.payload.type === 'ALERT')) {
    return '‼️'
  }
  if (report.type === 'Update') {
    return '⚠️'
  }
  if (report.type === 'Cancel') {
    return '❎'
  }
  if (report.type === 'NoMessage') {
    return ''
  }
}

function createHeadline (widget) {
  const headlineStack = widget.addStack()
  headlineStack.layoutHorizontally()
  headlineStack.url = 'https://warnung.bund.de/meldung'
  const headline = headlineStack.addText('Warnmeldungen')
  headline.font = Font.headline()
  headline.textColor = new Color('#fb8c00')
  headline.centerAlignText()
  headlineStack.addSpacer()
  createNinaImg(headlineStack)
}

function createNinaImg (widget) {
  const imgStack = widget.addImage(img)
  imgStack.rightAlignImage()
  imgStack.applyFittingContentMode()
}

function createMessageUrl (report) {
  const msg = report.i18nTitle.de
  const id = report.id

  const url = (id ? 'https://warnung.bund.de/meldung/' + id + '/' + encodeURIComponent(msg.replace(/ /g, '_')) : 'https://warnung.bund.de/meldung')

  console.log(url)
  return url
}

function createMessage (report, widget) {
  // const msgStack = widget.addStack()
  // msgStack.layoutHorizontally()
  // msgStack.addText('⚠️')
  // imgStack.applyFittingContentMode()
  console.log(report.i18nTitle)
  const title = report.i18nTitle
  const msg = title.de
  console.log(msg)
  const message = widget.addText(getReportIcon(report) + ' ' + report.i18nTitle.de)
  message.textColor = getReportColor(report)
  message.font = Font.mediumRoundedSystemFont(10)
  message.minimumScaleFactor = 0.5

  message.url = createMessageUrl(report)
  // widget.addSpacer()

  return message
}
