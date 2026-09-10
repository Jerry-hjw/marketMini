// pages/contractDetail/index.js
import { request, IMG_BASE_URL } from '../../wxapi/index'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    contract: {},
    IMG_BASE_URL: IMG_BASE_URL,
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
    pr_customer_id: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const pr_customer_id = wx.getStorageSync('pr_customer_id')
    this.setData({ pr_customer_id: pr_customer_id })
    if (options.pr_contract_id) {
      this.getContract(options.pr_contract_id)
    }
  },
  getContract(pr_contract_id) {
    wx.showLoading({
      title: '查询中...',
    })
    request('/contract/detail', 'post', { pr_contract_id: pr_contract_id, pr_customer_id: this.data.pr_customer_id }).then(res => {
      if (res) {
        this.setData({ contract: res })
      }
      wx.hideLoading()
    })
  },
})