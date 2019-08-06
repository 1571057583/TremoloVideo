// pages/videoinfo/videoinfo.js
var videoUtil = require('../../utils/videoUtil.js')
var app = getApp();
Page({
  data: {
    videoId:null,
    src:null,
    videoInfo:{},
    cover:"cover",
    userLikeVideo:false,
    showPublisher:null,
    commentsList: [],
    serverUrl: app.serverUrl
  },
  videoCtx:{},
  /**
   * 生命周期函数--监听页面加载
   */
    onLoad: function (options) {
      var that = this;
      var videoInfo = JSON.parse(options.videoInfo);
      console.log(videoInfo)
      that.videoCtx = wx.createVideoContext("myVideo", that);
      var height = videoInfo.videoHeight;
      var width = videoInfo.videoWidth;
      var cover = "cover";
      if(height>=width){
        cover="";
      }
      that.setData({
        videoId: videoInfo.id,
        src: app.serverUrl + videoInfo.videoPath,
        videoInfo: videoInfo,
        cover:cover
      });
      var user = app.getGlobalUserInfo();
      var serverUrl = app.serverUrl;
      wx.showLoading({
        title: '...',
      })
      wx.request({
        url: serverUrl + "user/queryPublisher?loginUserId=" + user.id + "&videoId=" +
                           videoInfo.id + "&publishUserId=" + videoInfo.userId,
        method: 'POST',
        success: function (res) {
          wx.hideLoading();
          console.log(res)
          var data = res.data.data;
          var userLikeVideo = data.userLikeVideo;
          var faceImage = data.usersVO.faceImage;
          console.log(serverUrl + faceImage) 
          that.setData({
            userLikeVideo: userLikeVideo,
            showPublisher: serverUrl + faceImage,
          });
        }
      })
      that.getCommentsList(1);
  },
    onShow: function (options) {
      var that = this;
      that.videoCtx.play();
  },
  onHide: function (options) {
    var that = this;
    that.videoCtx.pause();
  },
  showSearch:function(){
    wx.navigateTo({
      url: '../../pages/searchVideo/searchVideo',
     
    })
  },
  showPublisher:function(){
    var that = this;
    var user = app.getGlobalUserInfo();

    var videoInfo = that.data.videoInfo;
    var realUrl = '../mine/mine#publisherId@' + videoInfo.userId;

    if (user == null || user == undefined || user == '') {
      wx.navigateTo({
        url: '../userLogin/login?redirectUrl=' + realUrl,
      })
    } else {
      wx.navigateTo({
        url: '../mine/mine?publisherId=' + videoInfo.userId,
      })
    }
  },
  /**
   * 上传视频
   */
  upload: function () {
    var that = this;

    var user = app.getGlobalUserInfo();

    var videoInfo = JSON.stringify(that.data.videoInfo);
    var realUrl = '../videoinfo/videoinfo#videoInfo@' + videoInfo;

    if (user == null || user == undefined || user == '') {
      wx.navigateTo({
        url: '../userLogin/login?redirectUrl=' + realUrl,
      })
    } else {
      videoUtil.uploadVideo();
    }
  },
  showIndex:function(){
    wx.redirectTo({
      url: '../index/index',
    })
  },
  showMine:function(){
    var user = app.getGlobalUserInfo();
    if(user==null||user==""||user==undefined){
      wx.redirectTo({
        url: '../userLogin/login',
      })
    }else{
      wx.navigateTo({
        url: '../mine/mine',
      })
    }
  },
  likeVideoOrNot:function(){
    var that = this;
    var videoInfo= that.data.videoInfo
    var user = app.getGlobalUserInfo();
    if (user == null || user == "" || user == undefined) {
      wx.redirectTo({
        url: '../userLogin/login',
      })
    } else {
      var userLikeVideo = that.data.userLikeVideo;
      var url = '/video/userLikeVideo?userId=' + user.id + '&videoId=' + videoInfo.id + '&videoCreaterId=' + videoInfo.userId;
      if (userLikeVideo) {
        url = '/video/userUnLikeVideo?userId=' + user.id + '&videoId=' + videoInfo.id + '&videoCreaterId=' + videoInfo.userId;
      }
      var serverUrl = app.serverUrl;
      wx.showLoading({
        title: '...',
      })
      wx.request({
        url: serverUrl + url,
        method: 'POST',
        header: {
          'content-type': 'application/json', // 默认值
          'headerUserId': user.id,
          'headerUserToken': user.userToken
        },
        success: function (res) {
          wx.hideLoading();
          that.setData({
            userLikeVideo: !userLikeVideo
          });
        }
      })
    }
  },
  shareMe: function () {
    var that = this;
    var user = app.getGlobalUserInfo();

    wx.showActionSheet({
      itemList: ['下载到本地', '举报用户', '分享到朋友圈', '分享到QQ空间', '分享到微博'],
      success: function (res) {
        console.log(res.tapIndex);
        if (res.tapIndex == 0) {
          // 下载
          wx.showLoading({
            title: '下载中...',
          })
          wx.downloadFile({
            url: app.serverUrl + that.data.videoInfo.videoPath,
            success: function (res) {
              if (res.statusCode === 200) {
                console.log(res.tempFilePath);

                wx.saveVideoToPhotosAlbum({
                  filePath: res.tempFilePath,
                  success: function (res) {
                    console.log(res.errMsg)
                    wx.hideLoading();
                  }
                })
              }
            }
          })
        } else if (res.tapIndex == 1) {
          // 举报
          var videoInfo = JSON.stringify(that.data.videoInfo);
          var realUrl = '../videoinfo/videoinfo#videoInfo@' + videoInfo;

          if (user == null || user == undefined || user == '') {
            wx.navigateTo({
              url: '../userLogin/login?redirectUrl=' + realUrl,
            })
          } else {
            var publishUserId = that.data.videoInfo.userId;
            var videoId = that.data.videoInfo.id;
            var currentUserId = user.id;
            wx.navigateTo({
              url: '../report/report?videoId=' + videoId + "&publishUserId=" + publishUserId
            })
          }
        } else {
          wx.showToast({
            title: '官方暂未开放...',
          })
        }
      }
    })
  },
  onShareAppMessage: function (res) {
      var that = this;
      var videoInfo = that.data.videoInfo;
    
    return {
      title: '短视频分享',
      path: 'pages/videoinfo/videoinfo?videoInfo=' + videoInfo
    }
  },
  
  leaveComment: function () {
    this.setData({
      commentFocus: true
    });
  },

  saveComment: function (e) {
    var that = this;
    var content = e.detail.value;

    // 获取评论回复的fatherCommentId和toUserId
    var fatherCommentId = e.currentTarget.dataset.replyfathercommentid;
    var toUserId = e.currentTarget.dataset.replytouserid;

    var user = app.getGlobalUserInfo();
    var videoInfo = JSON.stringify(that.data.videoInfo);
    var realUrl = '../videoinfo/videoinfo#videoInfo@' + videoInfo;

    if (user == null || user == undefined || user == '') {
      wx.navigateTo({
        url: '../userLogin/login?redirectUrl=' + realUrl,
      })
    } else {
      wx.showLoading({
        title: '请稍后...',
      })
      wx.request({
        url: app.serverUrl + '/video/saveComment?fatherCommentId=' + fatherCommentId + "&toUserId=" + toUserId,
        method: 'POST',
        header: {
          'content-type': 'application/json', // 默认值
          'headerUserId': user.id,
          'headerUserToken': user.userToken
        },
        data: {
          fromUserId: user.id,
          videoId: that.data.videoInfo.id,
          comment: content
        },
        success: function (res) {
          console.log(res.data)
          wx.hideLoading();

          that.setData({
            contentValue: "",
            commentsList: []
          });

          that.getCommentsList(1);
        }
      })
    }
  },
  getCommentsList: function (page) {
    // debugger;
    var that = this;

    var videoId = that.data.videoInfo.id;

    wx.request({
      url: app.serverUrl + '/video/getAllComments?videoId=' + videoId + "&page=" + page + "&pageSize=5",
      method: "POST",
      success: function (res) {
        console.log(res.data);

        var commentsList = res.data.data.rows;
        var newCommentsList = that.data.commentsList;

        that.setData({
          commentsList: newCommentsList.concat(commentsList),
          commentsPage: page,
          commentsTotalPage: res.data.data.total,
        });
      }
    })
  },

  onReachBottom: function () {
    var that = this;
    var currentPage = that.data.commentsPage;
    var totalPage = that.data.commentsTotalPage;
    console.log(111)
    if (currentPage === totalPage) {
      return;
    }
    var page = currentPage + 1;
    that.getCommentsList(page);
   

  }
 
})