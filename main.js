class TimeLeftClass {
    constructor() {
      this.userLife = 1081 //90 years, let user pick later
      this.userInfo = localStorage.getItem('userInfo');
    }
    init() {
      this.displayData();
      this.deleteUserData();
      this.collectUserData();
    }
    displayData() {
      if(this.userInfo) {
        //Make sure the data is in JSON format
        this.userInfo = JSON.parse(localStorage.getItem('userInfo'));
        document.getElementsByClassName("userinfo__form")[0].style.display = 'none';
        document.getElementsByClassName("userinfo__details")[0].style.display = 'flex';
        this.showUserData();
      } else {
        document.getElementsByClassName("userinfo__form")[0].style.display = 'flex';
        document.getElementsByClassName("userinfo__details")[0].style.display = 'none';
      }
      
    }
    deleteUserData() {
      document.getElementById("reset").addEventListener("click", (event) => {
        localStorage.removeItem('userInfo');
        this.userInfo = undefined;
        const grid = document.getElementById('timeleft');
        while (grid.firstChild) {
          grid.removeChild(grid.firstChild);
        }
        event.preventDefault();
        this.displayData();
      });
    }
    collectUserData() {
      document.getElementById("submit").addEventListener("click", (event) => {
        //Save user data in localstorage
        let name = document.getElementById("userName").value;
        let month = document.getElementById("userMonth").value;
        let year = document.getElementById("userYear").value;
        //TODO: Validate user entered something...
        const userInfo = { userName: name, userMonth: month, userYear: year };
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        this.userInfo = localStorage.getItem('userInfo');
        this.displayData();
        event.preventDefault();
      });
    }
    showUserData() {
      //Display current user data
      //TODO: Show date string instead of number with momentjs
      document.getElementsByClassName("userinfo__name")[0].textContent = `Hello ${this.userInfo.userName}`;
      document.getElementsByClassName("userinfo__birth")[0].textContent = `Birthdate: ${this.userInfo.userMonth}, ${this.userInfo.userYear}`;
      this.buildGrid()
    }
    buildGrid() {
      const grid = document.getElementById('timeleft');
      for (let i = 1; i < this.userLife; i++) {
        let month = document.createElement('div');
        month.className = 'month';
        grid.appendChild(month);
        month.setAttribute('title', 'month'+i);
      }
      this.showStatus();
    }
    showStatus() {
      let userBirth = moment(`${this.userInfo.userYear} ${this.userInfo.userMonth}`, 'YYYY MM');
      let monthsUsed = userBirth.diff(moment(), 'months')*-1;
      let monthsGrid = document.getElementsByClassName('month');
      for (let i=0; i < monthsUsed; i++) {
        monthsGrid[i].className = 'month month--past';
      }
    }
  }
  
  const userTimeLeft = new TimeLeftClass();
  userTimeLeft.init();
  