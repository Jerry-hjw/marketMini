// pages/contractApprove/index.js
import { oaRequest } from '../../wxapi/index'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    contractStatus: '',
    dataList: [],
    taskType: 1,
    task_type_equal_query: 'N'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getApproveList()
  },
  getApproveList() {
    wx.showLoading({
      title: '查询中...',
    })
    oaRequest('/activiti/listTaskByApply', 'post', {}).then(res => {
      wx.hideLoading()
      if (res) {
        this.setData({ dataList: res})
      }
    })
  },
  toProcess(e) {
    const index = e.currentTarget.dataset.index
    const processDefinitionBeanList = JSON.parse(JSON.stringify(this.data.dataList[index].processDefinitionBeanList))
    processDefinitionBeanList.unshift({ approveResult: 'Y', taskName: '申请人', taskExcuted: 'Y', approveUser: this.data.dataList[index].apply_name, approveDate: this.data.dataList[index].apply_date })
    const id = this.data.dataList[index].id
    const pr_contract_id = this.data.dataList[index].businessKey
    const type = this.data.dataList[index].type
    const taskKey = this.data.dataList[index].taskDefinitionKey
    wx.navigateTo({
      url: '/pages/approveProcess/index?id=' + id + '&pr_contract_id=' + pr_contract_id + '&type=' + type + '&taskKey=' + taskKey + '&list=' + JSON.stringify(processDefinitionBeanList),
    })
  }
})