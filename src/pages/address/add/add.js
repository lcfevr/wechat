import {config,is,pageLogin,getUrl} from '../../../es6/myapp';
import CHINADATA from '../../../utils/china-area-data'
Page({
	data: {
		detail: {
			is_default: false,
			address_name: [],
            province: {
                value: '北京市',
                code: '110000',
            },

            city: {
                value: '北京市市辖区',
                code: '110100',


            },
            district: {
                value: '东城区',
                code: '110101',
            },
		},
        provinces:[],
        citys:[],
        districts:[],
        region:[],
		order_no: '',
		id: '',
		loading: false,
		deleteLoading: false
	},

	onLoad(e) {
		// pageLogin(getUrl());
		this.setData({
			id: e.id
		})
		if (e.id) {
			wx.setNavigationBarTitle({
				title: '修改收货地址'
			})
			this.queryAddress(e.id);
		} else {
			wx.setNavigationBarTitle({
				title: '新增收货地址'
			})
		}

		this.initChinaArea();
	},
	initChinaArea(){



		var  list = this.data.detail;
		var provinces = [],citys = [],districts = [],address = this.data.detail.address_name
		var provincesObj = CHINADATA['86'];
        var obj ={}
		provinces = Object.keys(provincesObj).map((item)=>{
			return {id:item,name:provincesObj[item]}
		})

		if (provinces.length) {
            if (list.province.value  && list.province.code) {


                for (var i = 0,len = provinces.length;i<len;i++) {

                    var item = provinces[i];

                    if (item.id == list.province.code && item.name == list.province.value) {
                        address[0] = i
                        obj.code = provinces[i].id
                        obj.value = provinces[i].name
                        break
                    } else {
                        address[0] = 0
                        obj.code = provinces[0].id
                        obj.value = provinces[0].name
                    }
                }
            } else {
                address[0] = 0;
                obj.code = provinces[0].id
                obj.value = provinces[0].name
            }


            list.province = Object.assign(list.province,obj)
		} else {
        	list.province = {code:'',value:''}
		}



		var provinceIndex = address[0];
        var cityObj = provinceIndex !== undefined ? CHINADATA[provinces[provinceIndex].id] : {}

		if (cityObj !== undefined) {
            citys = Object.keys(cityObj).map((item) =>{
                return {id:item,name:cityObj[item]}
            })

            if (citys.length) {
                if (list.city.value && list.city.code) {


                    for (var i = 0,len = citys.length;i<len;i++) {
                        var item = citys[i];

                        if (item.id == list.city.code && item.name == list.city.value) {
                            address[1] = i
                            obj.code = citys[i].id
                            obj.value = citys[i].name
                            break
                        } else {
                            address[1] = 0
                            obj.code = citys[0].id
                            obj.value = citys[0].name

                        }
                    }
                } else {
                    address[1] = 0;
                    obj.code = citys[0].id
                    obj.value = citys[0].name
                }
                list.city = Object.assign(list.city,obj)
            } else {
                address.splice(1,1)
                list.city = {code:'',value:''}
            }
		} else {
            address.splice(1,1)
            list.city = {code:'',value:''}

		}



		var cityIndex = address[1];
        var districtObj = cityIndex !== undefined ? CHINADATA[citys[cityIndex].id] : {}



		if (districtObj !== undefined) {
            districts = Object.keys(districtObj).map((item) =>{
                return {id:item,name:districtObj[item]}
            })

            if (districts.length) {
                if (list.district.value && list.district.code) {

                    for (var i = 0,len = districts.length;i<len;i++) {
                        var item = districts[i];

                        if (item.id == list.district.code && item.name == list.district.value) {
                            address[2] = i
                            obj.code = districts[i].id
                            obj.value = districts[i].name
                            break
                        } else {
                            address[2] = 0
                            obj.code = districts[0].id
                            obj.value = districts[0].name
                        }
                    }
                } else {
                    address[2] = 0
                    obj.code = districts[0].id
                    obj.value = districts[0].name
                }

                list.district = Object.assign(list.district,obj)
            } else {
            	address.splice(2,1)
                list.district = {code:'',value:''}
            }
		} else {
            address.splice(2,1)
            list.district = {code:'',value:''}
		}


		
		list = Object.assign({},this.data.detail,list,{address_name:address})
		this.setData({
			'detail':list,
			'region':[provinces,citys,districts],

		})
		

	},
	bindRegionChange(e) {
		this.setData({
			'detail.address_name': e.detail.value
		})
	},
    changeColumn(e){

		
		var province = this.data.detail.province;
		var city = this.data.detail.city;
		var district = this.data.detail.district;
		var column = e.detail.column;
		var list = this.data.region[column]
		var value = e.detail.value
		var obj= {}
        obj.code=list[value].id;
        obj.value=list[value].name


		switch (column) {
			case 0:

				province = Object.assign(province,obj)
				this.setData({
					'detail.province':province
				})
				this.initChinaArea();
				break;

			case 1:

                city = Object.assign(city,obj)
                this.setData({
                    'detail.city':city
                })
                this.initChinaArea();
				break;
			case 2:

                district = Object.assign(district,obj)
                this.setData({
                    'detail.district':district
                })
                this.initChinaArea();
				break;
		}
	},
	check(e) {
		this.setData({
			"detail.is_default": !this.data.detail.is_default
		})
	},
	input(e) {
		var type = e.currentTarget.dataset.type;
		var value = e.detail.value;
		this.setData({
			[`detail.${type}`]: value
		})
	},
	delete() {
		this.setData({
			deleteLoading: true
		})
		this.removeAddress(this.data.id);
	},
	submit() {
		this.setData({
			loading: true
		})
		var message = null;
		if (!is.has(this.data.detail.accept_name)) {
			message = '请输入姓名'
		} else if (!is.has(this.data.detail.mobile)) {
			message = '请输入手机号码'
		} else if (!is.mobile(this.data.detail.mobile)) {
			message = '请输入正确的手机号码'
		} else if (!is.has(this.data.detail.address_name)) {
			message = '请选择地址'
		} else if (!is.has(this.data.detail.address)) {
			message = '请输入详细地址';
		}
		if (message) {
			this.setData({
				loading: false
			})
			wx.showModal({
				title: '',
				content: message,
				showCancel: false
			})
		} else {
			if (this.data.id) {
				this.updateAddress(this.data.detail);
			} else {
				this.createAddress(this.data.detail)
			}
		}
	},
	// 获取收货地址详情
	// queryAddress(id) {
	// 	var token = wx.getStorageSync('user_token');
	// 	wx.request({
	// 		url: config.GLOBAL.baseUrl + 'api/address/' + id,
	// 		header: {
	// 			Authorization: token
	// 		},
	// 		success: res => {
	// 			if (res.statusCode == 200) {
	// 				res = res.data;
	// 				var data = res.data;
	// 				data.is_default = !!data.is_default;
	// 				data.address_value = [data.province, data.city, data.area].join(' ');
	// 				data.address_name = data.address_name.split(' ');
	// 				if (res.status) {
	// 					this.setData({
	// 						detail: data
	// 					})
	// 				} else {
	// 					wx.showToast({
	// 						title: res.message,
	// 						image: '../../../assets/image/error.png'
	// 					})
	// 				}
	// 			} else {
	// 				wx.showToast({
	// 					title: '获取信息失败',
	// 					image: '../../../assets/image/error.png'
	// 				})
	// 			}
	// 		}
	// 	})
	// },
	// 新增收货地址
	// createAddress(data) {
	// 	var address = {
	// 		accept_name: data.accept_name,
	// 		mobile: data.mobile,
	// 		province: data.province,
	// 		city: data.city,
	// 		area: data.area,
	// 		address_name: data.address_name.join(" "),
	// 		address: data.address,
	// 		is_default: data.is_default ? 1 : 0
	// 	};
	// 	var token = wx.getStorageSync('user_token');
	// 	wx.request({
	// 		url: config.GLOBAL.baseUrl + 'api/address/create',
	// 		method: 'POST',
	// 		header: {
	// 			Authorization: token
	// 		},
	// 		data: address,
	// 		success: res => {
	// 			if (res.statusCode == 200) {
	// 				res = res.data;
	// 				if (res.status) {
	// 					wx.showModal({
	// 						title: '',
	// 						content: '新增收货地址成功',
	// 						showCancel: false,
	// 						success: res=>{
	// 							if (res.confirm) {
	// 								wx.navigateBack();
	// 							}
	// 						}
	// 					})
	// 				} else {
	// 					wx.showToast({
	// 						title: '新增收货地址失败',
	// 						image: '../../../assets/image/error.png',
	// 						complete: err => {
	// 							setTimeout(() => {
	// 								wx.navigateBack();
	// 							},1600)
	// 						}
	// 					})
	// 				}
	// 			} else {
	// 				wx.showToast({
	// 					title: '请求错误',
	// 					image: '../../../assets/image/error.png',
	// 					complete: err => {
	// 						setTimeout(() => {
	// 							wx.navigateBack();
	// 						},1600)
	// 					}
	// 				})
	// 			}
	//
	// 		},
	// 		complete: err => {
	// 			this.setData({
	// 				loading: false
	// 			})
	// 		}
	// 	})
	// },
	// 修改收货地址
	// updateAddress(data) {
	// 	var address = {
	// 		id: data.id,
	// 		accept_name: data.accept_name,
	// 		mobile: data.mobile,
	// 		province: data.province,
	// 		city: data.city,
	// 		area: data.area,
	// 		address_name: data.address_name.join(" "),
	// 		address: data.address,
	// 		is_default: data.is_default ? 1 : 0
	// 	};
	// 	var token = wx.getStorageSync('user_token');
	// 	wx.request({
	// 		url: config.GLOBAL.baseUrl + 'api/address/update',
	// 		method: 'PUT',
	// 		header: {
	// 			Authorization: token
	// 		},
	// 		data: address,
	// 		success: res => {
	// 			if (res.statusCode == 200) {
	// 				res = res.data;
	// 				if (res.status) {
	// 					wx.showModal({
	// 						title: '',
	// 						content: '修改收货地址成功',
	// 						showCancel: false,
	// 						success: res=>{
	// 							if (res.confirm) {
	// 								wx.navigateBack();
	// 							}
	// 						}
	// 					})
	// 				} else {
	// 					wx.showToast({
	// 						title: '修改收货地址失败',
	// 						image: '../../../assets/image/error.png',
	// 						complete: err => {
	// 							setTimeout(() => {
	// 								wx.navigateBack();
	// 							},1600)
	// 						}
	// 					})
	// 				}
	// 			} else {
	// 				wx.showToast({
	// 					title: '请求错误',
	// 					image: '../../../assets/image/error.png',
	// 					complete: err => {
	// 						setTimeout(() => {
	// 							wx.navigateBack();
	// 						},1600)
	// 					}
	// 				})
	// 			}
	//
	// 		},
	// 		complete: err => {
	// 			this.setData({
	// 				loading: false
	// 			})
	// 		}
	// 	})
	// },
	// 删除收货地址
	// removeAddress(id) {
	// 	var token = wx.getStorageSync('user_token');
	// 	wx.request({
	// 		url: config.GLOBAL.baseUrl + 'api/address/' + id,
	// 		header: {
	// 			Authorization: token
	// 		},
	// 		method: 'DELETE',
	// 		success: res => {
	// 			if (res.statusCode == 200) {
	// 				res = res.data;
	// 				if (res.status) {
	// 					wx.showModal({
	// 						title: '',
	// 						content: '删除收货地址成功',
	// 						showCancel: false,
	// 						success: res=>{
	// 							if (res.confirm) {
	// 								wx.navigateBack();
	// 							}
	// 						}
	// 					})
	// 				} else {
	// 					wx.showToast({
	// 						title: '删除收货地址失败',
	// 						image: '../../../assets/image/error.png',
	// 						complete: err => {
	// 							setTimeout(() => {
	// 								wx.navigateBack();
	// 							},1600)
	// 						}
	// 					})
	// 				}
	// 			} else {
	// 				wx.showToast({
	// 					title: '请求错误',
	// 					image: '../../../assets/image/error.png',
	// 					complete: err => {
	// 						setTimeout(() => {
	// 							wx.navigateBack();
	// 						},1600)
	// 					}
	// 				})
	// 			}
	// 		},
	// 		complete: err => {
	// 			this.setData({
	// 				deleteLoading: false
	// 			})
	// 		}
	// 	})
	// }

})