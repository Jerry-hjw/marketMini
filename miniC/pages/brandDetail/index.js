// pages/brandDetail/index.js
import { defineNavTop } from '../../utils/util'
import { request, IMG_BASE_URL } from '../../wxapi/index'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    top: 0,
    IMG_BASE_URL: IMG_BASE_URL,
    brand: {},
    bannerList: [],
    currentNum: 1,
    activeIndex: 2,
    infoVisible: true,
    startX: 0,
    startY: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({ top: defineNavTop() })
    if (options.id) this.getBrand(options.id)
  },
  getBrand(id) {
    request('/brandGuide/detail', 'post', { pr_brand_guide_id: id }).then(res => {
      if (res) {
        res.working_time = res.working_time.split(',').join(' 至 ')
        if (res.brand_guide_info) res.brand_guide_info = this.richImgAuto(res.brand_guide_info)
        const imgList = []
        for (let i = 1; i < 6; i++) {
          if (res['swiper_img_' + i]) imgList.push(IMG_BASE_URL + res['swiper_img_' + i])
        }
        this.setData({
          brand: res,
          bannerList: imgList
        })
      }
    })
  },
  previewImage(e) {
    const that = this
    wx.previewImage({
      urls: that.data.bannerList,
      current: e.currentTarget.dataset.url
    })
  },
  setActive(e) {
    this.setData({ activeIndex: e.currentTarget.dataset.index })
  },
  setCurrent(e) {
    this.setData({ currentNum: e.detail.current + 1 })
  },
  changeProductInfoVisible() {
    this.setData({ infoVisible: !this.data.infoVisible })
  },
  touchStart(e) {
    this.setData({
      startX: e.changedTouches[0].pageX,
      startY: e.changedTouches[0].pageY
    })
  },
  touchEnd(e) {
    const endX = e.changedTouches[0].pageX
    const endY = e.changedTouches[0].pageY
    if (endY - this.data.startY > 100 || endY - this.data.startY < -100 || this.data.currentNum !== 1) return
    // 右滑
    if (endX - this.data.startX > 80 && this.data.activeIndex === 2) {
      this.setData({ activeIndex: 1 })
    }
    // 左滑
    if (endX - this.data.startX < -80 && this.data.activeIndex === 1) {
      this.setData({ activeIndex: 2 })
    }
  },
  // 富文本 图片样式替换
  richImgAuto(html) {
    if (html.indexOf('<img')) {
      return html.replace(/<img/gi,'<img style="max-width:100%;height:auto;display:block;"')
    }
  }
})