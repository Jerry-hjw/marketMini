// pages/contract/index.js
import { request } from '../../wxapi/index'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    contractList: [],
    contractStatus: {
      'draft': '草稿',
      'canceled': '未通过',
      'approving': '审核中',
      'approvingfile': '上传中',
      'approved': '已审核',
      'expired': '已过期',
      'terminaling': '解约中',
      'terminaled': '已解约',
      'changing': '变更中',
      'settleing': '结算中',
      'finished': '已结算'
    },
    fromChoose: false,
    pr_customer_id: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const pr_customer_id = wx.getStorageSync('pr_customer_id')
    this.setData({ pr_customer_id: pr_customer_id })
    this.getContractList()
    if (options.fromChoose) {
      this.setData({ fromChoose: options.fromChoose })
    }
  },
  getContractList() {
    wx.showLoading({
      title: '查询中...',
    })
    request('/contract/queryList', 'post', { pr_customer_id: this.data.pr_customer_id }).then(res => {
      if (res) {
        this.setData({ contractList: res })
      }
      wx.hideLoading()
    })
  },
  toDetail(e) {
    const item = e.currentTarget.dataset.item
    if (this.data.fromChoose) {
      const pages = getCurrentPages()
      const prevPage = pages[pages.length - 2]
      prevPage.setData({ onChooseContract: item })
      wx.navigateBack()
      return
    }
    if (item) {
      wx.navigateTo({
        url: '/pages/contractDetail/index?pr_contract_id=' + item.pr_contract_id,
      })
    }
  }
})