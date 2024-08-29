document.getElementById('csvFile').addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const urls = e.target.result.split('\n').filter(url => url.trim() !== '');
      processUrls(urls);
    };
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
    };
    reader.readAsText(file, 'UTF-8');
  }
});

// Fonction pour basculer entre les modes d'entrée
function toggleInputMode(mode) {
  const csvInput = document.getElementById('csvInput');
  const textInput = document.getElementById('textInput');
  const csvToggle = document.getElementById('csvToggle');
  const textToggle = document.getElementById('textToggle');

  if (mode === 'csv') {
    csvInput.style.display = 'block';
    textInput.style.display = 'none';
    csvToggle.classList.add('active');
    textToggle.classList.remove('active');
  } else {
    csvInput.style.display = 'none';
    textInput.style.display = 'block';
    csvToggle.classList.remove('active');
    textToggle.classList.add('active');
  }
}

// Écouteurs d'événements pour les boutons de bascule
document.getElementById('csvToggle').addEventListener('click', () => toggleInputMode('csv'));
document.getElementById('textToggle').addEventListener('click', () => toggleInputMode('text'));

// Fonction pour charger les URLs à partir du texte
function loadUrlsFromText() {
  const urlText = document.getElementById('urlTextArea').value;
  const urls = urlText.split('\n').filter(url => url.trim() !== '');
  if (urls.length > 0) {
    processUrls(urls);
  } else {
    console.error('No valid URLs found in the text area.');
  }
}

// Écouteur d'événement pour le bouton de chargement des URLs
document.getElementById('loadUrls').addEventListener('click', loadUrlsFromText);

// Fonction commune pour traiter les URLs
function processUrls(urls) {
  if (urls.length > 0) {
    chrome.storage.local.set({urls: urls}, () => {
      console.log('URLs successfully loaded:', urls);
      allUrls = urls;
      currentPage = 1;
      previewImages();
      updatePaginationControls();
      hideInstructions();
      document.getElementById('previewSection').style.display = 'block';
    });
  } else {
    console.error('No valid URLs found.');
    document.getElementById('previewSection').style.display = 'none';
  }
}

// Fonction pour cacher la section d'instructions
function hideInstructions() {
  document.getElementById('instructionsSection').style.display = 'none';
}

// Écouteur d'événement pour le bouton de fermeture des instructions
document.getElementById('hideInstructions').addEventListener('click', hideInstructions);

let currentPage = 1;
const imagesPerPage = 10;
let allUrls = [];

document.getElementById('downloadAll').addEventListener('click', () => {
  chrome.runtime.sendMessage({action: "downloadAll"});
  console.log("Demande de téléchargement envoyée.");
});

document.getElementById('prevPage').addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    previewImages();
    updatePaginationControls();
  }
});

document.getElementById('nextPage').addEventListener('click', () => {
  if (currentPage < Math.ceil(allUrls.length / imagesPerPage)) {
    currentPage++;
    previewImages();
    updatePaginationControls();
  }
});

function previewImages() {
  const preview = document.getElementById('preview');
  preview.innerHTML = '';
  const startIndex = (currentPage - 1) * imagesPerPage;
  const endIndex = startIndex + imagesPerPage;
  const urlsToShow = allUrls.slice(startIndex, endIndex);

  urlsToShow.forEach(url => {
    try {
      new URL(url); // Vérifier si l'URL est valide
      const container = document.createElement('div');
      container.className = 'image-container';
      
      const img = document.createElement('img');
      img.src = url;
      img.onerror = () => {
        console.error(`Impossible de charger l'image: ${url}`);
        img.alt = "Image non disponible";
      };
      
      const urlText = document.createElement('p');
      urlText.textContent = url;
      urlText.className = 'image-url';
      
      container.appendChild(img);
      container.appendChild(urlText);
      preview.appendChild(container);
    } catch (e) {
      console.error(`URL invalide: ${url}`);
    }
  });
}

function updatePaginationControls() {
  const totalPages = Math.ceil(allUrls.length / imagesPerPage);
  document.getElementById('pageInfo').textContent = `Page ${currentPage} sur ${totalPages}`;
  document.getElementById('prevPage').style.display = currentPage > 1 ? 'block' : 'none';
  document.getElementById('nextPage').style.display = currentPage < totalPages ? 'block' : 'none';
  document.getElementById('downloadAll').style.display = allUrls.length > 0 ? 'block' : 'none';
}