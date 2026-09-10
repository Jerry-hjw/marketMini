// pages/contractApproveDetail/index.js
import { oaRequest, request, IMG_BASE_URL, OA_URL } from '../../wxapi/index'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: null,
    type: null,
    contract: null,
    approveStatus: null,
    approveFrom: '',
    certificateType: {
      '1': '身份证',
      '2': '居民户口簿',
      '3': '护照',
      '4': '纳税人识别号',
      '5': '港澳通行证'
    },
    paymentCycle: {
      'year': '年',
      'halfyear': '半年',
      'quarter': '季',
      'month': '月',
      'once': '一次性'
    },
    rentalModel: {
      'rental': '按固定费用',
      'commission': '按提成',
      'rental_and_commission': '固定费用+提成',
      'rental_or_commission': '固定费用提成取其高'
    },
    commissionRule: {
      'month_full': '月全额',
      'month_diff': '月差额',
      'year_full': '年全额',
      'year_diff': '年差额'
    },
    unitCostList: [],
    onceCostList: [],
    commissionCostList: [],
    contractFileList: [],
    status: '',
    dialogVisible: false,
    refuseVisible: false,
    assignVisible: false,
    approveContent: '',
    merchantMaintain: null,
    merchantOvertime: null,
    merchantMaterialInout: null,
    amountName: {
      '01': '金额',
      '02': '优惠金额',
      '03': '折扣',
      '05': '停车时长'
    },
    couponType: {
      '01': '代金券',
      '02': '满减券',
      '03': '折扣券',
      '04': '体验券',
      '05': '停车券'
    },
    productType: {
      'integral': '积分商城',
      'seckill': '线上秒杀'
    },
    memberLevel: {
      // '00': '微信粉丝',
      '01': '贵宾卡会员',
      '02': '金卡会员',
      '03': '钻卡会员'
    },
    merchantType: {
      'project': '工程性',
      'manage': '经营性'
    },
    IMG_BASE_URL: IMG_BASE_URL,
    employeeList: [],
    employee_name: '',
    pr_employee_id: '',
    fileList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getUnitType()
    if (options.id) this.setData({ id: options.id })
    if (options.status) this.setData({ approveFrom: options.status })
    if (options.pr_contract_id) {
      this.setData({
        type: options.type,
        taskKey: options.taskKey
      })
      const type = options.type
      if (type && type.indexOf('terminal') !== -1) this.queryContractTerminal(options.pr_contract_id)
      if (type && type.indexOf('settle') !== -1) this.queryContractSettle(options.pr_contract_id)
      if (type && type.indexOf('change') !== -1) this.queryContractChange(options.pr_contract_id)
      if (type.indexOf('contract') !== -1 && type.indexOf('change') === -1) {
        this.getContract(options.pr_contract_id)
        this.queryPrContractRelUnitList(options.pr_contract_id)
        this.queryPrContractRelCostList(options.pr_contract_id)
        this.queryPrContractRelCommission(options.pr_contract_id)
        this.queryContractFile(options.pr_contract_id)
      }
      if (options.type.indexOf('merchant_overtime') !== -1) {
        this.getOvertime(options.pr_contract_id)
      }
      if (options.type.indexOf('merchant_maintain') !== -1) {
        this.getMaintain(options.pr_contract_id)
      }
      if (options.type.indexOf('merchant_materialinout') !== -1) {
        this.getMaterialInout(options.pr_contract_id)
      }
      if (options.type.indexOf('product') !== -1) {
        this.getProduct(options.pr_contract_id)
      }
      if (options.type.indexOf('coupon') !== -1) {
        this.getCoupon(options.pr_contract_id)
      }
    }
  },
  getContract(id, fromChange) {
    wx.showLoading({
      title: '查询中...',
    })
    request('/contract/detail', 'post', { pr_contract_id: id }).then(res => {
      wx.hideLoading()
      if (res) {
        if (res.contract_file_url) res.contract_file_name = res.contract_file_url.split('/')[res.contract_file_url.split('/').length - 1]
        this.setData({ contract: res })
        if (!fromChange) this.setData({ approveStatus: res.contract_status })
      }
    })
  },
  queryContractChange(id) {
    oaRequest('/contractChange/get', 'post', { pr_contract_change_id: id }).then(res => {
      if (res) {
        this.setData({
          contractChange: res,
          approveStatus: res.change_status
        })
        this.getContract(res.dest_pr_contract_id, true)
        this.queryPrContractRelUnitList(res.dest_pr_contract_id)
        this.queryPrContractRelCostList(res.dest_pr_contract_id)
        this.queryPrContractRelCommission(res.dest_pr_contract_id)
        this.queryContractFile(res.dest_pr_contract_id)
      }
    })
  },
  queryContractSettle(id) {
    oaRequest('/contractSettle/queryContractSettle', 'post', { pr_contract_id: id }).then(res => {
      if (res) {
        this.setData({ contractSettle: res })
      }
    })
  },
  queryContractTerminal(id) {
    oaRequest('/contractTerminal/queryContractTerminal', 'post', { pr_contract_id: id }).then(res => {
      if (res) {
        this.setData({ contractTerminal: res })
      }
    })
  },
  getUnitType() {
    wx.showLoading({
      title: '查询中...',
    })
    oaRequest('/unitType/queryAll', 'post', {}).then(res => {
      wx.hideLoading()
      if (res && res.length > 0) {
        const unitType = {}
        res.forEach(item => {
          unitType[item.pr_unit_type_id] = item.unit_type_name
        })
        this.setData({ unitType: unitType })
      }
    })
  },
  // 周期性费用
  queryPrContractRelUnitList(id) {
    wx.showLoading({
      title: '查询中...',
    })
    oaRequest('/contract/queryPrContractRelUnitList', 'post', { pr_contract_id: id }).then(res => {
      wx.hideLoading()
      if (res && res.length > 0) {
        this.setData({ unitCostList: res })
      }
    })
  },
  // 一次性、押金费用
  queryPrContractRelCostList(id) {
    wx.showLoading({
      title: '查询中...',
    })
    oaRequest('/contract/queryPrContractRelCostList', 'post', { pr_contract_id: id }).then(res => {
      wx.hideLoading()
      if (res && res.length > 0) {
        this.setData({ onceCostList: res })
      }
    })
  },
  // 提成费用
  queryPrContractRelCommission(id) {
    wx.showLoading({
      title: '查询中...',
    })
    oaRequest('/contract/queryPrContractRelCommission', 'post', { pr_contract_id: id }).then(res => {
      wx.hideLoading()
      if (res && res.length > 0) {
        this.setData({ commissionCostList: res })
      }
    })
  },
  // 合同附件
  queryContractFile(id) {
    wx.showLoading({
      title: '查询中...',
    })
    oaRequest('/contract/queryContractFile', 'post', { pr_contract_id: id }).then(res => {
      wx.hideLoading()
      if (res && res.length > 0) {
        this.setData({ contractFileList: res })
      }
    })
  },
  openFile(e) {
    const url = e.currentTarget.dataset.url
    const name = e.currentTarget.dataset.name || url
    const type = name.split('.')[name.split('.').length - 1]
    if (!url) {
      wx.showToast({
        title: '文件路径不存在',
        icon: 'none'
      })
      return
    }
    wx.downloadFile({
      url: url,
      success(res) {
        wx.openDocument({
          filePath: res.tempFilePath,
          fileType: type,
          fail() {
            wx.showToast({
              title: '文件无法打开',
              icon: 'none'
            })
          }
        })
      }
    })
  },
  getMaintain(id) {
    oaRequest('/merchantMaintain/detail', 'post', { oa_merchant_maintain_id: id }).then(res => {
      if (res) {
        const fileList = []
        for (let i = 1; i < 6; i++) {
          if (res['apply_file_' + i]) fileList.push({ file_url: res['apply_file_' + i], file_name: res['apply_file_' + i].split('/')[res['apply_file_' + i].split('/').length - 1] })
        }
        if (res.material_detail) res.materialDetail = JSON.parse(res.material_detail)
        if (res.apply_status === 'approving' && this.data.taskKey.indexOf('assign') !== -1) this.getEmployeeList()
        this.setData({
          merchantMaintain: res,
          approveStatus: res.apply_status,
          contractFileList: fileList
        })
      }
    })
  },
  getOvertime(id) {
    oaRequest('/merchantOvertime/detail', 'post', { oa_merchant_overtime_id: id }).then(res => {
      if (res) {
        const fileList = []
        for (let i = 1; i < 6; i++) {
          if (res['apply_file_' + i]) fileList.push({ file_url: res['apply_file_' + i], file_name: res['apply_file_' + i].split('/')[res['apply_file_' + i].split('/').length - 1] })
        }
        if (res.overtime_workers) res.overtimeWorkers = JSON.parse(res.overtime_workers)
        this.setData({
          merchantOvertime: res,
          approveStatus: res.apply_status,
          contractFileList: fileList
        })
      }
    })
  },
  getMaterialInout(id) {
    oaRequest('/merchantMaterialInout/detail', 'post', { oa_merchant_material_inout_id: id }).then(res => {
      if (res) {
        const fileList = []
        for (let i = 1; i < 6; i++) {
          if (res['apply_file_' + i]) fileList.push({ file_url: res['apply_file_' + i], file_name: res['apply_file_' + i].split('/')[res['apply_file_' + i].split('/').length - 1] })
        }
        if (res.material_detail) res.materialDetail = JSON.parse(res.material_detail)
        this.setData({
          merchantMaterialInout: res,
          approveStatus: res.apply_status,
          contractFileList: fileList
        })
      }
    })
  },
  getProduct(id) {
    oaRequest('/product/detail', 'post', { pr_product_id: id }).then(res => {
      if (res) {
        this.setData({
          product: res,
          approveStatus: res.product_approve_status
        })
      }
    })
  },
  getCoupon(id) {
    oaRequest('/coupon/get', 'post', { pr_coupon_id: id }).then(res => {
      if (res && res.baseBean) {
        this.setData({
          coupon: res.baseBean,
          approveStatus: res.baseBean.approve_status
        })
      }
    })
  },
  getEmployeeList() {
    oaRequest('/employee/queryAll', 'post', {}).then(res => {
      if (res) {
        this.setData({ employeeList: res })
      }
    })
  },
  showPopup(e) {
    this.setData({
      status: e.currentTarget.dataset.status,
      dialogVisible: true
    })
  },
  closePopup() {
    this.setData({
      dialogVisible: false,
      assignVisible: false,
      refuseVisible: false,
      approveContent: ''
    })
  },
  showAssign() {
    this.setData({ assignVisible: true })
  },
  showRefuse() {
    this.setData({ refuseVisible: true })
  },
  chooseEmployee(e) {
    this.setData({
      employee_name: this.data.employeeList[e.detail.value].employee_name,
      pr_employee_id: this.data.employeeList[e.detail.value].pr_employee_id
    })
  },
  setProp(e) {
    this.setData({ ['merchantMaintain.' + e.currentTarget.dataset.prop]: e.detail.value })
  },
  approve(e) {
    const params = {
      approveContent: e.detail.value.remark,
      approveResult: this.data.status,
      taskId: this.data.id,
      oa_origin: 'merchant'
    }
    oaRequest('/activiti/approveTask', 'post', params).then(res => {
      if (res && res.status === 'SUCCESS') {
        this.closePopup()
        wx.showToast({
          title: '审核成功',
          icon: 'success'
        })
        setTimeout(() => {
          wx.reLaunch({
            url: '/pages/OA/index',
          })
        }, 2000)
      } else {
        wx.showToast({
          title: res.message,
          icon: 'none'
        })
      }
    })
  },
  confirm() {
    const params = JSON.parse(JSON.stringify(this.data.merchantMaintain))
    params.taskId = this.data.id
    params.maintain_worker = this.data.employee_name
    switch (this.data.taskKey) {
      case 'oa_merchant_maintain_assign':
        if (!params.maintain_manager) {
          // wx.showToast({
          //   title: '请输入委派人',
          //   icon: 'none'
          // })
          // return
          params.maintain_manager = 'admin'
        }
        if (!params.maintain_worker) {
          wx.showToast({
            title: '请输入施工人',
            icon: 'none'
          })
          return
        }
        oaRequest('/merchantMaintain/assign', 'post', params).then(res => {
          if (res && res.status === 'SUCCESS') {
            this.closePopup()
            wx.showToast({
              title: '确认成功！',
              icon: 'success'
            })
            setTimeout(() => {
              wx.reLaunch({
                url: '/pages/OA/index',
              })
            }, 2000)
          }
        })
        break
      case 'oa_merchant_maintain_work':
        if (params.start_date && params.start_time) {
          params.maintain_start = params.start_date + ' ' + params.start_time + ':00'
        } else {
          wx.showToast({
            title: '请选择动工日期和时间',
            icon: 'none'
          })
          return
        }
        if (params.end_date && params.end_time) {
          params.maintain_end = params.end_date + ' ' + params.end_time + ':00'
        } else {
          wx.showToast({
            title: '请选择完成日期和时间',
            icon: 'none'
          })
          return
        }
        if (!params.maintain_record) {
          wx.showToast({
            title: '请输入维修记录',
            icon: 'none'
          })
          return
        }
        if (!params.maintain_result) {
          wx.showToast({
            title: '请输入维修结果',
            icon: 'none'
          })
          return
        }
        if (this.data.fileList.length > 0) {
          for (let i = 0; i < this.data.fileList.length; i++) {
            params['complete_file_' + (i + 1)] = this.data.fileList[i].url
          }
        }
        if (!params.complete_file_1) {
          wx.showToast({
            title: '请上传完工图片',
            icon: 'none'
          })
          return
        }
        const materialDetail = []
        for (let i = 0; i < 5; i++) {
          const obj = {}
          if (params['name' + i]) obj.name = params['name' + i]
          if (params['sku' + i]) obj.sku = params['sku' + i]
          if (params['unit' + i]) obj.unit = params['unit' + i]
          if (params['quantity' + i]) obj.quantity = params['quantity' + i]
          if (obj.name || obj.sku || obj.unit || obj.quantity) materialDetail.push(obj)
        }
        if (materialDetail.length > 0) params.material_detail = JSON.stringify(materialDetail)
        oaRequest('/merchantMaintain/work', 'post', params).then(res => {
          if (res) {
            this.closePopup()
            wx.showToast({
              title: '确认成功!',
              icon: 'success'
            })
            setTimeout(() => {
              wx.reLaunch({
                url: '/pages/OA/index',
              })
            }, 2000)
          }
        })
        break
      default:
    }
  },
  noassign(e) {
    const params = {
      taskId: this.data.id,
      oa_merchant_maintain_id: this.data.merchantMaintain.oa_merchant_maintain_id,
      refuse_reason: e.detail.value.approveContent
    }
    if (!params.refuse_reason) {
      wx.showToast({
        title: '请输入拒绝原因',
        icon: 'none'
      })
      return
    }
    oaRequest('/merchantMaintain/noassign', 'post', params).then(res => {
      if (res) {
        wx.showToast({
          title: '拒绝成功!',
          icon: 'success'
        })
        setTimeout(() => {
          wx.reLaunch({
            url: '/pages/OA/index',
          })
        }, 2000)
      }
    })
  },
  upload(e) {
    const that = this
    const prop = e.currentTarget.dataset.prop
    wx.chooseMedia({
      count: 5 - that.data[prop].length,
      mediaType: ['image'],
      success(response) {
        wx.showLoading({
		      title: '正在上传...',
		      mask:false
        })
        for (let i = 0; i < response.tempFiles.length; i++) {
          wx.uploadFile({
            url: OA_URL + '/upload',
            header: {
              'token': wx.getStorageSync('token'),
              'Content-Type': 'multipart/form-data'
            },
            filePath: response.tempFiles[i].tempFilePath,
            name: 'file',
            success (res2) {
              wx.hideLoading() 
              let r = res2.data
              const uploadResponse = JSON.parse(res2.data)
              var imgurl = uploadResponse.baseBean.value 
              if (uploadResponse.status === 'SUCCESS') {
                const list = JSON.parse(JSON.stringify(that.data[prop]))
                list.push({ url: imgurl, name: imgurl.split('/')[imgurl.split('/').length - 1], type: imgurl.split('.')[r.split('.').length - 1] })
                that.setData({
                  [prop]: list
                })
                wx.showToast({
                  title: '上传成功',
                  icon: 'success'
                })
                if (i === response.tempFiles.length - 1) wx.hideLoading()
              } else {
                wx.showToast({
                  title: JSON.parse(res2.data).message,
                  icon: 'none'
                })
              }
            },
            fail() {
              wx.hideLoading()
            }
          })
        }
      }
    })
  },
  deleteFile(e) {
    const prop = e.currentTarget.dataset.prop
    const url = e.currentTarget.dataset.url
    const list = JSON.parse(JSON.stringify(this.data[prop]))
    this.setData({ [prop]: list.filter(item => { return item.url !== url }) })
  }
})