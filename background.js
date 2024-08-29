chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "downloadAll") {
    chrome.storage.local.get(['urls'], function(result) {
      if (result.urls && result.urls.length > 0) {
        downloadImages(result.urls);
        sendResponse({success: true});
      } else {
        sendResponse({error: "Aucune URL à télécharger."});
      }
    });
    return true; // Indique que nous allons envoyer une réponse de manière asynchrone
  }
});

function downloadImages(urls) {
  urls.forEach((url, index) => {
    try {
      new URL(url); // Vérifier si l'URL est valide
      chrome.downloads.download({
        url: url,
        filename: `downloaded_images/image_${index}${getFileExtension(url)}`,
        saveAs: false
      }, (downloadId) => {
        if (chrome.runtime.lastError) {
          console.error(`Erreur lors du téléchargement de ${url}: ${chrome.runtime.lastError.message}`);
        } else {
          console.log(`Téléchargement réussi pour ${url}`);
        }
      });
    } catch (e) {
      console.error(`URL invalide: ${url}`);
    }
  });
}

function getFileExtension(url) {
  try {
    const parsedUrl = new URL(url);
    const pathname = parsedUrl.pathname;
    const extension = pathname.split('.').pop().toLowerCase();
    if (extension && ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
      return `.${extension}`;
    }
  } catch (e) {
    console.error(`Erreur lors de l'extraction de l'extension: ${e}`);
  }
  return '.jpg'; // Extension par défaut si aucune extension n'est trouvée ou reconnue
}