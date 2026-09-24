// 20260924-3x3-no-bag-v7
// 20260924-v6-clean-mobile-covers
const app=document.getElementById('app');
let db={products:[]};
// Stable release key lets phones cache category covers between visits.
// Change it only when catalog assets are deliberately replaced.
const ASSET_VERSION='20260924142139878804';

const MENU_ITEMS=[
  ['SUIT','Suits'],['SHIRT','Shirts'],['PANTS','Jeans'],
  ['JACKET','Jackets'],['SKIRT','Skirts'],['OUTFIT','Outerwear'],
  ['KNITWEAR','Knitwear'],['BIG_SIZE','Plus Size'],['DRESS','Dresses']
];

const clickIcon=()=>`<span class="click-icon" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M13.2 15.4V6.9a2.2 2.2 0 0 1 4.4 0v7.2-2.1a2.1 2.1 0 0 1 4.2 0v1.1a2.1 2.1 0 0 1 4.2 0v1.4a2.1 2.1 0 0 1 4.2 0v5.4c0 5.4-3.2 8.4-8.1 8.4h-2.4c-3.1 0-5.4-1.4-7-3.9l-4.1-6.5a2.3 2.3 0 0 1 3.6-2.8l1 1.3Z"/><path d="M7 5.8 4.8 3.6M11.3 3.9V1M6 10H2.8"/></svg></span>`;
const telegramIcon=()=>`<span class="telegram-icon" aria-hidden="true"><svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="15"/><path d="m7.2 15.4 16.9-6.5c.8-.3 1.5.2 1.2 1.5l-2.9 13.5c-.2 1-1 1.3-1.8.8l-4.4-3.3-2.1 2.1c-.2.2-.4.4-.8.4l.3-4.5 8.2-7.4c.4-.3-.1-.5-.5-.2l-10.1 6.4-4.4-1.4c-1-.3-1-1 .4-1.4Z"/></svg></span>`;

const menuButton=(key,en)=>`<button class="lux-button menu-category" data-c="${key}" aria-label="${en}"><span class="lux-copy"><span class="lux-en">${en}</span></span>${clickIcon()}</button>`;
const categoriesButton=()=>`<button class="lux-button categories-button" aria-label="Categories"><span class="lux-copy"><span class="lux-en">Categories</span></span>${clickIcon()}</button>`;

const categoryTile=([key,en])=>`<button class="mobile-cover-v6" data-c="${key}" aria-label="${en}"><img class="mobile-cover-v6-img" src="assets/covers/${key}.webp?v=${ASSET_VERSION}" alt="${en}"><span class="mobile-cover-v6-label">${en}</span></button>`;
const searchButton=()=>`<button class="catalog-search-button" type="button" aria-label="Search by product code"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.4"></circle><path d="m16 16 5 5"></path></svg><span>Search by code</span></button>`;
const categoryMenuMarkup=(extraClass='')=>`<div class="category-home ${extraClass}">
<section class="category-hero"><img src="assets/menu.jpg?v=${ASSET_VERSION}" alt="D.SHE Fall Winter 2026"></section>
<section class="category-section">${searchButton()}<div class="category-grid">${MENU_ITEMS.map(categoryTile).join('')}</div></section>
<section class="campaign-bottom" aria-label="D.SHE campaign"><img src="assets/bottom.jpg?v=${ASSET_VERSION}" alt="D.SHE campaign" loading="lazy" decoding="async"></section>
</div>`;
const openCategoryLink=cat=>{if(cat==='BAG'){window.location.href='https://t.me/DisheBag';return;}openCategory(cat)};
const bindCategoryTiles=(scope=document)=>scope.querySelectorAll('.mobile-cover-v6').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();openCategoryLink(b.dataset.c)}));

fetch('data/catalog.json',{cache:'no-store'}).then(r=>r.json())
  .then(catalog=>{db=catalog;home()})
  .catch(()=>app.innerHTML='<div class="empty">CATALOG ERROR</div>');

const exists=src=>new Promise(ok=>{
  const i=new Image();
  i.onload=()=>ok(true);
  i.onerror=()=>ok(false);
  i.src=src+'?v='+Date.now();
});

