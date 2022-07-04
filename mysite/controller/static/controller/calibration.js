const axis_names = { 0: "yaw", 1: "throttle", 2: "roll", 3: "pitch" }
let current_mapping = { 0: "", 1: "", 2: "", 3: "" }
let current_axis = "";
let current_modal = -1;

let max_value_flag = false;
let max_axis_value = -1;
let min_value_flag = false;
let min_axis_value = -2;

let btn = document.getElementById("start_modal_button");
btn.addEventListener("click", function () {

    $("#axis_modal_0").modal("show");
});

let modals = document.querySelectorAll('div[id^=axis_modal_]');
modals.forEach(btn => btn.addEventListener('shown.bs.modal', () => {

    let n = btn.id.split('_')[2];
    current_modal = n;
    current_axis = axis_names[n];
    requestAnimation(updateCalibrationStatus);
}));
modals.forEach(btn => btn.addEventListener('hide.bs.modal', () => {

    cancelAnimation();
    current_axis = "";
}));

const btn_modal_3 = document.getElementById("btn_modal_3");
btn_modal_3.addEventListener('click', () => {

    document.getElementById('start_modal_button').style.display = 'none';

    if (Object.keys(controllers).length > 0) {

        // save mapping to database
        set_mapping(set_mapping_url, controllers[0].id, current_mapping);

        addgamepad(controllers[0]);
        controller_calibrated = true;
    }

});

const btns_cancel = document.querySelectorAll('button[id^=btn_cancel]');
btns_cancel.forEach(btn => btn.addEventListener("click", () => {

    cancelAnimation();

    current_mapping = { 0: "", 1: "", 2: "", 3: "" }
    current_axis = "";
    current_modal = -1;

    max_value_flag = false;
    max_axis_value = -1;
    min_value_flag = false;
    min_axis_value = -2;

    for (let i = 0; i < 4; i++) {
        document.getElementById("btn_modal_" + i).disabled = true;
    }
}));


function updateCalibrationStatus() {
    scangamepads();

    let j;
    for (j in controllers) {
        print = false;
        const controller = controllers[j];
        for (let i = 0; i < controller.axes.length; i++) {

            if (controller.axes[i].toFixed(4) == parseFloat(1).toFixed(4)) {

                max_axis_value = i;
                max_value_flag = true;
            }
            else if (controller.axes[i].toFixed(4) == parseFloat(-1).toFixed(4)) {

                min_axis_value = i;
                min_value_flag = true;
            }
        }
    }

    if (min_value_flag && max_value_flag && max_axis_value == min_axis_value) {

        //alert("current_mapping[max_axis_value] = " + current_mapping[max_axis_value]);

        if (current_mapping[max_axis_value] === "") {

            document.getElementById("btn_modal_" + current_modal).disabled = false;
            //alert(current_axis + " associated with " + min_axis_value);
            current_mapping[max_axis_value] = current_axis;
            cancelAnimation();
            current_axis = "";
            return;
        }
    }

    requestAnimation(updateCalibrationStatus);
}