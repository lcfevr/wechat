import {is,config,sandBox} from '../../../es6/myapp.js';
Page({
	data: {
		disabled: true,
		username:"",
		password:"",
        checked:false,
        autoChecked:true,
        message:"",
        showLoading: false,
        loginText:"登录"
	},
	changeUsername(e){
		this.setData({
            username:e.detail.value
		});
	},
    changePassword(e){
        this.setData({
            password:e.detail.value
        });
	},
    changeChecked(e){
        // console.log(e);
        this.setData({
            checked:!this.data.checked
        })
    },
    changeAutoChecked(e){
        this.setData({
            autoChecked:!this.data.autoChecked
        })
    },
    onShow(){
        if(wx.getStorageSync("username")){
            this.setData({
                username:wx.getStorageSync("username")
            });
            if(wx.getStorageSync("password")){
                this.setData({
                    password:wx.getStorageSync("password")
                });
                this.setData({
                    checked:true
                });
                // 执行自动登录
                this.setData({
                    loginText:"自动登录中...."
                });
                this.submit();
            }
        }

    },
    submit(){
        var message=null;
        if(!is.has(this.data.username)){
            message = "请输入您的账号";
        } else if(!is.has(this.data.password)){
            message = '请输入您的密码';
        } else if(!is.has(this.data.checked)){
            message="请同意此协议";
        }
        if(message){
            this.setData({
                message:message
            });
            setTimeout(()=>{
                this.setData({
                    message:""
                });
            },3000)
            return
        }
        this.setData({
            showLoading: true
        });
        setTimeout(()=>{
            this.quickLogin();
        },1000)

    },
    jump(e){
        wx.navigateTo({
            url: '/pages/user/reset/reset'
        })
        // sandBox.post({
        //     api: 'api/mini/program/login',
        //     data: {
        //         code: code
        //     },
        // }).then(res=>{
        //     console.log(res);
        // })
    },
    quickLogin(){
        var data={
            username:this.data.username,
            password:this.data.password
        }
        sandBox.post({
            api:"api/O2O/login",
            data:data,
        }).then(res=>{
            console.log(res);
            if(res.statusCode!=200){
                wx.showModal({
                    title:"提示",
                    content:res.data.message || '登录失败'
                });
            }
            else if(res.statusCode==200){
                var result=res.data.data;
                if(this.data.autoChecked){
                    wx.setStorageSync("username",this.data.username);
                    wx.setStorageSync("password",this.data.password);
                }
                else{
                    wx.removeStorageSync("username");
                    wx.removeStorageSync("password");
                }
                if(result.access_token){
                    result.access_token =result.token_type + ' ' + result.access_token;
                    wx.setStorageSync("user_token",result.access_token);
                        wx.switchTab({
                            url: '/pages/user/index/index'
                        })

                }
            }
            this.setData({
                showLoading: false
            });
            this.setData({
                loginText:"登录"
            })
            // if(res.statusCode==500){

            // }
            // console.log(res);
        }).catch(rej =>{
            wx.showModal({
                title:"提示",
                content:"用户不存在"
            });
            this.setData({
                showLoading: false
            })
        });
    }
})