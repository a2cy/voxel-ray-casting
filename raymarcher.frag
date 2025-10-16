#version 150

uniform mat4 p3d_ViewMatrixInverse;

uniform sampler2D u_grass_texture;
uniform sampler2D u_brick_texture;

in vec3 fragcoord;

out vec4 p3d_FragColor;

const float MAX_DIST = 128.0;


vec3 traverse(vec3 position, vec3 direction) {
    vec3 current_position = roundEven(position);
    float hit_normal;
    float current_distance = 0.0;

    float step_x = (direction.x >= 0) ? 1.0 : -1.0;
    float step_y = (direction.y >= 0) ? 1.0 : -1.0;
    float step_z = (direction.z >= 0) ? 1.0 : -1.0;

    float delta_x = (direction.x == 0) ? 10.0 : 1.0 / direction.x * step_x;
    float delta_y = (direction.y == 0) ? 10.0 : 1.0 / direction.y * step_y;
    float delta_z = (direction.z == 0) ? 10.0 : 1.0 / direction.z * step_z;

    float x_distance = delta_x * (0.5 - (position.x - current_position.x) * step_x);
    float y_distance = delta_y * (0.5 - (position.y - current_position.y) * step_y);
    float z_distance = delta_z * (0.5 - (position.z - current_position.z) * step_z);

    while (current_distance < MAX_DIST) {
        if (x_distance < y_distance && x_distance < z_distance) {
            current_distance = x_distance;
            x_distance += delta_x;
            current_position.x += step_x;
            hit_normal = 0.0;
        }

        else if (y_distance < x_distance && y_distance < z_distance) {
            current_distance = y_distance;
            y_distance += delta_y;
            current_position.y += step_y;
            hit_normal = 1.0;
        }

        else {
            current_distance = z_distance;
            z_distance += delta_z;
            current_position.z += step_z;
            hit_normal = 2.0;
        }

        if (current_position.y > 1.0 && direction.y > 0) {
            return vec3(0.0);
        }

        if (current_position.y < 0.0) {
            return vec3(current_distance, hit_normal, 1.0);
        }

        if (current_position == vec3(0.0, 1.0, 0.0)) {
            return vec3(current_distance, hit_normal, 2.0);
        }
    }
    return vec3(0.0);
}


vec4 triplanar(vec3 point, float normal, sampler2D texture_map) {
    vec2 sample = vec2(0.0);

    if (normal == 0.0) {
        sample = point.zy;
    }

    if (normal == 1.0) {
        sample = point.xz;
    }

    if (normal == 2.0) {
        sample = point.xy;
    }

    return texture(texture_map, sample);
}


void main() {
    vec4 color = vec4(0.0, 0.0, 0.0, 0.0);

    vec3 camera_position = p3d_ViewMatrixInverse[3].xyz / p3d_ViewMatrixInverse[3].w;

    vec3 ray_direction = normalize(fragcoord - camera_position);

    vec3 ray_hit = traverse(camera_position, ray_direction);

    if (ray_hit.z == 1.0) {
        vec3 point = camera_position + ray_hit.x * ray_direction;
        color = triplanar(point, ray_hit.y, u_grass_texture);
    }

    else if (ray_hit.z == 2.0) {
        vec3 point = camera_position + ray_hit.x * ray_direction;
        color = triplanar(point, ray_hit.y, u_brick_texture);
    }

    p3d_FragColor = color.rgba;
}
