// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },
  onShow() {
    const updateManager = wx.getUpdateManager()
    updateManager.onCheckForUpdate(res => {
      // 请求完新版本信息的回调
      if(res.hasUpdate){
        updateManager.onUpdateReady(() => {
          updateManager.applyUpdate()
        })
        updateManager.onUpdateFailed(() => {
          wx.showModal({
            title: '更新失败',
            content: '新版本下载失败，请删除当前小程序，重新搜索打开以使用最新版本的小程序'
          })
        })
      }
    })
  },
  globalData: {
    userInfo: null
  }
})
