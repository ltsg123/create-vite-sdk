#version 300 es
precision mediump float;

uniform sampler2D video;

in highp vec2 resultUV;
out vec4 out_color;

void main() {
  out_color = texture(video, resultUV);
}