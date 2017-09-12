var metadata;
var files = [];

function downloadFiles() {
  for (file in files) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(files[file].translated));
    element.setAttribute('download', files[file].name.replace(".json", ".txt"));

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }
}

function translateFile(json) {
  var json = JSON.parse(json);
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
      files.push({"name": file.name, "raw": (e.target.result), "translated": translateFile(e.target.result)});
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

$("input[name='metadata']").on("change", function(e) {
  if ($(this).prop("files")[0].name === "metadata.json") {
    console.log($(this).prop("files")[0]);
    addMetadata($(this).prop("files")[0]);
  } else {
    console.log("file must be named metadata.json");
  }
});

$("input[name='convofiles']").on("change", function(e) {
  console.log($(this).prop("files"));
  for (var i = $(this).prop("files").length; i > 0; i--) {
    addFile($(this).prop("files")[i-1]);
  }
});

$("#download").click(function() {
  if (metadata && files) {
    downloadFiles();
  }
});