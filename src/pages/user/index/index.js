import {
    is,
    sandBox,
    config
} from '../../../es6/myapp.js'

Page({
    data: {
        showAlert: false,
        info: {},
        qr_code: '',
        user: {},
        img: '',
        count: ''

    },
    onLoad(){
        wx.showLoading();
        this.getInfo();
        // this.queryCount();

    },
    close(){
        this.setData({
            showAlert: false
        })
    },
    // 修改用户资料
    jump() {
        wx.navigateTo({
            url: '/pages/my/index/index'
        })
    },
    // 会员管理
    jumpUser() {
        wx.navigateTo({
            url: '/pages/member/list/list'
        })
    },
    // 我的订单
    jumpOrder(e) {
        var type = e.currentTarget.dataset.type;
        var owner = e.currentTarget.dataset.owner;

        wx.navigateTo({
            url: '/pages/order/index/index?type=' + type + '&owner=' + owner
        })
    },
    // 我的业绩
    jumpAchievement() {
        wx.navigateTo({
            url: '/pages/my/achievement/achievement'
        })
    },
    // 我的提成
    jumpCarry() {
        wx.navigateTo({
            url: '/pages/my/carry/carry'
        })
    },
    //积分修改
    jumpScoreChange(){
        wx.removeStorageSync('select_member')
        var route = getCurrentPages()[getCurrentPages().length - 1].route
        var type = 'score'
        wx.navigateTo({
            url: `/pages/member/list/list?url=${route}&tag=${type}`
        })
    },
    //余额修改
    jumpAmountChange(){
        wx.removeStorageSync('select_member')
        var route = getCurrentPages()[getCurrentPages().length - 1].route
        var type = 'buy'
        wx.navigateTo({
            url: `/pages/member/list/list?url=${route}&tag=${type}`
        })
    },
    // 充值记录
    jumpRecord() {
        wx.navigateTo({
            url: '/pages/recharge/record/record'
        })
    },
    // 会员充值
    jumpRecharge() {
        wx.navigateTo({
            url: '/pages/recharge/index/index'
        })

    },
    // 开单收银
    jumpShop() {
        wx.switchTab({
            url: '/pages/store/cart/cart'
        })
    },
    jumpAfterSale(){
        wx.navigateTo({
            url: '/pages/afterSales/index/index'
        })
    },
    change() {
        this.setData({
            showAlert: !this.data.showAlert
        })
    },
    getQrcode(){
        var app = getApp();
        var shop_id = this.data.info.shop_id

        var oauth = wx.getStorageSync('user_token')
        if (!oauth) {
            wx.hideLoading()

            app.isLogin();
        }
        sandBox.get({
            api: `api/O2O/home/get/qr/${shop_id}`,
            header: {Authorization: oauth},
        }).then((res) => {
            var data = res.data
            if (data.status && data.data) {
                this.setData({
                    qr_code: data.data.code
                })
            } else {
                wx.showModal({
                    content: data.message || '查询二维码失败',
                })
            }

            wx.hideLoading()
        })
    },
    getInfo(){

        var oauth = wx.getStorageSync('user_token')
        var app = getApp();

        if (!oauth) {
            app.isLogin();
        }
        sandBox.get({
            api: 'api/O2O/home/index',
            header: {Authorization: oauth},
        }).then((res) => {
            var data = res.data;
            if (data.status && data.data) {
                this.setData({
                    info: data.data
                })
                wx.setStorageSync('clerk', data.data.clerk)
                // this.getQrcode()
            } else {

                wx.showModal({
                    content: res.message || '查询会员信息失败',
                    success: (confirm) => {
                        if (confirm.confirm) {
                            wx.navigateBack();
                        }
                    }
                })

            }
            wx.hideLoading()
        }).catch(() => {
            wx.hideLoading();
            wx.showModal({
                content: '服务器错误',
                success: (confirm) => {
                    if (confirm.confirm) {

                        wx.navigateBack();
                    }
                }
            })

        })
    },
    onShow(){
        // 获取用户信息
        // if()
        this.getInfo();
    },
    jumpGuideManager(){
        var id = this.data.info.shop_id;
        wx.navigateTo({
            url: '/pages/guide/index/index?shop_id=' + id
        })
    },
    // 获取二维码
    queryCode(id) {
        var token = wx.getStorageSync('user_token');

        wx.request({
            url: config.GLOBAL.baseUrl + "api/O2O/home/get/qr/" + id,
            header: {
                Authorization: token
            },
            success: res => {
                if (res.statusCode == 200) {
                    res = res.data;
                    if (res.status) {
                        this.setData({
                            img: res.data.code
                        })
                    } else {
                        wx.showModal({
                            title: '',
                            content: res.message,
                            showCancel: true
                        })
                    }
                } else {
                    wx.showModal({
                        title: '',
                        content: '获取二维码失败',
                        showCancel: true
                    })
                }
            }
        })
    },

    // 查询我的业绩
    queryCount() {
        var token = wx.getStorageSync('user_token');

        wx.request({
            url: config.GLOBAL.baseUrl + "api/O2O/clerk/count",
            header: {
                Authorization: token
            },
            success: res => {
                if (res.statusCode == 200) {
                    res = res.data;
                    if (res.status) {
                        this.setData({
                            count: res.data
                        })
                    } else {
                        wx.showModal({
                            title: '',
                            content: res.message,
                            showCancel: true
                        })
                    }
                } else {
                    wx.showModal({
                        title: '',
                        content: '获取信息失败',
                        showCancel: true
                    })
                }
            }
        })
    }
})
