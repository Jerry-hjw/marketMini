// pages/doc/index.js
import { request } from '../../wxapi/index'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataList: [],
    pr_doc_type_id: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (options.id) {
      this.setData({ pr_doc_type_id: options.id })
    }
    if (options.name) {
      wx.setNavigationBarTitle({
        title: options.name
      })
    }
    this.getDoc()
  },
  getDoc(flag) {
    request('/doc/queryList', 'post', { pr_doc_type_id: this.data.pr_doc_type_id, iDisplayStart: flag ? this.data.dataList.length : 0, iDisplayLength: 8 }).then(res => {
      if (res) {
        for (let i = 1; i < 6; i++) {
          res.forEach(item => {
            if (item['attachment_url_' + i]) {
              const array = item['attachment_url_' + i].split('/')
              const name = array[array.length - 1].split('_')
              item['attachment_name_' + i] = name[name.length - 1]
            }
          })
        }
        this.setData({
          dataList: flag ? this.data.dataList.concat(res) : res
        })
      }
    })
  },
  download(e) {
    wx.showModal({
      title: '温馨提示',
      content: '您确定要下载该文件吗',
      complete: (response) => {
        if (response.confirm) {
          wx.downloadFile({
            url: e.currentTarget.dataset.url,
            success(res) {
              if (res.tempFilePath) {
                const type = res.tempFilePath.split('.')[res.tempFilePath.split('.').length - 1]
                wx.openDocument({
                  filePath: res.tempFilePath,
                  fileType: type
                })
              }
            }
          })
        }
      }
    })
    
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    this.getDoc(true)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})