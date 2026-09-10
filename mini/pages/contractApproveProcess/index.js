// pages/contractApproveProcess/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: '',
    pr_contract_id: '',
    type: '',
    taskKey: '',
    list: [],
    fromApply: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (options.fromApply) this.setData({ fromApply: true })
    if (options.list) {
      const list = JSON.parse(options.list)
      list.forEach(item => {
        item.approveTask = item.taskName.replace('总审核', '').replace('审核', '')
      })
      this.setData({ list: list })
    }
    this.setData({
      id: options.id,
      pr_contract_id: options.pr_contract_id,
      type: options.type,
      taskKey: options.taskKey
    })
  },
  toDetail() {
    if (this.data.fromApply) return
    wx.navigateTo({
      url: '/pages/contractApproveDetail/index?id=' + this.data.id + '&pr_contract_id=' + this.data.pr_contract_id + '&type=' + this.data.type + '&taskKey=' + this.data.taskKey,
    })
  }
})