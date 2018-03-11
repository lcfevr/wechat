import {is,config} from '../../../es6/myapp.js';
Page({
	data: {
		objectArray: [
			{
				id: 0,
				name: '美国'
			},
			{
				id: 1,
				name: '中国'
			},
			{
				id: 2,
				name: '巴西'
			},
			{
				id: 3,
				name: '日本'
			}
		],
		img: [],
		showPay: false,
		order: {},
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
		norder_no: '',
	},
	// onShow(){
	// 	console.log(543435)
	// 	wx.showLoading({
	// 		title: "加载中",
	// 		mask: true
	// 	});
	// 	this.queryOrderDetail(this.data.norder_no);
	// },
	onLoad(e) {
		this.setData({
			norder_no: e.order_no
		});

		wx.showLoading({
			title: "加载中",
			mask: true
		});
		this.queryOrderDetail(e.order_no);
	},
	bindPickerChange(e) {
		var index = e.detail.value
		this.setData({
			index: index
		})
		console.log(this.data.objectArray[index].name);
	},
	upload() {
		var token = wx.getStorageSync('user_token');
		wx.chooseImage({
			count: 1,
			success: res => {
				wx.uploadFile({
					header: {
						'content-type':'multipart/form-data',
						Authorization:token
					},
				    url: config.GLOBAL.baseUrl + 'api/O2O/upload',

					filePath: res.tempFilePaths[0],
					name: 'avatar_file',
				    success:ret => {
				    	if (ret.statusCode == 200) {
						    ret = JSON.parse(ret.data);
						    if (ret.status) {
						    	var img = this.data.img;
						    	img.push(ret.data.url);

						    	this.setData({
								    img: img
							    })


                                if(this.data.img.length) {
                                    var token = wx.getStorageSync('user_token');

                                    wx.request({
                                        url: config.GLOBAL.baseUrl + 'api/O2O/order/upload/ticket',
                                        method: 'POST',
                                        header: {
                                            Authorization: token
                                        },
                                        data: {
                                            order_no: this.data.norder_no,
                                            images: this.data.img
                                        },
                                        success: res => {
                                            if (res.statusCode == 200) {
                                                res = res.data;
                                                if (res.status) {
                                                    this.queryOrderDetail(this.data.norder_no)
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
                                                    content: '上传小票失败, 请检查您的网络状态',
                                                    showCancel: false
                                                })
                                            }
                                        }
                                    })
                                } else {
                                    wx.showModal({
                                        title: '',
                                        content: '请先上传小票',
                                        showCancel: false
                                    })
                                }

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
				    }
				})
			}
		})
	},
	delete(e) {
		var index = e.currentTarget.dataset.index;
		var img = this.data.img;
		img.splice(index, 1);
		this.setData({
			img: img
		})
	},
	preview() {
		wx.previewImage({
			urls: this.data.img,
			fail: err => {
				console.log(err);
			}
		})
	},
	close() {
		this.setData({
			showPay: false
		})
	},
	submit() {

	},
	toTicket(e){
		console.log(e)
		var order_no = e.currentTarget.dataset.no;
		wx.navigateTo({
			url:'/pages/order/ticket/ticket?order_no='+order_no
		})
	},
	payType(e) {
		console.log(e.detail.value)
	},

	// 查询订单详情
	queryOrderDetail(order_no) {
		var token = wx.getStorageSync('user_token');

		wx.request({
			url: config.GLOBAL.baseUrl + 'api/O2O/order/detail/' + order_no,
			header: {
				Authorization: token
			},
			success:res => {
				if (res.statusCode == 200) {
					res = res.data;
					if (res.status) {
						this.setData({
							order: res.data,
							img: res.data.shop_order.images
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
	// 上传小票
	uploadImg() {
		if(this.data.img.length) {
			var token = wx.getStorageSync('user_token');

			wx.request({
				url: config.GLOBAL.baseUrl + 'api/O2O/order/upload/ticket',
				method: 'POST',
				header: {
					Authorization: token
				},
				data: {
					order_no: this.data.norder_no,
					images: this.data.img
				},
				success: res => {
					if (res.statusCode == 200) {
						res = res.data;
						if (res.status) {
							this.queryOrderDetail(this.data.norder_no)
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
							content: '上传小票失败, 请检查您的网络状态',
							showCancel: false
						})
					}
				}
			})
		} else {
			wx.showModal({
				title: '',
				content: '请先上传小票',
				showCancel: false
			})
		}

	}
})