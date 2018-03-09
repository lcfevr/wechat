import {config} from '../../../lib/myapp.js'
Page({
	data: {
		orderList: [],
		text: '',
		clear:true,
		searches: [],
		show: true,
		meta: '',
		init: false,
		showLoad: false,
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
	onLoad(e) {
		if (e.owner != undefined) {
			this.setData({
				owner: e.owner
			})
		}
	},
	onShow() {

		var searches = wx.getStorageSync('goods_search_history');
		if (searches.length) {
			this.setData({
				searches: searches
			})
		}

		if (this.data.text) {
			wx.showLoading({
				title: "加载中",
				mask: true
			});
			this.querySearchList({criteria: this.data.text,is_clerk_owner: this.data.owner});
		}

	},
	onReachBottom() {
		var hasMore = this.data.meta.pagination.total_pages > this.data.meta.pagination.current_page;
		if (hasMore) {
			var query = {
				criteria: this.data.text,
				is_clerk_owner: this.data.owner
			};
			var page = this.data.meta.pagination.current_page + 1;
			this.querySearchList(query,page);
		} else {
			wx.showToast({
				image: '../../../assets/image/error.png',
				title: '再拉也没有啦'
			});
		}

	},
	jump(e) {
		wx.navigateTo({
			url: '/pages/order/detail/detail?order_no=' + e.currentTarget.dataset.no
		})
	},
	pay(e) {
		var order_no = e.currentTarget.dataset.no;
		wx.navigateTo({
			url: '/pages/store/payment/payment?order_no=' + order_no
		})
	},
	search(e) {
		this.setData({
			text: e.detail.value,
			clear: e.detail.value <= 0
		})
	},
	clear() {
		this.setData({
			text: '',
			clear: true
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
	// 单击搜索
	searchKeywords() {

		var keyword = this.data.text;
		if (!keyword || !keyword.length) return;
		var searches = JSON.parse(JSON.stringify(this.data.searches));
		for (let i = 0, len = searches.length; i < len; i++) {
			let  search = searches[i];
			if (search === keyword) {
				searches.splice(i, 1);
				break;
			}
		}

		searches.unshift(keyword);
		wx.setStorageSync('goods_search_history', searches);

		wx.setNavigationBarTitle({
			title: '搜索：' + "'" + keyword + "'"
		})
		this.querySearchList({criteria: keyword,is_clerk_owner: this.data.owner});

		this.setData({
			show: false,
			searches: searches
		})

	},
	// 点击单个搜索记录搜索
	searchHistory(e) {

		var searches = JSON.parse(JSON.stringify(this.data.searches));
		var keyword = searches[e.currentTarget.dataset.index];

		searches.splice(e.currentTarget.dataset.index, 1);
		searches.unshift(keyword);


		wx.setStorageSync('goods_search_history', searches);

		wx.setNavigationBarTitle({
			title: '搜索：' + "'" + keyword + "'"
		})
		this.querySearchList({criteria: keyword,is_clerk_owner: this.data.owner});

		this.setData({
			show: false,
			searches: searches,
			text: keyword
		});
	},
	// 删除单个搜索记录
	removeSearchHistory(e) {
		var searches = JSON.parse(JSON.stringify(this.data.searches));

		searches.splice(e.currentTarget.dataset.index, 1);

		wx.setStorageSync('goods_search_history', searches);

		this.setData({
			searches: searches
		})
	},
	// 清空搜索记录
	clearSearchHistory() {
		wx.removeStorageSync('goods_search_history');
		this.setData({
			show: false,
			searches:[]
		})
	},
	// 搜索订单
	querySearchList(query = {}, page = 1) {
		var params = Object.assign({}, query, { page });
		var token = wx.getStorageSync('user_token');
		wx.showLoading({
			title: '加载中',
			mask: true
		});

		wx.request({
			url: config.GLOBAL.baseUrl + 'api/O2O/order/list',
			header: {
				Authorization: token
			},
			data: params,
			success: res => {
				res = res.data;

				if (res.status) {
					// var keyReg = new RegExp('(' + this.data.text + ')(?!</i>)', 'g')
					// list.forEach(item => {
					// 	item.name = item.name.replace(keyReg, '<i>$1</i>');
					// })
					this.setData({
						[`orderList[${page - 1}]`]: res.data,
						meta: res.meta,
						init: true,
					})
				} else {
					wx.showModal({
						title: '',
						content: res.message
					})
				}

			},
			fail: err => {
				wx.showModal({
					title: '',
					content: '请求失败，请稍后重试',
					showCancel: false
				})
			},
			complete: res => {
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
							this.querySearchList({criteria: this.data.text, is_clerk_owner: this.data.owner})
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
							this.querySearchList({criteria: this.data.text, is_clerk_owner: this.data.owner})
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