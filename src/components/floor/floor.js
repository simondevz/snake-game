import { useSelector } from "react-redux";
import "./floor.sass";

function Floor() {
    // Make a two dimentional array to represent
    //cells on the board
    const BOARD_SIZE = useSelector((state) => state.BOARD_SIZE);
    let floor = new Array(BOARD_SIZE).fill(new Array(BOARD_SIZE).fill(0));

    function Cell({ id }) {
        function createWall(id) {
            if (id < BOARD_SIZE) return true;
            if (id % BOARD_SIZE === 0) return true;
            if (id % BOARD_SIZE === BOARD_SIZE - 1) return true;
            if (id > BOARD_SIZE * BOARD_SIZE - BOARD_SIZE) return true;
            return false;
        }
        return (
            <div
                key={id}
                data-id={id}
                id={`cell_${id}`}
                className={`cell ${createWall(id) ? "wall" : null}`}
            />
        );
    }

    return (
        <div className="floor">
            {floor.map((row, row_index) => {
                return (
                    <div key={row_index} className="row">
                        {row.map((cell, cell_index) => {
                            let key = BOARD_SIZE * row_index + cell_index;
                            return <Cell key={key} id={key} />;
                        })}
                    </div>
                );
            })}
        </div>
    );
}

export default Floor;
