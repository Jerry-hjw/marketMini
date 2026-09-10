// pages/brandGuide/index.js
import { request, IMG_BASE_URL, OA_URL } from '../../wxapi/index'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    brandGuide: {},
    IMG_BASE_URL: IMG_BASE_URL,
    fileList: [],
    pr_customer_id: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const pr_customer_id = wx.getStorageSync('pr_customer_id')
    this.setData({ pr_customer_id: pr_customer_id })
    this.getBrandGuide()
  },
  getBrandGuide() { 
    request('/brandGuide/get', 'post',  { pr_customer_id: this.data.pr_customer_id }).then(res => {
      if (res) {
        const fileList = []
        for (let i = 1; i < 6; i++) {
          if (res['swiper_img_' + i]) fileList.push({ url: res['swiper_img_' + i] })
        }
        if (res.working_time) {
          res.startTime = res.working_time.split(',')[0]
          res.endTime = res.working_time.split(',')[1]
        }
        this.setData({
          brandGuide: res,
          fileList: fileList
        })
      }
    })
  },
  setValue(e) {
    this.setData({ ['brandGuide.' + e.currentTarget.dataset.prop]: e.detail.value })
  },
  upload(e) {
    const that = this
    const prop = e.currentTarget.dataset.prop
    const type = e.currentTarget.dataset.type
    wx.chooseMedia({
      count: prop.indexOf('ist') !== -1 ? 5 - that.data[prop].length : 1,
      mediaType: [type],
      success(response) {
        wx.showLoading({
		      title: '正在上传...',
		      mask: false
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
                if (prop.indexOf('ist') !== -1) {
                  const list = JSON.parse(JSON.stringify(that.data[prop]))
                  list.push({ url: imgurl, name: imgurl.split('/')[imgurl.split('/').length - 1], type: imgurl.split('.')[r.split('.').length - 1] })
                  that.setData({ [prop]: list })
                } else {
                  that.setData({ ['brandGuide.' + prop]: imgurl })
                }
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
    if (prop.indexOf('ist') !== -1) {
      const list = JSON.parse(JSON.stringify(this.data[prop]))
      this.setData({ [prop]: list.filter(item => { return item.url !== url }) })
    } else {
      this.setData({ ['brandGuide.' + prop]: '' })
    }
  },
  save() {
    const params = JSON.parse(JSON.stringify(this.data.brandGuide))
    params.pr_customer_id = this.data.pr_customer_id
    for (let i = 0; i < this.data.fileList.length; i++) {
      if (this.data.fileList[i].url) params['swiper_img_' + (i + 1)] = this.data.fileList[i].url
    }
    if (params.startTime && params.endTime) params.working_time = params.startTime + ',' + params.endTime
    params.brand_guide_status = 'approving'
    wx.showLoading({
      title: '保存中...',
    })
    request('/brandGuide/save', 'post', params).then(res => {
      wx.hideLoading()
      if (res && res.status === 'SUCCESS') {
        this.setData({ brandGuide: res.baseBean })
        wx.showToast({
          title: '保存成功!',
          icon: 'success'
        })
        // setTimeout(() => {
        //   wx.navigateBack()
        // }, 2000)
      }
    })
  },
  submit() {
    const that = this
    wx.showModal({
      title: '提示',
      content: '确定要提交审核吗，审核通过后会更新客户端展示内容',
      complete: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '提交中...',
          })
          request('/brandGuide/submit', 'post', { pr_brand_guide_id: that.data.brandGuide.pr_brand_guide_id }).then(res => {
            wx.hideLoading()
            if (res && res.status === 'SUCCESS') {
              wx.showToast({
                title: '提交成功!',
                icon: 'success'
              })
              setTimeout(() => {
                wx.navigateBack()
              }, 2000)
            }
          })
        }
      }
    })
  }
})