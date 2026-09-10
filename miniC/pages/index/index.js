// pages/index/index.js
import { request, IMG_BASE_URL } from '../../wxapi/index'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    top: 0,
    bannerList: [{ url: '/img/banner.jpg' }],
    IMG_BASE_URL: IMG_BASE_URL,
    functionList: [{
      name: '品牌导览',
      img: '/img/shopNavigate.png',
      url: '/pages/brandGuide/index'
    },{
      name: '停车缴费',
      img: '/img/parkPay.png',
      url: 'toOtherMiniProgram'
    },{
      name: '拍照积分',
      img: '/img/integralTake.png',
      url: '/pages/integralPhoto/index'
    },{
      name: '积分商城',
      img: '/img/integralShop.png',
      url: '/pages/product/index?type=integral'
    },{
      name: '每日签到',
      img: '/img/dailySign.png',
      url: '/pages/checkIn/index'
    }],
    functionList2: ['新店推荐', '线上秒杀', '活动报名'],
    funcIndex: 0,
    member: {},
    dataList: [],
    timeDown: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this
    const menu = wx.getMenuButtonBoundingClientRect()
    this.setData({ top: menu.top })
    const token = wx.getStorageSync('token')
    if (!token) {
      // 登录
      wx.login({
        success: res => {
          request('/wx/login', 'post', { code: res.code }).then(res=>{
            if (res) {
              wx.setStorageSync('token', res)
              // that.getMember()
              that.getSwiper()
              that.getIntegral()
              that.getBrandList()
            }
          })
        }
      })
    } else {
      // this.getMember()
      this.getSwiper()
      this.getIntegral()
      this.getBrandList()
    }
  },
  getMember() {
    request('/member/get', 'post', {}).then(res => {
      if (res) {
        this.setData({
          member: res
        })
      }
    })
  },
  getSwiper() {
    request('/swiper/queryList', 'post', { banner_type: '01' }).then(res => {
      if (res && res.length > 0) {
        this.setData({ bannerList: res })
      }
    })
  },
  getIntegral() {
    request('/member/getJzdIntegral', 'post', {}).then(res => {
      if (res) {
        wx.setStorageSync('user', res)
        this.setData({
          member: res
        })
      }
    })
  },
  getBrandList(flag) {
    const params = {
      brand_category: 'new',
      iDisplayLength: 5
    }
    wx.showLoading({
      title: '查询中...',
    })
    request('/brandGuide/queryValidList', 'post', params).then(res => {
      if (res) {
        this.setData({ dataList: flag ? this.data.dataList.concat(res) : res })
      }
      wx.hideLoading()
    })
  },
  getSeckillProduct(flag) {
    wx.showLoading({
      title: '查询中...',
    })
    request('/product/queryList', 'post', { product_type: 'seckill', iDisplayStart: flag ? this.data.dataList.length : 0, iDisplayLength: 5 }).then(res => {
      if (res) {
        const nowStamp = Date.parse(new Date())
        res.forEach(item => {
          const stamp = Date.parse(new Date(item.use_end_date)) - nowStamp
          item.reverseTime = stamp
          item.day = parseInt(stamp / (24 * 60 * 60 * 1000))
          item.hour = parseInt((stamp - (item.day * 24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
          item.minute = parseInt((stamp - (item.day * 24 * 60 * 60 * 1000) - (item.hour * 60 * 60 * 1000)) / (60 * 1000))
          item.second = parseInt((stamp - (item.day * 24 * 60 * 60 * 1000) - (item.hour * 60 * 60 * 1000) - (item.minute * 60 * 1000)) / 1000)
        })
        this.setData({
          dataList: flag ? this.data.dataList.concat(res) : res,
          timeDown: setInterval(() => {
            const nowStamp = Date.parse(new Date())
            const list = JSON.parse(JSON.stringify(this.data.dataList))
            list.forEach(item => {
              const stamp = Date.parse(new Date(item.use_end_date)) - nowStamp
              item.reverseTime = stamp
              item.day = parseInt(stamp / (24 * 60 * 60 * 1000))
              item.hour = parseInt((stamp - (item.day * 24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
              item.minute = parseInt((stamp - (item.day * 24 * 60 * 60 * 1000) - (item.hour * 60 * 60 * 1000)) / (60 * 1000))
              item.second = parseInt((stamp - (item.day * 24 * 60 * 60 * 1000) - (item.hour * 60 * 60 * 1000) - (item.minute * 60 * 1000)) / 1000)
            })
            this.setData({ dataList: list })
          }, 980)
        })
      }
      wx.hideLoading()
    })
  },
  getMallPartyList(flag) {
    wx.showLoading({  
      title: '查询中',
    })
    request('/mallParty/queryValidList', 'post', { iDisplayStart: flag ? this.data.dataList.length : 0, iDisplayLength: 5 }).then(res => {
      wx.hideLoading()
      if (res) {
        this.setData({ dataList: flag ? this.data.dataList.concat(res) : res })
      }
    })
  },
  setFuncIndex(e) {
    this.setData({ funcIndex: e.currentTarget.dataset.index })
    switch(e.currentTarget.dataset.index) {
      case 0:
        this.getBrandList()
        clearInterval(this.data.timeDown)
        this.setData({ timeDown: null })
        break
      case 1:
        this.getSeckillProduct()
        break
      // case 2:
      //   clearInterval(this.data.timeDown)
      //   this.setData({ timeDown: null })
      //   break
      case 2:
        this.getMallPartyList()
        clearInterval(this.data.timeDown)
        this.setData({ timeDown: null })
        break
      default:
    }
  },
  toPage(e) {
    const url = e.currentTarget.dataset.url
    if (!url) {
      wx.showToast({
        title: '暂无内容，敬请期待',
        icon: 'none'
      })
      return
    }
    if (url.indexOf('toOtherMiniProgram') !== -1) {
      wx.openEmbeddedMiniProgram({
        appId: 'wx9424ec84be0669d2',
        path: '/pages/index/index',
        envVersion: 'release',
        allowFullScreen: true,
        complete() {}
      })
    } else {
      if (!this.data.member.mobile) {
        if (url.indexOf('/pages/brandGuide/index') !== -1 || url.indexOf('/pages/user/index') !== -1) {
          wx.navigateTo({
            url: url,
          })
        } else {
          wx.showToast({
            title: '请先登录授权手机号',
            icon: 'none'
          })
          return
        }
      } else {
        wx.navigateTo({
          url: url,
        })
      }
    }
  },
  toDetail(e) {
    if (e.currentTarget.dataset.id) {
      wx.navigateTo({
        url: '/pages/' + (e.currentTarget.dataset.type) + 'Detail/index?id=' + e.currentTarget.dataset.id,
      })
    }
  },
  swiperClick(e) {
    const url = e.currentTarget.dataset.url
    if (url && url.indexOf('pages') !== -1) {
      wx.navigateTo({
        url: url
      })
      return
    }
    if (url) {
      // 外链 
      wx.navigateTo({
        url: '/pages/redirectOut/index?outUrl=' + url,
      }) 
    } else {
      if (e.currentTarget.dataset.content) {
        wx.navigateTo({
          url: '/pages/swiperDetail/index?id=' + e.currentTarget.dataset.id,
        }) 
      }
    }
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  onUnload() {
    clearInterval(this.data.timeDown)
    this.setData({ timeDown: null })
  },
  onShareAppMessage() {
    wx.showShareMenu({
        withShareTicket: true,
        menu: ['shareAppMessage','shareTimeline']
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})