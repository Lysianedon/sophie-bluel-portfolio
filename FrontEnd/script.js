// GALLERIES PROJECTS 
let filteredImages = [];
let allImages = [];
const gallery = document.querySelector('.gallery');
const filterButtons = Array.from(document.querySelectorAll('.filter-btn'));
const submitButton = document.getElementById('submitLogin');
const closeEditionModeButton = document.querySelector('.close-edition-mode');
let isEditionModeActive = false;
const gallerySettings = document.querySelector('.gallery-settings');
// GALLERY MODALE
const modale = document.querySelector('.modale');
const closeModaleButton = document.querySelector('.close-button');
const addPictureButton = document.querySelector('.add-btn');
const overlay = document.querySelector('.overlay');
const modaleGallery = document.querySelector('.modale-gallery');
// ADD PICTURE FORM
const pictureForm = document.querySelector('.add-picture-form');
const closeAddFormBtn = document.querySelector('.close-add-form-btn');
const goBackAddFormBtn = document.querySelector('.go-back-add-form-btn');
const addPictureToGalleryButton = document.querySelector('.add-picture-btn');
const imagePlaceholder = document.querySelector('.img-placeholder');
const fileUploadButton = document.querySelector('#file-upload');
const fileFormatsLegend = document.querySelector('.file-formats-legend');
const validateAddFormButton = document.querySelector('.validate-btn');
const titleNewProject = document.querySelector('#title');
const categoryNewProject = document.querySelector('#categorie');


//-------- RETRIEVE AND DISPLAY IMAGES ON THE PROJECT PAGE --------

const fetchAllData = async () => {
    try {
        const res = await fetch('http://localhost:5678/api/works');
        const data = await res.json();
        filteredImages = data; 
        allImages = data; 
        addImagesToGallery();  
    } catch (error) {
        return console.error(error);
    }
}
fetchAllData();

//------------- ADD IMAGES TO GALLERY-------------

const addImagesToGallery = async () => {
    for (let i = 0; i < filteredImages.length; i++) {
        const img = filteredImages[i];
        addImageToDOM(img.imageUrl, img.title);
    }
}

const addImageToDOM = (imgUrl, figCaptionText) => {
    let figure = document.createElement("figure");
    let image = document.createElement("img");
    let figCaption = document.createElement("figCaption");

    image.src = imgUrl;
    image.alt = figCaptionText;
    figCaption.innerText = figCaptionText;
    figure.appendChild(image);
    figure.appendChild(figCaption);
    if (gallery) {
        gallery.appendChild(figure);
    }
}

//---------- FILTER IMAGES BY CATEGORY ----------
const filterGalleryByCategories = () => {
    const activeFilter = document.querySelector('.btn-active');
    const activeFilterId = parseInt(activeFilter.id);
    gallery.innerHTML = "";
    if (activeFilterId === 0) {
        filteredImages = allImages;
    } else {
        filteredImages = allImages.filter(img => img.category.id === activeFilterId);
    }
    addImagesToGallery();
}

const toggleFilterBtnClass = () => {
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterButtons.forEach(button => {
                if (e.target === button) {
                    button.classList.add('btn-active')
                } else {
                    button.classList.remove('btn-active')
                }
            })
            filterGalleryByCategories();
        })
    })
}
toggleFilterBtnClass();


const displayNotification = (textContent, error = true, time = 1500) => {
    const notification = error ? document.querySelector('.error-notification') : document.querySelector('.success-notification');
    notification.textContent = textContent;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';  
        notification.textContent = '';
    }, time);
    return null
}

// -------------- LOGIN FUNCTION -------------------
const login = async (e) => {
    e.preventDefault();
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;

    //Guard : checking email format
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        displayNotification('Format de l\'email incorrect', true, 1600);
        return null;
    }
    //Logging in by making a POST call on the API endpoint :
    try {
        const res = await fetch('http://localhost:5678/api/users/login', 
        { method: 'POST', 
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({email, password})

    }).then(res => res.json())
    .then(res =>  {
        // Checking the response code : if 200, the user is loggedin in, otherwise, an error message is displayed
        if (res.token) {
            // console.log(res);
            //Storing the token in the cookies:
            document.cookie = `token=${encodeURIComponent(res.token)}`;

            displayNotification('Connecté', false, 1300);
            // Redirecting to the projects page
            setTimeout(() => {
                window.location.href = './index.html'; 
                isEditionModeActive = true;
            }, 1200);
        } else {
            displayNotification('Erreur dans l’identifiant ou le mot de passe', true, 1600);
            console.error('User not found');
        }
        return null;
    })

    } catch (error) {
        displayNotification('Un problème est survenu. Veuillez réessayer', true);
        return console.error(error);
    }
};

function checkJwtToken(tokenName) {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i].trim().split('=');
      if (cookie[0] === tokenName) {
        return cookie;
      }
    }
    return false;
}

