# UCLA CS 174A Fall 2018 Term Project Group 33: Flight Simulator

## **A brief description of the project**

  We have been working on a game called Flight Arcade.

  A user can press space bar to start the game.
  
  Two players start at opposing runways and takes off to shoot at each other.
  
  Each player starts with 5 health on his plane. A player loses 3 health on his plane if it gets hit (with 3 consecutive bullets).
  
  The plane sets itself aflame while injured (not at its full health).
  
  If a collision is detected on a plane, that player loses.
  
  If planes collide into each other, both players lose.
  
  When the health of a plane comes down to zero, that player loses and the other player wins.

## **Description of each member's specific contribution to the project**

- **Yilin Zhu**: reflection, shader particle effects (fire, ocean), transparency, collecting sound files

- **William Shao**: collision, skybox implementation, merging, multiple viewports/camera angles, physics

- **Weisheng Zhang**: aircraft movement control, camera control, obj loader, HUD design, construct README.md 

- **Meiyi Zheng**: try to do the shadow mapping, but failed. 

## **Details on how to both run and use/operate project application**

#### Player 1
  |Function|Key|
  |--|--|
  |ThrottleUp| C|
  |Yaw Left|Q|
  |Yaw Right|E|
  |Pitch Up|W|
  |Pitch Down|S|
  |Roll Left|A|
  |Roll Right|D|
  |Fire| Z|
  
#### Player 2
   |Function|Key|
  |--|--|
  |ThrottleUp| M|
  |Yaw Left|U|
  |Yaw Right|O|
  |Pitch Up|I|
  |Pitch Down|K|
  |Roll Left|J|
  |Roll Right|L|
  |Fire| Period| 
  
  There is built-in help at the starting menu of the game as well.

## **Miscellaneous**

### Advanced Topics
- Reflection(Cube Mapping)
- Shader partical effects(fire and ocean)
- Collision detection
- Physics
- Transparency
- Multiple viewports/camera angles
- Note that the framerate may be low on some browsers due to computational load of the program. Hardware acceleration may be helpful.