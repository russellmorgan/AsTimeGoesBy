class TimeLeftClass {
    constructor() {
      this.userLife = 1081 //90 years, let user pick later
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
      console.log("let's get their stuff...");
    }
    showUserData(userInfo) {
      console.log(userInfo);
      this.buildGrid()
    }
    buildGrid() {
      const grid = document.getElementById("timeleft");
      
    }
    showStatus() {
      
    }
  }
  
  const userTimeLeft = new TimeLeftClass();
  userTimeLeft.init();
  