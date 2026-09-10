// pages/login/index.js
import { request , API_BASE_URL} from '../../wxapi/index'
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getMemberInfo()
  },
    // 获取数据库用户信息 
  getMemberInfo() {
      wx.showLoading({
        title: '查询中...',
      })
      var pr_member_id =  wx.getStorageSync('pr_member_id')
     
      let _this = this   
      if(!pr_member_id){
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
                let pr_member_id = res2.data
                wx.setStorageSync('pr_member_id', pr_member_id)
                _this.getMemberInfoInner(pr_member_id)
              }
            })
          }
        })
      }else{
        this.getMemberInfoInner(pr_member_id)
      }
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
      pr_member_id:  wx.getStorageSync('pr_member_id')
    }    
    wx.request({
      url: API_BASE_URL +  '/wx/updateCustomerMobile',
      method: 'post',
      data: params,
      header: {'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'},
      success: function success(res) { 
        wx.hideLoading() 
        if (res && res.data && res.data>0 ) { 
          wx.showToast({
            title: '手机号授权成功',
            icon: 'success'
          })    
          _this.getMemberInfoInner(wx.getStorageSync('pr_member_id'))
        } else {
          wx.showToast({
            title: '手机号授权失败,请联系管理员'
          })
          _this.wxlogin()
        }
      }
    })
  },
  getMemberInfoInner(pr_member_id){     
    var params = {pr_member_id : pr_member_id}
     wx.request({
      url: API_BASE_URL +  '/member/get',
      method: 'post',
      data: params,
      header: {'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'},
      success: function success(res) {
        wx.hideLoading()  
        if (res && res.data && res.data.baseBean) {
          wx.setStorageSync('pr_customer_id', res.data.baseBean.business_user_id)
          wx.setStorageSync('memberObj', res.data.baseBean)
          if (res.data.baseBean.mobile) {
            wx.setStorageSync('token', res.data.token)
            wx.reLaunch({
              url: '/pages/rental/index',
            })
          }
        }
      }
    })
  },  
  wxlogin(){    
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
            wx.setStorageSync('pr_member_id', res2.data)
          }
        })
      }
    })
  },
  setValue(e) {
    this.setData({ [e.currentTarget.dataset.prop]: e.detail.value })
  },
  login(e) {
    const data = e.detail.value
    if (!data || !data.account) {
      wx.showToast({
        title: '请输入账号',
        icon: 'none'
      })
      return
    }
    if (!data || !data.password) {
      wx.showToast({
        title: '请输入密码',
        icon: 'none'
      })
      return
    }
    const params = {
      account: data.account,
      password: data.password
    }
    wx.showLoading({
      title: '登录中...',
      mask: false
    })
    wx.request({
      url: API_BASE_URL + '/mcmslogin',
      method: 'post',
      data: params,
      header: {'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'},
      success: function success(res) {
        wx.hideLoading()  
        if (res && res.data && res.data.baseBean) {
          wx.showToast({
            title: '登录成功',
            icon: 'success'
          })
          setTimeout(() => {
            wx.reLaunch({
              url: '/pages/rental/index',
            })
          }, 1500)
        } else {
          wx.showToast({
            title: res.message || '登录失败',
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
  }
})