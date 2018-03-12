import {
    is,
    sandBox,
    config
} from '../../../es6/myapp.js'

Page({

    data:{

    },



    onLoad(){
        console.log('Load Complete')
    },


    toLogin(){
        wx.redirectTo({
            url:'/pages/user/login/login'
        })
    }
})
