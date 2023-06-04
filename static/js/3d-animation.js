// 获取元素
var animationContainer = document.getElementById('animation-container');

// 监听鼠标移动事件
animationContainer.addEventListener('mousemove', function(event) {
  // 获取容器尺寸
  var containerWidth = animationContainer.offsetWidth;
  var containerHeight = animationContainer.offsetHeight;
  
  // 计算鼠标相对于容器中心点的位置
  var mouseX = event.clientX - containerWidth / 2;
  var mouseY = event.clientY - containerHeight / 2;
  
  // 根据鼠标位置更新动画效果
  updateAnimation(mouseX, mouseY);
});

// 更新动画效果
function updateAnimation(mouseX, mouseY) {
  // 根据鼠标位置计算动画效果的参数
  var rotateX = mouseY / 10;
  var rotateY = mouseX / 10;
  
  // 应用动画效果到元素样式
  animationContainer.style.transform = 'rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)';
}

// 获取元素
var animationContainer = document.getElementById('animation-container');

// 创建渲染器
var renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(animationContainer.offsetWidth, animationContainer.offsetHeight);
animationContainer.appendChild(renderer.domElement);

// 创建场景
var scene = new THREE.Scene();

// 创建相机
var camera = new THREE.PerspectiveCamera(75, animationContainer.offsetWidth / animationContainer.offsetHeight, 0.1, 1000);
camera.position.z = 5;

// 创建立方体
var geometry = new THREE.BoxGeometry();
var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
var cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// 动画循环
function animate() {
    requestAnimationFrame(animate);

    // 旋转立方体
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    // 渲染场景和相机
    renderer.render(scene, camera);
}

// 开始动画循环
animate();