import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";

import "./controls.sass";

function Controls() {
    const BOARD_SIZE = useSelector((state) => state.BOARD_SIZE);

    // Generates random number within range
    let randomNumber = useCallback(() => {
        let num = Math.random() * BOARD_SIZE * BOARD_SIZE;
        return Math.round(num);
    }, [BOARD_SIZE]);

    const [state, setState] = useState({
        direction: "right",
        snake: null,
        interval: null,
        startIndex: Math.round((BOARD_SIZE * BOARD_SIZE) / 2 - 3),
        moveIndex: Math.round((BOARD_SIZE * BOARD_SIZE) / 2 - 3),
        appleIndex: randomNumber(),
        gameOver: false,
        speed: 150,
        highScore: localStorage.getItem("snakeGame_highScore"),
    });

    useEffect(() => {
        function createApple(appleIndex) {
            let cell = document.querySelector(`#cell_${appleIndex}`);
            if (
                cell.classList.contains("snake") ||
                cell.classList.contains("wall")
            ) {
                appleIndex = randomNumber();
                createApple(appleIndex);
            } else {
                cell.classList.add("apple");
            }
        }

        createApple(state.appleIndex);
    }, [state.appleIndex, randomNumber]);

    useEffect(() => {
        class SnakePart {
            constructor(node, next = null) {
                this.node = node;
                this.next = next;
                node.classList.add("snake");
            }
        }

        class Snake {
            constructor(head, body, tail) {
                this.tail = new SnakePart(tail);
                this.body = new SnakePart(body, this.tail);
                this.head = new SnakePart(head, this.body);
                this.score = 0;
                this.head.node.classList.add("head");
            }

            move(data) {
                if (this.score > 250) {
                    setState((state) => {
                        return {
                            ...state,
                            speed: 120,
                        };
                    });
                } else if (this.score > 500) {
                    setState((state) => {
                        return {
                            ...state,
                            speed: 100,
                        };
                    });
                } else if (this.score > 750) {
                    setState((state) => {
                        return {
                            ...state,
                            speed: 50,
                        };
                    });
                }

                if (!data.classList.contains("apple")) {
                    this.deSnake(this.body);
                    let part = this.head;
                    while (true) {
                        if (part.next.next === null) {
                            this.body = part;
                            break;
                        }
                        part = part.next;
                    }
                } else {
                    this.score += 5;
                }

                if (data.classList.contains("snake")) {
                    data.classList.add("wall");
                    setState((state) => {
                        return {
                            ...state,
                            gameOver: true,
                        };
                    });
                }

                this.head.node.classList.remove("head");
                this.head = new SnakePart(data, this.head);
                this.head.node.classList.add("head");
            }

            deSnake(data) {
                data.next.node.classList.remove("snake");
                data.next = null;
                this.tail = data;
            }

            eat(data) {
                this.head = new SnakePart(data, this.head);
            }
        }

        let startHead = document.querySelector(`#cell_${state.startIndex}`);
        let startBody = document.querySelector(`#cell_${state.startIndex - 1}`);
        let startTail = document.querySelector(`#cell_${state.startIndex - 2}`);
        let snake = new Snake(startHead, startBody, startTail);

        setState((state) => {
            return {
                ...state,
                snake: snake,
            };
        });
    }, [state.startIndex]);

    // Handle Game Over
    useEffect(() => {
        function handleGameOver() {
            let head = document.querySelector(".head");
            if (
                head.classList.contains("wall") ||
                (head.classList.contains("snake") &&
                    !head.classList.contains("head"))
            ) {
                clearInterval(state.interval);
            }
        }
        handleGameOver();
    }, [state.interval, state.moveIndex]);

    // Handle swipe and arrow key clicks
    useEffect(() => {
        let up = document.querySelector(".up");
        let down = document.querySelector(".down");
        let left = document.querySelector(".left");
        let right = document.querySelector(".right");

        let touchstartX = 0;
        let touchstartY = 0;
        let touchendX = 0;
        let touchendY = 0;

        function checkDirection() {
            if (
                Math.abs(touchstartX - touchendX) >
                Math.abs(touchendY - touchstartY)
            ) {
                if (touchendX < touchstartX) left.click();
                if (touchendX > touchstartX) right.click();
                return;
            }
            if (touchendY < touchstartY) up.click();
            if (touchendY > touchstartY) down.click();
        }

        document.addEventListener("touchstart", (e) => {
            touchstartX = e.changedTouches[0].screenX;
            touchstartY = e.changedTouches[0].screenY;
        });

        document.addEventListener("touchend", (e) => {
            touchendX = e.changedTouches[0].screenX;
            touchendY = e.changedTouches[0].screenY;
            checkDirection();
        });

        document.addEventListener("keydown", (e) => {
            console.log("event called", e);
            switch (e.keyCode) {
                case 37:
                    left.click();
                    break;
                case 38:
                    up.click();
                    break;
                case 39:
                    right.click();
                    break;
                case 40:
                    down.click();
                    break;
                default:
                    break;
            }
        });
    }, []);

    // What the snake does on a new box, it either grows or moves
    function react(moveIndex, num, direction) {
        let nextIndex = moveIndex + num;
        let nextNode = document.querySelector(`#cell_${nextIndex}`);

        if (nextNode.classList.contains("wall")) {
            if (state.snake.score > state.highScore)
                localStorage.setItem("snakeGame_highScore", state.snake.score);
            setState((state) => {
                return {
                    ...state,
                    gameOver: true,
                };
            });
        }

        state.snake.move(nextNode);
        if (nextNode.classList.contains("apple")) {
            nextNode.classList.remove("apple");
            setState((state) => {
                return {
                    ...state,
                    appleIndex: randomNumber(),
                };
            });
        }

        setState((state) => {
            return {
                ...state,
                moveIndex: nextIndex,
                direction: direction,
            };
        });
    }

    return (
        <>
            <div className="score">
                <span>
                    <span className="header">Score:</span> {state.snake?.score}
                </span>
                <span>
                    <span className="header">High Score:</span>{" "}
                    {state.highScore || 0}
                </span>
            </div>
            <div
                style={{ display: `${state.gameOver ? "block" : "none"}` }}
                className="gameOver"
            >
                <span className="header">Game Over</span>{" "}
                <span>
                    {state.snake?.score > state.highScore
                        ? `You got a new High Score ${state.snake?.score}`
                        : `You scored ${state.snake?.score}`}
                </span>{" "}
                <span>Do you want to play again?</span>
                <button
                    onClick={() => {
                        window.location.reload();
                    }}
                >
                    Yes
                </button>
                <button
                    onClick={() => {
                        setState({
                            ...state,
                            gameOver: false,
                        });
                    }}
                >
                    No
                </button>
            </div>
            <div style={{ display: "none" }} className="controls">
                <span
                    className="left"
                    onClick={() => {
                        if (state.direction !== "right") {
                            clearInterval(state.interval);
                            let myInterval = setInterval(() => {
                                setState((state) => {
                                    if (state.gameOver)
                                        clearInterval(state.myInterval);
                                    react(state.moveIndex, -1, "left");
                                    return {
                                        ...state,
                                        moveIndex: state.moveIndex - 1,
                                    };
                                });
                            }, state.speed);

                            setState({
                                ...state,
                                interval: myInterval,
                            });
                        }
                    }}
                >
                    Left
                </span>
                <span
                    className="up"
                    onClick={() => {
                        if (state.direction !== "down") {
                            clearInterval(state.interval);
                            let myInterval = setInterval(() => {
                                setState((state) => {
                                    if (state.gameOver)
                                        clearInterval(state.myInterval);
                                    react(
                                        state.moveIndex,
                                        -1 * BOARD_SIZE,
                                        "up"
                                    );
                                    return {
                                        ...state,
                                        moveIndex: state.moveIndex - 1,
                                    };
                                });
                            }, state.speed);

                            setState({
                                ...state,
                                interval: myInterval,
                            });
                        }
                    }}
                >
                    Up
                </span>
                <span
                    className="right"
                    onClick={() => {
                        if (state.direction !== "left") {
                            clearInterval(state.interval);
                            let myInterval = setInterval(() => {
                                setState((state) => {
                                    if (state.gameOver)
                                        clearInterval(state.myInterval);
                                    react(state.moveIndex, 1, "right");
                                    return {
                                        ...state,
                                        moveIndex: state.moveIndex - 1,
                                    };
                                });
                            }, state.speed);

                            setState({
                                ...state,
                                interval: myInterval,
                            });
                        }
                    }}
                >
                    Right
                </span>
                <span
                    className="down"
                    onClick={() => {
                        if (state.direction !== "up") {
                            clearInterval(state.interval);
                            let myInterval = setInterval(() => {
                                setState((state) => {
                                    if (state.gameOver)
                                        clearInterval(state.myInterval);
                                    react(state.moveIndex, BOARD_SIZE, "down");
                                    return {
                                        ...state,
                                        moveIndex: state.moveIndex - 1,
                                    };
                                });
                            }, state.speed);

                            setState({
                                ...state,
                                interval: myInterval,
                            });
                        }
                    }}
                >
                    Down
                </span>
            </div>
        </>
    );
}

export default Controls;
