// pages/userCoupon/index.js
import { request, IMG_BASE_URL, requestArrayBuffer } from '../../wxapi/index'
import { defineNavTop } from '../../utils/util'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    top: 0,
    dataList: [],
    dataListTemp: [],
    amountName: {
      '01': '元',
      '02': '元',
      '03': '折',
      '04': '次',
      '05': '时'
    },
    IMG_BASE_URL: IMG_BASE_URL,
    coupon_detail_no: '',
    verificationUrl: '',
    codeVisible: false,
    coupon_info: '',
    infoVisible: false,
    tabIndex: 1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({ top: defineNavTop() })
    this.getCoupon()
  },
  getCoupon(flag) {
    request('/couponDetail/queryCouponDetail', 'post', { iDisplayStart: flag ? this.data.dataList.length : 0, iDisplayLength: 8, coupon_detail_status: this.data.tabIndex === 1 ? 'Y' : 'N' }).then(res => {
      if (res) {
        res.forEach(item => {
          if (item.consume_type && item.consume_date) {
            item.useStatus = 'used'
          } else if ((!item.consume_type || item.consume_date) && Date.parse(new Date()) > (Date.parse(item.use_end_date) + 24 * 60 * 60 * 1000)) {
            item.useStatus = 'expired'
          } else {
            item.useStatus = 'none'
          }
        })
        this.setData({
          dataList: flag ? this.data.dataList.concat(res) : res,
          dataListTemp: JSON.parse(JSON.stringify(flag ? this.data.dataListTemp.concat(res) : res))
        })
      }
    })
  },
  showInfo(e) {
    const id = e.currentTarget.dataset.id
    if (!id) return
    request('/coupon/queryDetailById', 'post', { pr_coupon_id: id }).then(res => {
      if (res && res.coupon_info) {
        this.setData({
          coupon_info: res.coupon_info,
          infoVisible: true
        })
      }
    })
  },
  showQrCode(e) {
    if (!e.currentTarget.dataset.no) {
      wx.showToast({
        title: '优惠券异常',
      })
      return
    }
    if (e.currentTarget.dataset.status !== 'none') {
      wx.showToast({
        title: '此优惠券已失效',
        icon: 'none'
      })
      return
    }
    requestArrayBuffer('/couponDetail/queryQRcode', 'post', { coupon_detail_no: e.currentTarget.dataset.no }, true).then(res => {
      if (res) {
        const str = wx.arrayBufferToBase64(res)
        if(!str){
          wx.showToast({
            title: '请刷新后再试哦',
            icon: 'none'
          })
          return
        }
        this.setData({
          coupon_detail_no: e.currentTarget.dataset.no,
          verificationUrl: 'data:image/png;base64,'+ str,
          codeVisible: true
        })
      }
    })
  },
  closePopup() {
    this.setData({
      verificationUrl: '',
      codeVisible: false,
      infoVisible: false,
      coupon_info: ''
    })
  },
  changeTab(e) {
    // let list = []
    // switch (e.currentTarget.dataset.index) {
    //   case 1:
    //     list = this.data.dataListTemp.filter(item => { return item.useStatus === 'none' })
    //     break
    //   case 2:
    //     list = this.data.dataListTemp.filter(item => { return item.useStatus !== 'none' })
    //     break
    //   default:
    // }
    this.setData({
      tabIndex: e.currentTarget.dataset.index
    })
    this.getCoupon()
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  }
})