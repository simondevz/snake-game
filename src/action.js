export function updateScore(payload) {
    return {
        type: "score",
        payload: payload,
    };
}

export function updateLevel(payload) {
    return {
        type: "level",
        payload: payload,
    };
}
