// index.js
// 获取应用实例
const app = getApp()
import { request, IMG_BASE_URL } from '../../wxapi/index'
Page({
  data: {
    bannerList: [
      {
        img: '/img/banner.jpg'
      }
    ],
    functionList1: [
      {
        name: '合同管理',
        img: '/img/function_1.png',
        url: '/pages/contract/index'
      },
      // {
      //   name: '租金缴费',
      //   img: '/img/function_2.png'
      // },
      {
        name: '电费充值',
        img: '/img/function_3.png',
        url: '/pages/recharge/index'
      },
      {
        name: '非营业作业',
        img: '/img/function_4.png',
        url: '/pages/apply/index?type=merchantOvertime'
      },
      {
        name: '物品放行',
        img: '/img/function_5.png',
        url: '/pages/apply/index?type=merchantMaterialInout'
      },
      // {
      //   name: '积分保障',
      //   img: '/img/function_6.png'
      // },
      {
        name: '发票查看',
        img: '/img/function_7.png',
        url: '/pages/invoiceList/index'
      },
      {
        name: '维修申报',
        img: '/img/function_8.png',
        url: '/pages/apply/index?type=merchantMaintain'
      }
    ],
    functionList2: [
      {
        name: '危机公关',
        img: '/img/function_9.png'
      },
      {
        name: '商户手册',
        img: '/img/function_10.png'
      },
      {
        name: '装修手册',
        img: '/img/function_11.png'
      },
      {
        name: '系统培训',
        img: '/img/function_12.png'
      }
    ],
    IMG_BASE_URL: IMG_BASE_URL,
    member: null
  },
  onLoad() { 
    this.getSwiper()
    this.getDocType() 
  },
  getSwiper() {
    request('/swiper/queryList', 'post', { banner_type: '02' }).then(res => {
      if (res) {
        this.setData({ bannerList: res })
      }
    })
  },
  getDocType() {
    request('/docType/queryList', 'post', { iDisplayStart: 0 }).then(res => {
      if (res) {
        this.setData({ functionList2: res.map(item => {
          return { id: item.pr_doc_type_id, name: item.doc_type_name, img: IMG_BASE_URL + item.icon_url, url: '/pages/doc/index?id=' + item.pr_doc_type_id + '&name=' + item.doc_type_name }
        }) })
      }
    })
  },
  swiperClick(e) {
    const url = e.currentTarget.dataset.url
    if (url && url.indexOf('pages') !== -1) {
      wx.navigateTo({
        url: url
      })
      return
    }
    if (url) {
      // 外链 
      wx.navigateTo({
        url: '/pages/redirectOut/index?outUrl=' + url,
      }) 
    } else {
      if (e.currentTarget.dataset.content) {
        wx.navigateTo({
          url: '/pages/swiperDetail/index?id=' + e.currentTarget.dataset.id,
        })
      }
    }
  },
  toPage(e) {
    const array = ['/pages/contract/index', '/pages/bill/index']
    
    let memberObj =   wx.getStorageSync('memberObj')
    if (array.includes(e.currentTarget.dataset.url) && memberObj && memberObj.business_user_type !== 'boss') {
      wx.showModal({
        title: '温馨提示',
        content: '员工暂无此权限',
        confirmText: '我知道了',
        confirmColor: '#8ec31f'
      })
      return
    }
    this.subscribeMessage()
    if (!e.currentTarget.dataset.url) {
      wx.showToast({
        title: '暂无内容，敬请期待',
        icon: 'none'
      })
      return
    }
    wx.navigateTo({
      url: e.currentTarget.dataset.url
    })
  },
  subscribeMessage() {
    let memberObj =   wx.getStorageSync('memberObj')
    if (memberObj && memberObj.subscribe_settlement_doc === 'Y') return
    wx.requestSubscribeMessage({
      tmplIds: ['4HV1oqqehqh3WwfJx6ZeXdUIDLaJGcwZeS27dmwXAUM'],
      success(res) {
        if (res['4HV1oqqehqh3WwfJx6ZeXdUIDLaJGcwZeS27dmwXAUM'] === 'accept') {
          // 在此处写订阅消息成功后的调用函数
          request('/member/update', 'post', { pr_member_id: memberObj.pr_member_id, subscribe_settlement_doc: 'Y' }).then(res => {
            if (res && res.status === 'SUCCESS') {
              memberObj.subscribe_settlement_doc ='Y' 
              wx.setStorageSync('memberObj',memberObj)
              wx.showToast({
                title: '订阅成功!',
                icon: 'success'
              })
            }
          })
        }
      },
      fail(res) {
        console.log(res)
      }
    })
  },
  onShareAppMessage() {
    wx.showShareMenu({
        withShareTicket: true,
        menu: ['shareAppMessage','shareTimeline']
    })
  }
})
