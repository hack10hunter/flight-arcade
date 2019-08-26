window.Collision_Demo = window.classes.Collision_Demo =
class Collision_Demo extends Simulation    // Demonstration: Detect when some flying objects collide with one another, coloring them red.
{ constructor(  context, control_box )
    { super(    context, control_box );
      if( !context.globals.has_controls   )
        context.register_scene_component( new Movement_Controls( context, control_box.parentElement.insertCell() ) );
      if( !context.globals.has_info_table )
        context.register_scene_component( new Global_Info_Table( context, control_box.parentElement.insertCell() ) );

      context.globals.graphics_state.camera_transform = Mat4.look_at(Vec.of(0, 5, 15), Vec.of(0, 0, 0), Vec.of(0, 1, 0));
      const r = (context.width/2) / context.height;
      context.globals.graphics_state.projection_transform = Mat4.perspective(Math.PI / 4, r, .1, 1000);

      context.globals.graphics_state2.camera_transform = Mat4.look_at(Vec.of(0, 5, 15), Vec.of(0, 0, 0), Vec.of(0, 1, 0));
      context.globals.graphics_state2.projection_transform = Mat4.perspective(Math.PI / 4, r, .1, 1000);

      const shapes = {
        airplane: new Shape_From_File("assets/planeUV.obj"),
        cube: new Cube(),
        axis: new Axis_Arrows(),
        square: new XZ_Square(),
        skybox: new Square(),
        sun: new Subdivision_Sphere(4),
        ball: new Subdivision_Sphere( 3 ),
      }
      this.submit_shapes(context, shapes);

      // TODO:  Create the materials required to texture both cubes with the correct images and settings.
      //        Make each Material from the correct shader.  Phong_Shader will work initially, but when 
      //        you get to requirements 6 and 7 you will need different ones.
      this.textures = {
        back: context.get_instance("assets/back.bmp", true),
        bottom: context.get_instance("assets/bottom.bmp", true),
        front: context.get_instance("assets/front.bmp", true),
        left: context.get_instance("assets/left.bmp", true),
        right: context.get_instance("assets/right.bmp", true),
        top: context.get_instance("assets/top.bmp", true),
        building1: context.get_instance("assets/building1.jpg", true),
        rooftop1: context.get_instance("assets/rooftop1.jpg", true),
        flame: context.get_instance("assets/flame.png", true),
        start1: context.get_instance("assets/start1.jpg", true),
        start2: context.get_instance("assets/start2.jpg", true),
        win: context.get_instance("assets/win.jpg", true),
        lose: context.get_instance("assets/lose.jpg", true),
      }

      this.materials =
        {
          phong: context.get_instance(Phong_Shader).material(Color.of(1, 1, 1, 1), { ambient: 0.4 }),
          back: context.get_instance(Phong_Shader).material(Color.of(0, 0, 0, 1), { ambient:1.0, diffusivity:0 , specularity: 0, smoothness: 1,texture: this.textures.back }),
          bottom: context.get_instance(Phong_Shader).material(Color.of(0, 0, 0, 1), { ambient: 1.0, diffusivity:0 , specularity: 0, smoothness: 1,texture: this.textures.bottom }),
          front: context.get_instance(Phong_Shader).material(Color.of(0, 0, 0, 1), { ambient: 1.0, diffusivity:0 , specularity: 0, smoothness: 1,texture: this.textures.front }),
          left: context.get_instance(Phong_Shader).material(Color.of(0, 0, 0, 1), { ambient: 1.0, diffusivity:0 , specularity: 0, smoothness: 1,texture: this.textures.left }),
          right: context.get_instance(Phong_Shader).material(Color.of(0, 0, 0, 1), { ambient: 1.0, diffusivity:0 , specularity: 0, smoothness: 1,texture: this.textures.right }),
          top: context.get_instance(Phong_Shader).material(Color.of(0, 0, 0, 1), { ambient: 1.0, diffusivity:0 , specularity: 0, smoothness: 1,texture: this.textures.top }),
          sun:      context.get_instance( Phong_Shader ).material( Color.of( 1,1,0,1 ), {ambient: 1.}),
          white: context.get_instance( Phong_Shader ).material( Color.of(1,1,1,1), {ambient:0}),
          yellow: context.get_instance( Phong_Shader ).material( Color.of(1,1,0,1), {ambient:0}),
          red: context.get_instance( Phong_Shader ).material( Color.of(1,0,0,1), {ambient:0}),
          health: context.get_instance( Phong_Shader ).material( Color.of(1,0,0,1), {ambient:1}),
          grey: context.get_instance( Phong_Shader ).material( Color.of(0.41015625,0.41015625,0.41015625,1), {ambient:0}),
          building1: context.get_instance(Reflection_Shader).material(Color.of(0, 0, 0, 1), { ambient: 0.5}),
          rooftop1: context.get_instance(Phong_Shader).material(Color.of(0, 0, 0, 1), { ambient: 0.5, texture: this.textures.rooftop1 }),
          ocean: context.get_instance( Ocean_Shader ).material( Color.of( 0, 0.46484375, 0.74,1 ), {ambient: 1,  texture: this.textures.flame}),
          start1: context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,1 ), {ambient: 1., texture: this.textures.start1}),
          start2: context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,1 ), {ambient: 1., texture: this.textures.start2}),
          win: context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,1 ), {ambient: 1., texture: this.textures.win}),
          lose: context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,1 ), {ambient: 1., texture: this.textures.lose}),
          flame: context.get_instance( Fire_Shader ).material( Color.of( 1, 0,0 ,1 ), {ambient: 1,  texture: this.textures.flame}),
        }
      this.bodies = [new Body(this.shapes.airplane, this.materials.yellow, Vec.of(1,1,1), 10)
        .emplace( Mat4.translation([0,0,-30]).times(Mat4.rotation(Math.PI, Vec.of(0,1,0))), Vec.of(0,0,0), 0 ),
        new Body(this.shapes.airplane, this.materials.red, Vec.of(1,1,1), 10)
        .emplace( Mat4.translation([0,0,30]), Vec.of(0,0,0), 0 ),
        new Body(this.shapes.sun, this.materials.building1, Vec.of(5,5,5))
        .emplace( Mat4.translation([0,10,0]), Vec.of(0,0,0), 0),
        // new Body(this.shapes.square, this.materials.rooftop1, Vec.of(100,1,100))
        // .emplace( Mat4.translation([0,-2,0]), Vec.of(0,0,0), 0 ),
        //new Body(this.shapes.cube, this.materials.building1, Vec.of(1,10,1))
        //.emplace( Mat4.translation([0,-1,-10]), Vec.of(0,0,0), 0 ),
        ];
      this.submit_shapes( context, shapes );
      this.collider = new Subdivision_Sphere(1);        // Make a simpler dummy shape for representing all other shapes during collisions.

      this.inactive_color = this.materials.grey;
      this.active_color = this.materials.white
      this.transparent = context.get_instance( Phong_Shader ).material( Color.of( 1,0,1,.1 ), { ambient: .4 } );

      this.speed = 0; this.speed2 = 0;
      this.shots = 0; this.shots2 = 0;
      this.health = 5; this.health2 = 5;
      this.lights = [new Light(Vec.of(0, 40, 0, 1), Color.of(0.98828125, 0.71875, 0.07421875, 1.), 40 ** 3)];
    }
  make_control_panel() { // TODO:  Implement requirement #5 using a key_triggered_button that responds to the 'c' key.
      // listen keyboard events to set booleans true/false
      this.key_triggered_button("Throttle Up", ["c"], () => {playTakeoff(); this.forwardPressed = true}, undefined, () => this.forwardPressed = false); this.new_line();
      this.key_triggered_button("Yaw Left", ["q"], () => this.leftPressed = true, undefined, () => this.leftPressed = false); 
      this.key_triggered_button("Yaw Right", ["e"], () => this.rightPressed = true, undefined, () => this.rightPressed = false); this.new_line();
      this.key_triggered_button("Pitch Up", ["w"], () => this.upPressed = true, undefined, () => this.upPressed = false);
      this.key_triggered_button("Pitch Down", ["s"], () => this.downPressed = true, undefined, () => this.downPressed = false); this.new_line();
      this.key_triggered_button("Roll Left", ["a"], () => this.rollLeftPressed = true, undefined, () => this.rollLeftPressed = false);
      this.key_triggered_button("Roll Right", ["d"], () => this.rollRightPressed = true, undefined, () => this.rollRightPressed = false);
      this.key_triggered_button("Shoot", ["z"], () => {this.shootPressed = true}, undefined, () => this.shootPressed = false);

      this.key_triggered_button("Throttle Up", ["m"], () => {playTakeoff(); this.forwardPressed2 = true}, undefined, () => this.forwardPressed2 = false); this.new_line();
      this.key_triggered_button("Yaw Left", ["u"], () => this.leftPressed2 = true, undefined, () => this.leftPressed2 = false); 
      this.key_triggered_button("Yaw Right", ["o"], () => this.rightPressed2 = true, undefined, () => this.rightPressed2 = false); this.new_line();
      this.key_triggered_button("Pitch Up", ["i"], () => this.upPressed2 = true, undefined, () => this.upPressed2 = false);
      this.key_triggered_button("Pitch Down", ["k"], () => this.downPressed2 = true, undefined, () => this.downPressed2 = false); this.new_line();
      this.key_triggered_button("Roll Left", ["j"], () => this.rollLeftPressed2 = true, undefined, () => this.rollLeftPressed2 = false);
      this.key_triggered_button("Roll Right", ["l"], () => this.rollRightPressed2 = true, undefined, () => this.rollRightPressed2 = false);
      this.key_triggered_button("Shoot", ["."], () => {this.shootPressed2 = true}, undefined, () => this.shootPressed2 = false);

      this.key_triggered_button("Start Game", [" "], () => {playReady(); this.started = true;}, undefined, () => this.started = true);
    }
  move_plane() {
    const airplane = this.bodies[0];
    const airplane2 = this.bodies[1];
    airplane.angular_velocity = 0; airplane2.angular_velocity = 0;
    const gravity = airplane.center[1] > 1 ? -.2 : 0
    const gravity2 = airplane2.center[1] > 1 ? -.2 : 0
    airplane.linear_velocity = Vec.of(0,gravity,0,1).plus(airplane.rotation.times(Vec.of(0,0,-this.speed,1)));
    airplane2.linear_velocity = Vec.of(0,gravity2,0,1).plus(airplane2.rotation.times(Vec.of(0,0,-this.speed2,1)));
    airplane.spin_axis = Vec.of(0,0,0);
    airplane2.spin_axis = Vec.of(0,0,0);
    if (this.forwardPressed){
      if(this.speed >= 2) this.speed = 2;
      else this.speed += 0.2;
    }
    if (this.forwardPressed2){
      if(this.speed2 >= 2) this.speed2 = 2;
      else this.speed2 += 0.2;
    }
    if (this.leftPressed) { 
      airplane.angular_velocity = 0.2;  
      airplane.spin_axis = airplane.spin_axis.plus(airplane.rotation.times(Vec.of(0,1,0,1))); 
    }
    if (this.leftPressed2) { 
      airplane2.angular_velocity = 0.2;  
      airplane2.spin_axis = airplane2.spin_axis.plus(airplane2.rotation.times(Vec.of(0,1,0,1))); 
    }
    if (this.rightPressed) {  
      airplane.angular_velocity = 0.2;
      airplane.spin_axis = airplane.spin_axis.plus(airplane.rotation.times(Vec.of(0,-1,0,1))).to3();  
    }
    if (this.rightPressed2) {  
      airplane2.angular_velocity = 0.2;  
      airplane2.spin_axis = airplane2.spin_axis.plus(airplane2.rotation.times(Vec.of(0,-1,0,1))).to3();  
    }
    if(airplane.center[1] > 1 || this.speed >= 1){
      if (this.upPressed) {
        airplane.angular_velocity = 0.2;
        airplane.spin_axis = airplane.spin_axis.plus(airplane.rotation.times(Vec.of(1,0,0,1))).to3();
      }
      if (this.downPressed) {
        airplane.angular_velocity = 0.2;
        airplane.spin_axis = airplane.spin_axis.plus(airplane.rotation.times(Vec.of(-1,0,0,1))).to3();
      }
      if (this.rollLeftPressed) {
        airplane.angular_velocity = 0.2;
        airplane.spin_axis = airplane.spin_axis.plus(airplane.rotation.times(Vec.of(0,0,1,1))).to3();
      }
      if (this.rollRightPressed) {
        airplane.angular_velocity = 0.2;
        airplane.spin_axis = airplane.spin_axis.plus(airplane.rotation.times(Vec.of(0,0,-1,1))).to3();
      }
    }
    if(airplane2.center[1] > 1 || this.speed2 >= 1){
      if (this.upPressed2) {
        airplane2.angular_velocity = 0.2;
        airplane2.spin_axis = airplane2.spin_axis.plus(airplane2.rotation.times(Vec.of(1,0,0,1))).to3();
      }
      if (this.downPressed2) {
        airplane2.angular_velocity = 0.2;
        airplane2.spin_axis = airplane2.spin_axis.plus(airplane2.rotation.times(Vec.of(-1,0,0,1))).to3();
      }
      if (this.rollLeftPressed2) {
        airplane2.angular_velocity = 0.2;
        airplane2.spin_axis = airplane2.spin_axis.plus(airplane2.rotation.times(Vec.of(0,0,1,1))).to3();
      }
      if (this.rollRightPressed2) {
        airplane2.angular_velocity = 0.2;
        airplane2.spin_axis = airplane2.spin_axis.plus(airplane2.rotation.times(Vec.of(0,0,-1,1))).to3();
      }
    }
    if(airplane.angular_velocity != 0 && !airplane.spin_axis.equals(Vec.of(0,0,0,1)) ){
      airplane.spin_axis = airplane.spin_axis.normalized()
    }
    else{
      airplane.spin_axis = Vec.of(0,0,0).randomized(1).normalized();
      airplane.angular_velocity = 0;
    }
    if(airplane2.angular_velocity != 0 && !airplane2.spin_axis.equals(Vec.of(0,0,0,1)) ){
      airplane2.spin_axis = airplane2.spin_axis.normalized()
    }
    else{
      airplane2.spin_axis = Vec.of(0,0,0).randomized(1).normalized();
      airplane2.angular_velocity = 0;
    }

    if(this.shootPressed && this.shots < 3){
      playShoot();
      this.shots++;
      this.bodies.push(new Body(this.shapes.ball, this.materials.yellow, Vec.of(1,1,1), 1)
        .emplace(airplane.drawn_location.times(Mat4.translation([0,0,-3])), airplane.rotation.times(Vec.of(0,0,-10)), 0));
      console.log(this.bodies)
    }
    if(this.shootPressed2 && this.shots2 < 3){
      playShoot();
      this.shots2++;
      this.bodies.push(new Body(this.shapes.ball, this.materials.yellow, Vec.of(1,1,1), 2)
        .emplace(airplane2.drawn_location.times(Mat4.translation([0,0,-3])), airplane2.rotation.times(Vec.of(0,0,-10)), 0));
      console.log(this.bodies)
    }
  }
  update_state( dt, num_bodies = 40 )                                                            
    {
      this.move_plane();
      const airplane = this.bodies[0];
      const airplane2 = this.bodies[1]; 

      if(airplane.center[1] <= -1){
        airplane.linear_velocity  = Vec.of( 0,0,0 );
        airplane.angular_velocity = 0;
        this.gameover1 = true;
      }
      else if(airplane2.center[1] <= -1){
        airplane.linear_velocity  = Vec.of( 0,0,0 );
        airplane.angular_velocity = 0;
        this.gameover2 = true;
      }

      var p_inv = Mat4.inverse(airplane.drawn_location);
      if(airplane.check_if_colliding(airplane2, p_inv, this.collider)){ //planes directly collide
        airplane.linear_velocity  = Vec.of( 0,0,0 );
        airplane.angular_velocity = 0;
        this.gameover_draw = true;
        playFailure();
      }

      for ( let b of this.bodies ) {
        var b_inv = Mat4.inverse( b.drawn_location );
        if(b.check_if_colliding( airplane2, b_inv, this.collider )){ 
            if(b.owner == 1){
              b.owner = 3;
              this.health2--;
              console.log(this.health2);
            }
            else if(b.owner != 3){
              airplane.linear_velocity  = Vec.of( 0,0,0 );
              airplane.angular_velocity = 0;
              this.gameover2 = true;
            }
        }
      }
      for ( let b of this.bodies ) {
        var b_inv = Mat4.inverse( b.drawn_location );
        if(b.check_if_colliding( airplane, b_inv, this.collider )){ 
            if(b.owner == 2){
              b.owner = 4;
              this.health--;
              console.log(this.health);
            }
            else if(b.owner != 4){
              airplane.linear_velocity  = Vec.of( 0,0,0 );
              airplane.angular_velocity = 0;
              this.gameover1 = true;
            }
        }
      }

      for ( let b of this.bodies ) {
        if(b.center.norm() > 100){
          if(b.owner == 3 || b.owner == 1) this.shots--;
          else if(b.owner == 4 || b.owner == 2) this.shots2--;
        }
      }

      if(airplane.center[1] >= 50) airplane.linear_velocity[1] = -1;
      if(Math.abs(airplane.center[0]) >= 45) airplane.linear_velocity[0] = -Math.sign(airplane.center[0]);
      if(Math.abs(airplane.center[2]) >= 45) airplane.linear_velocity[2] = -Math.sign(airplane.center[2]);
      
      if(airplane2.center[1] >= 50) airplane2.linear_velocity[1] = -1;
      if(Math.abs(airplane2.center[0]) >= 45) airplane2.linear_velocity[0] = -Math.sign(airplane2.center[0]);
      if(Math.abs(airplane2.center[2]) >= 45) airplane2.linear_velocity[2] = -Math.sign(airplane2.center[2]);

      this.bodies = this.bodies.filter(function (b){
        return b.owner == 10 || b.center.norm() <= 100;
      })
      if(this.health <= 0){
        airplane.linear_velocity = Vec.of(0,0,0);
        airplane2.linear_velocity = Vec.of(0,0,0);
        this.gameover1 = true;
      }
      if(this.health2 <= 0){
        airplane.linear_velocity = Vec.of(0,0,0);
        airplane2.linear_velocity = Vec.of(0,0,0);
        this.gameover2 = true;
      }
    }
  display( graphics_state )           
    { 
      playBGM();
      if(this.started && !this.gameover1 && !this.gameover2 && !this.gameover_draw){
        graphics_state.lights = this.lights;
        const airplane = this.bodies[0];
        const airplane_other = this.bodies[1];
        graphics_state.camera_transform = Mat4.look_at(airplane.center.plus(airplane.rotation.times(Vec.of(0,5,15))), airplane.center, airplane.rotation.times(Vec.of(0,1,0)));
        super.display( graphics_state );

        
        this.shapes.skybox.draw(graphics_state, Mat4.translation([0, 0, 100]).times(Mat4.rotation(Math.PI, Vec.of(0, 1, 0))).times(Mat4.scale([100, 100, 100])), this.materials.back);
        this.shapes.skybox.draw(graphics_state, Mat4.translation([0, -100, 0]).times(Mat4.rotation(Math.PI / 2, Vec.of(1, 0, 0))).times(Mat4.scale([100, 100, 100])), this.materials.bottom);
        this.shapes.skybox.draw(graphics_state, Mat4.translation([0, 0, -100]).times(Mat4.scale([100, 100, 100])), this.materials.front);
        this.shapes.skybox.draw(graphics_state, Mat4.translation([-100, 0, 0]).times(Mat4.rotation(Math.PI / 2, Vec.of(0, 1, 0))).times(Mat4.scale([100, 100, 100])), this.materials.left);
        this.shapes.skybox.draw(graphics_state, Mat4.translation([100, 0, 0]).times(Mat4.rotation(-Math.PI / 2, Vec.of(0, 1, 0))).times(Mat4.scale([100, 100, 100])), this.materials.right);
        this.shapes.skybox.draw(graphics_state, Mat4.translation([0, 100, 0]).times(Mat4.rotation(Math.PI / 2, Vec.of(1, 0, 0))).times(Mat4.scale([100, 100, 100])), this.materials.top);
        this.shapes.skybox.draw(graphics_state, Mat4.translation([0,-1.1,0]).times(Mat4.rotation(Math.PI/2,Vec.of(1,0,0))).times(Mat4.scale([100,100,100])), this.materials.top);
        this.shapes.skybox.draw(graphics_state, Mat4.translation([0,-1,0]).times(Mat4.rotation(Math.PI/2,Vec.of(1,0,0))).times(Mat4.scale([100,100,100])), this.materials.ocean);
        this.shapes.square.draw(graphics_state, Mat4.translation([0,-.9,-30]).times(Mat4.scale([5,5,5])), this.materials.rooftop1);
        this.shapes.square.draw(graphics_state, Mat4.translation([0,-.9,30]).times(Mat4.scale([5,5,5])), this.materials.rooftop1);

        if(this.health < 5){
          this.shapes.skybox.draw(graphics_state, Mat4.translation(airplane.center).times(airplane.rotation.times(Mat4.translation([0,0.6,0]))), this.materials.flame);
        }
        if(this.health2 < 5){
          this.shapes.skybox.draw(graphics_state, Mat4.translation(airplane_other.center).times(airplane_other.rotation.times(Mat4.translation([0,0.6,0]))), this.materials.flame);
        }
        //for( let b of this.bodies )                                 // show the physical shape that is really being collided with:
          //this.shapes.ball.draw( graphics_state, b.drawn_location.times( Mat4.scale([ 1.1,1.1,1.1 ]) ), this.transparent );
      }
      else if(this.gameover1){
        graphics_state.camera_transform = Mat4.look_at(Vec.of(0,0,30), Vec.of(0,0,0), Vec.of(0,1,0));
        this.shapes.skybox.draw(graphics_state, Mat4.scale([10,10,10]), this.materials.lose);
      }
      else if(this.gameover2){
        graphics_state.camera_transform = Mat4.look_at(Vec.of(0,0,30), Vec.of(0,0,0), Vec.of(0,1,0));
        this.shapes.skybox.draw(graphics_state, Mat4.scale([10,10,10]), this.materials.win);
      }
      else{
        graphics_state.camera_transform = Mat4.look_at(Vec.of(0,0,25), Vec.of(0,0,0), Vec.of(0,1,0));
        this.shapes.skybox.draw(graphics_state, Mat4.scale([10,10,10]), this.materials.start1);
      }
      if(this.gameover_draw){
        graphics_state.camera_transform = Mat4.look_at(Vec.of(0,0,30), Vec.of(0,0,0), Vec.of(0,1,0));
        this.shapes.skybox.draw(graphics_state, Mat4.scale([10,10,10]), this.materials.lose);
      }
    }
  display2( graphics_state )           
    { 
      if(this.started && !this.gameover1 && !this.gameover2){
        graphics_state.lights = this.lights;
        const airplane = this.bodies[1];
        const airplane_other = this.bodies[0];
        graphics_state.camera_transform = Mat4.look_at(airplane.center.plus(airplane.rotation.times(Vec.of(0,5,15))), airplane.center, airplane.rotation.times(Vec.of(0,1,0)));
        super.display( graphics_state ); 


        this.shapes.skybox.draw(graphics_state, Mat4.translation([0, 0, 100]).times(Mat4.rotation(Math.PI, Vec.of(0, 1, 0))).times(Mat4.scale([100, 100, 100])), this.materials.back);
        this.shapes.skybox.draw(graphics_state, Mat4.translation([0, -100, 0]).times(Mat4.rotation(Math.PI / 2, Vec.of(1, 0, 0))).times(Mat4.scale([100, 100, 100])), this.materials.bottom);
        this.shapes.skybox.draw(graphics_state, Mat4.translation([0, 0, -100]).times(Mat4.scale([100, 100, 100])), this.materials.front);
        this.shapes.skybox.draw(graphics_state, Mat4.translation([-100, 0, 0]).times(Mat4.rotation(Math.PI / 2, Vec.of(0, 1, 0))).times(Mat4.scale([100, 100, 100])), this.materials.left);
        this.shapes.skybox.draw(graphics_state, Mat4.translation([100, 0, 0]).times(Mat4.rotation(-Math.PI / 2, Vec.of(0, 1, 0))).times(Mat4.scale([100, 100, 100])), this.materials.right);
        this.shapes.skybox.draw(graphics_state, Mat4.translation([0, 100, 0]).times(Mat4.rotation(Math.PI / 2, Vec.of(1, 0, 0))).times(Mat4.scale([100, 100, 100])), this.materials.top);
        this.shapes.skybox.draw(graphics_state, Mat4.translation([0,-1.1,0]).times(Mat4.rotation(Math.PI/2,Vec.of(1,0,0))).times(Mat4.scale([100,100,100])), this.materials.top);
        this.shapes.skybox.draw(graphics_state, Mat4.translation([0,-1,0]).times(Mat4.rotation(Math.PI/2,Vec.of(1,0,0))).times(Mat4.scale([100,100,100])), this.materials.ocean);
        this.shapes.square.draw(graphics_state, Mat4.translation([0,-.9,-30]).times(Mat4.scale([5,5,5])), this.materials.rooftop1);
        this.shapes.square.draw(graphics_state, Mat4.translation([0,-.9,30]).times(Mat4.scale([5,5,5])), this.materials.rooftop1);

        if(this.health2 < 5){
          this.shapes.skybox.draw(graphics_state, Mat4.translation(airplane.center).times(airplane.rotation.times(Mat4.translation([0,0.6,0]))), this.materials.flame);
        }
        if(this.health < 5){
          this.shapes.skybox.draw(graphics_state, Mat4.translation(airplane_other.center).times(airplane_other.rotation.times(Mat4.translation([0,0.6,0]))), this.materials.flame);
        }
        //for( let b of this.bodies )                                 // show the physical shape that is really being collided with:
          //this.shapes.ball.draw( graphics_state, b.drawn_location.times( Mat4.scale([ 1.1,1.1,1.1 ]) ), this.transparent );
      }
      else if(this.gameover1){
        graphics_state.camera_transform = Mat4.look_at(Vec.of(0,0,30), Vec.of(0,0,0), Vec.of(0,1,0));
        this.shapes.skybox.draw(graphics_state, Mat4.scale([10,10,10]), this.materials.win);
      }
      else if(this.gameover2){
        graphics_state.camera_transform = Mat4.look_at(Vec.of(0,0,30), Vec.of(0,0,0), Vec.of(0,1,0));
        this.shapes.skybox.draw(graphics_state, Mat4.scale([10,10,10]), this.materials.lose);
      }
      else{
        graphics_state.camera_transform = Mat4.look_at(Vec.of(30,0,25), Vec.of(30,0,0), Vec.of(0,1,0));
        this.shapes.skybox.draw(graphics_state, Mat4.translation([30,0,0]).times(Mat4.scale([10,10,10])), this.materials.start2);
      }
      if(this.gameover_draw){
        graphics_state.camera_transform = Mat4.look_at(Vec.of(0,0,30), Vec.of(0,0,0), Vec.of(0,1,0));
        this.shapes.skybox.draw(graphics_state, Mat4.scale([10,10,10]), this.materials.lose);
      }
    }
}

