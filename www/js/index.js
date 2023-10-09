document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
  // Cordova is now initialized. Have fun!

  console.log("Running cordova-" + cordova.platformId + "@" + cordova.version);
  console.log(navigator.camera);
  console.log(navigator.vibrate);
  // document.getElementById("deviceready").classList.add("ready");

  document.addEventListener("offline", onOffline, false);

  function onOffline() {
    let alert = document.createElement("ion-alert");

    navigator.vibrate([500]);
    alert.header = "MyPets";
    alert.message = "You are now offline";
    alert.buttons = ["OK"];

    document.body.appendChild(alert);

    return alert.present();
  }

  document.addEventListener("online", onOnline, false);
  function onOnline() {
    let alert = document.querySelector("ion-alert");
    if (alert) {
      alert.dismiss();
      alert.remove();
    }
  }
}
