class TimeLeftClass {
    constructor() {
      this.userLife = 1081 //90 years default, let user pick differently if they wish
      this.userInfo = localStorage.getItem('userInfo');
    }
    init() {
      this.displayData();
      this.deleteUserData();
      this.collectUserData();
      this.displayHelp();
    }
    displayData() {
      if(this.userInfo) {
        //Make sure the data is in JSON format
        this.userInfo = JSON.parse(localStorage.getItem('userInfo'));
        document.getElementsByClassName("userinfo")[0].classList.add('userinfo--hide');
        document.getElementsByClassName("showinfo")[0].classList.remove('showinfo--hide');
        this.showUserData();
      } else {
        document.getElementsByClassName("userinfo")[0].classList.remove('userinfo--hide');
        document.getElementsByClassName("showinfo")[0].classList.add('showinfo--hide');
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
        // Make sure the help dialog doesn't show up by accident if ti was toggled before
        document.querySelector('.showinfo__explanation').classList.remove('showinfo__explanation--active');
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
        let life = document.getElementById("userLength").value;
        //TODO: Validate user entered something...
        const userInfo = { userName: name, userMonth: month, userYear: year, userLength: life };
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        this.userInfo = localStorage.getItem('userInfo');
        this.displayData();
        event.preventDefault();
      });
    }
    showUserData() {
      //Display current user data
      let birthdate = new moment();
      birthdate.set('year', this.userInfo.userYear);
      birthdate.set('month', this.userInfo.userMonth-1);
      birthdate = birthdate.format('MMMM YYYY');
      document.getElementsByClassName("userinfo__name")[0].textContent = `Hi ${this.userInfo.userName}`;
      document.getElementsByClassName("userinfo__birth")[0].textContent = `You were born ${birthdate}`;
      this.buildGrid()
    }
    buildGrid() {
      const grid = document.getElementById('timeleft');
      //Check to see if the user gave a different year...
      if(this.userInfo.userLength) { 
        this.userLife = this.userInfo.userLength*12 
      } else { 
      this.userLife = 1081 }
      console.log(this.userLife);
      for (let i = 1; i < this.userLife; i++) {
        let month = document.createElement('div');
        month.className = 'month';
        grid.appendChild(month);
        month.setAttribute('title', 'month '+i);
      }
      this.showStatus();
    }
    showStatus() {
      //Calculates past months onto the grid
      let userBirth = moment(`${this.userInfo.userYear} ${this.userInfo.userMonth}`, 'YYYY MM');
      let monthsUsed = userBirth.diff(moment(), 'months')*-1;
      let monthsGrid = document.getElementsByClassName('month');
      for (let i=0; i < monthsUsed; i++) {
        monthsGrid[i].className = 'month month--past';
      }
    }
    displayHelp() {
      const toggleHelpButton = document.querySelector('.showinfo__toggle');
      toggleHelpButton.addEventListener('click', (event) => {
        document.querySelector('.showinfo__explanation').classList.toggle('showinfo__explanation--active');
      });
      document.querySelector('.icon-close').addEventListener('click', (event) => {
        document.querySelector('.showinfo__explanation').classList.toggle('showinfo__explanation--active');
      });
    }
  }
  
  const userTimeLeft = new TimeLeftClass();
  userTimeLeft.init();
  