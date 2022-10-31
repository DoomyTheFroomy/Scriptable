// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: theater-masks;

/* global Request ListWidget Color Font Script config */

const textColor = Color.red()

const radioTeddyNowPlayingUrl = 'https://np.radioplayer.de/qp/v3/onair?rpIds=57&nameSize=200&artistNameSize=200&descriptionSize=200'
const appleMusicSearchUrl = 'https://tools.applemediaservices.com/api/apple-media/music/DE/search.json?types=songs&limit=25&l=en-US'
const radioTeddyShowInfoUrl = 'https://webplayer.radioteddy.de/currentshow.php'
const defaultShowImageUrl = 'https://webplayer.radioteddy.de/livestream/img/teddy-default-cover-2019.png'
const radioTeddyAppleMusicStationUrl = 'https://music.apple.com/de/station/radio-teddy/ra.1460998005'

const radioTeddyShows = {
  'Radio TEDDY Zahnputzhit': 'https://www.radioteddy.de/fileadmin/_processed_/csm_Zahnputzhit_Teaser2018_474db4a039.jpg',
  'Radio TEDDY mit Hörspielen und Geschichten': 'https://www.radioteddy.de/fileadmin/_processed_/csm_Hoerspiele_und_Geschichten_Teaser_aae960aaf3.jpg',
  'Der Radio TEDDY-Familiennachmittag': 'https://www.radioteddy.de/fileadmin/_processed_/csm_Familiennachmittag_Teaser2018_b361760641.jpg',
  'Radio Teddy Morgenshow': 'https://www.radioteddy.de/fileadmin/_processed_/csm_Morgenshow_Teaser2018_d3dbb22c6a.jpg',
  'Radio Teddy-Morgenshow': 'https://www.radioteddy.de/fileadmin/_processed_/csm_Morgenshow_Teaser2018_d3dbb22c6a.jpg',
  'Die Radio TEDDY-Morgenshow': 'https://www.radioteddy.de/fileadmin/_processed_/csm_Morgenshow_Teaser2018_d3dbb22c6a.jpg',
  'Deutsch-Pop-Nonstop': 'https://www.radioteddy.de/fileadmin/_processed_/csm_Deutsch-Pop-Nonstop_Teaser_dbc7595e25.jpg',
  'Deutsch Pop Nonstop': 'https://www.radioteddy.de/fileadmin/_processed_/csm_Deutsch-Pop-Nonstop_Teaser_dbc7595e25.jpg',
  'Deutsch-Pop Nonstop': 'https://www.radioteddy.de/fileadmin/_processed_/csm_Deutsch-Pop-Nonstop_Teaser_dbc7595e25.jpg',
  'Deutsch-Pop-Nonstop (WE)': 'https://www.radioteddy.de/fileadmin/_processed_/csm_Deutsch-Pop-Nonstop_Teaser_dbc7595e25.jpg',
  'Der Radio TEDDY-Familiensamstag & -sonntag': 'https://www.radioteddy.de/fileadmin/_processed_/csm_Familiensamstag_und_-sonntag_teaser_b74d6d08d4.jpg',
  'Der Radio TEDDY-Familiensamstag': 'https://www.radioteddy.de/fileadmin/_processed_/csm_Familiensamstag_und_-sonntag_teaser_b74d6d08d4.jpg',
  'Radio TEDDY von 10 bis 2': 'https://www.radioteddy.de/fileadmin/_processed_/csm_RadioTEDDYVon9bis2_Teaser2018_ee0e2915d7.jpg',
  'Der Radio TEDDY-Familiensonntag': 'https://www.radioteddy.de/fileadmin/_processed_/csm_Familiensamstag_und_-sonntag_teaser_b74d6d08d4.jpg',
  'Radio TEDDY von 9 bis 2': 'https://www.radioteddy.de/fileadmin/_processed_/csm_RadioTEDDYVon9bis2_Teaser2018_ee0e2915d7.jpg'
}

loadRadioTeddyChannelInfo() // eslint-disable-line

