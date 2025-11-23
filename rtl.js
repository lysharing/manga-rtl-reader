// rtl.js
(async function() {

    // éviter double injection
    if (window.__MANGA_RTL_ACTIVE) {
        location.reload();
        return;
    }
    window.__MANGA_RTL_ACTIVE = true;
    let isDoublePage = false;

    // ------------------------------
    // RÉCUPÉRATION DES IMAGES
    // ------------------------------
    const probableContainers = [
        '#container', '.container', '.reader', '.chapter-content',
        '.reading-content', '#chapter', '#chapter-body', '.entry-content',
        '.page-break', '.image-container', '.vung-doc', '.manga-images'
    ];

    let imgs = [];

    for (const sel of probableContainers) {
        const node = document.querySelector(sel);
        if (node) {
            const found = Array.from(node.querySelectorAll('img'));
            if (found.length > 0) {
                imgs = found;
                break;
            }
        }
    }

    // fallback : chercher larges images
    if (!imgs.length) {
        imgs = Array.from(document.querySelectorAll('img'))
            .filter(i => i.naturalWidth > 200 && i.naturalHeight > 200);
    }

    if (!imgs.length) {
        alert("Aucune image trouvée pour la lecture RTL.");
        return;
    }

    // ------------------------------
    // PRÉCHARGEMENT DES IMAGES
    // ------------------------------
    console.log("Chargement des images...");

    // Créer un loader
    const loader = document.createElement('div');
    Object.assign(loader.style, {
        position: 'fixed',
        inset: '0',
        background: '#0b0b0b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: '18px',
        zIndex: 2147483647,
        fontFamily: 'Arial, sans-serif'
    });
    loader.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 24px; margin-bottom: 10px;">📖 Chargement du manga...</div>
            <div id="loading-progress">0/${imgs.length} images</div>
        </div>
    `;
    document.body.appendChild(loader);

    // Forcer le chargement de toutes les images
    let loadedCount = 0;
    const progressEl = document.getElementById('loading-progress');

    const imagePromises = imgs.map((img, index) => {
        return new Promise((resolve) => {
            if (img.complete && img.naturalHeight !== 0) {
                // Image déjà chargée
                loadedCount++;
                progressEl.textContent = `${loadedCount}/${imgs.length} images`;
                resolve();
            } else {
                // Attendre le chargement
                img.onload = () => {
                    loadedCount++;
                    progressEl.textContent = `${loadedCount}/${imgs.length} images`;
                    resolve();
                };
                img.onerror = () => {
                    loadedCount++;
                    progressEl.textContent = `${loadedCount}/${imgs.length} images`;
                    resolve(); // Continue même si erreur
                };
            }
        });
    });

    // Attendre que toutes les images soient chargées
    await Promise.all(imagePromises);

    // Supprimer le loader
    loader.remove();

    console.log("Toutes les images sont chargées !");
    
    // ------------------------------
    // CRÉATION DU VIEWER
    // ------------------------------
    const viewer = document.createElement('div');
    viewer.id = "manga-rtl-viewer";

    Object.assign(viewer.style, {
        position: 'fixed',
        inset: '0',
        background: '#0b0b0b',
        display: 'flex',
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'flex-start',
        overflowX: 'auto',
        overflowY: 'hidden',
        gap: '0', //'24px',
        padding: '0', //'20px',
        zIndex: 2147483647,
        scrollBehavior: 'smooth',
        scrollSnapType: 'x mandatory',
        scrollSnapStop: 'always'  // ✅ Force l'arrêt sur chaque page
    });

    // ------------------------------
    // BARRE DE CONTRÔLE
    // ------------------------------
    const bar = document.createElement('div');
    bar.id = 'manga-rtl-bar';

    Object.assign(bar.style, {
        position: 'fixed',
        top: '10px',
        left: '10px',
        zIndex: 2147483648,
        padding: '8px 12px',
        background: 'rgba(255,255,255,0.08)',
        color: '#fff',
        borderRadius: '8px',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        backdropFilter: 'blur(4px)'
    });

    bar.innerHTML = `
        Lecture : <b>Left ⬅️ Right</b>
        &nbsp;&nbsp;
        <span id="manga-rtl-page-indicator" style="
            background: rgba(0,0,0,0.3);
            padding: 4px 10px;
            border-radius: 4px;
            font-weight: bold;
        ">Page 1/${imgs.length}</span>
        &nbsp;
        <button id="manga-rtl-double" style="
            background: #0dd794ff;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
        ">📖 Double</button>
        <button id="manga-rtl-close" style="
            background: #b921d4ff;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            margin-left: 8px;
        ">Quit</button>
    `;

    // ------------------------------
    // FONCTION : Créer les pages
    // ------------------------------
    function createPages() {
        // 1. Sauvegarder la page actuelle AVANT de vider
        const pages = document.querySelectorAll('.manga-rtl-page');
        let currentPageNumber = 1;
        
        if (pages.length > 0) {
            const viewerCenter = viewer.scrollLeft + (viewer.clientWidth / 2);
            
            // Détecter le mode ACTUEL (avant changement) en comptant les images
            const firstPage = pages[0];
            const wasDoublePage = firstPage.querySelectorAll('img').length === 2;
            
            pages.forEach((page, index) => {
                const pageLeft = page.offsetLeft;
                const pageRight = pageLeft + page.offsetWidth;
                
                if (viewerCenter >= pageLeft && viewerCenter <= pageRight) {
                    if (wasDoublePage) {
                        // On ÉTAIT en double page
                        currentPageNumber = imgs.length - index;
                    } else {
                        // On ÉTAIT en simple page
                        currentPageNumber = imgs.length - index;
                    }
                }
            });
        }
        
        // 2. Vider le viewer
        viewer.innerHTML = '';
        
        if (isDoublePage) {
            // Mode double page DYNAMIQUE : chaque page peut être avec sa voisine
            for (let i = 0; i < imgs.length - 1; i++) {
                const wrapper = document.createElement('div');
                wrapper.className = 'manga-rtl-page';

                Object.assign(wrapper.style, {
                    display: 'flex',
                    flexDirection: 'row-reverse',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '100vw',
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: '#000',
                    flexShrink: '0',
                    scrollSnapAlign: 'center',
                    scrollSnapStop: 'always',
                    gap: '10px'
                });

                // Image de droite (page i)
                const copy1 = imgs[i].cloneNode(true);
                copy1.loading = 'eager';
                copy1.style.maxHeight = '96vh';
                copy1.style.maxWidth = '48vw';
                copy1.style.objectFit = 'contain';
                wrapper.appendChild(copy1);

                // Image de gauche (page i+1)
                const copy2 = imgs[i + 1].cloneNode(true);
                copy2.loading = 'eager';
                copy2.style.maxHeight = '96vh';
                copy2.style.maxWidth = '48vw';
                copy2.style.objectFit = 'contain';
                wrapper.appendChild(copy2);

                viewer.appendChild(wrapper);
            }
            
            // Ajouter la dernière page seule
            const lastWrapper = document.createElement('div');
            lastWrapper.className = 'manga-rtl-page';
            
            Object.assign(lastWrapper.style, {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '100vw',
                width: '100vw',
                height: '100vh',
                backgroundColor: '#000',
                flexShrink: '0',
                scrollSnapAlign: 'center',
                scrollSnapStop: 'always'
            });
            
            const lastCopy = imgs[imgs.length - 1].cloneNode(true);
            lastCopy.loading = 'eager';
            lastCopy.style.maxHeight = '96vh';
            lastCopy.style.maxWidth = '48vw';
            lastCopy.style.objectFit = 'contain';
            lastWrapper.appendChild(lastCopy);
            viewer.appendChild(lastWrapper);
        } else {
            // Mode simple page : 1 image par wrapper
            imgs.forEach(img => {
                const wrapper = document.createElement('div');
                wrapper.className = 'manga-rtl-page';

                Object.assign(wrapper.style, {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '100vw',
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: '#000',
                    flexShrink: '0',
                    scrollSnapAlign: 'center',
                    scrollSnapStop: 'always'
                });

                const copy = img.cloneNode(true);
                copy.loading = 'eager';
                copy.style.maxHeight = '96vh';
                copy.style.maxWidth = '98vw';
                copy.style.objectFit = 'contain';

                wrapper.appendChild(copy);
                viewer.appendChild(wrapper);
            });
        }
        
        // 3. Restaurer la position en fonction du nouveau mode
        setTimeout(() => {
            if (pages.length === 0) {
                // Premier lancement : commencer au début (droite en RTL)
                viewer.scrollLeft = 0;
            } else if (isDoublePage) {
                // Passer en mode double : trouver le wrapper contenant currentPageNumber
                const wrapperIndex = imgs.length - currentPageNumber;
                const targetWrapper = document.querySelectorAll('.manga-rtl-page')[wrapperIndex];
                if (targetWrapper) {
                    targetWrapper.scrollIntoView({ block: 'nearest', inline: 'center' });
                }
            } else {
                // Passer en mode simple : aller à la page exacte
                const pageIndex = imgs.length - currentPageNumber;
                const targetWrapper = document.querySelectorAll('.manga-rtl-page')[pageIndex];
                if (targetWrapper) {
                    targetWrapper.scrollIntoView({ block: 'nearest', inline: 'center' });
                }
            }
            updatePageIndicator();
        }, 50);
    }

    // ------------------------------
    // REMPLACEMENT OF THE BODY
    // ------------------------------
    const backup = document.createElement('div');
    backup.id = 'manga-rtl-backup';
    backup.style.display = 'none';
    backup.innerHTML = document.body.innerHTML;

    document.documentElement.style.overflow = 'hidden';
    document.body.innerHTML = '';
    document.body.appendChild(viewer);
    document.body.appendChild(bar);

    // ------------------------------
    // Mise à jour indicateur de page
    // ------------------------------
    const pageIndicator = document.getElementById('manga-rtl-page-indicator');

    function updatePageIndicator() {
        const pages = document.querySelectorAll('.manga-rtl-page');
        
        let currentPage = 1;
        const viewerCenter = viewer.scrollLeft + (viewer.clientWidth / 2);
        
        pages.forEach((page, index) => {
            const pageLeft = page.offsetLeft;
            const pageRight = pageLeft + page.offsetWidth;
            
            if (viewerCenter >= pageLeft && viewerCenter <= pageRight) {
                if (isDoublePage) {
                    // En mode double dynamique : l'index correspond directement à la page de droite
                    currentPage = imgs.length - index;
                } else {
                    currentPage = imgs.length - index;
                }
            }
        });
        
        pageIndicator.textContent = `Page ${currentPage}/${imgs.length}`;
    }

    viewer.addEventListener('scroll', updatePageIndicator);
    updatePageIndicator(); // Initialisation
    
    // Créer les pages initiales
    createPages();    

    // ------------------------------
    // BOUTON : Quit
    // ------------------------------
    document.getElementById('manga-rtl-close').addEventListener('click', () => {
        location.reload();
    });

    // ------------------------------
    // BOUTON : Toggle Double Page
    // ------------------------------
    document.getElementById('manga-rtl-double').addEventListener('click', () => {
        isDoublePage = !isDoublePage;
        const btn = document.getElementById('manga-rtl-double');
        btn.textContent = isDoublePage ? '📄 Simple' : '📖 Double';
        createPages();
    });

    // ------------------------------
    // Navigation clavier (← → A D Espace Échap)
    // ------------------------------
    window.addEventListener('keydown', (e) => {
        const step = window.innerWidth;

        // ⬅ Left Row / A = Next page (RTL)
        if (['ArrowLeft', 'a', 'A'].includes(e.key)) {
            e.preventDefault();
            viewer.scrollBy({ left: -step, behavior: 'smooth' });
        }
        // ➡ Right Row / D = Previous page (RTL)
        if (['ArrowRight', 'd', 'D'].includes(e.key)) {
            e.preventDefault();
            viewer.scrollBy({ left: step, behavior: 'smooth' });
        }
        
        // Espace = Next page (RTL)
        if (e.key === ' ' && e.shiftKey) {
            e.preventDefault();
            viewer.scrollBy({ left: -step, behavior: 'smooth' });
        }
        
        // Shift + Espace = Previous page (RTL)
        if (e.key === ' ' && !e.shiftKey) {
            e.preventDefault();
            viewer.scrollBy({ left: step, behavior: 'smooth' });
        }
        
        // Échap = Quit
        if (e.key === 'Escape') {
            e.preventDefault();
            location.reload();
        }
    }, { passive: false });

    // ------------------------------
    // Début en lecture droite → gauche
    // ------------------------------
    viewer.scrollLeft = 0;
})(); 
