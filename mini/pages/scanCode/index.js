// index.js
// 获取应用实例
import { request } from '../../wxapi/index.js'
// const plugin = requirePlugin('WechatSI')
// const innerAudioContext = wx.createInnerAudioContext({ useWebAudioImplement: true })

Page({
  data: {
    verifyHistory: [],
    toastVisible: false,
    code: '',
    audioSrc: '',
    couponType: {
      '01': '代金券',
      '02': '满减券',
      '03': '折扣券',
      '04': '体验券',
      '05': '停车券'
    }
  },
  onLoad() {
    this.scanCode()
    this.getCurrentVerifyHistory()
  },
  scanCode() {
    const that = this
    wx.scanCode({
      success(res) {
        if (res && res.result) {
          wx.showLoading({
            title: '处理中',
            mask: false
          })
          request('/couponDetail/verify', 'post', { coupon_detail_no: res.result }).then(response => {
            wx.hideLoading()
            if (response && response.status === 'SUCCESS') {
              // that.textToSpeech(response.message || '核销成功')
              wx.showToast({
                title: '核销成功',
                icon: 'success'
              })
              that.getCurrentVerifyHistory()
              setTimeout(() => {
                wx.navigateTo({
                  url: '/pages/result/index?status=' + response.status + '&message=核销成功&id=' + response.baseBean.tb_order_detail_id
                })
              }, 1500)
            } else {
              // that.textToSpeech(response.message || '核销失败')
              wx.showToast({
                title: response.message || '核销失败',
                icon: 'none',
                duration: 2000
              })
              setTimeout(() => {
                wx.navigateTo({
                  url: '/pages/result/index?status=' + response.status + '&message=' + (response.message || '出现了一点问题呢')
                })
              }, 1500)
            }
          })
        } else {
          // that.textToSpeech('无效二维码')
          wx.showToast({
            title: '无效二维码',
            icon: 'error'
          })
        }
      }
    })
  },
  toVerifyHistory() {
    wx.navigateTo({
      url: '/pages/verifyHistory/index'
    })
  },
  getCurrentVerifyHistory() {
    request('/couponDetail/queryByCustomer', 'post', { iDisplayLength: 1 }).then(res => {
        if (res && !res.status) this.setData({ verifyHistory: res })
    })
  },
  showPopup() {
      this.setData({ toastVisible: true })
  },
  closePopup() {
    this.setData({
        toastVisible: false,
        code: ''
    })
  },
  codeVerify(e) {
    const data = e.detail.value
    if (!data || !data.code) {
        wx.showToast({
          title: '请输入券码',
          icon: 'none'
        })
        return
    }
    if (data.code.length !== 12) {
        wx.showToast({
          title: '请输入长度为12位的券码',
          icon: 'none'
        })
        return
    }
    const params = {
      coupon_detail_no: data.code,
      isSign: 'N'
    }
    wx.showLoading({
        title: '处理中',
        mask: false
    })
    request('/couponDetail/verify', 'post', params).then(res => {
        wx.hideLoading()
        if (res && res.status === 'SUCCESS') {
            // this.textToSpeech(res.message || '核销成功')
            wx.showToast({
                title: '核销成功',
                icon: 'success'
            })
            this.getCurrentVerifyHistory()
            this.closePopup()
            setTimeout(() => {
                wx.navigateTo({
                    url: '/pages/result/index?status=' + res.status + '&message=核销成功&id=' + res.baseBean.tb_order_detail_id
                  })
            }, 1500)
        } else {
            // this.textToSpeech(res.message || '核销失败')
            wx.showToast({
                title: res.message || '核销失败',
                icon: 'none',
                duration: 2000
            })
            setTimeout(() => {
                wx.navigateTo({
                    url: '/pages/result/index?status=' + res.status + '&message=' + res.message || ('出现了一点问题呢')
                  })
            }, 1500)
        }
    })
  },
  textToSpeech(text) {
    const that = this
    plugin.textToSpeech({
        lang: "zh_CN",
        tts: true,
        content: text,
        success: function (res) {
          that.setData({
            audioSrc: res.filename
          })
          that.audioPlay()
        },
        fail: function (res) {
          console.log("fail tts", res)
        }
    })
  },
  audioPlay() {
    if (this.data.audioSrc === '') {
        console.log('暂无语音')
        return
      }
    //   console.log("正在播放")
    //   innerAudioContext.autoplay = true
      innerAudioContext.src = this.data.audioSrc //设置音频地址
      innerAudioContext.play() // 播放音频
  }
})
