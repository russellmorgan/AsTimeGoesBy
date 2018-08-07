class TimeLeftClass {
    constructor() {
      this.userLife = 1081 //90 years, let user pick later
      //put userInfo here in the constructor once everything else is working...
    }
    init() {
      let userInfo = localStorage.getItem('userInfo');
      if(userInfo) {
        this.showUserData(userInfo);
      } else {
        this.collectUserData()
      }
    }
    collectUserData() {
      let userForm = document.getElementsByClassName("userinfo__form");
      document.getElementById("userSubmit").addEventListener("click", function() {
        //Save user data in localstorage
        let name = document.getElementById("userName").value;
        let month = document.getElementById("userMonth").value;
        let year = document.getElementById("userYear").value;
        const userInfo = { userName: name, userMonth: month, userYear: year };
        localStorage.setItem("userInfo", JSON.stringify(userInfo));
        this.buildGrid();
      });
    }
    showUserData(userInfo) {
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
      let userInfo = JSON.parse(localStorage.getItem('userInfo'));
      //const userMoment = `${userInfo.userYear} ${userInfo.userMonth}`;
      let userBirth = moment(`${userInfo.userYear} ${userInfo.userMonth}`, 'YYYY MM');
      let monthsUsed = userBirth.diff(moment(), 'months')*-1;
      let monthsGrid = document.getElementsByClassName('month');
      for (let i=0; i < monthsUsed; i++) {
        monthsGrid[i].className = 'month month--past';
      }
    }
  }
  
  const userTimeLeft = new TimeLeftClass();
  userTimeLeft.init();
  