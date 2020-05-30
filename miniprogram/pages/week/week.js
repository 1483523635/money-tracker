import { cache, getFromCache, weekNumberOptionsCacheKey } from '../component/lib/cacheUtils';
import { getToday, getWeekNumberOptions, isNil } from '../component/lib/lib';

Page({

    data: {
        week: null,
        weekDescription: '周账单',
        showActionSheet: true,
        groups: [
            'choice-day',
        ],
        weekNumberOptions: [],
        onlyMe: false,
        allItems: []
    },

    // eslint-disable-next-line no-unused-vars
    onLoad: function (options) {
        wx.showLoading({ title: '数据加载中' });
        const data = getFromCache(weekNumberOptionsCacheKey);
        if(isNil(data)){
            this.setData({
                weekNumberOptions: data
            });
            wx.hideLoading();
            return;
        }
        wx.cloud.callFunction({
            name: 'lib',
            data: { date: getToday() },
        }).then(res => res.result).then(res => {
            this.setData({
                weekNumberOptions: getWeekNumberOptions(res.weekNumber)
            });
            cache(weekNumberOptionsCacheKey, getWeekNumberOptions(res.weekNumber));
        }).then(() => {
            wx.hideLoading();
        });
    },
    onWeekSelect: function (e) {
        const selectedWeekNumber = this.data.weekNumberOptions[e.detail.value];
        this.setData({
            week: selectedWeekNumber,
            showActionSheet: false,
        });
        this.loadData(selectedWeekNumber);
    },
    closeActionSheet: function () {
        this.setData({
            showActionSheet: false,
        });
        wx.navigateBack({
            delta: -1
        });
    },
    onOnlyMeChange: function (e) {
        this.setData({
            onlyMe: e.detail.data.onlyMe,
        });
    },
    loadData: function (selectedWeekNumber) {
        wx.showLoading({ title: '数据加载中' });
        wx.cloud.callFunction({
            name: 'db',
            data: {
                type: 'week',
                date: selectedWeekNumber,
                onlyMe: this.data.onlyMe,
            }
        }).then(res => res.result).then(res => {
            this.setData({
                week: selectedWeekNumber,
                allItems: res.data
            });
        }).then(() => {
            wx.hideLoading();
        });
    }

});
