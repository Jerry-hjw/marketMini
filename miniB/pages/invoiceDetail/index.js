// pages/invoiceDetail/index.js
import { request } from '../../wxapi/index.js'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    invoice: '',
    tb_order_id: '',
    invoice_amount: '',
    tbInvoiceDetailBeanList: '',
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
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const pr_customer_id = wx.getStorageSync('pr_customer_id')
    this.setData({ pr_customer_id: pr_customer_id })
    if (options.pr_invoice_id) {
      this.getInvoice(options.pr_invoice_id)
    } else {
      this.getMember()
    }
    if (options.id && options.amount) {
      this.setData({
        tb_order_id: options.id,
        invoice_amount: options.amount
      })
    }
    if (options.list) {
      const list = JSON.parse(options.list)
      this.setData({
        tbInvoiceDetailBeanList: list,
        invoice_amount: list.reduce((previous, next) => { return previous + (parseFloat(next.invoice_amount) || 0) }, 0)
      })
    }
  },
  getInvoice(id) {
    wx.showLoading({
      title: '查询中...',
    })
    request('/invoice/queryDetailById', 'post', { pr_invoice_id: id, pr_customer_id: this.data.pr_customer_id }).then(res => {
      wx.hideLoading()
      if (res) {
        res.cardTypeName = res.invoice_traveller_cardtype ? this.data.cardType.filter(item => { return item.value === res.invoice_traveller_cardtype })[0].key : ''
        this.setData({
          invoice: res,
          invoice_amount: res.invoice_amount
        })
      }
    })
  },
  getMember() {
    wx.showLoading({
      title: '查询中...',
    })
    var params = {pr_member_id : wx.getStorageSync('pr_member_id')}
    request('/member/get', 'post', params).then(res => {
      wx.hideLoading()
      if (res && res.baseBean) {
        this.setData({
          'invoice.invoiceLine': 'bs',
          'invoice.invoice_tax_no': res.baseBean.invoice_tax_no,
          'invoice.invoice_company_name': res.baseBean.invoice_company_name,
          'invoice.invoice_bank_name': res.baseBean.invoice_bank_name,
          'invoice.invoice_bank_account': res.baseBean.invoice_bank_account,
          'invoice.invoice_company_addr': res.baseBean.invoice_company_addr,
          'invoice.invoice_company_tel': res.baseBean.invoice_company_tel,
          'invoice.invoice_traveller': res.baseBean.invoice_traveller,
          'invoice.invoice_traveller_cardtype': res.baseBean.invoice_traveller_cardtype,
          'invoice.invoice_traveller_cardno': res.baseBean.invoice_traveller_cardno,
          'invoice.invoice_notifier_mobile': res.baseBean.invoice_notifier_mobile,
          'invoice.invoice_notifier_email': res.baseBean.invoice_notifier_email,
          'invoice.cardTypeName': res.baseBean.invoice_traveller_cardtype ? this.data.cardType.filter(item => { return item.value === res.baseBean.invoice_traveller_cardtype })[0].key : ''
        })
      }
    })
  },
  setValue(e) {
    const prop = e.currentTarget.dataset.prop
    if (prop) {
      this.setData({ ['invoice.' + prop]: e.detail.value })
    }
  },
  chooseCardType(e) {
    const type = this.data.cardType[e.detail.value]
    this.setData({
      'invoice.cardTypeName': type.key,
      'invoice.invoice_traveller_cardtype': type.value
    })
  },
  saveInvoice() {
    const params = JSON.parse(JSON.stringify(this.data.invoice))
    params.pr_customer_id = this.data.pr_customer_id
    if (!params.invoiceLine || params.invoiceLine.split(' ').join('').length === 0) {
      wx.showToast({
        title: '请选择发票种类',
        icon: 'none'
      })
      return
    }
    if (!params.invoice_tax_no || params.invoice_tax_no.split(' ').join('').length === 0) {
      wx.showToast({
        title: '请输入开票税号(纳税号)',
        icon: 'none'
      })
      return
    }
    if (!params.invoice_company_name || params.invoice_company_name.split(' ').join('').length === 0) {
      wx.showToast({
        title: '请输入公司名称',
        icon: 'none'
      })
      return
    }
    if (!params.invoice_traveller || params.invoice_traveller.split(' ').join('').length === 0) {
      wx.showToast({
        title: '请输入出行人名称',
        icon: 'none'
      })
      return
    }
    if (!params.invoice_traveller_cardtype || params.invoice_traveller_cardtype.split(' ').join('').length === 0) {
      wx.showToast({
        title: '请输入出行人证件类型',
        icon: 'none'
      })
      return
    }
    if (!params.invoice_traveller_cardno || params.invoice_traveller_cardno.split(' ').join('').length === 0) {
      wx.showToast({
        title: '请输入出行人证件号码',
        icon: 'none'
      })
      return
    }
    if (!params.invoice_notifier_mobile || params.invoice_notifier_mobile.split(' ').join('').length === 0) {
      wx.showToast({
        title: '请输入发票接受者电话',
        icon: 'none'
      })
      return
    }
    const mobileReg = /^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/
    if (params.invoice_notifier_mobile && !mobileReg.test(params.invoice_notifier_mobile)) {
      wx.showToast({
        title: '请输入正确的发票接受者电话',
        icon: 'none'
      })
      return
    }
    if (!params.invoice_notifier_email || params.invoice_notifier_email.split(' ').join('').length === 0) {
      wx.showToast({
        title: '请输入发票接受者电子邮箱',
        icon: 'none'
      })
      return
    }
    const emailReg = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/
    if (params.invoice_notifier_email && !emailReg.test(params.invoice_notifier_email)) {
      wx.showToast({
        title: '请输入正确的发票接受者电子邮箱',
        icon: 'none'
      })
      return
    }
    params.invoice_amount = this.data.invoice_amount
    params.tbInvoiceDetailBeanList = this.data.tbInvoiceDetailBeanList || [{ tb_order_id: this.data.tb_order_id, invoice_amount: this.data.invoice_amount }]
    wx.showLoading({
      title: '申请中...',
    })
    request('/invoice/saveInvoice', 'post', params, false).then(res => {
      wx.hideLoading()
      if (res && res.status === 'SUCCESS') {
        wx.showToast({
          title: '申请成功',
          icon: 'success'
        })
        setTimeout(() => {
          const pages = getCurrentPages()
          const prevPage = pages[pages.length - 2]
          if (prevPage.route === 'pages/invoiceCanSave/index') prevPage.getOrderList()
          wx.navigateBack()
        }, 2000)
      } else {
        wx.showToast({
          title: res.message,
          icon: 'none'
        })
      }
    })
  },
  download(e) {
    if (e.currentTarget.dataset.url) {
      wx.downloadFile({
        url: e.currentTarget.dataset.url,
        success(res) {
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