
let haveEvents = 'GamepadEvent' in window;
let haveWebkitEvents = 'WebKitGamepadEvent' in window;
const rAF = window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.requestAnimationFrame;

const cAF = window.mozCancelAnimationFrame ||
    window.webkitCancelAnimation ||
    window.cancelAnimationFrame;

const std_mapping_axes = { 0: "yaw", 1: "throttle", 2: "roll", 3: "pitch" };
// Taranis remote controller's mapping
//const axes_name = { 0: "roll", 1: "pitch", 2: "throttle", 3: "yaw" };

const fps = 5;
const fps_interval = 1000 / fps;
const controllers = {};
let global_ID;
let then = Date.now();
let is_controller_already_set = false;
let controller_calibrated = false;
let center_stick_flag = true;


let checker = document.getElementById('controller_switch');
checker.onchange = function () {

    if (!!this.checked) {
        document.getElementById('start_modal_button').style.display = 'none';
        show_controller();
        enable_listeners();
    }
    else {
        show_buttons();
        // the user has disabled the controller mode from the switch.
        // Next time switch is checked, this boolean
        // will be used to re-enable controller's input
        is_controller_already_set = true;
        disable_listeners();
    }
};

function show_buttons() {
    $('#collapsediv1').collapse('show');
    $('#collapsediv2').collapse('hide');
}

function show_controller() {
    $('#collapsediv1').collapse('hide');
    $('#collapsediv2').collapse('show');
}

const start_cmd_button = document.getElementById('start_rc_commands_button');
start_cmd_button.addEventListener('click', function() {

    if(Object.keys(controllers).length == 0){
        return;
    }
    
    if (is_controller_already_set){
        // if we are here, it's at least the second time
        // the user activates the controller mode 
        is_controller_already_set = false;
        request_animation(update_status);
    }
    else{
        // if we are here, it's the first time user 
        // activate controller mode, so we neet to
        // add the gamepad to controllers array
        let gamepad = controllers[0];
        add_gamepad(gamepad);
    }

    document.getElementById('start_rc_commands_button').style.display = "none";
});

// add listener to checkbox 
let checked_val = document.querySelector('input[name="throttle_stick_radio"]:checked').value;
if (document.querySelector('input[name="throttle_stick_radio"]')) {
    document.querySelectorAll('input[name="throttle_stick_radio"]').forEach((elem) => {
        elem.addEventListener("change", function (event) {

            var item = event.target.value;
            center_stick_flag = (item == "center");
        });
    });
}

function connect_handler(e) {
    console.log("CONNECTED.");

    if (Object.keys(controllers).length == 0) {
        controllers[e.gamepad.index] = e.gamepad;
    }
    else {
        return;
    }

    if (e.gamepad.mapping == "standard") {

        current_mapping = std_mapping_axes;
        controller_calibrated = true;
        document.getElementById('start_modal_button').style.display = "none";
        document.getElementById('start').style.display = "none";
        document.getElementById('start_rc_commands_button').style.display = "inline";
        return;
    }

    //else
    
    request_mapping(e.gamepad);
}

function request_mapping(gamepad) {

    const get_mapping_url = mappingUrl.replace('str', gamepad.id)
    get_mapping(get_mapping_url)
        .then(value => {

            console.log(value.data);
            if (value.data === null || value.data === undefined) {

                console.log("button visible.");
                // show modals button to start calibration
                document.getElementById('start').style.display = "none";
                document.getElementById('start_modal_button').style.display = "inline";
            }
            else {

                let m = JSON.parse(value.data)
                let name = m.controller_name;
                let yaw_axis = m.yaw_axis;
                let roll_axis = m.roll_axis;
                let throttle_axis = m.throttle_axis;
                let pitch_axis = m.pitch_axis;

                // set value as current mapping
                current_mapping[yaw_axis] = "yaw";
                current_mapping[roll_axis] = "roll";
                current_mapping[throttle_axis] = "throttle";
                current_mapping[pitch_axis] = "pitch";

                controller_calibrated = true;

                document.getElementById('start_modal_button').style.display = "none";
                document.getElementById('start').style.display = "none";
                document.getElementById('start_rc_commands_button').style.display = "inline";

            }

        });
}

function add_gamepad(gamepad) {

    let d = document.createElement("div");
    d.setAttribute("id", "controller" + gamepad.index);

    let a = document.createElement("div");
    a.className = "axes";

    for (i = 0; i < 4/*gamepad.axes.length*/; i++) {
        e = document.createElement("meter");
        e.className = "axis";
        e.setAttribute("min", "-1");
        e.setAttribute("max", "1");
        e.setAttribute("value", "0");
        e.innerHTML = i;

        let f = document.createElement("div");
        f.className = "axes_value";
        f.innerHTML = i;

        a.appendChild(f);
        a.appendChild(e);
    }

    let row_div = document.createElement("div");
    row_div.className = "row";

    let col_div = document.createElement("div");
    col_div.className = "one_column";

    col_div.appendChild(a);
    row_div.appendChild(col_div);
    d.appendChild(row_div);

    let controller_div = document.getElementById("controllers");
    controller_div.appendChild(d);

    document.getElementById("start").style.display = "none";

    request_animation(update_status);
}

