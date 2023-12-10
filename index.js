// your weather ke liye custom attribute
const userTab=document.querySelector("[data-userWeather]");
// search weather ke liye custom attribute
const searchTab=document.querySelector("[data-searchWeather]");
// main container jispe data render hoga 
const userContainer=document.querySelector(".weather-container");
// hmari locaation access grant krne wali class
const grantAccessContainer=document.querySelector(".grant-location-container");
// search input wale ke liye custom attribute
const searchForm=document.querySelector("[data-searchForm]");
// scrren loading ke liye class
const loadingScreen=document.querySelector(".loading-container");
// user info wale container ko show krne ke liye class
const userInfoContainer=document.querySelector(".user-info-container");

// initialising the variables
// current tab jo hoga jis pr hum honge woh user tab ke equal hoga
let currentTab=userTab;
const API_KEY = "e0bf5f79754882e03cbe58eb9f3b72ff";
// humne classlist ki prop lagai kyunki current tab jo hogi woh by default user weather tab isliye uski css prop hgi isliye
currentTab.classList.add("current-tab");

getFromSessionStorage();
// creating a  switch tab function
function switchTab(clickedTab){
    // agar tmhara clicked kiya hua tab current tab ke equal nhi hai mtlb tumne agar userweather pe click kia toh uska bg color uspe rhega
    // aur agar search weather pe click kiya toh user weather ka bg hatkar woh search weather pe aajayega.
    if(clickedTab!=currentTab){
        // background mein jo user weather ke hain woh switch hojayehga switch tab ke bg main 
        currentTab.classList.remove("current-tab");
        currentTab=clickedTab;
        currentTab.classList.add("current-tab");
        // agar tum user weather pe currently ho then grantaccess wala hat jayega and user info wala bhi hat jayega
        // agar active class add hui pdi hain iska matlab woh particular element aur woh part visible hain otherwise woh invisible hain .
        if(!searchForm.classList.contains("active")){
            // kya serch form wala container invisible hain yes then make it visible first
            grantAccessContainer.classList.remove("active");
            userInfoContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        else{
            // agar hum pehle se hi search tab ho toh
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            // ab mein your weather tab mein aagya , toh weather bhi display krna pdega,so lets check local storage first
            // for the cordinates we have saved them there
            getFromSessionStorage();
        }
    }
}
// usertab pe event listner lagaya jb hum us pr click krenge toh tab switch call hoga
userTab.addEventListener("click", () => {
    switchTab(userTab);
});

// searchTab pe event listner lagaya jb hum us pr click krenge toh tab switch call hoga
searchTab.addEventListener("click", () => {
    switchTab(searchTab);
});
// check if coordinates are present already prsent in session storage are not
function getFromSessionStorage(){
    const localCoordinates=sessionStorage.getItem("user-coordinates");
    if(!localCoordinates){
        // agar present nhi hain toh grant access wala ui show hoga
        grantAccessContainer.classList.add("active");
    }
    else{
        // agar present hain toh un coordinates ko json mein convert kro
        const coordinates=JSON.parse(localCoordinates);
        // bases on that cordintates user weather info display hogi function call ke bases pe
        fetchUserWeatherInfo(coordinates);
    }
    
}
// api call krna hain isliye hume function ko async banana pdega
async function fetchUserWeatherInfo(coordinates){
    const {lat , lon} = coordinates;
    // grant container remove
    grantAccessContainer.classList.remove("active");
    // make loader visible
    loadingScreen.classList.add("active");
    // API call
    try {
        const response=await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data= await response.json();
        loadingScreen.classList.remove("active");
        // user info container active
        userInfoContainer.classList.add("active");
        // is function call ki madad se data ko display kregs ui pe
        renderWeatherInfo(data);
    }
    catch {
        loadingScreen.classList.remove("active");
        //HW
    }
}
// this function is used to display the data in ui by fetching api call data wherever that will be taken 
function renderWeatherInfo(weatherInfo){
    // firstly we have to fetch the elements according to their custom attributes
    const cityName=document.querySelector("[data-cityName]");
    const countryIcon=document.querySelector("[data-countryIcon]");
    const desc=document.querySelector("[data-weatherDesc]");
    const weatherIcon=document.querySelector("[data-weatherIcon]");
    const temp=document.querySelector("[data-temp]");
    const windSpeed=document.querySelector("[data-windSpeed]");
    const humidity=document.querySelector("[data-humidity]");
    const cloudiness=document.querySelector("[data-cloudiness]");
    
    // fetch values from weatherInfo o bject and put it in UI elements.
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `https://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C `;
    windSpeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity} %`;
    cloudiness.innerText =`${weatherInfo?.clouds?.all} %`;
}
// we find the location of user wherever he is present
function getLocation(){
    // geolocation supports or not
    if(navigator.geolocation){
        // function call using get current position
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else{
        console.log("error found" , err);
    }
}
// call back function
function showPosition(position){
   
// creating a object an properties of objects are longitude and latitude
    const yourCoordinates = {
       // accesing a latitude and longitude
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }
    // properties of usercoordinates set in session storage by making it in json string
    sessionStorage.setItem("user-coordinates" , JSON.stringify(yourCoordinates));
    // call the function using userCoordinates as parametres
    fetchUserWeatherInfo(yourCoordinates);
    
}
// ftech the element
const grantAccessButton=document.querySelector("[data-grantAccess]");
// add event listner to button
grantAccessButton.addEventListener("click", getLocation);

const searchInput=document.querySelector("[data-searchInput]");
// search form pe event listners
searchForm.addEventListener("submit" , (e)=>{
    // jo pehle default hain use prevent kro
    e.preventDefault();

    let cityName=searchInput.value;
    // agar empty hain toh
    if(cityName===""){
        return;
    }
    else{
        //agar empty nhi hain toh
        fetchSearchWeatherInfo(cityName);
    }
});

//ye function search weather ke liye hain jb hum search krete hain toh api call ki madad se data ata hain 
async function fetchSearchWeatherInfo(city){
    loadingScreen.classList.add("active");
    grantAccessContainer.classList.remove("active");
    userInfoContainer.classList.remove("active");
    try {
        const result= await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const data2= await result.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data2);
    }
    catch(err){
       // hw
       console.log("failed to reloaded the data" , bg-url);
    }
}





