// pages/productDetail/index.js
import { defineNavTop } from '../../utils/util'
import { request, IMG_BASE_URL } from '../../wxapi/index'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    top: 0,
    IMG_BASE_URL: IMG_BASE_URL,
    product: {},
    bannerList: [],
    currentNum: 1,
    activeIndex: 1,
    infoVisible: true,
    quantity: 1,
    totalPrice: 0,
    memberLevel: {
      '01': '贵宾卡会员',
      '02': '金卡会员',
      '03': '钻卡会员'
    },
    buyText: '',
    timeDown: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({ top: defineNavTop() })
    if (options.id) this.getProduct(options.id)
  },
  getProduct(id) {
    request('/product/detail', 'post', { pr_product_id: id }).then(res => {
      if (res) {
        if (res.product_info) res.product_info = this.richImgAuto(res.product_info)
        const imgList = []
        for (let i = 1; i < 6; i++) {
          if (res['product_pic_' + i]) imgList.push(IMG_BASE_URL + res['product_pic_' + i])
        }
        if (res.product_type === 'seckill') {
          const nowStamp = Date.parse(new Date())
          const stamp = Date.parse(new Date(res.use_end_date)) - nowStamp
          res.reverseTime = stamp
          res.day = parseInt(stamp / (24 * 60 * 60 * 1000))
          res.hour = parseInt((stamp - (res.day * 24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
          res.minute = parseInt((stamp - (res.day * 24 * 60 * 60 * 1000) - (res.hour * 60 * 60 * 1000)) / (60 * 1000))
          res.second = parseInt((stamp - (res.day * 24 * 60 * 60 * 1000) - (res.hour * 60 * 60 * 1000) - (res.minute * 60 * 1000)) / 1000)
          this.setData({
            timeDown: setInterval(() => {
              const nowStamp = Date.parse(new Date())
              const res = JSON.parse(JSON.stringify(this.data.product))
              const stamp = Date.parse(new Date(res.use_end_date)) - nowStamp
              res.reverseTime = stamp
              res.day = parseInt(stamp / (24 * 60 * 60 * 1000))
              res.hour = parseInt((stamp - (res.day * 24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
              res.minute = parseInt((stamp - (res.day * 24 * 60 * 60 * 1000) - (res.hour * 60 * 60 * 1000)) / (60 * 1000))
              res.second = parseInt((stamp - (res.day * 24 * 60 * 60 * 1000) - (res.hour * 60 * 60 * 1000) - (res.minute * 60 * 1000)) / 1000)
              this.setData({ product: res })
            }, 990)
          })
        }
        this.setData({
          product: res,
          bannerList: imgList,
          totalPrice: parseFloat(res.exchange_price > 0) ? res.exchange_price : res.exchange_integral,
          buyText: res.product_type === 'integral' ? '兑换' : '购买'
        })
      }
    })
  },
  submitOrder() {
    if (parseInt(this.data.product.inventory_quantity) === 0) {
      wx.showToast({
        title: '库存不足',
        icon: 'none'
      })
      return
    }
    if (this.data.product.member_level) {
      request('/member/get', 'post', {}).then(res => {
        if (res && res.member_level) {
          if (parseInt(res.member_level) < parseInt(this.data.product.member_level)) {
            wx.showToast({
              title: this.data.memberLevel[this.data.product.member_level] + '及以上才可' + this.data.buyText,
              icon: 'none'
            })
            return
          }
        }
      })
    }
    const params = {
      business_id: this.data.product.pr_product_id,
      // tbOrderDetailBeanList: validArray,
      business_type: this.data.product.product_type,
      // valid_start_date: this.data.sDate,
      quantity: this.data.quantity,
      order_name: this.data.product.product_name
    }
    if (this.data.product.product_type === 'integral') {
      params.order_integral = this.data.totalPrice
    } else {
      params.order_amount = this.data.totalPrice
    }
    wx.showLoading({
      title: '订单生成中...',
    })
    request('/order/submitOrder', 'post', params, false).then(res => {
      wx.hideLoading()
      if (res && res.status === 'SUCCESS') {
        if (res.baseBean.order_status === 'unpay') {
          this.payOrder(res.baseBean.pr_order_id)
        } else {
          wx.showToast({
            title: this.data.buyText + '成功',
            icon: 'success'
          })
          setTimeout(() => {
            wx.navigateTo({
              url: '/pages/order/index',
            })
          }, 1500)
        }
      } else {
        wx.showToast({
          title: res.message,
          icon: 'none'
        })
      }
    })
  },
  payOrder(tb_order_id) {
    var params = {
      tb_order_id: tb_order_id
    }
    wx.showLoading({
      title: '支付中...',
    })
    request('/order/payOrder', 'post', params).then(res=>{
      if (res.timeStamp) {
        this.wxPayMethod(res, tb_order_id)
      } else {
        wx.hideLoading()
        wx.showToast({
          title: '订单状态已更新，请刷新后再支付',
          icon: 'none'
        })
      }
    }).catch(err => {
      wx.hideLoading()
      wx.showToast({
        title: '出现了一点问题呢',
        icon: 'none'
      })
    })
  },
  //微信支付
  wxPayMethod: function (payargs,tb_order_id) {
    var that =this
    wx.requestPayment({
      'appId': payargs.appId,
      'timeStamp': payargs.timeStamp,
      'nonceStr': payargs.nonceStr,
      'package': payargs.package,
      'signType': payargs.signType,
      'paySign': payargs.paySign,
      'success': function (res) {
        wx.hideLoading()
        wx.showToast({
          title: '支付成功',
          icon: 'success'
        })
        that.toggleSubscribe(tb_order_id) //消息订阅授权
        setTimeout(function(){
          wx.reLaunch({
            url: '../../pages/orderList/index'
          })
        }, 1500)
      },
      'fail': function (res) {
        wx.hideLoading()
        wx.showToast({
          title: '支付失败',
          icon: 'error'
        })
        setTimeout(function(){
          wx.navigateTo({
            url: '../../pages/orderList/index'
          })
        }, 1500)
      }
    })
  },
  toggleSubscribe: function (tb_order_id) {
    wx.getSetting({
      withSubscriptions: true,
      success(res) {
        //console.log(res.subscriptionsSetting)	//这里可以看到每一项的授权状态，当用户没授权时，即使withSubscriptions开启了true，也是不会输出订阅状态的，所以直接让弹出授权框就得了
        if (wx.requestSubscribeMessage) {
          wx.requestSubscribeMessage({
            tmplIds: ["lNvS2wAyIbu4A0dR9d4Y8MaxiupIG4cvsXVY87yHzbU","vpMd7zEUTLsrisct4woQ1dbCJ1_MHUWGdipqC6yl8Zc"],  //下单
            success: function (res) { //成功
              //console.log(res);
            },
            fail: function (res) {
              //console.log(res);
            }
          })
        } else {
          wx.showToast({
            title: '请更新您微信版本，来获取订阅消息功能',
            icon: 'none'
          })
        }
      }
    })
  },
  previewImage(e) {
    const that = this
    wx.previewImage({
      urls: that.data.bannerList,
      current: e.currentTarget.dataset.url
    })
  },
  plusNum() {
    if (this.data.quantity > parseInt(this.data.product.inventory_quantity)) {
      wx.showToast({
        title: '数量超出库存数量',
        icon: 'none'
      })
      return
    }
    if (this.data.product.exchange_max && parseInt(this.data.product.exchange_max) <= this.data.quantity) {
      wx.showToast({
        title: '数量超出最大限制',
        icon: 'none'
      })
      return
    }
    this.setData({
      quantity: this.data.quantity + 1,
      totalPrice: (this.data.quantity + 1) * ((this.data.product.product_type === 'integral' ? this.data.product.exchange_integral : this.data.product.exchange_price) || 0)
    })
  },
  reduceNum() {
    const price = (this.data.product.product_type === 'integral' ? this.data.product.exchange_integral : this.data.product.exchange_price) || 0
    this.setData({
      quantity: this.data.quantity <= 1 ? 1 : this.data.quantity - 1,
      totalPrice: this.data.quantity <= 1 ? price : (this.data.quantity - 1) * price
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
  onShareAppMessage() {
    wx.showShareMenu({
      withShareTicket: true,
      menu: ['shareAppMessage','shareTimeline']
    })
  },
  onUnload() {
    clearInterval(this.data.timeDown)
    this.setData({ timeDown: null })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})