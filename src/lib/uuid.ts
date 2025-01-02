let last_uuid = Number.MIN_SAFE_INTEGER
const uuid_map = new WeakMap<object, number>()
export default function getUUID(x: object) {
    if (!uuid_map.has(x)) {
        uuid_map.set(x, last_uuid++)
    }
    const uuid = uuid_map.get(x)!
    return uuid.toString(16)
}