window.Project_Scene = window.classes.Project_Scene =
  class Project_Scene extends Simulation {
    constructor(context, control_box)     // The scene begins by requesting the camera, shapes, and materials it will need.
    {
      super(context, control_box);    // First, include a secondary Scene that provides movement controls:
      if (!context.globals.has_controls)
        context.register_scene_component(new Movement_Controls(context, control_box.parentElement.insertCell()));
      if( !context.globals.has_info_table )
        context.register_scene_component( new Global_Info_Table( context, control_box.parentElement.insertCell() ) );

      // Mat4.look_at(Vec.of(x,y,z), ...) where y determines how much above from this.model_transform 
      // and z determines that how far back from this.model_transform
      context.globals.graphics_state.camera_transform = Mat4.look_at(Vec.of(0, 0, 50), Vec.of(0, 0, 0), Vec.of(0, 1, 0));

      const r = context.width / context.height;
      context.globals.graphics_state.projection_transform = Mat4.perspective(Math.PI / 4, r, .1, 1000);

      // TODO:  Create two cubes, including one with the default texture coordinates (from 0 to 1), and one with the modified
      //        texture coordinates as required for cube #2.  You can either do this by modifying the cube code or by modifying
      //        a cube instance's texture_coords after it is already created.
      const shapes = {
        box: new Airplane(),
        cube: new Cube(),
        axis: new Axis_Arrows(),
        skybox: new Square(),
        sun: new Subdivision_Sphere(4)
      }
      this.submit_shapes(context, shapes);

      // TODO:  Create the materials required to texture both cubes with the correct images and settings.
      //        Make each Material from the correct shader.  Phong_Shader will work initially, but when 
      //        you get to requirements 6 and 7 you will need different ones.
      this.textures = {
        back: context.get_instance("assets/back.bmp", true),
        bottom: context.get_instance("assets/bottom.bmp", true),
        front: context.get_instance("assets/front.bmp", true),
        left: context.get_instance("assets/left.bmp", true),
        right: context.get_instance("assets/right.bmp", true),
        top: context.get_instance("assets/top.bmp", true),
        building1: context.get_instance("assets/building1.jpg", true),
        rooftop1: context.get_instance("assets/rooftop1.jpg", true),
      }

      this.materials =
        {
          phong: context.get_instance(Phong_Shader).material(Color.of(1, 1, 1, 1), { ambient: 0.4 }),
          back: context.get_instance(Phong_Shader).material(Color.of(0, 0, 0, 1), { ambient: 1.0, texture: this.textures.back }),
          bottom: context.get_instance(Phong_Shader).material(Color.of(0, 0, 0, 1), { ambient: 1.0, texture: this.textures.bottom }),
          front: context.get_instance(Phong_Shader).material(Color.of(0, 0, 0, 1), { ambient: 1.0, texture: this.textures.front }),
          left: context.get_instance(Phong_Shader).material(Color.of(0, 0, 0, 1), { ambient: 1.0, texture: this.textures.left }),
          right: context.get_instance(Phong_Shader).material(Color.of(0, 0, 0, 1), { ambient: 1.0, texture: this.textures.right }),
          top: context.get_instance(Phong_Shader).material(Color.of(0, 0, 0, 1), { ambient: 1.0, texture: this.textures.top }),
          sun:      context.get_instance( Phong_Shader ).material( Color.of( 1,1,0,1 ), {ambient: 1.}),
            white: context.get_instance( Phong_Shader ).material( Color.of(1,1,1,1), {ambient:0}),
            grey: context.get_instance( Phong_Shader ).material( Color.of(0.41015625,0.41015625,0.41015625,1), {ambient:0}),
            building1: context.get_instance(Phong_Shader).material(Color.of(0, 0, 0, 1), { ambient: 0.5, texture: this.textures.building1 }),
            rooftop1: context.get_instance(Phong_Shader).material(Color.of(0, 0, 0, 1), { ambient: 1, texture: this.textures.rooftop1 }),
        }

      this.lights = [new Light(Vec.of(0, 40, 0, 1), Color.of(0.98828125, 0.71875, 0.07421875, 1.), 40 ** 3)];   //[new Light(Vec.of(-5, 5, 5, 1), Color.of(0, 1, 1, 1), 100000)];

      // TODO:  Create any variables that needs to be remembered from frame to frame, such as for incremental movements over time.

      this.collider = new Subdivision_Sphere(1);        // Make a simpler dummy shape for representing all other shapes during collisions.

      this.inactive_color = context.get_instance( Phong_Shader ).material( Color.of( .5,.5,.5,1 ),
                                                            { ambient: .2, texture: this.data.textures.rgb } );
      this.active_color = this.inactive_color.override( { color: Color.of( .5,0,0,1 ), ambient: .5 } );
      this.transparent = context.get_instance( Phong_Shader ).material( Color.of( 1,0,1,.1 ), { ambient: .4 } );

      // initialize boolean toggles
      this.model_transform = Mat4.identity();
      this.acceleration = 0;
      this.forwardPressed = false;
      // this.backwardPressed = false;
      this.upPressed = false;
      this.downPressed = false;
      this.leftPressed = false;
      this.rightPressed = false;
      this.rollLeftPressed = false;
      this.rollRightPressed = false;
      this.camera_matrix = Mat4.inverse(context.globals.graphics_state.camera_transform);
    }
    make_control_panel() { // TODO:  Implement requirement #5 using a key_triggered_button that responds to the 'c' key.
      // listen keyboard events to set booleans true/false
      this.key_triggered_button("Throttle Up", ["w"], () => this.forwardPressed = true, undefined, () => this.forwardPressed = false); this.new_line();
      // this.key_triggered_button("Throttle Down", ["s"], () => this.backwardPressed = true, undefined, () => this.backwardPressed = false); this.new_line();
      this.key_triggered_button("Yaw Left", ["a"], () => this.leftPressed = true, undefined, () => this.leftPressed = false);
      this.key_triggered_button("Yaw Right", ["d"], () => this.rightPressed = true, undefined, () => this.rightPressed = false); this.new_line();
      this.key_triggered_button("Pitch Down", ["ArrowUp"], () => this.upPressed = true, undefined, () => this.upPressed = false);
      this.key_triggered_button("Pitch Up", ["ArrowDown"], () => this.downPressed = true, undefined, () => this.downPressed = false); this.new_line();
      this.key_triggered_button("Roll Left", ["ArrowLeft"], () => this.rollLeftPressed = true, undefined, () => this.rollLeftPressed = false);
      this.key_triggered_button("Roll Right", ["ArrowRight"], () => this.rollRightPressed = true, undefined, () => this.rollRightPressed = false);
    }
    draw_runway(t, graphics_state) {
      let model_transform = Mat4.identity();

      /****************************** */
      /**     Sun and Light           */
      /****************************** */
      // var sunRadius = 5. + Math.sin(2. * Math.PI * t / 5. - Math.PI / 2.);
      var sunRadius = 3;
      // const sun_path_radius = 30;
      // var sun_x = sun_path_radius * Math.cos(t / 1.);
      // var sun_y = sun_path_radius * Math.sin(t / 1.);
      var sun_x = 0;
      var sun_y = 30;
      if (sun_y > 0) {
        var sunColor = Color.of(0.98828125, 0.71875, 0.07421875, 1.);
        // draw the spherical sun
        model_transform = model_transform.times(Mat4.scale([sunRadius, sunRadius, sunRadius]))
          .times(Mat4.translation([sun_x, sun_y, 0]));
        this.shapes.sun.draw(graphics_state, model_transform, this.materials.sun.override({ color: sunColor }));

        // point light source
        this.lights = [new Light(Vec.of(sun_x, sun_y, 0, 1), sunColor, 40 ** sunRadius)];
      }
      else {
        var nightColor = Color.of(0.02734375, 0.1015625, 0.296875, 1.)
        this.lights = [new Light(Vec.of(sun_x, -1 * sun_y, 0, 1), nightColor, 40 ** sunRadius)];
      }

      /****************************** */
      /**         Landscape           */
      /****************************** */
      // 1. white runway  -- start part
      var white_runway = [
        -16, -12, -8, -4, 0, 4, 8, 12, 16
      ];
      for (var j = -27; j < -18; j += 2) {
        for (var i = 0; i < white_runway.length; i++) {
          model_transform = Mat4.identity();
          model_transform = model_transform.times(Mat4.translation([white_runway[i], -9, j]));
          this.shapes.cube.draw(graphics_state, model_transform, this.materials.white);
        }
      }
      var grey_runway = [
        -18, -14, -10, -6, -2, 2, 6, 10, 14, 18
      ];
      for (var j = -27; j < -18; j += 2) {
        for (var i = 0; i < grey_runway.length; i++) {
          model_transform = Mat4.identity();
          model_transform = model_transform.times(Mat4.translation([grey_runway[i], -9, j]));
          this.shapes.cube.draw(graphics_state, model_transform, this.materials.grey);
        }
      }

      // runway  -- middle part
      white_runway = [
        -16, 0, 16
      ];
      for (var j = -301; j < -28; j += 2) {
        for (var i = 0; i < white_runway.length; i++) {
          model_transform = Mat4.identity();
          model_transform = model_transform.times(Mat4.translation([white_runway[i], -9, j]));
          if (white_runway[i] == 0 && j % 24 < -12) {
            this.shapes.cube.draw(graphics_state, model_transform, this.materials.grey);
          }
          else {
            this.shapes.cube.draw(graphics_state, model_transform, this.materials.white);
          }
        }
      }

      grey_runway = [
        -18, -14, -10, -6, -2, 2, 6, 10, 14, 18, -12, -8, -4, 4, 8, 12
      ];
      for (var i = 0; i < grey_runway.length; i++) {
        model_transform = Mat4.identity();
        model_transform = model_transform
          .times(Mat4.translation([grey_runway[i], -9, -165]))
          .times(Mat4.scale([1, 1, 137]))

        this.shapes.cube.draw(graphics_state, model_transform, this.materials.grey);
      }
    }
    update_state( dt, num_bodies = 40 )                                                            
      { this.bodies = [this.shapes ]
        for( let b of this.bodies )
          { var b_inv = Mat4.inverse( b.drawn_location );           // Cache this quantity to save time.

            b.linear_velocity = b.linear_velocity.minus( b.center.times( dt ) );            // Apply a small centripetal force to everything.
            b.material = this.inactive_color;       // Default color: white

            for( let c of this.bodies )                                      // *** Collision process starts here ***
                                                // Pass the two bodies and the collision shape to check_if_colliding():
              if( b.linear_velocity.norm() > 0 && b.check_if_colliding( c, b_inv, this.collider ) )
              { b.material = this.active_color;                          // If we get here, we collided, so turn red.
                b.linear_velocity  = Vec.of( 0,0,0 );                    // Zero out the velocity so they don't inter-penetrate any further.
                b.angular_velocity = 0;
              }
          }
      }
    display(graphics_state) {
      graphics_state.lights = this.lights;        // Use the lights stored in this.lights.
      const t = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000;
      // translate/rotate when corresponding booleans are true
      if (this.forwardPressed) {
        this.acceleration = 0.005;
        this.model_transform = this.model_transform.times(Mat4.translation([0, 0, dt * -10]));
        // -this.acceleration * Math.pow(dt, 2)
        this.camera_matrix = this.model_transform.times(Mat4.translation([0, 40, 50]))
          .times(Mat4.rotation(Math.PI / 6.0, Vec.of(-1, 0, 0)));
        graphics_state.camera_transform = Mat4.inverse(this.camera_matrix);
      }
      // else if (this.backwardPressed) {
      //   this.model_transform = this.model_transform.times(Mat4.translation([0, 0, 0.1]));
      // }
      if (this.leftPressed) {
        // if (Math.asin(this.model_transform[0][0]) >= 0 && Math.asin(this.model_transform[0][0]) <= Math.PI / 2)
        this.model_transform = this.model_transform.times(Mat4.rotation(dt * Math.PI / 4, Vec.of(0, 1, 0)));
        // else
        //   this.model_transform = Mat4.of([0, 0, 1, 0], [0, 1, 0, 0], [-1, 0, 0, 0], [0, 0, 0, 1]);
        // alert(this.model_transform);
        // alert(Math.asin(this.model_transform[0][0])); 
      }
      else if (this.rightPressed) {
        // if (Math.asin(this.model_transform[0][0]) >= 0 && Math.asin(this.model_transform[0][0]) <= Math.PI / 2)
        this.model_transform = this.model_transform.times(Mat4.rotation(dt * Math.PI / 4, Vec.of(0, -1, 0)));
        // else
        //   this.model_transform = Mat4.of([0, 0, -1, 0], [0, 1, 0, 0], [1, 0, 0, 0], [0, 0, 0, 1]);
        // alert(this.model_transform);
      }
      if (this.upPressed) {
        // if (this.model_transform[1][1] >= Math.sqrt(2) / 2 && this.model_transform[1][1] <= 1)
        this.model_transform = this.model_transform.times(Mat4.translation([0, -1, 1]))
          .times(Mat4.rotation(dt * Math.PI / 4, Vec.of(-1, 0, 0)))
          .times(Mat4.translation([0, 1, -1]));
        // else
        //   this.model_transform = Mat4.of([1, 0, 0, 0], [0, Math.sqrt(2) / 2, Math.sqrt(2) / 2, -1],
        //     [0, -Math.sqrt(2) / 2, Math.sqrt(2) / 2, 1 - Math.sqrt(2)], [0, 0, 0, 1]);
        // alert(this.model_transform);
        // graphics_state.camera_transform = Mat4.inverse(this.model_transform.times(Mat4.translation([0, 8, 8]))
        //   .times(Mat4.rotation(Math.PI / 4.0, Vec.of(-1, 0, 0))));
      }
      else if (this.downPressed) {
        // if (this.model_transform[1][1] >= Math.sqrt(2) / 2 && this.model_transform[1][1] <= 1)
        this.model_transform = this.model_transform.times(Mat4.translation([0, -1, 1]))
          .times(Mat4.rotation(dt * Math.PI / 4, Vec.of(1, 0, 0)))
          .times(Mat4.translation([0, 1, -1]));
        // else
        //   this.model_transform = Mat4.identity();
        // graphics_state.camera_transform = Mat4.inverse(this.model_transform.times(Mat4.translation([0, 8, 8]))
        //   .times(Mat4.rotation(Math.PI / 4.0, Vec.of(-1, 0, 0))));
      }
      if (this.rollLeftPressed) {
        this.model_transform = this.model_transform.times(Mat4.rotation(dt * Math.PI / 4, Vec.of(0, 0, 1)));
      }
      else if (this.rollRightPressed) {
        this.model_transform = this.model_transform.times(Mat4.rotation(dt * Math.PI / 4, Vec.of(0, 0, -1)));
      }
      this.shapes.skybox.draw(graphics_state, Mat4.translation([0, 0, 100]).times(Mat4.rotation(Math.PI, Vec.of(0, 1, 0))).times(Mat4.scale([100, 100, 100])), this.materials.back);
      this.shapes.skybox.draw(graphics_state, Mat4.translation([0, -100, 0]).times(Mat4.rotation(Math.PI / 2, Vec.of(1, 0, 0))).times(Mat4.scale([100, 100, 100])), this.materials.bottom);
      this.shapes.skybox.draw(graphics_state, Mat4.translation([0, 0, -100]).times(Mat4.scale([100, 100, 100])), this.materials.front);
      this.shapes.skybox.draw(graphics_state, Mat4.translation([-100, 0, 0]).times(Mat4.rotation(Math.PI / 2, Vec.of(0, 1, 0))).times(Mat4.scale([100, 100, 100])), this.materials.left);
      this.shapes.skybox.draw(graphics_state, Mat4.translation([100, 0, 0]).times(Mat4.rotation(-Math.PI / 2, Vec.of(0, 1, 0))).times(Mat4.scale([100, 100, 100])), this.materials.right);
      this.shapes.skybox.draw(graphics_state, Mat4.translation([0, 100, 0]).times(Mat4.rotation(Math.PI / 2, Vec.of(1, 0, 0))).times(Mat4.scale([100, 100, 100])), this.materials.top);
      this.draw_runway(t, graphics_state);
      this.shapes.box.draw(graphics_state, this.model_transform, this.materials.grey);

      //building
      this.shapes.cube.draw(graphics_state, Mat4.scale([10, 10, 10]), this.materials.building1);
      this.shapes.cube.draw(graphics_state, Mat4.translation([0,20,0]).times(Mat4.scale([10, 10, 10])), this.materials.building1);
      this.shapes.skybox.draw(graphics_state, Mat4.translation([0,30.1,0]).times(Mat4.rotation(Math.PI / 2, Vec.of(1, 0, 0))).times(Mat4.scale([10,10,10])), this.materials.rooftop1);
      // alert(this.model_transform);
      // TODO:  Draw the required boxes. Also update their stored matrices. 
    }
  }
