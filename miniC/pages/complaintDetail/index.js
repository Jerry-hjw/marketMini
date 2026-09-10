// pages/complaint/index.js
import { defineNavTop } from '../../utils/util'
import { request, API_BASE_URL, IMG_BASE_URL, OA_URL} from '../../wxapi/index'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    top: 0,
    IMG_BASE_URL: IMG_BASE_URL,
    pr_complaint_id: null,
    complaint: {},
    imgList: [],
    customerList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({ top: defineNavTop() })
    if (options.id) {
      this.setData({ pr_complaint_id: options.id })
      this.getComplaint(options.id)
    } else {
      this.getMember()
    }
  },
  getMember() {
    request('/member/get', 'post', {}).then(res => {
      if (res) {
        this.setData({ 'complaint.contacts_phone': res.mobile })
      }
    })
  },
  getComplaint(id) {
    wx.showLoading({
      title: '查询中...',
    })
    request('/complaint/detail', 'post', { pr_complaint_id: id }).then(res => {
      if (res) {
        const list = []
        for (let i = 0; i < 5; i++) {
          if (res['photo' + (i + 1) + '_url']) {
            list.push({ src: res['photo' + (i + 1) + '_url'], fileType: res['photo' + (i + 1) + '_url'].split('.')[res['photo' + (i + 1) + '_url'].split('.').length - 1] })
          }
        }
        res.brand_name = res.customer_name
        this.setData({
          complaint: res,
          imgList: list
        })
      }
      wx.hideLoading()
    })
  },
  save() {
    if (!this.data.complaint.complaint_content) {
      wx.showToast({
        title: '请输入投诉建议内容',
        icon: 'none'
      })
      return
    }
    if (this.data.complaint.complaint_content.length <= 10) {
      wx.showToast({
        title: '请输入10个字以上的投诉建议内容',
        icon: 'none'
      })
      return
    }
    const params = JSON.parse(JSON.stringify(this.data.complaint))
    for (let i = 0; i < 5; i++) {
      if (this.data.imgList[i]) {
        params['photo' + (i + 1) + '_url'] = this.data.imgList[i].src
      }
    }
    request('/complaint/save', 'post', params).then(res => {
      if (res && res.status === 'SUCCESS') {
        wx.showToast({
          title: '提交成功',
          icon: 'success',
          duration: 2000
        })
        setTimeout(() => {
          const pages = getCurrentPages()
          const prevPage = pages[pages.length - 2]
          prevPage.getComplaintList()
          wx.navigateBack()
        }, 2000)
      } else {
        wx.showToast({
          title: res.message,
          icon: 'none'
        })
      }
    })
  },
  setValue(e) {
    const value = e.detail.value
    const prop = e.currentTarget.dataset.prop
    this.setData({
      ['complaint.' + prop]: value
    })
    if (prop === 'brand_name' && value) {
      this.queryCustomer()
    } else {
      this.setData({ customerList: [] })
    }
  },
  queryCustomer() {
    if (this.data.complaint.brand_name) {
      request('/customer/queryCustomer', 'post', { queryKey: this.data.complaint.brand_name }).then(res => {
        if (res) {
          this.setData({ customerList: res })
        }
      })
    }
  },
  chooseCustomer(e) {
    this.setData({
      'complaint.pr_customer_id': e.currentTarget.dataset.id,
      'complaint.brand_name': e.currentTarget.dataset.value,
      customerList: []
    })
  },
  closeSelection() {
    this.setData({
      'complaint.brand_name': this.data.complaint.pr_customer_id ? this.data.complaint.brand_name : '',
      customerList: []
    })
  },
  // 上传文件
  uploadFile() {
    let that = this
    if (that.data.imgList.length > 5) {
      wx.showToast({
        title: '最多支持上传5个文件',
        icon: 'none'
      })
      return false
    }
    wx.chooseMedia({
      count: 5 - that.data.imgList.length,
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
                  imgList: [...that.data.imgList, Object.assign({}, { src: imgurl, fileType: imgurl.split('.')[imgurl.split('.').length - 1] })]
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
    this.data.imgList.splice(e.currentTarget.dataset.index, 1)
    this.setData({
      imgList: this.data.imgList
    })
  },
  // 点击图片预览大图
  showBigImage(e) {
    const url = e.currentTarget.dataset.url
    if (url) {
      this.setData({ 
        bigImageUrl: url,
        bigImageToastVisible: true 
      })
    }
  },
  // 关闭大图预览弹窗
  closeBigImageToast() {
    this.setData({
      bigImageUrl: '',
      bigImageToastVisible: false
    })
  }
})