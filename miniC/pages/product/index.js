// pages/product/index.js
import { request, IMG_BASE_URL } from '../../wxapi/index'
import { defineNavTop } from '../../utils/util'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    top: 0,
    IMG_BASE_URL: IMG_BASE_URL,
    keyword: '',
    dataList: [],
    typeArray: [{
      index: 1,
      name: '优惠券',
      type: 'coupon'
    // },{
    //   index: 2,
    //   name: '天天双十一',
    //   type: 'eleven'
    },{
      index: 3,
      name: '积分商城',
      type: 'integral'
    }],
    product_type: 'integral',
    typeIndex: 3,
    couponType: {
      '01': '代金券',
      '02': '满减券',
      '03': '折扣券',
      '04': '体验券',
      '05': '停车券'
    },
    amountName: {
      '01': '金额',
      '02': '优惠金额',
      '03': '折扣',
      '04': '体验次数',
      '05': '停车时长'
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({ top: defineNavTop() })
    if (options.type) {
      this.setData({
        product_type: options.type,
        typeIndex: this.data.typeArray.filter(item => { return item.type === options.type })[0].index
      })
    }
    this.getProductList()
  },
  getProductList(flag) {
    wx.showLoading({
      title: '查询中...',
    })
    const params = {
      iDisplayLength: 8,
      iDisplayStart: flag === true ? this.data.dataList.length : 0
    }
    switch (this.data.product_type) {
      case 'coupon':
        params.coupon_name = this.data.keyword
        request('/coupon/queryList', 'post', params).then(res => {
          if (res) {
            this.setData({ dataList: flag === true ? this.data.dataList.concat(res) : res })
          }
          wx.hideLoading()
        })
        break
      case 'integral':
        params.product_name = this.data.keyword
        params.product_type = this.data.product_type
        request('/product/queryList', 'post', params).then(res => {
          if (res) {
            this.setData({ dataList: flag === true ? this.data.dataList.concat(res) : res })
          }
          wx.hideLoading()
        })
        break
      default:
    }
  },
  toDetail(e) {
    if (e.currentTarget.dataset.id) {
      wx.navigateTo({
        url: '/pages/' + (e.currentTarget.dataset.type.indexOf('coupon') !== -1 ? 'coupon' : 'product') + 'Detail/index?id=' + e.currentTarget.dataset.id,
      })
    }
  },
  changeType(e) {
    const index = e.currentTarget.dataset.index
    this.setData({ typeIndex: index })
    this.setData({
      product_type: e.currentTarget.dataset.type
    })
    this.getProductList()
  },
  setValue(e) {
    this.setData({ keyword: e.detail.value })
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    this.getProductList(true)
  },
})