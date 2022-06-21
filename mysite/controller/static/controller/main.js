// https://docs.djangoproject.com/en/3.2/ref/csrf/#acquiring-the-token-if-csrf-use-sessions-and-csrf-cookie-httponly-are-false
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === (name + "=")) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}


function exec_command(url, cmd) {

  console.log(JSON.stringify(cmd));
  //alert("sending command.")
  fetch(url, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "X-Requested-With": "XMLHttpRequest",
      "X-CSRFToken": getCookie("csrftoken"),
    },
    body: JSON.stringify({ command: cmd })
  })
    .then(response => response.json())
    .then(data => {
      console.log(data);
    });
}

function get_mapping(url, ) {

  // const endpoint = new URL(url);
  // endpoint.search = new URLSearchParams({name: name});
  console.log(url);

  return fetch(url, {
    method: "GET",
    credentials: "same-origin",
    headers: {
      "X-Requested-With": "XMLHttpRequest",
      "X-CSRFToken": getCookie("csrftoken")
    }
  })
    .then(response => {
      return response.json()
    })
    .then(data => {
      //data.json();
      console.log("data: ", data);
      return data;
    });
}

function set_mapping(url, name, mapping) {

  //mapping = { 0: "", 1: "", 2: "", 3: "" }

  fetch(url, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "X-Requested-With": "XMLHttpRequest",
      "X-CSRFToken": getCookie("csrftoken"),
    },
    body: JSON.stringify({
      "name": name,
      "yaw_axis": getKeyByValue(mapping, "yaw"),
      "throttle_axis": getKeyByValue(mapping, "throttle"),
      "roll_axis": getKeyByValue(mapping, "roll"),
      "pitch_axis": getKeyByValue(mapping, "pitch")
    })
  })
    .then(response => {
      console.log(response.json())
    })
    .then(data => {
      console.log(data);
    });
}

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}