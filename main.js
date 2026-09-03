const MODEL = "./model/";

const HEADPHONES = "Si";
const NO_HEADPHONES = "No";

const safe_time = 0.8;
const stable_time = 800;

let model;
let webcam;

let mode = "available";
let candidate = null;
let candidateStart = 0;

async function start(){
    model = await tmImage.load(
        MODEL + "model.json",
        MODEL + "metadata.json"
    );

    webcam = new tmImage.Webcam(320, 240, true);
    await webcam.setup();
    await webcam.play();

    document
        .getElementById("webcam")
        .appendChild(webcam.canvas);

    loop();
}

async function loop(){
    webcam.update();

    const predictions =
        await model.predict(webcam.canvas);

    const best = 
        predictions.reduce((a,b) => a.probability > b.probability ? a : b);
    
    document.getElementById("prediction").textContent =
        `${best.className} - ${Math.round(best.probability * 100)}%` 
        
    if (best.probability >= safe_time){
        const newMode =
            best.className === HEADPHONES
                ? "dnd"
                : "available";
        checkStability(newMode);
    }
    requestAnimationFrame(loop);
}

function checkStability(newMode){
    if (newMode === mode){
        candidate = null;
        return;
    }

    if (candidate !== newMode){
        candidate = newMode;
        candidateStart = Date.now();
        return;
    }

    if (Date.now() - candidateStart >= stable_time){
        changeMode(newMode);
    }
}

function changeMode(newMode){
    mode = newMode;

    const modeElement =
        document.getElementById("mode");
    
    if (mode === "dnd"){
        modeElement.textContent =
            "Do Not Disturb";

            showNotification(
                "Do Not Disturbe mode activated",
                "Headphones detected. Notifications will be silenced"
            );
    } else {
        modeElement.textContent = "Available";

        showNotification(
            "Do Not Disturbe mode deactivated",
            "Headphones removed. Notifications are now allowed."
        );
    }
}

function showNotification(title, text){
    const notification = document.getElementById("notification");

    notification.innerHTML =
        `<b>${title}</b><br>${text}`;
    
    notification.style.display = "block";

    setTimeout(() => {
        notification.style.display = "none";
    }, 4000);
}

start();