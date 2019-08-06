// pages/chooseBgm/chooseBgm.js
const app = getApp()

Page({
  data: {
    video: {},
    serverUrl:null,
    bgmList:[],
  },
  onLoad: function (e) {
    
    var serverUrl = app.serverUrl;
    var that = this;
    that.setData({
      video:e
    })
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: serverUrl + 'bgm/queryBgm',
      method: 'POST',
      success: function (res) {
        wx.hideLoading();
        var bgmList = res.data.data;
        that.setData({
          bgmList: bgmList,
          serverUrl: serverUrl,
        })
        
      },
    })

  },
  upload :function(e){
    var that = this;
    var serverUrl = app.serverUrl;
    var bgmId = e.detail.value.bgmId;
    var desc = e.detail.value.desc;
    var duration= that.data.video.duration;
    var height = that.data.video.height;
    var width = that.data.video.width;
    var tempVideoUrl = that.data.video.tempVideoUrl;
    var tempColorUrl = that.data.video.tempColorUrl;
    console.log(e.detail.value)
    //上传视频
    wx.showLoading({
      title: '上传作品中...',
    })
    wx.uploadFile({
      url: serverUrl + 'video/upload',
      filePath: tempVideoUrl,
      formData: {
        userId: app.getGlobalUserInfo().id,  
        bgmId: bgmId,
        desc: desc,
        videoSeconds: duration,
        videoHeight: height,
        videoWidth: width
      },
      name: 'file',
      success(res) {
        wx.hideLoading();
        var data = JSON.parse(res.data);
        var status = data.status;
        if (status == 200) {
          wx.showToast({
            title: '上传成功',
            icon: 'success',
          })
          wx.redirectTo({
            url: '../index/index',
          })
        } else if (status == 500) {
          wx.showToast({
            title: data.msg,
            icon: 'error',
          })
        }
        console.log(data)
        that.setData({
          faceUrl: serverUrl + data.data
        });
      }
    })
  }

  
})

