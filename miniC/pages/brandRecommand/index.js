// pages/brandRecommand/index.js
import { request, IMG_BASE_URL } from '../../wxapi/index'
import { defineNavTop } from '../../utils/util'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    top: 0,
    IMG_BASE_URL: IMG_BASE_URL,
    keyword: '',
    brand_category: '',
    pr_biz_type_id: '',
    pr_building_id: '',
    dataList: [],
    bizTypeList: [],
    buildingList: [],
    typeArray: [{
      index: 1,
      name: '新铺推荐'
    },{
      index: 2,
      name: '热门店铺'
    },{
      index: 3,
      name: '全部店铺'
    },{
      index: 4,
      name: '筛选'
    }],
    typeIndex: 3,
    filter: [{
      index: 1,
      name: '楼层',
      img1: '/img/typeImg1Active.png',
      img2: '/img/typeImg1.png'
    },{
      index: 2,
      name: '分类',
      img1: '/img/typeImg2Active.png',
      img2: '/img/typeImg2.png'
    },{
      index: 3,
      name: '排序',
      img1: '/img/typeImg3Active.png',
      img2: '/img/typeImg3.png'
    }],
    filterIndex: 1,
    filterList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({ top: defineNavTop() })
    this.getBrandList()
    this.getBizType()
    this.getBuilding()
  },
  getBrandList(flag) {
    const params = {
      pr_biz_type_id: this.data.pr_biz_type_id,
      pr_building_id: this.data.pr_building_id,
      brand_category: this.data.brand_category,
      brand_name: this.data.keyword,
      iDisplayLength: 6,
      iDisplayStart: flag === true ? this.data.dataList.length : 0
    }
    wx.showLoading({
      title: '查询中...',
    })
    request('/brandGuide/queryValidList', 'post', params).then(res => {
      if (res) {
        res.forEach(item => {
          if (item.working_time) item.working_time = item.working_time.split(',').join(' 至 ')
        })
        this.setData({ dataList: flag === true ? this.data.dataList.concat(res) : res })
      }
      wx.hideLoading()
    })
  },
  getBizType(e) {
    request('/bizType/list', 'post', { father_id: e ? e.currentTarget.dataset.id : '0' }).then(res => {
      if (res) this.setData({ bizTypeList: res.map(item => { return { id: item.pr_biz_type_id, name: item.biz_type_name } }) })
    })
  },
  getBuilding() {
    request('/building/listBrandBuilding', 'post', {}).then(res => {
      if (res)  this.setData({ buildingList: res.map(item => { return { id: item.pr_building_id, name: item.building_name } }) })
    })
  },
  toDetail(e) {
    if (e.currentTarget.dataset.id) {
      wx.navigateTo({
        url: '/pages/brandDetail/index?id=' + e.currentTarget.dataset.id,
      })
    }
  },
  changeType(e) {
    const index = e.currentTarget.dataset.index
    if (index === 4) {
      this.setData({
        typeIndex: 4,
        filterList: index === 4 ? [{ id: '', name: '默认排序' }] : [],
        filterIndex: 3,
        pr_building_id: '',
        pr_biz_type_id: ''
      })
      return
    }
    const category = ['', 'new', 'hot', '', '']
    this.setData({
      typeIndex: index,
      brand_category: category[index],
      filterList: []
    })
    this.getBrandList()
  },
  changeFilter(e) {
    const index = e.currentTarget.dataset.index
    this.setData({ filterIndex: index === this.data.filterIndex ? 0 : index })
    this.setData({
      filterList: this.data.filterIndex === 3 ? [{ id: '', name: '默认排序' }] : this.data.filterIndex === 1 ? this.data.buildingList : this.data.bizTypeList
    })
  },
  chooseFilter(e) {
    const item = e.currentTarget.dataset
    // this.data.filter[this.data.filterIndex - 1].name = item.name
    switch (this.data.filterIndex) {
      case 1:
        this.setData({
          pr_building_id: item.id === this.data.pr_building_id ? '' : item.id,
          filter: this.data.filter
        })
        break
      case 2:
        this.setData({
          pr_biz_type_id: item.id === this.data.pr_biz_type_id ? '' : item.id,
          filter: this.data.filter
        })
        break
      case 3:
        this.setData({
          pr_biz_type_id: '',
          pr_building_id: '',
          brand_category: '',
          filter: this.data.filter
        })
        break
      default:
    }
    this.closeFilter()
    this.getBrandList()
  },
  closeFilter() {
    this.setData({
      filterList: [],
      filterIndex: 0
    })
  },
  setValue(e) {
    this.setData({ keyword: e.detail.value })
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    this.getBrandList(true)
  }
})