// components/menu/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    menuIndex: {
      type: Number,
      value: 1
    },
    memberType: {
      type: String,
      value: 'wechat'
    },
    fullName: {
      type: String,
      value: ''
    },
    prMemberId: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    menuList: [
      {
        name: '首页',
        img: '/img/index.png',
        img2: '/img/index1.png',
        img3: '/img/index3.png',
        img4: '/img/index4.png',
        index: 1,
        url: '/pages/index/index'
      },
      {
        name: '玖洲好玩',
        img: '/img/menuTotal.png',
        img2: '/img/menuTotal.png',
        img3: '/img/menuTotal3.png',
        img4: '/img/menuTotal4.png',
        index: 2,
        url: ''
      },
      {
        name: '我的',
        img: '/img/mine.png',
        img2: '/img/mine1.png',
        img3: '/img/mine3.png',
        img4: '/img/mine4.png',
        index: 3,
        url: '/pages/user/index'
      }
    ],
    menuIndex: 1,
    isOpen: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    toPage(e) {
      const data = e.currentTarget.dataset
      if (data.index === this.data.menuIndex && data.index !== 2) return
      this.setData({ menuIndex: e.currentTarget.dataset.index })
      if (data.url) {
        const user = wx.getStorageSync('user')
        if (data.url === '/pages/user/index' && this.properties.memberType === 'wechat') {
          wx.navigateTo({
            url: '/pages/authMobile/index?pr_member_id=' + this.properties.prMemberId,
          })
          return
        } else if (data.url === '/pages/user/index' && user.full_name === '') {
          wx.navigateTo({
            url: '/pages/userDetail/index',
          })
          return
        }
        wx.reLaunch({
          url: data.url
        })
      } else {
        this.setData({ isOpen: !this.data.isOpen })
      }
    },
    toDetail(e) {
      const data = e.currentTarget.dataset
      if (data.url) {
        wx.navigateTo({
          url: data.url
        })
      }
    }
  }
})