async function createWidget (widgetInfo) {
  console.log(widgetInfo)
  let imgURL = widgetInfo.imgUrl
  const w = new ListWidget()
  if (imgURL) {
    imgURL = imgURL.replace('{w}', '1000').replace('{h}', '1000')
    console.log(imgURL)
    const imgReq = new Request(imgURL)
    const img = await imgReq.loadImage()
    w.backgroundImage = img
  }
  w.backgroundColor = Color.black()// new Color('#b00a0f')
  // w.backgroundGradient = gradient
  // // Add spacer above content to center it vertically.
  // w.addSpacer()
  // // Show article headline.
  if (widgetInfo.title) {
    const titleTxt = w.addText(widgetInfo.title)
    titleTxt.font = Font.boldSystemFont(16)
    titleTxt.textColor = textColor
    // // Add spacing below headline.
    w.addSpacer(8)
  }
  // // Show authors.
  if (widgetInfo.author) {
    const authorsTxt = w.addText(widgetInfo.author)
    authorsTxt.font = Font.mediumSystemFont(12)
    authorsTxt.textColor = textColor
    authorsTxt.textOpacity = 0.9
    // // Add spacing below authors.
    w.addSpacer(2)
  }

  if (widgetInfo.actionUrl) {
    console.log(widgetInfo.actionUrl)
    w.url = widgetInfo.actionUrl
  }

  if (!config.runsInWidget) {
    await w.presentMedium()
  }
  // Tell the system to show the widget.
  Script.setWidget(w)
  // loadRadioTeddyChannelInfo()
  Script.complete()
}

async function loadRadioTeddyChannelInfo () {
  // const currentTime = (new Date()).getTime()
  // currentTime = currentTime.substring(0, 11)
  const req = new Request(radioTeddyNowPlayingUrl)
  req.method = 'GET'
  let radioTeddyResponse = await req.loadString()
  console.log(radioTeddyResponse)
  radioTeddyResponse = radioTeddyResponse.replace('callback(', '')
  radioTeddyResponse = radioTeddyResponse.substring(0, radioTeddyResponse.length - 1)
  console.log(radioTeddyResponse)
  try {
    radioTeddyResponse = JSON.parse(radioTeddyResponse)
  } catch (error) {
    console.error(error)
    return
  }

  if (radioTeddyResponse.results['57'].length === 1) {
    // Script.complete()
    await createShowInfoWidget()
    return // loadRadioTeddyChannelInfo()
  }

  // return
  const titleInfo = radioTeddyResponse.results['57'][1]

  await findInAppleMusic(titleInfo)
}

async function findInAppleMusic (titleInfo) {
  const interpret = (titleInfo.artistName || '')
  const title = (titleInfo.name || '')
  const term = '&term=' + encodeURIComponent(interpret) + '+' + encodeURIComponent(title)
  console.log(term)
  const req = new Request(appleMusicSearchUrl + term)
  req.method = 'GET'
  const appleMusicSearchResp = await req.loadJSON()
  console.log(appleMusicSearchResp)
  if (!appleMusicSearchResp.songs) {
    await createShowInfoWidget()
    return
  }
  const appleMusicTitleInfo = appleMusicSearchResp.songs.data[0]
  console.log(appleMusicTitleInfo)
  await createWidget({
    imgUrl: appleMusicTitleInfo.attributes.artwork.url,
    title: appleMusicTitleInfo.attributes.artistName,
    author: appleMusicTitleInfo.attributes.name,
    actionUrl: appleMusicTitleInfo.attributes.url
  })
}

async function createShowInfoWidget () {
  const req = new Request(radioTeddyShowInfoUrl)
  req.method = 'GET'
  const showInfoResp = await req.loadJSON()
  console.log(showInfoResp)
  // https://webplayer.radioteddy.de/livestream/img/teddy-default-cover-2019.png
  await createWidget({
    imgUrl: radioTeddyShows[showInfoResp.sendung] || defaultShowImageUrl,
    title: showInfoResp.sendung,
    author: showInfoResp.moderator1 + (showInfoResp.moderator2 ? ' & ' + showInfoResp.moderator2 : ''),
    actionUrl: radioTeddyAppleMusicStationUrl
  })
}
