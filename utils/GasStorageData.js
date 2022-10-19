/* global Request */

/**
 * Gas Storage API DATA Service for Scriptable
 * @author Martin Rudolph <DoomyTheFroomy@users.noreply.github.com>
 * @docauthor Martin Rudolph <DoomyTheFroomy@users.noreply.github.com>
 * @see {@link https://docs.scriptable.app| Scriptable Docs}
 */
class GasStorageData {
  /**
   *
   * @param {String} baseApi - Whether to use the AGSI or ALSI API path
   * @param {String} countryCode - lower case country code, e.g. `de`
   * @param {Object} options
   * @param {Boolean} [options.loadCompanyList=false] - Whether to load further information about the different companies for a country
   * @param {String} [options.countryName] - Country name for company list, e.g. `Germany`
   * @param {String} options.apiKey - API Key for the API, can be gained via {@link https://agsi.gie.eu/account | AGSIE Page}
   */
  constructor (baseApi, countryCode, options) {
    this.basePath = baseApi
    this.countryCode = countryCode
    this.loadCompanyList = options.loadCompanyList || false
    this.countryName = options.countryName
    this.apiKey = options.apiKey
  }

  async loadData () {
    const gasStorage = this
    gasStorage.date = new Date().toISOString().split('T')[0]
    const url = gasStorage.basePath + '?country=' + gasStorage.countryCode + '&date=' + gasStorage.date

    const res = await gasStorage._loadJSON(url)
    gasStorage.countryGasStorageLevel = res.data[0]
    // console.log(gasStorage.countryGasStorageLevel)

    if (gasStorage.loadCompanyList) {
      await gasStorage._loadCompanyData()
      // console.log(gasStorage.companyList)
    }
    return this.countryGasStorageLevel
  }

  async _loadCompanyData () {
    const gasStorage = this
    const url = gasStorage.basePath + '/about'
    const res = await gasStorage._loadJSON(url)
    gasStorage.companyList = []
    const companyList = (res.SSO ? res.SSO.Europe[gasStorage.countryName] : res.LSO.Europe[gasStorage.countryName])

    // console.log(companyList)
    if (!companyList) {
      return
    }
    for (let index = 0; index < companyList.length; index++) {
      const company = companyList[index]
      const date = gasStorage.date
      const eic = company.eic
      const companyUrl = gasStorage.basePath + '?country=' + gasStorage.countryCode + '&company=' + eic + '&date=' + date
      const companyResponse = await gasStorage._loadJSON(companyUrl)
      gasStorage.companyList.push({ ...companyResponse.data[0], ...company })
    }
    gasStorage.orderedCompanyList = gasStorage.companyList.filter(company => !isNaN(company.full)).sort(function (a, b) {
      const keyA = Number.parseFloat(a.full)
      const keyB = Number.parseFloat(b.full)
      // Compare the 2 dates
      if (keyA < keyB) return -1
      if (keyA > keyB) return 1
      return 0
    })
    return gasStorage.companyList
  }

  async _loadJSON (url) {
    const gasStorage = this
    const req = new Request(url)
    req.headers = { 'x-key': gasStorage.apiKey }

    return req.loadJSON()
  }
}
module.exports = GasStorageData