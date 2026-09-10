// pages/applyDetail/index.js
import { request, oaRequest, IMG_BASE_URL, OA_URL } from '../../wxapi/index'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    type: '',
    detail: {},
    detailType: [
      { key: '工程性', value: 'project' },
      { key: '经营性', value: 'manage' }
    ],
    id: {
      'merchantOvertime': 'oa_merchant_overtime_id',
      'merchantMaterialInout': 'oa_merchant_material_inout_id',
      'merchantMaintain': 'oa_merchant_maintain_id'
    },
    applyStatus: {
      'draft': '待提交',
      'approving': '审核中',
      'approvepass': '审核通过',
      'approvenopass': '审核不通过'
    },
    statusImg: {
      'draft': '/img/status_un.png',
      'approving': '/img/status_ing.png',
      'approvepass': '/img/status_pass.png',
      'approvenopass': '/img/status_nopass.png'
    },
    customer: null,
    member: null,
    arrayDetail: [],
    fileList: [],
    imgList: [],
    IMG_BASE_URL: IMG_BASE_URL,
    pr_customer_id: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const pr_customer_id = wx.getStorageSync('pr_customer_id')
    this.setData({ pr_customer_id: pr_customer_id })
    if (options.type) {
      const array = []
      switch (options.type) {
        case 'merchantOvertime':
          wx.setNavigationBarTitle({
            title: '非营业作业'
          })
          for(let i = 0; i < 5; i++) {
            array.push({})
          }
          this.setData({ arrayDetail: array })
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
          for(let i = 0; i < 5; i++) {
            array.push({})
          }
          this.setData({ arrayDetail: array })
          break
        default:
      }
      this.setData({ type: options.type })
    }
    this.getMember()
    if (options.id) this.getDetail(options.id)
  },
  getDetail(id) {
    request('/' + this.data.type + '/get', 'post', { [this.data.id[this.data.type]]: id, pr_customer_id: this.data.pr_customer_id }).then(res => {
      if (res) {
        let array = ''
        const typeObj = {
          'project': '工程性',
          'manage': '经营性'
        }
        switch (this.data.type) {
          case 'merchantOvertime':
            res.typeValue = res.overtime_type
            res.type = typeObj[res.overtime_type]
            res.reason = res.overtime_reason
            res.start_date = res.overtime_start.split(' ')[0]
            res.start_time = res.overtime_start.split(' ')[1]
            res.end_date = res.overtime_end.split(' ')[0]
            res.end_time = res.overtime_end.split(' ')[1]
            array = res.overtime_workers ? JSON.parse(res.overtime_workers) : ''
            break
          case 'merchantMaintain':
            res.maintain_date = res.apply_maintain_date.split(' ')[0]
            res.maintain_time = res.apply_maintain_date.split(' ')[1]
            array = res.material_detail ? JSON.parse(res.material_detail) : ''
            for (let j = 1; j <= 5; j++) {
              if (res['complete_file_' + j]) this.data.imgList.push({ url: res['complete_file_' + j], name: res['complete_file_' + j].split('/')[res['complete_file_' + j].split('/').length - 1], type: res['complete_file_' + j].split('.')[res['complete_file_' + j].split('.').length - 1] })
            }
            break
          case 'merchantMaterialInout':
            res.typeValue = res.material_inout_type
            res.type = typeObj[res.material_inout_type]
            res.reason = res.material_inout_reason
            res.start_date = res.material_inout_start.split(' ')[0]
            res.start_time = res.material_inout_start.split(' ')[1]
            res.end_date = res.material_inout_end.split(' ')[0]
            res.end_time = res.material_inout_end.split(' ')[1]
            break
          default:
        }
        for (let j = 1; j <= 5; j++) {
          if (res['apply_file_' + j]) this.data.fileList.push({ url: res['apply_file_' + j], name: res['apply_file_' + j].split('/')[res['apply_file_' + j].split('/').length - 1], type: res['apply_file_' + j].split('.')[res['apply_file_' + j].split('.').length - 1] })
        }
        this.setData({
          detail: res,
          arrayDetail: array,
          fileList: this.data.fileList,
          imgList: this.data.imgList
        })
      }
    })
  },
  getMember() {
    var params = {pr_member_id : wx.getStorageSync('pr_member_id')}
    request('/member/get', 'post', params).then(res => {
      if (res && res.baseBean) {
        this.setData({
          member: res.baseBean,
          'detail.pr_member_id': res.baseBean.pr_member_id
        })
        if (!this.data.detail.apply_user_name) {
          this.setData({ 'detail.apply_user_name': res.baseBean.full_name })
        }
        if (!this.data.detail.apply_user_phone) {
          this.setData({ 'detail.apply_user_phone': res.baseBean.mobile })
        }
        if (res.baseBean.business_user_id) {
          this.getCustomer(res.baseBean.business_user_id)
          this.queryLastContractUnit(res.baseBean.business_user_id)
        }
      }
    })
  },
  getCustomer(id) {
    request('/customer/get', 'post', { pr_customer_id: id }).then(res => {
      if (res) {
        this.setData({
          customer: res,
          'detail.pr_customer_id': res.pr_customer_id,
          'detail.customer_name': res.customer_name
        })
      }
    })
  },
  queryLastContractUnit(id) {
    request('/customer/queryLastContractUnit', 'post', { pr_customer_id: id }).then(res => {
      if (res) {
        this.setData({ 'detail.unit_name': res })
      }
    })
  },
  setType(e) {
    this.setData({
      'detail.type': this.data.detailType[e.detail.value].key,
      'detail.typeValue': this.data.detailType[e.detail.value].value
    })
  },
  setValue(e) {
    this.setData({ ['detail.' + e.currentTarget.dataset.prop]: e.detail.value })
  },
  setDetail(e) {
    const array = JSON.parse(JSON.stringify(this.data.arrayDetail))
    array[e.currentTarget.dataset.index][e.currentTarget.dataset.prop] = e.detail.value
    this.setData({ arrayDetail: array })
  },
  addDetail() {
    const array = JSON.parse(JSON.stringify(this.data.arrayDetail))
    array.push({})
    this.setData({ arrayDetail: array })
  },
  save() {
    const params = JSON.parse(JSON.stringify(this.data.detail))
    if (this.data.type !== 'merchantMaintain' && !params.start_date) {
      wx.showToast({
        title: '请选择开始日期',
        icon: 'none'
      })
      return
    }
    if (this.data.type !== 'merchantMaintain' && !params.start_time) {
      wx.showToast({
        title: '请选择开始时间',
        icon: 'none'
      })
      return
    }
    if (this.data.type !== 'merchantMaintain' && !params.end_date) {
      wx.showToast({
        title: '请选择结束日期',
        icon: 'none'
      })
      return
    }
    if (this.data.type !== 'merchantMaintain' && !params.end_time) {
      wx.showToast({
        title: '请先选择结束时间',
        icon: 'none'
      })
      return
    }
    if (this.data.type === 'merchantMaintain' && !params.maintain_date) {
      wx.showToast({
        title: '请输入申请维修日期',
        icon: 'none'
      })
      return
    }
    if (this.data.type === 'merchantMaintain' && !params.maintain_time) {
      wx.showToast({
        title: '请输入申请维修时间',
        icon: 'none'
      })
      return
    }
    for (let i = 0; i < this.data.fileList.length; i++) {
      params['apply_file_' + (i + 1)] = this.data.fileList[i].url
    }
    wx.showLoading({
      title: '保存中...',
    })
    switch (this.data.type) {
      case 'merchantOvertime':
        params.overtime_type = params.typeValue || ''
        params.overtime_reason = params.reason || ''
        params.overtime_start = params.start_date + ' ' + params.start_time + (params.start_time.length <= 5 ? ':00' : '')
        params.overtime_end = params.end_date + ' ' + params.end_time + (params.end_time.length <= 5 ? ':00' : '')
        params.overtime_workers = JSON.stringify(this.data.arrayDetail)
        break
      case 'merchantMaintain':
        params.apply_maintain_date = params.maintain_date + ' ' + params.maintain_time + (params.maintain_time.length <= 5 ? ':00' : '')
        break
      case 'merchantMaterialInout':
        params.material_inout_type = params.typeValue || ''
        params.material_inout_reason = params.reason || ''
        params.material_inout_start = params.start_date + ' ' + params.start_time + (params.start_time.length <= 5 ? ':00' : '')
        params.material_inout_end = params.end_date + ' ' + params.end_time + (params.end_time.length <= 5 ? ':00' : '')
        params.material_detail = JSON.stringify(this.data.arrayDetail)
        break
      default:
    }
    request('/' + this.data.type + '/save', 'post', params).then(res => {
      if (res && res.status === 'SUCCESS') {
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        })
        setTimeout(() => {
          const pages = getCurrentPages()
          const prevPage = pages[pages.length - 2]
          prevPage.getDataList(false)
          wx.navigateBack()
        }, 1500)
      }
      wx.hideLoading()
    })
  },
  submit() {
    const params = JSON.parse(JSON.stringify(this.data.detail))
    if (this.data.type !== 'merchantMaintain' && !params.type) {
      wx.showToast({
        title: '请选择类型',
        icon: 'none'
      })
      return
    }
    if (!params.apply_user_name) {
      wx.showToast({
        title: '请输入申请人',
        icon: 'none'
      })
      return
    }
    if (!params.apply_user_phone) {
      wx.showToast({
        title: '请输入联系电话',
        icon: 'none'
      })
      return
    }
    const reg = /^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/
    if (!reg.test(params.apply_user_phone)) {
      wx.showToast({
        title: '请输入正确的手机号码',
        icon: 'none'
      })
      return
    }
    if (this.data.type !== 'merchantMaintain' && !params.start_date) {
      wx.showToast({
        title: '请选择开始日期',
        icon: 'none'
      })
      return
    }
    if (this.data.type !== 'merchantMaintain' && !params.start_time) {
      wx.showToast({
        title: '请选择开始时间',
        icon: 'none'
      })
      return
    }
    if (this.data.type !== 'merchantMaintain' && !params.end_date) {
      wx.showToast({
        title: '请选择结束日期',
        icon: 'none'
      })
      return
    }
    if (this.data.type !== 'merchantMaintain' && !params.end_time) {
      wx.showToast({
        title: '请先选择结束时间',
        icon: 'none'
      })
      return
    }
    if (this.data.type !== 'merchantMaintain' && !params.reason) {
      wx.showToast({
        title: '请输入申请原因',
        icon: 'none'
      })
      return
    }
    if (this.data.type === 'merchantMaintain' && !params.maintain_date) {
      wx.showToast({
        title: '请输入申请维修日期',
        icon: 'none'
      })
      return
    }
    if (this.data.type === 'merchantMaintain' && !params.maintain_time) {
      wx.showToast({
        title: '请输入申请维修时间',
        icon: 'none'
      })
      return
    }
    if (this.data.type === 'merchantMaintain' && !params.apply_content) {
      wx.showToast({
        title: '请输入报修内容',
        icon: 'none'
      })
      return
    }
    if (!this.data.fileList || this.data.fileList.length === 0) {
      wx.showToast({
        title: '请上传附件',
        icon: 'none'
      })
      return
    }
    for (let i = 0; i < this.data.fileList.length; i++) {
      params['apply_file_' + (i + 1)] = this.data.fileList[i].url
    }
    wx.showLoading({
      title: '保存中...',
    })
    switch (this.data.type) {
      case 'merchantOvertime':
        params.overtime_type = params.typeValue
        params.overtime_reason = params.reason
        params.overtime_start = params.start_date + ' ' + params.start_time + (params.start_time.length <= 5 ? ':00' : '')
        params.overtime_end = params.end_date + ' ' + params.end_time + (params.end_time.length <= 5 ? ':00' : '')
        params.overtime_workers = JSON.stringify(this.data.arrayDetail)
        break
      case 'merchantMaintain':
        params.apply_maintain_date = params.maintain_date + ' ' + params.maintain_time + (params.maintain_time.length <= 5 ? ':00' : '')
        break
      case 'merchantMaterialInout':
        params.material_inout_type = params.typeValue
        params.material_inout_reason = params.reason
        params.material_inout_start = params.start_date + ' ' + params.start_time + (params.start_time.length <= 5 ? ':00' : '')
        params.material_inout_end = params.end_date + ' ' + params.end_time + (params.end_time.length <= 5 ? ':00' : '')
        params.material_detail = JSON.stringify(this.data.arrayDetail)
        break
      default:
    }
    request('/' + this.data.type + '/save', 'post', params).then(response => {
      wx.hideLoading()
      if (response && response.status === 'SUCCESS') {
        const that = this
        wx.showModal({
          title: '温馨提示',
          content: '您确定要提交审核吗',
          complete: (res1) => {
            if (res1.confirm) {
              wx.showLoading({
                title: '提交中...',
              })
              oaRequest('/' + that.data.type + '/submit', 'post', { [that.data.id[that.data.type]]: response.baseBean[that.data.id[that.data.type]] }).then(res => {
                wx.hideLoading()
                if (res && res.status === 'SUCCESS') {
                  wx.showToast({
                    title: '提交成功',
                    icon: 'success'
                  })
                  setTimeout(() => {
                    const pages = getCurrentPages()
                    const prevPage = pages[pages.length - 2]
                    prevPage.getDataList(false)
                    wx.navigateBack()
                  }, 1500)
                } else {
                  wx.showToast({
                    title: res.message,
                    icon: 'none'
                  })
                }
              })
            }
          }
        })
      }
    })
  },
  deleteApply() {
    const that = this
    wx.showModal({
      title: '温馨提示',
      content: '您确定要删除此申请单吗',
      complete: (res1) => {
        if (res1.confirm) {
          wx.showLoading({
            title: '删除中...',
          })
          oaRequest('/' + that.data.type + '/delete', 'post', { [that.data.id[that.data.type]]: that.data.detail[that.data.id[that.data.type]] }).then(res => {
            wx.hideLoading()
            if (res && res.status === 'SUCCESS') {
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              })
              setTimeout(() => {
                const pages = getCurrentPages()
                const prevPage = pages[pages.length - 2]
                prevPage.getDataList(false)
                wx.navigateBack()
              }, 1500)
            } else {
              wx.showToast({
                title: res.message,
                icon: 'none'
              })
            }
          })
        }
      }
    })
  },
  evaluate() {
    const that = this
    if (!this.data.imgList || this.data.imgList.length === 0) {
      wx.showToast({
        title: '请上传图片',
        icon: 'none'
      })
      return
    }
    const params = {
      [that.data.id[this.data.type]]: this.data.detail[[this.data.id[this.data.type]]],
      evaluate_result: this.data.detail.evaluate_result || ''
    }
    for (let i = 0; i < this.data.imgList.length; i ++) {
      params['complete_file_' + (i + 1)] = this.data.imgList[i].url
    }
    wx.showModal({
      title: '温馨提示',
      content: '您确定验收完毕并确认吗',
      complete: (res1) => {
        if (res1.confirm) {
          wx.showLoading({
            title: '提交中...',
          })
          oaRequest('/' + that.data.type + '/evaluate', 'post', params).then(res => {
            wx.hideLoading()
            if (res && res.status === 'SUCCESS') {
              wx.showToast({
                title: '验收成功',
                icon: 'success'
              })
              setTimeout(() => {
                const pages = getCurrentPages()
                const prevPage = pages[pages.length - 2]
                prevPage.getDataList(false)
                wx.navigateBack()
              }, 1500)
            }
          })
        }
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
  openFile(e) {
    const type = e.currentTarget.dataset.type
    const url = e.currentTarget.dataset.url
    const imgType = ['jpg', 'png', 'jpeg']
    if (imgType.includes(type)) {
      wx.previewImage({
        urls: [IMG_BASE_URL + url]
      })
    } else {
      wx.downloadFile({
        url: IMG_BASE_URL + url,
        success(res) {
          wx.openDocument({
            filePath: res.tempFilePath,
            fileType: type,
            fail() {
              wx.showToast({
                title: '打开失败',
                icon: 'error'
              })
            }
          })
        }
      })
    }
  },
  deleteFile(e) {
    const prop = e.currentTarget.dataset.prop
    const url = e.currentTarget.dataset.url
    const list = JSON.parse(JSON.stringify(this.data[prop]))
    this.setData({ [prop]: list.filter(item => { return item.url !== url }) })
  }
})