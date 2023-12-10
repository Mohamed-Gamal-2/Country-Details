'use strict';

const btn = document.querySelector('.btn-country');
const countriesContainer = document.querySelector('.countries');
const form = document.querySelector('.searchGroup');
const input = document.querySelector('.searchInput');
const header = document.querySelector('.searchContainer__header');
const error = document.querySelector('.error');
let map;
function clearData() {
  error.style.display = 'none';
  error.innerHTML = '';
  countriesContainer.innerHTML = '';
  input.value = '';
}

function renderMap(lat, lng) {
  map = L.map('map').setView([lat, lng], 5);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
}

function navigateMap(lat, lng, country) {
  map.setView([lat, lng], 4, {
    animate: true,
    pan: {
      duration: 1,
    },
  });
  L.marker([lat, lng]).addTo(map).bindPopup(country).openPopup();
  map.setView([lat, lng], 5);
}

function renderCountry(data, clasName = '') {
  const html = `<article class="country ${clasName}">
  <img class="country__img" src="${data.flags.png}" />
  <div class="country__data">
    <h3 class="country__name">${data.name.common}</h3>
    <h4 class="country__region">${data.region}</h4>
    <p class="country__row"><span>👨‍👩‍👦‍👦</span>${(
      +data.population / 1000000
    ).toFixed(1)}</p>
    <p class="country__row"><span>🗣</span>${
      Object.entries(data.languages)[0][1]
    }</p>
    <p class="country__row"><span>💰</span>${
      Object.entries(data.currencies)[0][1].name
    }</p>
  </div>
</article>`;

  document.getElementById('countries').insertAdjacentHTML('beforeend', html);

  countriesContainer.style.opacity = 1;
}

function getCountry(country) {
  let data;
  clearData();
  if (country == 'israel') country = 'Palestine';
  fetch(`https://restcountries.com/v3.1/name/${country}`)
    .then(res => {
      if (!res.ok) {
        error.innerHTML = 'Country not found';
        error.style.display = 'block';
        throw new Error('Country not found');
      }

      return res.json();
    })
    .then(res => {
      data = res[0];
      renderCountry(data);
      map || renderMap(data.latlng[0], data.latlng[1]);
      navigateMap(data.latlng[0], data.latlng[1], data.name.common);
      let neighbours = data?.borders;
      if (!neighbours) return;

      neighbours.forEach(country => {
        fetch(`https://restcountries.com/v3.1/alpha?codes=${country}`)
          .then(res => res.json())
          .then(
            res =>
              res[0].name.common == 'Israel' ||
              renderCountry(res[0], 'neighbour')
          );
      });
    })
    .catch(err => console.error(err));
}

function whereAmI() {
  navigator.geolocation.getCurrentPosition(res => {
    const {
      coords: { latitude, longitude },
    } = res;
    fetch(
      `https://geocode.xyz/${latitude},${longitude}?geoit=json&auth=758354607452140855735x34632`
    )
      .then(res => res.json())
      .then(res => {
        header.innerHTML = `Are you currently in ${res.country}?  <i class="fa-solid location fa-location-crosshairs"></i>`;
        getCountry(res.country);
        document.querySelector('.location').addEventListener('click', () => {
          getCountry(res.country);
        });
      });
  });
}

whereAmI();

form.addEventListener('submit', e => {
  e.preventDefault();
  getCountry(input.value.toLowerCase());
});
