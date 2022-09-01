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


function send_command(cmd) {

  let url = commandUrl;
  
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

function get_mapping(url) {

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
      console.log("data: ", data);
      return data;
    });
}

function set_mapping(name, mapping) {

  let url = set_mapping_url;

  fetch(url, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "X-Requested-With": "XMLHttpRequest",
      "X-CSRFToken": getCookie("csrftoken"),
    },
    body: JSON.stringify({
      "name": name,
      "yaw_axis": get_key_by_value(mapping, "yaw"),
      "throttle_axis": get_key_by_value(mapping, "throttle"),
      "roll_axis": get_key_by_value(mapping, "roll"),
      "pitch_axis": get_key_by_value(mapping, "pitch")
    })
  })
    .then(response => {
      console.log(response.json())
    })
    .then(data => {
      console.log(data);
    });
}

function get_key_by_value(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}