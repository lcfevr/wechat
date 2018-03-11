import {is,config,sandBox} from '../../../es6/myapp.js';
Page({
    data:{
        tellphone:"",
        identifyingcode:"",
        password:"",
        confirmpassword:"",
        message:"",
        sending:false,
        code:{
            total:60,
            access_token:null,
            codeText:"获取验证码"
        }
    },
    changeTellphone(e){
        this.setData({
            tellphone:e.detail.value
        });
    },
    changeCode(e){
        this.setData({
            identifyingcode:e.detail.value
        });
    },
    changePassword(e){
        this.setData({
            password:e.detail.value
        });
    },
    changeConfirmpassword(e){
        this.setData({
            confirmpassword:e.detail.value
        });
    },
    random(){
        return Math.random().toString(36).substr(2,24);
    },
    getCode(){
        if(this.data.sending) return;
        var randoms=this.random();
        this.setData({
            sending:true,
            'code.codeText':"短信发送中",
            'code.access_token':randoms
        });
        var fn;
        fn=this.getResetCode;
        fn(()=>{
            var total =this.data.code.total;
            this.setData({
                'code.codeText':total+"秒后再发送"
            });
            var timer =setInterval(()=>{
                total--;
                this.setData({
                    'code.codeText':total+"秒后再发送"
                });
                if(total<1){
                    this.setData({
                        sending:false,
                        'code.codeText':"获取验证码"
                    });
                    clearInterval(timer);
                }
            },1000);
        },()=>{
            this.setData({
                sending:false,
                'code.codeText':"获取验证码"
            });
        });
    },
    getResetCode(resolve,reject){
        var message=null;
        if(!is.has(this.data.tellphone)){
            message = "请输入您的手机号";
        } else if(!is.mobile(this.data.tellphone)){
            message = '手机号格式不正确，请重新输入';
        }
        if(message){
            this.setData({
                message:message
            });
            reject();
            setTimeout(()=>{
                this.setData({
                    message:""
                });
            },3000)
            return
        }
        sandBox.post({
            api:"api/sms/verify-code",

            data:{
                mobile:this.data.tellphone,
                access_token:this.data.code.access_token
            },
        }).then(res =>{
            if(res.data.success){
                resolve();
            }
            else{
                reject();
            }
        })
    },
    submit(){
        var message=null;
        if(!is.has(this.data.tellphone)){
            message="请输入您的手机号";
        }
        else if(!is.mobile(this.data.tellphone)){
            message = '手机号格式不正确，请重新输入';
        }
        else if(!is.has(this.data.identifyingcode)){
            message="请输入短信验证码";
        }
        else if(!is.has(this.data.password)){
            message="请输入您的重置密码";
        }
        else if(!is.has(this.data.confirmpassword)){
            message="请再次输入您的重置密码";
        }
        else if(this.data.password!=this.data.confirmpassword){
            message="两次输入的密码不正确";
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
        sandBox.post({
            api:"api/O2O/clerk/update/pwd",
            data:{
                mobile:this.data.tellphone,
                code:this.data.identifyingcode,
                access_token:this.data.code.access_token,
                password:this.data.password
            }
        }).then(res=>{
            console.log(res.data);
            if(res.data.code==200){
                wx.showToast({
                    title: res.data.message,
                    duration: 1500,
                    success: () => {
                        wx.removeStorageSync('user_token');
                        wx.removeStorageSync('username');
                        wx.removeStorageSync('password');
                        setTimeout(() => {
                            wx.redirectTo({
                                url: '/pages/user/login/login'
                            })
                        }, 1500);
                    }
                });
            }
            else{
                wx.showModal({
                    title:"提示",
                    content:"用户不存在或验证码错误"
                });
            }
        })
    }
})