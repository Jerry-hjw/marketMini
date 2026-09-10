// pages/merchantSalesDetail/index.js
import { request, API_BASE_URL, IMG_BASE_URL,OA_URL } from '../../wxapi/index'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    merchantSalesDetail: {
      pr_merchant_sales_detail_id: null,
      sales_date: null,
      sales_quantity: 0,
      sales_amount: 0,
      sales_payment_detail: [],
      attachment_url: null
    },
    onChooseContract: {
      pr_contract_id: null,
      contract_name: null 
    },
    pr_customer_id: '',
    merchantPaymentMethod: [],
    IMG_BASE_URL: IMG_BASE_URL
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const pr_customer_id = wx.getStorageSync('pr_customer_id')
    const date = new Date()
    const year = date.getFullYear()
    let month = date.getMonth() + 1
    if (month < 10) month = '0' + month
    let day = date.getDate()
    if (day < 10) day = '0' + day
    this.setData({
      'merchantSalesDetail.sales_date': year + '-' + month + '-' + day,
      pr_customer_id: pr_customer_id
    })
    if (options.id) this.getMerchantSalesDetail(options.id)
    this.getOwnContract()
    this.getMerchantPaymentMethod()
  },
  getMerchantSalesDetail(id) {
    request('/merchantSalesDetail/get', 'post', { pr_merchant_sales_detail_id: id }).then(res => {
      if (res) {
        res.sales_payment_detail = JSON.parse(res.sales_payment_detail)
        this.setData({ merchantSalesDetail: res })
      }
    })
  },
  getOwnContract() {
    request('/contract/queryList', 'post', { pr_customer_id: this.data.pr_customer_id, pr_unit_type_id: '02'}).then(res => {
      if (res) {
        if (res.length === 0) {
          wx.showToast({
            title: '您尚未签订有效合同',
            icon: 'none'
          })
        }
        if (res.length === 1) {
          this.setData({
            onChooseContract: res[0]
          })
        }
      }
    })
  },
  getMerchantPaymentMethod() {
    request('/merchantPaymentMethod/queryAll', 'post', {}).then(res => {
      if (res) {
        this.setData({
          merchantPaymentMethod: res,
          'merchantSalesDetail.sales_payment_detail': res.map(item => { return Object.assign(item, { sales_amount: 0 }) })
        })
      }
    })
  },
  setSalesDate(e) {
    this.setData({ 'merchantSalesDetail.sales_date': e.detail.value })
  },
  chooseContract() {
    wx.navigateTo({
      url: '/pages/contract/index?fromChoose=merchantSalesDetail',
    })
  },
  choosePaymentMethod(e) {
    const array = this.data.merchantSalesDetail.sales_payment_detail
    if (e.detail.value) {
      const index = parseInt(e.detail.value)
      const paymentMethod = this.data.merchantPaymentMethod[index]
      paymentMethod.sales_amount = 0
      if (array.filter(item => { return item.pr_merchant_payment_method_id === paymentMethod.pr_merchant_payment_method_id }).length === 0) {
        array.push(paymentMethod)
        this.setData({
          'merchantSalesDetail.sales_payment_detail': array,
          merchantPaymentMethod: this.data.merchantPaymentMethod.filter(item => { return item.pr_merchant_payment_method_id !== paymentMethod.pr_merchant_payment_method_id })
        })
      } else {
        wx.showToast({
          title: '该支付方式已添加',
          icon: 'none'
        })
      }
    }
  },
  setSalesAmount(e) {
    const amount = e.detail.value
    const index = e.currentTarget.dataset.index
    const array = this.data.merchantSalesDetail.sales_payment_detail
    array[index].sales_amount = amount
    this.setData({
      'merchantSalesDetail.sales_payment_detail': array,
      'merchantSalesDetail.sales_amount': array.reduce((previous, next) => {
        return previous + (next ? parseFloat(next.sales_amount) : 0) }
      , 0)
    })
  },
  setSalesQuantity(e) {
    this.setData({ 'merchantSalesDetail.sales_quantity': e.detail.value })
  },
  saveMerchantSalesDetail() {
    if (parseFloat(this.data.merchantSalesDetail.sales_amount) <= 0.001) {
      wx.showToast({
        title: '销售金额(合计)不能为0',
        icon: 'none'
      })
      return
    }
    if (parseFloat(this.data.merchantSalesDetail.sales_quantity) <= 0.001) {
      wx.showToast({
        title: '销售数量不能为0',
        icon: 'none'
      })
      return
    }
    const params = JSON.parse(JSON.stringify(this.data.merchantSalesDetail))
    params.pr_contract_id = this.data.onChooseContract.pr_contract_id
    params.pr_realty_id = this.data.onChooseContract.pr_realty_id
    params.pr_customer_id = this.data.pr_customer_id
    params.sales_payment_detail = JSON.stringify(params.sales_payment_detail)
    request('/merchantSalesDetail/save', 'post', params, true).then(res => {
      if (res && res.status === 'SUCCESS') {
        wx.showToast({
          title: '上传成功',
          icon: 'success'
        })
        setTimeout(() => {
          const pages = getCurrentPages()
          const prevPage = pages[pages.length - 2]
          prevPage.getMerchantSalesList(false)
          wx.navigateBack()
        }, 1500)
      } else {
        wx.showToast({
          title: res.message,
          icon: 'none'
        })
      }
    })
  },
  // 上传文件
  uploadFile() {
    let that = this
    wx.chooseMedia({
      count: 1,
      mediaType: ['mix'],
      sourceType: ['camera', 'album'],
      success: function (res) {
        if (res.tempFiles.length > 0) {
          for (let i = 0; i < res.tempFiles.length; i++) {
            wx.uploadFile({
              url: OA_URL + '/upload',
              header: {
                'token': wx.getStorageSync('token'),
                'Content-Type': 'multipart/form-data'
              },
              filePath: res.tempFiles[i].tempFilePath,
              name: 'file',
              formData: {
                'fileType': res.tempFiles[i].fileType
              },
              success(response) {
                const uploadResponse = JSON.parse(response.data)
                var imgurl = uploadResponse.baseBean.value 
                that.setData({
                  'merchantSalesDetail.attachment_url': imgurl
                })
              }
            })
          }
        }
      }
    })
  },
  // 删除上传文件
  deleteUploadFile(e) {
    this.setData({
      'merchantSalesDetail.attachment_url': ''
    })
  },
  // 点击图片预览大图
  showBigImage(e) {
    wx.previewImage({
      urls: [e.currentTarget.dataset.url],
    })
  }
})