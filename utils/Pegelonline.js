/* global Request */

const url = 'https://www.pegelonline.wsv.de/webservices/rest-api/v2/stations.json?radius=30&includeCurrentMeasurement=true&includeTimeseries=true&includeCharacteristicValues=true&offset=0'

/**
 * Pegelonline Service for Scriptable
 * @author Martin Rudolph <DoomyTheFroomy@users.noreply.github.com>
 * @docauthor Martin Rudolph <DoomyTheFroomy@users.noreply.github.com>
 * @see {@link https://docs.scriptable.app| Scriptable Docs}
 * @see {@link https://gist.githubusercontent.com/Sillium/4210779bc2d759b494fa60ba4f464bd8/raw/| Base Circle Script}
 */
class Pegelonline {
  /**
   *
   * @param {String | Object} idsOrLocations - `String` with the StationIDs or `Object` with `latitude` and `longitude` for location
   * @param {Object} options
   * @param {Number} [options.limit=4] - Limit the number of stations returned
   */
  constructor (idsOrLocations, options = {}) {
    this.url = url
    if (typeof idsOrLocations === 'string') {
      this.url += '&ids=' + idsOrLocations
    } else {
      this.url += '&latitude=' + idsOrLocations.latitude + '&longitude=' + idsOrLocations.longitude
    }

    this.url += '&limit=' + (options.limit ? options.limit : 4)
  }

  async initStations () {
    const reqStations = new Request(url)
    this.stations = await reqStations.loadJSON()
    return this.stations
  }

  /**
   * Return the characteristics for a station
   * <dt>HHW</dt>
  <dd>Höchster Hochwasserstand</dd>

  <dt>MHW</dt>
  <dd>Mittel der Hochwasserstände</dd>

  <dt>M_III</dt>
  <dd>Hochwassermarke III</dd>

  <dt>M_II</dt>
  <dd>Hochwassermarke II</dd>

  <dt>HSW</dt>
  <dd>höchster Schifffahrtswasserstand</dd>

  <dt>M_I</dt>
  <dd>Hochwassermarke I</dd>

  <dt>MW</dt>
  <dd>Mittel der Tageswasserstände</dd>

  <dt>MNW</dt>
  <dd>Mittel der Niedrigwasserstände</dd>

  <dt>NNW</dt>
  <dd>Niedrigster Niedrigwasserstand</dd>
   * @param {Object} [station] - If no station is given the first loaded station will be used
   * @param {Object} [options]
   * @param {Boolean} [options.includeLowestLevel = false] - Include the characteristics for `NNW`
   * @param {Boolean} [options.includeLowestMeanLevel = false] - Include the characteristics for `MNW`
   * @param {Boolean} [options.includeMeanLevel = true] - Include the characteristics for `MW`
   * @param {Boolean} [options.includeFloodLevelI = false] - Include the characteristics for `M_I`
   * @param {Boolean} [options.includeHighestShippingLevel = false] - Include the characteristics for `HSW`
   * @param {Boolean} [options.includeFloodLevelII = false] - Include the characteristics for `M_II`
   * @param {Boolean} [options.includeFloodLevelIII = false] - Include the characteristics for `M_III`
   * @param {Boolean} [options.includeHighestMeanLevel = false] - Include the characteristics for `MHW`
   * @param {Boolean} [options.includeHighestLevel = false] - Include the characteristics for `HHW`
   *
   */
  getCharacteristics (station, options) {
    if (!station) {
      station = this.stations[0]
    }
    const characteristicValues = station.timeseries[0].characteristicValues

    const characteristics = {}

    for (let index = 0; index < characteristicValues.length; index++) {
      const characteristicValue = characteristicValues[index]
      characteristics[characteristicValue.shortname] = characteristicValue.value
    }
    return characteristics
  }

  async getStation () {
    // console.log(res)

    const closestStation = res[0]
  }
}

module.exports = Pegelonline
