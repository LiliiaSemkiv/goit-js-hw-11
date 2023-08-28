import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import axios from "axios";



const form = document.getElementById('search-form');
const galleryCard = document.querySelector('.gallery');
// const loadMore = document.querySelector('.load-more');
const spanLimit = document.querySelector('.span-js');

form.addEventListener('submit', onSubmit);

let page = 1;
let value = '';
let totalHitsImg = 0;

function onSubmit(e) {
  e.preventDefault();
  page = 1;
  clearContent();

  value = e.currentTarget.elements.searchQuery.value.trim();
  if (!value) 
    return Notify.info('Sorry, there are no images matching your search query. Please try again.');

takeImage();
}; 

function clearContent() { 
  totalHitsImg = 0;
  spanLimit.textContent = '';
  galleryCard.innerHTML = '';
}


async function takeImage() {
  try {
    const response = await onGetImage(page, value);
    form.reset();
    
    if (response.totalHits) {
      Notify.success(`Hooray! We found ${response.totalHits} images.`);
    }

    if (response.totalHits === 0) {
      return Notify.failure('Sorry, there are no images matching your search query. Please try again.');
    };

    for (let i = 0; i < response.hits.length; i++) {
      const newImage = createMarkup([response.hits[i]]);
      galleryCard.insertAdjacentHTML('beforeend', newImage);
      lightbox.refresh();
    }
    page += 1;
   
    totalHitsImg += response.hits.length;

    if (totalHitsImg >= response.totalHits) {
      spanLimit.textContent = "We're sorry, but you've reached the end of search results."
    }
  } catch (error) {
  Notify.failure('Sorry, there are no images matching your search query. Please try again.');
}}


window.addEventListener('scroll', () => {
  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight) {
    takeImage();
  };
});

let lightbox = new SimpleLightbox('.gallery a',
    {
        captionDelay: 250,
  });

  function createMarkup(hits) {
    return hits.map(
    (
    { webformatURL, largeImageURL, tags, likes, views, comments, downloads }
    ) => `<div class="photo-card">
  <a href="${largeImageURL}">
    <img src="${webformatURL}" alt="${tags}" loading="lazy" />
    </a>
  <div class="info">
    <p class="info-item">
      <b>Likes:</b>
      ${likes}
    </p>
    <p class="info-item">
      <b>Views:</b>
      ${views}
    </p>
    <p class="info-item">
      <b>Comments:</b>
      ${comments}
    </p>
    <p class="info-item">
      <b>Downloads:</b>
      ${downloads}
    </p>
  </div>
</div>`)
        .join('');
};


const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '38889526-086820321c5fcbdbccd359080'; 


async function onGetImage(page = 1, value) {

         axios.defaults.params = {
             key: API_KEY,
             q: value,
             image_type: 'photo',
             orientation: 'horizontal',
             safesearch: true,
             page,
             per_page: 40,
         };
    
         const response = await axios.get(BASE_URL);
     return response.data;
}