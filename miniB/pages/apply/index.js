// pages/apply/index.js
import { request } from '../../wxapi/index'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    type: '',
    dataList: [],
    applyStatus: {
      'draft': '待提交',
      'approving': '审核中',
      'approvepass': '审核通过',
      'approvenopass': '审核不通过'
    },
    pr_customer_id: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const pr_customer_id = wx.getStorageSync('pr_customer_id')
    this.setData({ pr_customer_id: pr_customer_id })
    if (options.type) {
      switch (options.type) {
        case 'merchantOvertime':
          wx.setNavigationBarTitle({
            title: '非营业作业'
          })
          break
        case 'merchantMaintain':
          wx.setNavigationBarTitle({
            title: '维修申报'
          })
          break
        case 'merchantMaterialInout':
          wx.setNavigationBarTitle({
            title: '物品放行'
          })
          break
        default:
      }
      this.setData({ type: options.type })
      this.getDataList()
    }
  },
  getDataList(flag) {
    request('/' + this.data.type + '/queryList', 'post', { iDisplayStart: flag ? this.data.dataList.length : 0, iDisplayLength: 8, pr_customer_id: this.data.pr_customer_id }).then(res => {
      if (res) {
        this.setData({
          dataList: flag ? this.data.dataList.concat(res) : res
        })
      }
    })
  },
  toDetail(e) {
    wx.navigateTo({
      url: '/pages/applyDetail/index?type=' + this.data.type + (e.currentTarget.dataset.id ? '&id=' + e.currentTarget.dataset.id : '')
    })
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    this.getDataList(true)
  }
})