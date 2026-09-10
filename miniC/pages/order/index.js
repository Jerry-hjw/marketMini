// pages/order/index.js
import { defineNavTop } from '../../utils/util'
import { request } from '../../wxapi/index'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    top: 0,
    dataList: [],
    order_status: '',
    orderStatus: {
      'unpay': '待支付',
      'paid': '已支付',
      'used': '已完成',
      'canceled': '已取消',
      'refunded': '已退款'
    },
    statusColor: {
      'unpay': '#ff1725',
      'paid': '#9ae533',
      'used': '#000',
      'canceled': '#666',
      'refunded': '#999'
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({ top: defineNavTop() })
    if (options.status) {
      this.setData({ order_status: options.status })
    }
    this.getOrderList()
  },
  getOrderList(flag) {
    request('/order/queryList', 'post', { iDisplayStart: flag ? this.data.dataList.length : 0, iDisplayLength: 8, order_status: this.data.order_status }).then(res => {
      if (res) {
        this.setData({ dataList: flag ? this.data.dataList.concat(res) : res })
      }
    })
  },
  toDetail(e) {
    if (e.currentTarget.dataset.id) {
      wx.navigateTo({
        url: '/pages/orderDetail/index?id=' + e.currentTarget.dataset.id,
      })
    } else {
      wx.showToast({
        title: '数据异常，请刷新后再试',
        icon: 'none'
      })
    }
  },
  payOrder(e) {
    var params = {
      tb_order_id: e.currentTarget.dataset.id
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
    var that = this
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
          that.getOrderList()
        }, 1500)
      },
      'fail': function (res) {
        wx.hideLoading()
        wx.showToast({
          title: '支付失败',
          icon: 'error'
        })
        setTimeout(function(){
          that.getOrderList()
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
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    this.getOrderList(true)
  }
})