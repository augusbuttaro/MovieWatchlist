//VARIABLES
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

const appSettings = {
    databaseURL: "https://movie-watchlis-default-rtdb.firebaseio.com/"
}

const app = initializeApp(appSettings)
const database = getDatabase(app)
const moviesInDB = ref(database, "movies")

const myWatchlistBtn = document.getElementById("my-watchlist-btn")
const findFilmBtn = document.getElementById("find-film-btn")
const searchBtn = document.getElementById("search-btn")
const letsAddBtn = document.getElementById("lets-add-btn")
let searchInput = document.getElementById("search-input")
const adddBtn = document.getElementById("add-btn")
const watchlistContainer = document.getElementById("watchlist-container")

let moviesArray;

//DATABASE

onValue(moviesInDB, function(snapshot) {
    moviesArray = Object.entries(snapshot.val())
    let moviesToAppendArr = Object.values(snapshot.val())
    for (let i = 0; i < moviesArray.length; i++) {
        let currentMovie = moviesArray[i]
        let currentMovieID = currentMovie[0]
        let currentMovieValue = currentMovie[1]
        console.log(moviesArray)
    }
        appendToMoviesListEl(moviesToAppendArr, moviesArray)
        if(moviesArray){
            document.getElementById("index-placeholder-watchlist").style.display = "none"
        }
})

document.addEventListener('click', function(e){
    if(e.target.dataset.add){
        addFilmToDb(e.target.dataset.add);
    }
    else{
        let imdbIDToDelete = e.target.dataset.delete;
        deleteFilmfromDb(imdbIDToDelete, moviesArray);
    }
})
function addFilmToDb(movieData) {
    if (movieData) {
        push(moviesInDB, movieData);
    }
}
function deleteFilmfromDb(imdbID, moviesArray){
    moviesArray.forEach(function(movieArray) {
        let currentMovieID = movieArray[0];
        let currentMovieValue = movieArray[1];
        // Compare the imdbID with the current movie's imdbID
        if (currentMovieValue === imdbID) {
            // If there's a match, construct the ref to the movie and remove it
            let movieRef = ref(database, `movies/${currentMovieID}`);
            remove(movieRef);
        }
    });
}

//INDEX

//SEARCH

async function fetchData() {
    document.getElementById("index-placeholder").style.display = "none"
    let movie = searchInput.value
    let url = `https://www.omdbapi.com/?apikey=c62e60e1&s=${movie}`
    const response = await fetch(url)
    const data = await response.json()
    if (!response.ok || data.Response === "False") {
        document.getElementById("error").innerHTML = `
            <div id="error-placeholder" class="error-placeholder">
                <p>Unable to find what you're looking for. Please try another search.</p>
            </div>`;
    } else {
        const imdbidArray = getMovieInfo(data);
        fetchDataFromImdb(imdbidArray);
    }
}


function getMovieInfo(movies){
        let imdbidArray = []
        let results = movies.Search
        for (let result of results){
        imdbidArray.push(result.imdbID)}
        return imdbidArray
}
function fetchDataFromImdb(idArr) { 
        document.getElementById("container").innerHTML = "";
        idArr.map(async function(id){
            let url = `https://www.omdbapi.com/?apikey=c62e60e1&i=${id}`
            const response = await fetch(url)
            const data = await response.json()
            document.getElementById("container").innerHTML += `
            <section class="card">
                <img class="poster" src=${data.Poster}>
                <div class="card-right">
                    <div class="card-header">
                        <h2>${data.Title}</h2>
                        <div class="rating">
                            <img class="star" src="/media/star.png">
                            <p>${data.imdbRating}</p>
                        </div>
                    </div>
                    <div class="card-info">
                        <p>${data.Runtime}</p> 
                        <p>${data.Genre}</p>
                        <div class="add" id="add">
                            <img src="/media/add-btn.png" data-add="${data.imdbID}" id="add-btn" class="add-btn">
                            <p>Watchlist</p>
                        </div>
                    </div>
                    <div class="card-plot">
                        <p>${data.Plot}</p>
                    </div>
                </div>
            </section>` 
    })
}

//ADDING TO DB

function appendToMoviesListEl(moviesArray) {
    watchlistContainer.innerHTML = ""; 
    moviesArray.forEach(async function(imdbID) {
        let url = `https://www.omdbapi.com/?apikey=c62e60e1&i=${imdbID}`;
        const response = await fetch(url);
        const data = await response.json();
        const movieCardHTML = `
            <section class="card">
                <img class="poster" src=${data.Poster}>
                <div class="card-right">
                    <div class="card-header">
                        <h2>${data.Title}</h2>
                        <div class="rating">
                            <img class="star" src="/media/star.png">
                            <p>${data.imdbRating}</p>
                        </div>
                    </div>
                    <div class="card-info">
                        <p>${data.Runtime}</p> 
                        <p>${data.Genre}</p>
                        <div class="add" id="add">
                            <img src="/media/delete-btn.png" data-delete="${data.imdbID}" id="delete-btn" class="delete-btn">
                            <p>Remove</p>
                        </div>
                    </div>
                    <div class="card-plot">
                        <p>${data.Plot}</p>
                    </div>
                </div>
            </section>`;
        watchlistContainer.innerHTML += movieCardHTML;
    });
}
//EVENT LISTENERS

function handleButtonClick() {
    window.location.href = 'index.html';
}

if (searchBtn && searchInput) {
    searchBtn.addEventListener("click", function() {
        fetchData();
    });
}
if (myWatchlistBtn) {
    myWatchlistBtn.addEventListener("click", function(){
        window.location.href = 'watchlist.html';
    });
}
if (letsAddBtn && findFilmBtn) {
    letsAddBtn.addEventListener("click", handleButtonClick);
    findFilmBtn.addEventListener("click", handleButtonClick);
}

