<template>
  <div class="TeleportModal">
    <div class="img_box">
      <img src="../assets/马保国1.png" alt="">
    </div>
  </div>
</template>

<style lang="scss" scoped>
.TeleportModal {
  height: 100%;
  width: 100%;
  background-color: rgba(255,255,255,0.35);
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 0;
  cursor: pointer;
  .img_box {
    height: 400px;
    width: 400px;
    border-radius: 50%;
    overflow: hidden;
    background-color: #42b983;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow:  0 0 20px rgba(0,0,0,0.55);
  }
  img {
    height: 100%;
    object-position: left;
    object-fit: cover;
  }
}
</style>