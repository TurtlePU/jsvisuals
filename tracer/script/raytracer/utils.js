export function constrain(value, min, max) {
    return Math.max(min, Math.min(value, max));
}
