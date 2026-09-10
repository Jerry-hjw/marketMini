// pages/swiperDetail/index.js
import { defineNavTop } from '../../utils/util'
import { request, IMG_BASE_URL } from '../../wxapi/index'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    top: 0,
    swiper: {},
    IMG_BASE_URL: IMG_BASE_URL
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({ top: defineNavTop() })
    if (options.id) this.getSwiper(options.id)
  },
  getSwiper(id) {
    request('/swiper/get', 'post', { pr_swiper_id: id }).then(res => {
      if (res) {
        if (res.swiper_content) res.swiper_content = this.richImgAuto(res.swiper_content)
        this.setData({ swiper: res })
        console.log(this.data.swiper, res.title)
      }
    })
  },
  // 富文本 图片样式替换
  richImgAuto(html) {
    if (html.indexOf('<img')) {
      return html.replace(/<img/gi,'<img style="max-width:100%;height:auto;display:block;"')
    }
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },
})