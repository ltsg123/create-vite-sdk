import { BasicGLInfo, VideoBaseExtension } from "@agora-js/extension";
import { postWorkerMessage } from "./utils";
import videoFrag from "./video.frag.glsl?raw";

// test use glsl
console.log(videoFrag);

export class MockExtension extends VideoBaseExtension {
  public name: string = "MockExtension";

  protected async processByVideoFrame(frame: VideoFrame): Promise<VideoFrame> {
    return postWorkerMessage("process", frame, [frame]);
  }

  protected glResize(
    gl: WebGL2RenderingContext,
    width: number,
    height: number
  ) {
    console.log(gl, width, height);
    return;
  }

  protected async processByGL(
    gl: WebGL2RenderingContext,
    basicGLInfo: BasicGLInfo,
    width: number,
    height: number
  ) {
    console.warn(this.ID, "MockExtension processByGL");
    if (!basicGLInfo) {
      return;
    }
    const {
      grayProgram,
      videoProgram,
      vertexArray,
      vertexBuffer,
      indexBuffer,
    } = basicGLInfo || {};
    const { grayTexture = null } = basicGLInfo.textures || {};
    const { outputFbo = null } = basicGLInfo.fbos || {};

    if (
      !videoProgram ||
      !grayProgram ||
      !vertexArray ||
      !vertexBuffer ||
      !indexBuffer ||
      !grayTexture ||
      !outputFbo
    ) {
      return null;
    }

    draw(
      gl,
      videoProgram,
      null,
      null,
      { video: 0 },
      outputFbo,
      gl.RGBA,
      width,
      height,
      vertexArray,
      vertexBuffer,
      indexBuffer
    );
  }
}

export function draw(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  texture: WebGLTexture | null,
  video: VideoFrame | HTMLVideoElement | HTMLCanvasElement | null,
  uniforms: any,
  fbo: WebGLFramebuffer | null,
  format: number,
  width: number,
  height: number,
  vertexArray: WebGLVertexArrayObject,
  vertexBuffer: WebGLBuffer,
  indexBuffer: WebGLBuffer
) {
  gl.useProgram(program);
  gl.bindVertexArray(vertexArray);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  const posOffset = 0; // x is the first buffer element
  const uvOffset = 3 * 4; // uv comes after [x y z]
  const stride = 3 * 4 + 2 * 4; // xyz + uv, each entry is 4-byte float.
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  let loc = gl.getAttribLocation(program, "clipSpacePos");
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, stride, posOffset);
  gl.enableVertexAttribArray(loc);

  loc = gl.getAttribLocation(program, "uv");
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, stride, uvOffset);
  gl.enableVertexAttribArray(loc);

  for (const name in uniforms) {
    const location = gl.getUniformLocation(program, name);
    if (location) {
      if (name === "kernel" || name === "kernel1" || name === "kernel2") {
        gl.uniform1fv(location, uniforms[name]);
      } else if (name === "bias") {
        gl.uniform1f(location, uniforms[name]);
      } else {
        if (uniforms[name].index !== undefined) {
          gl.uniform1i(location, uniforms[name].index);
          gl.activeTexture(gl.TEXTURE0 + uniforms[name].index);
          gl.bindTexture(gl.TEXTURE_2D, uniforms[name].texture);
        } else {
          gl.uniform1i(location, uniforms[name]);
        }
      }
    }
  }

  if (texture) {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    if (video) {
      // @ts-ignore
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        format,
        width,
        height,
        0,
        format,
        gl.UNSIGNED_BYTE,
        video
      );
    }
  }

  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}
