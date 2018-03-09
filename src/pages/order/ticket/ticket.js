/**
 * Created by admin on 2017/12/4.
 */
import {is, config} from '../../../lib/myapp.js';
Page({
    data: {
        order_no: '',
        order: {},
        meta:{},
        btDevices: [],
        currentDevName: 'defaulName',
        currentConnectionState: '已连接',

        recvTotalBytes: '0',
        recvCrc32: '0',

        sendTotalBytesCounter: 0,
        sendTotalBytes: '0',
        sendCrc32: '0',

        recv_data: '',
        scrollTop: 100,
        send_data: '',

        devId: '123',
        services: [
            '22',
        ],
        connected: false,

        notifyServiceId: '',
        notifyCharacteristicId: '',
        notifyServiceSearchIndex: 0,

        writeServiceId: '',
        writeCharacteristicId: '',
        writeServiceSearchIndex: 0,
        enabled: false,
        discover: false,
        linked: false
    },

    onLoad(e){
        console.log(e)
        var order_no = e.order_no
        if (order_no) {
            this.setData({
                order_no: order_no
            })
            wx.showLoading();
            this.queryOrderDetail(order_no)
        } else {
            wx.showModal({
                content: '缺少订单号',
                success: (res) => {
                    if (res.confirm) wx.navigateBack()
                }
            })
        }
        var that = this;


        wx.openBluetoothAdapter({
            success: function (res) {
                wx.showLoading({
                    title: '正在开启蓝牙适配器'
                })

                that.setData({
                    enabled: true,
                })
                wx.startBluetoothDevicesDiscovery({
                    //services: ['FFF0'],
                    success: function (res) {
                        wx.showLoading({
                            title: '正在开启蓝牙搜索'
                        })

                        that.setData({
                            discover: true
                        })


                    }
                })
            }
        })


        that.linkToBle()

    },


    back(){
        wx.navigateBack()
    },

    // 查询订单详情
    queryOrderDetail(order_no) {
        var token = wx.getStorageSync('user_token');
        var that = this;
        wx.request({
            url: config.GLOBAL.baseUrl + 'api/O2O/order/detail/' + order_no,
            header: {
                Authorization: token
            },
            success: res => {

                if (res.statusCode == 200) {
                    res = res.data;
                    if (res.status) {
                        that.setData({
                            order: res.data,
                            meta:res.meta
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

    onShow(){
        console.log('aaa')
        var that = this;

        wx.onBLEConnectionStateChanged(function (res) {
            that.setData({
                linked:res.connected
            })
            wx.hideLoading()

            if (!res.connected)
            wx.showModal({
                title:'蓝牙已断开,点击打印按钮重新连接'
            })
            console.log(`device ${res.deviceId} state has changed, connected: ${res.connected}`)
        })

        wx.onBluetoothAdapterStateChange(function (res) {
            that.setData({
                enabled:res.available,
                discover:res.discovering
            })

            if (!res.available && !res.discovering)  {

                wx.hideLoading();
                wx.showModal({
                    content:'请检查蓝牙是否开启'
                })
            }
            console.log(`adapterState changed, now is`, res)
        })



    },
    stopToStart(){
        var that = this;
        wx.stopBluetoothDevicesDiscovery({
            success: function (res) {
                console.warn('关闭蓝牙搜索')
                wx.closeBluetoothAdapter({
                    success: function (res) {
                        console.warn('关闭适配器')
                        var num = that.data.btDevices.length
                        that.data.btDevices.splice(0, num)
                        that.setData({
                            btDevices: that.data.btDevices
                        });
                        wx.openBluetoothAdapter({
                            success: function (res) {
                                wx.showLoading({
                                    title: '正在开启蓝牙适配器'
                                })
                                wx.startBluetoothDevicesDiscovery({
                                    //services: ['FFF0'],
                                    success: function (res) {
                                        wx.showLoading({
                                            title: '正在开启蓝牙搜索'
                                        })


                                    }
                                })
                            }
                        })
                    }
                })
            }
        })


    },
    print(){
        var that = this;
        if (this.data.linked ) {
            this.str2ab().then(res => {
                this.sliceData(res, 0)
            })
        } else {
            wx.showModal({
                content: '打印机未连接',
                success: (res) => {
                    if (res.confirm) {
                        that.stopToStart()
                        that.linkToBle()
                    }
                }
            })
        }

    },
    linkToBle(){
        var that = this;
        setTimeout(() => {

            wx.showLoading({
                title: '正在连接打印机'
            })
            wx.onBluetoothDeviceFound((devices) => {
                console.warn('开始搜寻蓝牙服务')
                console.warn(devices)

                // this.getBleDevices()
                if (devices.devices[0].name === 'MHT-80' || devices.devices[0].localName === 'MHT-80') {
                    that.getBleDevices()
                }

            })

            that.getBleDevices()
        }, 3000)
    },
    getBleDevices(){
        var that = this;
        if (!this.data.linked) {
            wx.getBluetoothDevices({
                success: (res) => {
                    var ln = 0;
                    if (that.data.btDevices.length != null) {
                        ln = that.data.btDevices.length;
                    }

                    for (var i = ln; i < res.devices.length; i++) {
                        if (res.devices[i].RSSI > 0 || res.devices[i].name == '未知设备') {
                            continue;
                        } else if (res.devices[i].name == 'MHT-80' || res.devices[i].localName == 'MHT-80') {
                            console.warn(res.devices[i])
                            var newBtDevice = {
                                rssi: res.devices[i].RSSI,
                                name: res.devices[i].name,
                                devId: res.devices[i].deviceId,
                            };

                            console.warn(newBtDevice)


                            wx.createBLEConnection({
                                // 这里的 btDevId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
                                deviceId: newBtDevice.devId,
                                success: function (res) {
                                    console.log(res)
                                    that.setData({
                                        linked: true
                                    })
                                    that.data.devId = newBtDevice.devId

                                    if (!that.data.writeCharacteristicId && !that.data.notifyCharacteristicId) {
                                        wx.getBLEDeviceServices({
                                            // 这里的 devId 需要在 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
                                            deviceId: that.data.devId,
                                            success: function (res) {
                                                console.log('device services:', res.services)
                                                // 保存已连接设备的服务
                                                for (var j = 0; j < res.services.length; ++j) {
                                                    var newService = [
                                                        res.services[j],
                                                    ]
                                                    that.data.services = that.data.services.concat(newService)
                                                    console.log(j, that.data.services.length, res.services.length)
                                                }
                                                that.setData({
                                                    services: that.data.services
                                                });

                                                // 寻找第一个Notify特征
                                                that.data.notifyServiceSearchIndex = 0
                                                that.data.notifyCharacteristicId = ''
                                                that.seekFirstNotifyCharacteristic()
                                            }
                                        })
                                    } else {
                                        wx.showToast({
                                            title:'打印机已连接'
                                        })
                                        wx.hideLoading()
                                        that.str2ab().then(res => {
                                            that.sliceData(res, 0)
                                        })
                                    }

                                }
                            })
                        }
                    }
                },
                fail: () => {
                    wx.hideLoading()
                    wx.showModal({
                        content: '获取蓝牙列表失败'
                    })
                }
            })
        } else {
            wx.showToast({
                title:'打印机已连接'
            })

            wx.hideLoading()
        }

    },
    seekFirstNotifyCharacteristic: function () {
        var that = this;

        if (that.data.notifyServiceSearchIndex < that.data.services.length && that.data.notifyCharacteristicId == '') {
            that.data.notifyServiceId = that.data.services[that.data.notifyServiceSearchIndex].uuid
            console.log('Search service index ', that.data.notifyServiceSearchIndex, 'service: ', that.data.notifyServiceId)
            ++that.data.notifyServiceSearchIndex;
            wx.getBLEDeviceCharacteristics({
                // 这里的 devId 需要在 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
                deviceId: that.data.devId,
                // 这里的 notifyServiceId 需要在 getBLEDeviceServices 接口中获取
                serviceId: that.data.notifyServiceId,
                complete: function () {
                    console.log('device getBLEDeviceCharacteristics complete', that.data.notifyServiceSearchIndex)
                    //递归调用自身直到找到notify特征或遍历完所有特征
                    that.seekFirstNotifyCharacteristic()
                },
                success: function (res) {
                    console.log('device getBLEDeviceCharacteristics:', res.characteristics)
                    for (var n = 0; n < res.characteristics.length && that.data.notifyCharacteristicId == ''; ++n) {
                        if (res.characteristics[n].properties.notify == true) {
                            console.log('device notify Characteristics found', n)
                            that.data.notifyCharacteristicId = res.characteristics[n].uuid
                            console.log('notify servcie:', that.data.notifyServiceId)
                            console.log('notify characteristic:', that.data.notifyCharacteristicId)
                            console.log('start notify')
                            wx.notifyBLECharacteristicValueChanged({
                                state: true, // 启用 notify 功能
                                // 这里的 devId 需要在 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
                                deviceId: that.data.devId,
                                // 这里的 notifyServiceId 需要在 getBLEDeviceServices 接口中获取
                                serviceId: that.data.notifyServiceId,
                                // 这里的 notifyCharacteristicId 需要在 getBLEDeviceCharacteristics 接口中获取
                                characteristicId: that.data.notifyCharacteristicId,
                                success: function (res) {
                                    console.log('notifyBLECharacteristicValueChanged success', res.errMsg)
                                    wx.showToast({
                                        title: '连接成功',
                                        icon: 'success',
                                        duration: 1000
                                    })
                                    wx.hideLoading()
                                    that.setData({
                                        currentConnectionState: '已连接'
                                    });

                                    // 寻找第一个write特征
                                    that.data.writeServiceSearchIndex = 0
                                    that.data.writeCharacteristicId = ''
                                    that.seekFirstWriteCharacteristic()

                                }
                            })
                        }
                    }
                },
                fail(){

                }
            })
        }
    },

    seekFirstWriteCharacteristic: function () {
        var that = this;

        if (that.data.writeServiceSearchIndex < that.data.services.length && that.data.writeCharacteristicId == '') {
            that.data.writeServiceId = that.data.services[that.data.writeServiceSearchIndex].uuid
            console.log('Search service index ', that.data.writeServiceSearchIndex, 'service: ', that.data.writeServiceId)
            ++that.data.writeServiceSearchIndex;
            wx.getBLEDeviceCharacteristics({
                // 这里的 devId 需要在 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
                deviceId: that.data.devId,
                // 这里的 writeServiceId 需要在 getBLEDeviceServices 接口中获取
                serviceId: that.data.writeServiceId,
                complete: function () {
                    console.log('device getBLEDeviceCharacteristics complete', that.data.writeServiceSearchIndex)
                    //递归调用自身直到找到write特征或遍历完所有特征
                    that.seekFirstWriteCharacteristic()
                },
                success: function (res) {
                    console.log('device getBLEDeviceCharacteristics:', res.characteristics)
                    for (var n = 0; n < res.characteristics.length && that.data.writeCharacteristicId == ''; ++n) {
                        if (res.characteristics[n].properties.write == true) {
                            console.log('device write Characteristics found', n)
                            that.data.writeCharacteristicId = res.characteristics[n].uuid
                            console.log('write servcie:', that.data.writeServiceId)
                            console.log('write characteristic:', that.data.writeCharacteristicId)
                        }
                    }





                },
                fail: () => {

                }
            })
        }
    },

    onUnload: function () {
        var that = this;
        wx.closeBLEConnection({
            deviceId: that.data.devId,
            success: function (res) {
                console.log(res)
            }
        })
    },
    str2ab: function () {
        var that = this;
        // var that = this;
        // var s = that.encode_utf8(str)
        // var buf = new ArrayBuffer(s.length);
        // var bufView = new Uint8Array(buf);
        // for (var i=0, strLen=s.length; i<strLen; i++) {
        // 	bufView[i] = s.charCodeAt(i);
        // }



        return new Promise((resolve, reject) => {

            console.log(that.data.order_no)
            wx.request({
                url: `${config.GLOBAL.baseUrl}/api/O2O/print`,
                method: 'GET',
                data: {
                    order_no: that.data.order_no
                },
                success: (res) => {
                    var arr = []

                    console.log(res)


                    Object.keys(res.data).forEach((v) => {
                        if (v !== 'logo' && v !== 'qrcode') {
                            res.data[v] = res.data[v].map((h) => {
                                return parseInt(h, 16)
                            })
                    }
                        arr.push(...res.data[v])
                    })



                    var typedArray = new Uint8Array(arr)

                    var buffer = typedArray.buffer

                    // var buffer1 = rawData.buffer
                    // var dv = new DataView(buffer)

                    resolve(buffer)

                }

            })
        })
        // return bufView;
    },
    writeCommondToBle(commonds, success, fail){
        var that = this;
        wx.writeBLECharacteristicValue({
            // 这里的 devId 需要在 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
            deviceId: that.data.devId,
            // 这里的 serviceId 需要在 getBLEDeviceServices 接口中获取
            serviceId: that.data.writeServiceId,
            // 这里的 writeCharacteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
            characteristicId: that.data.writeCharacteristicId,
            // 这里的value是ArrayBuffer类型
            value: commonds,
            success: function (res) {
                success && success();
            }
        })
    },

    sliceData (commond, index){
        var itemCmd, that = this;
        var isLast = false;
        if (commond.byteLength > index + 20) {
            itemCmd = commond.slice(index, index + 20)
        } else {
            isLast = true;
            itemCmd = commond.slice(index)
        }
        console.log(itemCmd.byteLength)
        this.writeCommondToBle(itemCmd, function () {
            setTimeout(function () {
                that.sliceData(commond, index + 20)
            }, 10)

        })
    },

})