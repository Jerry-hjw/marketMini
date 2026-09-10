// pages/user/index.js
import { request, IMG_BASE_URL, API_BASE_URL } from '../../wxapi/index'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    IMG_BASE_URL: IMG_BASE_URL,
    mobileVisible: true,
    canGetUserProfile: false,
    nickName: null,
    avatarUrl: null,
    pr_member_id: null,
    pr_customer_id: '',
    business_user_type: null,
    customerList: [],
    customerListTemp: [],
    visible: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (wx.getUserProfile) {
      this.setData({
        canGetUserProfile: true
      })
    }
    this.openPopup()
  },
  queryCustomer() {
    wx.showLoading({
      title: '查询中...',
    })
    request('/customer/queryCustomerByMember', 'post', { pr_member_id: this.data.pr_member_id }).then(res => {
      if (res) {
        this.setData({
          customerList: res.map(item => { return { pr_customer_id: item.pr_customer_id, customer_name: item.pr_customer_id === this.data.pr_customer_id ? item.customer_name + '(当前租户)' : item.customer_name } }),
          customerListTemp: res
        })
      }
      wx.hideLoading()
    })
  },
  chooseCustomer(e) {
    const id = this.data.customerList[e.detail.value].pr_customer_id
    if (id === this.data.pr_customer_id) {
      wx.showToast({
        title: '您当前已是该租户,无需切换',
        icon: 'none'
      })
      return
    }
    wx.showLoading({
      title: '切换中...',
    })
    request('/customer/memberChangeCustomer', 'post', { pr_customer_id: id }).then(res => {
      wx.hideLoading()
      if (res) {
        this.setData({
          pr_customer_id: id,
          customerList: this.data.customerListTemp.map(item => { return { pr_customer_id: item.pr_customer_id, customer_name: item.pr_customer_id === id ? item.customer_name + '(当前租户)' : item.customer_name } })
        })
        wx.showToast({
          title: '切换成功',
          icon: 'success'
        })
        this.openPopup()
      } else {
        wx.showToast({
          title: '切换失败',
          icon: 'error'
        })
      }
    })
  },
  toPage(e) {
    if (e.currentTarget.dataset.url) {
      wx.navigateTo({
        url: e.currentTarget.dataset.url,
      })
    }
  },
  openVisible() {
    if (this.data.nickName) return
    this.setData({ visible: true })
  },
  // 获取数据库用户信息， 判断是否打开授权用户信息提示框、是否显示切换按钮
  openPopup() {
    wx.showLoading({
      title: '查询中...',
    })
    request('/member/get', 'post', '', true).then(res => {
      wx.hideLoading()
      if (res) {
        this.setData({
          pr_member_id: res.pr_member_id,
          pr_customer_id: res.business_user_id,
          business_user_type: res.business_user_type
        })
        wx.setStorageSync('pr_customer_id', res.business_user_id)
        this.queryCustomer()
        if (res.mobile) {
          this.setData({
            mobileVisible: false
          })
        }
        this.setData({
          nickName: res.nickName,
          avatarUrl: res.avatarUrl,
          mobile: res.mobile,
          mobileTemp: res.mobile ? res.mobile.substring(0, 3) + '****' + res.mobile.substring(res.mobile.length - 4, res.mobile.length) : '',
          member_type: res.member_type
        })
      }
    })
  },
  closePopup() {
    this.setData({ visible: false })
  },
  // 获取用户信息(旧版本)
  getUserInfo(e) {
    const userInfo = e.detail.userInfo
    // console.log(userInfo)
    request('/wx/updateUserInfo', 'post', userInfo).then(res => {
      // console.log('获取用户信息', res)
      this.setData({
        visible: false,
        // logoutVisible: true,
        avatarUrl: res.avatarUrl,
        nickName: res.nickName,
        member_type: res.member_type,
        pr_customer_id: res.business_user_id
      })
      wx.setStorageSync('user', res)
      wx.setStorageSync('pr_customer_id', res.business_user_id)
    })
  },
  // 获取用户信息(新版本)
  getUserProfile() {
    const that = this
    wx.getUserProfile({
      desc: '用于完善您的会员资料',
      success(res) {
        // console.log(res.userInfo)
        const userInfo = res.userInfo
        userInfo.pr_member_id = that.data.pr_member_id
        request('/wx/updateUserInfo', 'post', userInfo).then(res => {
        //   console.log('获取用户信息', res)
          if (res) {
            that.setData({
              visible: false,
              avatarUrl: res.avatarUrl,
              nickName: res.nickName,
              member_type: res.member_type,
              pr_member_id: res.pr_member_id,
              pr_customer_id: res.business_user_id
            })
            wx.setStorage({
              key: 'user', 
              data: res
            })
            wx.setStorageSync('pr_customer_id', res.business_user_id)
          } else {
            wx.showToast({
              title: '获取用户信息失败',
              icon: 'none'
            })
          }
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
    wx.checkSession({
      success: (res) => {},
      fail: (res) => {
        wx.login({
          success: res => {
            const params = {
              code: res.code
            }
            wx.request({
              url: API_BASE_URL +  '/wx/login',
              method: 'post',
              data: params,
              header: {'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'},
              success: function success(res2) {
                wx.setStorageSync('token', res2.data)
              }
            })
          }
        })
      }
    })
    var params = {
      iv: e.detail.iv,
      encryptedData: e.detail.encryptedData,
      pr_member_id: this.data.pr_member_id
    }
    request('/wx/updateMobile', 'post', params).then(res => {
      wx.hideLoading()
    //   console.log('授权手机号', res, params);
      if (res.mobile) {
        this.setData({
          member_type: res.member_type,
          mobile: res.mobile,
          mobileTemp: res.mobile.substring(0, 3) + '****' + res.mobile.substring(res.mobile.length - 4, res.mobile.length),
          mobileVisible: false,
          pr_customer_id: res.business_user_id
        })  
        wx.setStorage({
          key: 'user',
          data: res
        })
        wx.setStorageSync('pr_customer_id', res.business_user_id)
        wx.showToast({
          title: '手机号授权成功',
          icon: 'success'
        })
        setTimeout(() => {
          this.openPopup()
        }, 1500)
      } else {
        wx.showToast({
          title: '手机号授权失败'
        })
        wx.login({
          success: res => {
            const params = {
              code: res.code
            }
            wx.request({
              url: API_BASE_URL +  '/wx/login',
              method: 'post',
              data: params,
              header: {'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'},
              success: function success(res2) {
                wx.setStorageSync('token', res2.data)
              }
            })
          }
        })
      }
    })
  }
})