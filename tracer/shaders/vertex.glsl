#version 300 es

in vec2 a_vertex_position;
in vec3 a_plot_position;

out vec3 v_position;

void main() {
    gl_Position = vec4(a_vertex_position, 1, 1);
    v_position = a_plot_position;
}
