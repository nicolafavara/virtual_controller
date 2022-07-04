
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
const fpsInterval = 1000 / fps;
const controllers = {};
let globalID;
let then = Date.now();
let enableController = false;
let controller_calibrated = false;
let center_stick_flag = true;


let checker = document.getElementById('controller_switch');
checker.onchange = function () {

    if (!!this.checked) {
        document.getElementById('start_modal_button').style.display = 'none';
        show_controller();
        enableListeners();
    }
    else {
        show_buttons();
        // the user has disabled the controller mode from the switch.
        // Next time switch is checked, this boolean
        // will be used to re-enable controller's input
        enableController = true;
        disableListeners();
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
    
    if (enableController){
        // if we are here, it's at least the second time
        // the user activates the controller mode 
        enableController = false;
        requestAnimation(updateStatus);
    }
    else{
        // if we are here, it's the first time user 
        // activate controller mode, so we neet to
        // add the gamepad to controllers array
        let gamepad = controllers[0];
        addgamepad(gamepad);
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

function connecthandler(e) {
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
    
    requestMapping(e.gamepad);
}

function requestMapping(gamepad) {

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

function addgamepad(gamepad) {

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

    requestAnimation(updateStatus);
}

function disconnecthandler(e) {
    removegamepad(e.gamepad);
}

function removegamepad(gamepad) {
    cancelAnimation();

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
    enableController = false;
    disableListeners();
}

function updateStatus() {

    let checker = document.getElementById('controller_switch');
    if (!!checker.checked == false) {
        console.log("switch is false");
        return;
    }

    scangamepads();

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

    sendCommand(axes_dict);
    requestAnimation(updateStatus);
}

function sendCommand(axes_dict) {

    now = Date.now();
    elapsed = now - then;

    if (elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval);

        let velocity = document.getElementById("velocity").value;
        let yaw_rate = document.getElementById("yaw_rate").value;

        const command = {
            btn_pressed: "",
            velocity: velocity,
            yaw_rate: yaw_rate,
            axes: axes_dict
        }

        exec_command(commandUrl, command);
    }
}

function scangamepads() {
    let gamepads = navigator.getGamepads ? navigator.getGamepads() :
        (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);

    for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i] && (gamepads[i].index in controllers)) {
            controllers[gamepads[i].index] = gamepads[i];
        }
    }

    if (enableController) {

        // We enter this block only after 
        // the first time the user deactivates 
        // and re-activate the controller switch 
        reEnableControllerInput();
    }
}

/**
 * re-enables input from the controller if 
 * the switch is active and there are controllers 
 * that are found to be already connected
 */
function reEnableControllerInput() {

    let checker = document.getElementById('controller_switch');
    if ((!!checker.checked) == true && Object.keys(controllers).length > 0 && controller_calibrated == true) {

        document.getElementById('start_rc_commands_button').style.display = "inline";
        document.getElementById('start').style.display = "none";
    }
}

function enableListeners() {

    if (haveEvents) {

        window.addEventListener("gamepadconnected", connecthandler);
        window.addEventListener("gamepaddisconnected", disconnecthandler);
    }
    else if (haveWebkitEvents) {
        window.addEventListener("webkitgamepadconnected", connecthandler);
        window.addEventListener("webkitgamepaddisconnected", disconnecthandler);
    }
    else {
        setInterval(scangamepads, 500);
    }

    scangamepads();
}

function disableListeners() {

    // the next time the switch is active, this boolean
    // will be used to re-enable controller's input
    //enableController = true;

    if (haveEvents) {
        window.removeEventListener("gamepadconnected", connecthandler);
    }
    else if (haveWebkitEvents) {
        window.removeEventListener("webkitgamepadconnected", connecthandler);
    }
    else {
        clearInterval(scangamepads);
    }

    cancelAnimation();
}

function requestAnimation(fun) {

    console.log("Requesting AnimationFrame...");
    globalID = rAF(fun);
}

function cancelAnimation() {
    console.log("Cancelling AnimationFrame...");
    cAF(globalID);
}