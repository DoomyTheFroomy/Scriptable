// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: cart-plus;

// const url = 'https://lebensmittelwarnung.api.proxy.bund.dev/verbraucherschutz/baystmuv-verbraucherinfo/rest/api/warnings/merged' // // 
const url = 'https://megov.bayern.de/verbraucherschutz/baystmuv-verbraucherinfo/rest/api/warnings/merged'

const lmWarnungUrl = 'https://pbs.twimg.com/profile_images/1097834345035907072/W5egQWjy_400x400.png'

const bauaWarnungUrl = 'https://pbs.twimg.com/profile_images/1581891847789608961/WEboZUsI_400x400.jpg'

const includeFood = true
const includeProducts = true
const authorization = 'baystmuv-vi-1.0 os=ios, key=9d9e8972-ff15-4943-8fea-117b5a973c61'

const bodyReq = {
  "rows": 5,
  "sort": "publishedDate desc, title asc",
//  "start": 11,
//  "fq": [
//     "publishedDate > 1630067654000"
//  ]
}

const lmImg = await fetchImage(lmWarnungUrl)
const bauaImg = await fetchImage(bauaWarnungUrl)

const widget = await createWidget()

if (!config.runsInWidget) {
  await widget.presentMedium()
}

Script.setWidget(widget)
Script.complete()

async function createWidget () {
  const widget = new ListWidget()

  if (config.widgetFamily === 'accessoryCircular') {
//     await createAccessoryCircularWidget(widget)
  }

  if (config.widgetFamily === 'small') {
    await createSmallWidget(widget)
  }

  if (config.widgetFamily === 'accessoryRectangular') {
//     await createAccessoryRectangularWidget(widget)
  }

  if (!config.widgetFamily || config.widgetFamily === 'medium') {
    await createMediumWidget(widget)
  }

  // if (config.widgetFamily === 'large') {
  //   widget = await createMediumWidget(widget)
  // }

  return widget
}

async function createSmallWidget(widget) {
  const docs = await getReports()
  const warning = docs[0]
  const msgStack = widget.addStack()
  msgStack.layoutVertically()
  
  await createProductImage(warning, widget)
    
  
  // msgStack.addText('⚠️')
  // imgStack.applyFittingContentMode()

  msgStack.addSpacer(5)
  widget.url = warning.link
  createMessage(warning, msgStack)
  msgStack.addSpacer()
  createImg(warning, msgStack)
}

async function createMediumWidget (widget) {
//   createHeadline(widget)
//   widget.addSpacer()
  const docs = await getReports()
  const msStack = widget.addStack()
  msStack.layoutHorizontally()
//   msStack.centerAlignContent()
  for(let index = 0; index < 3; ++index) {
    const warning = docs[index]
    console.log(warning)
    const msgStack = msStack.addStack()
    msgStack.centerAlignContent()
    msgStack.cornerRadius = 5
//     msgStack.setPadding(5,5,5,5)
    msgStack.useDefaultPadding()
    msgStack.size = new Size(100, 140)
    msgStack.layoutVertically()
    await createProductImage(warning, msgStack)
  // msgStack.addText('⚠️')
  // imgStack.applyFittingContentMode()
   msgStack.addSpacer(5)
   createMessage(warning, msgStack)
//    
//     createMessage(warning, msgStack)
    msgStack.addSpacer()
    createImg(warning, msgStack)
    
    if(index < 2) {
      msStack.addSpacer()
    }
    
  }
}


async function getReports () {
  const body = {}
  if (includeFood) {
    body.food = bodyReq
  }
  if (includeProducts) {
    body.products = bodyReq
  }
  const headers = {
    accept: 'application/json',
    Authorization: authorization,
    'Content-Type': 'application/json'
  } 
  
  const resp = await fetch(url, {
    body,
    headers,
    method: 'POST'
  })
  console.log(resp)

  const docs = resp.response.docs

  return docs.sort((a,b) => b.publishedDate - a.publishedDate); // b - a for reverse sort
}

function createHeadline (widget) {
  const headlineStack = widget.addStack()
  headlineStack.layoutHorizontally()
  headlineStack.addSpacer()
  headlineStack.url = 'https://www.lebensmittelwarnung.de'
  createImgStack(lmImg, headlineStack)
  headlineStack.addSpacer(5)
  const headline = headlineStack.addText('Meldungen')
  headline.font = Font.headline()
  headline.textColor = Color.blue()
  headline.centerAlignText()
  headlineStack.addSpacer(5)
  createImgStack(bauaImg, headlineStack)
  headlineStack.addSpacer()
}

function createMessage (report, widget) {
  
  const title = report.title
 
  const message = widget.addText(title)
//   widget.backgroundColor = Color.white()
  message.font = Font.boldSystemFont(12)
  message.textColor = Color.black()
  message.shadowColor = Color.white()
  message.shadowOffset = new Point(1,1)
  message.shadowRadius = 2
  
  message.minimumScaleFactor = 0.5
  message.centerAlignText()
  message.url = report.link
//   message.backgroundColor = Color.black()
//   message.textOpacity = 0.5
//   createMessageUrl(report)
  // widget.addSpacer()
// msgStack.addSpacer()
  return widget
}


function createImg (report, widget) {

  if (report._type === '.ProductWarning') {
    return createImgStack(bauaImg, widget)
  }
  
  return createImgStack(lmImg, widget)
}

function createImgStack (img, widget) {
  const imgStack = widget.addImage(img)
//   imgStack.leftAlignImage()
  imgStack.applyFittingContentMode()
  imgStack.cornerRadius = 12
  imgStack.imageSize = new Size(20, 20)
  imgStack.resizable = true
  imgStack.centerAlignImage()
  imgStack.rightAlignImage()
//   imgStack.imageOpacity = 0.5
}

async function createProductImage (warning, widget) {
  if (warning.product && warning.product.imageUrls && warning.product.imageUrls.length > 0) {
    const imgUrl = warning.product.imageUrls[0].replace(/ /g, '%20')
    console.log(imgUrl)
    
    const img = await fetchImage(imgUrl)
    widget.backgroundImage = img
  }
}

async function fetchImage(url) {
  const imgReq = new Request(url)
  const img = await imgReq.loadImage()
  return img
}

async function fetch(url, options = {}) {
  const request = new Request(url)
  request.method = options.method || 'GET'
  if (options.headers) {
    request.headers = options.headers
  }
  if (options.body) {
    request.body = JSON.stringify(options.body)
  }
  const resp = await request.loadJSON()
  return resp
}