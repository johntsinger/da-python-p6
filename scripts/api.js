const url = "http://127.0.0.1:8000/api/v1/titles/"

const getData = async (url, endpoint="") => {
    try {
        return await axios.get(url + endpoint);
    } catch (error) {
        console.log(error.response.data.error);
    }
}

async function bestMovie(endpoint) {
    let movie = (await getData(url, endpoint)).data.results[0];
    document.getElementsByClassName("best-movie--cover")[0].getElementsByTagName("img")[0]
        .src = movie.image_url;
    document.getElementById("best-movie-title")
        .innerHTML = movie.title;
    bestMovieDescription(movie.url);
    document.getElementsByClassName("btn")[1]
        .setAttribute("onclick", `openModal("${movie.id}")`); // template literals
}

async function bestMovieDescription(url) {
    let movieData = (await getData(url)).data;
    document.getElementById("best-movie-description")
        .innerHTML = movieData.description;
}

async function modalData(id) {
    let movieData = (await getData(url, id)).data;
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

async function getMoviesByCategory(categorie) {
    
}

function main () {
    bestMovie("?sort_by=-imdb_score");
}

main();