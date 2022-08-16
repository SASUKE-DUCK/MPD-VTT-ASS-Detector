// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

function showLastUrl(){
  chrome.storage.sync.get('lastUrl', function(data) {
      let url = "";
      if(data.lastUrl) url = data.lastUrl;
      document.getElementById("last_mpd").value = url;
  });
};

function showURLS(){
  chrome.storage.sync.get('urls', function(data) {
    let separator = document.getElementById("separator").value;
    let urls = data.urls;
    document.getElementById("urls").value = urls.join(separator);
  });
};

document.getElementById("batch_mode").addEventListener("change", function(){
  setBatchMode(this.checked);
  // Update menu after change
  updateMenu();
});

document.getElementById("separator").addEventListener("input", function(){
  // Show the URLS again with the new separator
  showURLS();
});


function updateMenu(){
  chrome.storage.sync.get('batchMode', function(data) {
    let batchMode = false;
    if(data.batchMode) batchMode = data.batchMode;
    if(batchMode) {
      document.getElementById("batch_settings").style.display = "block";
      showURLS();
    } else {
      document.getElementById("batch_settings").style.display = "none";
    }
    document.getElementById("batch_mode").checked = batchMode;
  });
}

function setBatchMode(batchMode){
  if(batchMode){
    chrome.browserAction.setBadgeText({text: 'BATCH'});
    chrome.browserAction.setBadgeBackgroundColor({color: "red"});

  } else {
    chrome.browserAction.setBadgeText({text: ''});
    chrome.storage.sync.set({urls: []}, function() {});
  } 
  chrome.storage.sync.set({batchMode: batchMode}, function() {});
  chrome.storage.sync.set({tabs: {}}, function() {});
}

showLastUrl();
updateMenu();