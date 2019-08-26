window.Test_Data = window.classes.Triangle =
class Test_Data
{ constructor( context )
    { this.textures = { rgb   : context.get_instance( "/assets/rgb.jpg"   ),
                        earth : context.get_instance( "/assets/earth.gif" ),
                        grid  : context.get_instance( "/assets/grid.png"  ),
                        stars : context.get_instance( "/assets/stars.png" ),
                        text  : context.get_instance( "/assets/text.png"  )
                      }
      this.shapes = { donut  : new Torus          ( 15, 15 ),
                      cone   : new Closed_Cone    ( 4, 10 ),
                      capped : new Capped_Cylinder( 4, 12 ),
                      ball   : new Subdivision_Sphere( 3 ),
                      cube   : new Cube(),
                      axis   : new Axis_Arrows(),
                      prism  : new ( Capped_Cylinder   .prototype.make_flat_shaded_version() )( 10, 10 ),
                      gem    : new ( Subdivision_Sphere.prototype.make_flat_shaded_version() )( 2 ),
                      donut  : new ( Torus             .prototype.make_flat_shaded_version() )( 20, 20 ) 
                    }; 
    }
  random_shape( shape_list = this.shapes )
    { const shape_names = Object.keys( shape_list );
      return shape_list[ shape_names[ ~~( shape_names.length * Math.random() ) ] ]
    }
}

window.Body = window.classes.Body =
class Body          // Store and update the properties of a 3D body that increntally moves from its previous place due to velocities.
{ constructor(               shape, material, size, owner = 0 )
    { Object.assign( this, { shape, material, size, owner } ) }
  emplace( location_matrix, linear_velocity, angular_velocity, spin_axis = Vec.of(0,0,0).randomized(1).normalized() )
    { this.center   = location_matrix.times( Vec.of( 0,0,0,1 ) ).to3();
      this.rotation = Mat4.translation( this.center.times( -1 ) ).times( location_matrix );
      this.previous = { center: this.center.copy(), rotation: this.rotation.copy() };
      this.drawn_location = location_matrix;                                      // This gets replaced with an interpolated quantity.
      return Object.assign( this, { linear_velocity, angular_velocity, spin_axis } )
    }
  advance( time_amount )   // Perform forward Euler to advance the linear and angular velocities one time-step.
    { this.previous = { center: this.center.copy(), rotation: this.rotation.copy() };
                                                              // Apply the velocities scaled proportionally to real time (time_amount).
      this.center = this.center.plus( this.linear_velocity.times( time_amount ) );                        // Apply linear velocity.
      this.rotation.pre_multiply( Mat4.rotation( time_amount * this.angular_velocity, this.spin_axis ) ); // Apply angular velocity.
    }
  blend_rotation( alpha )         // We're naively just doing a linear blend of the rotations.  This looks
    {                             // ok sometimes but otherwise produces shear matrices, a wrong result.

                                  // TODO:  Replace this function with proper quaternion blending, and perhaps 
                                  // store this.rotation in quaternion form instead for compactness.
       return this.rotation.map( (x,i) => Vec.from( this.previous.rotation[i] ).mix( x, alpha ) );
    }
  blend_state( alpha )            // Compute the final matrix we'll draw using the previous two physical locations
                                  // the object occupied.  We'll interpolate between these two states as described
                                  // at the end of the "Fix Your Timestep!" article by Glenn Fiedler.
    { this.drawn_location = Mat4.translation( this.previous.center.mix( this.center, alpha ) )
                                      .times( this.blend_rotation( alpha ) )
                                      .times( Mat4.scale( this.size ) );
    }
  check_if_colliding( b, a_inv, shape )   // Collision detection function.
                                          // DISCLAIMER:  The collision method shown below is not used by anyone; it's just very quick 
                                          // to code.  Making every collision body an ellipsoid is kind of a hack, and looping 
                                          // through a list of discrete sphere points to see if the ellipsoids intersect is *really* a 
                                          // hack (there are perfectly good analytic expressions that can test if two ellipsoids 
                                          // intersect without discretizing them into points).
    { if ( this == b ) return false;      // Nothing collides with itself.
      var T = a_inv.times( b.drawn_location );                      // Convert sphere b to the frame where a is a unit sphere.
      for( let p of shape.positions )                               // For each vertex in that b,
        { var Tp = T.times( p.to4(1) ).to3();                       // Shift to the coordinate frame of a_inv*b
          if( Tp.dot( Tp ) < 1.1 )                                  // Check if in that coordinate frame it penetrates the unit sphere
            return true;                                            // at the origin.  Leave .1 of leeway.     
        }
      return false;
    }
}

