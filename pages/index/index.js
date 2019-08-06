const app = getApp()

Page({
  data: {
    // 用于分页的属性
    totalPage: 1,
    page: 1,
    videoList: [],
   
    screenWidth: 350,
    serverUrl: "",
    searchContent: "",
  },

  onLoad: function(params) {
    // debugger;
    console.log(params)
    var that = this;
    var screenWidth = wx.getSystemInfoSync().screenWidth;
    var isSaveRecord=null;
    that.setData({
      screenWidth: screenWidth,
    });
    if (params.search != null && params.search != '' && params.search != undefined){
      var searchContent = params.search;
       isSaveRecord = params.isSaveRecord;
      if (isSaveRecord == null || isSaveRecord == '' || isSaveRecord == undefined) {
        isSaveRecord = 0;
      }
      that.setData({
        searchContent: searchContent
      });
      // 获取当前的分页数
      var page = that.data.page;
      that.getAllVideoList(page, isSaveRecord);
    }else{
      var page = that.data.page;
      isSaveRecord = 0;
      that.getAllVideoList(page, isSaveRecord);
    }
   
  },
  getAllVideoList: function(page, isSaveRecord) {
    var that = this;
    var serverUrl = app.serverUrl;
    wx.showLoading({
      title: '请等待，加载中...',
    });

    var searchContent = that.data.searchContent;
    console.log(searchContent);
    if (isSaveRecord == 1) {
      wx.request({
        url: serverUrl + 'video/queryByDesc?videoDesc=' + searchContent + '&isSaveRecord=' + isSaveRecord,
        method: "POST",
        success: function(res) {
          wx.hideLoading();
          wx.hideNavigationBarLoading();
          wx.stopPullDownRefresh();

          console.log(res.data);

          // 判断当前页page是否是第一页，如果是第一页，那么设置videoList为空
          if (page === 1) {
            that.setData({
              videoList: []
            });
          }
          console.log(res.data.data)
          var videoList = res.data.data.rows;
          var newVideoList = that.data.videoList;

          that.setData({
            videoList: newVideoList.concat(videoList),
            page: page,
            totalPage: res.data.data.total,
            serverUrl: serverUrl
          });

        }
      })
    } else if (isSaveRecord == 0){
      // debugger;
      wx.request({
        url: serverUrl + '/video/query',
        method: "POST",
        success: function(res) {
          wx.hideLoading();
          wx.hideNavigationBarLoading();
          wx.stopPullDownRefresh();

          console.log(res.data);

          // 判断当前页page是否是第一页，如果是第一页，那么设置videoList为空
          if (page === 1) {
            that.setData({
              videoList: []
            });
          }

          var videoList = res.data.data.rows;
          var newVideoList = that.data.videoList;
          var size = res.data.data.total
          console.log(size)
          console.log(app.getGlobalUserInfo())
          if (size ==0) {
            wx.showToast({
              title: '目前暂无视频',
              icon: 'none',
              duration: 3000,
             
            })
            if (app.getGlobalUserInfo() == null || app.getGlobalUserInfo() == "" || app.getGlobalUserInfo()==undefined) {
              wx.redirectTo({
                url: '../userLogin/login',
              })
            } else {
              wx.redirectTo({
                url: '../mine/mine',
              })
            }
           
          }
          that.setData({
            videoList: newVideoList.concat(videoList),
            page: page,
            totalPage: res.data.data.total,
            serverUrl: serverUrl
          });
        }
      })
    }
  },

  onPullDownRefresh: function() {
    wx.showNavigationBarLoading();
    this.getAllVideoList(1, 0);
  },

  onReachBottom: function() {
    var that = this;
    var currentPage = that.data.page;
    var totalPage = that.data.totalPage;

    // 判断当前页数和总页数是否相等，如果想的则无需查询
    if (currentPage === totalPage) {
      wx.showToast({
        title: '已经没有视频啦~~',
        icon: "none"
      })
      return;
    }

    var page = currentPage + 1;

    that.getAllVideoList(page, 0);
  },

  showVideoInfo: function(e) {
    var that = this;
    var videoList = that.data.videoList;
    var arrindex = e.target.dataset.arrindex;
    var videoInfo = JSON.stringify(videoList[arrindex]);

    wx.redirectTo({
      url: '../videoinfo/videoinfo?videoInfo=' + videoInfo
    })
  }
})