function deleteCookie(name) {
    document.cookie = `${name}=; Max-Age=0;`; 
}

if (submitButton) {
    submitButton.addEventListener('click', (e) => {
        login(e);
    });
}
//Displaying the edition toolbar + options:
document.addEventListener('DOMContentLoaded', () => {
    //Retrieving the state of the tools from local storage
    const isUserConnected = checkJwtToken("token");

    const editionTools = Array.from(document.querySelectorAll('.edition-tools'));
        editionTools.forEach(tool => {
            tool.style.display = `${isUserConnected ? 'flex' : 'none'}`;
        }); 
});

if (closeEditionModeButton) {
    closeEditionModeButton.addEventListener('click', () => {
        deleteCookie("token");
        const editionTools = Array.from(document.querySelectorAll('.edition-tools'));
        editionTools.forEach(tool => {
            tool.style.display = "none";
        });
    })

}

//----------- HANDLE MODALE FUNCTIONS ----------------

const toggleModale = () => {
    modale.classList.toggle('hidden');
    overlay.classList.toggle('hidden');
}
if (gallerySettings) {
    gallerySettings.addEventListener('click', () => {
        addFilteredImagesToModaleGallery();
        toggleModale();
    })
}

if (closeModaleButton) {
    closeModaleButton.addEventListener('click', () => {
        toggleModale();
        modaleGallery.innerHTML = "";
    })
}

// ADD FORM FUNCTIONS
const closeAddForm = () => {
    pictureForm.classList.toggle('hidden');
    overlay.classList.toggle('hidden'); 
    titleNewProject.value  = "";
    categoryNewProject.value = 0;
    addPictureToGalleryButton.classList.toggle('hidden');
    fileFormatsLegend.classList.toggle('hidden');
    imagePlaceholder.src = "./assets/icons/img-placeholder.png";
    validateAddFormButton.disabled = true;
  
    // Remove the change event listener from fileUploadButton
    fileUploadButton.removeEventListener('change', handleFileUpload);
}

overlay.addEventListener('click', () => {
    pictureForm.classList.add('hidden');
    modale.classList.add('hidden');
    overlay.classList.add('hidden'); 
    titleNewProject.value  = "";
    categoryNewProject.value = 0;
    addPictureToGalleryButton.classList.remove('hidden');
    fileFormatsLegend.classList.remove('hidden');
    imagePlaceholder.src = "./assets/icons/img-placeholder.png";
    validateAddFormButton.disabled = true;
    // Remove the change event listener from fileUploadButton
    fileUploadButton.removeEventListener('change', handleFileUpload);
})
const resetFormAndGoBackToModaleGallery = () => {
    modale.classList.remove('hidden');
    pictureForm.classList.add('hidden');
    titleNewProject.value  = "";
    categoryNewProject.value = 0;
    addPictureToGalleryButton.classList.remove('hidden');
    fileFormatsLegend.classList.remove('hidden');
    imagePlaceholder.src = "./assets/icons/img-placeholder.png";
    validateAddFormButton.disabled = true;
    // Remove the change event listener from fileUploadButton
    fileUploadButton.removeEventListener('change', handleFileUpload);
}
  
const handleFileUpload = (e) => {
    const file = e.target.files[0]; 
    const dotIndex = file.name.lastIndexOf('.');
    const extension = file.name.substring(dotIndex + 1).toLowerCase();
    
    //Guard: checking the file extension
    if (extension !== 'png' && extension !== 'jpg') {
    displayNotification("format de l'image invalide", true, 1700);
    return null;
    }
    //Guard: if the size of the image is greater than 4 megabytes 
    if(file.size > 4 * 1024 * 1024) {
    displayNotification("Taille de l'image trop volumineuse", true, 1700);
    return null;
    }
    addPictureToGalleryButton.classList.toggle('hidden');
    fileFormatsLegend.classList.toggle('hidden');
    const reader = new FileReader();
    reader.onload = () => {
      imagePlaceholder.src = reader.result;
    };
    reader.readAsDataURL(file);
    // Remove the change event listener from fileUploadButton
    fileUploadButton.removeEventListener('change', handleFileUpload);
     // Clear the input field
     fileUploadButton.value = "";
}

if (closeAddFormBtn) {
    closeAddFormBtn.addEventListener('click', closeAddForm);   
}
// ----------- ADD IMAGES TO MODALE GALLERY ----------- 

const addFilteredImagesToModaleGallery = async () => {
    modaleGallery.innerHTML = "";
    for (let i = 0; i < filteredImages.length; i++) {
        const img = filteredImages[i];
        addImageToModaleGallery(img.imageUrl, img.title, img.id);
    }
}

