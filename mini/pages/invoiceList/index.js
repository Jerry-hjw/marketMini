// pages/invoiceList/index.js
import { request } from '../../wxapi/index'
import util from '../../utils/util'

Page({

    /**
     * 页面的初始数据
     */
    data: {
        tabIndex: 1,    // tab页签下标
        dataList: [],   // 账单列表
        nowDate: '', // 当前日期
        pr_customer_id: '',
        bill: null,
        visible: false,
        invoiceType: {
          '1': '蓝票',
          '2': '红票'
        },
        invoiceLine: {
          'bs': '数电专票(电子)',
          'pc': '数电普票(电子)'
        },
        nuonuoStatus: {
          '0': '未开票',
          '1': '开票中',
          '2': '开票成功',
          '3': '开票失败'
        },
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
      const pr_customer_id = wx.getStorageSync('pr_customer_id')
      this.setData({
        nowDate: util.formatDateTime2(new Date()),
        pr_customer_id: pr_customer_id
      })
      const date = new Date()
      const year = date.getFullYear()
      let month1 = date.getMonth() + 1
      if (month1 < 10) month1 = '0' + month1
      if (month1 > 12) month1 = '01'
      let month2 = date.getMonth() + 2
      if (month2 < 10) month2 = '0' + month2
      if (month2 > 12) month2 = '01'
      this.setData({
        compareDate: year + '-' + month2 + '-' + '01'
      })
      this.getDataList(false)
    },
    getDataList(flag) {
      wx.showLoading({
        title: '查询中...',
      })
      const params = {
        pr_customer_id: this.data.pr_customer_id,
        iDisplayStart: flag ? this.data.dataList.length : 0,
        iDisplayLength: 5
      }
      request('/invoice/queryList', 'post', params).then(res => {
        if (res && res.length > 0) {
          this.setData({
            dataList: flag ? this.data.dataList.concat(res) : res,
            dataListTemp: flag ? this.data.dataListTemp.concat(res) : res
          })
        }
        wx.hideLoading()
      })
    },
    showMore() {
      this.setData({
        showMore: true,
        dataList: this.data.dataListTemp
      })
    },
    // 切换tab页
    changeTabIndex(e) {
      if (e.currentTarget.dataset.index === this.data.tabIndex) return
      this.setData({
        tabIndex: e.currentTarget.dataset.index,
        showMore: e.currentTarget.dataset.index === 2
      })
      this.getDataList(false)
    },
    setValue(e) {
      this.setData({
        amount: e.detail.value
      })
    },
    toPage(e) {
      if (!e.currentTarget.dataset.pr_invoice_id) {
        wx.showToast({
          title: '请刷新后再试',
          icon: 'none'
        })
        return
      }
      wx.navigateTo({
        url: '/pages/invoiceDetail/index?pr_invoice_id=' + e.currentTarget.dataset.pr_invoice_id,
      })
    },
    download(e) {
      if (e.currentTarget.dataset.url) {
        wx.downloadFile({
          url: e.currentTarget.dataset.url,
          success(res) {
            console.log(res.tempFilePath)
            wx.openDocument({
              filePath: res.tempFilePath,
              fileType: 'pdf',
              fail() {
                wx.showToast({
                  title: '打开失败',
                  icon: 'error'
                })
              }
            })
          }
        })
      }
    }
})