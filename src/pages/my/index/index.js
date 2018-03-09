import { is, config } from '../../../lib/myapp.js';
Page({
	data: {
		name: '',
		showName: false,
		userInfo: ''
	},
	close() {
		this.setData({
			showName: !this.data.showName
		})
	},
	onLoad() {
		this.getUserInfo();
	},
	jump() {
		wx.navigateTo({
			url: '/pages/user/reset/reset'
		})
	},
	input(e) {
		this.setData({
			name: e.detail.value
		})
	},
	submit() {
		if (!is.has(this.data.name)) {
			wx.showModal({
				title: '',
				content: "请输入昵称",
				showCancel: false
			})
		} else {
			this.updateName();
		}
	},
	// 退出当前账号
	out() {
		wx.removeStorageSync('user_token');
		wx.showToast({
		  title: '注销成功',
			duration: 1000
		})
		setTimeout(() => {
			wx.reLaunch({
				url: '/pages/user/login/login'
			})
		}, 1000)
	},
	// 获取当前登录用户信息
	getUserInfo() {
		var token = wx.getStorageSync('user_token');

		wx.request({
			url: config.GLOBAL.baseUrl + "api/O2O/clerk/me",
			header: {
				Authorization: token
			},
			success: res => {
				if (res.statusCode == 200) {
					res = res.data;
					if (res.status) {
						this.setData({
							userInfo: res.data
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
						content: '获取用户信息失败',
						showCancel: true
					})
				}
			}
		})
	},
	// 修改用户昵称
	updateName() {
		var token = wx.getStorageSync('user_token');

		wx.request({
			url : config.GLOBAL.baseUrl + 'api/O2O/clerk/updateNickname',
			method: 'POST',
			header: {
				Authorization: token
			},
			data: {
				nickname: this.data.name
			},
			success:res => {
				if (res.statusCode == 200) {
					res = res.data;
					this.close();
					if (res.status) {
						wx.showToast({
							title: "修改成功",
						})
						this.getUserInfo();
					} else {
						wx.showToast({
							title: res.message,
							image: '../../../assets/image/error.png'
						})
					}
				} else {
					wx.showToast({
						title: '修改失败',
						image: '../../../assets/image/error.png'
					})
				}
			}
		})
	},
	// 修改用户头像
	updateImg() {
		var token = wx.getStorageSync('user_token');
		wx.chooseImage({
			count: 1,
			success: res => {
				wx.uploadFile({
					header: {
						'content-type':'multipart/form-data',
						Authorization:token
					},
					url: config.GLOBAL.baseUrl + 'api/O2O/clerk/upload/avatar',
					filePath: res.tempFilePaths[0],
					name: 'avatar_file',
					success: ret => {
						if (ret.statusCode == 200) {
							ret = JSON.parse(ret.data);
							if (ret.status) {
								this.setData({
									'userInfo.avatar': ret.data.url
								})
							} else {
								wx.showModal({
									title: '',
									content: ret.message,
									showCancel: false
								})
							}
						} else {
							wx.showModal({
								title: '',
								content: '接口错误',
								showCancel: false
							})
						}
					},
					fail: ers =>{
						wx.showModal({
							title: '',
							content: '上传图片失败',
							showCancel: true
						})
					}
				})
			}
		})
	}

})