const addImageToModaleGallery = (imgUrl, imgAltInfos, imgId) => {
    const figure = document.createElement("figure");
    const image = document.createElement("img");
    const figCaption = document.createElement("figCaption");
    const divIcons = document.createElement("div");
    const iconTrash = document.createElement("img");
    const iconMove = document.createElement("img");

    divIcons.classList.add("icons");
    iconTrash.classList.add("icon");
    iconTrash.classList.add("icon-trash");
    iconMove.classList.add("icon");
    iconMove.classList.add("icon-move");

    image.src = imgUrl;
    image.alt = imgAltInfos;
    figCaption.innerText = "éditer";
    iconTrash.src = "./assets/icons/trashcan.png";
    iconMove.src = "./assets/icons/move.png";
    divIcons.appendChild(iconMove);
    divIcons.appendChild(iconTrash);
    figure.appendChild(image);
    figure.appendChild(figCaption);
    figure.appendChild(divIcons);
    modaleGallery.appendChild(figure);

    iconTrash.addEventListener('click', () => {
        deleteImageFromGallery(imgId);
    })
}

// ----------- DELETE IMG FROM GALLERY ----------- 

const deleteImageFromGallery = async (id) => { 
    try {
        const token = checkJwtToken("token")[1]; 
        // console.log(token);
        const url = `http://localhost:5678/api/works/${id}`;
        const options = {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`}
        };
        const res = fetch(url, options).then(res => res.json());
        // console.log(res);
        fetchAllData();
        displayNotification("Image supprimée", false);
    } catch (error) {
        displayNotification('Un problème est survenu. Veuillez réessayer', true);
        return console.error(error);
    }
}

//------------------ ADD A PROJECT FUNCTIONS ------------------

if (addPictureToGalleryButton) {
    addPictureToGalleryButton.addEventListener('click', () => {
        fileUploadButton.click();
        fileUploadButton.removeEventListener('change', handleFileUpload);
        fileUploadButton.addEventListener('change', handleFileUpload);
    });  
}
  
const addNewProject = async (e) => {
    e.preventDefault();
    const title = titleNewProject.value;
    const category = parseInt(categoryNewProject.value);
    let image = imagePlaceholder.src;
    image = await fetch(image).then(res => res.blob());

    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    formData.append("image", image);

    try {
        const token = checkJwtToken("token")[1]; 
        const url = "http://localhost:5678/api/works/";
        const options = {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`},
        body: formData
        };
        fetch(url, options).then(res => res.json()).then(data => {
            if (data.id) {
                fetchAllData();
                displayNotification("Projet ajouté", false);
                return null;
            }
        });
    } catch (error) {
        displayNotification('Un problème est survenu. Veuillez réessayer', true);
        return console.error(error);
    }
}

if (addPictureButton && goBackAddFormBtn) {
    [addPictureButton, goBackAddFormBtn].forEach(elem => {
        elem.addEventListener('click', () => {
            modale.classList.toggle('hidden');
            pictureForm.classList.toggle('hidden');

            if (elem === goBackAddFormBtn) {
                resetFormAndGoBackToModaleGallery();
            }
        })
    })
}

const checkFormValidity = () => {
    const isTitleValid = titleNewProject.value.trim() !== ""; 
    const isImgValid = (imagePlaceholder.src !== "") && (!imagePlaceholder.src.includes("img-placeholder.png"));
    const isCategoryValid = (categoryNewProject.value !== "0") && (categoryNewProject.value !== ""); 
    const isValidateButtonEnabled = [isTitleValid, isImgValid, isCategoryValid].every(field => field === true);

    validateAddFormButton.disabled = !isValidateButtonEnabled;
}

if (pictureForm) {
    pictureForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addNewProject(e);
    } )
}

if (fileUploadButton && imagePlaceholder && titleNewProject && categoryNewProject) {
    [fileUploadButton, imagePlaceholder, titleNewProject, categoryNewProject].forEach(elem => {
        elem === titleNewProject ? elem.addEventListener('keyup', checkFormValidity) : elem.addEventListener('change', checkFormValidity);
    })   
}

const testClick = document.querySelector('.testclick');

if (testClick) {
    testClick.addEventListener('click', async () => {
        console.log("test")
        // e.preventDefault();
        const title = "titleNewProject.value";
        const category = 1;
        let image = "./assets/images/appartement-paris-v.png";
        image = await fetch(image).then(res => res.blob());
    
        const formData = new FormData();
        formData.append("title", title);
        formData.append("category", category);
        formData.append("image", image);
    
        try {
            const token = checkJwtToken("token")[1]; 
            const url = "http://localhost:5678/api/works/";
            const options = {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`},
            body: formData
            };
            fetch(url, options).then(res => res.json()).then(data => {
                if (data.id) {
                    fetchAllData();
                    displayNotification("Image ajoutée", false);
                    return null;
                } else {
                    displayNotification("Un problème est survenu avec l'image. Veuillez réessayer", true, 2000);
                    return console.error(data);   
                }
            });
        } catch (error) {
            displayNotification('Un problème est survenu. Veuillez réessayer', true);
            return console.error(error);
        }
    })  
}