function disconnect_handler(e) {
    remove_gamepad(e.gamepad);
}

function remove_gamepad(gamepad) {
    cancel_animation();

    let controllers_div = document.getElementById("controllers");
    let d = document.getElementById("controller" + gamepad.index);
    if (d != null) {
        controllers_div.removeChild(d);
    }
    delete controllers[gamepad.index];

    // this command will not trigger the checkbox listener
    document.getElementById('controller_switch').checked = false;

    show_buttons();
    document.getElementById('start_modal_button').style.display = "none";
    document.getElementById('start_rc_commands_button').style.display = "none";
    document.getElementById('start').style.display = "inline";

    controller_calibrated = false;
    is_controller_already_set = false;
    disable_listeners();
}

function update_status() {

    let checker = document.getElementById('controller_switch');
    if (!!checker.checked == false) {
        console.log("switch is false");
        return;
    }

    scan_gamepads();

    let axes_dict = {};

    for (j in controllers) {

        let controller = controllers[j];

        let d = document.getElementById("controller" + j);

        let axes = d.getElementsByClassName("axis");
        let axes_values = d.getElementsByClassName("axes_value");
        for (let i = 0; i < 4/*controller.axes.length*/; i++) {

            let val = controller.axes[i].toFixed(2);

            // controllers with standard mapping provide, for vertical axes,
            // negarive values by moving the stick up and positive values 
            // by moving the stick down. On the other hand, if the mapping
            // is not standard, the behavior is opposite. 
            // Therefore we change the sign of the values read 
            // on the two vertical axes if we are in standard
            if (controller.mapping == "standard" && (current_mapping[i] == "throttle" || current_mapping[i] == "pitch")) {
                val = (val * (-1)).toFixed(2);
            }

            if (center_stick_flag == false && current_mapping[i] == "throttle") {
                val = ((parseFloat(val) + 1.00) / 2.00).toFixed(2);
                console.log(val);
            }

            let a = axes[i];
            a.innerHTML = current_mapping[i] + ": " + val;
            a.setAttribute("value", val);

            let f = axes_values[i];
            f.textContent = a.innerHTML;

            axes_dict[current_mapping[i]] = val;
        }
    }

    send_info(axes_dict);
    request_animation(update_status);
}

function send_info(axes_dict) {

    now = Date.now();
    elapsed = now - then;

    if (elapsed > fps_interval) {
        then = now - (elapsed % fps_interval);

        let velocity = document.getElementById("velocity").value;
        let yaw_rate = document.getElementById("yaw_rate").value;

        const command = {
            btn_pressed: "",
            velocity: velocity,
            yaw_rate: yaw_rate,
            axes: axes_dict
        }

        send_command(command);
    }
}

function scan_gamepads() {
    let gamepads = navigator.getGamepads ? navigator.getGamepads() :
        (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);

    for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i] && (gamepads[i].index in controllers)) {
            controllers[gamepads[i].index] = gamepads[i];
        }
    }

    if (is_controller_already_set) {

        // We enter this block only after 
        // the first time the user deactivates 
        // and re-activate the controller switch 
        re_enable_controller_input();
    }
}

/**
 * re-enables input from the controller if 
 * the switch is active and there are controllers 
 * that are found to be already connected
 */
function re_enable_controller_input() {

    let checker = document.getElementById('controller_switch');
    if ((!!checker.checked) == true && Object.keys(controllers).length > 0 && controller_calibrated == true) {

        document.getElementById('start_rc_commands_button').style.display = "inline";
        document.getElementById('start').style.display = "none";
    }
}

function enable_listeners() {

    if (haveEvents) {

        window.addEventListener("gamepadconnected", connect_handler);
        window.addEventListener("gamepaddisconnected", disconnect_handler);
    }
    else if (haveWebkitEvents) {
        window.addEventListener("webkitgamepadconnected", connect_handler);
        window.addEventListener("webkitgamepaddisconnected", disconnect_handler);
    }
    else {
        setInterval(scan_gamepads, 500);
    }

    scan_gamepads();
}

function disable_listeners() {

    // the next time the switch is active, this boolean
    // will be used to re-enable controller's input
    //enableController = true;

    if (haveEvents) {
        window.removeEventListener("gamepadconnected", connect_handler);
    }
    else if (haveWebkitEvents) {
        window.removeEventListener("webkitgamepadconnected", connect_handler);
    }
    else {
        clearInterval(scan_gamepads);
    }

    cancel_animation();
}

function request_animation(fun) {

    console.log("Requesting AnimationFrame...");
    global_ID = rAF(fun);
}

function cancel_animation() {
    console.log("Cancelling AnimationFrame...");
    cAF(global_ID);
}