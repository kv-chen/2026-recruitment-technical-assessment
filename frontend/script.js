import buildings from './data.json' with {type: 'json'};

const template = document.getElementById('tile-template');

const buildingTiles = buildings.map((building) => {
    const tile = template.content.firstElementChild.cloneNode(true);
    tile.querySelector('.building-label').textContent = building.name;
    tile.querySelector('.rooms-counter').textContent = building.rooms_available + ' rooms available';

    const img = tile.querySelector('img');
    img.src = 'assets/' + building.building_picture;
    img.alt = 'Photo of ' + building.name;
    img.addEventListener('error', () => { tile.replaceChildren(img) });

    return tile;
});

const gallery = document.querySelector('.building-gallery');
const placeholders = [document.createElement('li'), document.createElement('li')];
gallery.replaceChildren(...buildingTiles, ...placeholders);

{
    let isDoorOpen = true;
    document.querySelector('.home-button img').addEventListener('click', (event) => {
        isDoorOpen = !isDoorOpen;
        const filename = isDoorOpen ? 'freeRoomsLogo' : 'freeroomsDoorClosed';
        event.currentTarget.src = `assets/${filename}.png`;
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
