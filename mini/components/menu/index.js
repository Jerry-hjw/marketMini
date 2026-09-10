// components/menu/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    menuIndex: {
      type: Number,
      value: 1
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    menuList: [
      {
        name: '租值管理',
        img: '/img/rents.jpg',
        index: 1,
        url: '/pages/rental/index'
      },
      {
        name: '营销管理',
        img: '/img/marketing.jpg',
        index: 2,
        url: '/pages/marketing/index'
      },
      {
        name: 'OA',
        img: '/img/rents.jpg',
        index: 3,
        url: '/pages/OA/index'
      },
      {
        name: '大数据',
        img: '/img/rents.jpg',
        index: 4,
        url: ''
      },
      {
        name: '我的',
        img: '/img/mine.jpg',
        index: 5,
        url: '/pages/user/index'
      }
    ],
    menuIndex: 1
  },
  lifetimes: {
    attached() {
      const user = wx.getStorageSync('user')
      if (user.member_type === 'customer') {
        this.setData({ menuList: [
          {
            name: '租值管理',
            img: '/img/rents.jpg',
            index: 1,
            url: '/pages/rental/index'
          },
          {
            name: '营销管理',
            img: '/img/marketing.jpg',
            index: 2,
            url: '/pages/marketing/index'
          },
          {
            name: '我的',
            img: '/img/mine.jpg',
            index: 5,
            url: '/pages/user/index'
          }
        ], })
      } else if (user.member_type === 'employee') {
        this.setData({ menuList: [
          {
            name: 'OA',
            img: '/img/rents.jpg',
            index: 3,
            url: '/pages/OA/index'
          },
          {
            name: '我的',
            img: '/img/mine.jpg',
            index: 5,
            url: '/pages/user/index'
          }
        ], })
      } else {
        wx.reLaunch({
          url: '/pages/login/index',
        })
      }
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    toPage(e) {
      const data = e.currentTarget.dataset
      if (data.index === this.data.menuIndex) return
      if (data.url) {
        wx.reLaunch({
          url: data.url
        }) 
      } else {
        wx.showToast({
          title: '暂无内容，敬请期待',
          icon: 'none'
        })
      }
    }
  }
})