window.Simulation = window.classes.Simulation =
class Simulation extends Scene_Component                // Simulation manages the stepping of simulation time.  Subclass it when making
{ constructor( context, control_box )                   // a Scene that is a physics demo.  This technique is careful to totally
    { super(   context, control_box );                  // decouple the simulation from the frame rate.
      Object.assign( this, { time_accumulator: 0, time_scale: 1, t: 0, dt: 1/20, bodies: [], steps_taken: 0 } );            
    }
  simulate( frame_time )                              // Carefully advance time according to Glenn Fiedler's "Fix Your Timestep" blog post.
    { frame_time = this.time_scale * frame_time;                   // This line lets us create the illusion to the simulator that 
                                                                   // the display framerate is running fast or slow.
                                                                   // Avoid the spiral of death; limit the amount of time we will spend 
      this.time_accumulator += Math.min( frame_time, 0.1 );        // computing during this timestep if display lags.
      while ( Math.abs( this.time_accumulator ) >= this.dt )       // Repeatedly step the simulation until we're caught up with this frame.
      { this.update_state( this.dt );                              // Single step of the simulation for all bodies.
        for( let b of this.bodies ) b.advance( this.dt );
          
        this.t                += Math.sign( frame_time ) * this.dt;   // Following the advice of the article, de-couple
        this.time_accumulator -= Math.sign( frame_time ) * this.dt;   // our simulation time from our frame rate.
        this.steps_taken++;
      }
      let alpha = this.time_accumulator / this.dt;                 // Store an interpolation factor for how close our frame fell in between
      for( let b of this.bodies ) b.blend_state( alpha );          // the two latest simulation time steps, so we can correctly blend the
    }                                                              // two latest states and display the result.
  make_control_panel()
    { this.key_triggered_button( "Speed up time", [ "Shift","T" ], function() { this.time_scale *= 5 } );
      this.key_triggered_button( "Slow down time",        [ "t" ], function() { this.time_scale /= 5 } );        this.new_line();
      this.live_string( box => { box.textContent = "Time scale: "  + this.time_scale                              } ); this.new_line();
      this.live_string( box => { box.textContent = "Fixed simulation time step size: "  + this.dt                 } ); this.new_line();
      this.live_string( box => { box.textContent = this.steps_taken + " timesteps were taken so far."             } );
    }
  display( graphics_state )
    { if( !graphics_state.lights.length ) graphics_state.lights = [ new Light( Vec.of( 7,15,20,0 ), Color.of( 1,1,1,1 ), 100000 ) ];

      if( this.globals.animate ) 
        this.simulate( graphics_state.animation_delta_time );                 // Advance the time and state of our whole simulation.
      for( let b of this.bodies ) {
        if(b.owner == 1 || b.owner == 2) {
          b.shape.draw( graphics_state, b.drawn_location.times(Mat4.scale([0.1, 0.1, 1])), b.material );
        }
        else if(b.owner != 3 && b.owner != 4){
          b.shape.draw( graphics_state, b.drawn_location, b.material ); 
        }
      }
    }
  display2( graphics_state )
    { if( !graphics_state.lights.length ) graphics_state.lights = [ new Light( Vec.of( 7,15,20,0 ), Color.of( 1,1,1,1 ), 100000 ) ];

      if( this.globals.animate ) 
        this.simulate( graphics_state.animation_delta_time );                 // Advance the time and state of our whole simulation.
      for( let b of this.bodies ) {
        b.shape.draw( graphics_state, b.drawn_location, b.material );   // Draw each shape at its current location.
      }
    }
  update_state( dt ) { throw "Override this" }          // Your subclass of Simulation has to override this abstract function.
}