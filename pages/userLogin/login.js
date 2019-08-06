// pages/userLogin/login.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    redirectUrl:null,
  },
  onLoad:function(e){
    var that = this;
    var redirectUrl = e.redirectUrl;
    if (redirectUrl != null && redirectUrl != undefined && redirectUrl != '') {
      redirectUrl = redirectUrl.replace(/#/g, "?");
      redirectUrl = redirectUrl.replace(/@/g, "=");
      that.redirectUrl = redirectUrl;
    }
    that.setData({
      redirectUrl: redirectUrl
    });
  },
  doLogin:function(e){
      var that = this;
      var userInfo = e.detail.value;
      var username = userInfo.username;
      var password = userInfo.password;

      var serverUrl = app.serverUrl;
    wx.showLoading({
      title: '登录中',
    })
    wx.request({
      url: serverUrl + 'login',
      method: "POST",
      data: {
        username: username,
        password: password
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        wx.hideLoading();
        var status = res.data.status;
        if (status == 200) {
          wx.showToast({
            title: "用户登录成功~！！！",
            icon: 'none',
            duration: 3000
          });
          // app.userInfo = res.data.data;
          // console.log(app.userInfo)
          // // fixme 修改原有的全局对象为本地缓存
          app.setGlobalUserInfo(res.data.data);
          // 页面跳转
          var redirectUrl = that.redirectUrl;
          if (redirectUrl != null && redirectUrl != undefined && redirectUrl != '') {
            wx.redirectTo({
              url: redirectUrl,
            })
          } else {
            wx.redirectTo({
              url: '../mine/mine',
            })
          }
        } else if (status == 500) {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 3000
          })
        }
      }
    }) 
  },
  goRegistPage:function(e){
    wx.redirectTo({
      url: '../../pages/userRegist/regist',
    })
  }


})