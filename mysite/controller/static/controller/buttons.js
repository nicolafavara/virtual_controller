var timer = null; // hold a reference to the timer

function send_yaw_command(btn_id) {

    btn_pressed = btn_id.split('_')[1] + "_" + btn_id.split('_')[2];
    let yaw_rate = document.getElementById("yaw_rate").value;

    if (yaw_rate == 0) {
        alert("yaw_rate is 0.");
        return;
    }

    const command = {
        btn_pressed: btn_pressed,
        velocity: 0,
        yaw_rate: yaw_rate,
        axes: null
    };

    exec_command(commandUrl, command);

    timer = setInterval(function () {
        exec_command(commandUrl, command);
    }, 1000);
}

function send_direction_command(btn_id) {

    direction = btn_id.split('_')[2];
    let velocity = document.getElementById("velocity").value;

    if (velocity == 0) {
        alert("velocity is 0.");
        return;
    }

    const command = {
        btn_pressed: direction,
        velocity: velocity,
        yaw_rate: 0,
        axes: null
    };

    exec_command(commandUrl, command);

    timer = setInterval(function () {
        exec_command(commandUrl, command);
    }, 1000);
}

function send_command(btn_id) {

    btn_pressed = btn_id.split('_')[1];

    const command = {
        btn_pressed: btn_pressed,
        velocity: 0,
        yaw_rate: 0,
        axes: null
    };

    //alert(command["btn_pressed"]);
    exec_command(commandUrl, command);
}


const dir_btns = document.querySelectorAll('button[id^=btn_dir]');
dir_btns.forEach(btn => btn.addEventListener("mousedown", () =>
    send_direction_command(btn.id)));

const yaw_btns = document.querySelectorAll('button[id^=btn_yaw]');
yaw_btns.forEach(btn => btn.addEventListener("mousedown", () =>
    send_yaw_command(btn.id)));

const buttons = document.querySelectorAll('button[id^=button]');
buttons.forEach(btn => btn.addEventListener("mousedown", () =>
    send_command(btn.id)));

const btns = document.querySelectorAll('button[id^=btn]');
btns.forEach(btn => {

    btn.addEventListener("mouseup", () => {

        clearInterval(timer);  // Cancel the timer
        console.log("Timer cancelled.");

        const command = {
            btn_pressed: "stop",
            velocity: 0,
            yaw_rate: 0,
            axes: null
        }
        exec_command(commandUrl, command);
    });
});