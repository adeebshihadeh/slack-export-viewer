var users;
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
    var utcDate = new Date(date.toUTCString());
    utcDate.setHours(utcDate.getHours()-8);

    out += users[json.messages[line].user] + " " + new Date(utcDate) + " " + json.messages[line].text + "\n";
  }
  return out;
}

function readFile(file, callback) {
  var reader = new FileReader();

  reader.onload = (function() {
    return function(e) {
      callback({"name": file.name, "content": e.target.result});
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

$("input[name='users']").on("change", function(e) {
  if ($(this).prop("files")[0].name === "users.json") {
    readFile($(this).prop("files")[0], function(file) {
      users = JSON.parse(file.content);
    });
    $("input[name='convofiles']").prop("disabled", false);
  } else {
    alert("file must be named users.json");
    $(this).val("");
  }
});

$("input[name='convofiles']").on("change", function(e) {
  for (var i = $(this).prop("files").length; i > 0; i--) {
    readFile($(this).prop("files")[i-1], function(file) {
      files[file.name] = file.content;
      updateTables();
    });
  }
  $("input[name='convofiles']").val("");
});

$("#download-all").click(function() {
  if (users && files) {
    downloadFiles();
  }
});

$(document).on("click", ".download-file", function() {
  if (users) {
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
  $("input[name='convofiles']").prop("disabled", true);
});
