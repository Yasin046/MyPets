window.addEventListener("load", loadPets);
window.addEventListener("load", updateCounter);

// Query for the toggle that is used to change between themes
const toggle = document.querySelector("#lightThemeButton");

// Listen for the toggle check/uncheck to toggle the dark class on the <body>
toggle.addEventListener("ionChange", (ev) => {
  document.body.classList.toggle("dark", ev.detail.checked);
});

const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

// Listen for changes to the prefers-color-scheme media query
prefersDark.addEventListener("change", (e) => checkToggle(e.matches));

// Called when the app loads
function loadApp() {
  checkToggle(prefersDark.matches);
}

// Called by the media query to check/uncheck the toggle
function checkToggle(shouldCheck) {
  toggle.checked = shouldCheck;
}

// Reorder list items
const reorderGroup = document.querySelector("ion-reorder-group");

let allPets = JSON.parse(localStorage.getItem("allPets"));

reorderGroup.addEventListener("ionItemReorder", ({ detail }) => {
  // The `from` and `to` properties contain the index of the item
  // when the drag started and ended, respectively
  console.log("Dragged from index", detail.from, "to", detail.to);

  // Update the order of allPets array
  const [item] = allPets.splice(detail.from, 1);
  allPets.splice(detail.to, 0, item);

  // Update the order in localStorage
  localStorage.setItem("allPets", JSON.stringify(allPets));

  // Finish the reorder and position the item in the DOM based on
  // where the gesture ended. This method can also be called directly
  // by the reorder group
  detail.complete();
  console.log("New Order", allPets);
});

const listNav = document.querySelector("#list-nav");
const listPage = document.querySelector("#list-page");
listNav.root = listPage;

const addNav = document.querySelector("#add-nav");
const addPage = document.querySelector("#add-page");
addNav.root = addPage;

const aboutNav = document.querySelector("#about-nav");
const aboutPage = document.querySelector("#about-page");
aboutNav.root = aboutPage;

let clearBtn = document.querySelector("#clearBtn");
clearBtn.addEventListener("click", clearPets);

// Load pets
function loadPets() {
  let allPets = JSON.parse(localStorage.getItem("allPets"));

  document.getElementById("pets").innerHTML = "";

  if (allPets != null) {
    allPets.forEach(addItems);

    // Add items to list
    function addItems(item, index) {
      document.getElementById("pets").innerHTML += `
            <ion-list>
                <ion-item>
                    <ion-label> 
                        <h1>Name: ${item.name}</h1><br>
                        <p>Type: ${item.type}</p><br>
                        <p>Birthday: ${item.birthday}</p><br>
                        <p>Medical history: ${item.medicalHistory}</p><br>
                        <p>Pet creation date and time: ${item.formattedDateTime}</p><br>
                        <ion-reorder slot="end"></ion-reorder>
                    </ion-label>
                    <div>
                    <ion-icon slot="end" name="trash-outline" class="deletePetIcon pet-icon" data="${index}"></ion-icon><br>
                      <ion-icon name="camera" class="btnCaptureImage pet-icon" data="${index}"></ion-icon><br>
                      <ion-icon name="image" class="displayPhotos pet-icon" onclick="modal.isOpen = true" data="${index}"></ion-icon>   
                    </div>
                    <div src="" class="petImage" style="display: none"></div>                   
                </ion-item>
            </ion-list>
            `;
    }

    let captureBtn = document.querySelectorAll(".btnCaptureImage");
    captureBtn.forEach((captureBtn) => {
      captureBtn.addEventListener("click", captureImage);
    });

    function captureImage() {
      console.log("captureImage");
      let petPhotoIndex = this.getAttribute("data");
      console.log(petPhotoIndex);
      //call the camera plugin and its getPicture function
      navigator.camera.getPicture(cameraSuccess, cameraFails, {
        quality: 25,
        destinationType: Camera.DestinationType.DATA_URL, //this will give us the base64 encoded string!
      });

      //if the image is captured, this function is called
      function cameraSuccess(imageData) {
        //imageData is a base64 encoded string (you can console.log this if you want)

        //getting <img class="petImage">
        var image = document.querySelector(".petImage");

        //changing the src="" attribute for the image
        image.src = "data:image/jpeg;base64," + imageData;

        let allPets = JSON.parse(localStorage.getItem("allPets"));
        let images = allPets[petPhotoIndex].images;

        if (images == null) images = [];

        images.push(image.src);

        localStorage.setItem("allPets", JSON.stringify(allPets));
        console.log(allPets);
        loadPets();
      }

      function cameraFails(message) {
        alert("Camera Failed because: " + message);
      }
    }

    let showImage = document.querySelectorAll(".displayPhotos");
    showImage.forEach((showImage) => {
      showImage.addEventListener("click", displayPhotos);
    });

    // display photos
    function displayPhotos() {
      console.log("displayPhotos");
      let petPhotoIndex = this.getAttribute("data");
      console.log(petPhotoIndex);

      let petImages = JSON.parse(localStorage.getItem("allPets", "images"));

      let images = allPets[petPhotoIndex].images;

      if (petImages == null) petImages = [];

      let imageList = document.querySelector("#imagesOfPets");
      imageList.innerHTML = "";
      images.forEach(addImages);

      modal.isOpen = true;

      function addImages(petPhotoIndex) {
        imageList.innerHTML += `
          
          <ion-card>
            <ion-img src="${petPhotoIndex}" class="petImage"></ion-img>
          </ion-card>
               
        `;
      }
    }

    let deletePetIcon = document.querySelectorAll(".deletePetIcon");
    deletePetIcon.forEach((icon) => {
      icon.addEventListener("click", deletePet);
    });

    // Delete pet
    function deletePet() {
      console.log("Pet Deleted");

      let petIndexToDelete = this.getAttribute("data");
      console.log(petIndexToDelete);
      allPets.splice(petIndexToDelete, 1);

      localStorage.setItem("allPets", JSON.stringify(allPets));
      navigator.vibrate([500]);
      loadPets();
      updateCounter();
    }
  } else {
    document.getElementById("pets").innerHTML =
      '<h4 class="ion-text-center">You haven\'t added any pets yet. Please start by clicking on the + icon.</h4>';
  }
}

function updateCounter() {
  let allPets = JSON.parse(localStorage.getItem("allPets"));

  allPets != null
    ? (document.querySelector("#count").textContent = allPets.length)
    : (document.querySelector("#count").textContent = 0);
}

function clearPets() {
  let alert = document.createElement("ion-alert");

  alert.header = "Delete all pets?";
  alert.message = "Are you sure you want to delete all pets?";
  alert.buttons = [
    {
      text: "No",
      role: "cancel",
    },
    {
      text: "Yes",
      handler: () => {
        localStorage.removeItem("allPets");
        presentToast("All pets were cleared");
        loadPets();
        updateCounter();
        navigator.vibrate([700]);
      },
    },
  ];

  document.body.appendChild(alert);

  return alert.present();
}

function presentToast(message) {
  const toast = document.createElement("ion-toast");
  toast.message = message;
  toast.duration = 3000;
  toast.position = "bottom";

  document.body.appendChild(toast);
  return toast.present();
}
