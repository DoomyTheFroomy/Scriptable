/* global Color, Size, DrawContext, Point, Rect, Path */

/**
 * Circle canvas for Scriptable
 * @author Martin Rudolph <DoomyTheFroomy@users.noreply.github.com>
 * @docauthor Martin Rudolph <DoomyTheFroomy@users.noreply.github.com>
 * @see {@link https://docs.scriptable.app| Scriptable Docs}
 * @see {@link https://gist.githubusercontent.com/Sillium/4210779bc2d759b494fa60ba4f464bd8/raw/| Base Circle Script}
 */
class Circle {
  /**
   * Construct a new Canvas Circle
   * @param {Number} percent
   * @param {Object} options
   * @param {Number} [options.size=200] Canvas Size (width and height)
   * @param {Number} [options.lineWidth=18] Line width of the circle
   * @param {Number} [options.radius=80] Radius of the circle
   * @param {Color}  [options.fillColor=Color.white()] Color of the given percent
   * @param {Color}  [options.strokeColor=new Color("#333333")] Color of the complete circle(-background)
   * @param {Array<CharacteristicLine>} [options.characteristics] Characteristic Lines to be displayed at the circle
   */
  constructor (percent, options) {
    console.log(percent)
    console.log(options)
    this.canvas = new DrawContext()
    this.canvasSize = options.size || 200
    this.canvas.opaque = false
    this.canvasWidth = options.lineWidth || 18 // circle thickness
    this.canvasRadius = options.radius || 80 // circle radius
    this.canvas.size = new Size(this.canvasSize, this.canvasSize)
    this.canvas.respectScreenScale = true

    this.deg = Math.floor(percent * 3.6)

    this.center = new Point(this.canvasSize / 2, this.canvasSize / 2)
    this.backgroundX = this.center.x - this.canvasRadius
    this.backgroundY = this.center.y - this.canvasRadius
    this.backgroundWidth = 2 * this.canvasRadius
    this.backgroundCircle = new Rect(this.backgroundX, this.backgroundY, this.backgroundWidth, this.backgroundWidth)

    this.canvas.opaque = false

    this.canvas.setFillColor(options.fillColor || Color.white())
    this.canvas.setStrokeColor(options.strokeColor || new Color('#333333'))
    this.canvas.setLineWidth(this.canvasWidth)
    this.canvas.strokeEllipse(this.backgroundCircle)

    // Fill the circle with given percent
    for (let fill = 0; fill < this.deg; fill++) {
      const rectX = this.center.x + this.canvasRadius * Circle.sinDeg(fill) - this.canvasWidth / 2
      const rectY = this.center.y - this.canvasRadius * Circle.cosDeg(fill) - this.canvasWidth / 2
      const rectR = new Rect(rectX, rectY, this.canvasWidth, this.canvasWidth)
      this.canvas.fillEllipse(rectR)
    }

    if (options.characteristics) {
      for (let index = 0; index < options.characteristics.length; index++) {
        const characteristic = options.characteristics[index]
        this.drawCharacteristic(characteristic)
      }
    }
  }

  /**
   * draw the circle
   * @param {ListWidget | WidgetStack} widget
   * @param {Object} options
   * @param {Size} options.size - new Stack size
   * @param {Number} [options.padding=0] - Padding inside the stack
   * @returns {WidgetStack} stack that was added to the given widget
  */
  draw (widget, options) {
    const circle = this
    const stack = widget.addStack()
    stack.size = options.size
    stack.backgroundImage = circle.canvas.getImage()
    const padding = options.padding || 0
    stack.setPadding(padding, padding, padding, padding)
    stack.centerAlignContent()

    return stack
  }

  /**
   * draws a characteristic line on the circle
   * @param {CharacteristicLine} characteristic
   */
  drawCharacteristic = function (characteristic) {
    const circle = this

    const path = circle.createCharacteristicCircleLine(characteristic)

    circle.canvas.addPath(path)
    circle.canvas.setStrokeColor(characteristic.color || Color.orange())
    circle.canvas.setLineWidth(5)
    circle.canvas.strokePath()
    if (characteristic.label) {
      circle.canvas.setTextColor(characteristic.color || Color.orange())
      circle.canvas.setFontSize(8)
      circle.canvas.drawText(characteristic.label, characteristic.p2)
    }
  }

