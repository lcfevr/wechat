/**
 * Created by admin on 2017/8/30.
 */
export default  {

    BRAND: {
        name: 'MIER',
    },
    GLOBAL: {
        baseUrl: process.env.NODE_ENV === 'development' ? 'https://o2o.dev.tnf.ibrand.cc/' : 'https://o2o.dev.tnf.ibrand.cc/', // 运行时自动替换变量
        client_id: '2',
        client_secret: 'sL8ybYt3DpoxfilP5I45goZ0bsLHEcKFHF9bbnVY',
    },
    PACKAGES: {
        activity: false
    },
    VERSION:'1.2'

}