/**
 * Created by admin on 2018/1/16.
 */
import Animation from '../../../utils/animation.js'
import {config, sandBox} from '../../../lib/myapp.js'
Page({
    data:{
        show_select:true,
        type:'buy',
        member:null,
        initScore:0,
        initAmount:0,
        category:[
            {
               type:'clerk_balance_recharge',
                text:'充值'
            },
            {
                type:'clerk_balance_consumption',
                text:'购物'
            },
            {
                type:'clerk_balance_other',
                text:'其他'
            },
        ],

        currentData:{
            type:'clerk_balance_consumption',
            text:'购物',
            note:'',
            value:'',
            user_id:''
        }
    },

    showSelect(){
        this.setData({
            show_select:false
        })

        var animation = new Animation('show');
        animation.actionShow()

        new Animation('black').show()
    },

    closeSelect(){
        var animation = new Animation('show');
        new Animation('black').hide()
        animation.up().then(() => {
            this.setData({
                show_select: true,

            })
        })
    },

    selectType(e){
        var item = e.currentTarget.dataset.item
        var category = this.data.category

        var text = category.filter(v => v.type === item)
        this.setData({

            'currentData.type':item,
            'currentData.text':text[0].text
        })


        this.closeSelect()
    },


    onLoad(e){
        var type = e.type
        var member = wx.getStorageSync('select_member')

        console.log(type,member)
        if (!type) {
            wx.showToast({
                title:'缺少必要参数'
            })
        }

        if(!member) {
            var route = getCurrentPages()[getCurrentPages().length - 1].route
            wx.navigateTo({
                url: `/pages/member/list/list?url=${route}&tag=${type}`
            })

            return;
        }

        this.setData({
            type:type || 'buy',
            member:!!member ? member : null,
        })

    },

    onShow(){
        this.init()
    },
    init(){
        var type = this.data.type
        var oauth = wx.getStorageSync('user_token')
        wx.showLoading()
        sandBox.get({
            api:type === 'score' ? 'api/O2O/point/opPointBase' : 'api/O2O/balance/opBalanceBase',
            data:{
                user_id:this.data.member.user_bind.user.id
            },
            header: {Authorization: oauth}

        }).then(res =>{
            res = res.data
            if (res.code == 200) {
                var data = this.data.currentData
                if (this.data.type === 'score') {

                    data.value = Number(res.data.point)
                    this.setData({
                        initScore:Number(res.data.point),
                        currentData:data
                    })
                } else {
                    data.value = Number(res.data.balance)
                    this.setData({
                        initAmount:Number(res.data.balance),
                        currentData:data
                    })
                }

            }
            wx.hideLoading()
        }).catch(()=>{
            wx.showModal({
                content:'服务器错误',
                showCancel:false
            })
            wx.hideLoading()
        })
    },
    changevalue(e){
        var value = e.detail.value;
        if (!isNaN(value)) {
            this.setData({
                'currentData.value':value
            })
        } else {
            this.setData({
                'currentData.value':0
            })
        }
    },
    changeNote(e){
        var value = e.detail.value;
        this.setData({
            'currentData.note':value
        })
    },
    submit (){
        var oauth = wx.getStorageSync('user_token')
        var data = this.data.currentData
        wx.showLoading()
        sandBox.post({
            api:this.data.type === 'score' ? 'api/O2O/point/handlePoint' : 'api/O2O/balance/handleBalance',
            data:this.data.type === 'score' ? {
                value:data.value,
                user_id:this.data.member.user_bind.user.id,
                type:data.type,
                note:data.note
            } : {
                amount:data.value,
                user_id:this.data.member.user_bind.user.id,
                type:data.type,
                note:data.note
            },
            header: {Authorization: oauth}

        }).then(res =>{
            wx.hideLoading()
            res = res.data
            if (res.code === 200) {
                wx.showToast({
                    title:'修改成功'
                })
                this.init()

            } else {
                wx.showToast({
                    title:'修改失败'
                })
            }
        }).catch(()=>{
            wx.hideLoading()
            wx.showToast({
                title:'修改失败'
            })
        })
    }
})