async function legacyHome(){
  const has=await exists('assets/menu.jpg');
  if(!has){app.innerHTML='<div class="empty">MENU.JPG NOT FOUND</div>';return;}
  const buttons=MENU_ITEMS.map(item=>menuButton(...item)).join('');
  app.innerHTML=`<section class="screen home"><div class="menu-stage"><img class="menu-image" src="assets/menu.jpg?v=${Date.now()}" alt="D.SHE categories"><header class="brand-hero"><img class="brand-logo" src="assets/dishe-logo.png?v=${Date.now()}" alt="D•she"><div class="season-kicker"><span></span><b>NEW SEASON</b><span></span></div><div class="season-title">FALL / WINTER 2026</div></header><div class="menu-buttons">${buttons}</div></div></section>`;
  document.querySelectorAll('.menu-category').forEach(b=>b.addEventListener('click',e=>{
    e.preventDefault();
    openCategoryLink(b.dataset.c);
  }));
}

async function home(){
  app.innerHTML=`<section class="screen home">${categoryMenuMarkup()}</section>`;
  bindCategoryTiles();
  document.querySelector('.catalog-search-button')?.addEventListener('click',openProductSearch);
}

const normalizeCode=value=>String(value||'').toUpperCase().replace(/[^A-Z0-9]/g,'');

function openProductSearch(){
  const dialog=document.createElement('div');
  dialog.className='catalog-search-overlay';
  dialog.innerHTML=`<form class="catalog-search-dialog" novalidate><button class="catalog-search-close" type="button" aria-label="Close">×</button><span class="catalog-search-eyebrow">D.SHE CATALOGUE</span><h2>Find your model</h2><p>Enter the product code to see all available colours.</p><label><span>Product code</span><input name="code" type="search" autocomplete="off" autocapitalize="characters" placeholder="Example: CT00379101" autofocus></label><div class="catalog-search-error" aria-live="polite"></div><button class="catalog-search-submit" type="submit">Show model</button></form>`;
  app.append(dialog);
  const form=dialog.querySelector('form');
  const input=form.elements.code;
  const close=()=>dialog.remove();
  dialog.querySelector('.catalog-search-close').addEventListener('click',close);
  dialog.addEventListener('click',event=>{if(event.target===dialog)close()});
  form.addEventListener('submit',event=>{
    event.preventDefault();
    const code=normalizeCode(input.value);
    const matches=db.products.filter(product=>normalizeCode(product.code)===code);
    const error=dialog.querySelector('.catalog-search-error');
    if(!code){error.textContent='Enter a product code.';return;}
    if(!matches.length){error.textContent='This code was not found in the catalogue.';return;}
    dialog.remove();
    openSearchResults(code,matches);
  });
  requestAnimationFrame(()=>input.focus());
}

function openSearchResults(code,products){
  app.innerHTML=`<section class="screen viewer search-viewer"><div class="search-results-label"><button type="button" aria-label="Back to categories">←</button><span>${code} · ${products.length} ${products.length===1?'colour':'colours'}</span></div><div class="slides">${products.map(product=>`<article class="slide product-slide"><div class="product-stage"><img src="${product.image}?v=${ASSET_VERSION}" alt="${product.title||product.code}" decoding="async">${categoriesButton()}</div></article>`).join('')}</div></section>`;
  document.querySelector('.search-results-label button').addEventListener('click',home);
  document.querySelectorAll('.categories-button').forEach(button=>button.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();home()}));
}

