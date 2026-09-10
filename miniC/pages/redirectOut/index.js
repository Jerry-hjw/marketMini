// pages/redirectOut/index.js
Page({

  /**
   * Page initial data
   */
  data: {
    outUrl: null
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    if ('outUrl' in options && options.outUrl) {
      this.setData({
        outUrl: options.outUrl
      })
    }
  }
})