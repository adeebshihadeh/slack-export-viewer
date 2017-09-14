var metadata;
var files = {};

function downloadFile(file) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(translateFile(files[file])));
  element.setAttribute('download', file.replace(".json", ".txt"));

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function downloadFiles() {
  for (file in files) {
    downloadFile(file);
  }
}

function translateFile(json) {
  var json = JSON.parse(json);
  json.messages.reverse();

  var out = "";

  for (line in json.messages) {
    var date = new Date(json.messages[line].ts * 1000);
    date.setTime(json.messages[line].ts * 1000);
    var utcDate = new Date(date.toUTCString());
    utcDate.setHours(utcDate.getHours()-8);

    out += metadata.users[json.messages[line].user] + " " + new Date(utcDate) + " " + json.messages[line].text + "\n";
  }
  return out;
}

function addFile(file) {
  var reader = new FileReader();

  reader.onload = (function(theFile) {
    return function(e) {
      files[file.name] = e.target.result;
      updateTables();
    };
  })(file);

  reader.readAsText(file);
}

function addMetadata(file) {
  var reader = new FileReader();

  reader.onload = (function(theFile) {
    return function(e) {
      metadata = JSON.parse(e.target.result);
    };
  })(file);

  reader.readAsText(file);
}

function modRow(filename) {
  $("#input-table").append("<tr><th>" + filename +  "</th><th><button class='remove-file'>remove</button></th></tr>");
  $("#output-table").append("<tr><th>" + filename.replace(".json", ".txt") +  "</th><th><button class='download-file'>download</button><button class='preview-file' data-featherlight='#preview'>preview</button></th></tr>");
}

function updateTables() {
  $("table").empty();

  for (file in files) {
    modRow(file);
  } 
}

$("input[name='metadata']").on("change", function(e) {
  if ($(this).prop("files")[0].name === "metadata.json") {
    addMetadata($(this).prop("files")[0]);
  } else {
    alert("file must be named metadata.json");
    $(this).val("");
  }
});

$("input[name='convofiles']").on("change", function(e) {
  for (var i = $(this).prop("files").length; i > 0; i--) {
    addFile($(this).prop("files")[i-1]);
  }
});

$("#download-all").click(function() {
  if (metadata && files) {
    downloadFiles();
  }
});

$(document).on("click", ".download-file", function() {
  if (metadata) {
    downloadFile($(this).parent().prev().text().replace(".txt", ".json"));
  }
});

$(document).on("click", ".remove-file", function() {
  delete files[$(this).parent().prev().text()];
  updateTables();
});

$(document).on("click", ".preview-file", function() {
  $("#preview-text").text(translateFile(files[$(this).parent().prev().text().replace(".txt", ".json")]));
});

$(document).ready(function() {
  $("input").val("");
});