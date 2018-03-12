import {is,config,sandBox} from '../../../es6/myapp.js';
Page({
	data:{

    },


    onLoad(){
	    console.log('Load complete')
    },

    toIndex(){
	    wx.redirectTo({
            url:'/pages/user/index/index'
        })
    }
})