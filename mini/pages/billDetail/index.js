// pages/billDetail/index.js
import { request } from '../../wxapi/index'

Page({

    /**
     * 页面的初始数据
     */
    data: {
      billDetail: null,
      contractCostDetail: [],
      pr_customer_id: null
    },  

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
      const pr_customer_id = wx.getStorageSync('pr_customer_id')
      this.setData({ pr_customer_id: pr_customer_id })
      if (options.pr_bill_id) {
        wx.showLoading({
          title: '查询中...',
        })
        request('/bill/queryDetailById', 'post', { pr_bill_id: options.pr_bill_id, pr_customer_id: pr_customer_id }).then(res => {
          if (res) {
            this.setData({ billDetail: res })
          }
          wx.hideLoading()
        })
      }
      if (options.pr_contract_id && options.pr_bill_id) {
        wx.showLoading({
          title: '查询中...',
        })
        request('/contract/queryPrContractCostdetail', 'post', { pr_contract_id: options.pr_contract_id, pr_bill_id: options.pr_bill_id, pr_customer_id: pr_customer_id }).then(res => {
          this.setData({
            contractCostDetail: res
          })
          wx.hideLoading()
        })
      }
    },
    openToast(e) {
      this.setData({
        amount: this.data.billDetail.unpaid,
        visible: true
      })
    },
    setValue(e) {
      this.setData({
        amount: e.detail.value
      })
    },
    closePopup() {
      this.setData({ visible: false })
    },
    // 付款
    pay(e) {
      if (isNaN(this.data.amount)) {
        wx.showToast({
          title: '请输入数字金额',
          icon: 'none'
        })
        return
      }
      if (parseFloat(this.data.amount) < 0.01) {
        wx.showToast({
          title: '付款金额不能小于0.01',
          icon: 'none'
        })
        return
      }
      if (parseFloat(this.data.amount) > parseFloat(this.data.billDetail.unpaid)) {
        wx.showToast({
          title: '付款金额不能大于此账单的未缴金额',
          icon: 'none'
        })
        return
      }
      const pr_bill_id = this.data.billDetail.pr_bill_id
      if (!pr_bill_id) return
      var params = {
        pr_bill_id: pr_bill_id,
        partpay_amount: this.data.amount,
        pr_customer_id: this.data.pr_customer_id
      }
      wx.showLoading({
        title: '支付中...'
      })
      request('/bill/generatePartWePayInfo', 'post', params).then(res=>{
        if (res.timeStamp) {
          this.wxPayMethod(res, pr_bill_id)
        } else {
          wx.hideLoading()
          wx.showToast({
            title: '订单状态已更新，请刷新后再支付',
            icon: 'none'
          })
          setTimeout(() => {
            wx.navigateBack()
          }, 2000)
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
    wxPayMethod: function (payargs,pr_bill_id) {
      const that = this
      wx.requestPayment({
        'appId': payargs.appId,
        'timeStamp': payargs.timeStamp,
        'nonceStr': payargs.nonceStr,
        'package': payargs.packageValue,
        'signType': payargs.signType,
        'paySign': payargs.paySign,
        'success': function (res) {
          wx.showToast({
            title: '支付成功!',
            icon: 'success',
            duration: 2000
          })
          setTimeout(() => {
            wx.reLaunch({
              url: '/pages/paySuccess/index?paid_amount=' + that.data.amount
            })
          }, 2000)
        },
        'fail': function (res) {
          wx.hideLoading()
          wx.showToast({
            title: '支付失败',
            icon: 'error',
            duration: 2000
          })
          setTimeout(function(){
            wx.navigateBack()
          }, 2000)
        }
      })
    }
})