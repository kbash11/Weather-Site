// const API_KEY="cbde85a132b29679528bc5883e6fd40c";
// async function showWheater(){
//     try{
//         let city="ajmer";
//         const response= await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`);
//         const data=await response.json();
//         console.log("data",data);
//     }
//     catch(e){
//         console.log("Error found - ",e);
//     }
// }

const userTab=document.querySelector("[data-userWeather]");
const searchTab=document.querySelector("[data-searchWeather]");
const userContainer=document.querySelector(".container");

const grantAccessContainer=document.querySelector(".grant-location-container");
const searchForm=document.querySelector("[data-searchForm]");
const loadingScreen=document.querySelector(".loading-container");
const userInfoContainer=document.querySelector(".weather-info-container")
   
const grantAcessBtn=document.querySelector("[data-grantAccess]");

//intial variables
const API_KEY="cbde85a132b29679528bc5883e6fd40c";
let currTab=userTab;
currTab.classList.add("current-tab");    // bg colour grey
getFromSessionStorage();

userTab.addEventListener("click",()=>{
    tabSwitch(userTab);
});
searchTab.addEventListener("click",()=>{
    tabSwitch(searchTab);
});

//switching between tab
function tabSwitch(clickedTab){
    if(clickedTab!=currTab){
        currTab.classList.remove("current-tab");
        currTab=clickedTab;
        currTab.classList.add("current-tab");

        if(!searchForm.classList.contains("active")){    // search form is invisible
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }else{
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            getFromSessionStorage();                    // to check local storage first for coordinates, if coordinates are already present or not
        }
    }
}

function getFromSessionStorage(){
    const localCoordinates=sessionStorage.getItem("user-coordinates");
    if(!localCoordinates){                 
        grantAccessContainer.classList.add("active");

    }else{
        const coordinates=JSON.parse(localCoordinates);      // converting coordinates of JSON string in JSON object format
        fetchUserWeatherInfo(coordinates);
    }
}

//if coordinates are not present then grantAcessContainer is active
grantAcessBtn.addEventListener("click",getLocation);
function getLocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition);
    }else{
        alert("Geolocation is not supported by this browser.");
    }
}
function showPosition(position){
    const userCoordinates={
        lat:position.coords.latitude,
        lon:position.coords.longitude,
    }
    sessionStorage.setItem("user-coordinates",JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}

async function fetchUserWeatherInfo(coordinates){
    const {lat,lon}=coordinates;
    grantAccessContainer.classList.remove("active");
    loadingScreen.classList.add("active");              // loader visible

    //API CALL
    try{
        const response=await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data=await response.json();              // converting in JSON format

        loadingScreen.classList.remove("active"); 
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);                 // Updating UI
    }
    catch(err){
        loadingScreen.classList.remove("active");
    }
}

function renderWeatherInfo(weatherInfo){
    //fetch the html element
    const cityName = document.querySelector("[data-placeName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    //fetch values from weatherInfo
    cityName.innerText=weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText=`${(weatherInfo?.main?.temp.toFixed(2))} °C`;
    windspeed.innerText=`${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText=`${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText=`${weatherInfo?.clouds?.all}%`;
}

const searchInput=document.querySelector("[data-searchInput]"); 
searchForm.addEventListener("submit",(e)=>{
    e.preventDefault();
    let regex = /^[a-zA-Z]+$/;                  // to check city name contains only letters

    let cityName=searchInput.value;
   
    if(cityName==="" || !regex.test(cityName)){
        alert("Enter Valid City Name");
        return;
    }else{
        fetchSearchWeatherInfo(cityName);
    }
})
// const validClass=document.getElementsByClassName("valid")[0];
async function fetchSearchWeatherInfo(city){

        loadingScreen.classList.add("active");
        userInfoContainer.classList.remove("active");
        grantAccessContainer.classList.remove("active")
    try{
        const response= await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const data=await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");

        // validClass.innerText = ''; 
        if (response.ok) {
            renderWeatherInfo(data);
        } else {
            // Handle non-successful response (e.g., 404 - City not found)
            // const errorMessage = `Error: Enter Valid City Name`;
            // validClass.innerText = errorMessage;
            
            alert("Enter Valid City Name");
            userInfoContainer.classList.remove("active");
        }
    }
    catch(error){
    
        const errorMessage = 'Error fetching weather data: ' + error.message;
        validClass.innerText = errorMessage;
        
    }
};
