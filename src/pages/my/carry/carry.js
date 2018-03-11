import { is, config } from '../../../es6/myapp.js';
Page({
	data: {
		list: [],
		meta: '',
		show: false,
		init: false
	},
	onLoad() {
		this.querybBonusList();
	},
	onReachBottom() {
		var hasMore = this.data.meta.pagination.total_pages > this.data.meta.pagination.current_page;
		if (hasMore) {
			var page = this.data.meta.pagination.current_page + 1;
			this.setData({
				show: true
			})
			this.querybBonusList(page)
		} else {
			wx.showToast({
				image: '../../../assets/image/error.png',
				title: '再拉也没有啦'
			});
		}
	},
	// 获取提成信息与提成列表
	querybBonusList(page = 1) {
		var token = wx.getStorageSync('user_token');

		wx.request({
			url: config.GLOBAL.baseUrl + 'api/O2O/clerk/bonus',
			header: {
				Authorization: token
			},
			data: {
				page: page
			},
			success: res => {
				if (res.statusCode == 200) {
					res = res.data;
					if (res.status) {
						this.setData({
							[`list[${page - 1}]`]: res.data,
							meta: res.meta
						})
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
						content: "请求失败",
						showCancel: false
					})
				}
			},
			complete: ret => {
				this.setData({
					show: false,
					init: true
				})
			}
		})
	}
})