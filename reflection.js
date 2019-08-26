
window.Reflection_Shader = window.classes.Reflection_Shader =
class Reflection_Shader extends Shader      
{
    material(color, properties)     // Define an internal class "Material" that stores the standard settings found in Phong lighting.
    {
      return new class Material       // Possible properties: ambient, diffusivity, specularity, smoothness, gouraud, texture.
      {
          constructor(shader, color = Color.of(0, 0, 0, 1), ambient = 0, diffusivity = 1, specularity = 1, smoothness = 40) {
            Object.assign(this, { shader, color, ambient, diffusivity, specularity, smoothness });  // Assign defaults.
            Object.assign(this, properties);                                                        // Optionally override defaults.
          }
        override(properties)                      // Easily make temporary overridden versions of a base material, such as
        {
          const copied = new this.constructor();  // of a different color or diffusivity.  Use "opacity" to override only that.
          Object.assign(copied, this);
          Object.assign(copied, properties);
          copied.color = copied.color.copy();
          if (properties["opacity"] != undefined) copied.color[3] = properties["opacity"];
          return copied;
        }
      }(this, color);
    }
  map_attribute_name_to_buffer_name(name)                  // We'll pull single entries out per vertex by field name.  Map
  {                                                        // those names onto the vertex array names we'll pull them from.
    return { object_space_pos: "positions", normal: "normals", tex_coord: "texture_coords" }[name];
  }   // Use a simple lookup table.
  shared_glsl_code()            // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
  {
    return `precision mediump float;
      const int N_LIGHTS = 2;             // We're limited to only so many inputs in hardware.  Lights are costly (lots of sub-values).
      uniform float ambient, diffusivity, specularity, smoothness, animation_time, attenuation_factor[N_LIGHTS];
      uniform bool GOURAUD, COLOR_NORMALS, USE_TEXTURE;               // Flags for alternate shading methods
      uniform vec4 lightPosition[N_LIGHTS], lightColor[N_LIGHTS], shapeColor;
      varying vec3 N, E;                    // Specifier "varying" means a variable's final value will be passed from the vertex shader 
      varying vec2 f_tex_coord;             // on to the next phase (fragment shader), then interpolated per-fragment, weighted by the 
      varying vec4 VERTEX_COLOR;            // pixel fragment's proximity to each of the 3 vertices (barycentric interpolation).
      varying vec3 L[N_LIGHTS], H[N_LIGHTS];
      varying float dist[N_LIGHTS];
      varying vec3 reflection;
      
      vec3 phong_model_lights( vec3 N )
        { vec3 result = vec3(0.0);
          for(int i = 0; i < N_LIGHTS; i++)
            {
              float attenuation_multiplier = 1.0 / (1.0 + attenuation_factor[i] * (dist[i] * dist[i]));
              float diffuse  =      max( dot(N, L[i]), 0.0 );
              float specular = pow( max( dot(N, H[i]), 0.0 ), smoothness );

              result += attenuation_multiplier * ( shapeColor.xyz * diffusivity * diffuse + lightColor[i].xyz * specularity * specular );
            }
          return result;
        }
      `;
  }
  vertex_glsl_code()           // ********* VERTEX SHADER *********
  {
    return `
    attribute vec3 object_space_pos, normal;
    attribute vec2 tex_coord;

    uniform mat4 camera_transform, camera_model_transform, projection_camera_model_transform;
    uniform mat3 inverse_transpose_modelview;

    // for reflection
    attribute vec4 vPosition;
    uniform mat4 ModelView;
    uniform mat4 Projection;

      void main()
      { 
        gl_Position = projection_camera_model_transform * vec4(object_space_pos, 1.0);    

        vec3 eyePos = object_space_pos;
        reflection = reflect( eyePos, normalize( (camera_model_transform * vec4(normal, 1.0))).xyz) ;

        
        N = normalize( inverse_transpose_modelview * normal );                             // The final normal vector in screen space.
        f_tex_coord = tex_coord;                                         // Directly use original texture coords and interpolate between.
        
        if( COLOR_NORMALS )                                     // Bypass all lighting code if we're lighting up vertices some other way.
        { VERTEX_COLOR = vec4( N[0] > 0.0 ? N[0] : sin( animation_time * 3.0   ) * -N[0],             // In "normals" mode, 
                               N[1] > 0.0 ? N[1] : sin( animation_time * 15.0  ) * -N[1],             // rgb color = xyz quantity.
                               N[2] > 0.0 ? N[2] : sin( animation_time * 45.0  ) * -N[2] , 1.0 );     // Flash if it's negative.
          return;
        }
                                                // The rest of this shader calculates some quantities that the Fragment shader will need:
        vec3 screen_space_pos = ( camera_model_transform * vec4(object_space_pos, 1.0) ).xyz;
        E = normalize( -screen_space_pos );

        for( int i = 0; i < N_LIGHTS; i++ )
        {            // Light positions use homogeneous coords.  Use w = 0 for a directional light source -- a vector instead of a point.
          L[i] = normalize( ( camera_transform * lightPosition[i] ).xyz - lightPosition[i].w * screen_space_pos );
          H[i] = normalize( L[i] + E );
          
          // Is it a point light source?  Calculate the distance to it from the object.  Otherwise use some arbitrary distance.
          dist[i]  = lightPosition[i].w > 0.0 ? distance((camera_transform * lightPosition[i]).xyz, screen_space_pos)
                                              : distance( attenuation_factor[i] * -lightPosition[i].xyz, object_space_pos.xyz );
        }

        if( GOURAUD )                   // Gouraud shading mode?  If so, finalize the whole color calculation here in the vertex shader, 
        {                               // one per vertex, before we even break it down to pixels in the fragment shader.   As opposed 
                                        // to Smooth "Phong" Shading, where we *do* wait to calculate final color until the next shader.
          VERTEX_COLOR      = vec4( shapeColor.xyz * ambient, shapeColor.w);
          VERTEX_COLOR.xyz += phong_model_lights( N );
        }
      }
      `;
  }
  fragment_glsl_code()           // ********* FRAGMENT SHADER ********* 
  {                            // A fragment is a pixel that's overlapped by the current triangle.
    // Fragments affect the final image or get discarded due to depth.
    return `
    //   uniform sampler2D texture;
      uniform samplerCube cubeMap; 
      void main()
      { 
        // vec4 tex_color = texture2D( texture, f_tex_coord );                         
        // gl_FragColor = vec4( ( tex_color.xyz  ) * ambient, 1. ); 
        
        gl_FragColor = vec4(textureCube( cubeMap,  reflection).xyz, 1.0);

        gl_FragColor.xyz += phong_model_lights( N );                     // Compute the final color with contributions from lights.

        
        // float a = animation_time, u = f_tex_coord.x, v = f_tex_coord.y;   
        // gl_FragColor += vec4(                                  
        //     0. , 0.,
        //     0.1 * (.5 * u * sin(19.0 * u ) + .5 * v * sin(13.0 * v ) + .3 * sin(15.0 * a)),
        //     0.2 *(.5 * u * sin(20.0 * u ) + .6 * v * sin(14.0 * v ) + .4 * sin(16.0 * a))
        //     );
        // gl_FragColor += vec4(0.82421875,0.82421875,0.82421875,0);
    
    }`;
  }
  // Define how to synchronize our JavaScript's variables to the GPU's:
  update_GPU(g_state, model_transform, material, gpu = this.g_addrs, gl = this.gl) {                              // First, send the matrices to the GPU, additionally cache-ing some products of them we know we'll need:
    this.update_matrices(g_state, model_transform, gpu, gl);
    gl.uniform1f(gpu.animation_time_loc, g_state.animation_time / 1000);

    if (g_state.gouraud === undefined) { g_state.gouraud = g_state.color_normals = false; }    // Keep the flags seen by the shader 
    gl.uniform1i(gpu.GOURAUD_loc, g_state.gouraud || material.gouraud);                // program up-to-date and make sure 
    gl.uniform1i(gpu.COLOR_NORMALS_loc, g_state.color_normals);                              // they are declared.

    gl.uniform4fv(gpu.shapeColor_loc, material.color);    // Send the desired shape-wide material qualities 
    gl.uniform1f(gpu.ambient_loc, material.ambient);    // to the graphics card, where they will tweak the
    gl.uniform1f(gpu.diffusivity_loc, material.diffusivity);    // Phong lighting formula.
    gl.uniform1f(gpu.specularity_loc, material.specularity);
    gl.uniform1f(gpu.smoothness_loc, material.smoothness);

    // if (material.texture)                           // NOTE: To signal not to draw a texture, omit the texture parameter from Materials.
    // {
        gpu.shader_attributes["tex_coord"].enabled = true;
        var texture;

        var faces = [
            gl.TEXTURE_CUBE_MAP_POSITIVE_X,
            gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
            gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
            gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
            gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
            gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
        ];
        
        var images = [
            "assets/right.bmp",
            "assets/left.bmp",
            "assets/front.bmp",
            "assets/back.bmp",
            "assets/top.bmp",
            "assets/bottom.bmp",
        ]

        var image_arr = [];
        for (var i = 0; i < 6; i++) {
            var image = new Image();
            image.src = images[i];
            image_arr.push(image);
        }

        var cubemapTexture = gl.createTexture();
        cubemapTexture.image = new Image();
        cubemapTexture.image.onload = function() {
            texture = cubemapTexture;
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA,
            gl.UNSIGNED_BYTE, image_arr[0]); // again, different image each face
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA,
            gl.UNSIGNED_BYTE, image_arr[1]);
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, gl.RGBA,
            gl.UNSIGNED_BYTE, cubemapTexture.image);
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA,
            gl.UNSIGNED_BYTE, image_arr[5]);
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA,
            gl.UNSIGNED_BYTE, image_arr[2]);
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA,
            gl.UNSIGNED_BYTE, image_arr[3]); 
                
        }
        cubemapTexture.image.src = "assets/top.bmp"; 
 

        // gl.activeTexture(gl.TEXTURE30000); // set texture unit 1 to use
        // gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemapTexture); 
        // gl.uniform1i(gpu.cubeMap_loc, 30000); 

    // }
    // else { gl.uniform1f(gpu.USE_TEXTURE_loc, 0); gpu.shader_attributes["tex_coord"].enabled = false; }

    if (!g_state.lights.length) return;
    var lightPositions_flattened = [], lightColors_flattened = [], lightAttenuations_flattened = [];
    for (var i = 0; i < 4 * g_state.lights.length; i++) {
      lightPositions_flattened.push(g_state.lights[Math.floor(i / 4)].position[i % 4]);
      lightColors_flattened.push(g_state.lights[Math.floor(i / 4)].color[i % 4]);
      lightAttenuations_flattened[Math.floor(i / 4)] = g_state.lights[Math.floor(i / 4)].attenuation;
    }
    gl.uniform4fv(gpu.lightPosition_loc, lightPositions_flattened);
    gl.uniform4fv(gpu.lightColor_loc, lightColors_flattened);
    gl.uniform1fv(gpu.attenuation_factor_loc, lightAttenuations_flattened);
  }
  update_matrices(g_state, model_transform, gpu, gl)                                    // Helper function for sending matrices to GPU.
  {                                                   // (PCM will mean Projection * Camera * Model)
    let [P, C, M] = [g_state.projection_transform, g_state.camera_transform, model_transform],
      PM = P.times(M),
      CM = C.times(M),
      PCM = P.times(CM),
      inv_CM = Mat4.inverse(CM).sub_block([0, 0], [3, 3]);
    // Send the current matrices to the shader.  Go ahead and pre-compute
    // the products we'll need of the of the three special matrices and just
    // cache and send those.  They will be the same throughout this draw
    // call, and thus across each instance of the vertex shader.
    // Transpose them since the GPU expects matrices as column-major arrays.  
    gl.uniformMatrix4fv(gpu.projection_model_transform_loc, false, Mat.flatten_2D_to_1D(PM.transposed()));
    gl.uniformMatrix4fv(gpu.camera_transform_loc, false, Mat.flatten_2D_to_1D(C.transposed()));
    gl.uniformMatrix4fv(gpu.camera_model_transform_loc, false, Mat.flatten_2D_to_1D(CM.transposed()));
    gl.uniformMatrix4fv(gpu.projection_camera_model_transform_loc, false, Mat.flatten_2D_to_1D(PCM.transposed()));
    gl.uniformMatrix3fv(gpu.inverse_transpose_modelview_loc, false, Mat.flatten_2D_to_1D(inv_CM.transposed()));
    // gl.uniformMatrix3fv(gpu.modelview_loc, false, Mat.flatten_2D_to_1D(CM));

    gl.uniformMatrix4fv(gpu.Projection_loc, false, Mat.flatten_2D_to_1D(P.transposed()));
    gl.uniformMatrix4fv(gpu.ModelView_loc, false, Mat.flatten_2D_to_1D(CM.transposed()));
    gl.uniform4fv(gpu.vPosition_loc, Mat4.inverse( C ).times( Vec.of( 0,0,0,1 ) ));
  }
}

















