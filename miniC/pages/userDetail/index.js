// pages/userDetail/index.js
import { request, API_BASE_URL } from '../../wxapi/index'
import { defineNavTop } from '../../utils/util'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    member: {},
    avatarUrl: '',
    full_name: '',
    gender: '1',
    mobile: '',
    mobileTemp: '',
    verifyCode: null,
    birthday: '',
    limitTimes: 60,
    countdown: null,
    showVerifyCodeInput: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({ top: defineNavTop() })
    this.getMember()
  },
  getMember() {
    request('/member/get', 'post', {}).then(res => {
      if (res) {
        this.setData({
          member: res,
          avatarUrl: res.avatarUrl,
          full_name: res.full_name,
          gender: res.gender && parseInt(res.gender) > 0 ? res.gender : '1',
          mobile: res.mobile,
          mobileTemp: res.mobile.substring(0, 3) + '****' + res.mobile.substring(res.mobile.length - 4, res.mobile.length),
          birthday: res.birthday
        })
      }
    })
  },
  save() {
    if (!this.data.full_name) {
      wx.showToast({
        title: '请输入您的姓名',
        icon: 'none'
      })
      return
    }
    if (!this.data.mobile) {
      wx.showToast({
        title: '请先授权手机号码',
        icon: 'none'
      })
      return
    }
    // if (!this.data.member.mobile && !this.data.verifyCode) {
    //   wx.showToast({
    //     title: '请输入验证码',
    //     icon: 'none'
    //   })
    //   return
    // }
    if (!this.data.birthday) {
      wx.showToast({
        title: '请选择您的生日',
        icon: 'none'
      })
      return
    }
    const params = {
      pr_member_id: this.data.member.pr_member_id,
      avatarUrl: this.data.avatarUrl,
      full_name: this.data.full_name,
      gender: this.data.gender,
      birthday: this.data.birthday
    }
    let requestUrl = '/member/update'
    if (!this.data.member.mobile) {
      params.mobile = this.data.mobile
      params.verifycode = this.data.verifyCode
      requestUrl = '/member/joinMember'
    }
    request(requestUrl, 'post', params).then(res => {
      if (res && res.status === 'SUCCESS') {
        wx.showToast({
          title: this.data.member.mobile ? '保存成功!' : '注册成功!',
          icon: 'success',
          duration: 2000
        })
        setTimeout(() => {
          wx.reLaunch({
            url: '/pages/user/index',
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
  setValue(e) {
    this.setData({
      [e.currentTarget.dataset.prop]: e.detail.value
    })
  },
  getCode() {
    if (!this.data.mobile) {
      wx.showToast({
        title: '请先输入手机号码',
        icon: 'none'
      })
      return
    }
    const reg = /^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/
    if (!reg.test(this.data.mobile)) {
      wx.showToast({
        title: '请输入正确的手机号码',
        icon: 'none'
      })
      return
    }
    if (this.data.countdown && this.data.limitTimes) {
      wx.showToast({
        title: '请' + this.data.limitTimes + '秒后再试',
        icon: 'none'
      })
      return
    }
    request('/member/sendVerifyCode', 'post', { mobile: this.data.mobile }).then(res => {
      if (res && res.status === 'SUCCESS') {
        this.setData({
          showVerifyCodeInput: true,
          verifyCode: res.verifyCode,
          countdown: setInterval(() => {
            this.setData({ limitTimes: this.data.limitTimes - 1 })
          }, 1000)
        })
        setTimeout(() => {
          clearInterval(this.data.countdown)
          this.setData({
            countdown: null,
            limitTimes: 60,
            verifyCode: null
          })
        }, 60000)
        wx.showToast({
          title: '验证码已通过短信发送，请注意查收',
          icon: 'none'
        })
      } else {
        wx.showToast({
          title: res.message,
          icon: 'none'
        })
      }
    })
  },
  // 授权手机号
  getPhoneNumber (e) {
    if (!e.detail.iv) {
      wx.showToast({
        title: '用户取消授权',
        icon: 'none'
      })
      return
    }
    wx.showLoading({
      title: '查询中...',
      mask: false
    })
    let _this = this
    wx.checkSession({
      success: (res) => {},
      fail: (res) => {
        _this.wxlogin()
      }
    })
    var params = {
      iv: e.detail.iv,
      encryptedData: e.detail.encryptedData,
      pr_member_id: this.data.member.pr_member_id
    }    
    wx.request({
      url: API_BASE_URL +  '/wx/updateMobile',
      method: 'post',
      data: params,
      header: {'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'},
      success: function success(res) { 
        wx.hideLoading() 
        if (res && res.mobile) { 
          wx.showToast({
            title: '手机号授权成功',
            icon: 'success'
          })
          _this.getMember(res.data)
        } else {
          wx.showToast({
            title: '手机号授权失败',
            icon: 'error'
          })
        }
      }
    })
  },
  // 上传用户头像回调
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail 
    this.setData({
      avatarUrl: avatarUrl,
    })
  },
})