async function openCategory(cat){
  const selectedItem=MENU_ITEMS.find(([key])=>key===cat);
  if(!selectedItem){home();return;}
  const categorySequence=MENU_ITEMS;
  const loaderSlide=(key,comingSoon=false)=>{
    const [,en]=MENU_ITEMS.find(([itemKey])=>itemKey===key);
    return `<article class="slide category-loader-slide"><div class="category-loader"><img src="assets/category-loader.webp?v=${ASSET_VERSION}" alt="D.SHE ${en}"><span class="loader-diamond" aria-label="Loading"><svg viewBox="0 0 90 66" aria-hidden="true"><defs><linearGradient id="redGem" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ff8084"/><stop offset=".42" stop-color="#e20d1c"/><stop offset="1" stop-color="#690008"/></linearGradient></defs><path class="gem-shadow" d="M19 17h52l13 17-39 29L6 34l13-17Z"/><path class="gem-crown" d="M19 17h52l13 17H6l13-17Z"/><path class="gem-left" d="M6 34h25l14 29L6 34Z"/><path class="gem-center" d="M31 34h28L45 63 31 34Z"/><path class="gem-right" d="M59 34h25L45 63l14-29Z"/><path class="gem-top-left" d="m19 17 12 17 14-17-26 0Z"/><path class="gem-top-center" d="m45 17 14 17 12-17H45Z"/><path class="gem-glint" d="m25 19 7 11 8-11H25Z"/><path class="gem-rim" d="M19 17h52l13 17-39 29L6 34l13-17ZM6 34h78M31 34l14 29 14-29M19 17l12 17 14-17 14 17 12-17"/></svg></span>${comingSoon?'<span class="loader-coming-soon">COMING SOON</span>':''}</div></article>`;
  };
  app.innerHTML=`<section class="screen viewer"><div class="slides">${loaderSlide(cat)}</div></section>`;
  await new Promise(resolve=>setTimeout(resolve,2000));
  const selectedSlides=[];
  const arrowIcon=`<svg class="category-arrow-icon" viewBox="0 0 30 52" aria-hidden="true"><path d="M25 5 5 26l20 21"/></svg>`;
  const firstCategory=categorySequence[0];
  selectedSlides.push(`<article class="slide category-end-slide category-start-slide"><div class="category-end"><img src="assets/category-loader.webp?v=${ASSET_VERSION}" alt="D.SHE Categories"><div class="category-neighbour category-previous">${arrowIcon}<small>Menu</small></div><button class="category-return-button" type="button"><span>Categories</span>${clickIcon()}</button><div class="category-neighbour category-next"><small>${firstCategory[1]}</small>${arrowIcon}</div></div></article>`);
  let activeStartIndex=0;
  categorySequence.forEach(([key],sequenceIndex)=>{
    const products=db.products.filter(p=>(p.categories||[p.category]).includes(key));
    if(key===cat) activeStartIndex=selectedSlides.length;
    if(!products.length){
      return;
    }else{
      selectedSlides.push(...products.map(p=>`<article class="slide product-slide"><div class="product-stage"><img data-src="${p.image}?v=${ASSET_VERSION}" alt="${p.title||p.code}" loading="lazy" decoding="async">${categoriesButton()}</div></article>`));
    }
    const nextItem=categorySequence[sequenceIndex+1];
    const nextLabel=nextItem?nextItem[1]:'Contact us';
    selectedSlides.push(`<article class="slide category-end-slide"><div class="category-end"><img src="assets/category-loader.webp?v=${ASSET_VERSION}" alt="D.SHE Categories"><div class="category-neighbour category-previous">${arrowIcon}<small>${categorySequence[sequenceIndex][1]}</small></div><button class="category-return-button" type="button"><span>Categories</span>${clickIcon()}</button><div class="category-neighbour category-next"><small>${nextLabel}</small>${arrowIcon}</div></div></article>`);
  });
  selectedSlides.push(`<article class="slide category-end-slide"><div class="category-end"><img src="assets/category-loader.webp?v=${ASSET_VERSION}" alt="D.SHE Contact us"><a class="category-return-button category-contact-button" href="https://dishesocial.carrd.co/" target="_blank" rel="noopener"><span>Contact us</span>${clickIcon()}</a><button class="category-return-button category-home-button" type="button"><span>Menu</span>${clickIcon()}</button></div></article>`);
  app.innerHTML=`<section class="screen viewer"><div class="slides">${selectedSlides.join('')}</div><div class="hint"></div></section>`;
  document.querySelectorAll('.categories-button,button.category-return-button').forEach(b=>b.addEventListener('click',e=>{
    e.preventDefault();
    e.stopPropagation();
    home();
  }));
  const selectedEl=document.querySelector('.slides');
  const loadSelectedImages=(center,radius=2)=>{
    const first=Math.max(0,center-radius);
    const last=Math.min(selectedEl.children.length-1,center+radius);
    for(let i=first;i<=last;i++) selectedEl.children[i].querySelectorAll('img[data-src]').forEach(img=>{
      img.src=img.dataset.src;
      img.removeAttribute('data-src');
    });
  };
  const showActiveCategoryCover=()=>{selectedEl.scrollLeft=activeStartIndex*selectedEl.clientWidth};
  loadSelectedImages(activeStartIndex);
  showActiveCategoryCover();
  requestAnimationFrame(showActiveCategoryCover);
  selectedEl.addEventListener('scroll',()=>loadSelectedImages(Math.round(selectedEl.scrollLeft/selectedEl.clientWidth)),{passive:true});
  return;

  const slides=[];
  let startIndex=1;

  slides.push(`<article class="slide menu-return-slide">${categoryMenuMarkup('category-return-stage')}</article>`);

  MENU_ITEMS.forEach(([key,en])=>{
    if(key===cat)startIndex=slides.length;
    slides.push(`<article class="slide cover" data-category="${key}"><div class="cover-stage"><img src="assets/menu.jpg?v=${ASSET_VERSION}" alt="${en}"><div class="cover-copy"><img class="cover-logo" src="assets/dishe-logo.png?v=${ASSET_VERSION}" alt="D.SHE"><div class="cover-new-season">NEW SEASON</div><div class="cover-season">FALL / WINTER 2026</div><div class="cover-title">${en}</div><div class="cover-divider"><span></span><svg class="cover-diamond" viewBox="0 0 64 48" aria-hidden="true"><path d="M12 5h40l9 13-29 27L3 18 12 5Z"/><path d="m12 5 8 13 12-13 12 13 8-13M3 18h58M20 18l12 27 12-27"/></svg><span></span></div><button class="cover-swipe" type="button" aria-label="Categories">${clickIcon()}</button></div></div></article>`);

    db.products
      .filter(p=>(p.categories||[p.category]).includes(key))
      .forEach(p=>slides.push(`<article class="slide product-slide"><div class="product-stage"><img data-src="${p.image}?v=${ASSET_VERSION}" alt="${p.title||p.code}" loading="lazy" decoding="async">${categoriesButton()}</div></article>`));
  });

  slides.push(`<article class="slide final-contact-slide"><div class="cover-stage"><img src="assets/menu.jpg?v=${ASSET_VERSION}" alt="D.SHE Contact Us"><div class="cover-copy end-copy"><img class="cover-logo" src="assets/dishe-logo.png?v=${ASSET_VERSION}" alt="D.SHE"><div class="cover-new-season">NEW SEASON</div><div class="cover-season">FALL / WINTER 2026</div><div class="cover-divider"><span></span><svg class="cover-diamond" viewBox="0 0 64 48" aria-hidden="true"><path d="M12 5h40l9 13-29 27L3 18 12 5Z"/><path d="m12 5 8 13 12-13 12 13 8-13M3 18h58M20 18l12 27 12-27"/></svg><span></span></div><button class="contact-button" type="button"><span class="lux-copy"><span class="lux-en">CONTACT US</span><span class="lux-ru">СВЯЖИТЕСЬ С НАМИ</span></span>${clickIcon()}</button></div></div></article>`);

  app.innerHTML=`<section class="screen viewer"><div class="slides">${slides.join('')}</div><div class="hint"></div></section>`;

  document.querySelectorAll('.categories-button').forEach(b=>b.addEventListener('click',e=>{
    e.preventDefault();
    e.stopPropagation();
    home();
  }));

  document.querySelectorAll('.cover-swipe').forEach(b=>b.addEventListener('click',e=>{
    e.preventDefault();
    e.stopPropagation();
    home();
  }));

  bindCategoryTiles(document.querySelector('.menu-return-slide'));

  const el=document.querySelector('.slides');
  const loadSlideImages=(center,radius=2)=>{
    const first=Math.max(0,center-radius);
    const last=Math.min(el.children.length-1,center+radius);
    for(let i=first;i<=last;i++){
      el.children[i].querySelectorAll('img[data-src]').forEach(img=>{
        img.src=img.dataset.src;
        img.removeAttribute('data-src');
      });
    }
  };
  const showSelectedCover=()=>{el.scrollLeft=startIndex*el.clientWidth};
  loadSlideImages(startIndex);
  showSelectedCover();
  requestAnimationFrame(showSelectedCover);

  let returnTimer;
  el.addEventListener('scroll',()=>{
    loadSlideImages(Math.round(el.scrollLeft/el.clientWidth));
    clearTimeout(returnTimer);
    returnTimer=setTimeout(()=>{
      if(el.scrollLeft<el.clientWidth*.12)home();
    },120);
  },{passive:true});
}
