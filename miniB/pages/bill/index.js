// pages/bill/bill.js
import { request } from '../../wxapi/index'
import util from '../../utils/util'

Page({

    /**
     * 页面的初始数据
     */
    data: {
        tabIndex: 1,    // tab页签下标
        dataList: [],   // 账单列表
        nowDate: '', // 当前日期
        pr_customer_id: '',
        bill: null,
        visible: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
      const pr_customer_id = wx.getStorageSync('pr_customer_id')
      this.setData({
        nowDate: util.formatDateTime2(new Date()),
        pr_customer_id: pr_customer_id
      })
      const date = new Date()
      const year = date.getFullYear()
      let month1 = date.getMonth() + 1
      if (month1 < 10) month1 = '0' + month1
      if (month1 > 12) month1 = '01'
      let month2 = date.getMonth() + 2
      if (month2 < 10) month2 = '0' + month2
      if (month2 > 12) month2 = '01'
      this.setData({
        compareDate: year + '-' + month2 + '-' + '01'
      })
      this.getDataList(false)
    },
    getDataList(flag) {
      wx.showLoading({
        title: '查询中...',
      })
      const params = {
        pr_customer_id: this.data.pr_customer_id,
        iDisplayStart: flag ? this.data.dataList.length : 0,
        iDisplayLength: 5,
        bill_status: this.data.tabIndex === 1 ? 'unsubmit' : 'submitted'
      }
      request('/bill/queryPage', 'post', params).then(res => {
        if (res && res.length > 0) {
          const billList = this.data.tabIndex === 1 ? res.filter(item => { return item.bill_date < this.data.compareDate }) : res
          if (flag) {
            this.setData({
              dataList: this.data.dataList.concat(billList),
              dataListTemp: this.data.dataListTemp.concat(res)
            })
          } else {
            this.setData({
              dataList: billList,
              dataListTemp: res
            })
          }
        }
        wx.hideLoading()
      })
    },
    showMore() {
      this.setData({
        showMore: true,
        dataList: this.data.dataListTemp
      })
    },
    // 切换tab页
    changeTabIndex(e) {
      if (e.currentTarget.dataset.index === this.data.tabIndex) return
      this.setData({
        tabIndex: e.currentTarget.dataset.index,
        showMore: e.currentTarget.dataset.index === 2,
        dataList: []
      })
      this.getDataList(false)
    },
    openToast(e) {
      this.setData({
        bill: this.data.dataList[e.currentTarget.dataset.index],
        amount: this.data.dataList[e.currentTarget.dataset.index].unpaid,
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
    toPage(e) {
      if (!e.currentTarget.dataset.pr_bill_id || !e.currentTarget.dataset.pr_contract_id) {
        wx.showToast({
          title: '请刷新后再试',
          icon: 'none'
        })
        return
      }
      wx.navigateTo({
        url: '/pages/billDetail/index?pr_bill_id=' + e.currentTarget.dataset.pr_bill_id + '&pr_contract_id=' + e.currentTarget.dataset.pr_contract_id,
      })
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
      if (parseFloat(this.data.amount) > parseFloat(this.data.bill.unpaid)) {
        wx.showToast({
          title: '付款金额不能大于此账单的未缴金额',
          icon: 'none'
        })
        return
      }
      const pr_bill_id = this.data.bill.pr_bill_id
      if (!pr_bill_id) return
      var params = {
        pr_bill_id: pr_bill_id,
        pr_customer_id: this.data.pr_customer_id,
        partpay_amount: this.data.amount
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
            wx.reLaunch({
              url: '/pages/user/index'
            })
          }, 2000)
        }
      })
    }
})