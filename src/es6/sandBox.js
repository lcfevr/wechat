/**
 * Created by admin on 2017/8/30.
 */
// import weapp from 'weapp-next'
import config from './config'
// const {Http} = weapp(wx);
// const http = Http(config.GLOBAL.baseUrl);
export const sandBox = {

    get({api, data, header}){

        return new Promise((resolve, reject) => {

            wx.request({
                url:`${config.GLOBAL.baseUrl}${api}`,
                header:header,
                data:data,
                method:'GET',
                success:res => {

                    sandBox.error(res).then(()=>{

                        resolve(res)
                    })

                },
                fail:() => {

                    reject()
                }
            })
        })
    },
    post({api, data, header}){
        return new Promise((resolve, reject) => {

            wx.request({
                url:`${config.GLOBAL.baseUrl}${api}`,
                data:data,
                header:header,
                method:'POST',
                success:res => {

                    sandBox.error(res).then(()=>{
                        resolve(res)
                    })
                },
                fail:rej => {

                    reject(rej)
                }
            })
        })
    },
    error(res){
        return new Promise((resolve,reject)=>{
            var url = getCurrentPages()[getCurrentPages().length - 1].route
            if (res.data.message === 'Unauthenticated.') {
                wx.hideLoading();
                wx.removeStorageSync('user_token');
                wx.showModal({
                    content:'请重新登录',
                    duration:1500,
                    success:(res)=>{
                        if (res.confirm) {
                            wx.navigateTo({
                                url:`/pages/user/login/login?url=${url}`
                            })
                            return;
                        }
                    },
                    cancel:()=>{
                        wx.navigateTo({
                            url:`/pages/user/login/login?url=${url}`
                        })
                        return;
                    }
                })
                reject()
                return
            }

            resolve();
            return
        })

    },
    ajax({api, data, method, header}) {
        return new Promise((resolve,reject) => {
            wx.request({
                url:`${config.GLOBAL.baseUrl}${api}`,
                data,
                header,
                method:method.toUpperCase(),
                success:res => {

                    sandBox.error(res).then(()=>{
                        resolve(res)
                    })
                },
                fail:rej => {
                    reject(rej)
                }
            })
        })
    },
    uploadFile({api,filePath,header,name}){
        return new Promise((resolve,reject) =>{
            wx.uploadFile({
                url:`${config.GLOBAL.baseUrl}${api}`,
                header,
                filePath,
                name,
                success:res => {
                    resolve(res)
                },
                fail:rej => {
                    reject(rej)
                }
            })
        })
    },
    APIs: {

    }
};