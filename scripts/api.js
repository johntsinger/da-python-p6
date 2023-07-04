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
    let movies = [];
    while (movies.length < numberOfItems) {
        let params = {sort_by: "-imdb_score", genre: category, page: page};
        let moviesOnPage = (await getData(url, params)).data.results;
        movies = movies.concat(moviesOnPage.slice(0, numberOfItems - movies.length));
        page++;
    }
    console.log(movies)
    return movies;
}

async function addMovie(element, category, numberOfItems) {
    let movies = await(moviesByCategory(category, numberOfItems));
    let carousel = document.getElementById(element);
    console.log(carousel);
    for (let i=0; i<movies.length; i++) {
        carousel.getElementsByTagName("img")[i]
            .src = movies[i].image_url;
    }
}

async function populateSlider(category, numberOfItems) {
    let movies = await(moviesByCategory(category, numberOfItems));
    let slider = document.querySelector(".slider");
    for (let i=0; i<movies.length; i++) {
        let image = movies[i].image_url;
        const newMovie = document.getElementById("movie0");
        let clone = newMovie.cloneNode(true);
        let img = clone.querySelector("img");
        img.src = image;
        img.setAttribute("onclick", `openModal("${movies[i].id}")`);
        clone.querySelector(".description__text")
            .innerHTML = movies[i].title;
        slider.insertBefore(clone, slider.childNodes[slider.childNodes.length - 1]);
    };
    const initialMovie = document.getElementById("movie0");
    initialMovie.remove();
}


class Carousel {
    constructor (element, options = {}) {
        this.element = element
        this.options = Object.assign({}, {
            slidesToScroll: 1,
            slidesVisible: 1
        }, options)
        let children = [].slice.call(element.children)
        this.currentItem = 0
        this.root = this.createDivWithClass('carousel')
        this.container = this.createDivWithClass('carousel__container')
        this.root.appendChild(this.container)
        this.element.appendChild(this.root)
        this.items = children.map((child) => {
            let item = this.createDivWithClass('carousel__item')
            item.appendChild(child)
            this.container.appendChild(item)
            return item
        })
        this.setStyle()
        this.createNavigation()
    }

    setStyle() {
        let ratio = this.items.length / this.options.slidesVisible
        this.container.style.width = (ratio * 100) + "%"
        this.items.forEach(item => item.style.width = (100 / this.options.slidesVisible) / ratio + '%')
    }

    createNavigation () {
        let nextButton = this.createDivWithClass('carousel__next')
        let prevButton = this.createDivWithClass('carousel__prev')
        this.root.appendChild(nextButton)
        this.root.appendChild(prevButton)
        nextButton.addEventListener('click', this.next.bind(this))
        prevButton.addEventListener('click', this.prev.bind(this))
    }

    next () {
        this.gotoItem(this.currentItem + this.options.slidesToScroll)
    }

    prev () {
        this.gotoItem(this.currentItem - this.options.slidesToScroll)
    }

    gotoItem(index) {
        this.currentItem = index
    }

    createDivWithClass(className) {
        let div = document.createElement('div')
        div.setAttribute('class', className)
        return div
    }
}


document.addEventListener("DOMContentLoaded", function () {
    new Carousel(document.querySelector('#carousel1'), {
        slidesToScroll: 3,
        slidesVisible: 3
    })
})



async function main () {
    await bestMovie();
    await moviesByCategory("drama", 7);
    await populateSlider("drama", 7);
    await addMovie('carousel1', "drama", 7)
}

main();