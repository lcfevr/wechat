import { is, config } from '../../../lib/myapp.js';
Page({

	data: {
		data: ""
	},
	onLoad() {
		this.queryCount();
	},

	jump() {
		wx.navigateTo({
		  url: '/pages/my/carry/carry'
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
							data: res.data
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