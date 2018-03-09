import {is,config} from '../../../lib/myapp.js';
Page({
	data: {
		activeIndex: 0,
		sliderOffset: 0,
		sliderLeft: 0,
		width: 0,
		tabList: [
			{
				title: "全部",
				init: false,
				page: 0,
				more: true,
				show: false
			},
			{
				title: "待付款",
				init: false,
				page: 0,
				more: true,
				show: false
			},
			{
				title: "待发货",
				init: false,
				page: 0,
				more: true,
				show: false
			},
			{
				title: "待收货",
				init: false,
				page: 0,
				more: true,
				show: false
			},
		],
		dataList: {
			0: [],
			1: [],
			2: [],
			3: []
		},
		typeList: [
			'临时订单',
			'待付款',
			'付款成功',
			'已发货',
			'已完成',
			'已完成',
			'已取消',
			'已退款',
			'已作废',
			'已删除'
		],
		owner: 0
	},
	onShow() {
		wx.showLoading({
			title: "加载中",
			mask: true
		});
		wx.getSystemInfo({
			success: res => {
				this.setData({
					width: res.windowWidth / this.data.tabList.length,
					sliderOffset: res.windowWidth / this.data.tabList.length * this.data.activeIndex
				})
			}
		});
		this.queryOrderList(this.data.activeIndex, 1, this.data.owner);
	},
	onLoad(e) {
		if (e.type) {
			this.setData({
				activeIndex: e.type
			})
		}
		if (e.owner) {
			this.setData({
				owner: e.owner
			})
		}
	},
	jump(e) {
		wx.navigateTo({
			url: '/pages/order/detail/detail?order_no=' + e.currentTarget.dataset.no
		})
	},
	close(e) {
		var order_no = e.currentTarget.dataset.no;
		this.cancelOrder(order_no);
	},
	delete(e) {
		var order_no = e.currentTarget.dataset.no;
		this.deleteOrder(order_no);
	},
	pay(e) {
		var order_no = e.currentTarget.dataset.no;
		wx.navigateTo({
			url: '/pages/store/payment/payment?order_no=' + order_no
		})
	},
	search() {
		wx.navigateTo({
			url: '/pages/order/search/search?owner=' + this.data.owner
		})
	},
	tabClick(e) {

		var status = e.currentTarget.id;
		this.setData({
			sliderOffset: e.currentTarget.offsetLeft,
			activeIndex: status
		});
		if (!this.data.tabList[status].init) {
			wx.showLoading({
				title: "加载中",
				mask: true
			});

			this.queryOrderList(status, 1, this.data.owner);
		}
	},
	onReachBottom(e) {
		var status = this.data.activeIndex
		var page = this.data.tabList[status].page + 1;
		var tabList = `tabList[${status}]`;
		if (this.data.tabList[status].more) {
			this.setData({
				[`${tabList}.show`]: true
			})
			this.queryOrderList(status, page, this.data.owner);
		} else {
			wx.showToast({
				image: '../../../assets/image/error.png',
				title: '再拉也没有啦'
			});
		}
	},
	// 查询订单列表
	queryOrderList(status = 0, page = 1, owner = 0) {
		var token = wx.getStorageSync('user_token');
		var params = status ? { status  } : {  };
		params.page = page;
		params.is_clerk_owner = owner;

		wx.request({
			url: config.GLOBAL.baseUrl + 'api/O2O/order/list',
			header: {
				Authorization: token
			},
			data: params,
			success: res => {
				if (res.statusCode == 200) {
					res = res.data;
					if (res.status) {
						var pages = res.meta.pagination;
						var current_page = pages.current_page;
						var total_pages = pages.total_pages;
						var tabList = `tabList[${status}]`;
						this.setData({
							[`dataList.${status}[${page - 1}]`] : res.data,
							[`${tabList}.init`]: true,
							[`${tabList}.page`]: current_page,
							[`${tabList}.more`]: current_page < total_pages,
							[`${tabList}.show`]: false
						})
					} else {
						wx.showToast({
							title: res.message,
							image: '../../../assets/image/error.png'
						})
					}
				} else {
					wx.showModal({
						title: '',
						content: '请求失败',
						showCancel: false
					})
				}
			},
			complete: ret => {
				wx.hideLoading();
			}
		})
	},
	// 取消订单
	cancelOrder(order_no) {
		var token = wx.getStorageSync('user_token');

		wx.request({
			url: config.GLOBAL.baseUrl + 'api/O2O/shopping/order/cancel',
			method: 'POST',
			header: {
				Authorization: token
			},
			data: {
				order_no: order_no
			},
			success: res => {
				if (res.statusCode == 200) {
					res = res.data;
					if (res.status) {
						wx.showToast({
							title: '取消订单成功',
							duration: 1000
						});
						setTimeout(() => {
							this.queryOrderList(this.data.activeIndex, 1, this.data.owner)
						}, 1000)
					} else {
						wx.showModal({
							title: '',
							content: res.message,
							showCancel: false
						})
					}
				} else {
					wx.showModal({
						title: '',
						content: '取消订单失败, 请检查您的网络状态',
						showCancel: false
					})
				}
			}
		})
	},
	// 删除订单
	deleteOrder(order_no) {
		var token = wx.getStorageSync('user_token');

		wx.request({
			url: config.GLOBAL.baseUrl + 'api/O2O/shopping/order/delete',
			method: 'POST',
			header: {
				Authorization: token
			},
			data: {
				order_no: order_no
			},
			success: res => {
				if (res.statusCode == 200) {
					res = res.data;
					if (res.status) {
						wx.showToast({
							title: '删除订单成功',
							duration: 1000
						});
						setTimeout(() => {
							this.queryOrderList(this.data.activeIndex, 1, this.data.owner)
						}, 1000)
					} else {
						wx.showModal({
							title: '',
							content: res.message,
							showCancel: false
						})
					}
				} else {
					wx.showModal({
						title: '',
						content: '删除订单失败, 请检查您的网络状态',
						showCancel: false
					})
				}
			}
		})
	}
})