  /**
 *
 * @param {CharacteristicLine} characteristic - the line to be created
 * @returns {Path} line - the corresponding line
 */
  createCharacteristicCircleLine (characteristic) {
    const circle = this
    const center = circle.center
    const radius = circle.canvasRadius
    const width = circle.canvasWidth

    const deg = Math.floor(characteristic.percent * 3.6)

    const p1X = center.x + (radius + width) * Circle.sinDeg(deg)
    const p1Y = center.y - (radius + width) * Circle.cosDeg(deg)
    const p1 = new Point(p1X, p1Y)
    characteristic.p1 = p1
    const path = new Path()
    path.move(p1)

    const p2X = center.x + (radius - width) * Circle.sinDeg(deg)
    const p2Y = center.y - (radius - width) * Circle.cosDeg(deg)
    const p2 = new Point(p2X, p2Y)
    characteristic.p2 = p2
    path.addLine(p2)

    return path
  }

  static sinDeg (deg) {
    return Math.sin((deg * Math.PI) / 180)
  }

  static cosDeg (deg) {
    return Math.cos((deg * Math.PI) / 180)
  }
}

module.exports = Circle

/**
 * @typedef CharacteristicLine
 * @type {Object}
 * @property {String} label - Label of the Line
 * @property {Number} percent - Percent where the line should be displayed
 * @property {Color} color - Color of the line and label
 * @example
 * {
    "label": "Low",
    "percent": 39.5,
    "color": Color.orange()
  }
 */

/**
 *

async function drawArc(
  widget,
  percent,
  options = {}
) {
  console.log(percent)
  console.log(options)
  const canvSize = options.size || 200
  const canvas = new DrawContext()
  canvas.opaque = false
  const canvWidth = options.lineWidth || 18 // circle thickness
  const canvRadius = options.radius || 80 // circle radius
  canvas.size = new Size(canvSize, canvSize)
  canvas.respectScreenScale = true

  const deg = Math.floor(percent * 3.6)

  const ctr = new Point(canvSize / 2, canvSize / 2)
  const bgx = ctr.x - canvRadius
  const bgy = ctr.y - canvRadius
  const bgd = 2 * canvRadius
  const bgr = new Rect(bgx, bgy, bgd, bgd)

  canvas.opaque = false

  canvas.setFillColor(options.fillColor || Color.white())
  canvas.setStrokeColor(options.strokeColor || new Color('#333333'))
  canvas.setLineWidth(canvWidth)
  canvas.strokeEllipse(bgr)

  // Fill the circle with given percent
  for (t = 0; t < deg; t++) {
    const rect_x = ctr.x + canvRadius * sinDeg(t) - canvWidth / 2
    const rect_y = ctr.y - canvRadius * cosDeg(t) - canvWidth / 2
    const rect_r = new Rect(rect_x, rect_y, canvWidth, canvWidth)
    canvas.fillEllipse(rect_r)
  }

  const drawCharacteristic = function (characteristic) {
    const lowDeg = Math.floor(characteristic.percent * 3.6)

    //     x = cx + r * cos(a)
    //     y = cy + r * sin(a)
    const p1_x = ctr.x + (canvRadius + canvWidth) * sinDeg(lowDeg)
    const p1_y = ctr.y - (canvRadius + canvWidth) * cosDeg(lowDeg)
    const p1 = new Point(p1_x, p1_y)
    const path = new Path()
    path.move(p1)

    const p2_x = ctr.x + (canvRadius - canvWidth) * sinDeg(lowDeg)
    const p2_y = ctr.y - (canvRadius - canvWidth) * cosDeg(lowDeg)
    const p2 = new Point(p2_x, p2_y)
    path.addLine(p2)

    canvas.addPath(path)
    canvas.setStrokeColor(characteristic.color || Color.orange())
    canvas.setLineWidth(5)
    canvas.strokePath()
    if (characteristic.label) {
      canvas.setTextColor(characteristic.color || Color.orange())
      canvas.setFontSize(8)
      canvas.drawText(characteristic.label, p2)
    }
  }

  // draw line for low
  if (options.low && options.low.percent) {
    drawCharacteristic(options.low)
  }

  // draw line for high
  if (options.high && options.high.percent) {
    drawCharacteristic(options.high)
  }

  const stack = widget.addStack()
  stack.size = (config.widgetFamily && config.widgetFamily.indexOf('accessory') > -1) ? new Size(60, 60) : new Size(140, 140)
  stack.backgroundImage = canvas.getImage()
  const padding = 0
  stack.setPadding(padding, padding, padding, padding)
  stack.centerAlignContent()

  return stack
}

function sinDeg(deg) {
  return Math.sin((deg * Math.PI) / 180)
}

function cosDeg(deg) {
  return Math.cos((deg * Math.PI) / 180)
}

 */
