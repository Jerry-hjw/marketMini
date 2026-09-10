// pages/customerContacts/index.js
import { request } from './../../wxapi/index'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataList: [],
    customerContacts: {},
    contactsType: {
      'boss': '店长',
      'employee': '员工'
    },
    visible: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const pr_customer_id = wx.getStorageSync('pr_customer_id')
    this.setData({ pr_customer_id: pr_customer_id })
    this.getDataList(false)
  },
  getDataList(flag) {
    wx.showLoading({
      title: '查询中...',
    })
    request('/customerContacts/queryPage', 'post', { pr_customer_id: this.data.pr_customer_id, iDisplayStart: flag ? this.data.merchantSalesList.length : 0, iDisplayLength: 6 }).then(res => {
      if (res) {
        this.setData({ dataList: flag ? this.data.dataList.concat(res) : res })
      }
      wx.hideLoading()
    })
  },
  openDialog(e) {
    const id = e.currentTarget.dataset.id
    if (id) {
      wx.showLoading({
        title: '查询中...',
      })
      request('/customerContacts/get', 'post', { pr_customer_contacts_id: id }).then(res => {
        wx.hideLoading()
        if (res) {
          if (res.contacts_type === 'boss') {
            wx.showModal({
              title: '温馨提示',
              content: '若需修改或删除店长的信息，请联系管理员',
              confirmText: '我知道了',
              confirmColor: '#8ec31f'
            })
            return
          }
          this.setData({
            customerContacts: res,
            visible: true
          })
        }
      })
    } else {
      this.setData({
        customerContacts: {},
        visible: true
      })
    }
  },
  setValue(e) {
    this.setData({
      ['customerContacts.' + e.currentTarget.dataset.prop]: e.detail.value
    })
  },
  save() {
    if (!this.data.customerContacts.contacts_name) {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none'
      })
      return
    }
    if (!this.data.customerContacts.contacts_phone) {
      wx.showToast({
        title: '请输入电话号码',
        icon: 'none'
      })
      return
    }
    const reg = /^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/
    if (!reg.test(this.data.customerContacts.contacts_phone)) {
      wx.showToast({
        title: '请输入正确的手机号码',
        icon: 'none'
      })
      return
    }
    const params = JSON.parse(JSON.stringify(this.data.customerContacts))
    params.pr_customer_id = this.data.pr_customer_id
    params.contacts_type = 'employee'
    request('/customerContacts/save', 'post', params).then(res => {
      if (res && res.status === 'SUCCESS') {
        this.closeDialog()
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        })
        setTimeout(() => {
          this.getDataList()
        }, 1000)
      } else {
        wx.showToast({
          title: res.message,
          icon: 'error'
        })
      }
    })
  },
  delete() {
    const that = this
    wx.showModal({
      title: '温馨提示',
      content: '您确定要删除此人员信息吗',
      confirmColor: '#8ec31f',
      complete: (res) => {
        if (res.confirm) {
          request('/customerContacts/delete', 'post', { pr_customer_contacts_id: that.data.customerContacts.pr_customer_contacts_id }).then(res => {
            if (res && res.status === 'SUCCESS') {
              that.closeDialog()
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              })
              setTimeout(() => {
                that.getDataList()
              }, 1000)
            } else {
              wx.showToast({
                title: res.message,
                icon: 'error'
              })
            }
          })
        }
      }
    })
    
  },
  closeDialog() {
    this.setData({
      customerContacts: {},
      visible: false
    })
  }
})