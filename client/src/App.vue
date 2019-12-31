<template>
  <div id="app">
    <div class="topnav">
      <a class="lefties" href="/">Home</a>
      <a class="righties" href='/dashboard' style="padding: 0;">
        <img src="./assets/account_icon.png"
          width="24px" style="margin: 10px; background-color: white;">
      </a>
    </div>
    <br>
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App',
};
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

* {
  margin: auto;
}
</style>

<style scoped>
.lefties {
  float: left;
}
.righties {
  float: right;
}

.topnav {
  background-color: #2f3542;
  overflow: hidden;
}

/* Style the links inside the navigation bar */
.topnav a {
  color: #ffffff;
  text-align: center;
  padding: 14px 16px;
  text-decoration: none;
  font-size: 17px;
}

/* Change the color of links on hover */
.topnav a:hover {
  background-color: #57606f;
  color: black;
}
</style>
