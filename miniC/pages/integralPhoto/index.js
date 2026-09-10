// pages/integralPhoto/index.js
import { request, API_BASE_URL, IMG_BASE_URL, OA_URL } from '../../wxapi/index'
import { defineNavTop } from '../../utils/util'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    top: 0,
    dataList: [],
    visible: false,
    IMG_BASE_URL: IMG_BASE_URL
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({ top: defineNavTop() })
    this.getIntegralPhotoList()
  },
  getIntegralPhotoList(flag) {
    request('/memberConsume/queryPage', 'post', { iDisplayLength: 7, iDisplayStart: flag ? this.data.dataList.length : 0 }).then(res => {
      if (res) {
        this.setData({ dataList: flag ? this.data.dataList.concat(res) : res })
      }
    })
  },
  toDetail(e) {
    const id = e.currentTarget.dataset.id || ''
    if (!id) {
      wx.chooseMedia({
        count: 1,
        success(res) {
          console.log(res)
          wx.uploadFile({
            filePath: res.tempFiles[0].tempFilePath,
            name: 'file',
            url: OA_URL + '/upload',
            success(response) {
              const uploadResponse = JSON.parse(response.data)
              var imgurl = uploadResponse.baseBean.value 
              if (uploadResponse.status === 'SUCCESS') {
                wx.navigateTo({
                  url: '/pages/integralPhotoDetail/index?receipt_img_url=' + imgurl,
                })
              } 
            }
          })
        }
      })
    } else {
      wx.navigateTo({
        url: '/pages/integralPhotoDetail/index?id=' + id,
      })
    }
  },
  showRules() {
    this.setData({ visible: true })
  },
  closePopup() {
    this.setData({ visible: false })
  }
})