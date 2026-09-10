// pages/brandGuide/index.js
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
    pr_biz_type_id: '',
    pr_building_id: '',
    building_name: '',
    biz_type_name: '',
    dataList: [],
    bizTypeList: [],
    buildingList: [],
    filterIndex: 0,
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
      brand_name: this.data.keyword,
      iDisplayLength: 8,
      iDisplayStart: flag === true ? this.data.dataList.length : 0
    }
    request('/brandGuide/queryValidList', 'post', params).then(res => {
      if (res) {
        res.forEach(item => {
          item.working_time = item.working_time.split(',').join(' 至 ')
        })
        this.setData({ dataList: flag === true ? this.data.dataList.concat(res) : res })
      }
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
  changeFilter(e) {
    const index = e.currentTarget.dataset.index
    this.setData({ filterIndex: index === this.data.filterIndex ? 0 : index })
    this.setData({
      filterList: !this.data.filterIndex ? [] : this.data.filterIndex === 1 ? this.data.buildingList : this.data.bizTypeList
    })
  },
  chooseFilter(e) {
    const item = e.currentTarget.dataset
    switch (this.data.filterIndex) {
      case 1:
        this.setData({
          pr_building_id: item.id === this.data.pr_building_id ? '' : item.id,
          building_name: item.id === this.data.pr_building_id ? '' :  item.name
        })
        break
      case 2:
        this.setData({
          pr_biz_type_id: item.id === this.data.pr_biz_type_id ? '' : item.id,
          biz_type_name: item.id === this.data.pr_biz_type_id ? '' : item.name
        })
        break
      default:
    }
    this.closeFilter()
    this.getBrandList()
  },
  toDetail(e) {
    if (e.currentTarget.dataset.id) {
      wx.navigateTo({
        url: '/pages/brandDetail/index?id=' + e.currentTarget.dataset.id,
      })
    }
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