// pages/mallPartyDetail/index.js
import { defineNavTop } from '../../utils/util'
import { request, IMG_BASE_URL } from '../../wxapi/index'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    top: 0,
    IMG_BASE_URL: IMG_BASE_URL,
    party: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({ top: defineNavTop() })
    if (options.id) this.getMallParty(options.id)
  },
  getMallParty(id) {
    request('/mallParty/get', 'post', { pr_mall_party_id: id }).then(res => {
      if (res) {
        if (res.party_info) res.party_info = this.richImgAuto(res.party_info)
        const imgList = []
        if (res.party_img_url) imgList.push(IMG_BASE_URL + res.party_img_url)
        // 处理倒计时
        // const nowStamp = Date.parse(new Date())
        // const stamp = Date.parse(new Date(res.use_end_date)) - nowStamp
        // res.reverseTime = stamp
        // res.day = parseInt(stamp / (24 * 60 * 60 * 1000))
        // res.hour = parseInt((stamp - (res.day * 24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
        // res.minute = parseInt((stamp - (res.day * 24 * 60 * 60 * 1000) - (res.hour * 60 * 60 * 1000)) / (60 * 1000))
        // res.second = parseInt((stamp - (res.day * 24 * 60 * 60 * 1000) - (res.hour * 60 * 60 * 1000) - (res.minute * 60 * 1000)) / 1000)
        // this.setData({
        //   timeDown: setInterval(() => {
        //     const nowStamp = Date.parse(new Date())
        //     const res = JSON.parse(JSON.stringify(this.data.coupon))
        //     const stamp = Date.parse(new Date(res.use_end_date)) - nowStamp
        //     res.reverseTime = stamp
        //     res.day = parseInt(stamp / (24 * 60 * 60 * 1000))
        //     res.hour = parseInt((stamp - (res.day * 24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
        //     res.minute = parseInt((stamp - (res.day * 24 * 60 * 60 * 1000) - (res.hour * 60 * 60 * 1000)) / (60 * 1000))
        //     res.second = parseInt((stamp - (res.day * 24 * 60 * 60 * 1000) - (res.hour * 60 * 60 * 1000) - (res.minute * 60 * 1000)) / 1000)
        //     this.setData({ coupon: res })
        //   }, 990)
        // })
        this.setData({
          party: res,
          bannerList: imgList,
          totalPrice: parseFloat(res.exchange_price > 0) ? res.exchange_price : res.exchange_integral,
          buyText: '领取'
        })
      }
    })
  },
  changeProductInfoVisible() {
    this.setData({ infoVisible: !this.data.infoVisible })
  },
  // 富文本 图片样式替换
  richImgAuto(html) {
    if (html.indexOf('<img')) {
      return html.replace(/<img/gi,'<img style="max-width:100%;height:auto;display:block;"')
    }
  },
  toRedirect(e) {
    wx.navigateTo({
      url: '/pages/redirectOut/index?outUrl=' + this.data.party.party_info_url,
    })
  }
})