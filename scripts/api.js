const url = "http://127.0.0.1:8000/api/v1/titles/"

function getBestMovies() {
    axios.get(url + "?sort_by=-imdb_score")
        .then(response => response["data"]["results"][0])
        .then(data => {
            document.getElementById("best-movie-img")
                .src = data["image_url"];
            document.getElementById("best-movie-title")
                .innerHTML = data["title"];
            getDescription(data["url"])
        })
}

function getDescription(url) {
    axios.get(url)
        .then(response => response["data"])
        .then(data => {
            document.getElementById("best-movie-description")
                .innerHTML = data["description"]
        })
}

getBestMovies()