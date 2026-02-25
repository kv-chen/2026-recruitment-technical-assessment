import buildings from './data.json' with {type: 'json'};

const template = document.getElementById('tile-template');

const buildingTiles = buildings.map((building) => {
    const tile = template.content.firstElementChild.cloneNode(true);
    const buildingLabel = tile.querySelector('.building-label');
    const roomsCounter = tile.querySelector('.rooms-counter');
    buildingLabel.textContent = building.name;
    roomsCounter.textContent = building.rooms_available + ' rooms available';

    const img = tile.querySelector('img');
    img.src = 'assets/' + building.building_picture;
    img.alt = 'Photo of ' + building.name;
    img.addEventListener('error', () => {
        buildingLabel.style.display = 'none';
        roomsCounter.style.display = 'none';
    });

    return tile;
});

const gallery = document.querySelector('.building-gallery');
const searchBuildings = (search='') => (search === '')
    ? buildingTiles
    : buildingTiles.filter(tile => tile
        .querySelector('.building-label').textContent
        .toLowerCase()
        .includes(search.toLowerCase())
    );
gallery.replaceChildren(...searchBuildings());

{
    let isDoorOpen = true;
    document.querySelector('.home-button img').addEventListener('click', (e) => {
        isDoorOpen = !isDoorOpen;
        const filename = isDoorOpen ? 'freeRoomsLogo' : 'freeroomsDoorClosed';
        e.currentTarget.src = `assets/${filename}.png`;
    });
}

{
    let isDarkMode = false;
    const darkModeButton = document.querySelector('.dark-mode-button');
    const toggleDarkMode = () => {
        isDarkMode = !isDarkMode;
        document.body.style.setProperty('--background-color', isDarkMode ? 'black' : 'white');
        document.body.style.setProperty('--text-color', isDarkMode ? 'white' : 'black');
        document.querySelector('.search-bar img').classList.toggle('dark-mode');
        darkModeButton.classList.toggle('selected');
    };
    darkModeButton.addEventListener('click', toggleDarkMode);
    if (window.matchMedia('prefers-color-scheme: dark').matches) toggleDarkMode();
}

const searchBar = document.querySelector('.search-bar input');
searchBar.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        gallery.replaceChildren(...searchBuildings(e.currentTarget.value.trim()));
    }
});
searchBar.addEventListener('input', (e) => {
    if (e.currentTarget.value === "") {
        gallery.replaceChildren(...searchBuildings());
    }
});
