const url = "http://127.0.0.1:8000/api/v1/titles/";

const getData = async (url, params) => {
    try {
        return await axios.get(url, {
            params: params
        });
    } catch (error) {
        console.log(error.response.data);
    }
}

/*
const getData = async (url, endpoint="") => {
    try {
        return await axios.get(url + endpoint);
    } catch (error) {
        console.log(error.response.data.error);
    }
}
*/

async function bestMovie() {
    let params = {sort_by: "-imdb_score"}
    let movie = (await getData(url, params)).data.results[0];
    document.getElementsByClassName("best-movie--cover")[0]
        .getElementsByTagName("img")[0]
        .src = movie.image_url;
    document.getElementById("best-movie-title")
        .innerHTML = movie.title;
    document.getElementById("best-movie-description")
        .innerHTML = (await getData(movie.url)).data.description;
    document.getElementsByClassName("btn")[1]
        .setAttribute("onclick", `openModal("${movie.id}")`); // template literals
}

async function modalData(id) {
    let movieData = (await getData(url + id)).data;
    document.getElementById("title")
        .innerHTML = movieData.title;
    document.getElementById("year")
        .innerHTML = " (" + movieData.year + ")";
    document.getElementById("image-url")
        .src = movieData.image_url;
    document.getElementById("duration")
        .innerHTML = movieData.duration + " min";
    document.getElementById("countries")
        .innerHTML = movieData.countries.join(", ");
    document.getElementById("genres")
        .innerHTML = movieData.genres.join(", ");
    document.getElementById("rated")
        .innerHTML = movieData.rated;
    document.getElementById("imdb-score")
        .innerHTML = "IMDb score : " + movieData.imdb_score;
    document.getElementById("directors")
        .innerHTML = "Directed by : " + movieData.directors.join(", ");
    document.getElementById("actors")
        .innerHTML = "Casting : " + movieData.actors.join(", ");
    if (movieData.worldwide_gross_income == null) {
        document.getElementById("box-office")
            .innerHTML = "Box office : " + "N/A";
    } else {
        document.getElementById("box-office")
            .innerHTML = "Box office : " + movieData.worldwide_gross_income;
    }
    document.getElementById("plot")
        .innerHTML = movieData.long_description;
}

function openModal(id) {
    let modal = document.getElementById("myModal");
    let span = document.getElementsByClassName("close")[0];
    modal.style.display = "block";
    modalData(id);

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}

async function moviesByCategory(category, numberOfItems) {
    let page = 1;
    let params = {sort_by: "-imdb_score", genre: category, page: page};
    let movies = [];
    while (movies.length < numberOfItems) {
        let moviesOnPage = (await getData(url, params)).data.results;
        movies = movies.concat(moviesOnPage.slice(0, numberOfItems - movies.length));
        page++;
    }
    return movies;
}

async function populateSlider(category, numberOfItems) {
    let movies = await(moviesByCategory(category, numberOfItems));
    let slider = document.querySelector(".slider");
    movies.forEach((movie) => {
        let image = movie.image_url;
        const newMovie = document.getElementById("movie0");
        let clone = newMovie.cloneNode(true);
        let img = clone.querySelector("img");
        img.src = image;
        slider.insertBefore(clone, slider.childNodes[slider.childNodes.length - 1]);
    });
}

async function main () {
    await bestMovie();
    await moviesByCategory("drama", 7);
    await populateSlider("drama", 7);
}

main();