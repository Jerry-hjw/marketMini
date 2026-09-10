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
    if (options.name) {
      wx.setNavigationBarTitle({
        title: options.name,
      })
      const status = {
        '合同新增': 'process_contract',
        '合同变更': 'process_contract_change',
        '合同解约': 'process_contract_terminal',
        '合同结算': 'process_contract_settle',
        '非营业作业': 'oa_merchant_overtime',
        '物品放行': 'oa_merchant_materialinout',
        '维修申报': 'oa_merchant_maintain',
        '积分商城': 'oa_product_online',
        '线上秒杀': 'oa_product_online',
        '优惠券': 'oa_coupon_online'
      }
      this.setData({
        contractStatus: status[options.name],
        task_type_equal_query: status[options.name] === 'process_contract' ? 'Y' : 'N'
      })
    }
    if (options.taskType) {
      this.setData({ taskType: parseInt(options.taskType) })
      wx.setNavigationBarTitle({
        title: '审核列表',
      })
    }
    this.getDataList()
  },
  getApproveList(flag) {
    wx.showLoading({
      title: '查询中...',
    })
    const params = {
      task_type: this.data.contractStatus ? this.data.contractStatus + (wx.getStorageSync('systemOwner') ? '_' + wx.getStorageSync('systemOwner') : '') : '',
      // task_type_equal_query: this.data.task_type_equal_query,
      oa_origin: 'merchant',
      iDisplayStart: flag ? this.data.dataList.length : 0,
      iDisplayLength: 6
    }
    oaRequest('/activiti/listTask', 'post', params, true).then(res => {
      wx.hideLoading()
      if (res && res.aaData) {
        this.setData({ dataList: flag ? this.data.dataList.concat(res.aaData) : res.aaData })
      }
    })
  },
  getHisTaskList(flag) {
    wx.showLoading({
      title: '查询中...',
    })
    oaRequest('/activiti/listHisTask', 'post', { task_type: this.data.contractStatus, oa_origin: 'merchant', iDisplayStart: flag ? this.data.dataList.length : 0, iDisplayLength: 8 }, true).then(res => {
      wx.hideLoading()
      if (res && res.aaData) {
        this.setData({ dataList: flag ? this.data.dataList.concat(res.aaData) : res.aaData })
      }
    })
  },
  getDataList(flag) {
    this.data.taskType === 1 ? this.getApproveList(flag) : this.getHisTaskList(flag)
  },
  setTask(e) {
    this.setData({ taskType: e.currentTarget.dataset.type })
    this.getDataList()
  },
  setDate(e) {
    this.setData({ [e.currentTarget.dataset.prop]: e.detail.value })
    this.data.taskType === 1 ? this.getApproveList() : this.getHisTaskList()
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
      url: '/pages/contractApproveProcess/index?id=' + id + '&pr_contract_id=' + pr_contract_id + '&type=' + type + '&taskKey=' + taskKey + '&list=' + JSON.stringify(processDefinitionBeanList),
    })
  },
  toDetail(e) {
    const index = e.currentTarget.dataset.index
    const id = this.data.dataList[index].id
    const pr_contract_id = this.data.dataList[index].businessKey
    const type = this.data.dataList[index].type
    const taskKey = this.data.dataList[index].taskDefinitionKey
    const status = e.currentTarget.dataset.status
    wx.navigateTo({
      url: '/pages/contractApproveDetail/index?id=' + id + '&pr_contract_id=' + pr_contract_id + '&type=' + type + '&taskKey=' + taskKey + '&status=' + status,
    })
  }
})