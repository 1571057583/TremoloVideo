const app = getApp()

Page({
   data :{

   },
  doRegist:function(e){
    var userInfo = e.detail.value;
    var username = userInfo.username;
    var password = userInfo.password;
    var serverUrl = app.serverUrl;

    if(username.length ==0||password.length==0){
      wx.showToast({
        title: '账号密码不能为空',
        icon: '',
        duration: 3000,
      })
    }else{
      wx.showLoading({
        title: '注册中',
      })
      wx.request({
        url: serverUrl + '/regist',
        method: "POST",
        data: {
          username: username,
          password: password
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
          console.log(res.data);
          wx.hideLoading();
          var status = res.data.status;
          if (status == 200) {
            wx.showToast({
              title: "用户注册成功~！！！",
              icon: 'none',
              duration: 3000
            }), 
          
              // app.userInfo = res.data.data;
              // // fixme 修改原有的全局对象为本地缓存
              app.setGlobalUserInfo(res.data.data);
            // 页面跳转
            wx.redirectTo({
              url: '../userLogin/login',
            })
          } else if (status == 500) {
            wx.showToast({
              title: res.data.msg,
              icon: 'none',
              duration: 3000
            })
          }
        }
      })
    }
  },
goLoginPage:function(){
  wx.redirectTo({
    url: '../../pages/userLogin/login',
  })
}

})