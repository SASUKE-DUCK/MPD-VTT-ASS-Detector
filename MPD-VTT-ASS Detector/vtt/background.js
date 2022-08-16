// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var currentTab = null;

// Set batch mode to false when startin extension
chrome.storage.sync.set({batchMode: false}, function() {});
chrome.storage.sync.set({tabs: {}}, function() {});

function saveURL(url){
  chrome.storage.sync.get(['batchMode', 'urls'], function(data) {
    if(data.batchMode){
      let urls = [];
      if(data.urls) urls = data.urls;
      urls.push(url);
      chrome.storage.sync.set({urls: urls}, function() {});
    }
  });
  chrome.storage.sync.set({lastUrl: url}, function() {});
}

var saveMpd = function(details) {
  var url = details.url;
  if(url.includes('.vtt')){
    saveURL(url);
    //Save that url is saved for this tab
    chrome.storage.sync.get(['tabs', 'batchMode'], function(data) {
      let tabs = data.tabs;
      let tabId = details.tabId;
      if(data.batchMode) tabs[tabId] = true;
      else tabs = {[tabId]: true};
      chrome.storage.sync.set({tabs: tabs}, function() {
        updateBadge();
      });
    });
  }
};

chrome.webRequest.onBeforeRequest.addListener(saveMpd, {urls: ["<all_urls>"]}, []);

function updateBadge() {
  chrome.storage.sync.get(['tabs', 'batchMode'], function(data) {
    let color = "rgb(66,133,244)";
    if(data.batchMode){
      if(data.tabs[currentTab]) color = "green";
      else color = "red";
    } else if(data.tabs[currentTab]) {
      chrome.browserAction.setBadgeText({text: '.MPD'});
    } else {
      chrome.browserAction.setBadgeText({text: ''});
    }
    chrome.browserAction.setBadgeBackgroundColor({color: color});
  });
};

// Listen for reloading pages
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if(changeInfo.status == "loading"){
    chrome.storage.sync.get('tabs', function(data) {
      let tabs = data.tabs;
      tabs[tabId] = false;
      chrome.storage.sync.set({tabs: tabs}, function() {
        updateBadge();
      });
    });
  }
});

// Listen for changing tabs
chrome.tabs.onActivated.addListener(function(activeInfo) {
  currentTab = activeInfo.tabId;
  updateBadge();
});