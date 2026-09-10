// OA.js
import { request, IMG_BASE_URL, oaRequest } from '../../wxapi/index'
Page({
  data: {
    functionList1: [
      {
        name: '合同新增',
        img: '/img/contractAdd.png',
        url: '/pages/contractApprove/index?name=合同新增',
        type: 'process_contract'
      },
      {
        name: '合同变更',
        img: '/img/contractChange.png',
        url: '/pages/contractApprove/index?name=合同变更',
        type: 'process_contract_change'
      },
      {
        name: '合同解约',
        img: '/img/contractLonger.png',
        url: '/pages/contractApprove/index?name=合同解约',
        type: 'process_contract_terminal'
      },
      {
        name: '合同结算',
        img: '/img/contractStop.png',
        url: '/pages/contractApprove/index?name=合同结算',
        type: 'process_contract_settle'
      }
    ],
    functionList2: [
      {
        name: '非营业作业',
        img: '/img/function_4.png',
        url: '/pages/contractApprove/index?name=非营业作业',
        type: 'oa_merchant_overtime'
      },
      {
        name: '物品放行',
        img: '/img/function_5.png',
        url: '/pages/contractApprove/index?name=物品放行',
        type: 'oa_merchant_materialinout'
      },
      {
        name: '维修申报',
        img: '/img/function_8.png',
        url: '/pages/contractApprove/index?name=维修申报',
        type: 'oa_merchant_maintain'
      }
    ],
    functionList3: [
      {
        name: '固定支出',
        img: '/img/fixPayable.png',
        url: ''
      },
      {
        name: '临时支出',
        img: '/img/receivePayable.png',
        url: ''
      }
    ],
    functionList4: [
      {
        name: '积分商城',
        img: '/img/integral.png',
        url: '/pages/contractApprove/index?name=积分商城',
        type: 'oa_product_online'
      },
      {
        name: '线上秒杀',
        img: '/img/seckill.png',
        url: '/pages/contractApprove/index?name=线上秒杀',
        type: 'oa_product_online'
      },
      {
        name: '优惠券',
        img: '/img/coupon.png',
        url: '/pages/contractApprove/index?name=优惠券',
        type: 'oa_coupon_online'
      }
    ],
    functionList5: [
      {
        name: '文件处理卡',
        img: '/img/file.png',
        url: ''
      }
    ],
    IMG_BASE_URL: IMG_BASE_URL,
    member: null
  },
  onLoad() {
    this.getSystem()
  },
  getSystem() {
    request('/system/get', 'post', {}).then(res => {
      if (res) {
        this.setData({ systemOwner: res.system_owner })
        wx.setStorageSync('systemOwner', res.system_owner)
        this.getDataList()
      }
    })
  },
  getDataList() {
    wx.showLoading({
      title: '查询中...',
    })
    oaRequest('/activiti/listTask', 'post', { task_type: '', oa_origin: 'merchant', iDisplayLength: 1000 }, true).then(res => {
      wx.hideLoading()
      if (res && res.aaData) {
        res.aaData.forEach(item => {
          item.type = item.type.replace('_jzd', '').replace('_01', '').replace('_02', '').replace('_03', '').replace('_04', '').replace('_05', '').replace('_06', '')
        })
        this.data.functionList1.forEach(item => {
          item.undoCount = res.aaData.filter(r => { return item.type === 'process_contract' ? r.type === item.type : r.type.indexOf(item.type) !== -1  }).length
        })
        this.data.functionList2.forEach(item => {
          item.undoCount = res.aaData.filter(r => { return r.type.indexOf(item.type) !== -1  }).length
        })
        this.data.functionList4.forEach(item => {
          item.undoCount = res.aaData.filter(r => { return r.type.indexOf(item.type) !== -1  }).length
        })
        this.setData({
          dataList: res.aaData,
          functionList1: this.data.functionList1,
          functionList2: this.data.functionList2,
          functionList4: this.data.functionList4
        })
      }
    })
  },
  toPage(e) {
    const array = ['/pages/contract/index', '/pages/bill/index']
    if (array.includes(e.currentTarget.dataset.url) && this.data.member.business_user_type !== 'boss') {
      wx.showModal({
        title: '温馨提示',
        content: '员工暂无此权限',
        confirmText: '我知道了',
        confirmColor: '#8ec31f'
      })
      return
    }
    wx.navigateTo({
      url: e.currentTarget.dataset.url
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
      url: '/pages/contractApproveProcess/index?id=' + id + '&pr_contract_id=' + pr_contract_id + '&list=' + JSON.stringify(processDefinitionBeanList) + '&type=' + type + '&taskKey=' + taskKey,
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
      url: '/pages/contractApproveDetail/index?id=' + id + '&pr_contract_id=' + pr_contract_id + '&status=' + status + '&type=' + type + '&taskKey=' + taskKey,
    })
  },
  onShareAppMessage() {
    wx.showShareMenu({
        withShareTicket: true,
        menu: ['shareAppMessage','shareTimeline']
    })
  }
})
