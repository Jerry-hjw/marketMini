// pages/userDetail/index.js
import { request } from '../../wxapi/index'
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
    this.getMember()
  },
  getMember() {
    var params = {pr_member_id : wx.getStorageSync('pr_member_id')}
    request('/member/get', 'post', params).then(res => {
      if (res && res.baseBean) {
        this.setData({
          member: res.baseBean,
          avatarUrl: res.baseBean.avatarUrl,
          full_name: res.baseBean.full_name,
          gender: res.baseBean.gender && parseInt(res.baseBean.gender) > 0 ? res.baseBean.gender : '1',
          birthday: res.baseBean.birthday
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
    if (!this.data.birthday) {
      wx.showToast({
        title: '请选择您的生日',
        icon: 'none'
      })
      return
    }
    const params = {
      pr_member_id: this.data.member.pr_member_id,
      avatarUrl: this.data.avatarUrl || '',
      full_name: this.data.full_name,
      gender: this.data.gender,
      birthday: this.data.birthday
    }
    let requestUrl = '/member/update'
    request(requestUrl, 'post', params).then(res => {
      if (res && res.status === 'SUCCESS') {
        wx.showToast({
          title: '保存成功!',
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
  // 上传用户头像回调
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail 
    this.setData({
      avatarUrl: avatarUrl,
    })
  },
})